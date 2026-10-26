import React, { useState, useCallback, useMemo } from 'react';
import { MASTER_DESIGN_MAP, sarakGetAllDesignTokens } from '../../../core/Design/master-map';
import { useDesignDraftSync } from './useDesignDraftSync';
import { useLastAppliedSnapshot } from './useLastAppliedSnapshot';
import { SarakUIContextType, SarakDesignState } from '../../../core/Provider/types';
import { SarakTokenValue } from '../../../core/Design/types';
import { applyColorMode, overlayPreferences } from '../../../core/Provider/utils/overlayPreferences';
import { composeThemeDesign } from '../../../core/Design/presets/themes/compose';

const areValuesEqual = (valA: unknown, valB: unknown): boolean => {
    if (valA === valB) return true;
    if (typeof valA === 'object' && valA !== null && typeof valB === 'object' && valB !== null) {
        return JSON.stringify(valA) === JSON.stringify(valB);
    }
    return false;
};

export const useDesignDraft = (sarak: SarakUIContextType) => {
    const [draftState, setDraftState] = useState<SarakDesignState | null>((sarak.draftDesign as SarakDesignState) || null);
    const isSyncingRef = React.useRef(false);

    // O tema pendente só vira tema ativo quando o rascunho é aplicado.
    const [pendingThemeId, setPendingThemeId] = useState<string | undefined>(undefined);

    const draft = useMemo(() => {
        if (draftState) return draftState;
        const base = sarak.systemDesign || {} as SarakDesignState;
        const allTokens = sarakGetAllDesignTokens();
        const resolved: Record<string, SarakTokenValue> = { ...(base as Record<string, SarakTokenValue>) };
        allTokens.forEach(token => {
            if (resolved[token.id] === undefined) {
                resolved[token.id] = token.defaultValue;
            }
        });

        if (!resolved.layout) resolved.layout = base.layout || 'glass';
        if (!resolved.mode) resolved.mode = base.mode || 'dark';
        return resolved as unknown as SarakDesignState;
    }, [draftState, sarak.systemDesign]);

    const draftTheme = useMemo(() => {
        const themes = sarak.allThemes || [];
        return themes.find((theme) => theme.id === pendingThemeId)
            || themes.find((theme) => theme.id === sarak.resolvedThemeId);
    }, [pendingThemeId, sarak.allThemes, sarak.resolvedThemeId]);

    const previewDraft = useMemo(() => {
        const systemColorScheme = sarak.design?.mode === 'light' ? 'light' : 'dark';
        return overlayPreferences(
            draft,
            { colorMode: sarak.preferences?.colorMode },
            draftTheme,
            systemColorScheme,
        );
    }, [draft, draftTheme, sarak.design?.mode, sarak.preferences?.colorMode]);

    const [toast, setToast] = useState<{ type: 'success' | 'warning', message: string } | null>(null);
    const showToast = useCallback((type: 'success' | 'warning', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    }, []);
    const { canUndoLastApply, captureBeforeApply, undoLastApply: undoLastApplyRaw } = useLastAppliedSnapshot(sarak, showToast);
    // Mantém o estado local para não ecoar pela ponte bidirecional de sincronização.
    const undoLastApply = useCallback(() => { undoLastApplyRaw(); setDraftState(null); }, [undoLastApplyRaw]);

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

    if (!sarak.isDrafting) {
        sarak.lockDrafting();
    }

    React.useLayoutEffect(() => {
        sarak.setIsDrafting(true);
        return () => {
            sarak.setIsDrafting(false);
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

    const dirtyTokenCount = useMemo(() => {
        if (!draftState) return 0;
        const draftRecord = draftState as Record<string, SarakTokenValue>;
        const systemDesign = sarak.systemDesign as Record<string, SarakTokenValue> | undefined;
        return sarakGetAllDesignTokens().filter((token) => {
            const systemValue = systemDesign?.[token.id] === undefined
                ? token.defaultValue
                : systemDesign[token.id];
            const draftValue = draftRecord[token.id] === undefined ? systemValue : draftRecord[token.id];
            return !areValuesEqual(draftValue, systemValue);
        }).length;
    }, [draftState, sarak.systemDesign]);

    useDesignDraftSync(draftState, setDraftState, sarak, isSyncingRef);

    const updateDraft = useCallback((key: string, value: SarakTokenValue) => {
        if (key === 'mode') {
            if (value !== 'light' && value !== 'dark') return;
            const targetMode = value;
            const activeTheme = draftTheme;
            const current = draft as SarakDesignState;
            const currentMode = current.mode === 'light' ? 'light' : 'dark';
            const counterpart = activeTheme?.contraparte;
            const nativeMode = activeTheme?.design?.mode === 'light' ? 'light' : 'dark';
            const sourceForCurrentMode = (currentMode === nativeMode ? activeTheme?.design : counterpart) as
                Record<string, SarakTokenValue> | undefined;
            const nextModeDraft = applyColorMode(current, targetMode, activeTheme);
            const discardedCustomization = Boolean(counterpart && currentMode !== targetMode && Object.keys(counterpart).some((tokenId) =>
                !areValuesEqual(
                    (current as Record<string, SarakTokenValue>)[tokenId],
                    sourceForCurrentMode?.[tokenId],
                ) && !areValuesEqual(
                    (current as Record<string, SarakTokenValue>)[tokenId],
                    (nextModeDraft as Record<string, SarakTokenValue>)[tokenId],
                ),
            ));
            setDraftState((prev: SarakDesignState | null) => {
                const currentDraft = prev || draft;
                if (currentDraft.mode === targetMode) return prev;
                return applyColorMode(currentDraft, targetMode, activeTheme);
            });
            if (discardedCustomization) {
                showToast('warning', `A troca para o modo ${targetMode === 'dark' ? 'escuro' : 'claro'} substituiu uma customização de cor pela contraparte do tema.`);
            }
            return;
        }

        setDraftState((prev: SarakDesignState | null) => {
            const current = prev || draft;
            const currentAsRecord = current as Record<string, SarakTokenValue>;
            if (currentAsRecord[key] === value) return prev;
            return { ...current, [key]: value } as SarakDesignState;
        });
    }, [draft, draftTheme, showToast]);

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

    const resetToken = useCallback((tokenId: string) => {
        setDraftState((prev: SarakDesignState | null) => ({
            ...(prev || draft),
            [tokenId]: (sarak.systemDesign as Record<string, SarakTokenValue>)?.[tokenId]
        } as SarakDesignState));
    }, [draft, sarak.systemDesign]);

    const discardDraft = useCallback(() => {
        setDraftState(null);
        setPendingThemeId(undefined);
    }, []);

    // Tema completo recompõe o design; preset parcial só substitui as chaves declaradas.
    const handleThemePreview = (presetDesign: Partial<SarakDesignState>, presetKeyId?: string, themeId?: string): void => {
        if (presetDesign && typeof presetDesign === 'object') {
            setDraftState((prev: SarakDesignState | null) => {
                const base = prev || draft;
                const next = themeId ? composeThemeDesign(presetDesign, base, sarak.getHostConfig?.()) : { ...base, ...presetDesign };
                return {
                    ...next,
                    ...(presetKeyId ? { [`${presetKeyId}PresetId`]: presetKeyId } : {})
                } as SarakDesignState;
            });
        }
        if (themeId) setPendingThemeId(themeId);
    };

    const handleApplyToSystem = (): void => {
        if (sarak.applyFullConfigRaw && isDirty) {
            captureBeforeApply();
            sarak.applyFullConfigRaw(draft);
            // Só aplicar o rascunho anuncia ao Provider o tema escolhido no catálogo.
            if (pendingThemeId) {
                sarak.setResolvedThemeId?.(pendingThemeId);
                setPendingThemeId(undefined);
            }
            sarak.persistDesign?.(draft);
            showToast('success', 'Design aplicado ao sistema com sucesso.');
        }
    };

    return {
        draft,
        previewDraft,
        isDirty,
        dirtyTokenCount,
        isComponentDirty,
        updateDraft,
        resetComponent,
        resetToken,
        discardDraft,
        handleThemePreview,
        setDraftThemeId: setPendingThemeId,
        handleApplyToSystem,
        canUndoLastApply,
        undoLastApply,
        toast,
        showToast
    };
};
