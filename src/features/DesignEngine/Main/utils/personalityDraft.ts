import { PERSONALITIES, type Personality } from '../../../../core/Design/presets/components/personalities';
import { resolveThemeForMode } from '../../../../core/Design/presets/themes/color-engine';
import { composeThemeDesign } from '../../../../core/Design/presets/themes/compose';
import type { SarakThemePreset } from '../../../../core/Design/presets/themes';
import type { SarakTokenValue } from '../../../../core/Design/types';

type DesignRecord = Readonly<Record<string, unknown>>;

const sameValue = (a: unknown, b: unknown): boolean => a === b || JSON.stringify(a) === JSON.stringify(b);

/** A Personalidade que o rascunho mostra inteira (todos os tokens dela com o valor dela), se houver. */
export const findAppliedPersonality = (draft: DesignRecord): Personality | undefined =>
    PERSONALITIES.find((personality) => Object.entries(personality.design).every(([id, value]) => sameValue(draft[id], value)));

/**
 * O que o rascunho teria sem nenhum ajuste de estrutura à mão: o design aplicado, o tema escolhido na galeria (ainda
 * rascunho) e a Personalidade que já está nele. O que sobrar de diferente, nos tokens da nova Personalidade, é ajuste manual.
 */
export const buildStructureReference = (
    appliedDesign: DesignRecord | undefined,
    themeDesign: DesignRecord | undefined,
    previous: Personality | undefined,
): DesignRecord => ({ ...appliedDesign, ...themeDesign, ...previous?.design });

/** Os tokens da Personalidade em que o rascunho foge da referência: o usuário os ajustou à mão. */
export const findStructureAdjustments = (draft: DesignRecord, reference: DesignRecord, personality: Personality): string[] =>
    Object.keys(personality.design).filter((tokenId) => draft[tokenId] !== undefined && !sameValue(draft[tokenId], reference[tokenId]));

/** O design completo do tema escolhido na galeria e ainda não aplicado, no modo do rascunho. */
export const resolvePendingThemeDesign = (
    theme: SarakThemePreset | undefined,
    mode: 'light' | 'dark',
    draft: DesignRecord,
    hostConfig?: DesignRecord,
): DesignRecord | undefined => {
    if (!theme) return undefined;
    const resolved = resolveThemeForMode({ design: theme.design as Record<string, SarakTokenValue>, contraparte: theme.contraparte }, mode);
    return composeThemeDesign(resolved as Record<string, unknown>, draft, hostConfig) as unknown as DesignRecord;
};

/** O que a escolha grava: o design da Personalidade, sem os tokens que o usuário decidiu manter. */
export const personalityPatch = (personality: Personality, keptTokenIds: readonly string[] = []): Personality['design'] => {
    const kept = new Set(keptTokenIds);
    return Object.fromEntries(Object.entries(personality.design).filter(([tokenId]) => !kept.has(tokenId))) as Personality['design'];
};
