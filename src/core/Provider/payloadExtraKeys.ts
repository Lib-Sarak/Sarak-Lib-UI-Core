/**
 * Espelho EM RUNTIME das chaves de `SarakThemePayloadExtras` + `SarakRuntimeExtras`
 * (`./types.ts`). TS apaga interfaces em tempo de execução — `validateDesign`
 * (Spec 44 §2.3) precisa desta lista para saber quais chaves fora do catálogo de
 * tokens visuais (`MASTER_DESIGN_MAP`) ainda assim pertencem ao contrato do
 * payload (branding/estrutura), em vez de descartá-las como desconhecidas.
 * Mudou uma das duas interfaces em `types.ts`? Atualize esta lista junto — é o
 * único ponto de duplicação tolerado (arquivo à parte só para não estourar o
 * limite de linhas do auditor de Clean Code em `types.ts`).
 */
export const PAYLOAD_EXTRA_KEYS = [
    // SarakRuntimeExtras
    'animationSpeed', 'secondaryModuleId', 'emptyStateId', 'logoPosition', 'logoScale',
    'atmosphere', 'specialized', 'schema_version',
    // SarakThemePayloadExtras
    'systemName', 'logoUrl', 'mode', 'layout', 'animationStyle', 'emojiSet',
    'primaryColor', 'secondaryColor', 'flowGridStyle', 'flowNodeRadius', 'chatBubbleStyle',
    'chatAnimationSpeed', 'chartType', 'chartShowGrid', 'cardHoverStyle', 'cardTextureType',
    'cardGeometricCut', 'cardVariant', 'imageOverlay', 'imageCardHoverZoom', 'imageCardOverlayOpacity',
    'iconStrokeWidth', 'layoutDensity', 'fontScale', 'navigationStyle', 'sidebarMinWidth',
    'sidebarMaxWidth', 'sidebarWidth', 'headingFont', 'bodyFont', 'globalBackgroundImageUrl',
    'globalBackgroundOpacity', 'globalBackgroundBlur', 'globalBackgroundBlendMode', 'moduleBlacklist',
    'searchVariant', 'columnGap', 'iconSize', 'iconFamily', 'iconWeight', 'scale', 'btnStyleType',
    'radius', 'borderStyle', 'shadowType', 'chartGridStyle', 'map', 'imageOpacity', 'imageScale',
    'layoutMaxWidth', 'enabledLanguages', 'inputIconPosition', 'qrSize', 'isAutoHideEnabled',
    'isNavHidden', 'logoDarkUrl', 'fontFamily', 'socialButtonStyle', 'searchStyle', 'language',
    'availableLanguages'
] as const;
