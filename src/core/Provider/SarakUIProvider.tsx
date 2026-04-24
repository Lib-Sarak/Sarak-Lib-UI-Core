import React, { ReactNode, useEffect, useState, useMemo, useCallback, useContext } from 'react';
import '../../styles/sarak-base.css';
import { LAYOUTS } from '../../constants/design-tokens';
import { getRegisteredModules } from '../Discovery/registry';

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
}

const UIContext = React.createContext<SarakUIContextType | undefined>(undefined);

export const useSarakUI = () => {
    const context = useContext(UIContext);
    if (!context) {
        return { 
            discoveryEndpoints: [], 
            design: {}, 
            registeredModules: [], 
            layouts: [], 
            isHydrated: false,
            // Fallback para evitar crashes em SSR ou contextos sem provider
            applyConfig: () => {},
            applyFullConfig: () => {}
        } as any;
    }
    // Retorna o contexto mesclado com o design para compatibilidade de API
    return {
        ...context,
        ...context.design
    };
};

// --- CHAVE DE PERSISTÊNCIA SARAK ---
const STORAGE_KEY = 'sarak-ui-design-v6.7';

interface SarakUIProviderProps {
    children: ReactNode;
    discoveryEndpoints?: string[];
    config?: any;
    token?: string | null;
    userId?: string | null;
}

