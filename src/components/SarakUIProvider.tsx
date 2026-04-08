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

    // --- ESTADO LOCAL (FALLBACK DESIGN ENGINE 5.6) ---
    const [localLayout, setLocalLayout] = useState(() => localStorage.getItem('sarak_local_layout') || propTheme || 'glass');
    const [localMode, setLocalMode] = useState<'light' | 'dark' | 'system'>(() => (localStorage.getItem('sarak_local_mode') as any) || propMode || 'dark');
    const [localPrimary, setLocalPrimary] = useState(() => localStorage.getItem('sarak_local_primary') || propPrimary || '#3b82f6');
    const [localDensity, setLocalDensity] = useState(() => localStorage.getItem('sarak_local_density') || 'standard');
    const [localTexture, setLocalTexture] = useState(() => localStorage.getItem('sarak_local_texture') || 'none');
    const [localSidebarWidth, setLocalSidebarWidth] = useState(() => Number(localStorage.getItem('sarak_local_sidebar_width')) || 260);
    const [localNavStyle, setLocalNavStyle] = useState<'sidebar' | 'topbar'>(() => (localStorage.getItem('sarak_local_nav_style') as any) || 'sidebar');
    
    // Tokens Granulares
    const [headingFont, setHeadingFont] = useState(() => localStorage.getItem('sarak_local_font_h') || "");
    const [subtitleFont, setSubtitleFont] = useState(() => localStorage.getItem('sarak_local_font_s') || "");
    const [bodyFont, setBodyFont] = useState(() => localStorage.getItem('sarak_local_font_b') || "");
    const [headingWeight, setHeadingWeight] = useState(() => localStorage.getItem('sarak_local_weight_h') || '600');
    const [headingLetterSpacing, setHeadingLetterSpacing] = useState(() => localStorage.getItem('sarak_local_spacing_h') || 'normal');
    const [fontScale, setFontScale] = useState(() => localStorage.getItem('sarak_local_font_scale') || 'm');
    const [borderRadius, setBorderRadius] = useState(() => Number(localStorage.getItem('sarak_local_radius')) || 12);
    const [borderWidth, setBorderWidth] = useState(() => Number(localStorage.getItem('sarak_local_border_w')) || 1);
    const [borderStyle, setBorderStyle] = useState(() => localStorage.getItem('sarak_local_border_s') || 'solid');
    const [isGeometricCut, setIsGeometricCut] = useState(() => localStorage.getItem('sarak_local_is_geom') === 'true');
    const [shadowIntensity, setShadowIntensity] = useState(() => Number(localStorage.getItem('sarak_local_shadow')) || 0.5);
    const [glassOpacity, setGlassOpacity] = useState(() => Number(localStorage.getItem('sarak_local_glass_o')) || 0.7);
    const [glassBlur, setGlassBlur] = useState(() => Number(localStorage.getItem('sarak_local_glass_b')) || 15);
    const [textureOpacity, setTextureOpacity] = useState(() => Number(localStorage.getItem('sarak_local_texture_o')) || 0.05);
    const [animationSpeed, setAnimationSpeed] = useState(() => Number(localStorage.getItem('sarak_local_anim_v')) || 0.4);

    const [isHydrated, setIsHydrated] = useState(false);

    // Injeção de Fontes Premium
    useEffect(() => {
        if (typeof document === 'undefined') return;
        const ID = 'sarak-core-fonts-v5.6';
        if (document.getElementById(ID)) return;
        const style = document.createElement('style');
        style.id = ID;
        style.textContent = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800;900&family=Space+Grotesk:wght@300;500;700&family=Fira+Code:wght@400;500&family=Outfit:wght@300;400;600;700&family=JetBrains+Mono:wght@400;700&family=Satoshi:wght@300;400;700;900&family=Syncopate:wght@700&family=Tenor+Sans&family=Crimson+Pro:wght@400;700&display=swap');`;
        document.head.prepend(style);
    }, []);

    // Motor de Design 5.6 (Autonomous Matrix Trace)
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
                '--font-main': bodyFont || "'Inter', sans-serif",
                '--heading-weight': headingWeight,
                '--heading-spacing': headingLetterSpacing,
                '--radius-theme': `${borderRadius}px`,
                '--border-width': `${borderWidth}px`,
                '--border-style': borderStyle,
                '--glass-blur': `${glassBlur}px`,
                '--glass-opacity': glassOpacity.toString(),
                '--shadow-intensity': shadowIntensity.toString(),
                '--texture-opacity': textureOpacity.toString(),
                '--animation-speed': `${animationSpeed}s`
            };

            Object.entries(tokens).forEach(([k, v]) => root.style.setProperty(k, v));

            const scale = (SCALES as any)[fontScale.toUpperCase()] || SCALES.M;
            root.style.setProperty('--font-size-factor', scale.factor);

            const sarakClasses = Object.values(LAYOUTS).map((l: any) => l.class).filter(Boolean);
            const textureClasses = ['texture-none', 'texture-grid', 'texture-dots', 'texture-scanlines', 'texture-carbon', 'texture-topo', 'texture-brushed', 'texture-noise', 'texture-hexagon', 'texture-circuit', 'texture-silk', 'texture-blueprint'];
            const densityClasses = ['density-compact', 'density-standard', 'density-comfortable'];
            
            body.classList.remove(...sarakClasses, 'light', 'dark', ...textureClasses, ...densityClasses, 'is-geometric');
            body.classList.add(`layout-${localLayout}`, localMode === 'dark' ? 'dark' : 'light', `density-${localDensity}`, `texture-${localTexture}`);
            if (isGeometricCut) body.classList.add('is-geometric');

            // Persistência local design-engine (autonomous)
            const map: Record<string, string> = {
                sarak_local_layout: localLayout, sarak_local_mode: localMode, sarak_local_primary: localPrimary,
                sarak_local_density: localDensity, sarak_local_texture: localTexture, sarak_local_radius: borderRadius.toString(),
                sarak_local_glass_o: glassOpacity.toString(), sarak_local_is_geom: isGeometricCut.toString(),
                sarak_local_font_h: headingFont
            };
            Object.entries(map).forEach(([k, v]) => localStorage.setItem(k, v));

            // Autonomous Matrix Trace
            console.log(`%c🛰️ [Matrix Trace] Autonomous Mode 5.6: ${localLayout.toUpperCase()} | Radius: ${borderRadius}px`, 'color: #38bdf8; font-weight: italic;');
            
            setIsHydrated(true);
        } catch (error) {
            console.error('❌ [SarakUIProvider Failure]', error);
        }
    }, [
        globalSarak, localLayout, localMode, localPrimary, localDensity, localTexture,
        headingFont, subtitleFont, bodyFont, headingWeight, headingLetterSpacing,
        borderRadius, borderWidth, borderStyle, isGeometricCut, shadowIntensity,
        glassOpacity, glassBlur, textureOpacity, animationSpeed, localSidebarWidth
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
        headingFont, setHeadingFont, subtitleFont, setSubtitleFont, bodyFont, setBodyFont,
        headingWeight, setHeadingWeight, headingLetterSpacing, setHeadingLetterSpacing,
        fontScale, setFontScale, borderRadius, setBorderRadius, borderWidth, setBorderWidth,
        borderStyle, setBorderStyle, isGeometricCut, setIsGeometricCut, shadowIntensity, setShadowIntensity,
        glassOpacity, setGlassOpacity, glassBlur, setGlassBlur, textureOpacity, setTextureOpacity,
        animationSpeed, setAnimationSpeed, layouts: LAYOUTS, isHydrated: true, loading: false
    }), [
        localLayout, localMode, localPrimary, localDensity, localTexture,
        headingFont, subtitleFont, bodyFont, headingWeight, headingLetterSpacing,
        borderRadius, borderWidth, borderStyle, isGeometricCut, shadowIntensity,
        glassOpacity, glassBlur, textureOpacity, animationSpeed, localSidebarWidth, localNavStyle
    ]);

    if (!isHydrated) return null;
    if (globalSarak) return <>{children}</>;

    return (
        <SarakContext.Provider value={fallbackContextValue as any}>
            {children}
        </SarakContext.Provider>
    );
};

export default SarakUIProvider;
