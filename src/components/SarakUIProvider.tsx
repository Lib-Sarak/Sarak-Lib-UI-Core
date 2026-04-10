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

// --- MANIFESTO DE DESIGN SOBERANO (SSoT v6.7) ---
// Centraliza a tradução de estados lógicos para variáveis CSS e atributos do DOM.
const DESIGN_MANIFEST: Record<string, { 
    vars?: string[], 
    unit?: string, 
    transform?: (v: any) => any, 
    attr?: string, 
    classPrefix?: string 
}> = {
    layout: { vars: ['--sarak-layout', '--layout-theme'], classPrefix: 'layout-' },
    mode: { vars: ['--sarak-mode', '--mode-theme'], transform: (v: any) => v === 'dark' ? 'dark' : 'light' },
    primaryColor: { 
        vars: ['--primary-color', '--theme-primary', '--sarak-primary-color'],
        transform: (v: string) => {
            if (!v || typeof v !== 'string') return { main: '#3b82f6', rgb: '59, 130, 246' };
            const hex = v.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16) || 0;
            const g = parseInt(hex.substring(2, 4), 16) || 0;
            const b = parseInt(hex.substring(4, 6), 16) || 0;
            return { main: v, rgb: `${r}, ${g}, ${b}` };
        }
    },
    layoutDensity: { vars: ['--sarak-layout-density', '--density-theme'], classPrefix: 'density-' },
    texture: { vars: ['--sarak-texture', '--texture-theme'], classPrefix: 'texture-' },
    navigationStyle: { vars: ['--sarak-navigation-style', '--nav-style'], classPrefix: 'nav-' },
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
        vars: ['--sarak-font-size', '--font-size-factor', '--theme-font-size-base'],
        transform: (v) => {
            const factor = { p1: '0.8', p: '0.9', m: '1.0', g: '1.2', g1: '1.4' }[v] || '1.0';
            const px = { p1: '11px', p: '12px', m: '13px', g: '16px', g1: '18px' }[v] || '13px';
            return { factor, px };
        }
    },
    borderRadius: { vars: ['--radius-theme', '--sarak-border-radius', '--border-radius'], unit: 'px' },
    borderWidth: { vars: ['--theme-border-width', '--border-width', '--sarak-border-width'], unit: 'px' },
    borderStyle: { vars: ['--border-style', '--sarak-border-style'] },
    layoutGap: { vars: ['--theme-gap', '--sarak-layout-gap'], unit: 'px' },
    glassOpacity: { vars: ['--glass-opacity', '--sarak-glass-opacity', '--sarak-bg-opacity'] },
    glassBlur: { vars: ['--glass-blur', '--sarak-glass-blur'], unit: 'px' },
    shadowIntensity: { vars: ['--shadow-intensity', '--sarak-shadow-intensity'] },
    isGeometricCut: { classPrefix: 'is-geometric', attr: 'data-geometric' },
    textureOpacity: { vars: ['--texture-opacity', '--sarak-texture-opacity', '--theme-texture-opacity'] },
    animationSpeed: { vars: ['--animation-speed', '--sarak-animation-speed', '--transition-speed'], unit: 's' },
    surfaceMaterial: { attr: 'data-surface', vars: ['--sarak-surface', '--surface-material'] },
    borderType: { attr: 'data-border', vars: ['--sarak-border-type', '--border-type'] },
    systemTone: { vars: ['--sarak-system-tone'], attr: 'data-tone' },
    isAutoHideEnabled: { attr: 'data-auto-hide' },
    shadowOrientation: { vars: ['--shadow-orientation'], attr: 'data-shadow-orientation' },
    shadowColorMode: { vars: ['--shadow-color-mode'], attr: 'data-shadow-color-mode' },
    
    // Branding & Identity
    systemName: { attr: 'data-system-name' },
    logoUrl: { attr: 'data-logo-url' },
    logoDarkUrl: { attr: 'data-logo-dark' },
    logoScale: { vars: ['--logo-scale'], transform: (v) => v || 1.0 },
    logoPosition: { attr: 'data-logo-position' },
    
    // Physics & Interface
    interfaceElasticity: { vars: ['--sarak-elasticity'] },
    cursorPhysics: { attr: 'data-cursor-physics' },
    isSplitViewEnabled: { attr: 'data-split-view' },
    
    // Data & Content
    chartStyle: { attr: 'data-chart-style' },
    chartPalette: { vars: ['--chart-palette'], transform: (v) => Array.isArray(v) ? v.join(',') : v },
    searchStyle: { attr: 'data-search-style' },
    emptyStateId: { attr: 'data-empty-state' },
    secondaryModuleId: { attr: 'data-sec-module' }
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

    const s = globalSarak;
    
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

    // SSSoT Consumidor SOBERANO (Ponte Resiliente v6.7)
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
        emptyStateId: pickup('emptyStateId', 'default'),
        secondaryModuleId: pickup('secondaryModuleId', ''),
        searchStyle: pickup('searchStyle', 'command-palette'),
        registeredModules: pickup('registeredModules', [])
    }), [
        pickup, localLayout, localMode, localPrimary, localDensity, localTexture, 
        localNavStyle, localSidebarWidth, headingFont, subtitleFont, tabFont, bodyFont, 
        headingWeight, headingLetterSpacing, borderRadius, borderWidth, borderStyle, 
        glassOpacity, glassBlur, shadowIntensity, isGeometricCut, textureOpacity, 
        animationSpeed, layoutGap, systemName, logoUrl, logoDarkUrl, logoScale, 
        logoPosition, systemTone, surfaceMaterial, borderType, interfaceElasticity, 
        isSplitViewEnabled, chartStyle, chartPalette, shadowOrientation, shadowColorMode, 
        cursorPhysics, localIsNavHidden, fontScale, searchStyle, s
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

            // Processamento do Manifesto v6.7
            Object.entries(effective).forEach(([key, value]) => {
                const config = DESIGN_MANIFEST[key];
                
                // Normalização de Valor
                let finalValue = value?.toString() || '';
                let extraVars: Record<string, string> = {};

                if (config?.transform) {
                    const t = config.transform(value);
                    if (typeof t === 'object' && t !== null) {
                        // Casos Especiais: RGB e Escalas Híbridas
                        if (key === 'primaryColor') {
                            finalValue = t.main;
                            extraVars['--theme-primary-rgb'] = t.rgb;
                            extraVars['--primary-color-rgb'] = t.rgb;
                        } else if (key === 'fontScale') {
                            finalValue = t.px; 
                            extraVars['--font-size-factor'] = t.factor;
                            extraVars['--sarak-font-scale'] = t.factor;
                        } else {
                           // Fallback preventivo contra [object Object]
                           finalValue = String(t.main || t.value || JSON.stringify(t));
                        }
                    } else {
                        finalValue = String(t);
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
                    
                    Object.entries(extraVars).forEach(([ev, evVal]) => {
                        appliedTokens[ev] = evVal;
                        root.style.setProperty(ev, evVal);
                    });
                } else {
                    const fallbackKey = `--sarak-${key.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()}`;
                    appliedTokens[fallbackKey] = finalValue;
                    root.style.setProperty(fallbackKey, finalValue);
                }

                // 2. Injeção de Atributos HTML5 (Duplo Bind para Soberania)
                if (config?.attr) {
                    attributesToSet[config.attr] = finalValue;
                    body.setAttribute(config.attr, finalValue);
                    root.setAttribute(config.attr, finalValue);
                }

                // 3. Gerenciamento de Classes (Body + Root)
                if (config?.classPrefix) {
                    const isBool = typeof value === 'boolean';
                    const activeClass = isBool ? (value ? config.classPrefix : null) : `${config.classPrefix}${value}`;
                    
                    // Limpeza
                    if (!isBool) {
                        Array.from(body.classList).forEach(c => {
                           if (c.startsWith(config.classPrefix!)) body.classList.remove(c);
                        });
                        Array.from(root.classList).forEach(c => {
                           if (c.startsWith(config.classPrefix!)) root.classList.remove(c);
                        });
                    }

                    if (activeClass) {
                        body.classList.add(activeClass);
                        root.classList.add(activeClass);
                    }
                }
            });

            // Classes Fixas de Suporte
            body.classList.remove('light', 'dark');
            root.classList.remove('light', 'dark');
            const modeClass = effective.mode === 'dark' ? 'dark' : 'light';
            body.classList.add(modeClass);
            root.classList.add(modeClass);

            console.log('%c🏷️ [Sarak Engine] Atributos Sincronizados:', 'color: #34d399; font-weight: bold;', attributesToSet);
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
        if (c.primaryColor || c.primarycolor) setLocalPrimary(c.primaryColor || c.primarycolor);
        if (c.sidebarWidth || c.sidebarwidth) setLocalSidebarWidth(Number(c.sidebarWidth || c.sidebarwidth));
        if (c.navigationStyle || c.navigationstyle) setLocalNavStyle(c.navigationStyle || c.navigationstyle);
        if (c.layoutDensity || c.layoutdensity) setLocalDensity(c.layoutDensity || c.layoutdensity);
        if (c.texture) setLocalTexture(c.texture);
        if (c.headingFont || c.headingfont) setHeadingFont(c.headingFont || c.headingfont);
        if (c.subtitleFont || c.subtitlefont) setSubtitleFont(c.subtitleFont || c.subtitlefont);
        if (c.tabFont || c.tabfont) setTabFont(c.tabFont || c.tabfont);
        if (c.bodyFont || c.bodyfont) setBodyFont(c.bodyFont || c.bodyfont);
        if (c.headingWeight || c.headingweight) setHeadingWeight(c.headingWeight || c.headingweight);
        if (c.headingLetterSpacing || c.headingletterspacing) setHeadingLetterSpacing(c.headingLetterSpacing || c.headingletterspacing);
        if (c.fontScale || c.fontscale) setFontScale(c.fontScale || c.fontscale);
        if (c.borderRadius || c.borderradius) setBorderRadius(Number(c.borderRadius || c.borderradius));
        if (c.borderWidth || c.borderwidth) setBorderWidth(Number(c.borderWidth || c.borderwidth));
        if (c.borderStyle || c.borderstyle) setBorderStyle(c.borderStyle || c.borderstyle);
        if (c.layoutGap || c.layoutgap) setLayoutGap(Number(c.layoutGap || c.layoutgap));
        if (c.glassOpacity !== undefined || c.glassopacity !== undefined) setGlassOpacity(Number(c.glassOpacity ?? c.glassopacity));
        if (c.glassBlur !== undefined || c.glassblur !== undefined) setGlassBlur(Number(c.glassBlur ?? c.glassblur));
        if (c.textureOpacity !== undefined || c.textureopacity !== undefined) setTextureOpacity(Number(c.textureOpacity ?? c.textureopacity));
        if (c.animationSpeed !== undefined || c.animationspeed !== undefined) setAnimationSpeed(Number(c.animationSpeed ?? c.animationspeed));
        if (c.isGeometricCut !== undefined || c.isgeometriccut !== undefined) setIsGeometricCut(!!(c.isGeometricCut ?? c.isgeometriccut));
        if (c.shadowIntensity !== undefined || c.shadowintensity !== undefined) setShadowIntensity(Number(c.shadowIntensity ?? c.shadowintensity));
        if (c.surfaceMaterial || c.surfacematerial) setSurfaceMaterial(c.surfaceMaterial || c.surfacematerial);
        if (c.borderType || c.bordertype) setBorderType(c.borderType || c.bordertype);
        if (c.systemName || c.systemname) setSystemName(c.systemName || c.systemname);
        if (c.logoUrl || c.logourl) setLogoUrl(c.logoUrl || c.logourl);
        if (c.logoDarkUrl || c.logodarkurl) setLogoDarkUrl(c.logoDarkUrl || c.logodarkurl);
        if (c.logoScale || c.logoscale) setLogoScale(Number(c.logoScale || c.logoscale));
        if (c.logoPosition || c.logoposition) setLogoPosition(c.logoPosition || c.logoposition);
        if (c.systemTone || c.systemtone) setSystemTone(c.systemTone || c.systemtone);
        if (c.chartStyle || c.chartstyle) setChartStyle(c.chartStyle || c.chartstyle);
        if (c.chartPalette || c.chartpalette) setChartPalette(c.chartPalette || c.chartpalette);
        if (c.shadowOrientation || c.shadoworientation) setShadowOrientation(c.shadowOrientation || c.shadoworientation);
        if (c.shadowColorMode || c.shadowcolormode) setShadowColorMode(c.shadowColorMode || c.shadowcolormode);
        if (c.interfaceElasticity !== undefined || c.interfaceelasticity !== undefined) setInterfaceElasticity(Number(c.interfaceElasticity ?? c.interfaceelasticity));
        if (c.cursorPhysics || c.cursorphysics) setCursorPhysics(c.cursorPhysics || c.cursorphysics);
        if (c.isSplitViewEnabled !== undefined || c.issplitviewenabled !== undefined) setIsSplitViewEnabled(!!(c.isSplitViewEnabled ?? c.issplitviewenabled));
        if (c.searchStyle || c.searchstyle) setSearchStyle(c.searchStyle || c.searchstyle);
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

    // --- SINCRO-PULSE v7.5 (SSoT Bridge) ---
    // Monitora alterações no Cérebro (Shared) e força a injeção nas Mãos (UI)
    useEffect(() => {
        if (globalSarak) {
            console.log('🔗 [Interface Bridge] Sincronizando com SSoT (Shared)...');
            // A injeção de CSS já ocorre via effective + no motor de design abaixo.
        }
    }, [globalSarak]);

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
