import { useState, useEffect, useCallback } from 'react';
import { SarakDesignState } from '../../../core/Provider/types';

// TODO: Substituir por presets canônicos de core/Design/presets/themes/ quando forem criados
const BASE_PRESETS: Record<string, SarakDesignState> = {};

export interface ThemePreviewState {
    previewLayoutId: string;
    previewAnimationStyle: string;
    previewEmojiSet: string;
    previewPrimaryColor: string;
    previewFontScale: string;
    previewNavigationStyle: 'sidebar' | 'topbar';
    previewSidebarWidth: number;
    config: SarakDesignState;
    themeName: string;
}

export const useThemePreview = (
    currentLayout: string,
    globalAnimationStyle: string,
    globalEmojiSet: string,
    primaryColor: string,
    fontScale: string,
    navigationStyle: 'sidebar' | 'topbar',
    sidebarWidth: number,
    customThemes: Array<{ id: string, name: string, config: SarakDesignState, animationStyle?: string, emojiSet?: string }>,
    layouts: Record<string, { name: string, animation?: string, emoji?: string }>
) => {
    const getInitialConfig = () => {
        return BASE_PRESETS[(currentLayout || '').toLowerCase()] ||
            ((currentLayout || '').startsWith('custom-') ? customThemes.find(t => t.id === currentLayout.replace('custom-', ''))?.config : null) ||
            BASE_PRESETS.glass;
    };

    const [state, setState] = useState<ThemePreviewState>({
        previewLayoutId: currentLayout,
        previewAnimationStyle: globalAnimationStyle,
        previewEmojiSet: globalEmojiSet,
        previewPrimaryColor: primaryColor,
        previewFontScale: fontScale,
        previewNavigationStyle: navigationStyle,
        previewSidebarWidth: sidebarWidth,
        config: getInitialConfig(),
        themeName: ""
    });

    const updateState = useCallback((updates: Partial<ThemePreviewState>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);

    // Sync local preview with the selected theme from list
    useEffect(() => {
        const isCustom = (state.previewLayoutId || '').startsWith('custom-');

        if (isCustom) {
            const cleanId = (state.previewLayoutId || '').replace('custom-', '');
            const theme = customThemes.find(t => t.id === cleanId);
            if (!theme) return;
            
            const updates: Partial<ThemePreviewState> = { themeName: theme.name };
            if (theme.config) updates.config = theme.config;
            if (theme.animationStyle) updates.previewAnimationStyle = theme.animationStyle;
            if (theme.emojiSet) updates.previewEmojiSet = theme.emojiSet;
            
            updateState(updates);
            return;
        } 
        
        if (state.previewLayoutId) {
            const normalizedId = state.previewLayoutId.toLowerCase();
            const basePreset = BASE_PRESETS[normalizedId];
            
            if (basePreset) {
                const nativeKey = state.previewLayoutId.toUpperCase();
                const native = layouts[nativeKey];
                
                const updates: Partial<ThemePreviewState> = {
                    config: basePreset,
                    themeName: native?.name || state.previewLayoutId
                };
                
                if (native) {
                    updates.previewAnimationStyle = native.animation || 'standard';
                    updates.previewEmojiSet = native.emoji || 'none';
                }
                
                updateState(updates);
            }
        }
    }, [state.previewLayoutId, customThemes, layouts, updateState]);

    const handleConfigChange = useCallback((key: string, value: string) => {
        setState(prev => ({ 
            ...prev, 
            config: { ...prev.config, [key]: value } 
        }));
    }, []);

    return {
        previewLayoutId: state.previewLayoutId,
        setPreviewLayoutId: (v: string) => updateState({ previewLayoutId: v }),
        previewAnimationStyle: state.previewAnimationStyle,
        setPreviewAnimationStyle: (v: string) => updateState({ previewAnimationStyle: v }),
        previewEmojiSet: state.previewEmojiSet,
        setPreviewEmojiSet: (v: string) => updateState({ previewEmojiSet: v }),
        previewPrimaryColor: state.previewPrimaryColor,
        setPreviewPrimaryColor: (v: string) => updateState({ previewPrimaryColor: v }),
        previewFontScale: state.previewFontScale,
        setPreviewFontScale: (v: string) => updateState({ previewFontScale: v }),
        previewNavigationStyle: state.previewNavigationStyle,
        setPreviewNavigationStyle: (v: 'sidebar' | 'topbar') => updateState({ previewNavigationStyle: v }),
        previewSidebarWidth: state.previewSidebarWidth,
        setPreviewSidebarWidth: (v: number) => updateState({ previewSidebarWidth: v }),
        config: state.config,
        setConfig: (v: SarakDesignState) => updateState({ config: v }),
        themeName: state.themeName,
        setThemeName: (v: string) => updateState({ themeName: v }),
        handleConfigChange,
        state,
        updateState
    };
};
