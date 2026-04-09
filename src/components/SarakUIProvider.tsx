import React, { ReactNode, useEffect, useState, useMemo, useCallback, useContext } from 'react';
import '../styles/sarak-base.css';
import { LAYOUTS, SCALES, DENSITY, SarakContext } from '@sarak/lib-shared';
import { useSarak as useGlobalSarak } from '@sarak/lib-shared';

// --- SARAK UI BRIDGE CONTEXT (Independência 100%) ---
export interface SarakUIContextType {
    effective: any;
    applyFullConfig: (config: any) => void;
    isStandalone: boolean;
}

const UIContext = React.createContext<SarakUIContextType | undefined>(undefined);

export const useSarakUI = () => {
    const context = useContext(UIContext);
    if (!context) {
        // Fallback para componentes que podem ser usados fora do Provider (não recomendado)
        return { effective: {}, applyFullConfig: () => {}, isStandalone: true };
    }
    return context;
};

interface SarakUIProviderProps {
    children: ReactNode;
    theme?: string;
    mode?: 'light' | 'dark' | 'system';
    primaryColor?: string;
}

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
    const [cursorPhysics, setCursorPhysics] = useState(() => localStorage.getItem('sarak_local_cursor') === 'true' || true);
    const [localIsNavHidden, setLocalIsNavHidden] = useState(() => localStorage.getItem('sarak_local_nav_hidden') === 'true' || false);

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

    const s = globalSarak || {};
    
    // SSSoT Consumidor SOBERANO (Sem Guards)
    const effective = {
        layout: s.layout || localLayout,
        mode: s.mode || localMode,
        primaryColor: s.primaryColor || localPrimary,
        layoutDensity: s.layoutDensity || localDensity,
        texture: s.texture || localTexture,
        navigationStyle: s.navigationStyle || localNavStyle,
        sidebarWidth: s.sidebarWidth !== undefined ? s.sidebarWidth : localSidebarWidth,
        headingFont: s.headingFont || headingFont,
        subtitleFont: s.subtitleFont || subtitleFont,
        tabFont: s.tabFont || tabFont,
        bodyFont: s.bodyFont || bodyFont,
        headingWeight: s.headingWeight || headingWeight,
        headingLetterSpacing: s.headingLetterSpacing || headingLetterSpacing,
        borderRadius: s.borderRadius !== undefined ? s.borderRadius : borderRadius,
        borderWidth: s.borderWidth !== undefined ? s.borderWidth : borderWidth,
        borderStyle: s.borderStyle || borderStyle,
        glassOpacity: s.glassOpacity !== undefined ? s.glassOpacity : glassOpacity,
        glassBlur: s.glassBlur !== undefined ? s.glassBlur : glassBlur,
        shadowIntensity: s.shadowIntensity !== undefined ? s.shadowIntensity : shadowIntensity,
        isGeometricCut: s.isGeometricCut !== undefined ? s.isGeometricCut : isGeometricCut,
        textureOpacity: s.textureOpacity !== undefined ? s.textureOpacity : textureOpacity,
        animationSpeed: s.animationSpeed !== undefined ? s.animationSpeed : animationSpeed,
        layoutGap: s.layoutGap !== undefined ? s.layoutGap : layoutGap,
        systemName: s.systemName || systemName,
        logoUrl: s.logoUrl || logoUrl,
        logoDarkUrl: s.logoDarkUrl || logoDarkUrl,
        logoScale: s.logoScale !== undefined ? s.logoScale : logoScale,
        logoPosition: s.logoPosition || logoPosition,
        systemTone: s.systemTone || systemTone,
        surfaceMaterial: s.surfaceMaterial || surfaceMaterial,
        borderType: s.borderType || borderType,
        interfaceElasticity: s.interfaceElasticity !== undefined ? s.interfaceElasticity : interfaceElasticity,
        isSplitViewEnabled: s.isSplitViewEnabled !== undefined ? s.isSplitViewEnabled : isSplitViewEnabled,
        chartStyle: s.chartStyle || chartStyle,
        chartPalette: s.chartPalette || chartPalette,
        shadowOrientation: s.shadowOrientation || shadowOrientation,
        shadowColorMode: s.shadowColorMode || shadowColorMode,
        isAutoHideEnabled: s.isAutoHideEnabled || false,
        cursorPhysics: s.cursorPhysics !== undefined ? s.cursorPhysics : cursorPhysics,
        isNavHidden: s.isNavHidden !== undefined ? s.isNavHidden : localIsNavHidden,
        registeredModules: s.registeredModules || []
    };

    // Motor de Design Sovereign (Matrix Trace Engine v6.1)
    useEffect(() => {
        if (typeof document === 'undefined') return;
        const root = document.documentElement;
        const body = document.body;

        try {
            // --- DESIGN ENGINE SOVEREIGN MOTOR v6.1 (DYNAMIC) ---
            const tokens: Record<string, string> = {};

            // 1. Mapeamento Dinâmico Inteligente
            // Transforma camelCase do estado para --kebab-case no CSS automaticamente
            Object.entries(effective).forEach(([key, value]: [string, any]) => {
                if (value === undefined || value === null) return;

                // Converte camelCase para kebab-case (Ex: sidebarWidth -> sidebar-width)
                const cssKey = `--sarak-${key.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()}`;
                
                let finalValue = value.toString();

                // Tratamento de Unidades e Tipos (Proteção Soberana v6.1)
                if (typeof value === 'number') {
                    if (['sidebarWidth', 'borderRadius', 'borderWidth', 'layoutGap', 'glassBlur'].includes(key)) {
                        finalValue = `${value}px`;
                    } else if (['animationSpeed'].includes(key)) {
                        finalValue = `${value}s`;
                    }
                } else if (typeof value === 'boolean') {
                    finalValue = value ? '1' : '0';
                } else if (Array.isArray(value)) {
                    finalValue = value.join(',');
                } else if (!value) {
                    finalValue = '';
                }

                tokens[cssKey] = finalValue;
                
                // 2. Ponte de Compatibilidade (Tokens Legados / Core)
                // Essencial para manter a sincronização com sarak-base.css e módulos v5.x
                const legacyMap: Record<string, string> = {
                    primaryColor: '--theme-primary',
                    sidebarWidth: '--sidebar-width',
                    headingFont: '--font-heading',
                    subtitleFont: '--font-subtitle',
                    tabFont: '--font-tab',
                    bodyFont: '--font-main',
                    headingWeight: '--heading-weight',
                    headingLetterSpacing: '--heading-spacing',
                    borderRadius: '--radius-theme',
                    borderWidth: '--border-width',
                    borderStyle: '--border-style',
                    layoutGap: '--theme-gap',
                    glassOpacity: '--glass-opacity',
                    glassBlur: '--glass-blur',
                    shadowIntensity: '--shadow-intensity',
                    mode: '--sarak-mode',
                    textureOpacity: '--texture-opacity',
                    animationSpeed: '--animation-speed'
                };
                if (legacyMap[key]) tokens[legacyMap[key]] = finalValue;
            });

            // Alias extras de marca
            tokens['--primary-color'] = effective.primaryColor;

            // Atomic Matrix Sync Logs
            console.group('%c🚀 [Matrix Trace] UI-Core Sovereign Dynamic Engine v6.1', 'background: #0f172a; color: #38bdf8; padding: 4px; font-weight: bold;');
            console.log('📡 Origem:', globalSarak ? 'SHARED (SSoT)' : 'LOCAL');
            console.log('📦 Tokens Dinâmicos Generativos:', tokens);
            
            Object.entries(tokens).forEach(([k, v]) => {
                root.style.setProperty(k, v);
                
                // AUDITORIA DE DISCREPÂNCIA EM TEMPO REAL
                // Verifica se o navegador aceitou o valor ou se algo sobrescreveu
                setTimeout(() => {
                    const computed = getComputedStyle(root).getPropertyValue(k);
                    if (computed.trim() !== v.toString().trim() && v !== '') {
                        console.warn(`%c⚠️ [Matrix Trace] DIVERGÊNCIA DETECTADA: ${k}`, 'color: #ef4444; font-weight: bold;', {
                            injetado: v,
                            computado: computed,
                            motivo: 'O valor foi ignorado pelo navegador (unidade inválida) ou sobrescrito por CSS global (!important).'
                        });
                    }
                }, 100);
            });
            console.groupEnd();

            // Classes & Attributes Sovereign Control
            const sarakClasses = Object.values(LAYOUTS).map((l: any) => l.class).filter(Boolean);
            const textureClasses = ['texture-none', 'texture-grid', 'texture-dots', 'texture-scanlines', 'texture-carbon', 'texture-topo', 'texture-brushed', 'texture-noise', 'texture-hexagon', 'texture-circuit', 'texture-silk', 'texture-blueprint', 'texture-aurora', 'texture-bubbles'];
            const densityClasses = ['density-compact', 'density-standard', 'density-comfortable'];
            
            body.classList.remove(...sarakClasses, 'light', 'dark', ...textureClasses, ...densityClasses, 'is-geometric', 'nav-sidebar', 'nav-topbar');
            body.classList.add(`layout-${effective.layout}`, effective.mode === 'dark' ? 'dark' : 'light', `density-${effective.layoutDensity}`, `texture-${effective.texture}`, `nav-${effective.navigationStyle}`);
            if (effective.isGeometricCut) body.classList.add('is-geometric');

            body.setAttribute('data-surface', effective.surfaceMaterial);
            body.setAttribute('data-border', effective.borderType);

            // Persistência Fallback (apenas se for modo Solo)
            if (!globalSarak) {
                const map: Record<string, string> = {
                    sarak_local_layout: localLayout, sarak_local_mode: localMode, sarak_local_primary: localPrimary,
                    sarak_local_radius: (effective.borderRadius || 12).toString(), sarak_local_sys_name: (effective.sysName || 'Sarak Matrix')
                };
                Object.entries(map).forEach(([k, v]) => localStorage.setItem(k, v));
            }

            setIsHydrated(true);
        } catch (error) {
            console.error('❌ [Matrix Trace Engine Failure]', error);
        }
    }, [
        effective.layout, effective.mode, effective.primaryColor, effective.layoutDensity, effective.texture,
        effective.navigationStyle, effective.sidebarWidth, effective.headingFont, effective.subtitleFont,
        effective.tabFont, effective.bodyFont, effective.headingWeight, effective.headingLetterSpacing,
        effective.borderRadius, effective.borderWidth, effective.borderStyle, effective.glassOpacity,
        effective.glassBlur, effective.shadowIntensity, effective.isGeometricCut, effective.textureOpacity,
        effective.animationSpeed, effective.layoutGap, effective.systemName, effective.logoUrl, effective.logoDarkUrl,
        effective.logoScale, effective.logoPosition, effective.systemTone, effective.surfaceMaterial, effective.borderType,
        effective.interfaceElasticity, effective.isSplitViewEnabled, effective.chartStyle, effective.chartPalette, effective.shadowOrientation,
        effective.shadowColorMode, effective.isAutoHideEnabled, globalSarak
    ]);

    const applyFullLocalConfig = (c: any) => {
        if (c.layout || c.theme) setLocalLayout(c.layout || c.theme);
        if (c.mode) setLocalMode(c.mode);
        if (c.primaryColor) setLocalPrimary(c.primaryColor);
        if (c.sidebarWidth) setLocalSidebarWidth(Number(c.sidebarWidth));
        if (c.navigationStyle) setLocalNavStyle(c.navigationStyle);
        if (c.layoutDensity) setLocalDensity(c.layoutDensity);
        if (c.texture) setLocalTexture(c.texture);
        if (c.headingFont) setHeadingFont(c.headingFont);
        if (c.subtitleFont) setSubtitleFont(c.subtitleFont);
        if (c.tabFont) setTabFont(c.tabFont);
        if (c.bodyFont) setBodyFont(c.bodyFont);
        if (c.headingWeight) setHeadingWeight(c.headingWeight);
        if (c.headingLetterSpacing) setHeadingLetterSpacing(c.headingLetterSpacing);
        if (c.fontScale) setFontScale(c.fontScale);
        if (c.borderRadius) setBorderRadius(Number(c.borderRadius));
        if (c.borderWidth) setBorderWidth(Number(c.borderWidth));
        if (c.borderStyle) setBorderStyle(c.borderStyle);
        if (c.layoutGap) setLayoutGap(Number(c.layoutGap));
        if (c.glassOpacity !== undefined) setGlassOpacity(Number(c.glassOpacity));
        if (c.glassBlur !== undefined) setGlassBlur(Number(c.glassBlur));
        if (c.textureOpacity !== undefined) setTextureOpacity(Number(c.textureOpacity));
        if (c.animationSpeed !== undefined) setAnimationSpeed(Number(c.animationSpeed));
        if (c.isGeometricCut !== undefined) setIsGeometricCut(!!c.isGeometricCut);
        if (c.shadowIntensity !== undefined) setShadowIntensity(Number(c.shadowIntensity));
        if (c.surfaceMaterial) setSurfaceMaterial(c.surfaceMaterial);
        if (c.borderType) setBorderType(c.borderType);
        if (c.systemName) setSystemName(c.systemName);
        if (c.logoUrl) setLogoUrl(c.logoUrl);
        if (c.logoDarkUrl) setLogoDarkUrl(c.logoDarkUrl);
        if (c.logoScale) setLogoScale(Number(c.logoScale));
        if (c.logoPosition) setLogoPosition(c.logoPosition);
        if (c.systemTone) setSystemTone(c.systemTone);
        if (c.chartStyle) setChartStyle(c.chartStyle);
    };

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
        applyFullConfig: applyFullLocalConfig,
        layouts: LAYOUTS, isHydrated: true, loading: false
    }), [
        localLayout, localMode, localPrimary, localDensity, localTexture,
        headingFont, subtitleFont, tabFont, bodyFont, headingWeight, headingLetterSpacing,
        borderRadius, borderWidth, borderStyle, isGeometricCut, shadowIntensity,
        glassOpacity, glassBlur, textureOpacity, animationSpeed, localSidebarWidth, localNavStyle,
        surfaceMaterial, borderType, systemName, chartStyle, chartPalette, shadowOrientation,
        shadowColorMode, isSplitViewEnabled, searchStyle, layoutGap, interfaceElasticity
    ]);

    const uiBridgeValue = useMemo(() => ({
        effective,
        applyFullConfig: globalSarak ? globalSarak.applyFullConfig : applyFullLocalConfig,
        isStandalone: !globalSarak
    }), [effective, globalSarak]);

    if (!isHydrated) return null;

    return (
        <UIContext.Provider value={uiBridgeValue}>
            <SarakContext.Provider value={(globalSarak || fallbackContextValue) as any}>
                {children}
            </SarakContext.Provider>
        </UIContext.Provider>
    );
};

export default SarakUIProvider;
