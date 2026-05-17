import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
    const isSyncingRef = React.useRef(false);

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

    // 6. Ponte de Live Preview (Sincronização Atômica v12.8)
    useEffect(() => {
        if (!sarak.setDraftDesign) return;
        
        // Se estamos no meio de uma sincronização vinda do provedor, ignoramos para evitar ecos
        if (isSyncingRef.current) return;

        const currentDraftStr = JSON.stringify(draftState);
        const providerDraftStr = JSON.stringify(sarak.draftDesign);

        if (currentDraftStr !== providerDraftStr) {
            sarak.setDraftDesign(draftState);
        }
    }, [draftState, sarak.setDraftDesign, sarak.draftDesign]);

    // 7. Sincronização Inversa (External Changes -> Local Draft)
    useEffect(() => {
        const providerDraftStr = JSON.stringify(sarak.draftDesign);
        const currentDraftStr = JSON.stringify(draftState);

        if (providerDraftStr !== currentDraftStr) {
            isSyncingRef.current = true;
            setDraftState(sarak.draftDesign);
            // Resetamos a flag no próximo tick
            setTimeout(() => {
                isSyncingRef.current = false;
            }, 0);
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

    const resetPillar = (pillarIdOrSchemas: string | string[]) => {
        const pillarKeys = typeof pillarIdOrSchemas === 'string'
            ? getTokensByPillar(pillarIdOrSchemas)
            : MASTER_DESIGN_MAP.components
                .filter(c => pillarIdOrSchemas.includes(c.id))
                .flatMap(c => c.tokens.map(t => t.id));
        
        setDraftState((prev: any) => {
            const current = prev || draft;
            const newDraft = { ...current };
            pillarKeys.forEach(key => {
                newDraft[key] = sarak.systemDesign?.[key];
            });
            return newDraft;
        });

        const label = typeof pillarIdOrSchemas === 'string' ? pillarIdOrSchemas : pillarIdOrSchemas.join(', ');
        showToast('warning', `Tokens de ${label.toUpperCase()} restaurados.`);
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
     * Preview de um preset genérico (qualquer subcategoria)
     * Aceita diretamente o payload { design } do preset selecionado.
     */
    const handleThemePreview = (presetDesign: Record<string, any>, presetKeyId?: string) => {
        if (presetDesign && typeof presetDesign === 'object') {
            setDraftState((prev: any) => ({
                ...(prev || draft),
                ...presetDesign,
                ...(presetKeyId ? { [`${presetKeyId}PresetId`]: presetKeyId } : {})
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
