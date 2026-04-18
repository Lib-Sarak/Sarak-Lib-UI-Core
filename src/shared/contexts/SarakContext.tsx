import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getRegisteredModules } from '@sarak/lib-shared';
import { LAYOUTS, SCALES, DENSITY, LANGUAGES } from '../../constants/design-tokens';
import { ISarakEngines, SarakModule } from '../types';

/**
 * Sarak Sovereign Context (v5.5 - Matrix Sovereign)
 * 
 * Agora o UI-Core detém o estado global e a gestão de design tokens.
 */

export interface SarakContextType {
    user: any;
    token: string | null;
    loggedIn: boolean;
    loading: boolean;
    isHydrated: boolean;
    login: (token: string, user: any) => void;
    logout: () => void;
    registeredModules: SarakModule[];
    layout: string;
    setLayout: (layout: string) => void;
    mode: 'light' | 'dark' | 'system';
    setMode: (mode: 'light' | 'dark' | 'system') => void;
    toggleMode: () => void;
    primaryColor: string;
    setPrimaryColor: (color: string) => void;
    sidebarWidth: number;
    setSidebarWidth: (width: number) => void;
    fontScale: string;
    setFontScale: (scale: string) => void;
    layoutDensity: string;
    setLayoutDensity: (density: string) => void;
    navigationStyle: 'sidebar' | 'topbar' | 'dock';
    setNavigationStyle: (style: 'sidebar' | 'topbar' | 'dock') => void;
    texture: string;
    setTexture: (texture: string) => void;
    headingFont: string;
    setHeadingFont: (font: string) => void;
    bodyFont: string;
    setBodyFont: (font: string) => void;
    setLanguage: (lang: string) => void;
    enabledLanguages: string[];
    setEnabledLanguages: (langs: string[]) => void;
    availableLanguages: any[];
    discoveryEndpoints: string[];
    applyFullConfig: (config: any) => void;
    
    // Novas Propriedades de Design v6.0
    subtitleFont: string;
    setSubtitleFont: (font: string) => void;
    tabFont: string;
    setTabFont: (font: string) => void;
    headingWeight: string;
    setHeadingWeight: (weight: string) => void;
    headingLetterSpacing: string;
    setHeadingLetterSpacing: (spacing: string) => void;
    borderRadius: number;
    setBorderRadius: (radius: number) => void;
    borderWidth: number;
    setBorderWidth: (width: number) => void;
    borderStyle: string;
    setBorderStyle: (style: string) => void;
    glassOpacity: number;
    setGlassOpacity: (opacity: number) => void;
    glassBlur: number;
    setGlassBlur: (blur: number) => void;
    shadowIntensity: number;
    setShadowIntensity: (intensity: number) => void;
    isGeometricCut: boolean;
    setIsGeometricCut: (isCut: boolean) => void;
    textureOpacity: number;
    setTextureOpacity: (opacity: number) => void;
    animationSpeed: number;
    setAnimationSpeed: (speed: number) => void;
    layoutGap: number;
    setLayoutGap: (gap: number) => void;
    systemName: string;
    setSystemName: (name: string) => void;
    logoUrl: string;
    setLogoUrl: (url: string) => void;
    logoDarkUrl: string;
    setLogoDarkUrl: (url: string) => void;
    logoScale: number;
    setLogoScale: (scale: number) => void;
    logoPosition: 'left' | 'center';
    setLogoPosition: (pos: 'left' | 'center') => void;
    systemTone: 'formal' | 'friendly' | 'cyber';
    setSystemTone: (tone: 'formal' | 'friendly' | 'cyber') => void;
    emptyStateId: string;
    setEmptyStateId: (id: string) => void;
    surfaceMaterial: 'glass' | 'metallic' | 'brushed' | 'acrylic' | 'matte';
    setSurfaceMaterial: (v: 'glass' | 'metallic' | 'brushed' | 'acrylic' | 'matte') => void;
    borderType: 'default' | 'inlet' | 'neon' | 'beveled';
    setBorderType: (v: 'default' | 'inlet' | 'neon' | 'beveled') => void;
    cursorPhysics: boolean;
    setCursorPhysics: (v: boolean) => void;
    interfaceElasticity: number;
    setInterfaceElasticity: (v: number) => void;
    isSplitViewEnabled: boolean;
    setIsSplitViewEnabled: (v: boolean) => void;
    secondaryModuleId: string | null;
    setSecondaryModuleId: (v: string | null) => void;
    searchStyle: 'minimal' | 'command-palette';
    setSearchStyle: (v: 'minimal' | 'command-palette') => void;
    chartPalette: string[];
    setChartPalette: (colors: string[]) => void;
    chartStyle: 'line' | 'bar' | 'solid' | 'glass';
    setChartStyle: (style: 'line' | 'bar' | 'solid' | 'glass') => void;
    shadowOrientation: 'top-down' | 'isometric' | 'inner';
    setShadowOrientation: (v: 'top-down' | 'isometric' | 'inner') => void;
    shadowColorMode: 'neutral' | 'adaptive' | 'match';
    setShadowColorMode: (v: 'neutral' | 'adaptive' | 'match') => void;
    isAutoHideEnabled: boolean;
    setIsAutoHideEnabled: (enabled: boolean) => void;
    isNavHidden: boolean;
    setIsNavHidden: (hidden: boolean) => void;
}

