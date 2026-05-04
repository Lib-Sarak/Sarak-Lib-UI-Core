/**
 * Sarak Theme Preset: Cyber-Void (v12.0)
 * 
 * DNA: High-Tech, Neon, Espaço Profundo e Interfaces de Comando.
 */

export const CyberVoid = {
    // Branding
    systemName: 'VOID_PROTOCOL',
    logoPosition: 'center',
    logoScale: 1.3,
    
    // Atmosphere
    mode: 'dark',
    primaryColor: '#00f2ff', // Cyan Neon
    bodyColor: '#000000',
    titleColor: '#00f2ff',
    secondaryColor: '#bc13fe', // Purple Neon
    successColor: '#39ff14', // Matrix Green
    warningColor: '#ff9900',
    errorColor: '#ff003c',
    glassOpacity: 0.1,
    glassBlur: 10,
    texture: 'circuit',
    textureOpacity: 0.2,
    scaleRatio: 0.95,
    contrastCurve: 1.3,
    spotlightEnabled: true,
    borderBeamEnabled: true,
    
    // Shell
    navigationStyle: 'dock',
    sidebarWidth: 80,
    topbarHeight: 0,
    layoutDensity: 'compact',
    tabGap: 24,
    isNavHidden: false,
    sidebarColor: 'rgba(0, 0, 0, 0.8)',
    sidebarHoverColor: 'rgba(0, 242, 255, 0.2)',
    sidebarActiveColor: 'rgba(0, 242, 255, 0.3)',
    
    // Cards
    cardBorderRadius: 2,
    borderRadiusSm: 0,
    borderRadiusMd: 2,
    borderRadiusLg: 4,
    cardPadding: 20,
    cardPaddingSm: 10,
    cardPaddingMd: 20,
    cardPaddingLg: 32,
    cardBorderStyle: 'dashed',
    cardBorderWidth: 1,
    cardBorderColor: 'rgba(0, 242, 255, 0.4)',
    cardBackgroundColor: 'rgba(0, 10, 20, 0.8)',
    cardTexture: 'none',
    cardNoiseOpacity: 0.2,
    cardShadowIntensity: 0.8,
    
    // Typography
    fontScale: 's',
    headingFont: "'Orbitron', sans-serif",
    bodyFont: "'JetBrains Mono', monospace",
    headingWeight: '900',
    headingLetterSpacing: 5,
    
    // Controls
    controlSize: 'sm',
    controlRadius: 0,
    controlBorderWidth: 1,
    accentBrightness: 'vibrant',
    
    // Animations
    animationSpeed: 'fast',
    animationStyle: 'glitch',
    pageTransition: 'perspective'
};
