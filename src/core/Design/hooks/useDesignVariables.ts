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

        // 2. CÁLCULOS DERIVADOS (Geometria Dinâmica)
        if (design.cardGeometricCut && design.cardGeometricCut > 0) {
            const cut = design.cardGeometricCut;
            variables['--sarak-card-clip-path'] = `polygon(${cut}px 0%, calc(100% - ${cut}px) 0%, 100% ${cut}px, 100% calc(100% - ${cut}px), calc(100% - ${cut}px) 100%, ${cut}px 100%, 0% calc(100% - ${cut}px), 0% ${cut}px)`;
        } else {
            variables['--sarak-card-clip-path'] = 'none';
        }

        // 3. OTIMIZAÇÃO FINAL
        // O sistema agora é 100% Data-Driven. Nenhuma variável é injetada manualmente.
        // Se o token existe no Schema, ele existe no CSS.

        return { variables, attributes };
    }, [design]);
};