// --- MANIFESTO DE DESIGN SOBERANO ---
export const DESIGN_MANIFEST: Record<string, {
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
            if (!v || typeof v !== 'string') return { main: '#3b82f6', rgb: '59, 130, 246', hover: '#2563eb', active: '#1d4ed8', focus: 'rgba(59, 130, 246, 0.4)' };
            const hex = v.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16) || 0;
            const g = parseInt(hex.substring(2, 4), 16) || 0;
            const b = parseInt(hex.substring(4, 6), 16) || 0;
            
            // Calculador de Estados v7.5
            const adjust = (c: number, f: number) => Math.round(Math.min(255, Math.max(0, c * f)));
            const toH = (n: number) => n.toString(16).padStart(2, '0');
            
            const hover = `#${toH(adjust(r, 0.9))}${toH(adjust(g, 0.9))}${toH(adjust(b, 0.9))}`;
            const active = `#${toH(adjust(r, 0.8))}${toH(adjust(g, 0.8))}${toH(adjust(b, 0.8))}`;

            return { 
                main: v, 
                rgb: `${r}, ${g}, ${b}`,
                hover,
                active,
                focus: `rgba(${r}, ${g}, ${b}, 0.4)`
            };
        }
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
    shadowIntensity: { vars: ['--shadow-intensity', '--sarak-shadow-intensity'] },
    cardPadding: { vars: ['--card-padding', '--sarak-card-padding', '--theme-card-padding'], unit: 'px' },
    tabGap: { vars: ['--tab-gap', '--sarak-tab-gap', '--theme-tab-gap'], unit: 'px' },
    tabSectionMargin: { vars: ['--tab-section-margin', '--sarak-tab-section-margin', '--theme-tab-section-margin'], unit: 'px' },
    isGeometricCut: { classPrefix: 'is-geometric', attr: 'data-geometric' },
    textureOpacity: { vars: ['--texture-opacity', '--sarak-texture-opacity', '--theme-texture-opacity'] },
    animationSpeed: { vars: ['--animation-speed', '--sarak-animation-speed', '--transition-speed'], unit: 's' },
    surfaceMaterial: { attr: 'data-surface', vars: ['--sarak-surface', '--surface-material'] },
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
    searchStyle: { attr: 'data-search-style' },
    emptyStateId: { attr: 'data-empty-state' },
    secondaryModuleId: { attr: 'data-sec-module' },
    // Engine Specialized Tokens v7.5
    fontScale: { 
        vars: ['--sarak-font-scale', '--sarak-font-size', '--font-size-factor', '--theme-font-size-base'], 
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
    contrastCurve: {
        vars: ['--sarak-contrast-curve'],
        transform: (v) => parseFloat(v) || 1.0
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
    chartSmoothing: { attr: 'data-chart-smoothing' }
};

const BEZIER_CURVES = {
    '--ease-sarak-cubic': 'cubic-bezier(0.65, 0, 0.35, 1)',
    '--ease-sarak-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
    '--ease-sarak-fluid': 'cubic-bezier(0.4, 0, 0.2, 1)',
    '--ease-sarak-elastic': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    '--ease-sarak-bounce': 'cubic-bezier(0.68, -0.6, 0.32, 1.6)'
};

const validateDesign = (design: any) => {
    const s = { ...design };
    const clamp = (val: any, min: number, max: number, fallback: number) => {
        const n = parseFloat(val);
        if (isNaN(n)) return fallback;
        return Math.min(Math.max(n, min), max);
    };

    s.scaleRatio = clamp(s.scaleRatio, 0.5, 2, 1);
    s.contrastCurve = clamp(s.contrastCurve, 0.5, 2, 1);
    s.glassBlur = clamp(s.glassBlur, 0, 60, 10);
    s.glassOpacity = clamp(s.glassOpacity, 0, 1, 0.7);
    s.borderRadius = clamp(s.borderRadius, 0, 60, 12);
    s.schema_version = "7.5";

    return s;
};

// Componente interno para gerenciar a injeção de design sem causar loops
const DesignInjector: React.FC<{ design: any }> = ({ design: s }) => {

    useEffect(() => {
        if (typeof document === 'undefined') return;
        const root = document.documentElement;
        const body = document.body;

        if (!s) return;

        // Injeção de Curvas de Bezier Sarak
        Object.entries(BEZIER_CURVES).forEach(([k, v]) => root.style.setProperty(k, v));

        Object.entries(s).forEach(([key, value]) => {
            const config = DESIGN_MANIFEST[key];
            if (!config) return;

            let finalValue = value?.toString() || '';
            let extraVars: Record<string, string> = {};

            if (config.transform) {
                const t = config.transform(value);
                if (typeof t === 'object' && t !== null) {
                    if (key === 'primaryColor') {
                        finalValue = t.main;
                        extraVars['--theme-primary-rgb'] = t.rgb;
                        extraVars['--theme-primary-hover'] = t.hover;
                        extraVars['--theme-primary-active'] = t.active;
                        extraVars['--theme-primary-focus'] = t.focus;
                    } else if (key === 'fontScale') {
                        finalValue = t.px;
                        extraVars['--font-size-factor'] = t.factor;
                    } else if (key === 'scaleRatio') {
                        finalValue = String(t.ratio);
                        extraVars['--theme-gap-scaled'] = t.gap;
                        extraVars['--theme-pad-scaled'] = t.pad;
                        extraVars['--theme-margin-scaled'] = t.margin;
                        extraVars['--theme-radius-scaled'] = t.radius;
                    }
                } else {
                    finalValue = String(t);
                }
            }

            if (config.unit && typeof value === 'number') finalValue = `${value}${config.unit}`;
            if (typeof value === 'boolean') finalValue = value ? '1' : '0';

            if (config.vars) {
                config.vars.forEach(v => root.style.setProperty(v, finalValue));
                Object.entries(extraVars).forEach(([ev, evVal]) => root.style.setProperty(ev, evVal));
            }

            if (config.attr) {
                body.setAttribute(config.attr, finalValue);
                root.setAttribute(config.attr, finalValue);
            }

            if (config.classPrefix) {
                const isBool = typeof value === 'boolean';
                const activeClass = isBool ? (value ? config.classPrefix : null) : `${config.classPrefix}${value}`;

                // Remoção de classes antigas do mesmo prefixo
                Array.from(body.classList).forEach(c => {
                    if (c.startsWith(config.classPrefix!) || (isBool && c === config.classPrefix)) {
                        body.classList.remove(c);
                    }
                });

                if (activeClass) body.classList.add(activeClass);
            }

        });

        // Mode cleanup
        body.classList.remove('light', 'dark');
        body.classList.add(s.mode === 'dark' ? 'dark' : 'light');
    }, [s]);

    return null;
};

export const SarakUIProvider: React.FC<SarakUIProviderProps> = ({
    children,
    discoveryEndpoints = [],
    config: initialPropsConfig = {}
}) => {
    // Inicialização Inteligente com Persistência
    const [design, setDesign] = useState(() => {
        if (typeof window === 'undefined') return initialPropsConfig;
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Mescla com props iniciais para garantir que novos campos do sistema existam
                return { ...initialPropsConfig, ...parsed };
            }
        } catch (e) {
            console.error("Erro ao carregar design do localStorage:", e);
        }
        return initialPropsConfig;
    });

    const [isHydrated, setIsHydrated] = useState(false);
    const [registeredModules, setRegisteredModules] = useState<any[]>([]);
    const [isBackendLoaded, setIsBackendLoaded] = useState(false);

    // Prioriza tokens/ids passados via props ou no objeto de config
    const activeToken = initialPropsConfig.token || initialPropsConfig.authApi?.token;
    const activeUserId = initialPropsConfig.userId || initialPropsConfig.user?.id;

    // Encontra o endpoint correto para o UI Core
    const uiBaseUrl = useMemo(() => {
        // Assume /api/ui como padrão se não descoberto
        return "http://localhost:8000/api/ui";
    }, []);

    // 1. Carregamento do Backend (Cross-Browser Persistence)
    useEffect(() => {
        if (activeToken && !isBackendLoaded && isHydrated) {
            const fetchDesign = async () => {
                try {
                    const resp = await fetch(`${uiBaseUrl}/design`, {
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
                    // Silenciando falha de sincronização inicial (fallback para localStorage ativo)
                }
            };
            fetchDesign();
        }
    }, [activeToken, isBackendLoaded, isHydrated, uiBaseUrl]);

    // 2. Persistência Automática (Debounced)
    useEffect(() => {
        if (!activeToken || !isHydrated) return;

        const timer = setTimeout(async () => {
            try {
                // Sincroniza localmente primeiro
                localStorage.setItem(STORAGE_KEY, JSON.stringify(design));
                
                // Sincroniza com a nuvem
                await fetch(`${uiBaseUrl}/design`, {
                    method: 'POST',
                    headers: { 
                        'Authorization': `Bearer ${activeToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ design })
                });
            } catch (e) {
                console.error("[UI-Core] Erro ao persistir design na nuvem:", e);
            }
        }, 1500); // 1.5s de debounce para evitar salvar em cada clique de slider

        return () => clearTimeout(timer);
    }, [design, activeToken, isHydrated, uiBaseUrl]);

    // 3. Sincronização Local (Fallback Imediato)
    useEffect(() => {
        if (typeof window !== 'undefined' && isHydrated && !isBackendLoaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(design));
        }
    }, [design, isHydrated, isBackendLoaded]);

    // Carregamento de módulos e estado inicial
    useEffect(() => {
        setRegisteredModules(getRegisteredModules());
        setIsHydrated(true);
    }, []);

    // Injeção de Fontes Advanced
    useEffect(() => {
        if (typeof document === 'undefined') return;
        const ID = 'sarak-core-fonts';
        if (document.getElementById(ID)) return;
        const style = document.createElement('style');
        style.id = ID;
        style.textContent = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800;900&family=Outfit:wght@300;400;600;700&display=swap');`;
        document.head.prepend(style);
    }, []);

    const applyConfig = useCallback((partial: any) => {
        setDesign((prev: any) => validateDesign({ ...prev, ...partial }));
    }, []);

    const applyFullConfig = useCallback((config: any) => {
        setDesign(validateDesign(config));
    }, []);

    const uiContextValue = useMemo(() => ({
        ...design, // Spread design tokens for direct access (v7.1 Compatibility)
        discoveryEndpoints: discoveryEndpoints || [],
        design,
        setDesign,
        applyConfig,
        applyFullConfig,
        registeredModules,
        layouts: Object.values(LAYOUTS),
        isHydrated
    }), [discoveryEndpoints, design, applyConfig, applyFullConfig, registeredModules, isHydrated]);

    return (
        <UIContext.Provider value={uiContextValue}>
            <DesignInjector design={design} />
            {children}
        </UIContext.Provider>
    );
};

export default SarakUIProvider;
