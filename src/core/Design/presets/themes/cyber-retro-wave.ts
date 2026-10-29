import type { SarakThemePreset } from './index';
import { FLUID_MAX_CONTENT_WIDTH_OPTION } from '../../schema/system';

export const cyberRetroWaveTheme: SarakThemePreset = {
    id: "cyber-retro-wave",
    name: "Cyber Retro Wave",
    description: "Y2K prateado com prisma, ciano elétrico, violeta e verde ácido; geometria polida e brilho neon controlado.",
    design:
        {
            "mode": "light",
            // as cores saem da paleta; abaixo ficam só as sobrescritas justificadas
            "colorPalette": "ciano-violeta",
            "bodySize": "14px",
            "identityAlignment": "left",
            "identityPadding": 16,
            "identityFontFamily": "'Space Grotesk', sans-serif",
            "identityFontWeight": 700,
            "identityTracking": 0,
            "identityHoverEffect": "opacity",
            "layoutDensity": "comfortable",
            "maxContentWidth": FLUID_MAX_CONTENT_WIDTH_OPTION,
            "layoutPadding": {
                "mob": 16,
                "tab": 24,
                "desk": 32
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
            // fundo prata do tema; a neutra da paleta seria quase branca
            "sidebarColor": "#ffffff",
            "sidebarNoiseOpacity": 0,
            // fundo prata do tema; a neutra da paleta seria quase branca
            "topbarColor": "#ffffff",
            "topbarNoiseOpacity": 0,
            "sidebarBorderWidth": 1,
            "sidebarBorderStyle": "solid",
            "sidebarBorderSide": "edge",
            "sidebarBackgroundStyle": "texture",
            "sidebarActiveItemStyle": "pill",
            "sidebarItemDensity": "compact",
            "sidebarIconSize": 18,
            "topbarBorderWidth": 1,
            "topbarBorderStyle": "solid",
            "topbarBorderSide": "edge",
            "topbarBackgroundStyle": "gradient",
            "topbarActiveItemStyle": "outline",
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
            "sidebarShadow": "10px 0 30px rgba(15, 23, 42, 0.08)",
            "cardBorderRadius": {
                "mob": 20,
                "tab": 20,
                "desk": 20
            },
            "cardRadiusTL": {
                "mob": 20,
                "tab": 20,
                "desk": 20
            },
            "cardRadiusTR": {
                "mob": 20,
                "tab": 20,
                "desk": 20
            },
            "cardRadiusBL": {
                "mob": 20,
                "tab": 20,
                "desk": 20
            },
            "cardRadiusBR": {
                "mob": 20,
                "tab": 20,
                "desk": 20
            },
            "cardGeometricCut": 0,
            "cardBackdropBlur": 14,
            "cardSurfaceOpacity": 0.55,
            "cardBorderWidth": 1,
            "cardBorderOpacity": 0.6,
            "cardBorderTop": 1,
            "cardBorderBottom": 1,
            "cardBorderLeft": 1,
            "cardBorderRight": 1,
            "cardInnerGlowWidth": 1,
            "cardTextureType": "diamond",
            "cardTextureOpacity": 0.06,
            "cardHeaderPadding": {
                "mob": 12,
                "tab": 16,
                "desk": 16
            },
            "cardShadowSpread": 12,
            "cardShadowOffsetX": 0,
            "cardShadowOffsetY": 20,
            "cardShadowBlur": 50,
            "cardShadowExpansion": -12,
            "cardGlowIntensity": 0.2,
            "cardHoverTranslate": -2,
            "cardHoverGlowIncrease": 0.2,
            "cardSpotlightOpacity": 0.1,
            "cardPaddingMd": {
                "mob": 16,
                "tab": 20,
                "desk": 24
            },
            "cardLayoutDirection": "column",
            "cardTextAlign": "left",
            "cardShadow": "none",
            "borderBeamEnabled": false,
            "imageCardOverlayOpacity": 0.55,
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
            "cardTitleFontWeight": "900",
            "cardTitleLetterSpacing": 0,
            "cardTitleIconGlowBlur": 15,
            "cardActionBtnBorderRadius": {
                "mob": 6,
                "tab": 8,
                "desk": 8
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
            "headingFont": "'Space Grotesk', sans-serif",
            "bodyFont": "'Sora', sans-serif",
            "monoFont": "'JetBrains Mono', monospace",
            "h1Size": {
                "mob": 32,
                "tab": 40,
                "desk": 48
            },
            "h1Weight": "700",
            "h1LineHeight": 1.1,
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
                "mob": 120,
                "tab": 120,
                "desk": 120
            },
            "btnRadiusTL": {
                "mob": 120,
                "tab": 120,
                "desk": 120
            },
            "btnRadiusTR": {
                "mob": 120,
                "tab": 120,
                "desk": 120
            },
            "btnRadiusBL": {
                "mob": 120,
                "tab": 120,
                "desk": 120
            },
            "btnRadiusBR": {
                "mob": 120,
                "tab": 120,
                "desk": 120
            },
            "btnHoverScale": 1.02,
            "btnActiveScale": 0.98,
            "btnStyleType": "neon",
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
                "mob": 120,
                "tab": 120,
                "desk": 120
            },
            "inputBorderType": "solid",
            "inputBackdropBlur": 8,
            "inputShadow": "none",
            "searchBackdropBlur": 8,
            "switchStyleType": "tactile",
            "switchBackdropBlur": 4,
            // fundo prata do tema; a neutra da paleta seria quase branca
            "surfaceColor": "#ffffff",
            "colorDepth": 1,
            "colorVariation": 1,
            // fundo prata do tema; a neutra da paleta seria quase branca
            "cardBackgroundColor": "#ffffff",
            "chartGridOpacity": 0.08,
            "chartType": "area",
            "chartShowGrid": true,
            "chartThickness": 2,
            "chartSmoothing": true,
            "pageTransitionType": "zoom",
            "cardHoverStyle": "lift",
            // fundo prata do tema; a neutra da paleta seria quase branca
            "colorBgBody": "#c9ced8",
            // fundo prata do tema; a neutra da paleta seria quase branca
            "colorBgLayer1": "#d7dbe3",
            // fundo prata do tema; a neutra da paleta seria quase branca
            "colorBgLayer2": "#e5e8ee",
            // fundo prata do tema; a neutra da paleta seria quase branca
            "bgBaseColor": "#c3c8d3",
            "bgGradientMode": "mesh",
            "bgGradientAngle": 135,
            "surfaceMaterial": "frosted",
            "surfaceIntensity": 0.5,
            "borderType": "solid",
            "systemTone": "none",
            "texture": "prism-mesh",
            "textureOpacity": 0.06,
            "bgNoiseDensity": 0.04,
            "bgNoiseAnimation": 0,
            "glassBlur": 14,
            "glassOpacity": 0.5,
            "glassSpecularity": 0.3,
            "glassRoughness": 0.05,
            "glassSaturation": 1.2,
            "glassEdgeWidth": 1,
            "shadowIntensity": 0.3,
            "layeredShadows": 1,
            "shadowOrientation": "bottom",
            "shadowColorMode": "neutral",
            "shadowAmbientAlpha": 0.2,
            "shadowProjectionBlur": 40,
            "shadowProjectionAlpha": 0.12,
            "vignetteOpacity": 0.1,
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
            "motionEaseMain": "cubic-bezier(0.34, 1.56, 0.64, 1)",
            "motionEaseOut": "cubic-bezier(0.16, 1, 0.3, 1)",
            "motionEaseIn": "cubic-bezier(0.7, 0, 0.84, 0)",
            "motionDurationInstant": 0.1,
            "motionDurationFast": 0.2,
            "motionDurationNormal": 0.3,
            "motionDurationSlow": 0.6,
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
            "scrollTrackOpacity": 0.05,
            "scrollThumbOpacity": 0.25,
            "scrollThumbHoverOpacity": 0.5,
            "scrollPadding": {
                "mob": 0,
                "tab": 2,
                "desk": 2
            },
            "matrixGap": 12,
            "matrixRadius": 12,
            "matrixBlur": 10,
            "globalBackgroundPosition": "absolute",
            "globalBackgroundImageUrl": "",
            "globalBackgroundBlur": 0,
            "globalBackgroundOpacity": 1,
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
    contraparte:
        {
            "mode": "dark",
            // fundo prata do tema; a neutra da paleta seria quase branca
            "sidebarColor": "#04060a",
            "sidebarNoiseOpacity": 0,
            // fundo prata do tema; a neutra da paleta seria quase branca
            "topbarColor": "#04060a",
            "topbarNoiseOpacity": 0,
            "topbarShadow": "0 2px 18px rgba(0,184,255,0.14)",
            "sidebarShadow": "10px 0 30px rgba(0,0,0,0.5)",
            "cardSurfaceOpacity": 0.7,
            "cardBorderOpacity": 0.6,
            "cardTextureOpacity": 0.04,
            "cardShadowSpread": 20,
            "cardGlowIntensity": 0.25,
            "cardHoverGlowIncrease": 0.2,
            "cardSpotlightOpacity": 0.1,
            "cardShadow": "none",
            "imageCardOverlayOpacity": 0.5,
            "textGlowIntensity": 0,
            // fundo prata do tema; a neutra da paleta seria quase branca
            "surfaceColor": "#101622",
            // fundo prata do tema; a neutra da paleta seria quase branca
            "cardBackgroundColor": "#171b2e",
            "chartGridOpacity": 0.06,
            // fundo prata do tema; a neutra da paleta seria quase branca
            "colorBgBody": "#0d1020",
            // fundo prata do tema; a neutra da paleta seria quase branca
            "colorBgLayer1": "#171b2e",
            // fundo prata do tema; a neutra da paleta seria quase branca
            "colorBgLayer2": "#202640",
            // fundo prata do tema; a neutra da paleta seria quase branca
            "bgBaseColor": "#0d1020",
            "surfaceIntensity": 0.5,
            "textureOpacity": 0.045,
            "bgNoiseDensity": 0.05,
            "glassOpacity": 0.1,
            "glassSpecularity": 0.1,
            "shadowIntensity": 0.5,
            "layeredShadows": 1,
            "shadowAmbientAlpha": 0.4,
            "shadowProjectionAlpha": 0.2,
            "vignetteOpacity": 0.3,
            "scrollTrackOpacity": 0.05,
            "scrollThumbOpacity": 0.2,
            "scrollThumbHoverOpacity": 0.5,
            "globalBackgroundImageUrl": "",
            "globalBackgroundOpacity": 1
        }
};
