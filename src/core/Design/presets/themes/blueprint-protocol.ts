import type { SarakThemePreset } from './index';
import { FLUID_MAX_CONTENT_WIDTH_OPTION } from '../../schema/system';

export const blueprintProtocolTheme: SarakThemePreset = {
    id: "blueprint-protocol",
    name: "Blueprint Protocol",
    description: "Cianótipo técnico em azul médio, grade de engenharia, cotas monoespaçadas e linha vermelha de revisão.",
    design:
        {
            "mode": "dark",
            // as cores saem da paleta; abaixo ficam só as sobrescritas justificadas
            "colorPalette": "azul-projeto",
            "bodySize": "14px",
            "identityAlignment": "left",
            "identityPadding": 16,
            "identityFontFamily": "'JetBrains Mono', monospace",
            "identityFontWeight": 700,
            "identityTracking": 0,
            "identityHoverEffect": "opacity",
            "layoutDensity": "compact",
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
            "iconFamily": "tabler",
            "iconWeight": "thin",
            "iconStrokeWidth": 1,
            // o azul de planta técnica é o fundo do tema; a neutra da paleta é quase preta
            "sidebarColor": "#102b49",
            "sidebarNoiseOpacity": 0,
            // o azul de planta técnica é o fundo do tema; a neutra da paleta é quase preta
            "topbarColor": "#15375b",
            // a barra tem fundo próprio do tema: o realce de hover parte dele, não da neutra da paleta
            "sidebarHoverColor": "rgba(255, 255, 255, 0.06)",
            "topbarHoverColor": "rgba(255, 255, 255, 0.06)",
            "topbarNoiseOpacity": 0,
            "sidebarBorderWidth": 1,
            "sidebarBorderStyle": "solid",
            "sidebarBorderSide": "edge",
            "sidebarBackgroundStyle": "texture",
            "sidebarActiveItemStyle": "bar",
            "sidebarItemDensity": "compact",
            "sidebarIconSize": 16,
            "topbarBorderWidth": 1,
            "topbarBorderStyle": "solid",
            "topbarBorderSide": "edge",
            "topbarBackgroundStyle": "gradient",
            "topbarActiveItemStyle": "underline",
            "topbarItemDensity": "comfortable",
            "topbarIconSize": 18,
            "topbarBlur": 8,
            "topbarShadow": "0 2px 18px rgba(142,185,232,0.14)",
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
            "sidebarShadow": "10px 0 30px rgba(0,0,0,0.5)",
            "cardBorderRadius": {
                "mob": 2,
                "tab": 2,
                "desk": 2
            },
            "cardRadiusTL": {
                "mob": 2,
                "tab": 2,
                "desk": 2
            },
            "cardRadiusTR": {
                "mob": 2,
                "tab": 2,
                "desk": 2
            },
            "cardRadiusBL": {
                "mob": 2,
                "tab": 2,
                "desk": 2
            },
            "cardRadiusBR": {
                "mob": 2,
                "tab": 2,
                "desk": 2
            },
            "cardGeometricCut": 8,
            "cardBackdropBlur": 12,
            "cardSurfaceOpacity": 0.7,
            "cardBorderWidth": 1,
            "cardBorderOpacity": 1,
            "cardBorderTop": 1,
            "cardBorderBottom": 1,
            "cardBorderLeft": 1,
            "cardBorderRight": 1,
            "cardInnerGlowWidth": 1,
            "cardTextureType": "blueprint",
            "cardTextureOpacity": 0.12,
            "cardHeaderPadding": {
                "mob": 12,
                "tab": 16,
                "desk": 16
            },
            "cardShadowSpread": 20,
            "cardShadowOffsetX": 0,
            "cardShadowOffsetY": 20,
            "cardShadowBlur": 50,
            "cardShadowExpansion": -12,
            "cardGlowIntensity": 0.25,
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
            "headingFont": "'JetBrains Mono', monospace",
            "bodyFont": "'Archivo', sans-serif",
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
            "headingTransform": "uppercase",
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
                "mob": 2,
                "tab": 2,
                "desk": 2
            },
            "btnRadiusTL": {
                "mob": 8,
                "tab": 10,
                "desk": 10
            },
            "btnRadiusTR": {
                "mob": 8,
                "tab": 10,
                "desk": 10
            },
            "btnRadiusBL": {
                "mob": 8,
                "tab": 10,
                "desk": 10
            },
            "btnRadiusBR": {
                "mob": 8,
                "tab": 10,
                "desk": 10
            },
            "btnHoverScale": 1.02,
            "btnActiveScale": 0.98,
            "btnStyleType": "borderline",
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
                "mob": 2,
                "tab": 2,
                "desk": 2
            },
            "inputBorderType": "solid",
            "inputBackdropBlur": 8,
            "inputShadow": "none",
            "searchBackdropBlur": 8,
            "switchStyleType": "tactile",
            "switchBackdropBlur": 4,
            // o azul de planta técnica é o fundo do tema; a neutra da paleta é quase preta
            "surfaceColor": "#101622",
            "colorDepth": 1,
            "colorVariation": 1,
            // o azul de planta técnica é o fundo do tema; a neutra da paleta é quase preta
            "cardBackgroundColor": "#24466f",
            "chartGridOpacity": 0.1,
            "chartType": "line",
            "chartShowGrid": true,
            "chartThickness": 1,
            "chartSmoothing": false,
            "pageTransitionType": "fade",
            "cardHoverStyle": "glow-only",
            // o azul de planta técnica é o fundo do tema; a neutra da paleta é quase preta
            "colorBgBody": "#1f3a5f",
            // o azul de planta técnica é o fundo do tema; a neutra da paleta é quase preta
            "colorBgLayer1": "#24466f",
            // o azul de planta técnica é o fundo do tema; a neutra da paleta é quase preta
            "colorBgLayer2": "#2d537e",
            // o azul de planta técnica é o fundo do tema; a neutra da paleta é quase preta
            "bgBaseColor": "#1f3a5f",
            "bgGradientMode": "none",
            "bgGradientAngle": 135,
            "surfaceMaterial": "frosted",
            "surfaceIntensity": 0.5,
            "borderType": "solid",
            "systemTone": "none",
            "texture": "blueprint-pro",
            "textureOpacity": 0.12,
            "bgNoiseDensity": 0.05,
            "bgNoiseAnimation": 0,
            "glassBlur": 14,
            "glassOpacity": 0.1,
            "glassSpecularity": 0.1,
            "glassRoughness": 0.05,
            "glassSaturation": 1.2,
            "glassEdgeWidth": 1,
            "shadowIntensity": 0.5,
            "layeredShadows": 1,
            "shadowOrientation": "bottom",
            "shadowColorMode": "neutral",
            "shadowAmbientAlpha": 0.4,
            "shadowProjectionBlur": 40,
            "shadowProjectionAlpha": 0.2,
            "vignetteOpacity": 0.3,
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
            "motionEaseMain": "cubic-bezier(0, 0, 0.2, 1)",
            "motionEaseOut": "cubic-bezier(0.16, 1, 0.3, 1)",
            "motionEaseIn": "cubic-bezier(0.7, 0, 0.84, 0)",
            "motionDurationInstant": 0.1,
            "motionDurationFast": 0.12,
            "motionDurationNormal": 0.2,
            "motionDurationSlow": 0.3,
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
            "scrollThumbOpacity": 0.2,
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
            "mode": "light",
            // o azul de planta técnica é o fundo do tema; a neutra da paleta é quase preta
            "sidebarColor": "#dfeaf5",
            "sidebarNoiseOpacity": 0,
            // o azul de planta técnica é o fundo do tema; a neutra da paleta é quase preta
            "topbarColor": "#e9f1f8",
            // a barra tem fundo próprio do tema: o realce de hover parte dele, não da neutra da paleta
            "sidebarHoverColor": "rgba(11, 18, 32, 0.05)",
            "topbarHoverColor": "rgba(11, 18, 32, 0.05)",
            "topbarNoiseOpacity": 0,
            "topbarShadow": "0 2px 16px rgba(15,23,42,0.08)",
            "sidebarShadow": "10px 0 30px rgba(15, 23, 42, 0.08)",
            "cardSurfaceOpacity": 1,
            "cardBorderOpacity": 1,
            "cardTextureOpacity": 0.06,
            "cardShadowSpread": 12,
            "cardGlowIntensity": 0.18,
            "cardHoverGlowIncrease": 0.2,
            "cardSpotlightOpacity": 0.08,
            "cardShadow": "none",
            "imageCardOverlayOpacity": 0.55,
            "textGlowIntensity": 0,
            // o azul de planta técnica é o fundo do tema; a neutra da paleta é quase preta
            "surfaceColor": "#ffffff",
            // o azul de planta técnica é o fundo do tema; a neutra da paleta é quase preta
            "cardBackgroundColor": "#ffffff",
            "chartGridOpacity": 0.08,
            // o azul de planta técnica é o fundo do tema; a neutra da paleta é quase preta
            "colorBgBody": "#eef4fa",
            // o azul de planta técnica é o fundo do tema; a neutra da paleta é quase preta
            "colorBgLayer1": "#ffffff",
            // o azul de planta técnica é o fundo do tema; a neutra da paleta é quase preta
            "colorBgLayer2": "#dbe7f4",
            // o azul de planta técnica é o fundo do tema; a neutra da paleta é quase preta
            "bgBaseColor": "#eef4fa",
            "surfaceIntensity": 0.5,
            "textureOpacity": 0.035,
            "bgNoiseDensity": 0.04,
            "glassOpacity": 0.5,
            "glassSpecularity": 0.3,
            "shadowIntensity": 0.3,
            "layeredShadows": 1,
            "shadowAmbientAlpha": 0.2,
            "shadowProjectionAlpha": 0.12,
            "vignetteOpacity": 0.12,
            "scrollTrackOpacity": 0.05,
            "scrollThumbOpacity": 0.25,
            "scrollThumbHoverOpacity": 0.5,
            "globalBackgroundImageUrl": "",
            "globalBackgroundOpacity": 1
        }
};
