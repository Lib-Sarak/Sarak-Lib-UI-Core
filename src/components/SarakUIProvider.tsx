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

// --- MANIFESTO DE DESIGN SOBERANO (SSoT v6.6) ---
// Centraliza a tradução de estados lógicos para variáveis CSS e atributos do DOM.
const DESIGN_MANIFEST: Record<string, { 
    vars?: string[], 
    unit?: string, 
    transform?: (v: any) => any, 
    attr?: string, 
    classPrefix?: string 
}> = {
    layout: { vars: ['--sarak-layout'], classPrefix: 'layout-' },
    mode: { vars: ['--sarak-mode'], transform: (v: any) => v === 'dark' ? 'dark' : 'light' },
    primaryColor: { 
        vars: ['--primary-color', '--theme-primary', '--sarak-primary-color'],
        // Injeta automaticamente os componentes RGB para suportar as opacidades do CSS legado
        transform: (v: string) => {
            const hex = v.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            return {
                main: v,
                rgb: `${r}, ${g}, ${b}`
            };
        }
    },
    layoutDensity: { vars: ['--sarak-layout-density'], classPrefix: 'density-' },
    texture: { vars: ['--sarak-texture'], classPrefix: 'texture-' },
    navigationStyle: { vars: ['--sarak-navigation-style', '--sarak-nav-style'], classPrefix: 'nav-' },
    sidebarWidth: { vars: ['--sidebar-width', '--sarak-sidebar-width'], unit: 'px' },
    headingFont: { vars: ['--font-heading', '--sarak-heading-font'] },
    subtitleFont: { vars: ['--font-subtitle', '--sarak-subtitle-font'] },
    tabFont: { vars: ['--font-tab', '--sarak-tab-font'] },
    bodyFont: { vars: ['--font-main', '--sarak-body-font'] },
    headingWeight: { vars: ['--heading-weight', '--sarak-heading-weight'] },
    headingLetterSpacing: { 
        vars: ['--heading-spacing', '--sarak-heading-spacing'],
        transform: (v) => ({ tight: '-0.05em', normal: '0', wide: '0.1em', widest: '0.25em' }[v] || v) 
    },
    fontScale: { 
        vars: ['--sarak-font-size', '--sarak-font-scale', '--font-size-factor', '--theme-font-size-base'],
        transform: (v) => {
            const factor = { p1: '0.8', p: '0.9', m: '1.0', g: '1.2', g1: '1.4' }[v] || '1.0';
            const px = { p1: '11px', p: '12px', m: '13px', g: '16px', g1: '18px' }[v] || '13px';
            return { factor, px };
        }
    },
    borderRadius: { vars: ['--radius-theme', '--sarak-border-radius'], unit: 'px' },
    borderWidth: { vars: ['--theme-border-width', '--border-width', '--sarak-border-width'], unit: 'px' },
    borderStyle: { vars: ['--border-style', '--sarak-border-style'] },
    layoutGap: { vars: ['--theme-gap', '--sarak-layout-gap'], unit: 'px' },
    glassOpacity: { vars: ['--glass-opacity', '--sarak-glass-opacity', '--sarak-bg-opacity'] },
    glassBlur: { vars: ['--glass-blur', '--sarak-glass-blur'], unit: 'px' },
    shadowIntensity: { vars: ['--shadow-intensity', '--sarak-shadow-intensity'] },
    isGeometricCut: { classPrefix: 'is-geometric' },
    textureOpacity: { vars: ['--texture-opacity', '--sarak-texture-opacity'] },
    animationSpeed: { vars: ['--animation-speed', '--sarak-animation-speed', '--transition-speed'], unit: 's' },
    surfaceMaterial: { attr: 'data-surface' },
    borderType: { attr: 'data-border' },
    systemTone: { vars: ['--sarak-system-tone'], attr: 'data-tone' },
    isAutoHideEnabled: { attr: 'data-auto-hide' },
    shadowOrientation: { vars: ['--shadow-orientation'] }, // Injeta como valor literal para seletores [style*="..."]
    shadowColorMode: { vars: ['--shadow-color-mode'] }
};

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
    
    // --- HELPER DE NORMALIZAÇÃO (Escudo contra Case-Sensitivity) ---
    // Busca o valor no objeto global ignorando maiúsculas/minúsculas.
    const pickup = useCallback((key: string, localFallback: any) => {
        if (!s) return localFallback;
        // 1. Busca Exata (Prioridade 1)
        if (s[key] !== undefined) return s[key];
        // 2. Busca Case-Insensitive (Prioridade 2)
        const normalizedKey = key.toLowerCase();
        const actualKey = Object.keys(s).find(k => k.toLowerCase() === normalizedKey);
        if (actualKey !== undefined && s[actualKey] !== undefined) return s[actualKey];
        // 3. Fallback Local
        return localFallback;
    }, [s]);

    // SSSoT Consumidor SOBERANO (Ponte Resiliente v6.6)
    const effective = useMemo(() => ({
        layout: pickup('layout', localLayout),
        mode: pickup('mode', localMode),
        primaryColor: pickup('primaryColor', localPrimary),
        layoutDensity: pickup('layoutDensity', localDensity),
        texture: pickup('texture', localTexture),
        navigationStyle: pickup('navigationStyle', localNavStyle),
        sidebarWidth: pickup('sidebarWidth', localSidebarWidth),
        headingFont: pickup('headingFont', headingFont),
        subtitleFont: pickup('subtitleFont', subtitleFont),
        tabFont: pickup('tabFont', tabFont),
        bodyFont: pickup('bodyFont', bodyFont),
        headingWeight: pickup('headingWeight', headingWeight),
        headingLetterSpacing: pickup('headingLetterSpacing', headingLetterSpacing),
        borderRadius: pickup('borderRadius', borderRadius),
        borderWidth: pickup('borderWidth', borderWidth),
        borderStyle: pickup('borderStyle', borderStyle),
        glassOpacity: pickup('glassOpacity', glassOpacity),
        glassBlur: pickup('glassBlur', glassBlur),
        shadowIntensity: pickup('shadowIntensity', shadowIntensity),
        isGeometricCut: pickup('isGeometricCut', isGeometricCut),
        textureOpacity: pickup('textureOpacity', textureOpacity),
        animationSpeed: pickup('animationSpeed', animationSpeed),
        layoutGap: pickup('layoutGap', layoutGap),
        systemName: pickup('systemName', systemName),
        logoUrl: pickup('logoUrl', logoUrl),
        logoDarkUrl: pickup('logoDarkUrl', logoDarkUrl),
        logoScale: pickup('logoScale', logoScale),
        logoPosition: pickup('logoPosition', logoPosition),
        systemTone: pickup('systemTone', systemTone),
        surfaceMaterial: pickup('surfaceMaterial', surfaceMaterial),
        borderType: pickup('borderType', borderType),
        interfaceElasticity: pickup('interfaceElasticity', interfaceElasticity),
        isSplitViewEnabled: pickup('isSplitViewEnabled', isSplitViewEnabled),
        chartStyle: pickup('chartStyle', chartStyle),
        chartPalette: pickup('chartPalette', chartPalette),
        shadowOrientation: pickup('shadowOrientation', shadowOrientation),
        shadowColorMode: pickup('shadowColorMode', shadowColorMode),
        isAutoHideEnabled: pickup('isAutoHideEnabled', false),
        cursorPhysics: pickup('cursorPhysics', cursorPhysics),
        isNavHidden: pickup('isNavHidden', localIsNavHidden),
        fontScale: pickup('fontScale', fontScale),
        registeredModules: pickup('registeredModules', [])
    }), [
        pickup, localLayout, localMode, localPrimary, localDensity, localTexture, 
        localNavStyle, localSidebarWidth, headingFont, subtitleFont, tabFont, bodyFont, 
        headingWeight, headingLetterSpacing, borderRadius, borderWidth, borderStyle, 
        glassOpacity, glassBlur, shadowIntensity, isGeometricCut, textureOpacity, 
        animationSpeed, layoutGap, systemName, logoUrl, logoDarkUrl, logoScale, 
        logoPosition, systemTone, surfaceMaterial, borderType, interfaceElasticity, 
        isSplitViewEnabled, chartStyle, chartPalette, shadowOrientation, shadowColorMode, 
        cursorPhysics, localIsNavHidden, fontScale
    ]);

    // --- SARAK MANIFEST-DRIVEN DESIGN ENGINE (v6.5) ---
    useEffect(() => {
        if (typeof document === 'undefined') return;
        const root = document.documentElement;
        const body = document.body;

        try {
            console.group('%c🚀 [Matrix Trace] Motor de Design Baseado em Manifesto v6.5', 'background: #0f172a; color: #10b981; padding: 4px; font-weight: bold;');
            
            const appliedTokens: Record<string, string> = {};
            const attributesToSet: Record<string, string> = {};

            // Processamento do Manifesto v6.6
            Object.entries(effective).forEach(([key, value]) => {
                const config = DESIGN_MANIFEST[key];
                
                // Normalização de Valor
                let finalValue = value?.toString() || '';
                let extraVars: Record<string, string> = {};

                if (config?.transform) {
                    const t = config.transform(value);
                    if (typeof t === 'object') {
                        // Casos Especiais: RGB e Escalas Híbridas
                        if (key === 'primaryColor') {
                            finalValue = t.main;
                            extraVars['--theme-primary-rgb'] = t.rgb;
                            extraVars['--primary-color-rgb'] = t.rgb;
                        } else if (key === 'fontScale') {
                            finalValue = t.px; 
                            extraVars['--font-size-factor'] = t.factor;
                            extraVars['--sarak-font-scale'] = t.factor;
                        }
                    } else {
                        finalValue = t;
                    }
                }

                if (config?.unit && typeof value === 'number') finalValue = `${value}${config.unit}`;
                if (typeof value === 'boolean') finalValue = value ? '1' : '0';
                if (Array.isArray(value)) finalValue = value.join(',');

                // 1. Injeção de Variáveis CSS (Multicast + Extras)
                if (config?.vars) {
                    config.vars.forEach(v => {
                        appliedTokens[v] = finalValue;
                        root.style.setProperty(v, finalValue);
                    });
                    // Injeta variáveis extras calculadas (ex: RGB)
                    Object.entries(extraVars).forEach(([ev, evVal]) => {
                        appliedTokens[ev] = evVal;
                        root.style.setProperty(ev, evVal);
                    });
                } else {
                    // Fallback automático para kebab-case com proteção de redundância
                    const fallbackKey = `--sarak-${key.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()}`;
                    appliedTokens[fallbackKey] = finalValue;
                    root.style.setProperty(fallbackKey, finalValue);
                }

                // 2. Injeção de Atributos HTML5
                if (config?.attr) {
                    attributesToSet[config.attr] = finalValue;
                    body.setAttribute(config.attr, finalValue);
                }

                // 3. Gerenciamento de Classes
                if (config?.classPrefix) {
                    if (typeof value === 'boolean') {
                        if (value) body.classList.add(config.classPrefix);
                        else body.classList.remove(config.classPrefix);
                    } else {
                        // Remove classes antigas do mesmo prefixo
                        Array.from(body.classList).forEach(c => {
                            if (c.startsWith(config.classPrefix!)) body.classList.remove(c);
                        });
                        body.classList.add(`${config.classPrefix}${value}`);
                    }
                }
            });

            // Classes Fixas de Suporte
            body.classList.remove('light', 'dark');
            body.classList.add(effective.mode === 'dark' ? 'dark' : 'light');

            console.log('📦 Tokens Aplicados (Manifesto):', appliedTokens);
            console.log('🏷️ Atributos Sincronizados:', attributesToSet);
            console.groupEnd();

            // Persistência Fallback (Standalone)
            if (!globalSarak) {
                localStorage.setItem('sarak_local_layout', effective.layout);
                localStorage.setItem('sarak_local_mode', effective.mode);
                localStorage.setItem('sarak_local_primary', effective.primaryColor);
            }

            setIsHydrated(true);
        } catch (error) {
            console.error('❌ [Matrix Trace Engine Failure]', error);
        }
    }, [effective, globalSarak]);

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
