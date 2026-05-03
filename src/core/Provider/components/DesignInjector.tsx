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
            
            // Core Variables
            target.style.setProperty(prefix, color.main);
            target.style.setProperty(`${prefix}-rgb`, color.rgb);
            target.style.setProperty(`${prefix}-bg`, color.bg);
            target.style.setProperty(`${prefix}-border`, color.border);
            target.style.setProperty(`${prefix}-hover`, color.hover);
            target.style.setProperty(`${prefix}-active`, color.active);
            target.style.setProperty(`${prefix}-focus`, color.focus);
            target.style.setProperty(`${prefix}-light`, color.light);
            
            // Bridge Variables (Sincroniza com sarak-base.css Aliases)
            if (slot === 'sidebar') {
                target.style.setProperty('--bg-sidebar', color.main);
                target.style.setProperty('--bg-sidebar-rgb', color.rgb);
            }
            if (slot === 'card') {
                target.style.setProperty('--bg-card', color.main);
                target.style.setProperty('--bg-card-rgb', color.rgb);
                target.style.setProperty('--theme-surface-main', color.main);
            }
            if (slot === 'border') {
                target.style.setProperty('--border-color', color.main);
                target.style.setProperty('--theme-surface-border', color.main);
            }
            if (slot === 'primary' || slot === 'button') {
                target.style.setProperty('--primary-color', color.main);
                target.style.setProperty('--primary-color-rgb', color.rgb);
            }
        };

        console.log(`[SarakUI] Multi-Tone Router Active: L${depth}V${variation}`);

        // 1. Mapeamento de Tons Base (Sempre injeta para garantir que SarakStats e outros funcionem)
        injectLayer('primary', p);
        injectLayer('secondary', sc);
        injectLayer('accent', t_tri);

        // 2. Mapeamento Estrutural Dinâmico
        if (depth === 1) {
            // NÍVEL 1: MONO-TONE
            if (variation === 2) {
                // Mono + Neutro (Evita aspecto chapado)
                injectLayer('sidebar', p);
                injectLayer('card', neutral);
                injectLayer('button', p);
                injectLayer('border', p);
            } else {
                // Pure Branding
                injectLayer('sidebar', p);
                injectLayer('card', p);
                injectLayer('button', p);
                injectLayer('border', p);
            }
        } else if (depth === 2) {
            // NÍVEL 2: DUAL-TONE (Estrutura vs Ação)
            if (variation === 2) {
                // Mapeamento 2: Sidebar (Primary) + Cards/Bordas (Secondary)
                injectLayer('sidebar', p);
                injectLayer('card', sc);
                injectLayer('border', sc);
                injectLayer('button', sc);
            } else {
                // Mapeamento 1: Sidebar/Botões (Primary) + Cards/Bordas (Secondary)
                injectLayer('sidebar', p);
                injectLayer('button', p);
                injectLayer('card', sc);
                injectLayer('border', sc);
            }
        } else if (depth === 3) {
            // NÍVEL 3: TRI-TONE (O ápice industrial)
            if (variation === 2) {
                // Mapeamento 2: Sidebar (Primary) + Cards (Secondary) + Micro-detalhes (Tertiary)
                injectLayer('sidebar', p);
                injectLayer('card', sc);
                injectLayer('border', t_tri);
                injectLayer('button', sc);
            } else if (variation === 3) {
                // Mapeamento 3: Corpo (Primary) + Sidebar (Secondary) + Ação/Botões (Tertiary)
                body.style.setProperty('--bg-body', p.main);
                body.style.setProperty('--bg-body-rgb', p.rgb);
                injectLayer('sidebar', sc);
                injectLayer('card', sc);
                injectLayer('button', t_tri);
                injectLayer('border', t_tri);
            } else {
                // Mapeamento 1: Estrutura/Sidebar (Primary) + Cards (Secondary) + Bordas (Tertiary)
                injectLayer('sidebar', p);
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
