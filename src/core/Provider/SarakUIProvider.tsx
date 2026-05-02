console.log("%c [Sarak:Core] Engine v10.1.10 (DIAGNOSTIC FALLBACK) Carregada com Sucesso! ", "background: #06b6d4; color: #fff; font-weight: bold; padding: 4px; border-radius: 4px;");

import React, { ReactNode, useEffect, useState, useMemo, useCallback, useContext } from 'react';
import '../../styles/sarak-base.css';
import { LAYOUTS, BASE_PRESETS } from '../../constants/theme-models';
import { COLOR_PALETTES } from '../../constants/design-tokens';
import { registerLocalComponent, registerSarakModule, getRegisteredModules, subscribeToRegistry } from '../Discovery/registry';
import { ThemeCustomizationTab } from '../../features/DesignEngine/Main/ThemeCustomizationTab';
import { NoiseOverlay } from '../../effects/NoiseOverlay';

// --- SARAK UI BRIDGE CONTEXT ---
export interface SarakUIContextType {
    discoveryEndpoints: string[];
    design: any;
    setDesign: (design: any) => void;
    applyConfig: (partial: any) => void;
    applyFullConfig: (config: any) => void;
    registeredModules: any[];
    layouts: any[];
    isHydrated: boolean;
    options: SarakUIOptions;
}

export const UIContext = React.createContext<SarakUIContextType | undefined>(undefined);

export const useSarakUI = () => {
    const context = useContext(UIContext);
    if (!context) {
        return { 
            discoveryEndpoints: [], 
            design: {}, 
            registeredModules: [], 
            layouts: [], 
            isHydrated: false,
            // Fallback to avoid crashes in SSR or contexts without provider
            applyConfig: () => {},
            applyFullConfig: () => {}
        } as any;
    }
    // Returns context merged with design for API compatibility
    return {
        ...context,
        ...context.design
    };
};

// --- SARAK UI OPTIONS ---
export interface SarakUIOptions {
    endpoints?: {
        baseUrl?: string;
        designPath?: string;
        discoveryPath?: string;
        discovery?: string[];
    };
    manifest?: any; // Novo: Permite injetar manifest.json diretamente (v9.0)
    persistence?: {
        strategy?: 'local' | 'remote' | 'hybrid';
        storageKey?: string;
        onSave?: (design: any) => Promise<void> | void;
        onLoad?: () => Promise<any> | any;
    };
    theme?: {
        defaultTheme?: string;
        extraTokens?: any;
    };
}

const DEFAULT_STORAGE_KEY = 'sarak-ui-design-v9.0';
const DEFAULT_UI_BASE_URL = '/api/ui';

interface SarakUIProviderProps {
    children: ReactNode;
    discoveryEndpoints?: string[];
    config?: any;
    token?: string | null;
    userId?: string | null;
    options?: SarakUIOptions;
}

// --- INDUSTRIAL COLOR ENGINE (v9.0) ---
const computeColorVariants = (v: string, fallback: string) => {
    const val = v || fallback;
    if (!val || typeof val !== 'string' || val.length < 4) {
        return { 
            main: fallback, 
            rgb: '0,0,0', 
            bg: 'rgba(0,0,0,0.1)', 
            border: 'rgba(0,0,0,0.2)',
            hover: fallback,
            active: fallback,
            focus: 'rgba(0,0,0,0.4)',
            light: fallback
        };
    }
    
    const hex = val.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    
    const adjust = (c: number, f: number) => Math.round(Math.min(255, Math.max(0, c * f)));
    const toH = (n: number) => n.toString(16).padStart(2, '0');
    
    return {
        main: val,
        rgb: `${r}, ${g}, ${b}`,
        bg: `rgba(${r}, ${g}, ${b}, 0.15)`,
        border: `rgba(${r}, ${g}, ${b}, 0.25)`,
        hover: `#${toH(adjust(r, 1.1))}${toH(adjust(g, 1.1))}${toH(adjust(b, 1.1))}`,
        active: `#${toH(adjust(r, 0.9))}${toH(adjust(g, 0.9))}${toH(adjust(b, 0.9))}`,
        focus: `rgba(${r}, ${g}, ${b}, 0.4)`,
        light: `rgba(${r}, ${g}, ${b}, 0.05)`
    };
};

