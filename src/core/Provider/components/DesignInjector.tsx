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
            
            const levels = ['primary', 'secondary', 'accent', 'surface', 'success', 'warning', 'error', 'body', 'card', 'sidebar', 'button', 'border', 'texture', 'header'];
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

        // --- COMPREHENSIVE COLOR INJECTION ENGINE (v10.2) ---
        const activePalette = COLOR_PALETTES.find((p: any) => p.id === s.colorPalette);
        const paletteColors = activePalette?.colors || {};

        Object.entries(s).forEach(([key, value]) => {
            const config = DESIGN_MANIFEST[key];
            if (!config) return;

            let finalValueForInjection = value;
            if (key === 'primaryColor' && value) {
                finalValueForInjection = value;
            } else if (key.endsWith('Color') || key === 'primaryColor') {
                const level = key.replace('Color', '');
                const paletteHex = (paletteColors as any)[level === 'primary' ? 'primary' : level];
                if (paletteHex) {
                    finalValueForInjection = paletteHex;
                }
            }

            // --- HIERARCHICAL OBJECT SUPPORT (Item 1) ---
            if (typeof value === 'object' && value !== null && !Array.isArray(value) && !key.endsWith('Color') && key !== 'primaryColor' && key !== 'scaleRatio' && key !== 'fluidScaling' && key !== 'fontScale') {
                Object.entries(value).forEach(([subKey, subVal]) => {
                    if (config.vars) {
                        config.vars.forEach(v => {
                            const nestedVar = `${v}-${subKey}`;
                            let finalSubVal = String(subVal);
                            if (config.unit && typeof subVal === 'number') finalSubVal = `${subVal}${config.unit}`;
                            root.style.setProperty(nestedVar, finalSubVal);
                            body.style.setProperty(nestedVar, finalSubVal);
                        });
                    }
                });
                return; // Nested objects handled specially
            }

            let finalValue = finalValueForInjection?.toString() || '';
            const extraVars: Record<string, string> = {};

            if (config.transform) {
                const t = config.transform(finalValueForInjection);
                if (typeof t === 'object' && t !== null) {
                    if (key.endsWith('Color') || key === 'primaryColor') {
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
                    } else if (t.main !== undefined) {
                        finalValue = t.main;
                        Object.entries(t).forEach(([k, v]) => {
                            if (k.startsWith('--')) extraVars[k] = String(v);
                        });
                    }
                } else {
                    finalValue = String(t);
                }
            }

            if (config.unit && typeof value === 'number') finalValue = `${value}${config.unit}`;
            
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
                body.setAttribute(config.attr, finalValue);
                root.setAttribute(config.attr, finalValue);
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

        // --- DYNAMIC COLOR ROUTER (Multi-Tone Engine v10.2) ---
        const depth = parseInt(s.colorDepth) || 1;
        const variation = parseInt(s.colorVariation) || 1;
        const mode = s.mode || 'dark';

        const p = computeColorVariants(s.primaryColor || '#3b82f6', mode === 'dark' ? '#000' : '#fff');
        const sc = computeColorVariants(s.secondaryColor || '#6366f1', mode === 'dark' ? '#000' : '#fff');
        const t_tri = computeColorVariants(s.tertiaryColor || '#10b981', mode === 'dark' ? '#000' : '#fff');
        const neutral = computeColorVariants(mode === 'dark' ? '#1e293b' : '#f1f5f9', mode === 'dark' ? '#000' : '#fff');

        const injectLayer = (slot: string, color: any) => {
            const target = body; // ABSOLUTE SOVEREIGNTY
            const prefix = `--theme-${slot}`;
            
            // --- INTERACTION STATE OVERRIDES (Item 3) ---
            const hoverOverride = s[`${slot}HoverColor`];
            const activeOverride = s[`${slot}ActiveColor`];
            const noiseOverride = s[`${slot}NoiseOpacity`];

            const finalColor = { ...color };
            if (hoverOverride) finalColor.hover = hoverOverride;
            if (activeOverride) finalColor.active = activeOverride;

            // Core Variables
            target.style.setProperty(prefix, finalColor.main);
            target.style.setProperty(`${prefix}-rgb`, finalColor.rgb);
            target.style.setProperty(`${prefix}-bg`, finalColor.bg);
            target.style.setProperty(`${prefix}-border`, finalColor.border);
            target.style.setProperty(`${prefix}-hover`, finalColor.hover);
            target.style.setProperty(`${prefix}-active`, finalColor.active);
            target.style.setProperty(`${prefix}-focus`, finalColor.focus);
            target.style.setProperty(`${prefix}-light`, finalColor.light);

            // --- LAYER-SPECIFIC TEXTURE (Item 4) ---
            if (noiseOverride !== undefined) {
                target.style.setProperty(`${prefix}-noise-opacity`, String(noiseOverride));
            }
            
            // Bridge Variables (Sincroniza com sarak-base.css Aliases)
            if (slot === 'sidebar') {
                target.style.setProperty('--bg-sidebar', finalColor.main);
                target.style.setProperty('--bg-sidebar-rgb', finalColor.rgb);
                target.style.setProperty('--theme-sidebar-bg', finalColor.main);
                target.style.setProperty('--theme-sidebar-bg-rgb', finalColor.rgb);
                target.style.setProperty('--theme-side-bg', finalColor.main);
                target.style.setProperty('--theme-side-bg-rgb', finalColor.rgb);
            }
            if (slot === 'topbar') {
                target.style.setProperty('--theme-topbar-bg', finalColor.main);
                target.style.setProperty('--theme-topbar-bg-rgb', finalColor.rgb);
                target.style.setProperty('--bg-topbar', finalColor.main);
                target.style.setProperty('--bg-topbar-rgb', finalColor.rgb);
            }
            if (slot === 'card') {
                target.style.setProperty('--bg-card', finalColor.main);
                target.style.setProperty('--bg-card-rgb', finalColor.rgb);
                target.style.setProperty('--theme-surface-main', finalColor.main);
                target.style.setProperty('--theme-card-bg', finalColor.main);
                target.style.setProperty('--theme-card-bg-rgb', finalColor.rgb);
            }
            if (slot === 'border') {
                target.style.setProperty('--border-color', finalColor.main);
                target.style.setProperty('--theme-surface-border', finalColor.main);
                target.style.setProperty('--theme-card-border', finalColor.main);
                target.style.setProperty('--theme-card-border-rgb', finalColor.rgb);
            }
            if (slot === 'primary' || slot === 'button') {
                target.style.setProperty('--primary-color', finalColor.main);
                target.style.setProperty('--primary-color-rgb', finalColor.rgb);
                target.style.setProperty('--theme-button-bg', finalColor.main);
                target.style.setProperty('--theme-button-bg-rgb', finalColor.rgb);
                target.style.setProperty('--theme-button-text', mode === 'dark' ? '#fff' : '#000');
            }
            if (slot === 'texture') {
                target.style.setProperty('--theme-texture-color', finalColor.main);
                target.style.setProperty('--theme-texture-color-rgb', finalColor.rgb);
            }
        };

        console.log(`[SarakUI] Multi-Tone Router Active: L${depth}V${variation}`);

        // 1. Mapeamento de Tons Base
        injectLayer('primary', p);
        injectLayer('secondary', sc);
        injectLayer('accent', t_tri);

        // 2. Mapeamento Estrutural Dinâmico (Presets de Elegância)
        if (depth === 1) {
            // NÍVEL 1: MONO-TONE
            if (variation === 2) {
                injectLayer('sidebar', { ...p, main: p.bg });
                injectLayer('topbar', { ...p, main: p.bg });
                injectLayer('card', neutral);
                injectLayer('button', p);
                injectLayer('border', p);
            } else if (variation === 3) {
                injectLayer('sidebar', p);
                injectLayer('topbar', p);
                injectLayer('card', p);
                injectLayer('button', p);
                injectLayer('border', p);
            } else {
                injectLayer('sidebar', neutral);
                injectLayer('topbar', neutral);
                injectLayer('card', neutral);
                injectLayer('button', p);
                injectLayer('border', p);
                body.style.setProperty('--theme-body', mode === 'dark' ? '#0f172a' : '#f8fafc');
                body.style.setProperty('--bg-body', mode === 'dark' ? '#0f172a' : '#f8fafc');
            }
        } else if (depth === 2) {
            // NÍVEL 2: DUAL-TONE
            if (variation === 2) {
                injectLayer('sidebar', p);
                injectLayer('topbar', p);
                injectLayer('card', sc);
                injectLayer('border', sc);
                injectLayer('button', sc);
            } else {
                injectLayer('sidebar', p);
                injectLayer('topbar', p);
                injectLayer('button', p);
                injectLayer('card', sc);
                injectLayer('border', sc);
            }
        } else if (depth === 3) {
            // NÍVEL 3: TRI-TONE
            if (variation === 2) {
                injectLayer('sidebar', p);
                injectLayer('topbar', p);
                injectLayer('card', sc);
                injectLayer('border', t_tri);
                injectLayer('button', sc);
            } else if (variation === 3) {
                body.style.setProperty('--bg-body', p.main);
                body.style.setProperty('--bg-body-rgb', p.rgb);
                injectLayer('sidebar', sc);
                injectLayer('topbar', sc);
                injectLayer('card', sc);
                injectLayer('button', t_tri);
                injectLayer('border', t_tri);
            } else {
                injectLayer('sidebar', p);
                injectLayer('topbar', p);
                injectLayer('card', sc);
                injectLayer('border', t_tri);
                injectLayer('button', p);
            }
        }

        // 3. Granular Overrides (Sovereign Authority)
        const isSet = (val: string) => val && val.length > 0 && val !== 'transparent';

        if (isSet(s.sidebarColor)) {
            injectLayer('sidebar', computeColorVariants(s.sidebarColor, mode === 'dark' ? '#000' : '#fff'));
        }
        if (isSet(s.topbarColor)) {
            injectLayer('topbar', computeColorVariants(s.topbarColor, mode === 'dark' ? '#000' : '#fff'));
        }
        if (isSet(s.cardBackgroundColor)) {
            injectLayer('card', computeColorVariants(s.cardBackgroundColor, mode === 'dark' ? '#000' : '#fff'));
        }
        if (isSet(s.cardBorderColor)) {
            injectLayer('border', computeColorVariants(s.cardBorderColor, mode === 'dark' ? '#000' : '#fff'));
        }
        if (isSet(s.buttonColor)) {
            injectLayer('button', computeColorVariants(s.buttonColor, mode === 'dark' ? '#000' : '#fff'));
        }
        if (isSet(s.textureColor)) {
            injectLayer('texture', computeColorVariants(s.textureColor, mode === 'dark' ? '#000' : '#fff'));
        }

        if (!prevDesignRef.current || prevDesignRef.current.mode !== s.mode) {
            body.classList.remove('light', 'dark');
            body.classList.add(s.mode === 'dark' ? 'dark' : 'light');
        }

        prevDesignRef.current = { ...s };
    }, [s]);

    return null;
};
