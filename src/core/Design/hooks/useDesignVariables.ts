import { useMemo } from 'react';
import { getAllDesignTokens } from '../master-map';
import { computeColorVariants } from '../../../core/Provider/utils/color-engine';

/**
 * Helper para converter camelCase para kebab-case (ex: cardBorderRadius -> card-border-radius)
 */
const toKebabCase = (str: string) => 
    str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);

/**
 * Hook Universal de Tradução de Design (v12.8 - Atomic Sync)
 * 
 * Este é o "Coração" da sincronização. Ele garante que qualquer token definido 
 * nos 17 schemas seja traduzido para o padrão CSS que o sistema espera.
 */
export const useDesignVariables = (design: any) => {
    return useMemo(() => {
        if (!design) return { variables: {}, attributes: {} };

        const variables: Record<string, string> = {};
        const attributes: Record<string, string> = {};
        const tokens = getAllDesignTokens();
        
        const mode = design.mode || 'dark';
        const isDark = mode === 'dark';
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
                            variables[`${v}-hover`] = variants.hover;
                            variables[`${v}-active`] = variants.active;
                            variables[`${v}-light`] = variants.light;
                            
                            // Também gera variante para o padrão sarak-kebab
                            variables[`${autoVar}-rgb`] = variants.rgb;
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

        // 2. PONTE DE LEGADO & FALLBACKS (A "Segurança" do Fluxo)
        // Garante que variáveis antigas ou de sistema recebam os valores dos novos tokens granulares.
        
        const primary = design.colorPrimary || '#00f2ff';
        const secondary = design.colorSecondary || '#7000ff';
        const radius = design.cardBorderRadius !== undefined ? `${design.cardBorderRadius}px` : '12px';
        const bgBase = design.bgBaseColor || (isDark ? '#0a0a0c' : '#ffffff');
        const cardBg = design.cardBackgroundColor || (isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.8)');

        // Cores Primordiais
        variables['--theme-primary'] = primary;
        variables['--sarak-color-primary'] = primary;
        variables['--primary-color'] = primary;

        variables['--theme-secondary'] = secondary;
        variables['--sarak-secondary-color'] = secondary;
        variables['--secondary-color'] = secondary;

        // Geometria de Fallback
        variables['--radius-theme'] = radius;
        variables['--sarak-card-radius'] = radius;

        // Superfícies e Fundos
        variables['--theme-body'] = bgBase;
        variables['--bg-body'] = bgBase;
        variables['--sarak-bg-base'] = bgBase;

        variables['--theme-card'] = cardBg;
        variables['--theme-surface'] = cardBg;
        variables['--bg-card'] = cardBg;
        variables['--sarak-card-bg'] = cardBg;

        // Tipografia
        const fontScaleMap: Record<string, string> = { 'pp': '0.75', 'p': '0.9', 'm': '1.0', 'g': '1.15', 'gg': '1.3' };
        variables['--font-size-factor'] = fontScaleMap[design.fontScale] || '1.0';
        variables['--font-main'] = design.bodyFont || "'Inter', sans-serif";
        variables['--font-heading'] = design.headingFont || "'Outfit', sans-serif";

        return { variables, attributes };
    }, [design]);
};
