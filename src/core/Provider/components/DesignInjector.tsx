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

        // --- CSS CLEANUP ENGINE (v9.5) ---
        const cleanAllSarakVariables = () => {
            const rootStyle = root.style;
            for (let i = rootStyle.length - 1; i >= 0; i--) {
                const prop = rootStyle[i];
                if (prop && (prop.startsWith('--sarak-') || prop.startsWith('--sx-') || prop.startsWith('--theme-'))) {
                    rootStyle.removeProperty(prop);
                }
            }
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
                Object.entries(activePalette.colors as Record<string, string>).forEach(([level, hex]) => {
                    const levelKey = level === 'primary' ? 'primaryColor' : `${level}Color`;
                    const levelConfig = DESIGN_MANIFEST[levelKey];

                    if (level === 'primary' && s.primaryColor) return;

                    if (levelConfig && levelConfig.vars) {
                        const t = computeColorVariants(hex, '#000');
                        const prefix = `--theme-${level}`;

                        levelConfig.vars.forEach(v => root.style.setProperty(v, t.main));
                        root.style.setProperty(`${prefix}-rgb`, t.rgb);
                        root.style.setProperty(`${prefix}-bg`, t.bg);
                        root.style.setProperty(`${prefix}-border`, t.border);
                        root.style.setProperty(`${prefix}-hover`, t.hover);
                        root.style.setProperty(`${prefix}-active`, t.active);
                        root.style.setProperty(`${prefix}-focus`, t.focus);
                        root.style.setProperty(`${prefix}-light`, t.light);

                        if (level === 'primary') {
                            root.style.setProperty('--theme-primary-rgb', t.rgb);
                        }
                    }
                });

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

        // REFORÇO DE SOBERANIA
        if (s.primaryColor) {
            const t = computeColorVariants(s.primaryColor, s.mode === 'dark' ? '#000' : '#fff');
            root.style.setProperty('--theme-primary', t.main);
            root.style.setProperty('--theme-primary-rgb', t.rgb);
            root.style.setProperty('--theme-accent', t.main);
        }

        // --- DYNAMIC COLOR ROUTER (Multi-Tone Engine v10.0) ---
        const depth = parseInt(s.colorDepth) || 1;
        const variation = parseInt(s.colorVariation) || 1;

        console.log(`[SarakUI] Applying Multi-Tone Engine: Depth ${depth}, Variation ${variation}`);

        const p = computeColorVariants(s.primaryColor || '#3b82f6', '#3b82f6');
        const sc = computeColorVariants(s.secondaryColor || '#6366f1', '#6366f1');
        const t_tri = computeColorVariants(s.tertiaryColor || '#10b981', '#10b981');
        const neutral = computeColorVariants('#1e293b', '#1e293b');

        const injectLayer = (slot: string, color: any) => {
            const prefix = `--theme-${slot}`;
            root.style.setProperty(prefix, color.main);
            root.style.setProperty(`${prefix}-rgb`, color.rgb);
            root.style.setProperty(`${prefix}-bg`, color.bg);
            root.style.setProperty(`${prefix}-border`, color.border);
            root.style.setProperty(`${prefix}-hover`, color.hover);
            root.style.setProperty(`${prefix}-active`, color.active);
            root.style.setProperty(`${prefix}-focus`, color.focus);
            root.style.setProperty(`${prefix}-light`, color.light);
            
            if (slot === 'button') {
                root.style.setProperty('--theme-primary', color.main);
                root.style.setProperty('--theme-primary-rgb', color.rgb);
            }
        };

        if (depth === 1) {
            if (variation === 2) {
                injectLayer('primary', p);
                injectLayer('card', neutral);
                injectLayer('sidebar', p);
                injectLayer('button', p);
                injectLayer('border', p);
            } else if (variation === 3) {
                injectLayer('primary', p);
                injectLayer('card', { ...p, main: `rgba(${p.rgb}, 0.1)` });
                injectLayer('sidebar', p);
                injectLayer('button', p);
                injectLayer('border', p);
            } else {
                injectLayer('primary', p);
                injectLayer('card', p);
                injectLayer('sidebar', p);
                injectLayer('button', p);
                injectLayer('border', p);
            }
        } else if (depth === 2) {
            if (variation === 2) {
                injectLayer('primary', p);
                injectLayer('sidebar', p);
                injectLayer('texture', p);
                injectLayer('card', sc);
                injectLayer('border', sc);
                injectLayer('button', p);
            } else if (variation === 3) {
                injectLayer('primary', p);
                injectLayer('sidebar', p);
                injectLayer('card', sc);
                injectLayer('button', sc);
                injectLayer('border', sc);
            } else {
                injectLayer('primary', p);
                injectLayer('sidebar', p);
                injectLayer('button', p);
                injectLayer('card', sc);
                injectLayer('border', sc);
            }
        } else if (depth === 3) {
            if (variation === 2) {
                injectLayer('primary', p);
                injectLayer('sidebar', p);
                injectLayer('card', sc);
                injectLayer('border', sc);
                injectLayer('button', t_tri);
            } else if (variation === 3) {
                injectLayer('primary', p);
                injectLayer('sidebar', p);
                injectLayer('card', sc);
                injectLayer('button', t_tri);
                injectLayer('border', t_tri);
            } else {
                injectLayer('primary', p);
                injectLayer('sidebar', p);
                injectLayer('header', p);
                injectLayer('card', sc);
                injectLayer('border', t_tri);
                injectLayer('button', p);
            }
        }

        if (!prevDesignRef.current || prevDesignRef.current.mode !== s.mode) {
            body.classList.remove('light', 'dark');
            body.classList.add(s.mode === 'dark' ? 'dark' : 'light');
        }

        prevDesignRef.current = { ...s };
    }, [s]);

    return null;
};
