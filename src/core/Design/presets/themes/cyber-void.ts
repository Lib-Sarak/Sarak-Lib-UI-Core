/**
 * Sarak Theme Preset: Cyber-Void (v12.0)
 * 
 * DNA: Imersão, Negros Absolutos, Neon Industrial e Scanlines.
 */

export const CyberVoid = {
    // Branding
    systemName: 'SARAK VOID',
    logoPosition: 'center',
    logoScale: 1.1,
    
    // Atmosphere
    mode: 'dark',
    primaryColor: '#00ff41', // Matrix Green
    bodyColor: '#000000',
    titleColor: '#00ff41',
    secondaryColor: '#0ea5e9',
    successColor: '#10b981',
    warningColor: '#f59e0b',
    errorColor: '#ef4444',
    glassOpacity: 0.1,
    glassBlur: 12,
    texture: 'scanline',
    textureOpacity: 0.15,
    scaleRatio: 0.95,
    contrastCurve: 1.3,
    spotlightEnabled: true,
    borderBeamEnabled: true,
    
    // Shell
    navigationStyle: 'sidebar',
    sidebarWidth: 80, // Slim Dock Style
    topbarHeight: 64,
    layoutDensity: 'compact',
    tabGap: 4,
    isNavHidden: false,
    sidebarColor: '#050505',
    sidebarHoverColor: '#111111',
    sidebarActiveColor: '#00ff41',
    
    // Cards
    cardBorderRadius: 2,
    borderRadiusSm: 0,
    borderRadiusMd: 2,
    borderRadiusLg: 4,
    cardPadding: 24,
    cardPaddingSm: 12,
    cardPaddingMd: 24,
    cardPaddingLg: 48,
    cardBorderStyle: 'dashed',
    cardBorderWidth: 1,
    cardBorderColor: '#00ff4133',
    cardBackgroundColor: '#050505',
    cardTexture: 'noise',
    cardNoiseOpacity: 0.05,
    cardShadowIntensity: 0,
    
    // Typography
    fontScale: 's',
    headingFont: "'JetBrains Mono', monospace",
    bodyFont: "'JetBrains Mono', monospace",
    headingWeight: '800',
    headingLetterSpacing: 2,
    
    // Controls
    controlSize: 'xs',
    controlRadius: 0,
    controlBorderWidth: 2,
    accentBrightness: 'vibrant',
    
    // Animations
    animationSpeed: 'fast',
    animationStyle: 'glitch',
    pageTransition: 'slide'
};
