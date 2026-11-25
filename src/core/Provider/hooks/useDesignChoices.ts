import { useCallback, useEffect, useRef, type MutableRefObject } from 'react';
import { validateDesign } from '../utils/validation';
import {
    SARAK_DESIGN_FORMAT_CHOICES, extractDesignChoices, findThemeEntry, normalizeLegacyDesign, recomposeDesignChoices,
} from '../utils/designChoices';
import { readCachedDesignChoices } from '../utils/resolveStorageKey';
import type { SarakDesignState, SarakThemeEntry, SarakThemePayload, SarakUIOptions, SetDesign } from '../types';
import type { SarakDesignFormat } from '../designFormatTypes';

type DesignRecord = Record<string, unknown>;

/** Um design gravado como chegou: o dicionário, o marcador de formato (ausente no dado antigo) e o id do tema. */
export interface SavedDesign {
    design: DesignRecord;
    format?: number;
    themeId?: string;
}

/** O que vai para `onSave` e para o cache: as escolhas com o marcador, ou o design inteiro quando o tema não está em memória. */
export interface PersistedDesign {
    design: DesignRecord;
    format?: SarakDesignFormat;
}

type PersistenceOnSave = NonNullable<NonNullable<SarakUIOptions['persistence']>['onSave']>;

/** Entrega o gravado a `onSave`: o marcador vai como 3º argumento só quando há, e quem declara `onSave(design, id)` recebe dois. */
export const deliverToOnSave = (onSave: PersistenceOnSave, persisted: PersistedDesign, themeId: string | undefined) => (
    persisted.format === undefined
        ? onSave(persisted.design as SarakThemePayload, themeId)
        : onSave(persisted.design as SarakThemePayload, themeId, persisted.format)
);

/** O design do cache local: o registro de escolhas quando acompanha o completo gravado, senão o completo (dado antigo). */
export const readCachedSavedDesign = (storageKey: string, themeId: string | undefined): (SavedDesign & { full: DesignRecord }) | undefined => {
    const serialized = localStorage.getItem(storageKey);
    if (!serialized) return undefined;
    const full = JSON.parse(serialized) as DesignRecord;
    const choices = readCachedDesignChoices(storageKey, serialized);
    return choices ? { design: choices.design, format: choices.format, themeId, full } : { design: full, themeId, full };
};

/**
 * Restaura um design gravado sobre `previous`. Com o marcador de formato, o design é refeito pelas escolhas e substitui o
 * que havia; sem ele, o gravado funde por cima, como sempre, e passa pela regra L1. Sem o tema em memória, funde como
 * sempre e `restored` é `false`: a correção espera o tema chegar.
 */
export const restoreSavedDesign = (
    previous: SarakDesignState,
    saved: SavedDesign,
    allThemes: SarakThemeEntry[] | undefined,
    hostConfig: DesignRecord | undefined,
): { design: SarakDesignState; restored: boolean } => {
    const theme = findThemeEntry(allThemes, saved.themeId);
    const merged = { ...previous, ...saved.design } as DesignRecord;
    if (!theme) return { design: validateDesign(merged), restored: false };
    const design = saved.format === SARAK_DESIGN_FORMAT_CHOICES
        ? recomposeDesignChoices(saved.design, theme, hostConfig)
        : normalizeLegacyDesign(merged, theme, hostConfig);
    return { design: validateDesign(design), restored: true };
};

/**
 * O formato de escolhas no Provider: `restore` lê um gravado (cache ou `onLoad`) e guarda o que ficou pendente do tema;
 * `toPersisted` monta o que a lib grava. A hidratação continua sem gravar: nada aqui chama `onSave`.
 */
export const useDesignChoices = (
    allThemes: SarakThemeEntry[] | undefined,
    configRef: MutableRefObject<SarakThemePayload>,
    configIsSavedDesign = false,
) => {
    const allThemesRef = useRef(allThemes);
    allThemesRef.current = allThemes;
    const pendingRef = useRef<SavedDesign | null>(null);
    // O `config` que é o design gravado do usuário não é referência do host: sem ele, o baseline é o do tema e o que veio nele é escolha.
    const hostOf = useCallback((): DesignRecord | undefined => (configIsSavedDesign ? undefined : configRef.current as DesignRecord), [configRef, configIsSavedDesign]);

    const restore = useCallback((previous: SarakDesignState, saved: SavedDesign): SarakDesignState => {
        const result = restoreSavedDesign(previous, saved, allThemesRef.current, hostOf());
        pendingRef.current = result.restored ? null : saved;
        return result.design;
    }, [hostOf]);

    const toPersisted = useCallback((design: SarakDesignState, themeId: string | undefined): PersistedDesign => {
        const theme = findThemeEntry(allThemesRef.current, themeId);
        if (!theme) return { design: design as unknown as DesignRecord };
        return { design: extractDesignChoices(design as unknown as DesignRecord, theme, hostOf()), format: SARAK_DESIGN_FORMAT_CHOICES };
    }, [hostOf]);

    return { restore, toPersisted, pendingRef };
};

/**
 * Quando o design gravado chegou antes do tema dele (tema embarcado ainda em carga), refaz o design assim que o tema
 * entra em memória. Uma prop controlada manda no tema e uma edição do usuário apaga a pendência.
 */
export const useDeferredDesignRestore = (
    pendingRef: MutableRefObject<SavedDesign | null>,
    allThemes: SarakThemeEntry[] | undefined,
    activeThemeId: string | undefined,
    restore: (previous: SarakDesignState, saved: SavedDesign) => SarakDesignState,
    setDesign: SetDesign,
): void => {
    useEffect(() => {
        const pending = pendingRef.current;
        if (!pending || activeThemeId) return;
        if (!findThemeEntry(allThemes, pending.themeId)) return;
        setDesign((previous) => restore(previous, pending));
    }, [activeThemeId, allThemes, pendingRef, restore, setDesign]);
};
