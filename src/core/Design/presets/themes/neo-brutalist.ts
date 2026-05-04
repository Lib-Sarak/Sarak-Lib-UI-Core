/**
 * Sarak Theme Preset: Neo-Brutalist Matrix (v12.0)
 * 
 * DNA: Cru, Direto, Alto Contraste e Geometria Rígida.
 */

export const NeoBrutalistMatrix = {
    // Branding
    systemName: 'BRUTAL_SRK',
    logoPosition: 'left',
    logoScale: 1.4,
    
    // Atmosphere
    mode: 'dark',
    primaryColor: '#ffea00', // Yellow Alert
    bodyColor: '#000000',
    titleColor: '#ffffff',
    secondaryColor: '#ffffff',
    successColor: '#00ff00',
    warningColor: '#ffea00',
    errorColor: '#ff0000',
    glassOpacity: 0.05,
    glassBlur: 0,
    texture: 'grid',
    textureOpacity: 0.4,
    scaleRatio: 1.05,
    contrastCurve: 1.4,
    spotlightEnabled: false,
    borderBeamEnabled: false,
    
    // Shell
    navigationStyle: 'sidebar',
    sidebarWidth: 280,
    topbarHeight: 80,
    layoutDensity: 'standard',
    tabGap: 0,
    isNavHidden: false,
    sidebarColor: '#000000',
    sidebarHoverColor: '#ffea00',
    sidebarActiveColor: '#ffea00',
    
    // Cards
    cardBorderRadius: 0, // Hard square
    borderRadiusSm: 0,
    borderRadiusMd: 0,
    borderRadiusLg: 0,
    cardPadding: 24,
    cardPaddingSm: 12,
    cardPaddingMd: 24,
    cardPaddingLg: 40,
    cardBorderStyle: 'solid',
    cardBorderWidth: 4, // Ultra thick
    cardBorderColor: '#ffffff',
    cardBackgroundColor: '#000000',
    cardTexture: 'crosshatch',
    cardNoiseOpacity: 0.2,
    cardShadowIntensity: 1.0, // Hard black shadows
    
    // Typography
    fontScale: 'xl',
    headingFont: "'Archivo Black', sans-serif",
    bodyFont: "'Space Mono', monospace",
    headingWeight: '900',
    headingLetterSpacing: -2,
    
    // Controls
    controlSize: 'lg',
    controlRadius: 0,
    controlBorderWidth: 3,
    accentBrightness: 'vibrant',
    
    // Animations
    animationSpeed: 'fast',
    animationStyle: 'standard',
    pageTransition: 'none'
};
