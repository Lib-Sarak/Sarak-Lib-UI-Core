import { useState, useEffect } from 'react';
import { BASE_PRESETS } from '@sarak/shared';

export const useThemePreview = (
    currentLayout,
    globalAnimationStyle,
    globalEmojiSet,
    primaryColor,
    fontScale,
    navigationStyle,
    sidebarWidth,
    customThemes,
    layouts
) => {
    const [previewLayoutId, setPreviewLayoutId] = useState(currentLayout);
    const [previewAnimationStyle, setPreviewAnimationStyle] = useState(globalAnimationStyle);
    const [previewEmojiSet, setPreviewEmojiSet] = useState(globalEmojiSet);
    const [previewPrimaryColor, setPreviewPrimaryColor] = useState(primaryColor);
    const [previewFontScale, setPreviewFontScale] = useState(fontScale);
    const [previewNavigationStyle, setPreviewNavigationStyle] = useState(navigationStyle);
    const [previewSidebarWidth, setPreviewSidebarWidth] = useState(sidebarWidth);

    const [config, setConfig] = useState(
        BASE_PRESETS[currentLayout.toLowerCase()] ||
        (currentLayout.startsWith('custom-') ? customThemes[currentLayout.replace('custom-', '')]?.config : null) ||
        BASE_PRESETS.glass
    );

    const [themeName, setThemeName] = useState("");

    useEffect(() => {
        const isCustom = previewLayoutId.startsWith('custom-');

        if (isCustom) {
            const cleanId = previewLayoutId.replace('custom-', '');
            const theme = customThemes[cleanId];
            if (theme) {
                if (theme.config) setConfig(theme.config);
                setThemeName(theme.name);
                if (theme.animationStyle) setPreviewAnimationStyle(theme.animationStyle);
                if (theme.emojiSet) setPreviewEmojiSet(theme.emojiSet);
            }
        } else {
            const normalizedId = previewLayoutId.toLowerCase();
            if (BASE_PRESETS[normalizedId]) {
                setConfig(BASE_PRESETS[normalizedId]);
                const nativeKey = previewLayoutId.toUpperCase();
                const native = layouts[nativeKey];
                setThemeName(native?.name || previewLayoutId);
                if (native) {
                    setPreviewAnimationStyle(native.animation || 'standard');
                    setPreviewEmojiSet(native.emoji || 'none');
                }
            }
        }
    }, [previewLayoutId, customThemes, layouts]);

    const handleConfigChange = (key, value) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    return {
        previewLayoutId, setPreviewLayoutId,
        previewAnimationStyle, setPreviewAnimationStyle,
        previewEmojiSet, setPreviewEmojiSet,
        previewPrimaryColor, setPreviewPrimaryColor,
        previewFontScale, setPreviewFontScale,
        previewNavigationStyle, setPreviewNavigationStyle,
        previewSidebarWidth, setPreviewSidebarWidth,
        config, setConfig,
        themeName, setThemeName,
        handleConfigChange
    };
};
