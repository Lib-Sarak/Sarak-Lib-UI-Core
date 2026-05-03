import { computeColorVariants } from './utils/color-engine';

/**
 * SOVEREIGN DESIGN MANIFEST (v10.1)
 * 
 * O Manifesto é a única fonte de verdade para como os tokens de design
 * são mapeados para variáveis CSS, Atributos de DOM e Classes.
 */
export const DESIGN_MANIFEST: Record<string, {
    vars?: string[],
    unit?: string,
    transform?: (v: any) => any,
    attr?: string,
    classPrefix?: string
}> = {
    layout: { vars: ['--sarak-layout', '--layout-theme'], classPrefix: 'layout-' },
    mode: { vars: ['--sarak-mode', '--mode-theme'], transform: (v: any) => v === 'dark' ? 'dark' : 'light' },
    colorPalette: {
        vars: ['--sarak-palette'],
        attr: 'data-palette',
        transform: (v: string) => v
    },
    primaryColor: {
        vars: ['--primary-color', '--theme-primary', '--sarak-primary-color'],
        transform: (v: string) => computeColorVariants(v, '#3b82f6')
    },
    secondaryColor: {
        vars: ['--secondary-color', '--theme-secondary', '--sarak-secondary-color'],
        transform: (v: string) => computeColorVariants(v, '#6366f1')
    },
    tertiaryColor: {
        vars: ['--tertiary-color', '--theme-tertiary', '--sarak-tertiary-color'],
        transform: (v: string) => computeColorVariants(v, '#10b981')
    },
    colorDepth: { vars: ['--sarak-color-depth'], attr: 'data-color-depth', transform: (v) => parseInt(v) || 1 },
    colorVariation: { vars: ['--sarak-color-variation'], attr: 'data-color-variation', transform: (v) => parseInt(v) || 1 },
    accentColor: {
        vars: ['--theme-accent', '--sarak-accent-color'],
        transform: (v: string) => computeColorVariants(v, '#f43f5e')
    },
    surfaceColor: {
        vars: ['--theme-surface', '--sarak-surface-color'],
        transform: (v: string) => computeColorVariants(v, '#1e293b')
    },
    errorColor: {
        vars: ['--theme-error', '--sarak-error-color'],
        transform: (v: string) => computeColorVariants(v, '#ef4444')
    },
    successColor: {
        vars: ['--theme-success', '--sarak-success-color'],
        transform: (v: string) => computeColorVariants(v, '#10b981')
    },
    warningColor: {
        vars: ['--theme-warning', '--sarak-warning-color'],
        transform: (v: string) => computeColorVariants(v, '#f59e0b')
    },
    textureColor: {
        vars: ['--theme-texture-color', '--sarak-texture-color'],
        transform: (v: string) => computeColorVariants(v, '#ffffff')
    },
    sidebarColor: {
        vars: ['--theme-sidebar-bg', '--sarak-sidebar-bg'],
        transform: (v: string) => computeColorVariants(v, '#000000')
    },
    topbarColor: {
        vars: ['--theme-topbar-bg', '--sarak-topbar-bg'],
        transform: (v: string) => computeColorVariants(v, '#000000')
    },
    cardBackgroundColor: {
        vars: ['--theme-card-bg', '--sarak-card-bg'],
        transform: (v: string) => computeColorVariants(v, 'rgba(30, 41, 59, 0.4)')
    },
    cardBorderColor: {
        vars: ['--theme-card-border', '--sarak-card-border'],
        transform: (v: string) => computeColorVariants(v, 'rgba(255, 255, 255, 0.1)')
    },
    buttonColor: {
        vars: ['--theme-button-bg', '--sarak-button-bg'],
        transform: (v: string) => computeColorVariants(v, '#3b82f6')
    },
    buttonHoverColor: {
        vars: ['--theme-button-hover', '--sarak-button-hover'],
        transform: (v: string) => computeColorVariants(v, '#60a5fa')
    },
    titleColor: {
        vars: ['--theme-title-color', '--sarak-title-color'],
        transform: (v: string) => computeColorVariants(v, '#ffffff')
    },
    layoutDensity: { vars: ['--sarak-layout-density', '--density-theme'], classPrefix: 'density-' },
    texture: { vars: ['--sarak-texture', '--texture-theme'], classPrefix: 'texture-', attr: 'data-texture' },
    navigationStyle: { vars: ['--sarak-navigation-style', '--sarak-nav-style', '--nav-style'], classPrefix: 'nav-' },
    sidebarWidth: { vars: ['--sidebar-width', '--sarak-sidebar-width'], unit: 'px' },
    headingFont: { vars: ['--font-heading', '--sarak-heading-font'] },
    subtitleFont: { vars: ['--font-subtitle', '--sarak-subtitle-font'] },
    tabFont: { vars: ['--font-tab', '--sarak-tab-font'] },
    bodyFont: { vars: ['--font-main', '--sarak-body-font'] },
    headingWeight: { vars: ['--heading-weight', '--sarak-heading-weight'] },
    headingLetterSpacing: {
        vars: ['--heading-spacing', '--sarak-heading-spacing'],
        transform: (v) => (({ tight: '-0.05em', normal: '0', wide: '0.1em', widest: '0.25em' } as any)[v] || v)
    },
    borderRadius: { vars: ['--radius-theme', '--sarak-border-radius', '--border-radius'], unit: 'px' },
    borderRadiusSm: { vars: ['--sarak-border-radius-sm'], unit: 'px' },
    borderRadiusMd: { vars: ['--sarak-border-radius-md'], unit: 'px' },
    borderRadiusLg: { vars: ['--sarak-border-radius-lg'], unit: 'px' },

    borderWidth: { vars: ['--theme-border-width', '--border-width', '--sarak-border-width'], unit: 'px' },
    borderStyle: { vars: ['--border-style', '--sarak-border-style'] },
    
    layoutGap: { vars: ['--theme-gap', '--sarak-layout-gap'], unit: 'px' },
    layoutGapSm: { vars: ['--sarak-layout-gap-sm'], unit: 'px' },
    layoutGapMd: { vars: ['--sarak-layout-gap-md'], unit: 'px' },
    layoutGapLg: { vars: ['--sarak-layout-gap-lg'], unit: 'px' },

    glassOpacity: { vars: ['--glass-opacity', '--sarak-glass-opacity', '--sarak-bg-opacity'] },
    glassBlur: { vars: ['--glass-blur', '--sarak-glass-blur'], unit: 'px' },
    glassSaturation: { vars: ['--sarak-glass-saturation', '--theme-glass-saturation'], unit: '%' },
    contrastCurve: { vars: ['--contrast-curve', '--sarak-contrast-curve'], transform: (v) => parseFloat(v) || 1.0 },
    shadowIntensity: { vars: ['--shadow-intensity', '--sarak-shadow-intensity'] },
    
    cardPadding: { vars: ['--card-padding', '--sarak-card-padding', '--theme-card-padding'], unit: 'px' },
    cardPaddingSm: { vars: ['--sarak-card-padding-sm'], unit: 'px' },
    cardPaddingMd: { vars: ['--sarak-card-padding-md'], unit: 'px' },
    cardPaddingLg: { vars: ['--sarak-card-padding-lg'], unit: 'px' },

    cardTexture: { vars: ['--sarak-card-texture'], attr: 'data-card-texture' },
    tabGap: { vars: ['--tab-gap', '--sarak-tab-gap', '--theme-tab-gap'], unit: 'px' },
    tabSectionMargin: { vars: ['--tab-section-margin', '--sarak-tab-section-margin', '--theme-tab-section-margin', '--safe-area-padding'], unit: 'px' },
    isGeometricCut: { classPrefix: 'is-geometric', attr: 'data-geometric' },
    textureOpacity: { vars: ['--texture-opacity', '--sarak-texture-opacity', '--theme-texture-opacity'] },
    animationSpeed: { vars: ['--animation-speed', '--sarak-animation-speed', '--transition-speed'], unit: 's' },
    surfaceMaterial: { attr: 'data-surface', vars: ['--sarak-surface', '--surface-material'] },
    surfaceIntensity: { vars: ['--surface-intensity', '--sarak-surface-intensity'] },
    borderType: { attr: 'data-border', vars: ['--sarak-border-type', '--border-type'] },
    systemTone: { vars: ['--sarak-system-tone'], attr: 'data-tone' },
    isAutoHideEnabled: { attr: 'data-auto-hide' },
    shadowOrientation: { vars: ['--shadow-orientation'], attr: 'data-shadow-orientation' },
    shadowColorMode: { vars: ['--shadow-color-mode'], attr: 'data-shadow-color-mode' },
    systemName: { attr: 'data-system-name' },
    logoUrl: { attr: 'data-logo-url' },
    logoDarkUrl: { attr: 'data-logo-dark' },
    logoScale: { vars: ['--logo-scale'], transform: (v) => v || 1.0 },
    logoPosition: { attr: 'data-logo-position' },
    interfaceElasticity: { vars: ['--sarak-elasticity'] },
    isSplitViewEnabled: { attr: 'data-split-view' },
    chartStyle: { attr: 'data-chart-style' },
    chartPalette: { vars: ['--chart-palette'], transform: (v) => Array.isArray(v) ? v.join(',') : v },
    cardSpotlight: {
        vars: ['--spotlight-opacity'],
        transform: (v: any) => parseFloat(v) || 0
    },

    borderBeamEnabled: { attr: 'data-border-beam' },
    secondaryModuleId: { attr: 'data-sec-module' },
    hoverLiftEnabled: { attr: 'data-hover-lift' },
    spotlightEnabled: { attr: 'data-spotlight' },
    magneticPullEnabled: { attr: 'data-magnetic' },
    performanceMode: { attr: 'data-perf-mode' },

    fontScale: {
        vars: ['--sarak-font-scale', '--sarak-font-size', '--font-size-factor', '--theme-font-size-base'],
        attr: 'data-font-scale',
        transform: (v: string) => {
            const scales: any = {
                'pp': { px: '10px', factor: '0.7' },
                'p': { px: '12px', factor: '0.85' },
                'm': { px: '14px', factor: '1.0' },
                'g': { px: '16px', factor: '1.25' },
                'gg': { px: '20px', factor: '1.5' }
            };
            return scales[v] || scales['m'];
        }
    },
    scaleRatio: {
        vars: ['--sarak-scale-ratio'],
        transform: (v) => {
            const ratio = parseFloat(v) || 1.0;
            return {
                ratio,
                gap: `${1.25 * ratio}rem`,
                pad: `${1.5 * ratio}rem`,
                margin: `${1 * ratio}rem`,
                radius: `${12 * ratio}px`
            };
        }
    },

    layeredShadows: {
        vars: ['--sarak-layered-shadows'],
        transform: (v) => {
            const intensity = parseFloat(v) || 1.0;
            return `0 2px 4px rgba(0,0,0,${0.05 * intensity}), 
                    0 4px 8px rgba(0,0,0,${0.05 * intensity}), 
                    0 8px 16px rgba(0,0,0,${0.05 * intensity}), 
                    0 16px 32px rgba(0,0,0,${0.05 * intensity})`;
        }
    },
    chatBubbleStyle: { attr: 'data-chat-bubble', vars: ['--sarak-chat-bubble'] },
    chatAnimationSpeed: { vars: ['--sarak-chat-anim-speed'] },
    flowGridStyle: { attr: 'data-flow-grid', vars: ['--sarak-flow-grid'] },
    flowNodeRadius: { vars: ['--sarak-flow-radius'], unit: 'px' },
    chartShowGrid: { attr: 'data-chart-grid' },
    chartType: { attr: 'data-chart-type' },
    chartThickness: { vars: ['--sarak-chart-thickness'], unit: 'px' },
    chartSmoothing: { attr: 'data-chart-smoothing' },
    buttonHoverEffect: { attr: 'data-button-hover', vars: ['--sarak-button-hover'] },
    inputStyle: { attr: 'data-input-style', vars: ['--sarak-input-style'] },
    
    // Hyper-Granular Interaction Tokens
    sidebarHoverColor: { vars: ['--sarak-sidebar-hover-color'], transform: (v: string) => computeColorVariants(v, 'transparent') },
    sidebarActiveColor: { vars: ['--sarak-sidebar-active-color'], transform: (v: string) => computeColorVariants(v, 'transparent') },
    topbarHoverColor: { vars: ['--sarak-topbar-hover-color'], transform: (v: string) => computeColorVariants(v, 'transparent') },
    topbarActiveColor: { vars: ['--sarak-topbar-active-color'], transform: (v: string) => computeColorVariants(v, 'transparent') },
    cardHoverColor: { vars: ['--sarak-card-hover-color'], transform: (v: string) => computeColorVariants(v, 'transparent') },
    cardActiveColor: { vars: ['--sarak-card-active-color'], transform: (v: string) => computeColorVariants(v, 'transparent') },

    // Hyper-Granular Layer Textures
    sidebarNoiseOpacity: { vars: ['--sarak-sidebar-noise-opacity'] },
    topbarNoiseOpacity: { vars: ['--sarak-topbar-noise-opacity'] },
    cardNoiseOpacity: { vars: ['--sarak-card-noise-opacity'] },

    atmosphereNoiseOpacity: { vars: ['--sarak-noise-opacity', '--theme-noise-opacity'] },

    iconStrokeWidth: { vars: ['--sarak-icon-stroke', '--theme-icon-stroke'], unit: 'px' },
    maxContentWidth: { vars: ['--sarak-max-width', '--theme-max-width'] },
    useTabularNums: { attr: 'data-tabular-nums', vars: ['--sarak-tabular-nums'], transform: (v) => v ? 'tabular-nums' : 'normal' },
    hapticIntensity: { vars: ['--haptic-intensity', '--sarak-haptic-scale'], transform: (v) => 1 - (parseFloat(v) || 0.02) },
    scrollbarStyle: { vars: ['--sarak-scrollbar-width'], unit: 'px', attr: 'data-scrollbar-style' },
    fluidScaling: {
        vars: ['--sarak-fluid-scale'],
        transform: (v) => {
            const factor = parseFloat(v) || 1.0;
            return {
                base: `clamp(12px, ${0.8 * factor}vw + 8px, ${20 * factor}px)`,
                gap: `clamp(10px, ${1 * factor}vw + 4px, ${32 * factor}px)`,
                padding: `clamp(16px, ${1.5 * factor}vw + 8px, ${48 * factor}px)`
            };
        }
    },
    isNavHidden: { vars: ['--is-nav-hidden'], attr: 'data-nav-hidden' },
    sidebarMinWidth: { vars: ['--sidebar-min-width'], transform: (v) => parseFloat(v) || 200 },
    sidebarMaxWidth: { vars: ['--sidebar-max-width'], transform: (v) => parseFloat(v) || 450 }
};
