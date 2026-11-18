import { isPreferenceOffered } from '../../../core/Design/schema/preferences';
import type { SarakDesignToken, SarakTokenValue } from '../../../core/Design/types';
import type { SarakUserPreferences } from '../../../core/Provider/preferencesTypes';

type DraftRecord = Record<string, SarakTokenValue | undefined>;

/** Qual preferência do usuário sobrepõe cada token do tema, e o id com que o tema a oferece (`isPreferenceOffered`). */
interface PreferenceBinding {
    preference: keyof SarakUserPreferences;
    offered?: Parameters<typeof isPreferenceOffered>[1];
}

const PREFERENCE_BY_TOKEN: Readonly<Record<string, PreferenceBinding>> = {
    navigationStyle: { preference: 'navigationStyle', offered: 'navigationStyle' },
    bodySize: { preference: 'fontSize', offered: 'fontSize' },
    mode: { preference: 'colorMode', offered: 'colorMode' },
    isNavHidden: { preference: 'navCollapsed', offered: 'navCollapsed' },
    sidebarWidth: { preference: 'sidebarWidth' },
};

export interface PersonalOverride {
    preference: keyof SarakUserPreferences;
    value: NonNullable<SarakUserPreferences[keyof SarakUserPreferences]>;
}

/**
 * A preferência pessoal que está por cima do token, ou `undefined`. Segue a régua de `overlayPreferences`: só vale a que o tema
 * oferece (`preference*Position` fora de `off`) e, na largura, só com a lateral redimensionável — preferência gravada que o
 * tema não oferece não vence nada, então não há o que avisar.
 */
export const personalOverrideOf = (
    tokenId: string,
    preferences: SarakUserPreferences | undefined,
    draft: DraftRecord,
): PersonalOverride | undefined => {
    const binding = PREFERENCE_BY_TOKEN[tokenId];
    const value = binding ? preferences?.[binding.preference] : undefined;
    if (!binding || value === undefined) return undefined;
    const applies = binding.offered ? isPreferenceOffered(draft, binding.offered) : draft.sidebarResizable === true;
    return applies ? { preference: binding.preference, value } : undefined;
};

export type BarOrientation = 'sidebar' | 'topbar';

const TOPBAR_ONLY = /^(topbar|navbarLayout$)/;
const SIDEBAR_ONLY = /^(sidebar|shellBrand)/;

/** A orientação exclusiva do token (só dos que declaram depender de `navigationStyle`), ou `undefined` se vale nas duas. */
export const orientationOf = (token: Pick<SarakDesignToken, 'id' | 'interactsWith'>): BarOrientation | undefined => {
    if (!token.interactsWith?.includes('navigationStyle')) return undefined;
    if (TOPBAR_ONLY.test(token.id)) return 'topbar';
    return SIDEBAR_ONLY.test(token.id) ? 'sidebar' : undefined;
};

/** A orientação que o token exige quando o tema usa a OUTRA (o controle não vale agora), ou `undefined` se ele vale. */
export const requiredOrientationIfInactive = (
    token: Pick<SarakDesignToken, 'id' | 'interactsWith'>,
    draft: DraftRecord,
): BarOrientation | undefined => {
    const wanted = orientationOf(token);
    const current: BarOrientation = draft.navigationStyle === 'topbar' ? 'topbar' : 'sidebar';
    return wanted && wanted !== current ? wanted : undefined;
};

export interface WidthRange {
    min: number;
    max: number;
}

const DEVICE_KEY: Readonly<Record<string, 'mob' | 'tab' | 'desk'>> = { smartphone: 'mob', tablet: 'tab' };

const numberAt = (value: SarakTokenValue | undefined, device: 'mob' | 'tab' | 'desk'): number | undefined => {
    const picked = value !== null && typeof value === 'object' ? (value as Record<string, unknown>)[device] : value;
    return typeof picked === 'number' && Number.isFinite(picked) ? picked : undefined;
};

/**
 * O intervalo em que a largura da lateral vale: o do próprio token cruzado com o piso e o teto que o design declara
 * (`sidebarMinWidth`/`sidebarMaxWidth`, um valor por dispositivo). Fora dele a largura é cortada em silêncio, então o campo
 * já nasce com esse intervalo.
 */
export const sidebarWidthRange = (token: SarakDesignToken, draft: DraftRecord, previewDevice: string): WidthRange => {
    const device = DEVICE_KEY[previewDevice] ?? 'desk';
    const own = token.constraints ?? {};
    const floor = Math.max(own.min ?? 0, numberAt(draft.sidebarMinWidth, device) ?? 0);
    const ceiling = Math.min(own.max ?? Number.POSITIVE_INFINITY, numberAt(draft.sidebarMaxWidth, device) ?? Number.POSITIVE_INFINITY);
    return { min: floor, max: Math.max(floor, ceiling) };
};

/** O token com o intervalo que de fato vale (hoje só a largura da lateral tem intervalo vindo de outros tokens). */
export const withEffectiveBounds = (token: SarakDesignToken, draft: DraftRecord, previewDevice: string): { token: SarakDesignToken; range?: WidthRange } => {
    if (token.id !== 'sidebarWidth') return { token };
    const range = sidebarWidthRange(token, draft, previewDevice);
    return { token: { ...token, constraints: { ...token.constraints, min: range.min, max: range.max } }, range };
};
