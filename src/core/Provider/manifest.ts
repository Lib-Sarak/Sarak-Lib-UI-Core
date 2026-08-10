import { computeColorVariants } from './utils/color-engine';
import {
    transformFontScale,
    transformLayeredShadows
} from './utils/manifest-transformers';
import type { SarakTokenValue } from '../Design/types';

/**
 * SOVEREIGN DESIGN MANIFEST (v10.1)
 * 
 * O Manifesto é a única fonte de verdade para como os tokens de design
 * são mapeados para variáveis CSS, Atributos de DOM e Classes.
 */
export const DESIGN_MANIFEST: Record<string, {
    vars?: string[],
    unit?: string,
    transform?: (v: SarakTokenValue) => string | number | Record<string, string | number>,
    attr?: string,
    classPrefix?: string
}> = {
    layout: { vars: ['--sarak-layout', '--layout-theme'], classPrefix: 'layout-' },
    mode: { vars: ['--sarak-mode', '--mode-theme'], transform: (v: SarakTokenValue) => v === 'dark' ? 'dark' : 'light' },
    colorPalette: {
        vars: ['--sarak-palette'],
        attr: 'data-palette',
        transform: (v: SarakTokenValue) => String(v)
    },
    primaryColor: {
        vars: ['--primary-color', '--theme-primary', '--sarak-primary-color'],
        transform: (v: SarakTokenValue) => computeColorVariants(String(v), '#3b82f6')
    },
    secondaryColor: {
        vars: ['--secondary-color', '--theme-secondary', '--sarak-secondary-color'],
        transform: (v: SarakTokenValue) => computeColorVariants(String(v), '#6366f1')
    },
    tertiaryColor: {
        vars: ['--tertiary-color', '--theme-tertiary', '--sarak-tertiary-color'],
        transform: (v: SarakTokenValue) => computeColorVariants(String(v), '#10b981')
    },
    colorDepth: { vars: ['--sarak-color-depth'], attr: 'data-color-depth', transform: (v: SarakTokenValue) => parseInt(String(v)) || 1 },
    colorVariation: { vars: ['--sarak-color-variation'], attr: 'data-color-variation', transform: (v: SarakTokenValue) => parseInt(String(v)) || 1 },
    accentColor: {
        vars: ['--theme-accent', '--sarak-accent-color'],
        transform: (v: SarakTokenValue) => computeColorVariants(String(v), '#f43f5e')
    },
    surfaceColor: {
        vars: ['--theme-surface', '--sarak-surface-color'],
        transform: (v: SarakTokenValue) => computeColorVariants(String(v), '#1e293b')
    },
    errorColor: {
        vars: ['--theme-error', '--sarak-error-color'],
        transform: (v: SarakTokenValue) => computeColorVariants(String(v), '#ef4444')
    },
    successColor: {
        vars: ['--theme-success', '--sarak-success-color'],
        transform: (v: SarakTokenValue) => computeColorVariants(String(v), '#10b981')
    },
    warningColor: {
        vars: ['--theme-warning', '--sarak-warning-color'],
        transform: (v: SarakTokenValue) => computeColorVariants(String(v), '#f59e0b')
    },
    textureColor: {
        vars: ['--theme-texture-color', '--sarak-texture-color'],
        transform: (v: SarakTokenValue) => computeColorVariants(String(v), '#ffffff')
    },
    sidebarColor: {
        vars: ['--theme-sidebar-bg', '--sarak-sidebar-bg'],
        transform: (v: SarakTokenValue) => computeColorVariants(String(v), '#000000')
    },
    topbarColor: {
        vars: ['--theme-topbar-bg', '--sarak-topbar-bg'],
        transform: (v: SarakTokenValue) => computeColorVariants(String(v), '#000000')
    },
    cardBackgroundColor: {
        vars: ['--theme-card-bg', '--sarak-card-bg'],
        transform: (v: SarakTokenValue) => computeColorVariants(String(v), 'rgba(30, 41, 59, 0.4)')
    },
    cardBorderColor: {
        vars: ['--theme-card-border', '--sarak-card-border'],
        transform: (v: SarakTokenValue) => computeColorVariants(String(v), 'rgba(255, 255, 255, 0.1)')
    },
    titleColor: {
        vars: ['--theme-title-color', '--sarak-title-color'],
        transform: (v: SarakTokenValue) => computeColorVariants(String(v), '#ffffff')
    },
    layoutDensity: { vars: ['--sarak-layout-density', '--density-theme'], classPrefix: 'density-' },
    texture: { vars: ['--sarak-texture', '--texture-theme'], classPrefix: 'texture-', attr: 'data-texture' },
    navigationStyle: { vars: ['--sarak-navigation-style', '--sarak-nav-style', '--nav-style'], classPrefix: 'nav-' },
    sidebarWidth: { vars: ['--sidebar-width', '--sarak-sidebar-width'], unit: 'px' },
    headingFont: { vars: ['--font-heading', '--sarak-heading-font'] },
    bodyFont: { vars: ['--font-main', '--sarak-body-font'] },
    fontLineHeight: { vars: ['--line-height', '--sarak-line-height'] },

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
    contrastCurve: { vars: ['--contrast-curve', '--sarak-contrast-curve'], transform: (v: SarakTokenValue) => parseFloat(String(v)) || 1.0 },
    shadowIntensity: { vars: ['--shadow-intensity', '--sarak-shadow-intensity'] },
    
    cardPaddingMd: { vars: ['--sarak-card-padding-md'], unit: 'px' },

    tabGap: { vars: ['--tab-gap', '--sarak-tab-gap', '--theme-tab-gap'], unit: 'px' },
    tabSectionMargin: { vars: ['--tab-section-margin', '--sarak-tab-section-margin', '--theme-tab-section-margin', '--safe-area-padding'], unit: 'px' },
    textureOpacity: { vars: ['--texture-opacity', '--sarak-texture-opacity', '--theme-texture-opacity'] },
    // `animationSpeed` (`--animation-speed`/`--sarak-animation-speed`/`--transition-speed`) foi
    // REMOVIDA aqui (plan-21, 2026-08-10): nenhum token de schema corresponde ao conceito, e
    // há 4 candidatos plausíveis (motionDurationInstant/Fast/Normal/Slow) sem um único alvo
    // óbvio por consumidor — decisão de qual duração vale para cada um dos 3 sites que ainda
    // consomem essas vars (SarakChart.tsx:75, SarakManagementGrid.tsx:95, _utilities.css:21)
    // é do dono (R11 — Expansão ou redirecionamento deliberado), não do executor. Os 3 sites
    // continuam consumindo o fallback local (não tocados); `ghostvars` continua acusando os
    // 3 consumos até essa decisão.
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
    logoPosition: { attr: 'data-logo-position' },
    // `interfaceElasticity` (`--sarak-elasticity`) foi REMOVIDA aqui (plan-21, 2026-08-10):
    // nenhum token de schema corresponde ao conceito de "elasticidade" — busca no schema
    // inteiro não achou nada. Continua consumida (fallback numérico `0.2`, sem cadeia de
    // var) em `src/styles/_base.css:58-59` (curva/escala elástica) — SEM alvo para
    // redirecionar. Criar o token é Expansão (R11), decisão do dono; não tocado aqui.
    isSplitViewEnabled: { attr: 'data-split-view' },
    chartStyle: { attr: 'data-chart-style' },
    cardSpotlightOpacity: {
        vars: ['--spotlight-opacity'],
        transform: (v: SarakTokenValue) => parseFloat(String(v)) || 0
    },
    cardBorderRadius: { vars: ['--card-radius', '--sarak-card-radius'], unit: 'px' },

    borderBeamEnabled: { attr: 'data-border-beam' },
    secondaryModuleId: { attr: 'data-sec-module' },
    hoverLiftEnabled: { attr: 'data-hover-lift' },
    spotlightEnabled: { attr: 'data-spotlight' },
    magneticPullEnabled: { attr: 'data-magnetic' },
    performanceMode: { attr: 'data-perf-mode' },

    fontScale: {
        vars: ['--sarak-font-scale', '--sarak-font-size', '--font-size-factor', '--theme-font-size-base'],
        attr: 'data-font-scale',
        transform: (v: SarakTokenValue) => transformFontScale(String(v)) as unknown as string
    },
    layeredShadows: {
        vars: ['--sarak-layered-shadows'],
        transform: (v: SarakTokenValue) => String(transformLayeredShadows(String(v)))
    },
    chatBubbleStyle: { attr: 'data-chat-bubble', vars: ['--sarak-chat-bubble'] },
    chatAnimationSpeed: { vars: ['--sarak-chat-anim-speed'] },
    flowGridStyle: { attr: 'data-flow-grid', vars: ['--sarak-flow-grid'] },
    flowNodeRadius: { vars: ['--sarak-flow-radius'], unit: 'px' },
    chartShowGrid: { attr: 'data-chart-grid' },
    chartType: { attr: 'data-chart-type' },
    chartThickness: { vars: ['--sarak-chart-thickness'], unit: 'px' },
    chartSmoothing: { attr: 'data-chart-smoothing' },

    // Hyper-Granular Interaction Tokens
    sidebarHoverColor: { vars: ['--sarak-sidebar-hover-color'], transform: (v: SarakTokenValue) => computeColorVariants(String(v), 'transparent') as unknown as string },
    sidebarActiveColor: { vars: ['--sarak-sidebar-active-color'], transform: (v: SarakTokenValue) => computeColorVariants(String(v), 'transparent') as unknown as string },
    topbarHoverColor: { vars: ['--sarak-topbar-hover-color'], transform: (v: SarakTokenValue) => computeColorVariants(String(v), 'transparent') as unknown as string },
    topbarActiveColor: { vars: ['--sarak-topbar-active-color'], transform: (v: SarakTokenValue) => computeColorVariants(String(v), 'transparent') as unknown as string },

    // Hyper-Granular Layer Textures
    sidebarNoiseOpacity: { vars: ['--sarak-sidebar-noise-opacity'] },
    topbarNoiseOpacity: { vars: ['--sarak-topbar-noise-opacity'] },

    atmosphereNoiseOpacity: { vars: ['--sarak-noise-opacity', '--theme-noise-opacity'] },

    iconStrokeWidth: { vars: ['--sarak-icon-stroke', '--theme-icon-stroke'], unit: 'px' },
    maxContentWidth: { vars: ['--sarak-max-width', '--theme-max-width'] },
    scrollbarStyle: { vars: ['--sarak-scrollbar-width'], unit: 'px', attr: 'data-scrollbar-style' },
    topbarHeight: { vars: ['--topbar-height', '--sarak-topbar-height', '--theme-topbar-height'], unit: 'px' },
    isNavHidden: { vars: ['--is-nav-hidden'], attr: 'data-nav-hidden' },
    sidebarMinWidth: { vars: ['--sidebar-min-width'], transform: (v: SarakTokenValue) => parseFloat(String(v)) || 200 },
    sidebarMaxWidth: { vars: ['--sidebar-max-width'], transform: (v: SarakTokenValue) => parseFloat(String(v)) || 450 },

    // Novas Integrações v11.0 (Security & Atmosphere)
    securityShieldGlow: { vars: ['--sarak-security-glow'], unit: 'px' },
    securityPulseSpeed: { vars: ['--sarak-security-pulse'], unit: 's' },
    noiseIntensity: { vars: ['--sarak-noise-opacity', '--theme-noise-opacity'], transform: (v: SarakTokenValue) => (parseFloat(String(v)) || 0) / 100 },
    
    // Configurações de Sistema
    moduleBlacklist: { attr: 'data-module-blacklist' },
    industrialRegistry: { attr: 'data-industrial-registry' }
};
