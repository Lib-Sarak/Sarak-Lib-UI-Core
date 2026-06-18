import React from 'react';

export const usePreviewContextValue = (parentContext: any, tokens: any, onUpdateDraft: (key: string, value: any) => void) => {
    return React.useMemo(() => ({
        ...parentContext,
        design: tokens,
        isDrafting: true,
        applyConfig: (partial: any) => {
            Object.entries(partial).forEach(([key, value]) => {
                onUpdateDraft(key, value);
            });
        },
        applyFullConfig: (config: any) => {
            Object.entries(config).forEach(([key, value]) => {
                onUpdateDraft(key, value);
            });
        }
    }), [parentContext, tokens, onUpdateDraft]);
};

export const useApplyPreset = (onUpdateDraft: (key: string, value: any) => void, onApplyFullTheme?: (design: any) => void) => {
    return React.useCallback((presetTokens: Record<string, any>, isPartial = false) => {
        if (isPartial) {
            Object.entries(presetTokens).forEach(([key, value]) => {
                onUpdateDraft(key, value);
            });
            return;
        }
        
        if (onApplyFullTheme) {
            onApplyFullTheme(presetTokens);
            return;
        }

        Object.entries(presetTokens).forEach(([key, value]) => {
            onUpdateDraft(key, value);
        });
    }, [onUpdateDraft, onApplyFullTheme]);
};
