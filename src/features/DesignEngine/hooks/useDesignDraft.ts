import React, { useState, useCallback, useMemo } from 'react';
import { MASTER_DESIGN_MAP, getAllDesignTokens } from '../../../core/Design/master-map';
import { useDesignDraftSync } from './useDesignDraftSync';

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

    const showToast = useCallback((type: 'success' | 'warning', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    }, []);

    // 3. Mapeamento Dinâmico de Tokens por Componente (Schema ID)
    const getTokensByComponent = useCallback((schemaId: string) => {
        const schemaTokens = MASTER_DESIGN_MAP.components
            .filter(c => c.id === schemaId)
            .flatMap(c => c.tokens.map(t => t.id));
            
        if (schemaId === 'branding') {
            const structural = ['layout', 'mode', 'systemName', 'logoUrl', 'logoDarkUrl', 'fontScale'];
            structural.forEach(key => {
                if (!schemaTokens.includes(key)) schemaTokens.push(key);
            });
        }
        return schemaTokens;
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
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // 5. Cálculo de Dirty State
    const isComponentDirty = useCallback((schemaId: string) => {
        if (!draftState) return false;
        const allKeys = getTokensByComponent(schemaId);
        return allKeys.some(key => !areValuesEqual(draftState[key], sarak.systemDesign?.[key]));
    }, [draftState, sarak.systemDesign, getTokensByComponent]);

    const isDirty = useMemo(() => {
        if (!draftState) return false;
        const allKeys = Object.keys(draftState);
        return allKeys.some(key => !areValuesEqual(draftState[key], sarak.systemDesign?.[key]));
    }, [draftState, sarak.systemDesign]);

    // 6. Ponte de Live Preview, Sincronização e Limpeza
    useDesignDraftSync(draftState, setDraftState, sarak, isSyncingRef);

    /**
     * Atualiza o rascunho
     */
    const updateDraft = useCallback((key: string, value: any) => {
        setDraftState((prev: any) => {
            const current = prev || draft;
            if (current[key] === value) return prev;
            
            if (key === 'mode') {
                return { ...current, mode: value };
            }
            
            return { ...current, [key]: value };
        });
    }, [draft]);

    const resetComponent = useCallback((schemaIdOrSchemas: string | string[]) => {
        const componentKeys = typeof schemaIdOrSchemas === 'string'
            ? getTokensByComponent(schemaIdOrSchemas)
            : MASTER_DESIGN_MAP.components
                .filter(c => schemaIdOrSchemas.includes(c.id))
                .flatMap(c => c.tokens.map(t => t.id));
        
        setDraftState((prev: any) => {
            const current = prev || draft;
            const newDraft = { ...current };
            componentKeys.forEach(key => {
                newDraft[key] = sarak.systemDesign?.[key];
            });
            return newDraft;
        });

        const label = typeof schemaIdOrSchemas === 'string' ? schemaIdOrSchemas : schemaIdOrSchemas.join(', ');
        showToast('warning', `Tokens de ${label.toUpperCase()} restaurados.`);
    }, [draft, getTokensByComponent, showToast, sarak.systemDesign]);

    /**
     * Reverte um único token
     */
    const resetToken = useCallback((tokenId: string) => {
        setDraftState((prev: any) => ({
            ...(prev || draft),
            [tokenId]: sarak.systemDesign?.[tokenId]
        }));
    }, [draft, sarak.systemDesign]);

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
     * APLICAÇÃO GRANULAR (Commit por Componente)
     */
    const handleApplyComponent = (schemaId: string) => {
        if (sarak.applyConfigRaw && isComponentDirty(schemaId)) {
            const componentKeys = getTokensByComponent(schemaId);
            const patch: Record<string, any> = {};
            componentKeys.forEach(key => {
                patch[key] = draft[key];
            });
            
            sarak.applyConfigRaw(patch);
            showToast('success', `Módulo ${schemaId.toUpperCase()} aplicado.`);
        }
    };

    return {
        draft,
        isDirty,
        isComponentDirty,
        updateDraft,
        resetComponent,
        resetToken,
        handleThemePreview,
        handleApplyToSystem,
        handleApplyComponent,
        toast,
        showToast
    };
};
