import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { validateDesign } from '../utils/validation';
import { DEFAULT_STORAGE_KEY } from '../constants';
import { GLOBAL_THEMES } from '../../Design/presets/themes';
import { getDefaultDesignState } from '../../Design/master-map';
import { useDesignSync } from './useDesignSync';
import { useDesignRemoteLoader } from './useDesignRemoteLoader';
import { SarakThemePayload, SarakUIOptions, SarakDesignState, ThemeEntry } from '../types';

/**
 * useDesignManager (v11.0 — Spec 44, sem backend próprio)
 *
 * Centraliza a lógica de estado do design, rascunhos e persistência: sempre em
 * localStorage; sync remoto é opcional e sempre via callback do CONSUMIDOR
 * (`options.persistence.onSave`/`onLoad`, `onThemeChange`) — a lib nunca faz
 * fetch para um servidor próprio.
 */
export const useDesignManager = (props: {
    initialConfig: SarakThemePayload,
    options: SarakUIOptions,
    isHydrated: boolean,
    allThemes?: ThemeEntry[],
    activeThemeId?: string,
    initialTheme?: string,
    onThemeChange?: (design: SarakThemePayload) => void
}) => {
    const { initialConfig, options, isHydrated, allThemes, activeThemeId, initialTheme, onThemeChange } = props;

    const optionsRef = useRef(options);
    const configRef = useRef(initialConfig);
    const hasHydratedRef = useRef(false);
    const onThemeChangeRef = useRef(onThemeChange);

    optionsRef.current = options;
    configRef.current = initialConfig;
    onThemeChangeRef.current = onThemeChange;

    const [isBackendLoaded, setIsBackendLoaded] = useState(false);

    // Initial seed logic (Sovereign Map v11.0)
    const getSeedConfig = useCallback(() => {
        const opt = optionsRef.current;
        const masterDefaults = getDefaultDesignState();

        let themeDesignTokens: Record<string, unknown> = {};

        // `activeThemeId` (controlado) manda; senão `initialTheme` (semente,
        // não-reativa) só afeta este seed inicial — nunca reaplica sozinho.
        const seedThemeId = activeThemeId || initialTheme;
        if (seedThemeId && allThemes) {
            const activeTheme = allThemes.find(t => t.id === seedThemeId);
            if (activeTheme) {
                themeDesignTokens = activeTheme.design || {};
            }
        }

        // Aplica o Preset base apenas se necessário, mas a fundação vem do Master Map
        if (Object.keys(themeDesignTokens).length === 0) {
            const defaultThemeId = opt?.theme?.defaultTheme || 'classic';
            const themeEntry = GLOBAL_THEMES.find(t => t.id === defaultThemeId) ?? GLOBAL_THEMES[0];
            themeDesignTokens = themeEntry?.design ?? {};
        }

        // Mescla de defaults conhecidos + payload dinâmico do banco no estado
        // canônico: cast pontual tipado (o índice dinâmico de `themeDesignTokens`
        // não se atribui sozinho a `SarakDesignState`).
        return { ...masterDefaults, ...themeDesignTokens, ...configRef.current } as SarakDesignState;
    }, [activeThemeId, initialTheme, allThemes]);

    const [design, setDesign] = useState<SarakDesignState>(() => {
        if (typeof window === 'undefined') return getSeedConfig();
        
        try {
            const key = optionsRef.current?.persistence?.storageKey || DEFAULT_STORAGE_KEY;
            const saved = localStorage.getItem(key);
            if (saved) {
                const parsed = JSON.parse(saved);
                return validateDesign({ ...getSeedConfig(), ...parsed });
            }
        } catch (e) {}
        return validateDesign(getSeedConfig());
    });

    const storageKey = useMemo(() => options?.persistence?.storageKey || DEFAULT_STORAGE_KEY, [options?.persistence?.storageKey]);

    useDesignSync(isHydrated, activeThemeId, allThemes, storageKey, hasHydratedRef, setDesign);
    useDesignRemoteLoader(isHydrated, optionsRef, isBackendLoaded, setIsBackendLoaded, setDesign);

    // 3. Persistência de Design (Core Logic). Sempre localStorage (a lib não ship
    // servidor — Spec 44); `onSave`/`onThemeChange` são portas opcionais "traga sua
    // persistência" para o backend do PRÓPRIO consumidor, nunca um fetch da lib.
    const persistDesign = useCallback(async (config: SarakDesignState) => {
        if (!isHydrated) return;
        const opt = optionsRef.current;
        try {
            localStorage.setItem(storageKey, JSON.stringify(config));
            if (opt?.persistence?.onSave) {
                await opt.persistence.onSave(config);
            }
            onThemeChangeRef.current?.(config);
        } catch (e) {
            console.error("[Sarak:Design] Save error:", e);
        }
    }, [isHydrated, storageKey]);

    // 4. Persistência Automática (Debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            persistDesign(design);
        }, 1500);

        return () => clearTimeout(timer);
    }, [design, persistDesign]);

    const safeSetDesign = useCallback((next: SarakDesignState | ((prev: SarakDesignState) => SarakDesignState)) => {
        setDesign((prev) => {
            const updated = typeof next === 'function' ? next(prev) : next;
            return validateDesign(updated);
        });
    }, []);

    const applyConfig = useCallback((partial: Partial<SarakThemePayload>) => {
        safeSetDesign((prev) => ({ ...prev, ...partial }));
    }, [safeSetDesign]);

    const applyFullConfig = useCallback((config: SarakThemePayload) => {
        safeSetDesign(config);
    }, [safeSetDesign]);

    return {
        design,
        setDesign: safeSetDesign,
        applyConfig,
        applyFullConfig,
        persistDesign,
        isBackendLoaded
    };
};
