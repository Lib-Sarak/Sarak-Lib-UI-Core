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
 * SarakUIProvider (Sovereign Motor v6.0 - Matrix Trace Engine)
 * 
 * Este é o motor visual soberano do ecossistema Sarak.
 * Seguindo a Skill Sarak-Lib v5.4.1:
 * - Lib-Shared: SSoT de Estado (Dados/Persistência).
 * - Lib-UI-Core: Motor Visual (Injeção CSS/DOM/Atributos).
 * 
 * Agora, o SarakUIProvider é responsável por injetar os tokens visuais mesmo quando 
 * consome dados do SarakProvider global.
 */
export const SarakUIProvider: React.FC<SarakUIProviderProps> = ({ 
    children, 
    theme: propTheme, 
    mode: propMode, 
    primaryColor: propPrimary 
}) => {
    let globalSarak: any = null;
    try { globalSarak = useGlobalSarak(); } catch (e) { }

    // --- ESTADO LOCAL (FALLBACK DESIGN ENGINE 6.0) ---
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
    const [interfaceElasticity, setInterfaceElasticity] = useState(() => Number(localStorage.getItem('sarak_local_elasticity')) || 1.0);

    const [isHydrated, setIsHydrated] = useState(false);

    // Injeção de Fontes Premium
    useEffect(() => {
        if (typeof document === 'undefined') return;
        const ID = 'sarak-core-fonts-v6.0';
        if (document.getElementById(ID)) return;
        const style = document.createElement('style');
        style.id = ID;
        style.textContent = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800;900&family=Space+Grotesk:wght@300;500;700&family=Fira+Code:wght@400;500&family=Outfit:wght@300;400;600;700&family=JetBrains+Mono:wght@400;700&family=Satoshi:wght@300;400;700;900&family=Syncopate:wght@700&family=Tenor+Sans&family=Crimson+Pro:wght@400;700&family=Plus+Jakarta+Sans:wght@400;700&display=swap');`;
        document.head.prepend(style);
    }, []);

    // SSSoT Consumidor: Resolve qual valor usar (Global ou Local)
    const s = globalSarak || {};
    const effective = {
        layout: s.layout || localLayout,
        mode: s.mode || localMode,
        primary: s.primaryColor || localPrimary,
        density: s.layoutDensity || localDensity,
        texture: s.texture || localTexture,
        navStyle: s.navigationStyle || localNavStyle,
        sidebarWidth: s.sidebarWidth || localSidebarWidth,
        headingFont: s.headingFont || headingFont,
        subtitleFont: s.subtitleFont || subtitleFont,
        tabFont: s.tabFont || tabFont,
        bodyFont: s.bodyFont || bodyFont,
        headingWeight: s.headingWeight || headingWeight,
        headingSpacing: s.headingLetterSpacing || headingLetterSpacing,
        borderRadius: s.borderRadius || borderRadius,
        borderWidth: s.borderWidth || borderWidth,
        borderStyle: s.borderStyle || borderStyle,
        glassOpacity: s.glassOpacity || glassOpacity,
        glassBlur: s.glassBlur || glassBlur,
        shadowIntensity: s.shadowIntensity || shadowIntensity,
        isGeometric: s.isGeometricCut || isGeometricCut,
        textureOpacity: s.textureOpacity || textureOpacity,
        animSpeed: s.animationSpeed || animationSpeed,
        gap: s.layoutGap || layoutGap,
        sysName: s.systemName || systemName,
        logoUrl: s.logoUrl || logoUrl,
        logoDarkUrl: s.logoDarkUrl || logoDarkUrl,
        logoScale: s.logoScale || logoScale,
        logoPos: s.logoPosition || logoPosition,
        sysTone: s.systemTone || systemTone,
        surface: s.surfaceMaterial || surfaceMaterial,
        borderType: s.borderType || borderType,
        elasticity: s.interfaceElasticity || interfaceElasticity,
        isSplit: s.isSplitViewEnabled || isSplitViewEnabled,
        chartS: s.chartStyle || chartStyle,
        chartP: s.chartPalette || chartPalette,
        shOrient: s.shadowOrientation || shadowOrientation,
        shMode: s.shadowColorMode || shadowColorMode,
        isAutoHide: s.isAutoHideEnabled || false
    };

    // Motor de Design Sovereign (Matrix Trace Engine v6.0)
    useEffect(() => {
        const root = document.documentElement;
        const body = document.body;

        try {
            const tokens: Record<string, string> = {
                '--primary-color': effective.primary,
                '--theme-primary': effective.primary,
                '--sidebar-width': `${effective.sidebarWidth}px`,
                '--font-heading': effective.headingFont || "'Satoshi', sans-serif",
                '--font-subtitle': effective.subtitleFont || effective.headingFont || "'Satoshi', sans-serif",
                '--font-tab': effective.tabFont || effective.headingFont || "'Satoshi', sans-serif",
                '--font-main': effective.bodyFont || "'Inter', sans-serif",
                '--heading-weight': effective.headingWeight,
                '--heading-spacing': effective.headingSpacing,
                '--radius-theme': `${effective.borderRadius}px`,
                '--border-width': `${effective.borderWidth}px`,
                '--border-style': effective.borderStyle,
                '--theme-gap': `${effective.gap}px`,
                '--glass-blur': `${effective.glassBlur}px`,
                '--glass-opacity': effective.glassOpacity.toString(),
                '--shadow-intensity': effective.shadowIntensity.toString(),
                '--texture-opacity': effective.textureOpacity.toString(),
                '--animation-speed': `${effective.animSpeed}s`,
                '--chart-style': effective.chartS,
                '--chart-palette': Array.isArray(effective.chartP) ? effective.chartP.join(',') : effective.chartP,
                '--shadow-orientation': effective.shOrient,
                '--shadow-color-mode': effective.shMode,
                '--system-name': effective.sysName,
                '--logo-url': effective.logoUrl,
                '--logo-dark-url': effective.logoDarkUrl,
                '--logo-scale': effective.logoScale.toString(),
                '--logo-position': effective.logoPos,
                '--system-tone': effective.sysTone,
                '--interface-elasticity': effective.elasticity.toString(),
                '--is-split-view': effective.isSplit ? '1' : '0'
            };

            // Atomic Matrix Sync Logs
            console.group('%c🚀 [Matrix Trace] UI-Core Sovereign Engine', 'background: #0f172a; color: #38bdf8; padding: 4px;');
            console.log('Source:', globalSarak ? 'GLOBAL (Shared)' : 'LOCAL (Solo)');
            console.log('Archetype:', effective.layout.toUpperCase());
            console.log('Mode:', effective.mode);
            console.log('Injected Tokens:', tokens);
            
            Object.entries(tokens).forEach(([k, v]) => {
                if (v !== undefined) root.style.setProperty(k, v);
            });
            console.groupEnd();

            // Classes & Attributes Sovereign Control
            const sarakClasses = Object.values(LAYOUTS).map((l: any) => l.class).filter(Boolean);
            const textureClasses = ['texture-none', 'texture-grid', 'texture-dots', 'texture-scanlines', 'texture-carbon', 'texture-topo', 'texture-brushed', 'texture-noise', 'texture-hexagon', 'texture-circuit', 'texture-silk', 'texture-blueprint', 'texture-aurora', 'texture-bubbles'];
            const densityClasses = ['density-compact', 'density-standard', 'density-comfortable'];
            
            body.classList.remove(...sarakClasses, 'light', 'dark', ...textureClasses, ...densityClasses, 'is-geometric', 'nav-sidebar', 'nav-topbar');
            body.classList.add(`layout-${effective.layout}`, effective.mode === 'dark' ? 'dark' : 'light', `density-${effective.density}`, `texture-${effective.texture}`, `nav-${effective.navStyle}`);
            if (effective.isGeometric) body.classList.add('is-geometric');

            body.setAttribute('data-surface', effective.surface);
            body.setAttribute('data-border', effective.borderType);

            // Persistência Fallback (apenas se for modo Solo)
            if (!globalSarak) {
                const map: Record<string, string> = {
                    sarak_local_layout: localLayout, sarak_local_mode: localMode, sarak_local_primary: localPrimary,
                    sarak_local_radius: borderRadius.toString(), sarak_local_sys_name: systemName
                };
                Object.entries(map).forEach(([k, v]) => localStorage.setItem(k, v));
            }

            setIsHydrated(true);
        } catch (error) {
            console.error('❌ [Matrix Trace Engine Failure]', error);
        }
    }, [effective, globalSarak]);

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
        interfaceElasticity, setInterfaceElasticity,
        applyFullConfig: (c: any) => {
            if (c.layout) setLocalLayout(c.layout);
            if (c.mode) setLocalMode(c.mode);
            if (c.primaryColor) setLocalPrimary(c.primaryColor);
            if (c.borderRadius) setBorderRadius(c.borderRadius);
            if (c.surfaceMaterial) setSurfaceMaterial(c.surfaceMaterial);
            if (c.systemName) setSystemName(c.systemName);
        },
        layouts: LAYOUTS, isHydrated: true, loading: false
    }), [
        localLayout, localMode, localPrimary, localDensity, localTexture,
        headingFont, subtitleFont, tabFont, bodyFont, headingWeight, headingLetterSpacing,
        borderRadius, borderWidth, borderStyle, isGeometricCut, shadowIntensity,
        glassOpacity, glassBlur, textureOpacity, animationSpeed, localSidebarWidth, localNavStyle,
        surfaceMaterial, borderType, systemName, chartStyle, chartPalette, shadowOrientation,
        shadowColorMode, isSplitViewEnabled, searchStyle, layoutGap, interfaceElasticity
    ]);

    if (!isHydrated) return null;

    // Sovereignty: Se houver contexto global, usamos o motor local mas passamos os dados adiante.
    // O SarakContext do Shared DEVE ser respeitado como SSoT de dados.
    return (
        <SarakContext.Provider value={(globalSarak || fallbackContextValue) as any}>
            {children}
        </SarakContext.Provider>
    );
};

export default SarakUIProvider;
