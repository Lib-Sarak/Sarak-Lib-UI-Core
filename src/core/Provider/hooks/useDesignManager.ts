import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { validateDesign } from '../utils/validation';
import { DEFAULT_STORAGE_KEY, DEFAULT_UI_BASE_URL, DEFAULT_INDUSTRIAL_SEED } from '../constants';
import { BASE_PRESETS } from '../../../constants/theme-models';

/**
 * useDesignManager (v10.1)
 * 
 * Centraliza a lógica de estado do design, rascunhos, rascunhos persistentes
 * e sincronização com backend/localStorage.
 */
export const useDesignManager = (props: {
    initialConfig: any,
    options: any,
    token?: string | null,
    isHydrated: boolean
}) => {
    const { initialConfig, options, token, isHydrated } = props;
    
    // Refs para evitar loops de efeito com objetos passados via props
    const optionsRef = useRef(options);
    const configRef = useRef(initialConfig);

    useEffect(() => {
        optionsRef.current = options;
        configRef.current = initialConfig;
    }, [options, initialConfig]);

    const [isBackendLoaded, setIsBackendLoaded] = useState(false);

    const [design, setDesign] = useState(() => {
        const opt = optionsRef.current;
        const defaultThemeId = opt?.theme?.defaultTheme || 'futurist';
        const defaultTheme = (BASE_PRESETS as any)[defaultThemeId] || BASE_PRESETS.futurist;

        const seedConfig = { ...DEFAULT_INDUSTRIAL_SEED, ...defaultTheme, ...configRef.current };

        if (typeof window === 'undefined') return seedConfig;

        try {
            const key = opt?.persistence?.storageKey || DEFAULT_STORAGE_KEY;
            const saved = localStorage.getItem(key);
            if (saved) {
                const parsed = JSON.parse(saved);
                const validParsed = Object.fromEntries(
                    Object.entries(parsed).filter(([_, v]) => v !== null && v !== undefined)
                );
                return validateDesign({ ...seedConfig, ...validParsed });
            }
        } catch (e) {
            console.error("[Sarak:Design] Load error:", e);
        }
        return validateDesign(seedConfig);
    });

    const uiBaseUrl = useMemo(() => optionsRef.current?.endpoints?.baseUrl || DEFAULT_UI_BASE_URL, []);
    const storageKey = useMemo(() => optionsRef.current?.persistence?.storageKey || DEFAULT_STORAGE_KEY, []);

    // 1. Carregamento Remoto
    useEffect(() => {
        if (!isHydrated) return;

        const loadRemote = async () => {
            const opt = optionsRef.current;
            if (opt?.persistence?.onLoad) {
                try {
                    const custom = await opt.persistence.onLoad();
                    if (custom) {
                        setDesign((prev: any) => validateDesign({ ...prev, ...custom }));
                        setIsBackendLoaded(true);
                        return;
                    }
                } catch (e) { console.error("[Sarak:Design] onLoad error:", e); }
            }

            if (token && !isBackendLoaded && opt?.endpoints?.designPath) {
                try {
                    const resp = await fetch(`${uiBaseUrl}${opt.endpoints.designPath}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (resp.ok) {
                        const data = await resp.json();
                        if (data.design) setDesign((prev: any) => validateDesign({ ...prev, ...data.design }));
                        setIsBackendLoaded(true);
                    }
                } catch (e) {}
            }
        };

        loadRemote();
    }, [token, isBackendLoaded, isHydrated, uiBaseUrl]);

    // 2. Persistência Automática (Debounced)
    useEffect(() => {
        if (!isHydrated) return;

        const timer = setTimeout(async () => {
            const opt = optionsRef.current;
            try {
                localStorage.setItem(storageKey, JSON.stringify(design));
                if (opt?.persistence?.onSave) {
                    await opt.persistence.onSave(design);
                } else if (token && opt?.endpoints?.designPath) {
                    await fetch(`${uiBaseUrl}${opt.endpoints.designPath}`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({ design })
                    });
                }
            } catch (e) { console.error("[Sarak:Design] Save error:", e); }
        }, 1500);

        return () => clearTimeout(timer);
    }, [design, token, isHydrated, uiBaseUrl, storageKey]);

    const safeSetDesign = useCallback((next: any) => {
        setDesign((prev: any) => {
            const updated = typeof next === 'function' ? next(prev) : next;
            return validateDesign(updated);
        });
    }, []);

    const applyConfig = useCallback((partial: any) => {
        safeSetDesign((prev: any) => ({ ...prev, ...partial }));
    }, [safeSetDesign]);

    const applyFullConfig = useCallback((config: any) => {
        safeSetDesign(config);
    }, [safeSetDesign]);

    return {
        design,
        setDesign: safeSetDesign,
        applyConfig,
        applyFullConfig,
        isBackendLoaded
    };
};
