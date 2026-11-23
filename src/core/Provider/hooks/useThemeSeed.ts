import { useCallback, useMemo, useRef, type MutableRefObject } from 'react';
import { SARAK_DEFAULT_THEME_ID } from '../../Design/presets/themes';
import { getLoadedThemePreset, isSarakRemovedThemeId, isSarakThemePresetId } from '../../Design/presets/themes/registry';
import { resolveThemeForMode } from '../../Design/presets/themes/color-engine';
import { resolvePaletteForDesign } from '../../Design/palette/resolve';
import { sarakGetDefaultDesignState } from '../../Design/master-map';
import { readCachedActiveThemeId, resolveStorageKey } from '../utils/resolveStorageKey';
import { resolveEffectiveStrategy } from '../utils/persistenceStrategy';
import type { SarakTokenValue } from '../../Design/types';
import type { SarakDesignState, SarakThemeEntry, SarakThemePayload, SarakUIOptions } from '../types';

interface ThemeSeedProps {
    allThemes?: SarakThemeEntry[];
    activeThemeId?: string;
    initialTheme?: string;
    optionsRef: MutableRefObject<SarakUIOptions>;
    configRef: MutableRefObject<SarakThemePayload>;
}

/**
 * A validação do id de tema GRAVADO, compartilhada pelas três portas por onde ele chega (a prop, o cache local e o
 * `onLoad`): quem decide se um id existe e quem avisa é um só, e o aviso sai uma vez por id na vida do Provider.
 */
export interface ThemeIdGuard {
    /** `true` quando o id não é de tema embarcado nem de `customThemes`. */
    isUnknownTheme: (id: string | undefined) => boolean;
    /** `true` quando o id é de um tema que a lib removeu (`SARAK_REMOVED_THEME_IDS`) e o consumidor não declara. */
    isRemovedTheme: (id: string | undefined) => boolean;
    /** `true` quando o id guardado no cache local é de um tema que a lib removeu (e nenhuma prop o sobrepõe). */
    isSavedThemeRemoved: () => boolean;
    /** Avisa, nomeando o id, uma única vez por id. */
    warnUnknownThemeOnce: (id: string) => void;
}

const TEXT_COLOR_ROLE_KEYS = ['titleColor', 'subtitleColor', 'emphasisColor'] as const;

const resolveLightModeTextColors = (
    themeEntry: SarakThemeEntry | undefined,
    mode: 'light' | 'dark',
): Record<string, SarakTokenValue> => {
    if (mode !== 'light' || !themeEntry?.design || themeEntry.design.mode === 'light') return {};

    const lightModeDesign = resolveThemeForMode(
        { design: themeEntry.design as Record<string, SarakTokenValue>, contraparte: themeEntry.contraparte },
        mode,
    );

    return Object.fromEntries(
        TEXT_COLOR_ROLE_KEYS
            .filter((key) => typeof lightModeDesign[key] === 'string')
            .map((key) => [key, lightModeDesign[key]]),
    );
};

/**
 * A SEMENTE do design (Sovereign Map v11.0), extraída de `useDesignManager` para
 * manter aquele arquivo abaixo do teto de linhas (R9).
 *
 * `resolveSeedThemeId`: o id do tema que a semente efetivamente
 * resolveu: `activeThemeId` (controlado) manda; senão `initialTheme`; senão
 * `options.theme.defaultTheme`; senão o tema padrão do sistema
 * (`SARAK_DEFAULT_THEME_ID`). É a MESMA lógica que `getSeedConfig` usa para os
 * tokens, para `resolvedThemeId` nascer consistente com o design semeado.
 *
 * Um id pedido que não bate com nenhum tema conhecido — removido do catálogo, ou
 * nunca existiu — nunca deixa a semente sem tema: cai no tema padrão, resolvido
 * para o modo pedido (`config.mode` explícito, se houver; senão escuro), com um
 * aviso. Um id EMBARCADO que ainda não está em memória é conhecido: a porta de
 * espera do Provider o carrega antes do primeiro quadro (ou o `design` salvo
 * pinta sozinho) — nunca cai no padrão.
 */