// --- SOVEREIGN DESIGN MANIFEST ---
export const DESIGN_MANIFEST: Record<string, {
    vars?: string[],
    unit?: string,
    transform?: (v: any) => any,
    attr?: string,
    classPrefix?: string
}> = {
    layout: { vars: ['--sarak-layout', '--layout-theme'], classPrefix: 'layout-' },
    mode: { vars: ['--sarak-mode', '--mode-theme'], transform: (v: any) => v === 'dark' ? 'dark' : 'light' },
    colorPalette: {
        vars: ['--sarak-palette'],
        attr: 'data-palette',
        transform: (v: string) => {
            // Se v for um ID de preset, retornamos o objeto de cores completo para o injetor
            return v; 
        }
    },
    primaryColor: {
        vars: ['--primary-color', '--theme-primary', '--sarak-primary-color'],
        transform: (v: string) => computeColorVariants(v, '#3b82f6')
    },
    secondaryColor: { 
        vars: ['--theme-secondary', '--sarak-secondary-color'],
        transform: (v: string) => computeColorVariants(v, '#6366f1')
    },
    accentColor: { 
        vars: ['--theme-accent', '--sarak-accent-color'],
        transform: (v: string) => computeColorVariants(v, '#f43f5e')
    },
    surfaceColor: { 
        vars: ['--theme-surface', '--sarak-surface-color'],
        transform: (v: string) => computeColorVariants(v, '#1e293b')
    },
    errorColor: {
        vars: ['--theme-error', '--sarak-error-color'],
        transform: (v: string) => computeColorVariants(v, '#ef4444')
    },
    successColor: {
        vars: ['--theme-success', '--sarak-success-color'],
        transform: (v: string) => computeColorVariants(v, '#10b981')
    },
    warningColor: {
        vars: ['--theme-warning', '--sarak-warning-color'],
        transform: (v: string) => computeColorVariants(v, '#f59e0b')
    },
    layoutDensity: { vars: ['--sarak-layout-density', '--density-theme'], classPrefix: 'density-' },
    texture: { vars: ['--sarak-texture', '--texture-theme'], classPrefix: 'texture-', attr: 'data-texture' },
    navigationStyle: { vars: ['--sarak-navigation-style', '--sarak-nav-style', '--nav-style'], classPrefix: 'nav-' },
    sidebarWidth: { vars: ['--sidebar-width', '--sarak-sidebar-width'], unit: 'px' },
    headingFont: { vars: ['--font-heading', '--sarak-heading-font'] },
    subtitleFont: { vars: ['--font-subtitle', '--sarak-subtitle-font'] },
    tabFont: { vars: ['--font-tab', '--sarak-tab-font'] },
    bodyFont: { vars: ['--font-main', '--sarak-body-font'] },
    headingWeight: { vars: ['--heading-weight', '--sarak-heading-weight'] },
    headingLetterSpacing: {
        vars: ['--heading-spacing', '--sarak-heading-spacing'],
        transform: (v) => (({ tight: '-0.05em', normal: '0', wide: '0.1em', widest: '0.25em' } as any)[v] || v)
    },
    borderRadius: { vars: ['--radius-theme', '--sarak-border-radius', '--border-radius'], unit: 'px' },
    borderWidth: { vars: ['--theme-border-width', '--border-width', '--sarak-border-width'], unit: 'px' },
    borderStyle: { vars: ['--border-style', '--sarak-border-style'] },
    layoutGap: { vars: ['--theme-gap', '--sarak-layout-gap'], unit: 'px' },
    glassOpacity: { vars: ['--glass-opacity', '--sarak-glass-opacity', '--sarak-bg-opacity'] },
    glassBlur: { vars: ['--glass-blur', '--sarak-glass-blur'], unit: 'px' },
    glassSaturation: { vars: ['--sarak-glass-saturation', '--theme-glass-saturation'], unit: '%' },
    contrastCurve: { vars: ['--contrast-curve', '--sarak-contrast-curve'], transform: (v) => parseFloat(v) || 1.0 },
    shadowIntensity: { vars: ['--shadow-intensity', '--sarak-shadow-intensity'] },
    cardPadding: { vars: ['--card-padding', '--sarak-card-padding', '--theme-card-padding'], unit: 'px' },
    cardTexture: { vars: ['--sarak-card-texture'], attr: 'data-card-texture' },
    tabGap: { vars: ['--tab-gap', '--sarak-tab-gap', '--theme-tab-gap'], unit: 'px' },
    tabSectionMargin: { vars: ['--tab-section-margin', '--sarak-tab-section-margin', '--theme-tab-section-margin', '--safe-area-padding'], unit: 'px' },
    isGeometricCut: { classPrefix: 'is-geometric', attr: 'data-geometric' },
    textureOpacity: { vars: ['--texture-opacity', '--sarak-texture-opacity', '--theme-texture-opacity'] },
    animationSpeed: { vars: ['--animation-speed', '--sarak-animation-speed', '--transition-speed'], unit: 's' },
    surfaceMaterial: { attr: 'data-surface', vars: ['--sarak-surface', '--surface-material'] },
    surfaceIntensity: { vars: ['--surface-intensity', '--sarak-surface-intensity'] },
    borderType: { attr: 'data-border', vars: ['--sarak-border-type', '--border-type'] },
    systemTone: { vars: ['--sarak-system-tone'], attr: 'data-tone' },
    isAutoHideEnabled: { attr: 'data-auto-hide' },
    shadowOrientation: { vars: ['--shadow-orientation'], attr: 'data-shadow-orientation' },
    shadowColorMode: { vars: ['--shadow-color-mode'], attr: 'data-shadow-color-mode' },
    systemName: { attr: 'data-system-name' },
    logoUrl: { attr: 'data-logo-url' },
    logoDarkUrl: { attr: 'data-logo-dark' },
    logoScale: { vars: ['--logo-scale'], transform: (v) => v || 1.0 },
    logoPosition: { attr: 'data-logo-position' },
    interfaceElasticity: { vars: ['--sarak-elasticity'] },
    isSplitViewEnabled: { attr: 'data-split-view' },
    chartStyle: { attr: 'data-chart-style' },
    chartPalette: { vars: ['--chart-palette'], transform: (v) => Array.isArray(v) ? v.join(',') : v },
    cardSpotlight: { 
        vars: ['--spotlight-opacity'],
        transform: (v: any) => parseFloat(v) || 0
    },

    borderBeamEnabled: { attr: 'data-border-beam' },
    secondaryModuleId: { attr: 'data-sec-module' },
    hoverLiftEnabled: { attr: 'data-hover-lift' },
    spotlightEnabled: { attr: 'data-spotlight' },
    magneticPullEnabled: { attr: 'data-magnetic' },
    performanceMode: { attr: 'data-perf-mode' },

    // Engine Specialized Tokens v7.5
    fontScale: { 
        vars: ['--sarak-font-scale', '--sarak-font-size', '--font-size-factor', '--theme-font-size-base'], 
        attr: 'data-font-scale',
        transform: (v: string) => {
            const scales: any = {
                'pp': { px: '10px', factor: '0.7' },
                'p': { px: '12px', factor: '0.85' },
                'm': { px: '14px', factor: '1.0' },
                'g': { px: '16px', factor: '1.25' },
                'gg': { px: '20px', factor: '1.5' }
            };
            return scales[v] || scales['m'];
        }
    },
    scaleRatio: {
        vars: ['--sarak-scale-ratio'],
        transform: (v) => {
            const ratio = parseFloat(v) || 1.0;
            return {
                ratio,
                gap: `${1.25 * ratio}rem`,
                pad: `${1.5 * ratio}rem`,
                margin: `${1 * ratio}rem`,
                radius: `${12 * ratio}px`
            };
        }
    },

    layeredShadows: {
        vars: ['--sarak-layered-shadows'],
        transform: (v) => {
            const intensity = parseFloat(v) || 1.0;
            return `0 2px 4px rgba(0,0,0,${0.05 * intensity}), 
                    0 4px 8px rgba(0,0,0,${0.05 * intensity}), 
                    0 8px 16px rgba(0,0,0,${0.05 * intensity}), 
                    0 16px 32px rgba(0,0,0,${0.05 * intensity})`;
        }
    },
    chatBubbleStyle: { attr: 'data-chat-bubble', vars: ['--sarak-chat-bubble'] },
    chatAnimationSpeed: { vars: ['--sarak-chat-anim-speed'] },
    flowGridStyle: { attr: 'data-flow-grid', vars: ['--sarak-flow-grid'] },
    flowNodeRadius: { vars: ['--sarak-flow-radius'], unit: 'px' },
    chartShowGrid: { attr: 'data-chart-grid' },
    chartType: { attr: 'data-chart-type' },
    chartThickness: { vars: ['--sarak-chart-thickness'], unit: 'px' },
    chartSmoothing: { attr: 'data-chart-smoothing' },
    buttonHoverEffect: { attr: 'data-button-hover', vars: ['--sarak-button-hover'] },
    inputStyle: { attr: 'data-input-style', vars: ['--sarak-input-style'] },
    atmosphereNoiseOpacity: { vars: ['--sarak-noise-opacity', '--theme-noise-opacity'] },

    iconStrokeWidth: { vars: ['--sarak-icon-stroke', '--theme-icon-stroke'], unit: 'px' },
    maxContentWidth: { vars: ['--sarak-max-width', '--theme-max-width'] },
    useTabularNums: { attr: 'data-tabular-nums', vars: ['--sarak-tabular-nums'], transform: (v) => v ? 'tabular-nums' : 'normal' },
    hapticIntensity: { vars: ['--haptic-intensity', '--sarak-haptic-scale'], transform: (v) => 1 - (parseFloat(v) || 0.02) },
    scrollbarStyle: { vars: ['--sarak-scrollbar-width'], unit: 'px', attr: 'data-scrollbar-style' },
    fluidScaling: { 
        vars: ['--sarak-fluid-scale'], 
        transform: (v) => {
            const factor = parseFloat(v) || 1.0;
            return {
                base: `clamp(12px, ${0.8 * factor}vw + 8px, ${20 * factor}px)`,
                gap: `clamp(10px, ${1 * factor}vw + 4px, ${32 * factor}px)`,
                padding: `clamp(16px, ${1.5 * factor}vw + 8px, ${48 * factor}px)`
            };
        }
    },
    isNavHidden: { vars: ['--is-nav-hidden'], attr: 'data-nav-hidden' },
    sidebarMinWidth: { vars: ['--sidebar-min-width'], transform: (v) => parseFloat(v) || 200 },
    sidebarMaxWidth: { vars: ['--sidebar-max-width'], transform: (v) => parseFloat(v) || 450 }
};

