import { useState, useRef, useCallback } from 'react';
import { SarakThemePayload } from '../types';

export const useSarakDrafting = (
    design: SarakThemePayload,
    applyConfig: (partial: Partial<SarakThemePayload>) => void,
    applyFullConfig: (config: SarakThemePayload) => void
) => {
    const [draftDesign, setDraftDesign] = useState<SarakThemePayload | null>(null);
    const [isDrafting, setIsDraftingState] = useState(false);
    const isDraftingRef = useRef(false);

    // Sincroniza o estado visual com o Ref síncrono para evitar race conditions
    const setIsDrafting = useCallback((active: boolean) => {
        isDraftingRef.current = active;
        setIsDraftingState(active);
    }, []);

    // Trava síncrona imediata (pode ser chamada durante a renderização)
    const lockDrafting = useCallback(() => {
        isDraftingRef.current = true;
    }, []);

    // Interceptor Inteligente (Isolamento Draft vs System)
    const smartApplyConfig = useCallback((partial: Partial<SarakThemePayload>) => {
        if (isDraftingRef.current || draftDesign) {
            setDraftDesign((prev) => ({ ...(prev || design), ...partial }));
        } else {
            applyConfig(partial);
        }
    }, [design, applyConfig, draftDesign]);

    const smartApplyFullConfig = useCallback((config: SarakThemePayload) => {
        if (isDraftingRef.current || draftDesign) {
            setDraftDesign(config);
        } else {
            applyFullConfig(config);
        }
    }, [applyFullConfig, draftDesign]);

    return {
        draftDesign,
        setDraftDesign,
        isDrafting,
        setIsDrafting,
        lockDrafting,
        smartApplyConfig,
        smartApplyFullConfig
    };
};
