import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { validateDesign } from '../utils/validation';
import { DEFAULT_STORAGE_KEY, DEFAULT_UI_BASE_URL } from '../constants';
import { GLOBAL_THEMES } from '../../Design/presets/themes';
import { getDefaultDesignState } from '../../Design/master-map';
import { useDesignSync } from './useDesignSync';
import { useDesignRemoteLoader } from './useDesignRemoteLoader';
import { SarakThemePayload, SarakUIOptions, SarakDesignState, ThemeEntry } from '../types';

/**
 * useDesignManager (v10.1)
 *
 * Centraliza a lógica de estado do design, rascunhos, rascunhos persistentes
 * e sincronização com backend/localStorage.
 */
export const useDesignManager = (props: {
    initialConfig: SarakThemePayload,
    options: SarakUIOptions,
    token?: string | null,
    isHydrated: boolean,
    allThemes?: ThemeEntry[],
    activeThemeId?: string
}) => {
    const { initialConfig, options, token, isHydrated, allThemes, activeThemeId } = props;
    
    const optionsRef = useRef(options);
    const configRef = useRef(initialConfig);
    const hasHydratedRef = useRef(false);

    optionsRef.current = options;
    configRef.current = initialConfig;

    const [isBackendLoaded, setIsBackendLoaded] = useState(false);

    // Initial seed logic (Sovereign Map v11.0)
    const getSeedConfig = useCallback(() => {
        const opt = optionsRef.current;
        const masterDefaults = getDefaultDesignState();
        
        let themeDesignTokens: Record<string, unknown> = {};

        if (activeThemeId && allThemes) {
            const activeTheme = allThemes.find(t => t.id === activeThemeId);
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
        
        return { ...masterDefaults, ...themeDesignTokens, ...configRef.current };
    }, [activeThemeId, allThemes]);

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
    const uiBaseUrl = useMemo(() => options?.endpoints?.baseUrl || DEFAULT_UI_BASE_URL, [options?.endpoints?.baseUrl]);

    useDesignSync(isHydrated, activeThemeId, allThemes, storageKey, hasHydratedRef, setDesign);
    useDesignRemoteLoader(isHydrated, token, uiBaseUrl, optionsRef, isBackendLoaded, setIsBackendLoaded, setDesign);

    // 3. Persistência de Design (Core Logic)
    const persistDesign = useCallback(async (config: SarakDesignState) => {
        if (!isHydrated) return;
        const opt = optionsRef.current;
        try {
            localStorage.setItem(storageKey, JSON.stringify(config));
            if (opt?.persistence?.onSave) {
                await opt.persistence.onSave(config);
            } else {
                const designPath = opt?.endpoints?.designPath || '/design';
                const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                if (token) headers['Authorization'] = `Bearer ${token}`;
                
                await fetch(`${uiBaseUrl}${designPath}`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ design: config })
                });
            }
        } catch (e) {
            console.error("[Sarak:Design] Save error:", e);
        }
    }, [isHydrated, storageKey, token, uiBaseUrl]);

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