const BEZIER_CURVES = {
    '--ease-sarak-cubic': 'cubic-bezier(0.65, 0, 0.35, 1)',
    '--ease-sarak-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
    '--ease-sarak-fluid': 'cubic-bezier(0.4, 0, 0.2, 1)',
    '--ease-sarak-elastic': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    '--ease-sarak-bounce': 'cubic-bezier(0.68, -0.6, 0.32, 1.6)'
};

const validateDesign = (design: any) => {
    if (!design) return {};
    const s: any = {};
    
    // 1. Integrity Sanitization (Removes Manifest garbage)
    Object.entries(design).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== '' && typeof v !== 'object') {
            s[k] = v;
        } else if (typeof v === 'object' && v !== null) {
            s[k] = v; // Mantém objetos (como arrays de cores ou tokens complexos)
        }
    });

    const clamp = (val: any, min: number, max: number, fallback: number) => {
        const n = parseFloat(val);
        if (isNaN(n)) return fallback;
        return Math.min(Math.max(n, min), max);
    };

    // 2. Security Clamping
    s.scaleRatio = clamp(s.scaleRatio, 0.5, 2, 1);
    s.contrastCurve = clamp(s.contrastCurve, 0.5, 2, 1);
    s.glassBlur = clamp(s.glassBlur, 0, 60, 10);
    s.glassOpacity = clamp(s.glassOpacity, 0, 1, 0.7);
    s.borderRadius = clamp(s.borderRadius, 0, 60, 12);
    
    // 3. Structural Fallbacks (v9.0 Resilience)
    if (!s.navigationStyle) s.navigationStyle = 'sidebar';
    if (!s.sidebarWidth) s.sidebarWidth = 240;
    
    s.schema_version = "8.5"; // Upgrade to v8.5 (Sovereign)

    return s;
};