export const useThemeSeed = (props: ThemeSeedProps) => {
    const { allThemes, activeThemeId, initialTheme, optionsRef, configRef } = props;
    // Avisos de `options.theme.defaultTheme` inexistente: um por id (a semente é recalculada).
    const warnedDefaultThemeIdsRef = useRef(new Set<string>());
    // Avisos de tema removido: um por id, somando as três portas.
    const warnedUnknownThemeIdsRef = useRef(new Set<string>());

    const isUnknownRequestedTheme = useCallback((id: string | undefined): boolean =>
        Boolean(id) && !allThemes?.some((theme) => theme.id === id) && !isSarakThemePresetId(id as string),
    [allThemes]);

    // Pela persistência só cai no padrão o id que a LIB removeu; outro id desconhecido pode ser tema do importador em carga.
    const isRemovedTheme = useCallback((id: string | undefined): boolean =>
        Boolean(id) && isSarakRemovedThemeId(id as string) && !allThemes?.some((theme) => theme.id === id),
    [allThemes]);

    const warnUnknownThemeOnce = useCallback((id: string): void => {
        if (warnedUnknownThemeIdsRef.current.has(id)) return;
        warnedUnknownThemeIdsRef.current.add(id);
        console.warn(`[SarakUIProvider] tema "${id}" não existe (removido do catálogo ou nunca existiu) — usando o tema padrão "${SARAK_DEFAULT_THEME_ID}" no modo pedido.`);
    }, []);

    const readCachedThemeId = useCallback((): string | undefined => {
        if (typeof window === 'undefined') return undefined;
        if (optionsRef.current.persistence?.preferConfigOverCache === true) return undefined;
        if (resolveEffectiveStrategy(optionsRef.current.persistence) === 'remote') return undefined;
        return readCachedActiveThemeId(resolveStorageKey(optionsRef.current.persistence));
    }, [optionsRef]);

    const resolveSeedThemeId = useCallback((): string | undefined => {
        const explicitThemeId = activeThemeId;
        const cachedThemeId = readCachedThemeId();
        if (!explicitThemeId && cachedThemeId) {
            if (!isRemovedTheme(cachedThemeId)) return cachedThemeId;
            warnUnknownThemeOnce(cachedThemeId);
            return SARAK_DEFAULT_THEME_ID;
        }

        const seedThemeId = explicitThemeId || initialTheme;
        if (seedThemeId) {
            if (!isUnknownRequestedTheme(seedThemeId)) return seedThemeId;
            warnUnknownThemeOnce(seedThemeId);
            return SARAK_DEFAULT_THEME_ID;
        }
        const defaultThemeId = optionsRef.current?.theme?.defaultTheme;
        if (!defaultThemeId) return SARAK_DEFAULT_THEME_ID;
        if (!isUnknownRequestedTheme(defaultThemeId)) return defaultThemeId;
        if (!warnedDefaultThemeIdsRef.current.has(defaultThemeId)) {
            warnedDefaultThemeIdsRef.current.add(defaultThemeId);
            console.warn(`[SarakUIProvider] options.theme.defaultTheme "${defaultThemeId}" não existe — usando o tema padrão "${SARAK_DEFAULT_THEME_ID}".`);
        }
        return SARAK_DEFAULT_THEME_ID;
    }, [activeThemeId, initialTheme, isRemovedTheme, isUnknownRequestedTheme, optionsRef, readCachedThemeId, warnUnknownThemeOnce]);

    const isSavedThemeRemoved = useCallback((): boolean => {
        const cachedThemeId = activeThemeId ? undefined : readCachedThemeId();
        return isRemovedTheme(cachedThemeId);
    }, [activeThemeId, isRemovedTheme, readCachedThemeId]);

    // `modeHint`: o modo do design gravado que foi descartado, quando o host não fixa `config.mode`.
    const getSeedConfig = useCallback((modeHint?: unknown): SarakDesignState => {
        const masterDefaults = sarakGetDefaultDesignState();
        const seedId = resolveSeedThemeId();
        const themeEntry = allThemes?.find((theme) => theme.id === seedId) ?? (seedId ? getLoadedThemePreset(seedId) : undefined);
        // Pedido de tema inexistente: o padrão entra no modo pedido (a contraparte
        // autorada), não no nativo — o modo claro nunca vira um escuro com o rótulo trocado.
        const fellBack = isUnknownRequestedTheme(activeThemeId || initialTheme) || isSavedThemeRemoved();
        const hintedMode = modeHint === 'light' || modeHint === 'dark' ? modeHint : undefined;
        const requestedMode: 'light' | 'dark' = (configRef.current?.mode as 'light' | 'dark') || hintedMode || 'dark';
        let themeDesignTokens: Record<string, unknown> = themeEntry?.design ?? {};
        if (fellBack && themeEntry?.design) {
            themeDesignTokens = resolveThemeForMode(
                { design: themeEntry.design as Record<string, SarakTokenValue>, contraparte: themeEntry.contraparte },
                requestedMode,
            );
        }
        const lightModeTextColors = resolveLightModeTextColors(themeEntry, requestedMode);
        // A paleta do tema (ou do host) no modo que a semente terá, por baixo do que o tema declara.
        const seedMode = (configRef.current?.mode ?? themeDesignTokens.mode) === 'light' ? 'light' : 'dark';
        const palette = resolvePaletteForDesign(themeDesignTokens, configRef.current as Record<string, unknown> | undefined, seedMode);

        // Mescla de defaults conhecidos + payload dinâmico do banco no estado
        // canônico: cast pontual tipado (o índice dinâmico de `themeDesignTokens`
        // não se atribui sozinho a `SarakDesignState`).
        return { ...masterDefaults, ...palette, ...themeDesignTokens, ...lightModeTextColors, ...configRef.current } as SarakDesignState;
    }, [resolveSeedThemeId, allThemes, activeThemeId, initialTheme, isUnknownRequestedTheme, isSavedThemeRemoved, configRef]);

    const themeIdGuard = useMemo<ThemeIdGuard>(
        () => ({ isUnknownTheme: isUnknownRequestedTheme, isRemovedTheme, isSavedThemeRemoved, warnUnknownThemeOnce }),
        [isUnknownRequestedTheme, isRemovedTheme, isSavedThemeRemoved, warnUnknownThemeOnce],
    );

    return { resolveSeedThemeId, getSeedConfig, themeIdGuard };
};
