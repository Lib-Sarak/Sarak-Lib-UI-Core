import { useMemo } from 'react';
import { getAllDesignTokens } from '../master-map';
import { computeColorVariants } from '../../../core/Provider/utils/color-engine';

/**
 * Hook Universal de Tradução de Design (v12.0)
 * 
 * Transforma um objeto de estado de design (draft ou master) 
 * em um conjunto de variáveis CSS e atributos baseados no MASTER_DESIGN_MAP.
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

        // 1. Processamento Universal de Tokens
        tokens.forEach(token => {
            const value = design[token.id] ?? token.defaultValue;
            
            // Injeção de Variáveis CSS
            if (token.cssVars && token.cssVars.length > 0) {
                let finalValue = String(value);
                
                // Formatação com Unidade
                if (token.unit && typeof value === 'number') {
                    finalValue = `${value}${token.unit}`;
                }

                // Injeção da Variável Principal
                token.cssVars.forEach(v => {
                    variables[v] = finalValue;
                });

                // Motor de Variantes Automáticas (Cores)
                if (token.generateVariants && token.type === 'color' && value && value !== 'transparent') {
                    const variants = computeColorVariants(value, anchorColor);
                    const baseVar = token.cssVars[0]; // Usa a primeira como base (ex: --theme-primary)
                    
                    variables[`${baseVar}-rgb`] = variants.rgb;
                    variables[`${baseVar}-bg`] = variants.bg;
                    variables[`${baseVar}-border`] = variants.border;
                    variables[`${baseVar}-hover`] = variants.hover;
                    variables[`${baseVar}-active`] = variants.active;
                }
            }

            // Injeção de Atributos de Dados (Soberania de Seletores)
            if (token.type === 'select' || token.type === 'boolean' || token.type === 'font') {
                const attrKey = `data-sx-${token.id.toLowerCase()}`;
                attributes[attrKey] = String(value);
            }
        });

        // 2. Lógica de Contraste e Inversão Inteligente (Legado Compatibilidade)
        // Mantemos apenas a lógica de decisão de cores de sistema que não são tokens puros
        const shouldInvert = (color: string) => {
            if (!color) return false;
            const c = color.toLowerCase();
            return isDark ? 
                (c === '#ffffff' || c === '#f8fafc' || c === '#fafaf9') : 
                (c === '#000000' || c === '#020617' || c === '#0f172a');
        };

        const finalBody = shouldInvert(design.bodyColor) ? (isDark ? '#020617' : '#ffffff') : (design.bodyColor || (isDark ? '#020617' : '#ffffff'));
        variables['--theme-body'] = finalBody;
        variables['--theme-bg'] = finalBody;
        
        // Sincronização de Texturas (Dependência do AtmosphereLayer)
        if (variables['--theme-primary']) {
            variables['--theme-texture-color'] = variables['--theme-primary'];
            variables['--theme-texture-color-rgb'] = variables['--theme-primary-rgb'];
        }

        return { variables, attributes };
    }, [design]);
};
