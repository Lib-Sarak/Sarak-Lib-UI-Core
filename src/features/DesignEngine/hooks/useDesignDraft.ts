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
    // v12.2 - Inicialização Nula: O rascunho começa nulo para seguir o sistema 
    // sem criar uma cópia dessincronizada no mount.
    const [draftState, setDraftState] = useState<any | null>(sarak.draftDesign);

    // 2. Resolução Dinâmica (Ground Truth)
    // Se não há rascunho ativo, usamos o design do sistema.
    const draft = useMemo(() => {
        if (draftState) return draftState;
        
        // Fallback para o design do sistema ou defaults totais se nada existir
        const base = sarak.systemDesign || {};
        const allTokens = getAllDesignTokens();
        const resolved: any = { ...base };
        
        allTokens.forEach(token => {
            if (resolved[token.id] === undefined) {
                resolved[token.id] = token.defaultValue;
            }
        });

        // Propriedades estruturais obrigatórias
        if (!resolved.layout) resolved.layout = base.layout || 'glass';
        if (!resolved.mode) resolved.mode = base.mode || 'dark';
        
        return resolved;
    }, [draftState, sarak.systemDesign]);

    const [toast, setToast] = useState<{ type: 'success' | 'warning', message: string } | null>(null);

    const showToast = (type: 'success' | 'warning', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    // 3. Mapeamento Dinâmico de Tokens por Pilar
    const getTokensByPillar = useCallback((pillarId: string) => {
        const pillarTokens = MASTER_DESIGN_MAP.components
            .filter(c => c.pilar === pillarId)
            .flatMap(c => c.tokens.map(t => t.id));
            
        if (pillarId === 'identidade') {
            const structural = ['layout', 'mode', 'systemName', 'logoUrl', 'logoDarkUrl', 'fontScale'];
            structural.forEach(key => {
                if (!pillarTokens.includes(key)) pillarTokens.push(key);
            });
        }
        return pillarTokens;
    }, []);

    // 4. Bloqueio Atômico Síncrono
    if (!sarak.isDrafting) {
        sarak.lockDrafting();
    }

    React.useLayoutEffect(() => {
        sarak.setIsDrafting(true);
        return () => {
            sarak.setIsDrafting(false);
        };
    }, []);

    // 5. Cálculo de Dirty State
    const isPillarDirty = useCallback((pillarId: string) => {
        if (!draftState) return false;
        const allKeys = getTokensByPillar(pillarId);
        return allKeys.some(key => !areValuesEqual(draftState[key], sarak.systemDesign?.[key]));
    }, [draftState, sarak.systemDesign, getTokensByPillar]);

    const isDirty = useMemo(() => {
        if (!draftState) return false;
        const allKeys = Object.keys(draftState);
        return allKeys.some(key => !areValuesEqual(draftState[key], sarak.systemDesign?.[key]));
    }, [draftState, sarak.systemDesign]);

    // 6. Ponte de Live Preview (Sincroniza com o Provider)
    useEffect(() => {
        if (!sarak.setDraftDesign) return;
        
        // Se o draftState for null, não enviamos nada (o provider usará o systemDesign)
        // Isso previne que o provider trave no "Cyan" se o rascunho local ainda estiver limpo.
        if (draftState === null) {
            if (sarak.draftDesign !== null) {
                sarak.setDraftDesign(null);
            }
            return;
        }

        if (JSON.stringify(draftState) !== JSON.stringify(sarak.draftDesign)) {
            sarak.setDraftDesign(draftState);
        }
    }, [draftState, sarak.setDraftDesign, sarak.draftDesign]);

    // 7. Sincronização Inversa (External Changes -> Local Draft)
    useEffect(() => {
        if (!sarak.draftDesign) {
            if (draftState !== null) setDraftState(null);
            return;
        }

        if (JSON.stringify(sarak.draftDesign) !== JSON.stringify(draftState)) {
            setDraftState(sarak.draftDesign);
        }
    }, [sarak.draftDesign]);

    // 8. Limpeza Final
    useEffect(() => {
        return () => {
            if (sarak.setDraftDesign) sarak.setDraftDesign(null);
        };
    }, []); 


    /**
     * Atualiza o rascunho
     */
    const updateDraft = (key: string, value: any) => {
        setDraftState((prev: any) => {
            const current = prev || draft;
            if (current[key] === value) return prev;
            return { ...current, [key]: value };
        });
    };

    /**
     * Aplica um conjunto de tokens ao rascunho (Patch)
     */
    const applyPatch = (patch: Record<string, any>) => {
        setDraftState((prev: any) => ({
            ...(prev || draft),
            ...patch
        }));
    };

    /**
     * Reseta um pilar inteiro para o estado atual do sistema
     */
    const resetPillar = (pillarId: string) => {
        const pillarKeys = getTokensByPillar(pillarId);
        
        setDraftState((prev: any) => {
            const current = prev || draft;
            const newDraft = { ...current };
            pillarKeys.forEach(key => {
                newDraft[key] = sarak.systemDesign?.[key];
            });
            return newDraft;
        });

        showToast('warning', `Pilar ${pillarId.toUpperCase()} restaurado.`);
    };

    /**
     * Reverte um único token
     */
    const resetToken = (tokenId: string) => {
        setDraftState((prev: any) => ({
            ...(prev || draft),
            [tokenId]: sarak.systemDesign?.[tokenId]
        }));
    };

    /**
     * Preview de um tema (Preset)
     */
    const handleThemePreview = (id: string) => {
        const theme = PRESETS_LIBRARY.layouts?.find((t: any) => t.id === id);
        if (theme && theme.tokens) {
            setDraftState((prev: any) => ({
                ...(prev || draft),
                ...theme.tokens,
                layout: id
            }));
        }
    };

    /**
     * APLICAÇÃO REAL AO SISTEMA (Commit Total)
     */
    const handleApplyToSystem = () => {
        if (sarak.applyFullConfigRaw && isDirty) {
            sarak.applyFullConfigRaw(draft);
            if (sarak.persistDesign) {
                sarak.persistDesign(draft);
            }
            showToast('success', 'Design aplicado ao sistema com sucesso.');
        }
    };

    /**
     * APLICAÇÃO GRANULAR (Commit por Pilar)
     */
    const handleApplyPillar = (pillarId: string) => {
        if (sarak.applyConfigRaw && isPillarDirty(pillarId)) {
            const pillarKeys = getTokensByPillar(pillarId);
            const patch: Record<string, any> = {};
            pillarKeys.forEach(key => {
                patch[key] = draft[key];
            });
            
            sarak.applyConfigRaw(patch);
            showToast('success', `Pilar ${pillarId.toUpperCase()} aplicado.`);
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
