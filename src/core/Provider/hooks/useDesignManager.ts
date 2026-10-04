import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { validateDesign } from '../utils/validation';
import { resolveStorageKey } from '../utils/resolveStorageKey';
import { resolveEffectiveStrategy } from '../utils/persistenceStrategy';
import { SARAK_GLOBAL_THEMES } from '../../Design/presets/themes';
import { SARAK_REFERENCE_THEMES } from '../../Design/presets/themes/reference';
import { sarakGetDefaultDesignState } from '../../Design/master-map';
import { useDesignSync } from './useDesignSync';
import { useDesignRemoteLoader } from './useDesignRemoteLoader';
import { useDesignStorageSync } from './useDesignStorageSync';
import { useResolvedThemeId } from './useResolvedThemeId';
import { SarakThemePayload, SarakUIOptions, SarakDesignState, SarakThemeEntry } from '../types';

// O mesmo design associado a outro tema representa outro estado persistido.
const createPersistenceSignature = (design: SarakDesignState, activeThemeId?: string): string =>
    JSON.stringify([design, activeThemeId]);

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
    allThemes?: SarakThemeEntry[],
    activeThemeId?: string,
    initialTheme?: string,
    onThemeChange?: (design: SarakThemePayload) => void
}) => {
    const { initialConfig, options, isHydrated, allThemes, activeThemeId, initialTheme, onThemeChange } = props;

    const optionsRef = useRef(options);
    const configRef = useRef(initialConfig);
    const hasHydratedRef = useRef(false);
    const onThemeChangeRef = useRef(onThemeChange);
    // A gravação automática só acompanha edições explícitas, não hidratação ou sync.
    const userChangedDesignRef = useRef(false);
    // Guarda o par já persistido para evitar repetir a mesma gravação automática.
    const lastPersistedSignatureRef = useRef<string | null>(null);
    // O baseline separa a leitura inicial de uma alteração feita depois do boot.
    const hasPersistenceBaselineRef = useRef(false);

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
     *
     * Um id EXPLICITAMENTE pedido (`activeThemeId`/`initialTheme`) que não bate
     * com nenhum tema conhecido — removido do catálogo, ou nunca existiu — nunca
     * deixa a semente sem tema: cai na referência do modo pedido (`config.mode`
     * explícito, se houver; senão escuro, o default do schema), com um aviso.
     */
    const resolveSeedThemeId = useCallback((): string | undefined => {
        const seedThemeId = activeThemeId || initialTheme;
        if (seedThemeId) {
            if (allThemes?.some(t => t.id === seedThemeId)) return seedThemeId;
            const requestedMode: 'light' | 'dark' = (configRef.current?.mode as 'light' | 'dark') || 'dark';
            const reference = SARAK_REFERENCE_THEMES.find((t) => (t.design.mode ?? 'dark') === requestedMode) ?? SARAK_REFERENCE_THEMES[0];
            console.warn(`[SarakUIProvider] tema "${seedThemeId}" não existe (removido do catálogo ou nunca existiu) — semeando com a referência "${reference.id}" (modo "${requestedMode}").`);
            return reference.id;
        }
        const defaultThemeId = optionsRef.current?.theme?.defaultTheme || 'classic';
        const themeEntry = SARAK_GLOBAL_THEMES.find(t => t.id === defaultThemeId) ?? SARAK_GLOBAL_THEMES[0];
        return themeEntry?.id;
    }, [activeThemeId, initialTheme, allThemes]);

    // Initial seed logic (Sovereign Map v11.0)
    const getSeedConfig = useCallback(() => {
        const masterDefaults = sarakGetDefaultDesignState();
        const seedId = resolveSeedThemeId();
        const themeEntry = allThemes?.find(t => t.id === seedId) ?? SARAK_GLOBAL_THEMES.find(t => t.id === seedId);
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
    const [resolvedThemeId, updateResolvedThemeId] = useResolvedThemeId(activeThemeId, resolveSeedThemeId);
    // `persistDesign` lê a ref no instante da gravação para levar o id anunciado
    // junto com o design. O setter atualiza esta ref sincronamente, então aplicar
    // id e persistir na mesma chamada não depende de um render intermediário.
    const resolvedThemeIdRef = useRef(resolvedThemeId);
    resolvedThemeIdRef.current = resolvedThemeId;
    const setResolvedThemeId = useCallback((id: string | undefined) => {
        resolvedThemeIdRef.current = id;
        updateResolvedThemeId(id);
    }, [updateResolvedThemeId]);

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
        } catch (error) {
            console.error('[Sarak:Design] localStorage load error:', error);
        }
        return validateDesign(getSeedConfig());
    });

    const persistDesign = useCallback(async (config: SarakDesignState) => {
        if (!isHydrated) return;
        const activeThemeIdAtSave = resolvedThemeIdRef.current;
        const signature = createPersistenceSignature(config, activeThemeIdAtSave);
        if (lastPersistedSignatureRef.current === signature) return;

        const opt = optionsRef.current;
        const strategy = resolveEffectiveStrategy(opt?.persistence);
        try {
            if (strategy !== 'remote') localStorage.setItem(storageKey, JSON.stringify(config));
            if (strategy !== 'local' && opt?.persistence?.onSave) {
                await opt.persistence.onSave(config, activeThemeIdAtSave);
            }
            onThemeChangeRef.current?.(config);
            lastPersistedSignatureRef.current = signature;
            hasPersistenceBaselineRef.current = true;
        } catch (error) {
            console.error('[Sarak:Design] Save error:', error);
        }
    }, [isHydrated, storageKey]);

    const previousStorageKeyRef = useRef(storageKey);
    useEffect(() => {
        if (previousStorageKeyRef.current !== storageKey) {
            // Uma chave nova representa outra partição (por exemplo, outro
            // tenant): descarte o baseline anterior e carregue seus dados antes
            // de permitir que qualquer alteração seja persistida.
            previousStorageKeyRef.current = storageKey;
            hasHydratedRef.current = false;
            userChangedDesignRef.current = false;
            lastPersistedSignatureRef.current = null;
            hasPersistenceBaselineRef.current = false;
            setIsBackendLoaded(false);
            setDesign(validateDesign(getSeedConfig()));
            return;
        }

        if (!isHydrated || !isBackendLoaded) return;

        // A primeira leitura apenas estabelece a comparação. Sem este baseline,
        // a hidratação remota/local poderia parecer uma edição e gravar no boot.
        if (!hasPersistenceBaselineRef.current && !userChangedDesignRef.current) {
            lastPersistedSignatureRef.current = createPersistenceSignature(design, resolvedThemeId);
            hasPersistenceBaselineRef.current = true;
        }

        // Cargas e sincronizações não são edições do usuário; só o setter público
        // marca a ref e habilita o debounce de gravação automática.
        if (!userChangedDesignRef.current) return;

        const timer = setTimeout(() => persistDesign(design), 1500);
        return () => clearTimeout(timer);
    }, [design, getSeedConfig, isBackendLoaded, isHydrated, persistDesign, resolvedThemeId, storageKey]);

    useDesignSync(isHydrated, activeThemeId, allThemes, storageKey, hasHydratedRef, setDesign);
    useDesignRemoteLoader({
        isHydrated,
        optionsRef,
        isBackendLoaded,
        setIsBackendLoaded,
        setDesign,
        getSeedConfig,
        activeThemeId,
        setResolvedThemeId,
        storageKey,
    });

    // Sincronização entre abas/apps (lacuna pré-Teste Real): default ligado, opt-out
    // via `options.persistence.crossTabSync === false`.
    const crossTabSyncEnabled = options?.persistence?.crossTabSync !== false;
    useDesignStorageSync(isHydrated, storageKey, crossTabSyncEnabled, design, setDesign);

    const safeSetDesign = useCallback((next: SarakDesignState | ((prev: SarakDesignState) => SarakDesignState)) => {
        userChangedDesignRef.current = true;
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
        setResolvedThemeId,
    };
};
