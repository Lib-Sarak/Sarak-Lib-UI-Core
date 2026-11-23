import { computeColorVariants } from './utils/color-engine';
import {
    transformFontScale,
    transformLayeredShadows
} from './utils/manifest-transformers';
import type { SarakTokenValue } from '../Design/types';
import { sarakGetDefaultDesignState } from '../Design/master-map';

const SCHEMA_DEFAULTS = sarakGetDefaultDesignState();

/** Variantes da cor recebida; sem valor, as do padrão do token no schema (a reserva nunca é uma cor escrita aqui). */
const colorVariantsWithSchemaDefault = (tokenId: string) =>
    (v: SarakTokenValue) => computeColorVariants(String(v), String(SCHEMA_DEFAULTS[tokenId]));

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
    mode: { vars: ['--sarak-mode'], transform: (v: SarakTokenValue) => v === 'dark' ? 'dark' : 'light' },
    primaryColor: {
        vars: ['--sarak-primary-color'],
        transform: colorVariantsWithSchemaDefault('primaryColor')
    },
    secondaryColor: {
        vars: ['--sarak-secondary-color'],
        transform: colorVariantsWithSchemaDefault('secondaryColor')
    },
    tertiaryColor: {
        vars: ['--sarak-tertiary-color'],
        transform: colorVariantsWithSchemaDefault('tertiaryColor')
    },
    accentColor: {
        vars: ['--sarak-accent-color'],
        transform: colorVariantsWithSchemaDefault('accentColor')
    },
    surfaceColor: {
        vars: ['--sarak-surface-color'],
        transform: colorVariantsWithSchemaDefault('surfaceColor')
    },
    errorColor: {
        vars: ['--sarak-status-error-color'],
        transform: colorVariantsWithSchemaDefault('statusErrorColor')
    },
    successColor: {
        vars: ['--sarak-status-success-color'],
        transform: colorVariantsWithSchemaDefault('statusSuccessColor')
    },
    warningColor: {
        vars: ['--sarak-status-warning-color'],
        transform: colorVariantsWithSchemaDefault('statusWarningColor')
    },
    textureColor: {
        vars: ['--sarak-texture-color'],
        transform: colorVariantsWithSchemaDefault('textureColor')
    },
    sidebarColor: {
        vars: ['--sarak-sidebar-bg'],
        transform: colorVariantsWithSchemaDefault('sidebarColor')
    },
    topbarColor: {
        vars: ['--sarak-topbar-bg'],
        transform: colorVariantsWithSchemaDefault('topbarColor')
    },
    cardBackgroundColor: {
        vars: ['--sarak-card-bg'],
        transform: colorVariantsWithSchemaDefault('cardBackgroundColor')
    },
    cardBorderColor: {
        vars: ['--sarak-card-border-color'],
        transform: colorVariantsWithSchemaDefault('cardBorderColor')
    },
    titleColor: {
        vars: ['--sarak-title-color'],
        transform: colorVariantsWithSchemaDefault('titleColor')
    },
    layoutDensity: { vars: ['--sarak-layout-density'], classPrefix: 'density-' },
    texture: { vars: ['--sarak-texture'], classPrefix: 'texture-' },
    navigationStyle: { vars: ['--sarak-navigation-style', '--sarak-nav-style'], classPrefix: 'nav-' },
    sidebarWidth: { vars: ['--sarak-sidebar-width'], unit: 'px' },
    headingFont: { vars: ['--sarak-heading-font'] },
    bodyFont: { vars: ['--sarak-body-font'] },
    fontLineHeight: { vars: ['--sarak-line-height'] },

    borderRadius: { vars: ['--sarak-border-radius'], unit: 'px' },

    borderWidth: { vars: ['--sarak-border-width'], unit: 'px' },
    borderStyle: { vars: ['--sarak-border-style'] },
    
    layoutGap: { vars: ['--sarak-layout-gap'], unit: 'px' },
    layoutGapSm: { vars: ['--sarak-layout-gap-sm'], unit: 'px' },
    layoutGapMd: { vars: ['--sarak-layout-gap-md'], unit: 'px' },
    layoutGapLg: { vars: ['--sarak-layout-gap-lg'], unit: 'px' },

    glassOpacity: { vars: ['--sarak-glass-opacity', '--sarak-bg-opacity'] },
    glassBlur: { vars: ['--sarak-glass-blur'], unit: 'px' },
    glassSaturation: { vars: ['--sarak-glass-saturation'], unit: '%' },
    shadowIntensity: { vars: ['--sarak-shadow-intensity'] },
    
    cardPaddingMd: { vars: ['--sarak-card-padding-md'], unit: 'px' },

    tabGap: { vars: ['--sarak-tab-gap'], unit: 'px' },
    tabSectionMargin: { vars: ['--sarak-tab-section-margin'], unit: 'px' },
    textureOpacity: { vars: ['--sarak-texture-opacity'] },
    // `animationSpeed` (`--animation-speed`/`--sarak-animation-speed`/`--transition-speed`) foi
    // REMOVIDA aqui (plan-21, 2026-08-10): nenhum token de schema corresponde ao conceito, e
    // há 4 candidatos plausíveis (motionDurationInstant/Fast/Normal/Slow) sem um único alvo
    // óbvio por consumidor — decisão de qual duração vale para cada um dos 3 sites que ainda
    // consomem essas vars (SarakManagementGrid.tsx:95, _utilities.css:21)
    // é do dono (R11 — Expansão ou redirecionamento deliberado), não do executor. Os 3 sites
    // continuam consumindo o fallback local (não tocados); `ghostvars` continua acusando os
    // 3 consumos até essa decisão.
    surfaceMaterial: { vars: ['--sarak-surface'] },
    bgGradientMode: { vars: ['--sarak-bg-gradient-mode'], attr: 'data-sx-bg-gradient-mode' },
    bgGradientAngle: { vars: ['--sarak-bg-gradient-angle'] },
    surfaceIntensity: { vars: ['--sarak-surface-intensity'] },
    borderType: { vars: ['--sarak-border-type'] },
    systemTone: { vars: ['--sarak-system-tone'] },
    shadowOrientation: { vars: ['--sarak-shadow-orientation'] },
    shadowColorMode: { vars: ['--sarak-shadow-color-mode'] },
    // `interfaceElasticity` (`--sarak-elasticity`) foi REMOVIDA aqui (plan-21, 2026-08-10):
    // nenhum token de schema corresponde ao conceito de "elasticidade" — busca no schema
    // inteiro não achou nada. Continua consumida (fallback numérico `0.2`, sem cadeia de
    // var) em `src/styles/_base.css:58-59` (curva/escala elástica) — SEM alvo para
    // redirecionar. Criar o token é Expansão (R11), decisão do dono; não tocado aqui.
    chartStyle: {},
    cardSpotlightOpacity: {
        vars: ['--sarak-card-spotlight-opacity'],
        transform: (v: SarakTokenValue) => parseFloat(String(v)) || 0
    },
    cardBorderRadius: { vars: ['--sarak-card-radius'], unit: 'px' },
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

    // Nenhum nome de `vars` aqui é público (`tokens.cssVars` do catálogo do kit): a escala de fonte chega pelo schema, não por variável
    // com este papel; a entrada guarda só a transformação.
    fontScale: {
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

    iconStrokeWidth: { vars: ['--sarak-icon-stroke'], unit: 'px' },
    topbarHeight: { vars: ['--sarak-topbar-height'], unit: 'px' },
    isNavHidden: { vars: ['--sarak-is-nav-hidden'] },
    sidebarMinWidth: { vars: ['--sarak-sidebar-min-width'], transform: (v: SarakTokenValue) => parseFloat(String(v)) || 200 },
    sidebarMaxWidth: { vars: ['--sarak-sidebar-max-width'], transform: (v: SarakTokenValue) => parseFloat(String(v)) || 450 },

    // Novas Integrações v11.0 (Atmosphere)
    bgNoiseDensity: { vars: ['--sarak-noise-density'] }
};
