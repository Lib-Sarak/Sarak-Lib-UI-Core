import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { validateDesign } from '../utils/validation';
import { resolveStorageKey } from '../utils/resolveStorageKey';
import { resolveEffectiveStrategy } from '../utils/persistenceStrategy';
import { GLOBAL_THEMES } from '../../Design/presets/themes';
import { getDefaultDesignState } from '../../Design/master-map';
import { useDesignSync } from './useDesignSync';
import { useDesignRemoteLoader } from './useDesignRemoteLoader';
import { useDesignStorageSync } from './useDesignStorageSync';
import { useResolvedThemeId } from './useResolvedThemeId';
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

    /**
     * plan-27: o id do tema que a SEMENTE efetivamente resolveu — `activeThemeId`
     * (controlado) manda; senão `initialTheme`; sem nenhum dos dois (ou sem
     * `allThemes` para achar o id pedido), cai no tema padrão do sistema. É a
     * MESMA lógica que `getSeedConfig` usa para os tokens — extraída para que
     * `resolvedThemeId` (abaixo) nasça consistente com o design semeado.
     */
    const resolveSeedThemeId = useCallback((): string | undefined => {
        const seedThemeId = activeThemeId || initialTheme;
        if (seedThemeId && allThemes?.some(t => t.id === seedThemeId)) return seedThemeId;
        const defaultThemeId = optionsRef.current?.theme?.defaultTheme || 'classic';
        const themeEntry = GLOBAL_THEMES.find(t => t.id === defaultThemeId) ?? GLOBAL_THEMES[0];
        return themeEntry?.id;
    }, [activeThemeId, initialTheme, allThemes]);

    // Initial seed logic (Sovereign Map v11.0)
    const getSeedConfig = useCallback(() => {
        const masterDefaults = getDefaultDesignState();
        const seedId = resolveSeedThemeId();
        const themeEntry = allThemes?.find(t => t.id === seedId) ?? GLOBAL_THEMES.find(t => t.id === seedId);
        const themeDesignTokens = themeEntry?.design ?? {};

        // Mescla de defaults conhecidos + payload dinâmico do banco no estado
        // canônico: cast pontual tipado (o índice dinâmico de `themeDesignTokens`
        // não se atribui sozinho a `SarakDesignState`).
        return { ...masterDefaults, ...themeDesignTokens, ...configRef.current } as SarakDesignState;
    }, [resolveSeedThemeId, allThemes]);

    // plan-27 — o tema EFETIVAMENTE no ar (não a prop `activeThemeId` crua); ver
    // `useResolvedThemeId.ts`. ADITIVO: não muda a semântica de `activeThemeId`/
    // `initialTheme` (R33). Extraído do corpo deste hook para não estourar o
    // teto de estado por hook (R9) — sem isso são 5 useState/useEffect aqui.
    const [resolvedThemeId, setResolvedThemeId] = useResolvedThemeId(activeThemeId, resolveSeedThemeId);

    // Chave efetiva (ADR-009 §2.1) — fonte única, calculada ANTES da semente para
    // que a leitura síncrona do boot (abaixo) e todo o resto do hook consumam a
    // MESMA chave, nunca compondo `storageKey`/`tenantId` duas vezes.
    const storageKey = useMemo(
        () => resolveStorageKey(options?.persistence),
        [options?.persistence?.storageKey, options?.persistence?.tenantId],
    );

    const [design, setDesign] = useState<SarakDesignState>(() => {
        if (typeof window === 'undefined') return getSeedConfig();

        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                return validateDesign({ ...getSeedConfig(), ...parsed });
            }
        } catch (e) {}
        return validateDesign(getSeedConfig());
    });

    useDesignSync(isHydrated, activeThemeId, allThemes, storageKey, hasHydratedRef, setDesign);
    useDesignRemoteLoader(isHydrated, optionsRef, isBackendLoaded, setIsBackendLoaded, setDesign, getSeedConfig);

    // Sincronização entre abas/apps (lacuna pré-Teste Real): default ligado, opt-out
    // via `options.persistence.crossTabSync === false`.
    const crossTabSyncEnabled = options?.persistence?.crossTabSync !== false;
    useDesignStorageSync(isHydrated, storageKey, crossTabSyncEnabled, design, setDesign);

    // 3. Persistência de Design (Core Logic). `strategy` (ADR-009 §2.2) decide o
    // destino: 'local'/'hybrid' gravam localStorage; 'remote' só chama `onSave` —
    // a lib nunca faz fetch para servidor próprio, `onSave`/`onThemeChange` são
    // portas opcionais "traga sua persistência" do PRÓPRIO consumidor.
    const persistDesign = useCallback(async (config: SarakDesignState) => {
        if (!isHydrated) return;
        const opt = optionsRef.current;
        const strategy = resolveEffectiveStrategy(opt?.persistence);
        try {
            if (strategy !== 'remote') {
                localStorage.setItem(storageKey, JSON.stringify(config));
            }
            if (strategy !== 'local' && opt?.persistence?.onSave) {
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
        isBackendLoaded,
        resolvedThemeId,
        setResolvedThemeId
    };
};
