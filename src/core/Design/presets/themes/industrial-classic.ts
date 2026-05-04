/**
 * Sarak Theme Preset: Industrial Classic (v12.0)
 * 
 * Um DNA focado em sobriedade, precisão e elegância industrial.
 */

export const IndustrialClassic = {
    // Branding
    systemName: 'SARAK INDUSTRIAL',
    logoPosition: 'left',
    logoScale: 1.0,
    
    // Atmosphere
    mode: 'dark',
    primaryColor: '#00f2ff', // Sarak Cyan
    bodyColor: '#0f172a',
    titleColor: '#ffffff',
    secondaryColor: '#94a3b8',
    successColor: '#10b981',
    warningColor: '#f59e0b',
    errorColor: '#ef4444',
    glassOpacity: 0.1,
    glassBlur: 12,
    texture: 'grid',
    textureOpacity: 0.1,
    scaleRatio: 1.0,
    contrastCurve: 1.05,
    spotlightEnabled: true,
    borderBeamEnabled: false,
    
    // Shell
    navigationStyle: 'sidebar',
    sidebarWidth: 260,
    topbarHeight: 64,
    layoutDensity: 'standard',
    tabGap: 12,
    isNavHidden: false,
    sidebarColor: '#1e293b',
    sidebarHoverColor: 'rgba(0, 242, 255, 0.05)',
    sidebarActiveColor: 'rgba(0, 242, 255, 0.1)',
    
    // Cards
    cardBorderRadius: 12,
    borderRadiusSm: 4,
    borderRadiusMd: 12,
    borderRadiusLg: 24,
    cardPadding: 32,
    cardPaddingSm: 16,
    cardPaddingMd: 32,
    cardPaddingLg: 48,
    cardBorderStyle: 'solid',
    cardBorderWidth: 1,
    cardBorderColor: 'rgba(255, 255, 255, 0.1)',
    cardBackgroundColor: 'rgba(30, 41, 59, 0.5)',
    cardTexture: 'none',
    cardNoiseOpacity: 0.05,
    cardShadowIntensity: 0.2,
    
    // Typography
    fontScale: 'm',
    headingFont: "'Inter', sans-serif",
    bodyFont: "'Inter', sans-serif",
    headingWeight: '700',
    headingLetterSpacing: -0.5,
    
    // Controls
    controlSize: 'md',
    controlRadius: 8,
    controlBorderWidth: 1,
    accentBrightness: 'normal',
    
    // Animations
    animationSpeed: 'normal',
    animationStyle: 'standard',
    pageTransition: 'fade'
};
