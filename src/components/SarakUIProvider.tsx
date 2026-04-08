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
 * SarakUIProvider (Elite v5.5.0 - Design Engine compatible)
 * 
 * Motor de UI Federado: 
 * 1. Se estiver dentro de um SarakProvider (Shared), atua apenas como ponte.
 * 2. Se estiver isolado, assume o controle total do estado estético com paridade Design Engine 5.5.
 */
export const SarakUIProvider: React.FC<SarakUIProviderProps> = ({ 
    children, 
    theme: propTheme, 
    mode: propMode, 
    primaryColor: propPrimary 
}) => {
    // Tenta obter o contexto global da Shared
    let globalSarak: any = null;
    try {
        globalSarak = useGlobalSarak();
    } catch (e) {
        // Shared não presente ou Provider ausente na árvore
    }

    // --- ESTADO LOCAL (FALLBACK DESIGN ENGINE 5.5) ---
    // Bases
    const [localLayout, setLocalLayout] = useState(() => localStorage.getItem('sarak_local_layout') || propTheme || 'glass');
    const [localMode, setLocalMode] = useState<'light' | 'dark' | 'system'>(() => (localStorage.getItem('sarak_local_mode') as any) || propMode || 'dark');
    const [localPrimary, setLocalPrimary] = useState(() => localStorage.getItem('sarak_local_primary') || propPrimary || '#3b82f6');
    const [localDensity, setLocalDensity] = useState(() => localStorage.getItem('sarak_local_density') || 'standard');
    const [localTexture, setLocalTexture] = useState(() => localStorage.getItem('sarak_local_texture') || 'none');
    const [localSidebarWidth, setLocalSidebarWidth] = useState(() => Number(localStorage.getItem('sarak_local_sidebar_width')) || 260);
    const [localNavStyle, setLocalNavStyle] = useState<'sidebar' | 'topbar'>(() => (localStorage.getItem('sarak_local_nav_style') as any) || 'sidebar');
    
    // Tipografia 5.5
    const [headingFont, setHeadingFont] = useState(() => localStorage.getItem('sarak_font_heading') || "'Inter', sans-serif");
    const [subtitleFont, setSubtitleFont] = useState(() => localStorage.getItem('sarak_font_subtitle') || "'Inter', sans-serif");
    const [bodyFont, setBodyFont] = useState(() => localStorage.getItem('sarak_font_body') || "'Inter', sans-serif");
    const [headingWeight, setHeadingWeight] = useState(() => localStorage.getItem('sarak_weight_heading') || '700');
    const [headingLetterSpacing, setHeadingLetterSpacing] = useState(() => localStorage.getItem('sarak_spacing_heading') || '0px');
    const [fontScale, setFontScale] = useState(() => localStorage.getItem('sarak_font_scale') || 'm');

    // Geometria 5.5
    const [borderRadius, setBorderRadius] = useState(() => Number(localStorage.getItem('sarak_radius')) || 16);
    const [borderWidth, setBorderWidth] = useState(() => Number(localStorage.getItem('sarak_border_width')) || 1);
    const [borderStyle, setBorderStyle] = useState(() => localStorage.getItem('sarak_border_style') || 'solid');
    const [isGeometricCut, setIsGeometricCut] = useState(() => localStorage.getItem('sarak_is_geometric') === 'true');
    const [shadowIntensity, setShadowIntensity] = useState(() => Number(localStorage.getItem('sarak_shadow_intensity')) || 0.4);

    // Atmosfera 5.5
    const [glassOpacity, setGlassOpacity] = useState(() => Number(localStorage.getItem('sarak_glass_opacity')) || 0.1);
    const [glassBlur, setGlassBlur] = useState(() => Number(localStorage.getItem('sarak_glass_blur')) || 10);
    const [textureOpacity, setTextureOpacity] = useState(() => Number(localStorage.getItem('sarak_texture_opacity')) || 0.05);
    
    // Movimento 5.5
    const [animationSpeed, setAnimationSpeed] = useState(() => Number(localStorage.getItem('sarak_anim_speed')) || 0.4);
    const [animationStyle, setAnimationStyle] = useState(() => localStorage.getItem('sarak_anim_style') || 'slide');

    const [isHydrated, setIsHydrated] = useState(false);

    // Injeção de Fontes
    useEffect(() => {
        if (typeof document === 'undefined') return;
        const FONT_ID = 'sarak-core-fonts';
        if (document.getElementById(FONT_ID)) return;

        const style = document.createElement('style');
        style.id = FONT_ID;
        style.textContent = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800;900&family=Space+Grotesk:wght@300;500;700&family=Fira+Code:wght@400;500&family=Outfit:wght@300;400;600;700&family=JetBrains+Mono:wght@400;700&family=Satoshi:wght@300;400;700;900&family=Syncopate:wght@700&family=Tenor+Sans&family=Crimson+Pro:wght@400;700&display=swap');`;
        document.head.prepend(style);
    }, []);

    // Motor de Injeção de Design 5.5 (Autonomous Mode)
    useEffect(() => {
        if (globalSarak) {
            setIsHydrated(true);
            return;
        }

        const root = document.documentElement;
        const body = document.body;

        try {
            // Sincronização Base
            root.style.setProperty('--primary-color', localPrimary);
            root.style.setProperty('--theme-primary', localPrimary);
            
            // Design Engine 5.5 Tokens
            root.style.setProperty('--font-main', bodyFont);
            root.style.setProperty('--font-heading', headingFont);
            root.style.setProperty('--font-subtitle', subtitleFont);
            root.style.setProperty('--heading-weight', headingWeight);
            root.style.setProperty('--heading-spacing', headingLetterSpacing);
            
            root.style.setProperty('--radius-theme', `${borderRadius}px`);
            root.style.setProperty('--border-width', `${borderWidth}px`);
            root.style.setProperty('--border-style', borderStyle);
            root.style.setProperty('--glass-blur', `${glassBlur}px`);
            root.style.setProperty('--glass-opacity', glassOpacity.toString());
            root.style.setProperty('--shadow-intensity', shadowIntensity.toString());
            root.style.setProperty('--texture-opacity', textureOpacity.toString());
            root.style.setProperty('--animation-speed', `${animationSpeed}s`);
            root.style.setProperty('--sidebar-width', `${localSidebarWidth}px`);

            // Escala Global
            const scale = (SCALES as any)[fontScale.toUpperCase()] || SCALES.M;
            root.style.setProperty('--font-size-factor', scale.factor);
            root.style.setProperty('--sarak-font-size', `${16 * parseFloat(scale.factor)}px`);

            // Classes de Contexto
            const lowerLayout = localLayout?.toLowerCase() || 'glass';
            const layoutConfig = Object.values(LAYOUTS).find((l: any) => l.id.toLowerCase() === lowerLayout) || LAYOUTS.GLASS;
            
            const sarakClasses = Object.values(LAYOUTS).map((l: any) => l.class).filter(Boolean);
            const textureClasses = ['texture-none', 'texture-grid', 'texture-dots', 'texture-carbon', 'texture-topo'];
            const densityClasses = ['density-compact', 'density-standard', 'density-comfortable'];
            
            body.classList.remove(...sarakClasses, 'light', 'dark', ...textureClasses, ...densityClasses, 'is-geometric');
            body.classList.add(
                layoutConfig.class || 'layout-glass', 
                localMode === 'dark' ? 'dark' : 'light',
                `density-${localDensity}`,
                `texture-${localTexture}`
            );
            if (isGeometricCut) body.classList.add('is-geometric');

            // Persistência design-engine specific
            localStorage.setItem('sarak_local_layout', localLayout);
            localStorage.setItem('sarak_local_mode', localMode);
            localStorage.setItem('sarak_local_primary', localPrimary);
            localStorage.setItem('sarak_local_density', localDensity);
            localStorage.setItem('sarak_local_texture', localTexture);
            localStorage.setItem('sarak_radius', borderRadius.toString());
            localStorage.setItem('sarak_border_width', borderWidth.toString());
            localStorage.setItem('sarak_glass_opacity', glassOpacity.toString());
            localStorage.setItem('sarak_is_geometric', isGeometricCut.toString());
            localStorage.setItem('sarak_font_heading', headingFont);
            
            setIsHydrated(true);
        } catch (error) {
            console.error('❌ [SarakUIProvider Error] Design Engine Fallback failed:', error);
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
        toggleMode: () => setLocalMode(prev => prev === 'dark' ? 'light' : 'dark'),
        primaryColor: localPrimary, setPrimaryColor: setLocalPrimary,
        sidebarWidth: localSidebarWidth, setSidebarWidth: setLocalSidebarWidth,
        navigationStyle: localNavStyle, setNavigationStyle: setLocalNavStyle,
        layoutDensity: localDensity, setLayoutDensity: setLocalDensity,
        texture: localTexture, setTexture: setLocalTexture,
        
        // Granular Design Engine
        headingFont, setHeadingFont,
        subtitleFont, setSubtitleFont,
        bodyFont, setBodyFont,
        headingWeight, setHeadingWeight,
        headingLetterSpacing, setHeadingLetterSpacing,
        fontScale, setFontScale,
        borderRadius, setBorderRadius,
        borderWidth, setBorderWidth,
        borderStyle, setBorderStyle,
        isGeometricCut, setIsGeometricCut,
        shadowIntensity, setShadowIntensity,
        glassOpacity, setGlassOpacity,
        glassBlur, setGlassBlur,
        textureOpacity, setTextureOpacity,
        animationSpeed, setAnimationSpeed,
        animationStyle, setAnimationStyle,

        layouts: LAYOUTS,
        customThemes: [],
        emojiSet: 'default',
        setEmojiSet: () => {},
        isHydrated: true,
        loading: false
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
