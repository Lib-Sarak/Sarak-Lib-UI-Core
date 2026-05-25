import { useMemo } from 'react';
import { getAllDesignTokens } from '../master-map';
import { computeColorVariants, parseToRgba, rgbToHsl } from '../../../core/Provider/utils/color-engine';
import { syncThemeWithMode } from '../presets/themes/color-engine';

/**
 * Helper para converter camelCase para kebab-case (ex: cardBorderRadius -> card-border-radius)
 */
const toKebabCase = (str: string) => 
    str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);

/**
 * Hook Universal de Tradução de Design (v12.9 - Reactive Sync)
 * 
 * Este é o "Coração" da sincronização. Ele garante que qualquer token definido 
 * nos 17 schemas seja traduzido para o padrão CSS que o sistema espera.
 * Agora com suporte reativo à inversão dinâmica de cores (Sincronização de Modo).
 */
export const useDesignVariables = (rawDesign: any) => {
    return useMemo(() => {
        if (!rawDesign) return { variables: {}, attributes: {} };

        // 0. INTERCEPTAÇÃO DE MODO (LIGHT/DARK) - Sincronização Reativa em Tempo Real
        // Garante que, independente do que estiver no banco de dados ou no estado bruto, 
        // as cores sejam matematicamente forçadas a obedecer o targetMode (Claro/Escuro) 
        // antes de serem injetadas no DOM global.
        const targetMode = rawDesign.mode || 'dark';
        const design = syncThemeWithMode(rawDesign, targetMode);

        const variables: Record<string, string> = {};
        const attributes: Record<string, string> = {};
        const tokens = getAllDesignTokens();
        
        const isDark = targetMode === 'dark';
        const anchorColor = isDark ? '#000000' : '#ffffff';

        // 1. PROCESSAMENTO ATÔMICO (Do Token para a Variável)
        tokens.forEach(token => {
            const value = design[token.id] ?? token.defaultValue;
            const kebabId = toKebabCase(token.id);
            
            // Gerador de Variável Padrão: --sarak-[kebab-case]
            const autoVar = `--sarak-${kebabId}`;
            
            let finalValue = String(value);
            if (token.unit && typeof value === 'number') {
                finalValue = `${value}${token.unit}`;
            }
            variables[autoVar] = finalValue;

            // Injeção de Variáveis Extras definidas no Schema
            if (token.cssVars && token.cssVars.length > 0) {
                token.cssVars.forEach(v => {
                    variables[v] = finalValue;

                    // Gerador de Variantes Cromáticas (RGB, Hover, Active, Light)
                    if (token.generateVariants && token.type === 'color' && value && value !== 'transparent') {
                        try {
                            const variants = computeColorVariants(value, anchorColor);
                            variables[`${v}-rgb`] = variants.rgb;
                            variables[`${v}-bg`] = variants.bg;
                            variables[`${v}-border`] = variants.border;
                            variables[`${v}-10`] = variants[10];
                            variables[`${v}-20`] = variants[20];
                            variables[`${v}-30`] = variants[30];
                            variables[`${v}-40`] = variants[40];
                            variables[`${v}-50`] = variants[50];
                            variables[`${v}-hover`] = variants.hover;
                            variables[`${v}-active`] = variants.active;
                            variables[`${v}-light`] = variants.light;
                            
                            // Também gera variante para o padrão sarak-kebab
                            variables[`${autoVar}-rgb`] = variants.rgb;
                            variables[`${autoVar}-bg`] = variants.bg;
                            variables[`${autoVar}-border`] = variants.border;
                            variables[`${autoVar}-10`] = variants[10];
                            variables[`${autoVar}-20`] = variants[20];
                            variables[`${autoVar}-30`] = variants[30];
                            variables[`${autoVar}-40`] = variants[40];
                            variables[`${autoVar}-50`] = variants[50];
                            variables[`${autoVar}-hover`] = variants.hover;
                        } catch (e) {
                            console.error(`[AtomicSync] Error for ${token.id}:`, e);
                        }
                    }
                });
            }

            // Injeção de Atributos de Estado (data-sx-*)
            if (token.type === 'select' || token.type === 'boolean' || token.type === 'font') {
                attributes[`data-sx-${kebabId}`] = String(value);
            }
        });

        // 2. CÁLCULOS DERIVADOS (Geometria Dinâmica)
        const aliasPairs: Array<[string, string | undefined]> = [
            ['--text-main', variables['--sarak-text-main'] || variables['--theme-text-primary']],
            ['--text-muted', variables['--sarak-text-muted'] || variables['--theme-text-muted']],
            ['--text-secondary', variables['--sarak-text-sec']],
            ['--bg-body', variables['--sarak-bg-body'] || variables['--theme-body']],
            ['--bg-card', variables['--sarak-card-bg'] || variables['--theme-card']],
            ['--bg-sidebar', variables['--sarak-sidebar-bg'] || variables['--theme-sidebar-bg']],
            ['--border-color', variables['--sarak-card-border-color'] || variables['--theme-border']],
            ['--primary-color', variables['--sarak-primary-color'] || variables['--theme-primary']],
            ['--secondary-color', variables['--sarak-secondary-color'] || variables['--theme-secondary']],
            ['--accent-color', variables['--sarak-accent-color'] || variables['--theme-accent']],
            ['--surface-color', variables['--sarak-surface-color'] || variables['--theme-surface']]
        ];

        aliasPairs.forEach(([alias, value]) => {
            if (value) {
                variables[alias] = value;
            }
        });

        const primaryColor = variables['--theme-primary'] || variables['--primary-color'] || '#3b82f6';
        const { r, g, b } = parseToRgba(primaryColor);
        const [, , primaryLightness] = rgbToHsl(r, g, b);

        variables['--theme-text'] = variables['--text-main'] || (isDark ? '#ffffff' : '#0f172a');
        variables['--theme-on-primary'] = primaryLightness > 55 ? '#020617' : '#ffffff';
        variables['--sarak-vignette-color'] = isDark
            ? `rgba(0, 0, 0, ${design.vignetteOpacity ?? 0.3})`
            : 'rgba(0, 0, 0, 0)';
        variables['--sarak-vignette-blend-mode'] = isDark ? 'multiply' : 'normal';

        if (design.cardGeometricCut && design.cardGeometricCut > 0) {
            const cut = design.cardGeometricCut;
            variables['--sarak-card-clip-path'] = `polygon(${cut}px 0%, calc(100% - ${cut}px) 0%, 100% ${cut}px, 100% calc(100% - ${cut}px), calc(100% - ${cut}px) 100%, ${cut}px 100%, 0% calc(100% - ${cut}px), 0% ${cut}px)`;
        } else {
            variables['--sarak-card-clip-path'] = 'none';
        }

        return { variables, attributes };
    }, [rawDesign]);
};
