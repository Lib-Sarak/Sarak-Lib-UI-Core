import React, { ReactNode, useEffect, useState, useMemo } from 'react';
import '../styles/sarak-base.css';
import { LAYOUTS, SCALES, DENSITY, SarakContext } from '@sarak/lib-shared';
import { useSarak as useGlobalSarak } from '@sarak/lib-shared';

interface SarakUIProviderProps {
    children: ReactNode;
    theme?: string;
    mode?: 'light' | 'dark' | 'system';
    primaryColor?: string;
}

/**
 * SarakUIProvider (Elite v5.6.0 - Matrix Trace Engine)
 * 
 * Motor de UI Federado: 
 * 1. Se estiver dentro de um SarakProvider (Shared), atua apenas como ponte.
 * 2. Se estiver isolado (Storybook/Testes), assume o controle total com paridade Design Engine 5.6.
 */
export const SarakUIProvider: React.FC<SarakUIProviderProps> = ({ 
    children, 
    theme: propTheme, 
    mode: propMode, 
    primaryColor: propPrimary 
}) => {
    let globalSarak: any = null;
    try { globalSarak = useGlobalSarak(); } catch (e) { }

    // --- ESTADO LOCAL (FALLBACK DESIGN ENGINE 5.6/6.0) ---
    const [localLayout, setLocalLayout] = useState(() => localStorage.getItem('sarak_local_layout') || propTheme || 'glass');
    const [localMode, setLocalMode] = useState<'light' | 'dark' | 'system'>(() => (localStorage.getItem('sarak_local_mode') as any) || propMode || 'dark');
    const [localPrimary, setLocalPrimary] = useState(() => localStorage.getItem('sarak_local_primary') || propPrimary || '#3b82f6');
    const [localSidebarWidth, setLocalSidebarWidth] = useState(() => Number(localStorage.getItem('sarak_local_sidebar_width')) || 260);
    const [localNavStyle, setLocalNavStyle] = useState<'sidebar' | 'topbar' | 'dock'>(() => (localStorage.getItem('sarak_local_nav_style') as any) || 'sidebar');
    const [localDensity, setLocalDensity] = useState(() => localStorage.getItem('sarak_local_density') || 'standard');
    const [localTexture, setLocalTexture] = useState(() => localStorage.getItem('sarak_local_texture') || 'none');
    
    // Tokens de Tipografia & Geometria
    const [headingFont, setHeadingFont] = useState(() => localStorage.getItem('sarak_local_font_h') || "");
    const [subtitleFont, setSubtitleFont] = useState(() => localStorage.getItem('sarak_local_font_s') || "");
    const [tabFont, setTabFont] = useState(() => localStorage.getItem('sarak_local_font_tab') || "");
    const [bodyFont, setBodyFont] = useState(() => localStorage.getItem('sarak_local_font_b') || "");
    const [headingWeight, setHeadingWeight] = useState(() => localStorage.getItem('sarak_local_weight_h') || '600');
    const [headingLetterSpacing, setHeadingLetterSpacing] = useState(() => localStorage.getItem('sarak_local_spacing_h') || 'normal');
    const [fontScale, setFontScale] = useState(() => localStorage.getItem('sarak_local_font_scale') || 'm');
    const [borderRadius, setBorderRadius] = useState(() => Number(localStorage.getItem('sarak_local_radius')) || 12);
    const [borderWidth, setBorderWidth] = useState(() => Number(localStorage.getItem('sarak_local_border_w')) || 1);
    const [borderStyle, setBorderStyle] = useState(() => localStorage.getItem('sarak_local_border_s') || 'solid');
    const [layoutGap, setLayoutGap] = useState(() => Number(localStorage.getItem('sarak_local_gap')) || 20);
    
    // Tokens de Materiais & Efeitos
    const [surfaceMaterial, setSurfaceMaterial] = useState<'glass' | 'metallic' | 'brushed' | 'acrylic' | 'matte'>(() => (localStorage.getItem('sarak_local_material') as any) || 'glass');
    const [borderType, setBorderType] = useState<'default' | 'inlet' | 'neon' | 'beveled'>(() => (localStorage.getItem('sarak_local_border_type') as any) || 'default');
    const [glassOpacity, setGlassOpacity] = useState(() => Number(localStorage.getItem('sarak_local_glass_o')) || 0.7);
    const [glassBlur, setGlassBlur] = useState(() => Number(localStorage.getItem('sarak_local_glass_b')) || 15);
    const [shadowIntensity, setShadowIntensity] = useState(() => Number(localStorage.getItem('sarak_local_shadow')) || 0.5);
    const [isGeometricCut, setIsGeometricCut] = useState(() => localStorage.getItem('sarak_local_is_geom') === 'true');
    const [textureOpacity, setTextureOpacity] = useState(() => Number(localStorage.getItem('sarak_local_texture_o')) || 0.05);
    const [animationSpeed, setAnimationSpeed] = useState(() => Number(localStorage.getItem('sarak_local_anim_v')) || 0.4);
    
    // Tokens de Branding & Identidade v6.0
    const [systemName, setSystemName] = useState(() => localStorage.getItem('sarak_local_sys_name') || 'Sarak Standalone');
    const [logoUrl, setLogoUrl] = useState(() => localStorage.getItem('sarak_local_logo_url') || '');
    const [logoDarkUrl, setLogoDarkUrl] = useState(() => localStorage.getItem('sarak_local_logo_dark') || '');
    const [logoScale, setLogoScale] = useState(() => Number(localStorage.getItem('sarak_local_logo_scale')) || 1.0);
    const [logoPosition, setLogoPosition] = useState<'left' | 'center'>(() => (localStorage.getItem('sarak_local_logo_pos') as any) || 'left');
    const [systemTone, setSystemTone] = useState<'formal' | 'friendly' | 'cyber'>(() => (localStorage.getItem('sarak_local_tone') as any) || 'formal');
    
    // Tokens de Dados & Navegação v6.0
    const [chartStyle, setChartStyle] = useState<'line' | 'bar' | 'solid' | 'glass'>(() => (localStorage.getItem('sarak_local_chart_s') as any) || 'glass');
    const [chartPalette, setChartPalette] = useState<string[]>(() => JSON.parse(localStorage.getItem('sarak_local_chart_p') || '["#3b82f6", "#10b981"]'));
    const [shadowOrientation, setShadowOrientation] = useState<'top-down' | 'isometric' | 'inner'>(() => (localStorage.getItem('sarak_local_sh_orient') as any) || 'top-down');
    const [shadowColorMode, setShadowColorMode] = useState<'neutral' | 'adaptive' | 'match'>(() => (localStorage.getItem('sarak_local_sh_mode') as any) || 'adaptive');
    const [isSplitViewEnabled, setIsSplitViewEnabled] = useState(() => localStorage.getItem('sarak_local_split') === 'true');
    const [searchStyle, setSearchStyle] = useState<'minimal' | 'command-palette'>(() => (localStorage.getItem('sarak_local_search') as any) || 'command-palette');

    const [isHydrated, setIsHydrated] = useState(false);

    // Injeção de Fontes Premium
    useEffect(() => {
        if (typeof document === 'undefined') return;
        const ID = 'sarak-core-fonts-v5.6';
        if (document.getElementById(ID)) return;
        const style = document.createElement('style');
        style.id = ID;
        style.textContent = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800;900&family=Space+Grotesk:wght@300;500;700&family=Fira+Code:wght@400;500&family=Outfit:wght@300;400;600;700&family=JetBrains+Mono:wght@400;700&family=Satoshi:wght@300;400;700;900&family=Syncopate:wght@700&family=Tenor+Sans&family=Crimson+Pro:wght@400;700&family=Plus+Jakarta+Sans:wght@400;700&display=swap');`;
        document.head.prepend(style);
    }, []);

    // Motor de Design 6.0 (Autonomous Matrix Trace)
    useEffect(() => {
        if (globalSarak) { setIsHydrated(true); return; }

        const root = document.documentElement;
        const body = document.body;

        try {
            const tokens: Record<string, string> = {
                '--primary-color': localPrimary,
                '--theme-primary': localPrimary,
                '--sidebar-width': `${localSidebarWidth}px`,
                '--font-heading': headingFont || "'Satoshi', sans-serif",
                '--font-subtitle': subtitleFont || headingFont || "'Satoshi', sans-serif",
                '--font-tab': tabFont || headingFont || "'Satoshi', sans-serif",
                '--font-main': bodyFont || "'Inter', sans-serif",
                '--heading-weight': headingWeight,
                '--heading-spacing': headingLetterSpacing,
                '--radius-theme': `${borderRadius}px`,
                '--border-width': `${borderWidth}px`,
                '--border-style': borderStyle,
                '--theme-gap': `${layoutGap}px`,
                '--glass-blur': `${glassBlur}px`,
                '--glass-opacity': glassOpacity.toString(),
                '--shadow-intensity': shadowIntensity.toString(),
                '--texture-opacity': textureOpacity.toString(),
                '--animation-speed': `${animationSpeed}s`,
                '--chart-style': chartStyle,
                '--chart-palette': Array.isArray(chartPalette) ? chartPalette.join(',') : chartPalette,
                '--shadow-orientation': shadowOrientation,
                '--shadow-color-mode': shadowColorMode,
            };

            Object.entries(tokens).forEach(([k, v]) => root.style.setProperty(k, v));

            const scale = (SCALES as any)[fontScale.toUpperCase()] || SCALES.M;
            root.style.setProperty('--font-size-factor', scale.factor);

            const sarakClasses = Object.values(LAYOUTS).map((l: any) => l.class).filter(Boolean);
            const textureClasses = textureClassesList;
            const densityClasses = ['density-compact', 'density-standard', 'density-comfortable'];
            
            body.classList.remove(...sarakClasses, 'light', 'dark', ...textureClasses, ...densityClasses, 'is-geometric', 'nav-sidebar', 'nav-topbar');
            body.classList.add(`layout-${localLayout}`, localMode === 'dark' ? 'dark' : 'light', `density-${localDensity}`, `texture-${localTexture}`, `nav-${localNavStyle}`);
            if (isGeometricCut) body.classList.add('is-geometric');

            // Atributos de Materiais
            body.setAttribute('data-surface', surfaceMaterial);
            body.setAttribute('data-border', borderType);

            // Persistência local (autonomous)
            const map: Record<string, string> = {
                sarak_local_layout: localLayout, sarak_local_mode: localMode, sarak_local_primary: localPrimary,
                sarak_local_density: localDensity, sarak_local_texture: localTexture, sarak_local_radius: borderRadius.toString(),
                sarak_local_glass_o: glassOpacity.toString(), sarak_local_is_geom: isGeometricCut.toString(),
                sarak_local_font_h: headingFont, sarak_local_material: surfaceMaterial, sarak_local_border_type: borderType,
                sarak_local_sys_name: systemName, sarak_local_nav_style: localNavStyle
            };
            Object.entries(map).forEach(([k, v]) => localStorage.setItem(k, v));

            setIsHydrated(true);
        } catch (error) {
            console.error('❌ [SarakUIProvider Failure]', error);
        }
    }, [
        globalSarak, localLayout, localMode, localPrimary, localDensity, localTexture,
        headingFont, subtitleFont, tabFont, bodyFont, headingWeight, headingLetterSpacing,
        borderRadius, borderWidth, borderStyle, isGeometricCut, shadowIntensity,
        glassOpacity, glassBlur, textureOpacity, animationSpeed, localSidebarWidth,
        surfaceMaterial, borderType, systemName, localNavStyle, chartStyle, chartPalette,
        shadowOrientation, shadowColorMode
    ]);

    const fallbackContextValue = useMemo(() => ({
        layout: localLayout, setLayout: setLocalLayout,
        theme: localLayout, setTheme: setLocalLayout,
        mode: localMode, setMode: setLocalMode,
        toggleMode: () => setLocalMode(p => p === 'dark' ? 'light' : 'dark'),
        primaryColor: localPrimary, setPrimaryColor: setLocalPrimary,
        sidebarWidth: localSidebarWidth, setSidebarWidth: setLocalSidebarWidth,
        navigationStyle: localNavStyle, setNavigationStyle: setLocalNavStyle,
        layoutDensity: localDensity, setLayoutDensity: setLocalDensity,
        texture: localTexture, setTexture: setLocalTexture,
        headingFont, setHeadingFont, subtitleFont, setSubtitleFont, bodyFont, setBodyFont, tabFont, setTabFont,
        headingWeight, setHeadingWeight, headingLetterSpacing, setHeadingLetterSpacing,
        fontScale, setFontScale, borderRadius, setBorderRadius, borderWidth, setBorderWidth,
        borderStyle, setBorderStyle, isGeometricCut, setIsGeometricCut, shadowIntensity, setShadowIntensity,
        glassOpacity, setGlassOpacity, glassBlur, setGlassBlur, textureOpacity, setTextureOpacity,
        animationSpeed, setAnimationSpeed, layoutGap, setLayoutGap,
        surfaceMaterial, setSurfaceMaterial, borderType, setBorderType,
        systemName, setSystemName, logoUrl, setLogoUrl, logoDarkUrl, setLogoDarkUrl, 
        logoScale, setLogoScale, logoPosition, setLogoPosition, systemTone, setSystemTone,
        chartStyle, setChartStyle, chartPalette, setChartPalette,
        shadowOrientation, setShadowOrientation, shadowColorMode, setShadowColorMode,
        isSplitViewEnabled, setIsSplitViewEnabled, searchStyle, setSearchStyle,
        applyFullConfig: (c: any) => {
            if (c.layout) setLocalLayout(c.layout);
            if (c.mode) setLocalMode(c.mode);
            if (c.primaryColor) setLocalPrimary(c.primaryColor);
            if (c.borderRadius) setBorderRadius(c.borderRadius);
            if (c.surfaceMaterial) setSurfaceMaterial(c.surfaceMaterial);
            if (c.systemName) setSystemName(c.systemName);
            // ... (Aplica as outras chaves conforme necessário no modo solo)
        },
        layouts: LAYOUTS, isHydrated: true, loading: false
    }), [
        localLayout, localMode, localPrimary, localDensity, localTexture,
        headingFont, subtitleFont, tabFont, bodyFont, headingWeight, headingLetterSpacing,
        borderRadius, borderWidth, borderStyle, isGeometricCut, shadowIntensity,
        glassOpacity, glassBlur, textureOpacity, animationSpeed, localSidebarWidth, localNavStyle,
        surfaceMaterial, borderType, systemName, chartStyle, chartPalette, shadowOrientation,
        shadowColorMode, isSplitViewEnabled, searchStyle, layoutGap
    ]);

    const textureClassesList = ['texture-none', 'texture-grid', 'texture-dots', 'texture-scanlines', 'texture-carbon', 'texture-topo', 'texture-brushed', 'texture-noise', 'texture-hexagon', 'texture-circuit', 'texture-silk', 'texture-blueprint', 'texture-aurora', 'texture-bubbles'];

    if (!isHydrated) return null;
    if (globalSarak) return <>{children}</>;

    return (
        <SarakContext.Provider value={fallbackContextValue as any}>
            {children}
        </SarakContext.Provider>
    );
};

export default SarakUIProvider;
