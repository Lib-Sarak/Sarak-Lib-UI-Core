import { useState, useEffect } from 'react';
import { BASE_PRESETS } from '../../../constants/theme-models';

export const useDesignDraft = (sarak: any) => {
    const [draft, setDraft] = useState({
        layout: sarak.layout,
        mode: sarak.mode,
        primaryColor: sarak.primaryColor,
        navigationStyle: sarak.navigationStyle,
        sidebarWidth: sarak.sidebarWidth,
        fontScale: sarak.fontScale,
        layoutDensity: sarak.layoutDensity,
        headingFont: sarak.headingFont,
        subtitleFont: sarak.subtitleFont,
        bodyFont: sarak.bodyFont,
        headingWeight: sarak.headingWeight,
        headingLetterSpacing: sarak.headingLetterSpacing,
        borderRadius: sarak.borderRadius,
        borderWidth: sarak.borderWidth,
        borderStyle: sarak.borderStyle,
        glassOpacity: sarak.glassOpacity,
        glassBlur: sarak.glassBlur,
        shadowIntensity: sarak.shadowIntensity,
        isGeometricCut: sarak.isGeometricCut,
        animationSpeed: sarak.animationSpeed,
        tabFont: sarak.tabFont,
        layoutGap: sarak.layoutGap,
        systemName: sarak.systemName,
        logoUrl: sarak.logoUrl,
        logoDarkUrl: sarak.logoDarkUrl,
        logoScale: sarak.logoScale,
        logoPosition: sarak.logoPosition,
        systemTone: sarak.systemTone,
        emptyStateId: sarak.emptyStateId,
        surfaceMaterial: sarak.surfaceMaterial,
        borderType: sarak.borderType,
        interfaceElasticity: sarak.interfaceElasticity,
        isSplitViewEnabled: sarak.isSplitViewEnabled,
        secondaryModuleId: sarak.secondaryModuleId,
        searchStyle: sarak.searchStyle,
        chartPalette: sarak.chartPalette,
        chartStyle: sarak.chartStyle,
        shadowOrientation: sarak.shadowOrientation,
        shadowColorMode: sarak.shadowColorMode,
        isAutoHideEnabled: sarak.isAutoHideEnabled,
        chatBubbleStyle: sarak.chatBubbleStyle || 'glass',
        chatAnimationSpeed: sarak.chatAnimationSpeed || 0.05,
        flowGridStyle: sarak.flowGridStyle || 'dots',
        flowNodeRadius: sarak.flowNodeRadius || 12,
        chartShowGrid: sarak.chartShowGrid ?? true,
        chartType: sarak.chartType || 'bar',
        chartThickness: sarak.chartThickness || 2,
        chartSmoothing: sarak.chartSmoothing ?? true,
        cardPadding: sarak.cardPadding || 24,
        tabGap: sarak.tabGap || 12,
        tabSectionMargin: sarak.tabSectionMargin || 0,
        texture: sarak.texture || 'none',
        textureOpacity: sarak.textureOpacity || 0.05,
        scaleRatio: sarak.scaleRatio || 1.0,
        contrastCurve: sarak.contrastCurve || 1.0,
        layeredShadows: sarak.layeredShadows || 1.0
    });

    const [toast, setToast] = useState<{ type: 'success' | 'warning', message: string } | null>(null);

    useEffect(() => {
        if (sarak.isHydrated) {
            setDraft({
                ...draft,
                ...sarak,
                chatBubbleStyle: sarak.chatBubbleStyle || 'glass',
                chatAnimationSpeed: sarak.chatAnimationSpeed || 0.05,
                flowGridStyle: sarak.flowGridStyle || 'dots',
                flowNodeRadius: sarak.flowNodeRadius || 12,
                chartShowGrid: sarak.chartShowGrid ?? true,
                chartType: sarak.chartType || 'bar',
                chartThickness: sarak.chartThickness || 2,
                chartSmoothing: sarak.chartSmoothing ?? true,
                cardPadding: sarak.cardPadding || 24,
                tabGap: sarak.tabGap || 12,
                tabSectionMargin: sarak.tabSectionMargin || 0,
                texture: sarak.texture || 'none',
                textureOpacity: sarak.textureOpacity || 0.05,
                scaleRatio: sarak.scaleRatio || 1.0,
                contrastCurve: sarak.contrastCurve || 1.0,
                layeredShadows: sarak.layeredShadows || 1.0
            });
        }
    }, [sarak.isHydrated]);

    const showToast = (type: 'success' | 'warning', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    const updateDraft = (key: string, value: any) => {
        setDraft(prev => ({ ...prev, [key]: value }));
    };

    const handleThemePreview = (id: string) => {
        const presetKey = Object.keys(BASE_PRESETS).find(k => k.toLowerCase() === id.toLowerCase());
        const preset = presetKey ? (BASE_PRESETS as any)[presetKey] : null;

        if (!preset) return;

        const TOKEN_SCHEMA: Record<string, 'number' | 'boolean' | 'string' | 'array'> = {
            navigationStyle: 'string', sidebarWidth: 'number', layoutDensity: 'string', isAutoHideEnabled: 'boolean',
            isSplitViewEnabled: 'boolean', secondaryModuleId: 'string', searchStyle: 'string',
            headingFont: 'string', subtitleFont: 'string', tabFont: 'string', bodyFont: 'string',
            headingWeight: 'string', headingLetterSpacing: 'string', fontScale: 'string',
            borderRadius: 'number', borderWidth: 'number', borderStyle: 'string',
            surfaceMaterial: 'string', borderType: 'string', layoutGap: 'number',
            glassOpacity: 'number', glassBlur: 'number', isGeometricCut: 'boolean',
            interfaceElasticity: 'number', tabGap: 'number', tabSectionMargin: 'number',
            texture: 'string', textureOpacity: 'number', primaryColor: 'string',
            systemName: 'string', logoUrl: 'string', logoDarkUrl: 'string', logoScale: 'number',
            logoPosition: 'string', systemTone: 'string', emptyStateId: 'string',
            chartStyle: 'string', chartPalette: 'array',
            shadowIntensity: 'number', shadowOrientation: 'string', shadowColorMode: 'string',
            animationSpeed: 'number', mode: 'string',
            scaleRatio: 'number', contrastCurve: 'number', layeredShadows: 'number',
            cardPadding: 'number', layoutGap: 'number', dashboardTemplate: 'string',
            cardTexture: 'string', borderType: 'string'
        };

        const tokenMap: Record<string, string> = {
            '--nav-style': 'navigationStyle', '--sidebar-width': 'sidebarWidth', '--layout-density': 'layoutDensity', '--auto-hide': 'isAutoHideEnabled',
            '--split-view': 'isSplitViewEnabled', '--secondary-module': 'secondaryModuleId', '--search-style': 'searchStyle',
            '--font-heading': 'headingFont', '--font-subtitle': 'subtitleFont', '--font-tab': 'tabFont', '--font-main': 'bodyFont',
            '--font-weight-heading': 'headingWeight', '--letter-spacing-heading': 'headingLetterSpacing', '--font-scale': 'fontScale',
            '--radius-theme': 'borderRadius', '--border-width': 'borderWidth', '--border-style': 'borderStyle',
            '--surface-material': 'surfaceMaterial', '--border-type': 'borderType', '--theme-gap': 'layoutGap',
            '--glass-opacity': 'glassOpacity', '--glass-blur': 'glassBlur', '--is-geometric': 'isGeometricCut',
            '--interface-elasticity': 'interfaceElasticity', '--bg-texture': 'texture', '--texture-opacity': 'textureOpacity', 
            '--theme-primary': 'primaryColor', '--tab-gap': 'tabGap', '--tab-section-margin': 'tabSectionMargin',
            '--system-name': 'systemName', '--logo-url': 'logoUrl', '--logo-dark-url': 'logoDarkUrl', '--logo-scale': 'logoScale',
            '--logo-position': 'logoPosition', '--system-tone': 'systemTone', '--empty-state-id': 'emptyStateId',
            '--chart-style': 'chartStyle', '--chart-palette': 'chartPalette',
            '--shadow-intensity': 'shadowIntensity', '--shadow-orientation': 'shadowOrientation', '--shadow-color-mode': 'shadowColorMode',
            '--animation-speed': 'animationSpeed', '--mode': 'mode',
            '--scale-ratio': 'scaleRatio', '--contrast-curve': 'contrastCurve', '--layered-shadows': 'layeredShadows',
            '--card-padding': 'cardPadding', '--layout-gap': 'layoutGap', '--dashboard-template': 'dashboardTemplate',
            '--card-texture': 'cardTexture', '--border-type': 'borderType'
        };

        const newDraft = { ...draft, layout: id };

        Object.entries(preset).forEach(([key, value]) => {
            const draftKey = TOKEN_SCHEMA[key] ? key : tokenMap[key];
            if (draftKey) {
                const targetType = TOKEN_SCHEMA[draftKey];
                let finalValue: any = value;

                switch(targetType) {
                    case 'number':
                        const rawStr = typeof value === 'string' ? value.replace(/[^\d.-]/g, '') : value;
                        finalValue = parseFloat(rawStr as string);
                        if (isNaN(finalValue)) finalValue = 0;
                        break;
                    case 'boolean':
                        finalValue = (value === 'true' || value === '1' || value === 1 || value === true);
                        break;
                    case 'array':
                        if (typeof value === 'string') finalValue = value.split(',').map(s => s.trim());
                        break;
                    default:
                        if (typeof value === 'object' && value !== null) {
                            finalValue = (value as any).id || (value as any).family || (value as any).name || (value as any).value || String(value);
                        } else {
                            finalValue = String(value);
                        }
                        break;
                }
                (newDraft as any)[draftKey] = finalValue;
            }
        });

        if (newDraft.mode === 'dark' || preset.mode === 'dark' || preset['--mode'] === 'dark') {
            newDraft.mode = 'dark';
        }

        setDraft(newDraft);
    };

    const handleApplyToSystem = () => {
        if (sarak.applyFullConfig) {
            sarak.applyFullConfig(draft);
            showToast('success', 'Design aplicado com sucesso a todo o sistema.');
        }
    };

    return {
        draft,
        updateDraft,
        handleThemePreview,
        handleApplyToSystem,
        toast,
        showToast
    };
};
