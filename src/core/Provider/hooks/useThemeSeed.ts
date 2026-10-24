import { useCallback, useRef, type MutableRefObject } from 'react';
import { SARAK_DEFAULT_THEME_ID } from '../../Design/presets/themes';
import { getLoadedThemePreset, isSarakThemePresetId } from '../../Design/presets/themes/registry';
import { resolveThemeForMode } from '../../Design/presets/themes/color-engine';
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

    const isUnknownRequestedTheme = useCallback((id: string | undefined): boolean =>
        Boolean(id) && !allThemes?.some((theme) => theme.id === id) && !isSarakThemePresetId(id as string),
    [allThemes]);

    const readCachedThemeId = useCallback((): string | undefined => {
        if (typeof window === 'undefined') return undefined;
        if (optionsRef.current.persistence?.preferConfigOverCache === true) return undefined;
        if (resolveEffectiveStrategy(optionsRef.current.persistence) === 'remote') return undefined;
        return readCachedActiveThemeId(resolveStorageKey(optionsRef.current.persistence));
    }, [optionsRef]);

    const resolveSeedThemeId = useCallback((): string | undefined => {
        const explicitThemeId = activeThemeId;
        const cachedThemeId = readCachedThemeId();
        if (!explicitThemeId && cachedThemeId) return cachedThemeId;

        const seedThemeId = explicitThemeId || initialTheme;
        if (seedThemeId) {
            if (!isUnknownRequestedTheme(seedThemeId)) return seedThemeId;
            const requestedMode: 'light' | 'dark' = (configRef.current?.mode as 'light' | 'dark') || 'dark';
            console.warn(`[SarakUIProvider] tema "${seedThemeId}" não existe (removido do catálogo ou nunca existiu) — semeando com o tema padrão "${SARAK_DEFAULT_THEME_ID}" (modo "${requestedMode}").`);
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
    }, [activeThemeId, initialTheme, isUnknownRequestedTheme, configRef, optionsRef, readCachedThemeId]);

    const getSeedConfig = useCallback((): SarakDesignState => {
        const masterDefaults = sarakGetDefaultDesignState();
        const seedId = resolveSeedThemeId();
        const themeEntry = allThemes?.find((theme) => theme.id === seedId) ?? (seedId ? getLoadedThemePreset(seedId) : undefined);
        // Pedido de tema inexistente: o padrão entra no modo pedido (a contraparte
        // autorada), não no nativo — o modo claro nunca vira um escuro com o rótulo trocado.
        const fellBack = isUnknownRequestedTheme(activeThemeId || initialTheme);
        const requestedMode: 'light' | 'dark' = (configRef.current?.mode as 'light' | 'dark') || 'dark';
        let themeDesignTokens: Record<string, unknown> = themeEntry?.design ?? {};
        if (fellBack && themeEntry?.design) {
            themeDesignTokens = resolveThemeForMode(
                { design: themeEntry.design as Record<string, SarakTokenValue>, contraparte: themeEntry.contraparte },
                requestedMode,
            );
        }
        const lightModeTextColors = resolveLightModeTextColors(themeEntry, requestedMode);

        // Mescla de defaults conhecidos + payload dinâmico do banco no estado
        // canônico: cast pontual tipado (o índice dinâmico de `themeDesignTokens`
        // não se atribui sozinho a `SarakDesignState`).
        return { ...masterDefaults, ...themeDesignTokens, ...lightModeTextColors, ...configRef.current } as SarakDesignState;
    }, [resolveSeedThemeId, allThemes, activeThemeId, initialTheme, isUnknownRequestedTheme, configRef]);

    return { resolveSeedThemeId, getSeedConfig };
};
