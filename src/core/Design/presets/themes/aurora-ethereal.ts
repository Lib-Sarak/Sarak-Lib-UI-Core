/**
 * Sarak Theme Preset: Aurora Ethereal (v12.0)
 * 
 * DNA: Fluidez Orgânica, Mesh Gradients, Leveza e Desfoque Onírico.
 */

export const AuroraEthereal = {
    // Branding
    systemName: 'SARAK AURORA',
    logoPosition: 'center',
    logoScale: 1.0,
    
    // Atmosphere
    mode: 'light',
    primaryColor: '#f472b6', // Pink Aurora
    bodyColor: '#ffffff',
    titleColor: '#1e293b',
    secondaryColor: '#818cf8',
    successColor: '#34d399',
    warningColor: '#fbbf24',
    errorColor: '#f87171',
    glassOpacity: 0.3,
    glassBlur: 24,
    texture: 'aurora',
    textureOpacity: 0.25,
    scaleRatio: 1.0,
    contrastCurve: 0.9,
    spotlightEnabled: true,
    borderBeamEnabled: false,
    
    // Shell
    navigationStyle: 'topbar',
    sidebarWidth: 240,
    topbarHeight: 80,
    layoutDensity: 'standard',
    tabGap: 20,
    isNavHidden: false,
    sidebarColor: 'rgba(255, 255, 255, 0.7)',
    sidebarHoverColor: 'rgba(244, 114, 182, 0.1)',
    sidebarActiveColor: 'rgba(244, 114, 182, 0.2)',
    
    // Cards
    cardBorderRadius: 40,
    borderRadiusSm: 20,
    borderRadiusMd: 40,
    borderRadiusLg: 80,
    cardPadding: 40,
    cardPaddingSm: 20,
    cardPaddingMd: 40,
    cardPaddingLg: 80,
    cardBorderStyle: 'none',
    cardBorderWidth: 0,
    cardBorderColor: 'transparent',
    cardBackgroundColor: 'rgba(255, 255, 255, 0.6)',
    cardTexture: 'mesh',
    cardNoiseOpacity: 0.02,
    cardShadowIntensity: 0.3,
    
    // Typography
    fontScale: 'm',
    headingFont: "'Plus Jakarta Sans', sans-serif",
    bodyFont: "'Inter', sans-serif",
    headingWeight: '800',
    headingLetterSpacing: -1,
    
    // Controls
    controlSize: 'md',
    controlRadius: 100,
    controlBorderWidth: 0,
    accentBrightness: 'normal',
    
    // Animations
    animationSpeed: 'slow',
    animationStyle: 'fluid',
    pageTransition: 'fade'
};
