import { PALETTE_BASE_TONE } from './scale';
import type { PaletteColorRole, PaletteScaleName } from './types';

const BASE = PALETTE_BASE_TONE;

const colorRole = (scale: PaletteScaleName, light: number, dark: number, alpha: number = 1): PaletteColorRole => ({
    scale,
    toneByMode: { light, dark },
    ...(alpha < 1 ? { alpha } : {}),
});

/** Texto que anda o mínimo de luminosidade a partir da(s) origem(ns) dada(s), em vez de saltar de tom em tom. */
const shiftRole = (scale: PaletteScaleName, ...origins: number[]): PaletteColorRole => ({
    scale,
    toneByMode: { light: origins[0], dark: origins[origins.length - 1] },
    shiftFrom: origins,
});

/**
 * A distribuição 60-30-10: a primária (60) pinta ações, títulos e controles; a secundária (30) os cabeçalhos, o
 * subtítulo, a categoria e o gráfico; o acento (10) a ênfase, o marcador e o foco. `BASE` é a cor da semente, exata.
 *
 * A área define o tratamento: o texto (título, subtítulo, ênfase, categoria) parte da semente e anda o mínimo que o
 * contraste pede; o elemento pequeno (gráfico, marcador) é a semente exata; a superfície grande (cabeçalho de cartão e
 * de tabela, botão secundário) continua tingida, nos tons claros e escuros da escala.
 */
