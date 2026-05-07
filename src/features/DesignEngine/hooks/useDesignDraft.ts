import { useState, useEffect, useCallback, useMemo } from 'react';
import { PRESETS_LIBRARY } from '../../../core/Design/presets';
import { MASTER_DESIGN_MAP } from '../../../core/Design/master-map';

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
 * useDesignDraft (v12.1)
 * Orquestrador de rascunhos com isolamento de sandbox.
 */
export const useDesignDraft = (sarak: any) => {
    // 1. Estado do Rascunho (Sandbox)
    // Inicializamos apenas com o que é necessário para o preview
    const [draft, setDraft] = useState<any>(() => {
        return {
            ...sarak,
            layout: sarak.layout || 'glass',
            mode: sarak.mode || 'dark',
        };
    });

    const [toast, setToast] = useState<{ type: 'success' | 'warning', message: string } | null>(null);

    const showToast = (type: 'success' | 'warning', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    // 2. Mapeamento de Tokens por Pilar (Baseado no Mapa Mestre)
    const getTokensByPillar = useCallback((pillarId: string) => {
        const pillarTokens = MASTER_DESIGN_MAP.components
            .filter(c => c.pilar === pillarId)
            .flatMap(c => c.tokens.map(t => t.id));
            
        const structuralMap: Record<string, string[]> = {
            identidade: ['layout', 'mode', 'systemName', 'logoUrl', 'logoDarkUrl'],
            visual: ['fontScale'],
            estetica: []
        };
        
        return [...pillarTokens, ...(structuralMap[pillarId] || [])];
    }, []);

    // 3. Cálculo de Dirty State
    const isPillarDirty = useCallback((pillarId: string) => {
        const allKeys = getTokensByPillar(pillarId);
        return allKeys.some(key => !areValuesEqual(draft[key], sarak[key]));
    }, [draft, sarak, getTokensByPillar]);

    const isDirty = useMemo(() => {
        const allTokens = MASTER_DESIGN_MAP.components.flatMap(c => c.tokens.map(t => t.id));
        const structural = ['layout', 'mode', 'systemName', 'logoUrl', 'logoDarkUrl', 'fontScale'];
        const keysToCompare = [...allTokens, ...structural];
        
        return keysToCompare.some(key => !areValuesEqual(draft[key], sarak[key]));
    }, [draft, sarak]);

    // 4. Ponte de Live Preview (Sincroniza rascunho com o Provider)
    useEffect(() => {
        console.log('[useDesignDraft] Pushing draft to SarakUIProvider:', draft.layout, draft.mode);
        if (sarak.setDraftDesign) {
            sarak.setDraftDesign(draft);
        }
        return () => {
            console.log('[useDesignDraft] Clearing draft from SarakUIProvider');
            if (sarak.setDraftDesign) {
                sarak.setDraftDesign(null);
            }
        };
    }, [draft, sarak.setDraftDesign]);

    // O estado efetivo de preview é o rascunho atual
    const effectiveDraft = useMemo(() => ({
        ...sarak,
        ...draft
    }), [sarak, draft]);

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
                newDraft[key] = sarak[key];
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
            [tokenId]: sarak[tokenId]
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
     * APLICAÇÃO REAL AO SISTEMA (Commit)
     */
    const handleApplyToSystem = () => {
        if (sarak.applyFullConfig && isDirty) {
            sarak.applyFullConfig(draft);
            showToast('success', 'Design aplicado ao sistema com sucesso.');
            // NÃO limpamos o rascunho aqui para evitar que a UI "pisque" 
            // voltando ao estado antigo antes do sistema hidratar.
            // O useEffect de limpeza no desmonte cuidará disso.
        }
    };

    return {
        draft: effectiveDraft,
        isDirty,
        isPillarDirty,
        updateDraft,
        resetPillar,
        resetToken,
        handleThemePreview,
        handleApplyToSystem,
        toast,
        showToast
    };
};
