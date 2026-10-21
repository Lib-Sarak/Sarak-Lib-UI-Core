import { computeColorVariants } from './utils/color-engine';
import {
    transformFontScale,
    transformLayeredShadows
} from './utils/manifest-transformers';
import type { SarakTokenValue } from '../Design/types';

/**
 * SOVEREIGN DESIGN MANIFEST (v10.1)
 *
 * Lista de chaves aceitas fora do schema (`ALLOWED_EXTRA_KEYS`) e o export público das
 * variáveis/transformações. NÃO é o emissor: quem escreve variável (`--sarak-<kebab>` e as
 * `cssVars` do schema) e atributo (`data-sx-<kebab>`) de TODO token é `useDesignVariables.ts`,
 * a partir do schema. O `vars` daqui nunca alimentou CSS real, e `attr` só aparece onde é o
 * próprio `data-sx-<kebab>` que o motor emite — por isso o `token-reader:check` lê o schema
 * inteiro e usa este arquivo só para o `classPrefix`. Entrada vazia (`{}`) só mantém a chave
 * aceita no payload (`ALLOWED_EXTRA_KEYS`).
 */
export const SARAK_DESIGN_MANIFEST: Record<string, {
    vars?: string[],
    unit?: string,
    transform?: (v: SarakTokenValue) => string | number | Record<string, string | number>,
    attr?: string,
    classPrefix?: string
}> = {
    mode: { vars: ['--sarak-mode', '--mode-theme'], transform: (v: SarakTokenValue) => v === 'dark' ? 'dark' : 'light' },
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
    colorDepth: { vars: ['--sarak-color-depth'], transform: (v: SarakTokenValue) => parseInt(String(v)) || 1 },
    colorVariation: { vars: ['--sarak-color-variation'], transform: (v: SarakTokenValue) => parseInt(String(v)) || 1 },
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
    texture: { vars: ['--sarak-texture', '--texture-theme'], classPrefix: 'texture-' },
    navigationStyle: { vars: ['--sarak-navigation-style', '--sarak-nav-style', '--nav-style'], classPrefix: 'nav-' },
    sidebarWidth: { vars: ['--sidebar-width', '--sarak-sidebar-width'], unit: 'px' },
    headingFont: { vars: ['--font-heading', '--sarak-heading-font'] },
    bodyFont: { vars: ['--font-main', '--sarak-body-font'] },
    fontLineHeight: { vars: ['--line-height', '--sarak-line-height'] },

    borderRadius: { vars: ['--radius-theme', '--sarak-border-radius', '--border-radius'], unit: 'px' },

    borderWidth: { vars: ['--theme-border-width', '--border-width', '--sarak-border-width'], unit: 'px' },
    borderStyle: { vars: ['--border-style', '--sarak-border-style'] },
    
    layoutGap: { vars: ['--theme-gap', '--sarak-layout-gap'], unit: 'px' },
    layoutGapSm: { vars: ['--sarak-layout-gap-sm'], unit: 'px' },
    layoutGapMd: { vars: ['--sarak-layout-gap-md'], unit: 'px' },
    layoutGapLg: { vars: ['--sarak-layout-gap-lg'], unit: 'px' },

    glassOpacity: { vars: ['--glass-opacity', '--sarak-glass-opacity', '--sarak-bg-opacity'] },
    glassBlur: { vars: ['--glass-blur', '--sarak-glass-blur'], unit: 'px' },
    glassSaturation: { vars: ['--sarak-glass-saturation', '--theme-glass-saturation'], unit: '%' },
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
    surfaceMaterial: { vars: ['--sarak-surface', '--surface-material'] },
    bgGradientMode: { vars: ['--sarak-bg-gradient-mode'], attr: 'data-sx-bg-gradient-mode' },
    bgGradientAngle: { vars: ['--sarak-bg-gradient-angle'] },
    surfaceIntensity: { vars: ['--surface-intensity', '--sarak-surface-intensity'] },
    borderType: { vars: ['--sarak-border-type', '--border-type'] },
    systemTone: { vars: ['--sarak-system-tone'] },
    shadowOrientation: { vars: ['--shadow-orientation'] },
    shadowColorMode: { vars: ['--shadow-color-mode'] },
    // `interfaceElasticity` (`--sarak-elasticity`) foi REMOVIDA aqui (plan-21, 2026-08-10):
    // nenhum token de schema corresponde ao conceito de "elasticidade" — busca no schema
    // inteiro não achou nada. Continua consumida (fallback numérico `0.2`, sem cadeia de
    // var) em `src/styles/_base.css:58-59` (curva/escala elástica) — SEM alvo para
    // redirecionar. Criar o token é Expansão (R11), decisão do dono; não tocado aqui.
    chartStyle: {},
    cardSpotlightOpacity: {
        vars: ['--spotlight-opacity'],
        transform: (v: SarakTokenValue) => parseFloat(String(v)) || 0
    },
    cardBorderRadius: { vars: ['--card-radius', '--sarak-card-radius'], unit: 'px' },
    cardShadowSpread: { vars: ['--sarak-card-shadow-spread'] },
    cardShadowOffsetX: { vars: ['--sarak-card-shadow-offset-x'], unit: 'px' },
    cardShadowOffsetY: { vars: ['--sarak-card-shadow-offset-y'], unit: 'px' },
    cardShadowBlur: { vars: ['--sarak-card-shadow-blur'], unit: 'px' },
    cardShadowExpansion: { vars: ['--sarak-card-shadow-expansion'], unit: 'px' },
    switchStyleType: { vars: ['--sarak-switch-style-type'], attr: 'data-sx-switch-style-type' },

    hoverLiftEnabled: {},
    spotlightEnabled: {},
    magneticPullEnabled: {},
    performanceMode: {},

    fontScale: {
        vars: ['--sarak-font-scale', '--sarak-font-size', '--font-size-factor', '--theme-font-size-base'],
        transform: (v: SarakTokenValue) => transformFontScale(String(v)) as unknown as string
    },
    layeredShadows: {
        vars: ['--sarak-layered-shadows'],
        transform: (v: SarakTokenValue) => String(transformLayeredShadows(String(v)))
    },
    chatBubbleStyle: { vars: ['--sarak-chat-bubble'] },
    chatAnimationSpeed: { vars: ['--sarak-chat-anim-speed'] },
    flowGridStyle: { vars: ['--sarak-flow-grid'] },
    flowNodeRadius: { vars: ['--sarak-flow-radius'], unit: 'px' },
    chartThickness: { vars: ['--sarak-chart-thickness'], unit: 'px' },

    // Hyper-Granular Interaction Tokens
    sidebarHoverColor: { vars: ['--sarak-sidebar-hover-color'], transform: (v: SarakTokenValue) => computeColorVariants(String(v), 'transparent') as unknown as string },
    sidebarActiveColor: { vars: ['--sarak-sidebar-active-color'], transform: (v: SarakTokenValue) => computeColorVariants(String(v), 'transparent') as unknown as string },
    topbarHoverColor: { vars: ['--sarak-topbar-hover-color'], transform: (v: SarakTokenValue) => computeColorVariants(String(v), 'transparent') as unknown as string },
    topbarActiveColor: { vars: ['--sarak-topbar-active-color'], transform: (v: SarakTokenValue) => computeColorVariants(String(v), 'transparent') as unknown as string },

    // Hyper-Granular Layer Textures
    sidebarNoiseOpacity: { vars: ['--sarak-sidebar-noise-opacity'] },
    topbarNoiseOpacity: { vars: ['--sarak-topbar-noise-opacity'] },

    iconStrokeWidth: { vars: ['--sarak-icon-stroke', '--theme-icon-stroke'], unit: 'px' },
    maxContentWidth: { vars: ['--sarak-max-width', '--theme-max-width'] },
    topbarHeight: { vars: ['--topbar-height', '--sarak-topbar-height', '--theme-topbar-height'], unit: 'px' },
    isNavHidden: { vars: ['--is-nav-hidden'] },
    sidebarMinWidth: { vars: ['--sidebar-min-width'], transform: (v: SarakTokenValue) => parseFloat(String(v)) || 200 },
    sidebarMaxWidth: { vars: ['--sidebar-max-width'], transform: (v: SarakTokenValue) => parseFloat(String(v)) || 450 },

    // Novas Integrações v11.0 (Atmosphere)
    bgNoiseDensity: { vars: ['--sarak-noise-density'] }
};