export const PALETTE_ROLE_MAP: Readonly<Record<string, PaletteColorRole>> = {
    sidebarColor: colorRole('neutral', 100, 950),
    sidebarHoverColor: colorRole('primary', 200, 800, 0.6),
    // A anatomia da barra: o ativo é um véu da primária, quase invisível; quem marca é a barra luminosa na primária.
    sidebarActiveColor: colorRole('primary', BASE, BASE, 0.1),
    // Item inativo apagado, como na anatomia antiga: só o ativo e o passar do mouse acendem (o par de 4,5:1 segura o piso).
    sidebarItemTextColor: colorRole('neutral', 600, 400),
    sidebarItemHoverTextColor: colorRole('neutral', 950, 50),
    // Título de seção na cor do texto da barra e ícone inativo na do rótulo, não em cor de destaque: a lista não parece acesa.
    sidebarCategoryColor: colorRole('neutral', 950, 50),
    sidebarBrandColor: colorRole('accent', 700, 300),
    sidebarBorderColor: colorRole('neutral', 200, 800, 0.64),
    sidebarBrandBackground: colorRole('primary', BASE, BASE, 0.05),
    sidebarFooterBackground: colorRole('neutral', 100, 900),
    sidebarIconColor: colorRole('neutral', 600, 400),
    topbarColor: colorRole('neutral', 100, 950),
    topbarHoverColor: colorRole('primary', 200, 800, 0.6),
    topbarActiveColor: colorRole('primary', 300, 700, 0.6),
    topbarItemTextColor: colorRole('neutral', 800, 100),
    topbarItemHoverTextColor: colorRole('neutral', 950, 50),
    topbarBrandColor: colorRole('accent', 700, 300),
    topbarBrandBackground: colorRole('accent', 100, 900),
    topbarBorderColor: colorRole('neutral', 200, 800, 0.64),
    topbarGroupSeparatorColor: colorRole('neutral', 200, 800, 0.64),
    topbarIconColor: colorRole('primary', 600, 300),
    topbarTitleColor: colorRole('neutral', 950, 50),
    navItemActiveColor: shiftRole('primary', BASE),
    navActiveMarkerColor: colorRole('primary', BASE, BASE),
    cardInnerGlowColor: colorRole('primary', 300, 700, 0.07),
    cardHeaderBg: colorRole('secondary', 100, 900),
    cardHeaderBorder: colorRole('secondary', 200, 800, 0.64),
    cardFooterBg: colorRole('neutral', 100, 900),
    cardFooterBorder: colorRole('neutral', 200, 800, 0.64),
    cardGlowColor: colorRole('primary', 500, 500, 0.18),
    cardTitleColor: shiftRole('primary', BASE),
    cardTitleIconGlow: colorRole('accent', 400, 600, 0.22),
    cardActionBtnPrimaryBg: colorRole('primary', 700, 400),
    cardActionBtnHoverBg: colorRole('primary', 600, 300),
    cardActionBtnText: colorRole('neutral', 50, 950),
    cardSearchBgFocus: colorRole('neutral', 50, 900),
    cardSearchPlaceholderColor: colorRole('neutral', 700, 300),
    cardSearchTextFocusColor: colorRole('neutral', 950, 50),
    modalOverlayColor: colorRole('neutral', 950, 950, 0.64),
    tooltipBg: colorRole('neutral', 900, 100),
    tooltipTextColor: colorRole('neutral', 50, 950),
    tooltipBorderColor: colorRole('neutral', 700, 300),
    tableHeaderBg: colorRole('secondary', 100, 900),
    tableRowHoverBg: colorRole('neutral', 100, 800),
    tableBorderColor: colorRole('neutral', 200, 800, 0.72),
    textColorMaster: colorRole('neutral', 950, 50),
    textColorSecondary: colorRole('neutral', 800, 200),
    textColorMuted: colorRole('neutral', 500, 300),
    btnPrimaryBg: colorRole('primary', BASE, BASE),
    btnPrimaryText: shiftRole('neutral', 50, 950),
    btnSecondaryBg: colorRole('secondary', 100, 900),
    btnGhostHoverBg: colorRole('neutral', 100, 900),
    btnNeonGlowColor: colorRole('primary', 500, 500, 0.4),
    inputBg: colorRole('neutral', 50, 950),
    inputBorderColor: colorRole('neutral', 500, 600, 0.8),
    inputFocusBorderColor: shiftRole('accent', BASE),
    inputTextColor: colorRole('neutral', 950, 50),
    inputIconColor: colorRole('neutral', 700, 200),
    inputErrorColor: colorRole('error', 700, 300),
    rangeActiveColor: colorRole('primary', BASE, BASE),
    switchTrackActiveBg: colorRole('primary', BASE, BASE),
    switchThumbBg: colorRole('neutral', 50, 50),
    checkboxActiveColor: colorRole('primary', BASE, BASE),
    switchPulseColor: colorRole('primary', 500, 500),
    primaryColor: shiftRole('primary', BASE),
    secondaryColor: shiftRole('secondary', BASE),
    tertiaryColor: shiftRole('accent', BASE),
    accentColor: shiftRole('accent', BASE),
    surfaceColor: colorRole('neutral', 100, 900),
    textureColor: colorRole('neutral', 300, 700),
    titleColor: shiftRole('primary', BASE),
    subtitleColor: shiftRole('secondary', BASE),
    emphasisColor: shiftRole('accent', BASE),
    colorBgModal: colorRole('neutral', 50, 950),
    cardBackgroundColor: colorRole('neutral', 50, 900),
    cardBorderColor: colorRole('neutral', 200, 800, 0.72),
    chartColorPalette: colorRole('secondary', BASE, BASE),
    chartTooltipBg: colorRole('neutral', 900, 100, 0.96),
    colorBgBody: colorRole('neutral', 50, 950),
    colorBgLayer1: colorRole('neutral', 100, 900),
    colorBgLayer2: colorRole('neutral', 200, 800),
    bgBaseColor: colorRole('neutral', 50, 950),
    glassEdgeColor: colorRole('neutral', 200, 800, 0.72),
    chatUserBg: colorRole('primary', 100, 900),
    statusSuccessColor: colorRole('success', 700, 300),
    statusErrorColor: colorRole('error', 700, 300),
    statusWarningColor: colorRole('warning', 700, 300),
    statusInfoColor: colorRole('info', 700, 300),
    aiGlowColor: colorRole('accent', 500, 500, 0.4),
    scrollThumbColor: colorRole('neutral', 500, 600),
    matrixItemBg: colorRole('neutral', 100, 900),
    matrixBorderColor: colorRole('neutral', 200, 800, 0.72),
};