export const SarakContext = createContext<SarakContextType | undefined>(undefined);

export const SarakProvider: React.FC<{ 
    children: ReactNode, 
    discoveryEndpoints?: string[],
    config?: any, 
    engines?: ISarakEngines 
}> = ({ 
    children, 
    discoveryEndpoints = [],
    config = {},
}) => {
    const [isHydrated, setIsHydrated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(() => {
        try {
            const stored = localStorage.getItem('sarak_user');
            return (stored && stored !== 'undefined') ? JSON.parse(stored) : null;
        } catch (e) { return null; }
    });

    const [token, setToken] = useState<string | null>(() => localStorage.getItem('sarak_token'));

    // --- State Management ---
    const [layout, setLayoutState] = useState(localStorage.getItem('sarak_layout') || config.theme || 'glass');
    const [mode, setModeState] = useState<'light' | 'dark' | 'system'>((localStorage.getItem('sarak_mode') as any) || 'dark');
    const [primaryColor, setPrimaryColorState] = useState(localStorage.getItem('sarak_primary_color') || '#3b82f6');
    const [sidebarWidth, setSidebarWidthState] = useState(Number(localStorage.getItem('sarak_sidebar_width')) || 260);
    const [fontScale, setFontScaleState] = useState(localStorage.getItem('sarak_font_scale') || 'm');
    const [layoutDensity, setLayoutDensityState] = useState(localStorage.getItem('sarak_layout_density') || 'standard');
    const [navigationStyle, setNavigationStyleState] = useState<'sidebar' | 'topbar' | 'dock'>((localStorage.getItem('sarak_nav_style') as any) || 'sidebar');
    const [texture, setTextureState] = useState(localStorage.getItem('sarak_texture') || 'none');
    const [headingFont, setHeadingFontState] = useState(localStorage.getItem('sarak_heading_font') || "'Inter', sans-serif");
    const [bodyFont, setBodyFontState] = useState(localStorage.getItem('sarak_body_font') || "'Inter', sans-serif");
    const [subtitleFont, setSubtitleFontState] = useState(localStorage.getItem('sarak_subtitle_font') || "'Inter', sans-serif");
    const [tabFont, setTabFontState] = useState(localStorage.getItem('sarak_tab_font') || "'Inter', sans-serif");
    const [headingWeight, setHeadingWeightState] = useState(localStorage.getItem('sarak_heading_weight') || '600');
    const [headingLetterSpacing, setHeadingLetterSpacingState] = useState(localStorage.getItem('sarak_heading_spacing') || 'normal');
    const [borderRadius, setBorderRadiusState] = useState(Number(localStorage.getItem('sarak_border_radius')) || 12);
    const [borderWidth, setBorderWidthState] = useState(Number(localStorage.getItem('sarak_border_width')) || 1);
    const [borderStyle, setBorderStyleState] = useState(localStorage.getItem('sarak_border_style') || 'solid');
    const [glassOpacity, setGlassOpacityState] = useState(Number(localStorage.getItem('sarak_glass_opacity')) || 0.7);
    const [glassBlur, setGlassBlurState] = useState(Number(localStorage.getItem('sarak_glass_blur')) || 15);
    const [shadowIntensity, setShadowIntensityState] = useState(Number(localStorage.getItem('sarak_shadow_intensity')) || 0.5);
    const [isGeometricCut, setIsGeometricCutState] = useState(localStorage.getItem('sarak_is_geometric') === 'true');
    const [textureOpacity, setTextureOpacityState] = useState(Number(localStorage.getItem('sarak_texture_opacity')) || 0.05);
    const [animationSpeed, setAnimationSpeedState] = useState(Number(localStorage.getItem('sarak_animation_speed')) || 0.4);
    const [layoutGap, setLayoutGapState] = useState(Number(localStorage.getItem('sarak_layout_gap')) || 20);
    const [systemName, setSystemNameState] = useState(localStorage.getItem('sarak_system_name') || 'Sarak Matrix');
    const [logoUrl, setLogoUrlState] = useState(localStorage.getItem('sarak_logo_url') || '');
    const [logoDarkUrl, setLogoDarkUrlState] = useState(localStorage.getItem('sarak_logo_dark_url') || '');
    const [logoScale, setLogoScaleState] = useState(Number(localStorage.getItem('sarak_logo_scale')) || 1.0);
    const [logoPosition, setLogoPositionState] = useState<'left' | 'center'>((localStorage.getItem('sarak_logo_position') as any) || 'left');
    const [systemTone, setSystemToneState] = useState<'formal' | 'friendly' | 'cyber'>((localStorage.getItem('sarak_system_tone') as any) || 'formal');
    const [emptyStateId, setEmptyStateIdState] = useState(localStorage.getItem('sarak_empty_state_id') || 'default');
    const [surfaceMaterial, setSurfaceMaterialState] = useState<'glass' | 'metallic' | 'brushed' | 'acrylic' | 'matte'>((localStorage.getItem('sarak_surface_material') as any) || 'glass');
    const [borderType, setBorderTypeState] = useState<'default' | 'inlet' | 'neon' | 'beveled'>((localStorage.getItem('sarak_border_type') as any) || 'default');
    const [cursorPhysics, setCursorPhysicsState] = useState(localStorage.getItem('sarak_cursor_physics') === 'true');
    const [interfaceElasticity, setInterfaceElasticityState] = useState(Number(localStorage.getItem('sarak_interface_elasticity')) || 1.0);
    const [isSplitViewEnabled, setIsSplitViewEnabledState] = useState(localStorage.getItem('sarak_split_view') === 'true');
    const [secondaryModuleId, setSecondaryModuleIdState] = useState<string | null>(localStorage.getItem('sarak_secondary_module'));
    const [searchStyle, setSearchStyleState] = useState<'minimal' | 'command-palette'>((localStorage.getItem('sarak_search_style') as any) || 'command-palette');
    const [chartPalette, setChartPaletteState] = useState<string[]>(() => JSON.parse(localStorage.getItem('sarak_chart_palette') || '[]'));
    const [chartStyle, setChartStyleState] = useState<'line' | 'bar' | 'solid' | 'glass'>((localStorage.getItem('sarak_chart_style') as any) || 'glass');
    const [shadowOrientation, setShadowOrientationState] = useState<'top-down' | 'isometric' | 'inner'>((localStorage.getItem('sarak_shadow_orientation') as any) || 'top-down');
    const [shadowColorMode, setShadowColorModeState] = useState<'neutral' | 'adaptive' | 'match'>((localStorage.getItem('sarak_shadow_color_mode') as any) || 'adaptive');
    const [isAutoHideEnabled, setIsAutoHideEnabledState] = useState(localStorage.getItem('sarak_auto_hide') === 'true');
    const [isNavHidden, setIsNavHiddenState] = useState(localStorage.getItem('sarak_nav_hidden') === 'true');
    const [language, setLanguageState] = useState(localStorage.getItem('sarak_lang') || 'pt');
    const [enabledLanguages, setEnabledLanguagesState] = useState<string[]>(() => {
        try {
            const stored = localStorage.getItem('sarak_enabled_langs');
            return stored ? JSON.parse(stored) : ['pt', 'en', 'es'];
        } catch (e) { return ['pt', 'en', 'es']; }
    });

    // --- Persistência Automática ---
    useEffect(() => {
        const configMap: Record<string, string> = {
            'sarak_layout': layout, 'sarak_mode': mode, 'sarak_primary_color': primaryColor,
            'sarak_sidebar_width': sidebarWidth.toString(), 'sarak_font_scale': fontScale,
            'sarak_layout_density': layoutDensity, 'sarak_nav_style': navigationStyle,
            'sarak_texture': texture, 'sarak_heading_font': headingFont, 'sarak_body_font': bodyFont,
            'sarak_subtitle_font': subtitleFont, 'sarak_tab_font': tabFont, 'sarak_heading_weight': headingWeight,
            'sarak_heading_spacing': headingLetterSpacing, 'sarak_border_radius': borderRadius.toString(),
            'sarak_border_width': borderWidth.toString(), 'sarak_border_style': borderStyle,
            'sarak_glass_opacity': glassOpacity.toString(), 'sarak_glass_blur': glassBlur.toString(),
            'sarak_shadow_intensity': shadowIntensity.toString(), 'sarak_is_geometric': isGeometricCut.toString(),
            'sarak_texture_opacity': textureOpacity.toString(), 'sarak_animation_speed': animationSpeed.toString(),
            'sarak_layout_gap': layoutGap.toString(), 'sarak_system_name': systemName,
            'sarak_logo_url': logoUrl, 'sarak_logo_dark_url': logoDarkUrl, 'sarak_logo_scale': logoScale.toString(),
            'sarak_logo_position': logoPosition, 'sarak_system_tone': systemTone, 'sarak_empty_state_id': emptyStateId,
            'sarak_surface_material': surfaceMaterial, 'sarak_border_type': borderType,
            'sarak_cursor_physics': cursorPhysics.toString(), 'sarak_interface_elasticity': interfaceElasticity.toString(),
            'sarak_split_view': isSplitViewEnabled.toString(), 'sarak_secondary_module': secondaryModuleId || '',
            'sarak_search_style': searchStyle, 'sarak_chart_palette': JSON.stringify(chartPalette),
            'sarak_chart_style': chartStyle, 'sarak_shadow_orientation': shadowOrientation,
            'sarak_shadow_color_mode': shadowColorMode, 'sarak_auto_hide': isAutoHideEnabled.toString(),
            'sarak_nav_hidden': isNavHidden.toString(),
            'sarak_lang': language,
            'sarak_enabled_langs': JSON.stringify(enabledLanguages)
        };
        Object.entries(configMap).forEach(([k, v]) => localStorage.setItem(k, v));
    }, [
        layout, mode, primaryColor, sidebarWidth, fontScale, layoutDensity, navigationStyle, texture,
        headingFont, bodyFont, subtitleFont, tabFont, headingWeight, headingLetterSpacing, 
        borderRadius, borderWidth, borderStyle, glassOpacity, glassBlur, shadowIntensity,
        isGeometricCut, textureOpacity, animationSpeed, layoutGap, systemName, logoUrl, logoDarkUrl,
        logoScale, logoPosition, systemTone, emptyStateId, surfaceMaterial, borderType,
        cursorPhysics, interfaceElasticity, isSplitViewEnabled, secondaryModuleId, searchStyle,
        chartPalette, chartStyle, shadowOrientation, shadowColorMode, isAutoHideEnabled, isNavHidden, language, enabledLanguages
    ]);

    const login = (newToken: string, newUser: any) => {
        setToken(newToken); setUser(newUser);
        localStorage.setItem('sarak_token', newToken);
        localStorage.setItem('sarak_user', JSON.stringify(newUser));
    };

    const logout = () => {
        setToken(null); setUser(null);
        localStorage.removeItem('sarak_token');
        localStorage.removeItem('sarak_user');
    };

    const applyFullConfig = (c: any) => {
        if (!c) return;
        if (c.layout) setLayoutState(c.layout);
        if (c.mode) setModeState(c.mode);
        // ... (Mais mapeamentos conforme necessário, mantido enxuto v5.5)
    };

    useEffect(() => { setIsHydrated(true); }, []);

    const value: SarakContextType = {
        user, token, loggedIn: !!token, loading, isHydrated, login, logout,
        registeredModules: getRegisteredModules(),
        layout, setLayout: (v) => { setLayoutState(v); localStorage.setItem('sarak_layout', v); },
        mode, setMode: (v) => { setModeState(v); localStorage.setItem('sarak_mode', v); },
        toggleMode: () => setModeState(prev => prev === 'dark' ? 'light' : 'dark'),
        primaryColor, setPrimaryColor: (v) => { setPrimaryColorState(v); localStorage.setItem('sarak_primary_color', v); },
        sidebarWidth, setSidebarWidth: (v) => { setSidebarWidthState(v); localStorage.setItem('sarak_sidebar_width', v.toString()); },
        fontScale, setFontScale: (v) => { setFontScaleState(v); localStorage.setItem('sarak_font_scale', v); },
        layoutDensity, setLayoutDensity: (v) => { setLayoutDensityState(v); localStorage.setItem('sarak_layout_density', v); },
        navigationStyle, setNavigationStyle: (v) => { setNavigationStyleState(v); localStorage.setItem('sarak_nav_style', v); },
        texture, setTexture: (v) => { setTextureState(v); localStorage.setItem('sarak_texture', v); },
        headingFont, setHeadingFont: (v) => { setHeadingFontState(v); localStorage.setItem('sarak_heading_font', v); },
        bodyFont, setBodyFont: (v) => { setBodyFontState(v); localStorage.setItem('sarak_body_font', v); },
        language, setLanguage: (v) => { setLanguageState(v); localStorage.setItem('sarak_lang', v); },
        enabledLanguages, setEnabledLanguages: (v) => { setEnabledLanguagesState(v); localStorage.setItem('sarak_enabled_langs', JSON.stringify(v)); },
        availableLanguages: LANGUAGES,
        discoveryEndpoints, applyFullConfig,
        
        // Deep Tokens Setters
        subtitleFont, setSubtitleFont: (v) => setSubtitleFontState(v),
        tabFont, setTabFont: (v) => setTabFontState(v),
        headingWeight, setHeadingWeight: (v) => setHeadingWeightState(v),
        headingLetterSpacing, setHeadingLetterSpacing: (v) => setHeadingLetterSpacingState(v),
        borderRadius, setBorderRadius: (v) => setBorderRadiusState(v),
        borderWidth, setBorderWidth: (v) => setBorderWidthState(v),
        borderStyle, setBorderStyle: (v) => setBorderStyleState(v),
        glassOpacity, setGlassOpacity: (v) => setGlassOpacityState(v),
        glassBlur, setGlassBlur: (v) => setGlassBlurState(v),
        shadowIntensity, setShadowIntensity: (v) => setShadowIntensityState(v),
        isGeometricCut, setIsGeometricCut: (v) => setIsGeometricCutState(v),
        textureOpacity, setTextureOpacity: (v) => setTextureOpacityState(v),
        animationSpeed, setAnimationSpeed: (v) => setAnimationSpeedState(v),
        layoutGap, setLayoutGap: (v) => setLayoutGapState(v),
        systemName, setSystemName: (v) => setSystemNameState(v),
        logoUrl, setLogoUrl: (v) => setLogoUrlState(v),
        logoDarkUrl, setLogoDarkUrl: (v) => setLogoDarkUrlState(v),
        logoScale, setLogoScale: (v) => setLogoScaleState(v),
        logoPosition, setLogoPosition: (v) => setLogoPositionState(v),
        systemTone, setSystemTone: (v) => setSystemToneState(v),
        emptyStateId, setEmptyStateId: (v) => setEmptyStateIdState(v),
        surfaceMaterial, setSurfaceMaterial: (v) => setSurfaceMaterialState(v),
        borderType, setBorderType: (v) => setBorderTypeState(v),
        cursorPhysics, setCursorPhysics: (v) => setCursorPhysicsState(v),
        interfaceElasticity, setInterfaceElasticity: (v) => setInterfaceElasticityState(v),
        isSplitViewEnabled, setIsSplitViewEnabled: (v) => setIsSplitViewEnabledState(v),
        secondaryModuleId, setSecondaryModuleId: (v) => setSecondaryModuleIdState(v),
        searchStyle, setSearchStyle: (v) => setSearchStyleState(v),
        chartPalette, setChartPalette: (v) => setChartPaletteState(v),
        chartStyle, setChartStyle: (v) => setChartStyleState(v),
        shadowOrientation, setShadowOrientation: (v) => setShadowOrientationState(v),
        shadowColorMode, setShadowColorMode: (v) => setShadowColorModeState(v),
        isAutoHideEnabled, setIsAutoHideEnabled: (v) => setIsAutoHideEnabledState(v),
        isNavHidden, setIsNavHidden: (v) => setIsNavHiddenState(v),
    };

    return <SarakContext.Provider value={value}>{children}</SarakContext.Provider>;
};

export const useSarak = () => {
    const context = useContext(SarakContext);
    if (!context) throw new Error('useSarak must be used within SarakProvider');
    return context;
};

export const useTheme = useSarak;
export const useLanguage = useSarak;