// Internal component to manage design injection without loops
const DesignInjector: React.FC<{ design: any }> = ({ design: s }) => {

    useEffect(() => {
        let rafId: number;
        const handleMouseMove = (e: MouseEvent) => {
            if (rafId) cancelAnimationFrame(rafId);
            
            rafId = requestAnimationFrame(() => {
                const x = (e.clientX / window.innerWidth) * 100;
                const y = (e.clientY / window.innerHeight) * 100;
                document.documentElement.style.setProperty('--mouse-x', `${x}%`);
                document.documentElement.style.setProperty('--mouse-y', `${y}%`);
                document.documentElement.style.setProperty('--mouse-px-x', `${e.clientX}px`);
                document.documentElement.style.setProperty('--mouse-px-y', `${e.clientY}px`);
            });
        };
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, []);

    const prevDesignRef = React.useRef<any>(null);

    useEffect(() => {
        if (typeof document === 'undefined') return;
        const root = document.documentElement;
        const body = document.body;

        if (!s) return;

        // --- CSS CLEANUP ENGINE (v9.5) ---
        // Limpamos TODAS as variáveis sarak residuais para evitar conflitos de temas anteriores.
        const cleanAllSarakVariables = () => {
            const rootStyle = root.style;
            for (let i = 0; i < rootStyle.length; i++) {
                const prop = rootStyle[i];
                if (prop.startsWith('--sarak-') || prop.startsWith('--sx-') || prop.startsWith('--theme-')) {
                    rootStyle.removeProperty(prop);
                }
            }
            // Limpeza específica de cores legadas que podem não ser iteráveis
            const levels = ['primary', 'secondary', 'accent', 'surface', 'success', 'warning', 'error', 'body'];
            levels.forEach(level => {
                rootStyle.removeProperty(`--${level}-color`);
                rootStyle.removeProperty(`--theme-${level}`);
            });
        };
        cleanAllSarakVariables();

        // One-time injection of Sarak Bezier Curves
        if (!prevDesignRef.current) {
            Object.entries(BEZIER_CURVES).forEach(([k, v]) => root.style.setProperty(k, v));
        }

        // --- COMPREHENSIVE COLOR INJECTION ENGINE (v9.1) ---
        const activePalette = COLOR_PALETTES.find((p: any) => p.id === s.colorPalette);
        const paletteColors = activePalette?.colors || {};

        Object.entries(s).forEach(([key, value]) => {
            const config = DESIGN_MANIFEST[key];
            if (!config) return;

            // --- PALETTE HARMONIZATION (Sovereignty v9.5) ---
            // SOBERANIA: Se o usuário definiu uma cor primária manualmente (não nula),
            // ela DEVE ignorar a paleta para evitar o bug de "Azul vs Vermelho".
            let finalValueForInjection = value;
            if (key === 'primaryColor' && value) {
                // Se temos uma cor primária explícita, usamos ela.
                finalValueForInjection = value;
            } else if (key.endsWith('Color') || key === 'primaryColor') {
                const level = key.replace('Color', '');
                const paletteHex = (paletteColors as any)[level === 'primary' ? 'primary' : level];
                if (paletteHex) {
                    finalValueForInjection = paletteHex;
                }
            }

            let finalValue = finalValueForInjection?.toString() || '';
            let finalAttrValue = finalValue; 
            const extraVars: Record<string, string> = {};

            if (config.transform) {
                const t = config.transform(finalValueForInjection);
                if (typeof t === 'object' && t !== null) {
                    if (key.endsWith('Color') || key === 'primaryColor') {
                        const level = key.replace('Color', '');
                        const prefix = `--theme-${level === 'primary' ? 'primary' : level}`;
                        
                        finalValue = t.main;
                        finalAttrValue = t.main;
                        extraVars[`${prefix}-rgb`] = t.rgb;
                        extraVars[`${prefix}-bg`] = t.bg;
                        extraVars[`${prefix}-border`] = t.border;
                        extraVars[`${prefix}-hover`] = t.hover;
                        extraVars[`${prefix}-active`] = t.active;
                        extraVars[`${prefix}-focus`] = t.focus;
                        extraVars[`${prefix}-light`] = t.light;
                        extraVars[`--${level === 'primary' ? 'primary' : level}-color`] = t.main;
                    } else if (key === 'fontScale') {
                        finalValue = t.px;
                        finalAttrValue = t.px;
                        extraVars['--font-size-factor'] = t.factor;
                    } else if (key === 'scaleRatio') {
                        finalValue = String(t.ratio);
                        finalAttrValue = String(t.ratio);
                        extraVars['--theme-gap-scaled'] = t.gap;
                        extraVars['--theme-pad-scaled'] = t.pad;
                        extraVars['--theme-margin-scaled'] = t.margin;
                        extraVars['--theme-radius-scaled'] = t.radius;
                    } else if (key === 'fluidScaling') {
                        finalValue = '1';
                        finalAttrValue = '1';
                        extraVars['--theme-font-size-base'] = t.base;
                        extraVars['--theme-gap-scaled'] = t.gap;
                        extraVars['--theme-pad-scaled'] = t.padding;
                    } else if (t.main !== undefined) {
                        finalValue = t.main;
                        finalAttrValue = t.main;
                        Object.entries(t).forEach(([k, v]) => {
                            if (k.startsWith('--')) extraVars[k] = String(v);
                        });
                    }
                } else {
                    finalValue = String(t);
                    finalAttrValue = String(t);
                }
            }

            // --- Multi-Palette Engine (v9.1) ---
            if (key === 'colorPalette' && activePalette) {
                // When colorPalette changes, we force inject ALL colors from it
                Object.entries(activePalette.colors as Record<string, string>).forEach(([level, hex]) => {
                    const levelKey = level === 'primary' ? 'primaryColor' : `${level}Color`;
                    const levelConfig = DESIGN_MANIFEST[levelKey];
                    
                    // SOBERANIA DE COR (v9.5): Se o usuário definiu uma cor primária manual,
                    // a paleta NÃO pode sobrescrevê-la.
                    if (level === 'primary' && s.primaryColor) return;

                    if (levelConfig && levelConfig.vars) {
                        const t = computeColorVariants(hex, '#000');
                        const prefix = `--theme-${level}`;
                        
                        // Inject main variable
                        levelConfig.vars.forEach(v => root.style.setProperty(v, t.main));
                        
                        // Inject all state variables
                        root.style.setProperty(`${prefix}-rgb`, t.rgb);
                        root.style.setProperty(`${prefix}-bg`, t.bg);
                        root.style.setProperty(`${prefix}-border`, t.border);
                        root.style.setProperty(`${prefix}-hover`, t.hover);
                        root.style.setProperty(`${prefix}-active`, t.active);
                        root.style.setProperty(`${prefix}-focus`, t.focus);
                        root.style.setProperty(`${prefix}-light`, t.light);

                        // Se for primary, injetamos também como --theme-primary-rgb etc para compatibilidade
                        if (level === 'primary') {
                            root.style.setProperty('--theme-primary-rgb', t.rgb);
                        }
                    }
                });

                // Injeção especial de Fundo e Superfície (Sovereignty v9.1)
                // Se a paleta definir tons específicos para o corpo ou superfície, aplicamos aqui.
                const paletteColorsAny = activePalette.colors as any;
                if (paletteColorsAny.body) {
                    const t = computeColorVariants(paletteColorsAny.body, '#0f172a');
                    root.style.setProperty('--theme-body', t.main);
                    root.style.setProperty('--theme-body-rgb', t.rgb);
                }
                if (paletteColorsAny.surface) {
                    const t = computeColorVariants(paletteColorsAny.surface, '#1e293b');
                    root.style.setProperty('--theme-surface', t.main);
                    root.style.setProperty('--theme-surface-rgb', t.rgb);
                }
            }

            if (config.unit && typeof value === 'number') finalValue = `${value}${config.unit}`;
            if (typeof value === 'boolean') {
                finalValue = value ? '1' : '0';
                finalAttrValue = value ? '1' : '0';
            }

            if (config.vars) {
                config.vars.forEach(v => root.style.setProperty(v, finalValue));
                Object.entries(extraVars).forEach(([ev, evVal]) => root.style.setProperty(ev, evVal));
            }

            if (config.attr) {
                body.setAttribute(config.attr, finalAttrValue);
                root.setAttribute(config.attr, finalAttrValue);
            }


            if (config.classPrefix) {
                const isBool = typeof value === 'boolean';
                const activeClass = isBool ? (value ? config.classPrefix : null) : `${config.classPrefix}${value}`;

                Array.from(body.classList).forEach(c => {
                    if (c.startsWith(config.classPrefix!) || (isBool && c === config.classPrefix)) {
                        body.classList.remove(c);
                    }
                });

                if (activeClass) body.classList.add(activeClass);
            }

        });

        // REFORÇO DE SOBERANIA (v9.5 Patch Final)
        // Garantimos que a cor primária e o modo (light/dark) sejam aplicados por último
        // para vencer qualquer conflito de loop.
        if (s.primaryColor) {
            const t = computeColorVariants(s.primaryColor, s.mode === 'dark' ? '#000' : '#fff');
            root.style.setProperty('--theme-primary', t.main);
            root.style.setProperty('--theme-primary-rgb', t.rgb);
            root.style.setProperty('--theme-accent', t.main);
            root.style.setProperty('--theme-primary-hover', t.hover);
            
            // Variáveis de compatibilidade legada
            root.style.setProperty('--primary-color', t.main);
        }

        // Mode cleanup
        if (!prevDesignRef.current || prevDesignRef.current.mode !== s.mode) {
            body.classList.remove('light', 'dark');
            body.classList.add(s.mode === 'dark' ? 'dark' : 'light');
        }

        prevDesignRef.current = { ...s };
    }, [s]);

    return null;
};

export const SarakUIProvider: React.FC<SarakUIProviderProps> = ({
    children,
    discoveryEndpoints = [],
    config: initialPropsConfig = {},
    token,
    userId,
    options = {}
}) => {
    const [isHydrated, setIsHydrated] = useState(false);
    const [registeredModules, setRegisteredModules] = useState<any[]>(() => getRegisteredModules());
    const [isBackendLoaded, setIsBackendLoaded] = useState(false);

    // --- STABILITY ANCHORS (v9.3) ---
    // Capturamos os valores iniciais para evitar que instabilidades do Host (falta de useMemo)
    // disparem re-renders ou resets de estado dentro da Lib.
    const optionsRef = React.useRef(options);
    const configRef = React.useRef(initialPropsConfig);
    
    // Sincronizamos os refs APENAS se houver uma mudança real (opcional, por enquanto fixamos no mount)
    useEffect(() => {
        optionsRef.current = options;
        configRef.current = initialPropsConfig;
    }, [options, initialPropsConfig]);

    // Intelligent Initialization with Absolute Sovereignty (v10.0)
    const [design, setDesign] = useState(() => {
        const opt = optionsRef.current;
        
        // SOBERANIA INDUSTRIAL: O padrão agora é o Industrial Dark (Sarak Sovereign)
        // Isso elimina o modo "Blueprint/Grid" no primeiro acesso.
        const DEFAULT_INDUSTRIAL_SEED = {
            mode: 'dark',
            colorPalette: 'industrial-night',
            primaryColor: '#00f2ff', // Neon Sarak
            layout: 'sidebar',
            navigationStyle: 'sidebar',
            borderRadius: 12,
            glassOpacity: 0.4,
            glassBlur: 10,
            texture: 'dots',
            fontScale: 'm'
        };

        const defaultThemeId = opt?.theme?.defaultTheme || 'futurist';
        const defaultTheme = (BASE_PRESETS as any)[defaultThemeId] || BASE_PRESETS.futurist;
        
        // Semente inicial: Merge entre o hardcoded industrial e o que vier via props
        const seedConfig = { ...DEFAULT_INDUSTRIAL_SEED, ...defaultTheme, ...configRef.current };

        if (typeof window === 'undefined') return seedConfig;
        
        try {
            const key = opt?.persistence?.storageKey || DEFAULT_STORAGE_KEY;
            const saved = localStorage.getItem(key);
            if (saved) {
                const parsed = JSON.parse(saved);
                
                // Validação rigorosa: Precisamos de pelo menos o modo e o estilo de navegação
                if (!parsed.mode || !parsed.navigationStyle) {
                    console.warn("[Sarak:UI] Design corrompido detectado no storage. Resetando para Industrial.");
                    localStorage.removeItem(key); // Limpa o lixo
                    return seedConfig;
                }

                // Filtramos campos nulos ou indefinidos
                const validParsed = Object.fromEntries(
                    Object.entries(parsed).filter(([_, v]) => v !== null && v !== undefined && v !== "")
                );
                
                console.log("[Sarak:UI] Design industrial hidratado com sucesso.");
                return { ...seedConfig, ...validParsed };
            }
        } catch (e) {
            console.error("[Sarak:UI] Falha catastrófica na hidratação do design:", e);
        }
        return seedConfig;
    });


    // Prioritize tokens/ids passed via props or config object (Static refs for stability)
    const activeToken = token || initialPropsConfig.token || initialPropsConfig.authApi?.token;
    const activeUserId = userId || initialPropsConfig.userId || initialPropsConfig.user?.id;

    const uiBaseUrl = useMemo(() => {
        return optionsRef.current?.endpoints?.baseUrl || DEFAULT_UI_BASE_URL;
    }, []);

    const storageKey = useMemo(() => {
        return optionsRef.current?.persistence?.storageKey || DEFAULT_STORAGE_KEY;
    }, []);


    // 1. Backend Loading (Sovereign Persistence v9.3)
    useEffect(() => {
        if (!isHydrated) return;

        const loadInitialDesign = async () => {
            const opt = optionsRef.current;
            
            // Priority 1: Custom onLoad callback
            if (opt?.persistence?.onLoad) {
                try {
                    const customDesign = await opt.persistence.onLoad();
                    if (customDesign) {
                        setDesign((prev: any) => ({ ...prev, ...customDesign }));
                        setIsBackendLoaded(true);
                        return;
                    }
                } catch (e) {
                    console.error("[Sarak:UI] Error in custom onLoad:", e);
                }
            }

            // Priority 2: Remote Persistence (Only if explicitly enabled via designPath)
            if (activeToken && !isBackendLoaded && opt?.endpoints?.designPath) {
                try {
                    const designPath = opt.endpoints.designPath;
                    const resp = await fetch(`${uiBaseUrl}${designPath}`, {
                        headers: { 'Authorization': `Bearer ${activeToken}` }
                    });
                    if (resp.ok) {
                        const data = await resp.json();
                        if (data.design && Object.keys(data.design).length > 0) {
                            setDesign((prev: any) => ({ ...prev, ...data.design }));
                        }
                        setIsBackendLoaded(true);
                    }
                } catch (e) {
                    // Fallback silenciado
                }
            }
        };

        loadInitialDesign();
        // REMOVED 'options' from dependency to stop reactivity-leak from Host
    }, [activeToken, isBackendLoaded, isHydrated, uiBaseUrl]);


    // 2. Automatic Persistence (Sovereign Persistence v9.3)
    useEffect(() => {
        if (!isHydrated) return;

        const timer = setTimeout(async () => {
            const opt = optionsRef.current;
            try {
                // Local sync (Sovereign)
                localStorage.setItem(storageKey, JSON.stringify(design));
                
                // Priority 1: Custom onSave callback
                if (opt?.persistence?.onSave) {
                    await opt.persistence.onSave(design);
                } 
                // Priority 2: Remote Persistence (Only if explicitly enabled via designPath)
                else if (activeToken && opt?.endpoints?.designPath) {
                    const designPath = opt.endpoints.designPath;
                    await fetch(`${uiBaseUrl}${designPath}`, {
                        method: 'POST',
                        headers: { 
                            'Authorization': `Bearer ${activeToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ design })
                    });
                }
                // No fallback to default /design to avoid 404 spam in terminal
            } catch (e) {
                console.error("[UI-Core] Error persisting design:", e);
            }
        }, 1500);

        return () => clearTimeout(timer);
        // REMOVED 'options' from dependency to stop reactivity-leak from Host
    }, [design, activeToken, isHydrated, uiBaseUrl, storageKey]);


    // 3. Local Synchronization (Immediate Fallback)
    useEffect(() => {
        if (typeof window !== 'undefined' && isHydrated && !isBackendLoaded) {
            localStorage.setItem(storageKey, JSON.stringify(design));
        }
    }, [design, isHydrated, isBackendLoaded, storageKey]);

    // Module loading and initial state (Reactive Discovery v9.0)
    useEffect(() => {
        console.log("[SarakUIProvider] Mounting Provider. Manifest present:", !!options?.manifest);

        // 1. Garantir que o componente de personalização está registrado globalmente
        registerLocalComponent('mx-customization', ThemeCustomizationTab);

        // 2. Registrar módulos do manifesto (se houver)
        if (options?.manifest?.modules) {
            options.manifest.modules.forEach((mod: any) => {
                registerSarakModule(mod);
            });
        }

        // 3. Garantir que o módulo de personalização existe no registro com prioridade máxima
        // Isso garante que ele apareça na aba correta e seja acessível nativamente.
        registerSarakModule({
            id: 'mx-customization',
            label: 'Design Engine',
            icon: 'Palette',
            category: 'Personalização',
            priority: 9999, // Absolute priority
            component: ThemeCustomizationTab 
        });

        const updateModules = () => {
            const current = getRegisteredModules();
            console.log("[SarakUIProvider] Registry updated. Count:", current.length, current.map(m => m.id));
            setRegisteredModules([...current]); // Spread to force reference change
        };

        updateModules();
        setIsHydrated(true);

        // Subscribe to future registrations (Passive Discovery)
        const unsubscribe = subscribeToRegistry(updateModules);
        return () => {
            unsubscribe();
        };
    }, [options?.manifest]);

    // Advanced Fonts Injection
    useEffect(() => {
        if (typeof document === 'undefined') return;
        
        // Font Preconnect & DNS Prefetch (CLS Optimization)
        const domains = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'];
        domains.forEach(domain => {
            const preconnect = document.createElement('link');
            preconnect.rel = 'preconnect';
            preconnect.href = domain;
            document.head.appendChild(preconnect);
        });

        const ID = 'sarak-core-fonts';
        if (document.getElementById(ID)) return;
        const style = document.createElement('style');
        style.id = ID;
        style.textContent = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800;900&family=Outfit:wght@300;400;600;700&display=swap');`;
        document.head.prepend(style);
    }, []);

    // --- SOVEREIGN INDUSTRIAL INJECTION (v10.0) ---
    // Automates DOM attributes and core dimensions to prevent flattened layouts in Host systems.
    useEffect(() => {
        if (typeof document === 'undefined') return;
        
        const body = document.body;
        const root = document.getElementById('root') || document.documentElement;
        
        // 1. Core Attributes
        body.setAttribute('data-sarak-layout', 'sovereign');
        body.setAttribute('data-sarak-engine', 'industrial');
        root.setAttribute('data-sarak-layout', 'sovereign');
        
        // 2. Emergency Layout Fix (Prevents DOM width 0)
        const styleId = 'sarak-industrial-vaccine';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                html, body, #root { 
                    height: 100% !important; 
                    width: 100% !important; 
                    margin: 0; 
                    padding: 0; 
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                [data-sarak-layout="sovereign"] {
                    background-color: #0f172a; /* Slate 900 */
                }
            `;
            document.head.appendChild(style);
        }

        // 3. Emergency CSS Variables (Bridge for slow CSS loads)
        const rootStyle = document.documentElement.style;
        if (!rootStyle.getPropertyValue('--theme-primary')) {
            rootStyle.setProperty('--theme-primary', '#00f2ff');
            rootStyle.setProperty('--theme-body', '#0f172a');
            rootStyle.setProperty('--theme-surface', '#1e293b');
        }
        
        console.log("[Sarak:UI] Industrial DNA Injected into DOM.");
    }, []);

    const applyConfig = useCallback((partial: any) => {
        setDesign((prev: any) => {
            const next = validateDesign({ ...prev, ...partial });
            // Persistência Imediata (v9.5 Patch)
            if (typeof window !== 'undefined') {
                localStorage.setItem(storageKey, JSON.stringify(next));
            }
            return next;
        });
    }, [storageKey]);

    const applyFullConfig = useCallback((config: any) => {
        const next = validateDesign(config);
        console.log("[Sarak:UI] Aplicando configuração completa ao sistema:", next);
        
        // Persistência Imediata e Atômica (v9.5 Patch)
        if (typeof window !== 'undefined') {
            localStorage.setItem(storageKey, JSON.stringify(next));
            console.log("[Sarak:UI] Persistência síncrona concluída no localStorage.");
        }
        
        setDesign(next);
    }, [storageKey]);

    const uiContextValue = useMemo(() => ({
        ...design, // Spread design tokens for direct access (v7.1 Compatibility)
        discoveryEndpoints: options?.endpoints?.discovery || discoveryEndpoints || [],
        design,
        setDesign,
        applyConfig,
        applyFullConfig,
        registeredModules,
        layouts: Object.values(LAYOUTS),
        isHydrated,
        options
    }), [discoveryEndpoints, design, applyConfig, applyFullConfig, registeredModules, isHydrated, options]);

    return (
        <UIContext.Provider value={uiContextValue}>
            <DesignInjector design={design} />
            <NoiseOverlay />
            {children}
        </UIContext.Provider>
    );
};

export default SarakUIProvider;

