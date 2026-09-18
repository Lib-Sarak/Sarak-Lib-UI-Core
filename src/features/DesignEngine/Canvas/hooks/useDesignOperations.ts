import React from 'react';
import { SarakUIContextType, SarakDesignState } from '../../../../core/Provider/types';
import { SarakTokenValue } from '../../../../core/Design/types';

export const usePreviewContextValue = (parentContext: SarakUIContextType, tokens: SarakDesignState, onUpdateDraft: (key: string, value: SarakTokenValue) => void) => {
    return React.useMemo(() => ({
        ...parentContext,
        design: tokens,
        isDrafting: true,
        applyConfig: (partial: Partial<SarakDesignState>) => {
            Object.entries(partial).forEach(([key, value]) => {
                if (value !== undefined) onUpdateDraft(key, value as SarakTokenValue);
            });
        },
        applyFullConfig: (config: SarakDesignState) => {
            Object.entries(config).forEach(([key, value]) => {
                if (value !== undefined) onUpdateDraft(key, value as SarakTokenValue);
            });
        }
    }), [parentContext, tokens, onUpdateDraft]);
};

export const useApplyPreset = (onUpdateDraft: (key: string, value: SarakTokenValue) => void, onApplyFullTheme?: (design: Partial<SarakDesignState>, themeId?: string) => void) => {
    return React.useCallback((presetTokens: Partial<SarakDesignState>, isPartial = false, themeId?: string) => {
        if (isPartial) {
            Object.entries(presetTokens).forEach(([key, value]) => {
                if (value !== undefined) onUpdateDraft(key, value as SarakTokenValue);
            });
            return;
        }

        if (onApplyFullTheme) {
            onApplyFullTheme(presetTokens, themeId);
            return;
        }

        Object.entries(presetTokens).forEach(([key, value]) => {
            if (value !== undefined) onUpdateDraft(key, value as SarakTokenValue);
        });
    }, [onUpdateDraft, onApplyFullTheme]);
};
