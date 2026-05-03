import { useState, useEffect } from 'react';
import { BASE_PRESETS } from '../../../constants/theme-models';

export const useDesignDraft = (sarak: any) => {
    // Sincronização Unidirecional (v9.5)
    // Inicializamos o rascunho com o estado atual, mas evitamos resets reativos.
    const [draft, setDraft] = useState(() => ({
        layout: sarak.layout,
        mode: sarak.mode,
        primaryColor: sarak.primaryColor,
        secondaryColor: sarak.secondaryColor,
        tertiaryColor: sarak.tertiaryColor,
        navigationStyle: sarak.navigationStyle,
        sidebarWidth: sarak.sidebarWidth,
        fontScale: sarak.fontScale,
        layoutDensity: sarak.layoutDensity,
        headingFont: sarak.headingFont,
        subtitleFont: sarak.subtitleFont,
        bodyFont: sarak.bodyFont,
        headingWeight: sarak.headingWeight,
        headingLetterSpacing: sarak.headingLetterSpacing,
        borderRadius: sarak.borderRadius || { sm: 4, md: 8, lg: 12 },
        layoutGap: sarak.layoutGap || { sm: 8, md: 16, lg: 24 },
        cardPadding: sarak.cardPadding || { sm: 12, md: 24, lg: 32 },

        glassOpacity: sarak.glassOpacity,
        glassBlur: sarak.glassBlur,
        shadowIntensity: sarak.shadowIntensity,
        isGeometricCut: sarak.isGeometricCut,
        animationSpeed: sarak.animationSpeed,
        tabFont: sarak.tabFont,
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

        tabGap: sarak.tabGap || 12,
        tabSectionMargin: sarak.tabSectionMargin || 0,
        texture: sarak.texture || 'none',
        textureOpacity: sarak.textureOpacity || 0.05,
        textureColor: sarak.textureColor,
        scaleRatio: sarak.scaleRatio || 1.0,
        contrastCurve: sarak.contrastCurve || 1.0,
        layeredShadows: sarak.layeredShadows || 1.0,
        isNavHidden: sarak.isNavHidden ?? false,
        hoverLiftEnabled: sarak.hoverLiftEnabled ?? true,
        spotlightEnabled: sarak.spotlightEnabled ?? true,
        magneticPullEnabled: sarak.magneticPullEnabled ?? false,
        borderBeamEnabled: sarak.borderBeamEnabled ?? false,
        performanceMode: sarak.performanceMode || 'high',
        // --- Novos Campos de Soberania Industrial (v10.3) ---
        sidebarNoiseOpacity: sarak.sidebarNoiseOpacity ?? 0.08,
        topbarNoiseOpacity: sarak.topbarNoiseOpacity ?? 0.08,
        cardNoiseOpacity: sarak.cardNoiseOpacity ?? 0.08,
        sidebarHoverColor: sarak.sidebarHoverColor,
        sidebarActiveColor: sarak.sidebarActiveColor,
        topbarHoverColor: sarak.topbarHoverColor,
        topbarActiveColor: sarak.topbarActiveColor,
        cardHoverColor: sarak.cardHoverColor,
        cardActiveColor: sarak.cardActiveColor,
        // --- Campos Legados/Base ---
        colorDepth: sarak.colorDepth || 1,
        colorVariation: sarak.colorVariation || 1,
        sidebarColor: sarak.sidebarColor,
        topbarColor: sarak.topbarColor,
        cardBackgroundColor: sarak.cardBackgroundColor,
        cardBorderColor: sarak.cardBorderColor,
        buttonColor: sarak.buttonColor,
        buttonHoverColor: sarak.buttonHoverColor,
        titleColor: sarak.titleColor,
        successColor: sarak.successColor,
        warningColor: sarak.warningColor,
        errorColor: sarak.errorColor,
        atmosphereNoiseOpacity: sarak.atmosphereNoiseOpacity || 0.05
    }));

    const [toast, setToast] = useState<{ type: 'success' | 'warning', message: string } | null>(null);

    // --- RE-HYDRATION SYNC (v10.2) ---
    // Quando o objeto 'sarak' (manager) carregar dados reais (localStorage/Backend),
    // precisamos atualizar o rascunho para refletir esses dados, caso o rascunho ainda
    // esteja com os valores padrão de inicialização.
    useEffect(() => {
        if (!sarak || !sarak.primaryColor) return;

        setDraft(prev => {
            // Só atualizamos se as cores principais forem diferentes das que iniciamos 
            // ou se o sistema mudou o layout (indicando carregamento de preset)
            // Isso evita sobrescrever edições que o usuário começou a fazer logo no boot.
            if (prev.primaryColor !== sarak.primaryColor || 
                prev.mode !== sarak.mode || 
                prev.sidebarColor !== sarak.sidebarColor ||
                prev.textureColor !== sarak.textureColor) {
                return { ...prev, ...sarak };
            }
            return prev;
        });
    }, [sarak?.primaryColor, sarak?.mode, sarak?.sidebarColor, sarak?.textureColor]);

    const showToast = (type: 'success' | 'warning', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    const updateDraft = (key: string, value: any) => {
        setDraft(prev => ({ 
            ...prev, 
            [key]: value,
            // Detach from preset theme if any visual property is changed
            layout: key === 'layout' ? value : 'custom'
        }));
    };

    const handleThemePreview = (id: string) => {
        const presetKey = Object.keys(BASE_PRESETS).find(k => k.toLowerCase() === id.toLowerCase());
        const originalPreset = presetKey ? (BASE_PRESETS as any)[presetKey] : null;
        
        // Deep clone the preset to prevent mutation of the original constants
        const preset = originalPreset ? JSON.parse(JSON.stringify(originalPreset)) : null;

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
            cardPadding: 'number', dashboardTemplate: 'string', cardTexture: 'string',
            hoverLiftEnabled: 'boolean', spotlightEnabled: 'boolean', magneticPullEnabled: 'boolean',
            borderBeamEnabled: 'boolean', performanceMode: 'string'
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
            '--card-texture': 'cardTexture',
            '--hover-lift': 'hoverLiftEnabled', '--spotlight-enabled': 'spotlightEnabled',
            '--magnetic-pull': 'magneticPullEnabled', '--border-beam': 'borderBeamEnabled',
            '--perf-mode': 'performanceMode'
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
