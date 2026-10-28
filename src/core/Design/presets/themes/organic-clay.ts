import type { SarakThemePreset } from './index';
import { FLUID_MAX_CONTENT_WIDTH_OPTION } from '../../schema/system';

export const organicClayTheme: SarakThemePreset = {
  "id": "organic-clay",
  "name": "Organic Clay",
  "description": "Barro, madeira e contornos topográficos em uma superfície tátil e tranquila.",
  "design": {
    "mode": "light",
    // as cores saem da paleta; abaixo ficam só as sobrescritas justificadas
    "colorPalette": "terra-argila",
    "bodySize": "16px",
    "identityAlignment": "left",
    "identityPadding": 16,
    "identityFontFamily": "'Outfit', sans-serif",
    "identityFontWeight": 600,
    "identityTracking": 0,
    "identityHoverEffect": "opacity",
    "layoutDensity": "comfortable",
    "maxContentWidth": FLUID_MAX_CONTENT_WIDTH_OPTION,
    "layoutPadding": {
      "mob": 16,
      "tab": 22,
      "desk": 28
    },
    "borderRadius": {
      "mob": 8,
      "tab": 10,
      "desk": 12
    },
    "borderWidth": 1,
    "borderStyle": "solid",
    "layoutGap": {
      "mob": 16,
      "tab": 20,
      "desk": 24
    },
    "layoutGapSm": {
      "mob": 8,
      "tab": 10,
      "desk": 12
    },
    "layoutGapMd": {
      "mob": 16,
      "tab": 20,
      "desk": 24
    },
    "layoutGapLg": {
      "mob": 24,
      "tab": 32,
      "desk": 36
    },
    "iconFamily": "phosphor",
    "iconWeight": "regular",
    "iconStrokeWidth": 2,
    // o fundo de argila é o tema; a neutra da paleta é quase branca
    "sidebarColor": "#d8c9ae",
    "sidebarNoiseOpacity": 0,
    // o fundo de argila é o tema; a neutra da paleta é quase branca
    "topbarColor": "#d8c9ae",
    "topbarNoiseOpacity": 0,
    "sidebarBorderWidth": 1,
    "sidebarBorderStyle": "solid",
    "sidebarBorderSide": "edge",
    "sidebarBackgroundStyle": "texture",
    "sidebarActiveItemStyle": "pill",
    "sidebarItemDensity": "spacious",
    "sidebarIconSize": 18,
    "topbarBorderWidth": 1,
    "topbarBorderStyle": "solid",
    "topbarBorderSide": "edge",
    "topbarBackgroundStyle": "solid",
    "topbarActiveItemStyle": "filled",
    "topbarItemDensity": "comfortable",
    "topbarIconSize": 18,
    "topbarBlur": 0,
    "topbarShadow": "0 2px 16px rgba(15,23,42,0.08)",
    "tabGap": {
      "mob": 4,
      "tab": 6,
      "desk": 8
    },
    "tabSectionMargin": {
      "mob": 8,
      "tab": 12,
      "desk": 16
    },
    "navActiveMarkerGlow": 8,
    "navItemRadius": 12,
    "sidebarBlur": 10,
    "sidebarShadow": "0 8px 24px rgba(45, 34, 18, 0.32)",
    "cardBorderRadius": {
      "mob": 16,
      "tab": 16,
      "desk": 16
    },
    "cardRadiusTL": {
      "mob": 22,
      "tab": 22,
      "desk": 22
    },
    "cardRadiusTR": {
      "mob": 10,
      "tab": 10,
      "desk": 10
    },
    "cardRadiusBL": {
      "mob": 22,
      "tab": 22,
      "desk": 22
    },
    "cardRadiusBR": {
      "mob": 10,
      "tab": 10,
      "desk": 10
    },
    "cardGeometricCut": 0,
    "cardBackdropBlur": 0,
    "cardSurfaceOpacity": 1,
    "cardBorderWidth": 0,
    "cardBorderOpacity": 1,
    "cardBorderTop": 0,
    "cardBorderBottom": 0,
    "cardBorderLeft": 0,
    "cardBorderRight": 0,
    "cardInnerGlowWidth": 1,
    "cardTextureType": "wood",
    "cardTextureOpacity": 0.08,
    "cardHeaderPadding": {
      "mob": 12,
      "tab": 16,
      "desk": 16
    },
    "cardShadowSpread": 0,
    "cardShadowOffsetX": 0,
    "cardShadowOffsetY": 20,
    "cardShadowBlur": 50,
    "cardShadowExpansion": -12,
    "cardGlowIntensity": 0.1,
    "cardHoverTranslate": -2,
    "cardHoverGlowIncrease": 0.1,
    "cardSpotlightOpacity": 0,
    "cardPaddingMd": {
      "mob": 18,
      "tab": 22,
      "desk": 26
    },
    "cardLayoutDirection": "column",
    "cardTextAlign": "left",
    "cardShadow": "0 8px 20px rgba(45, 34, 18, 0.16)",
    "borderBeamEnabled": false,
    "imageCardOverlayOpacity": 0.5,
    "imageCardHoverZoom": 1.05,
    "imageCardShadowOffsetY": 10,
    "imageCardShadowBlur": 30,
    "imageCardShadowSpread": 10,
    "imageCardGlowBlur": 40,
    "catalogSectionRadius": 3,
    "catalogItemRadius": 2,
    "cardTitleFontSize": {
      "mob": 16,
      "tab": 18,
      "desk": 20
    },
    "cardTitleFontWeight": "600",
    "cardTitleLetterSpacing": 0,
    "cardTitleIconGlowBlur": 15,
    "cardActionBtnBorderRadius": {
      "mob": 12,
      "tab": 14,
      "desk": 14
    },
    "cardActionBtnPadding": 16,
    "cardActionClickScale": 0.96,
    "cardSearchBorderBeamActive": true,
    "modalActionAlignment": "right",
    "modalHeaderStyle": "inline",
    "modalOverlayBlur": 8,
    "modalBorderRadius": {
      "mob": 12,
      "tab": 16,
      "desk": 16
    },
    "tooltipRadius": 6,
    "toastAccentWidth": 4,
    "tableDensity": "comfortable",
    "tableZebraStriping": false,
    "tableBorderRadius": {
      "mob": 10,
      "tab": 14,
      "desk": 14
    },
    "tableCellPadding": {
      "mob": 8,
      "tab": 10,
      "desk": 12
    },
    "kanbanHeaderPaddingY": 4,
    "kanbanHeaderTracking": 0.04,
    "kanbanCardRadius": 8,
    "headingFont": "'Outfit', sans-serif",
    "bodyFont": "'Lexend', sans-serif",
    "monoFont": "'JetBrains Mono', monospace",
    // texto sobre o fundo de argila (tom médio): a escala da paleta fica abaixo de 4,5:1 nele
    "textColorMuted": "#51422f",
    "h1Size": {
      "mob": 30,
      "tab": 36,
      "desk": 42
    },
    "h1Weight": "700",
    "h1LineHeight": 1.2,
    "h1LetterSpacing": -1,
    "h2Size": {
      "mob": 24,
      "tab": 28,
      "desk": 32
    },
    "h2Weight": "700",
    "h2LineHeight": 1.2,
    "h3Size": 24,
    "bodyLineHeight": 1.6,
    "bodyWeight": "400",
    "headingTransform": "none",
    "textSmoothing": true,
    "textGlowIntensity": 0,
    "typeScaleMicro": 11,
    "typeScaleTiny": 11,
    "typeScale3xs": 11,
    "typeScale2xs": 11,
    "typeScaleCaption": 12,
    "trackingTight": 0.2,
    "trackingSnug": 0.25,
    "trackingWide": 0.3,
    "trackingWider": 0.4,
    "trackingWidest": 0.5,
    "trackingUltra": 0.8,
    "typeScaleXs": 11,
    "typeScaleXl": 20,
    "btnBorderRadius": {
      "mob": 12,
      "tab": 14,
      "desk": 14
    },
    "btnRadiusTL": {
      "mob": 12,
      "tab": 14,
      "desk": 14
    },
    "btnRadiusTR": {
      "mob": 12,
      "tab": 14,
      "desk": 14
    },
    "btnRadiusBL": {
      "mob": 12,
      "tab": 14,
      "desk": 14
    },
    "btnRadiusBR": {
      "mob": 12,
      "tab": 14,
      "desk": 14
    },
    "btnHoverScale": 1.02,
    "btnActiveScale": 0.98,
    "btnStyleType": "matte",
    "btnNeonPulseSpeed": 0,
    "btnBackdropBlur": 8,
    "iconButtonGlowBlurSm": 5,
    "iconButtonGlowBlurMd": 8,
    "iconButtonGlowBlurLg": 12,
    "iconButtonFrostedShadowOffsetY": 4,
    "iconButtonFrostedShadowBlur": 16,
    "actionGlowShadowOffsetY": 10,
    "actionGlowShadowBlur": 20,
    "actionGlowShadowSpread": 10,
    "inputBorderRadius": {
      "mob": 10,
      "tab": 12,
      "desk": 12
    },
    "inputBorderType": "solid",
    "inputBackdropBlur": 0,
    "inputShadow": "none",
    // texto sobre o fundo de argila (tom médio): a escala da paleta fica abaixo de 4,5:1 nele
    "inputErrorColor": "#7f1d1d",
    "searchBackdropBlur": 8,
    "switchStyleType": "tactile",
    "switchBackdropBlur": 4,
    // texto sobre o fundo de argila (tom médio): a escala da paleta fica abaixo de 4,5:1 nele
    "primaryColor": "#3d4a24",
    // o fundo de argila é o tema; a neutra da paleta é quase branca
    "surfaceColor": "#ece2cf",
    // texto sobre o fundo de argila (tom médio): a escala da paleta fica abaixo de 4,5:1 nele
    "emphasisColor": "#70381f",
    "colorDepth": 1,
    "colorVariation": 1,
    // o fundo de argila é o tema; a neutra da paleta é quase branca
    "cardBackgroundColor": "#ece2cf",
    "chartGridOpacity": 0.12,
    "chartType": "area",
    "chartShowGrid": true,
    "chartThickness": 2,
    "chartSmoothing": true,
    "pageTransitionType": "slide-up",
    "cardHoverStyle": "lift",
    // o fundo de argila é o tema; a neutra da paleta é quase branca
    "colorBgBody": "#c6b394",
    // o fundo de argila é o tema; a neutra da paleta é quase branca
    "colorBgLayer1": "#d8c9ae",
    // o fundo de argila é o tema; a neutra da paleta é quase branca
    "colorBgLayer2": "#e5d9c4",
    // o fundo de argila é o tema; a neutra da paleta é quase branca
    "bgBaseColor": "#c6b394",
    "bgGradientMode": "linear",
    "bgGradientAngle": 145,
    "surfaceMaterial": "organic",
    "surfaceIntensity": 0,
    "borderType": "solid",
    "systemTone": "none",
    "texture": "topo",
    "textureOpacity": 0.08,
    "bgNoiseDensity": 0.02,
    "bgNoiseAnimation": 0,
    "glassBlur": 14,
    "glassOpacity": 0,
    "glassSpecularity": 0,
    "glassRoughness": 0.05,
    "glassSaturation": 1.2,
    "glassEdgeWidth": 1,
    "shadowIntensity": 0.3,
    "layeredShadows": 1,
    "shadowOrientation": "bottom",
    "shadowColorMode": "neutral",
    "shadowAmbientAlpha": 0.12,
    "shadowProjectionBlur": 40,
    "shadowProjectionAlpha": 0.08,
    "vignetteOpacity": 0,
    "vignetteSoftness": 50,
    "globalSaturation": 1,
    "globalContrast": 1,
    "chatBubbleRadius": {
      "mob": 8,
      "tab": 10,
      "desk": 12
    },
    "chatBubbleStyle": "glass",
    "chatAnimationSpeed": 0.05,
    // texto sobre o fundo de argila (tom médio): a escala da paleta fica abaixo de 4,5:1 nele
    "statusSuccessColor": "#104323",
    // texto sobre o fundo de argila (tom médio): a escala da paleta fica abaixo de 4,5:1 nele
    "statusErrorColor": "#7f1d1d",
    "badgeRadius": 99,
    "statusGlowBlur": 0,
    "progressBarHeight": 8,
    "progressBarRadius": 8,
    "flowNodeRadius": {
      "mob": 8,
      "tab": 10,
      "desk": 12
    },
    "flowGridStyle": "dots",
    "dotGridDotOffset": 2,
    "dotGridDotSize": 1,
    "dotGridTileSize": 40,
    "emptyStateOrbOuter": 500,
    "emptyStateOrbInner": 300,
    "emptyStateOrbBlur": 100,
    "emptyStateVoidLetterOffset": 0.8,
    "emptyStateRingRadius": 2,
    "emptyStateCaptionMaxWidth": 280,
    "skeletonRowRadius": 4,
    "authHeroOrbBlur": 120,
    "chatBubbleGlassBlur": 12,
    "flowNodePadding": 10,
    "flowNodeBlur": 5,
    "motionEaseMain": "cubic-bezier(0.2, 0.8, 0.2, 1)",
    "motionEaseOut": "cubic-bezier(0.2, 0.8, 0.2, 1)",
    "motionEaseIn": "cubic-bezier(0.7, 0, 0.84, 0)",
    "motionDurationInstant": 0.15,
    "motionDurationFast": 0.25,
    "motionDurationNormal": 0.4,
    "motionDurationSlow": 0.4,
    "motionStaggerDelay": 0.05,
    "scrollWidth": {
      "mob": 4,
      "tab": 4,
      "desk": 6
    },
    "scrollRadius": {
      "mob": 8,
      "tab": 10,
      "desk": 10
    },
    "scrollTrackOpacity": 0.08,
    "scrollThumbOpacity": 0.35,
    "scrollThumbHoverOpacity": 0.6,
    "scrollPadding": {
      "mob": 0,
      "tab": 2,
      "desk": 2
    },
    "matrixGap": 12,
    "matrixRadius": 12,
    "matrixBlur": 10,
    "globalBackgroundPosition": "absolute",
    "globalBackgroundImageUrl": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNjAgMTYwIj48ZyBmaWxsPSJub25lIiBzdHJva2U9IiM4MDYzM2QiIHN0cm9rZS13aWR0aD0iMS4yIiBzdHJva2Utb3BhY2l0eT0iLjIyIj48cGF0aCBkPSJNLTMwIDIzYzI0LTIwIDU2LTIwIDgwIDBzNTYgMjAgODAgMCA1Ni0yMCA4MCAwTS0zMCA0OWMyNC0yMCA1Ni0yMCA4MCAwczU2IDIwIDgwIDAgNTYtMjAgODAgME0tMzAgNzVjMjQtMjAgNTYtMjAgODAgMHM1NiAyMCA4MCAwIDU2LTIwIDgwIDBNLTMwIDEwMWMyNC0yMCA1Ni0yMCA4MCAwczU2IDIwIDgwIDAgNTYtMjAgODAgME0tMzAgMTI3YzI0LTIwIDU2LTIwIDgwIDBzNTYgMjAgODAgMCA1Ni0yMCA4MCAwIi8+PC9nPjxwYXRoIGZpbGw9IiNkNmM1YTYiIGZpbGwtb3BhY2l0eT0iLjA4IiBkPSJNMCAwaDE2MHYxNjBIMHoiLz48L3N2Zz4=",
    "globalBackgroundBlur": 0,
    "globalBackgroundOpacity": 0.3,
    "globalSectionGap": 24,
    "headerAlignment": "space-between",
    "formFieldDensity": "comfortable",
    "enabledLanguages": [
      "pt",
      "en",
      "es",
      "fr",
      "de",
      "it"
    ]
  },
  "contraparte": {
    "mode": "dark",
    // o fundo de argila é o tema; a neutra da paleta é quase branca
    "sidebarColor": "#29231a",
    "sidebarNoiseOpacity": 0,
    // o fundo de argila é o tema; a neutra da paleta é quase branca
    "topbarColor": "#29231a",
    "topbarNoiseOpacity": 0,
    "topbarShadow": "0 2px 18px rgba(164,179,107,0.14)",
    "sidebarShadow": "0 8px 24px rgba(0, 0, 0, 0.55)",
    "cardSurfaceOpacity": 1,
    "cardBorderOpacity": 1,
    "cardTextureOpacity": 0.08,
    "cardShadowSpread": 0,
    "cardGlowIntensity": 0.1,
    "cardHoverGlowIncrease": 0.1,
    "cardSpotlightOpacity": 0,
    "cardShadow": "0 8px 20px rgba(0, 0, 0, 0.28)",
    "imageCardOverlayOpacity": 0.5,
    // texto sobre o fundo de argila (tom médio): a escala da paleta fica abaixo de 4,5:1 nele
    "textColorMuted": "#c5b18f",
    "textGlowIntensity": 0,
    // texto sobre o fundo de argila (tom médio): a escala da paleta fica abaixo de 4,5:1 nele
    "inputErrorColor": "#ff8a80",
    // texto sobre o fundo de argila (tom médio): a escala da paleta fica abaixo de 4,5:1 nele
    "primaryColor": "#a4b36b",
    // o fundo de argila é o tema; a neutra da paleta é quase branca
    "surfaceColor": "#29231a",
    // texto sobre o fundo de argila (tom médio): a escala da paleta fica abaixo de 4,5:1 nele
    "emphasisColor": "#e58b5f",
    // o fundo de argila é o tema; a neutra da paleta é quase branca
    "cardBackgroundColor": "#29231a",
    "chartGridOpacity": 0.12,
    // o fundo de argila é o tema; a neutra da paleta é quase branca
    "colorBgBody": "#1d1913",
    // o fundo de argila é o tema; a neutra da paleta é quase branca
    "colorBgLayer1": "#29231a",
    // o fundo de argila é o tema; a neutra da paleta é quase branca
    "colorBgLayer2": "#332b20",
    // o fundo de argila é o tema; a neutra da paleta é quase branca
    "bgBaseColor": "#1d1913",
    "surfaceIntensity": 0,
    "textureOpacity": 0.08,
    "bgNoiseDensity": 0.02,
    "glassOpacity": 0,
    "glassSpecularity": 0,
    "shadowIntensity": 0.3,
    "layeredShadows": 1,
    "shadowAmbientAlpha": 0.12,
    "shadowProjectionAlpha": 0.08,
    "vignetteOpacity": 0,
    // texto sobre o fundo de argila (tom médio): a escala da paleta fica abaixo de 4,5:1 nele
    "statusSuccessColor": "#70d6a5",
    // texto sobre o fundo de argila (tom médio): a escala da paleta fica abaixo de 4,5:1 nele
    "statusErrorColor": "#ff8a80",
    "scrollTrackOpacity": 0.08,
    "scrollThumbOpacity": 0.35,
    "scrollThumbHoverOpacity": 0.6,
    "globalBackgroundImageUrl": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNjAgMTYwIj48ZyBmaWxsPSJub25lIiBzdHJva2U9IiNjNGE5NzUiIHN0cm9rZS13aWR0aD0iMS4yIiBzdHJva2Utb3BhY2l0eT0iLjIyIj48cGF0aCBkPSJNLTMwIDIzYzI0LTIwIDU2LTIwIDgwIDBzNTYgMjAgODAgMCA1Ni0yMCA4MCAwTS0zMCA0OWMyNC0yMCA1Ni0yMCA4MCAwczU2IDIwIDgwIDAgNTYtMjAgODAgME0tMzAgNzVjMjQtMjAgNTYtMjAgODAgMHM1NiAyMCA4MCAwIDU2LTIwIDgwIDBNLTMwIDEwMWMyNC0yMCA1Ni0yMCA4MCAwczU2IDIwIDgwIDAgNTYtMjAgODAgME0tMzAgMTI3YzI0LTIwIDU2LTIwIDgwIDBzNTYgMjAgODAgMCA1Ni0yMCA4MCAwIi8+PC9nPjxwYXRoIGZpbGw9IiMzNDJhMWYiIGZpbGwtb3BhY2l0eT0iLjA4IiBkPSJNMCAwaDE2MHYxNjBIMHoiLz48L3N2Zz4=",
    "globalBackgroundOpacity": 0.3
  }
};
