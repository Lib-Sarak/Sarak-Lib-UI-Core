import { useMemo } from 'react';
import { getAllDesignTokens } from '../master-map';
import { computeColorVariants } from '../../../core/Provider/utils/color-engine';

/**
 * Hook Universal de Tradução de Design (v11.1)
 * 
 * Transforma um objeto de estado de design (draft ou master) 
 * em um conjunto de variáveis CSS e atributos baseados no MASTER_DESIGN_MAP.
 */
export const useDesignVariables = (design: any) => {
    return useMemo(() => {
        if (!design) return {};

        const variables: Record<string, string> = {};
        const attributes: Record<string, string> = {};
        const tokens = getAllDesignTokens();

        // 1. Processamento de Tokens do Mapa Mestre
        tokens.forEach(token => {
            const value = design[token.id] ?? token.defaultValue;
            
            // Injeção de Variáveis CSS
            if (token.cssVars) {
                let finalValue = String(value);
                if (token.unit && typeof value === 'number') {
                    finalValue = `${value}${token.unit}`;
                }

                token.cssVars.forEach(v => {
                    variables[v] = finalValue;
                });
            }

            // Injeção de Atributos de Dados (para seletores CSS complexos)
            if (token.type === 'select' || token.type === 'boolean') {
                attributes[`data-sx-${token.id}`] = String(value);
            }
        });

        // 2. Motor de Cores Semânticas (Computação de Variantes)
        const mode = design.mode || 'dark';
        const anchorColor = mode === 'dark' ? '#000000' : '#ffffff';

        const colorSlots = [
            { id: 'primary', key: 'primaryColor' },
            { id: 'secondary', key: 'secondaryColor' },
            { id: 'success', key: 'successColor' },
            { id: 'warning', key: 'warningColor' },
            { id: 'error', key: 'errorColor' },
            { id: 'sidebar', key: 'sidebarColor' },
            { id: 'topbar', key: 'topbarColor' },
            { id: 'card', key: 'cardBackgroundColor' }
        ];

        colorSlots.forEach(slot => {
            const baseColor = design[slot.key];
            if (baseColor && baseColor !== 'transparent') {
                const variants = computeColorVariants(baseColor, anchorColor);
                const prefix = `--theme-${slot}`;
                
                variables[prefix] = variants.main;
                variables[`${prefix}-rgb`] = variants.rgb;
                variables[`${prefix}-bg`] = variants.bg;
                variables[`${prefix}-border`] = variants.border;
                variables[`${prefix}-hover`] = variants.hover;
                variables[`${prefix}-active`] = variants.active;
            }
        });

        // 3. Efeitos Específicos (Glassmorphism & Blur)
        variables['--glass-opacity'] = String(design.glassOpacity ?? 0.4);
        variables['--glass-blur'] = `${design.glassBlur ?? 10}px`;

        return { variables, attributes };
    }, [design]);
};
