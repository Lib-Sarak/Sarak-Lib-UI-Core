import { useState, useRef, useCallback } from 'react';

export const useSarakDrafting = (design: any, applyConfig: any, applyFullConfig: any) => {
    const [draftDesign, setDraftDesign] = useState<any | null>(null);
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
    const smartApplyConfig = useCallback((partial: any) => {
        if (isDraftingRef.current || draftDesign) {
            setDraftDesign((prev: any) => ({ ...(prev || design), ...partial }));
        } else {
            applyConfig(partial);
        }
    }, [design, applyConfig, draftDesign]);

    const smartApplyFullConfig = useCallback((config: any) => {
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
