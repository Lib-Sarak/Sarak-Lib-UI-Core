import React, { useState, useCallback, useMemo } from 'react';
import { MASTER_DESIGN_MAP, getAllDesignTokens } from '../../../core/Design/master-map';
import { useDesignDraftSync } from './useDesignDraftSync';
import { SarakUIContextType, SarakDesignState } from '../../../core/Provider/types';
import { SarakTokenValue } from '../../../core/Design/types';

/**
 * Deep Comparison Utility (v12.0)
 * Compara tokens e propriedades estruturais para detectar mudanças reais.
 */
const areValuesEqual = (valA: unknown, valB: unknown) => {
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
export const useDesignDraft = (sarak: SarakUIContextType) => {
    // 1. Estado do Rascunho (Sandbox)
    // v12.2 - Inicialização Nula: O rascunho começa nulo para seguir o sistema 
    // sem criar uma cópia dessincronizada no mount.
    const [draftState, setDraftState] = useState<SarakDesignState | null>((sarak.draftDesign as SarakDesignState) || null);
    const isSyncingRef = React.useRef(false);

    // 2. Resolução Dinâmica (Ground Truth)
    // Se não há rascunho ativo, usamos o design do sistema.
    const draft = useMemo(() => {
        if (draftState) return draftState;
        
        // Fallback para o design do sistema ou defaults totais se nada existir
        const base = sarak.systemDesign || {} as SarakDesignState;
        const allTokens = getAllDesignTokens();
        const resolved: Record<string, SarakTokenValue> = { ...(base as Record<string, SarakTokenValue>) };
        
        allTokens.forEach(token => {
            if (resolved[token.id] === undefined) {
                resolved[token.id] = token.defaultValue;
            }
        });

        // Propriedades estruturais obrigatórias
        if (!resolved.layout) resolved.layout = base.layout || 'glass';
        if (!resolved.mode) resolved.mode = base.mode || 'dark';
        
        return resolved as unknown as SarakDesignState;
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
        return allKeys.some(key => !areValuesEqual((draftState as Record<string, SarakTokenValue>)[key], (sarak.systemDesign as Record<string, SarakTokenValue>)?.[key]));
    }, [draftState, sarak.systemDesign, getTokensByComponent]);

    const isDirty = useMemo(() => {
        if (!draftState) return false;
        const allKeys = Object.keys(draftState);
        return allKeys.some(key => !areValuesEqual((draftState as Record<string, SarakTokenValue>)[key], (sarak.systemDesign as Record<string, SarakTokenValue>)?.[key]));
    }, [draftState, sarak.systemDesign]);

    // 6. Ponte de Live Preview, Sincronização e Limpeza
    useDesignDraftSync(draftState, setDraftState, sarak, isSyncingRef);

    /**
     * Atualiza o rascunho
     */
    const updateDraft = useCallback((key: string, value: SarakTokenValue) => {
        setDraftState((prev: SarakDesignState | null) => {
            const current = prev || draft;
            const currentAsRecord = current as Record<string, SarakTokenValue>;
            if (currentAsRecord[key] === value) return prev;
            
            if (key === 'mode') {
                return { ...current, mode: value as SarakDesignState['mode'] } as SarakDesignState;
            }
            
            return { ...current, [key]: value } as SarakDesignState;
        });
    }, [draft]);

    const resetComponent = useCallback((schemaIdOrSchemas: string | string[]) => {
        const componentKeys = typeof schemaIdOrSchemas === 'string'
            ? getTokensByComponent(schemaIdOrSchemas)
            : MASTER_DESIGN_MAP.components
                .filter(c => schemaIdOrSchemas.includes(c.id))
                .flatMap(c => c.tokens.map(t => t.id));
        
        setDraftState((prev: SarakDesignState | null) => {
            const current = prev || draft;
            const newDraft: Record<string, SarakTokenValue> = { ...(current as Record<string, SarakTokenValue>) };
            componentKeys.forEach(key => {
                newDraft[key] = (sarak.systemDesign as Record<string, SarakTokenValue>)?.[key];
            });
            return newDraft as unknown as SarakDesignState;
        });

        const label = typeof schemaIdOrSchemas === 'string' ? schemaIdOrSchemas : schemaIdOrSchemas.join(', ');
        showToast('warning', `Tokens de ${label.toUpperCase()} restaurados.`);
    }, [draft, getTokensByComponent, showToast, sarak.systemDesign]);

    /**
     * Reverte um único token
     */
    const resetToken = useCallback((tokenId: string) => {
        setDraftState((prev: SarakDesignState | null) => ({
            ...(prev || draft),
            [tokenId]: (sarak.systemDesign as Record<string, SarakTokenValue>)?.[tokenId]
        } as SarakDesignState));
    }, [draft, sarak.systemDesign]);

    /**
     * Preview de um preset genérico (qualquer subcategoria)
     * Aceita diretamente o payload { design } do preset selecionado.
     */
    const handleThemePreview = (presetDesign: Partial<SarakDesignState>, presetKeyId?: string) => {
        if (presetDesign && typeof presetDesign === 'object') {
            setDraftState((prev: SarakDesignState | null) => ({
                ...(prev || draft),
                ...presetDesign,
                ...(presetKeyId ? { [`${presetKeyId}PresetId`]: presetKeyId } : {})
            } as SarakDesignState));
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
            const patch: Partial<SarakDesignState> = {};
            const patchRecord = patch as Record<string, SarakTokenValue>;
            const draftRecord = draft as Record<string, SarakTokenValue>;
            componentKeys.forEach(key => {
                patchRecord[key] = draftRecord[key];
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
