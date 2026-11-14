import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { validateDesign } from '../utils/validation';
import { readCachedActiveThemeId, resolveStorageKey, writeCachedActiveThemeId, writeCachedDesign } from '../utils/resolveStorageKey';
import { resolveEffectiveStrategy } from '../utils/persistenceStrategy';
import { useThemeSeed } from './useThemeSeed';
import { deliverToOnSave, readCachedSavedDesign, useDeferredDesignRestore, useDesignChoices } from './useDesignChoices';
import { useDesignSync } from './useDesignSync';
import { useDesignRemoteLoader } from './useDesignRemoteLoader';
import { useDesignStorageSync } from './useDesignStorageSync';
import { useResolvedThemeId } from './useResolvedThemeId';
import { usePersistenceSaveFailure } from './usePersistenceSaveFailure';
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
    const {
        failureCount: persistenceSaveFailureCount,
        recordFailure: recordPersistenceSaveFailure,
    } = usePersistenceSaveFailure();
    // Guarda o par já persistido para evitar repetir a mesma gravação automática.
    const lastPersistedSignatureRef = useRef<string | null>(null);
    // Evita tentativas simultâneas do mesmo par (Aplicar + debounce) sem marcar falhas como sucesso.
    const lastAttemptedSignatureRef = useRef<string | null>(null);
    // O baseline separa a leitura inicial de uma alteração feita depois do boot.
    const hasPersistenceBaselineRef = useRef(false);

    optionsRef.current = options;
    configRef.current = initialConfig;
    onThemeChangeRef.current = onThemeChange;

    const [isBackendLoaded, setIsBackendLoaded] = useState(false);
    const onLoadBecameAvailable = useCallback(() => {
        hasHydratedRef.current = false;
        userChangedDesignRef.current = false;
        lastPersistedSignatureRef.current = null;
        lastAttemptedSignatureRef.current = null;
        hasPersistenceBaselineRef.current = false;
        setIsBackendLoaded(false);
    }, []);

    // O id do tema que a SEMENTE resolveu e os tokens semeados — `useThemeSeed.ts`.
    const { resolveSeedThemeId, getSeedConfig, themeIdGuard } = useThemeSeed({
        allThemes, activeThemeId, initialTheme, optionsRef, configRef,
    });
    // O gravado guarda só as escolhas; o que a paleta calcula é refeito ao carregar (`useDesignChoices.ts`).
    const designChoices = useDesignChoices(allThemes, configRef);

    // plan-27 — o tema EFETIVAMENTE no ar (não a prop `activeThemeId` crua); ver
    // `useResolvedThemeId.ts`. ADITIVO: não muda a semântica de `activeThemeId`/
    // `initialTheme` (R33). Extraído do corpo deste hook para não estourar o
    // teto de estado por hook (R9) — sem isso são 5 useState/useEffect aqui.
    const [resolvedThemeId, updateResolvedThemeId] = useResolvedThemeId(activeThemeId, resolveSeedThemeId, themeIdGuard.isUnknownTheme);
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
        const strategy = resolveEffectiveStrategy(optionsRef.current.persistence);
        if (strategy === 'remote') return validateDesign(getSeedConfig());

        try {
            const saved = optionsRef.current.persistence?.preferConfigOverCache !== true
                ? readCachedSavedDesign(storageKey, readCachedActiveThemeId(storageKey))
                : undefined;
            if (saved) {
                // Design gravado sobre um tema que não existe mais: o tema padrão, no modo que o gravado tinha.
                if (themeIdGuard.isSavedThemeRemoved()) return validateDesign(getSeedConfig(saved.full.mode));
                return designChoices.restore(getSeedConfig(), saved);
            }
        } catch (error) {
            console.error('[Sarak:Design] localStorage load error:', error);
        }
        return validateDesign(getSeedConfig());
    });

    const persistDesign = useCallback(async (config: SarakDesignState) => {
        if (!isHydrated) return;
        const activeThemeIdAtSave = resolvedThemeIdRef.current;
        const signature = createPersistenceSignature(validateDesign(config), activeThemeIdAtSave);
        if (lastPersistedSignatureRef.current === signature || lastAttemptedSignatureRef.current === signature) return;
        lastAttemptedSignatureRef.current = signature;

        const opt = optionsRef.current;
        const strategy = resolveEffectiveStrategy(opt?.persistence);
        // As escolhas, com o marcador; sem o tema em memória, o design inteiro e sem marcador, como antes.
        const persisted = designChoices.toPersisted(config, activeThemeIdAtSave);
        try {
            if (strategy !== 'remote') {
                writeCachedDesign(storageKey, config, persisted.format === undefined ? undefined : { format: persisted.format, design: persisted.design });
                writeCachedActiveThemeId(storageKey, activeThemeIdAtSave);
            }
            if (strategy !== 'local' && opt?.persistence?.onSave) {
                await deliverToOnSave(opt.persistence.onSave, persisted, activeThemeIdAtSave);
            }
            onThemeChangeRef.current?.(config);
            lastPersistedSignatureRef.current = signature;
            hasPersistenceBaselineRef.current = true;
        } catch (error) {
            console.error('[Sarak:Design] Save error:', error);
            recordPersistenceSaveFailure();
        }
    }, [isHydrated, storageKey, recordPersistenceSaveFailure, designChoices.toPersisted]);

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
            lastAttemptedSignatureRef.current = null;
            hasPersistenceBaselineRef.current = false;
            setIsBackendLoaded(false);
            setDesign(validateDesign(getSeedConfig()));
            setResolvedThemeId(resolveSeedThemeId());
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
    }, [design, getSeedConfig, isBackendLoaded, isHydrated, persistDesign, resolvedThemeId, storageKey, setResolvedThemeId]);

    useDesignSync(
        isHydrated,
        activeThemeId,
        allThemes,
        storageKey,
        hasHydratedRef,
        setDesign,
        configRef,
        options?.persistence?.preferConfigOverCache === true,
        themeIdGuard,
        designChoices.restore,
    );
    useDeferredDesignRestore(designChoices.pendingRef, allThemes, activeThemeId, designChoices.restore, setDesign);
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
        onLoadBecameAvailable,
        design,
        resolvedThemeId,
        themeIdGuard,
        restoreSaved: designChoices.restore,
    });

    // Sincronização entre abas/apps (lacuna pré-Teste Real): default ligado, opt-out
    // via `options.persistence.crossTabSync === false`.
    const crossTabSyncEnabled = options?.persistence?.crossTabSync !== false;
    useDesignStorageSync(isHydrated, storageKey, crossTabSyncEnabled, design, setDesign);

    const safeSetDesign = useCallback((next: SarakDesignState | ((prev: SarakDesignState) => SarakDesignState)) => {
        userChangedDesignRef.current = true;
        lastAttemptedSignatureRef.current = null;
        designChoices.pendingRef.current = null;
        setDesign((prev) => {
            const updated = typeof next === 'function' ? next(prev) : next;
            return validateDesign(updated);
        });
    }, [designChoices.pendingRef]);

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
        persistenceSaveFailureCount,
        resolvedThemeId,
        setResolvedThemeId,
    };
};
