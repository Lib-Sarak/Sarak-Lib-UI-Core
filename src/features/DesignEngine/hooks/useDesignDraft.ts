import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PRESETS_LIBRARY } from '../../../core/Design/presets';
import { MASTER_DESIGN_MAP, getAllDesignTokens } from '../../../core/Design/master-map';

/**
 * Deep Comparison Utility (v12.0)
 * Compara tokens e propriedades estruturais para detectar mudanças reais.
 */
const areValuesEqual = (valA: any, valB: any) => {
    if (valA === valB) return true;
    if (typeof valA === 'object' && valA !== null && typeof valB === 'object' && valB !== null) {
        return JSON.stringify(valA) === JSON.stringify(valB);
    }
    return false;
};

/**
 * useDesignDraft (v12.1 - Data-Driven)
 * Orquestrador de rascunhos com isolamento de sandbox.
 */
export const useDesignDraft = (sarak: any) => {
    // 1. Estado do Rascunho (Sandbox)
    // Inicializamos apenas com os dados reais de design para evitar poluição de funções
    const [draft, setDraft] = useState<any>(() => {
        const initialState: Record<string, any> = {};
        const allTokens = getAllDesignTokens();
        
        // Populamos com o estado atual do sistema (sarak.design) ou default
        allTokens.forEach(token => {
            initialState[token.id] = sarak.design?.[token.id] ?? token.defaultValue;
        });

        // Garantimos propriedades de controle que podem não estar nos tokens mas são essenciais
        initialState.layout = sarak.design?.layout || 'glass';
        initialState.mode = sarak.design?.mode || 'dark';

        return initialState;
    });

    const [toast, setToast] = useState<{ type: 'success' | 'warning', message: string } | null>(null);

    const showToast = (type: 'success' | 'warning', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    // 2. Mapeamento Dinâmico de Tokens por Pilar (Baseado no Mapa Mestre)
    const getTokensByPillar = useCallback((pillarId: string) => {
        const pillarTokens = MASTER_DESIGN_MAP.components
            .filter(c => c.pilar === pillarId)
            .flatMap(c => c.tokens.map(t => t.id));
            
        // Injeção de propriedades estruturais no pilar correto de forma dinâmica
        // (Isso será movido para o schema em versões futuras)
        if (pillarId === 'identidade') {
            const structural = ['layout', 'mode', 'systemName', 'logoUrl', 'logoDarkUrl', 'fontScale'];
            structural.forEach(key => {
                if (!pillarTokens.includes(key)) pillarTokens.push(key);
            });
        }
        
        return pillarTokens;
    }, []);

    // 1. Bloqueio Atômico Síncrono (Fase de Renderização)
    // Garante que o firewall esteja ativo antes de qualquer componente filho montar.
    if (!sarak.isDrafting) {
        sarak.lockDrafting();
    }

    // 2. Sincronização de Estado e Cleanup
    React.useLayoutEffect(() => {
        sarak.setIsDrafting(true);
        return () => {
            sarak.setIsDrafting(false);
            sarak.setDraftDesign(null);
        };
    }, []);

    // 3. Cálculo de Dirty State
    const isPillarDirty = useCallback((pillarId: string) => {
        const allKeys = getTokensByPillar(pillarId);
        return allKeys.some(key => !areValuesEqual(draft[key], sarak.design?.[key]));
    }, [draft, sarak.design, getTokensByPillar]);

    const isDirty = useMemo(() => {
        const allKeys = Object.keys(draft);
        return allKeys.some(key => !areValuesEqual(draft[key], sarak.design?.[key]));
    }, [draft, sarak.design]);

    // 4. Ponte de Live Preview (Sincroniza rascunho com o Provider)
    // 4.1. Sincronização em Tempo Real (Draft -> Provider)
    useEffect(() => {
        if (!sarak.setDraftDesign) return;

        // Otimização: Apenas sincroniza se o draft for realmente diferente do draft atual do provider
        if (JSON.stringify(draft) !== JSON.stringify(sarak.draftDesign)) {
            sarak.setDraftDesign(draft);
        }
    }, [draft, sarak.setDraftDesign, sarak.draftDesign]);

    // 4.2. Sincronização Inversa (Provider -> Draft)
    // Essencial para componentes externos (ThemeToggle, PaletteSelector) refletirem no painel
    useEffect(() => {
        if (!sarak.draftDesign) return;

        // Se o rascunho do Provider mudou externamente, atualizamos o estado local
        if (JSON.stringify(sarak.draftDesign) !== JSON.stringify(draft)) {
            setDraft(sarak.draftDesign);
        }
    }, [sarak.draftDesign]);

    // 4.2. Limpeza apenas na desmontagem completa (Unmount)
    useEffect(() => {
        return () => {
            if (sarak.setDraftDesign) {
                sarak.setDraftDesign(null);
            }
        };
    }, []); 

    /**
     * Atualiza o rascunho
     */
    const updateDraft = (key: string, value: any) => {
        setDraft((prev: any) => {
            if (prev[key] === value) return prev;
            return { ...prev, [key]: value };
        });
    };

    /**
     * Aplica um conjunto de tokens ao rascunho (Patch)
     */
    const applyPatch = (patch: Record<string, any>) => {
        setDraft((prev: any) => ({
            ...prev,
            ...patch
        }));
    };

    /**
     * Reseta um pilar inteiro para o estado atual do sistema
     */
    const resetPillar = (pillarId: string) => {
        const pillarKeys = getTokensByPillar(pillarId);
        
        setDraft((prev: any) => {
            const newDraft = { ...prev };
            pillarKeys.forEach(key => {
                newDraft[key] = sarak.design?.[key];
            });
            return newDraft;
        });

        showToast('warning', `Pilar ${pillarId.toUpperCase()} restaurado.`);
    };

    /**
     * Reverte um único token
     */
    const resetToken = (tokenId: string) => {
        setDraft((prev: any) => ({
            ...prev,
            [tokenId]: sarak.design?.[tokenId]
        }));
    };

    /**
     * Preview de um tema (Preset)
     */
    const handleThemePreview = (id: string) => {
        const theme = PRESETS_LIBRARY.layouts?.find((t: any) => t.id === id);
        if (theme && theme.tokens) {
            applyPatch(theme.tokens);
            updateDraft('layout', id);
        }
    };

    /**
     * APLICAÇÃO REAL AO SISTEMA (Commit Total)
     */
    const handleApplyToSystem = () => {
        if (sarak.applyFullConfigRaw && isDirty) {
            sarak.applyFullConfigRaw(draft);
            showToast('success', 'Design aplicado ao sistema com sucesso.');
        }
    };

    /**
     * APLICAÇÃO GRANULAR (Commit por Pilar)
     * Ignora o interceptor 'smartApplyConfig' usando 'setDesign' diretamente.
     */
    const handleApplyPillar = (pillarId: string) => {
        if (sarak.applyConfigRaw && isPillarDirty(pillarId)) {
            const pillarKeys = getTokensByPillar(pillarId);
            const patch: Record<string, any> = {};
            pillarKeys.forEach(key => {
                patch[key] = draft[key];
            });
            
            // Usamos applyConfigRaw (raw) para garantir que as mudanças persistam no sistema
            // mesmo que o modo de rascunho esteja ativo.
            sarak.applyConfigRaw(patch);
            showToast('success', `Pilar ${pillarId.toUpperCase()} aplicado individualmente.`);
        }
    };

    return {
        draft,
        isDirty,
        isPillarDirty,
        updateDraft,
        resetPillar,
        resetToken,
        handleThemePreview,
        handleApplyToSystem,
        handleApplyPillar,
        toast,
        showToast
    };
};
