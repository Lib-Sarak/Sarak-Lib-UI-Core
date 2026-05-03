import React, { useEffect } from 'react';
import { DESIGN_MANIFEST } from '../manifest';
import { BEZIER_CURVES } from '../constants';
import { computeColorVariants } from '../utils/color-engine';
import { COLOR_PALETTES } from '../../../constants/design-tokens';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

/**
 * DesignInjector (v10.1)
 * 
 * Componente responsável pela sincronização entre o estado React (Design Tokens)
 * e o ambiente DOM (Variáveis CSS, Atributos e Classes).
 */
export const DesignInjector: React.FC<{ design: any }> = ({ design: s }) => {

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

    // Sincronização do Título da Aba (Branding & Identidade)
    useEffect(() => {
        if (s?.systemName && typeof document !== 'undefined') {
            document.title = s.systemName;
        }
    }, [s?.systemName]);

    const prevDesignRef = React.useRef<any>(null);

    useIsomorphicLayoutEffect(() => {
        if (typeof document === 'undefined') return;
        const root = document.documentElement;
        const body = document.body;

        if (!s) return;

        // --- CSS CLEANUP ENGINE (v10.2) ---
        const cleanAllSarakVariables = () => {
            // Se estamos editando um rascunho 'custom', não limpamos as variáveis para evitar "flicker"
            // O rascunho cuidará de sobrescrever o que for necessário.
            if (s.layout === 'custom' && prevDesignRef.current?.layout === 'custom') {
                return;
            }

            const targets = [root, body];
            targets.forEach(target => {
                const targetStyle = target.style;
                for (let i = targetStyle.length - 1; i >= 0; i--) {
                    const prop = targetStyle[i];
                    if (prop && (prop.startsWith('--sarak-') || prop.startsWith('--sx-') || prop.startsWith('--theme-') || prop.startsWith('--bg-') || prop.startsWith('--border-color'))) {
                        targetStyle.removeProperty(prop);
                    }
                }
            });
            
            const levels = ['primary', 'secondary', 'accent', 'surface', 'success', 'warning', 'error', 'body', 'card', 'sidebar', 'button', 'border', 'texture', 'header', 'title'];
            levels.forEach(level => {
                root.style.removeProperty(`--${level}-color`);
                body.style.setProperty(`--${level}-color`, '');
                root.style.removeProperty(`--theme-${level}`);
                body.style.setProperty(`--theme-${level}`, '');
            });
        };
        cleanAllSarakVariables();

        // One-time injection of Sarak Bezier Curves
        if (!prevDesignRef.current) {
            Object.entries(BEZIER_CURVES).forEach(([k, v]) => root.style.setProperty(k, v));
        }

        // --- COMPREHENSIVE TOKEN INJECTION ENGINE (v10.3) ---
        const activePalette = COLOR_PALETTES.find((p: any) => p.id === s.colorPalette);
        const paletteColors = activePalette?.colors || {};

        // 1. First pass: Inject all tokens defined in the manifest
        Object.entries(DESIGN_MANIFEST).forEach(([key, config]) => {
            const rawValue = s[key];
            if (rawValue === undefined) return;

            let finalValueForInjection = rawValue;

            // Handle color palette defaults for primary/secondary etc if not manually set
            if (key.endsWith('Color') || key === 'primaryColor') {
                const level = key.replace('Color', '');
                const paletteHex = (paletteColors as any)[level === 'primary' ? 'primary' : level];
                if (paletteHex && (!rawValue || rawValue === 'transparent')) {
                    finalValueForInjection = paletteHex;
                }
            }

            // Handle hierarchical objects (like borderRadius.sm)
            if (typeof rawValue === 'object' && rawValue !== null && !Array.isArray(rawValue) && config.vars && !config.transform) {
                Object.entries(rawValue).forEach(([subKey, subVal]) => {
                    config.vars?.forEach(v => {
                        const nestedVar = `${v}-${subKey}`;
                        let finalSubVal = String(subVal);
                        if (config.unit && typeof subVal === 'number') finalSubVal = `${subVal}${config.unit}`;
                        root.style.setProperty(nestedVar, finalSubVal);
                        body.style.setProperty(nestedVar, finalSubVal);
                    });
                });
                return;
            }

            let finalValue = finalValueForInjection?.toString() || '';
            const extraVars: Record<string, string> = {};

            if (config.transform) {
                const t = config.transform(finalValueForInjection);
                if (typeof t === 'object' && t !== null) {
                    if (key.endsWith('Color') || key === 'primaryColor') {
                        // Special handling for color variants
                        const level = key.replace('Color', '');
                        const prefix = `--theme-${level === 'primary' ? 'primary' : level}`;

                        finalValue = t.main;
                        extraVars[`${prefix}-rgb`] = t.rgb;
                        extraVars[`${prefix}-bg`] = t.bg;
                        extraVars[`${prefix}-border`] = t.border;
                        extraVars[`${prefix}-hover`] = t.hover;
                        extraVars[`${prefix}-active`] = t.active;
                        extraVars[`--${level === 'primary' ? 'primary' : level}-color`] = t.main;
                        extraVars[`--${level === 'primary' ? 'primary' : level}-color-rgb`] = t.rgb;
                    } else if (key === 'fontScale') {
                        finalValue = t.px;
                        extraVars['--font-size-factor'] = t.factor;
                    } else if (key === 'scaleRatio') {
                        finalValue = String(t.ratio);
                        extraVars['--theme-gap-scaled'] = t.gap;
                        extraVars['--theme-pad-scaled'] = t.pad;
                        extraVars['--theme-radius-scaled'] = t.radius;
                    } else if (key === 'fluidScaling') {
                        finalValue = '1';
                        extraVars['--theme-font-size-base'] = t.base;
                        extraVars['--theme-gap-scaled'] = t.gap;
                        extraVars['--theme-pad-scaled'] = t.padding;
                    } else {
                        // Generic object transform
                        finalValue = t.main ?? String(t);
                        Object.entries(t).forEach(([k, v]) => {
                            if (k.startsWith('--')) extraVars[k] = String(v);
                        });
                    }
                } else {
                    finalValue = String(t);
                }
            }

            if (config.unit && typeof rawValue === 'number') finalValue = `${rawValue}${config.unit}`;
            
            if (config.vars) {
                config.vars.forEach(v => {
                    root.style.setProperty(v, finalValue);
                    body.style.setProperty(v, finalValue);
                });
                Object.entries(extraVars).forEach(([ev, evVal]) => {
                    root.style.setProperty(ev, evVal);
                    body.style.setProperty(ev, evVal);
                });
            }

            if (config.attr) {
                const attrValue = key === 'fontScale' ? s[key] : finalValue;
                body.setAttribute(config.attr, String(attrValue));
                root.setAttribute(config.attr, String(attrValue));
            }

            if (config.classPrefix) {
                const isBool = typeof rawValue === 'boolean';
                const activeClass = isBool ? (rawValue ? config.classPrefix : null) : `${config.classPrefix}${rawValue}`;
                Array.from(body.classList).forEach(c => {
                    if (c.startsWith(config.classPrefix!) || (isBool && c === config.classPrefix)) {
                        body.classList.remove(c);
                    }
                });
                if (activeClass) body.classList.add(activeClass);
            }
        });

        // --- DYNAMIC LAYER ROUTER (Sovereign Engine v10.3) ---
        const mode = s.mode || 'dark';
        const anchorColor = mode === 'dark' ? '#000000' : '#ffffff';
        
        const p = computeColorVariants(s.primaryColor || '#3b82f6', anchorColor);
        const sc = computeColorVariants(s.secondaryColor || '#6366f1', anchorColor);
        const t_tri = computeColorVariants(s.tertiaryColor || '#10b981', anchorColor);
        const neutral = computeColorVariants(mode === 'dark' ? '#1e293b' : '#f1f5f9', anchorColor);

        const injectLayer = (slot: string, defaultVariants: any) => {
            const prefix = `--theme-${slot}`;
            let finalVariants = { ...defaultVariants };

            // 1. Get potential overrides from the design state
            const baseOverride = s[`${slot}Color`] || s[`${slot}BackgroundColor`];
            const hoverOverride = s[`${slot}HoverColor`];
            const activeOverride = s[`${slot}ActiveColor`];
            const noiseOverride = s[`${slot}NoiseOpacity`];

            // 2. If a base color is explicitly set for this slot, re-calculate variants
            if (baseOverride && baseOverride !== 'transparent') {
                finalVariants = computeColorVariants(baseOverride, anchorColor);
            }

            // 3. Apply specific state overrides (Hover/Active) if provided
            if (hoverOverride && hoverOverride !== 'transparent') finalVariants.hover = hoverOverride;
            if (activeOverride && activeOverride !== 'transparent') finalVariants.active = activeOverride;

            // 4. Inject into DOM
            const target = body;
            target.style.setProperty(prefix, finalVariants.main);
            target.style.setProperty(`${prefix}-rgb`, finalVariants.rgb);
            target.style.setProperty(`${prefix}-bg`, finalVariants.bg);
            target.style.setProperty(`${prefix}-border`, finalVariants.border);
            target.style.setProperty(`${prefix}-hover`, finalVariants.hover);
            target.style.setProperty(`${prefix}-active`, finalVariants.active);
            target.style.setProperty(`${prefix}-focus`, finalVariants.focus);

            // Sarak Sovereign Aliases (v10.3)
            const sarakPrefix = `--sarak-${slot}`;
            target.style.setProperty(`${sarakPrefix}-bg`, finalVariants.main);
            target.style.setProperty(`${sarakPrefix}-hover`, finalVariants.hover);
            target.style.setProperty(`${sarakPrefix}-active`, finalVariants.active);

            if (noiseOverride !== undefined) {
                target.style.setProperty(`${prefix}-noise-opacity`, String(noiseOverride));
                target.style.setProperty(`${sarakPrefix}-noise-opacity`, String(noiseOverride));
            }
            
            // Bridge/Legacy Aliases
            if (slot === 'sidebar') {
                target.style.setProperty('--bg-sidebar', finalVariants.main);
                target.style.setProperty('--theme-side-bg', finalVariants.main);
            }
            if (slot === 'topbar') {
                target.style.setProperty('--bg-topbar', finalVariants.main);
            }
            if (slot === 'card') {
                target.style.setProperty('--bg-card', finalVariants.main);
                target.style.setProperty('--theme-surface-main', finalVariants.main);
            }
            if (slot === 'button') {
                target.style.setProperty('--primary-color', finalVariants.main);
                target.style.setProperty('--primary-color-rgb', finalVariants.rgb);
                target.style.setProperty('--theme-button-text', mode === 'dark' ? '#fff' : '#000');
            }
        };

        // Initialize Layers based on Industrial Hierarchy
        const depth = parseInt(s.colorDepth) || 1;
        const variation = parseInt(s.colorVariation) || 1;

        if (depth === 1) {
            injectLayer('sidebar', variation === 3 ? p : neutral);
            injectLayer('topbar', variation === 3 ? p : neutral);
            injectLayer('card', neutral);
            injectLayer('button', p);
        } else if (depth === 2) {
            injectLayer('sidebar', p);
            injectLayer('topbar', p);
            injectLayer('card', sc);
            injectLayer('button', sc);
        } else {
            injectLayer('sidebar', p);
            injectLayer('topbar', p);
            injectLayer('card', sc);
            injectLayer('button', variation === 3 ? t_tri : p);
        }

        if (!prevDesignRef.current || prevDesignRef.current.mode !== s.mode) {
            const finalMode = s.mode === 'light' ? 'light' : 'dark';
            body.classList.remove('light', 'dark');
            body.classList.add(finalMode);
        }

        prevDesignRef.current = { ...s };
    }, [s]);

    return null;
};
