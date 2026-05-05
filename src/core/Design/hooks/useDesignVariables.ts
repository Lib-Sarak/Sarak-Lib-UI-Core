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
            // Forçamos lowercase nas chaves para evitar avisos do React (data-sx-performancemode)
            if (token.type === 'select' || token.type === 'boolean') {
                const attrKey = `data-sx-${token.id.toLowerCase()}`;
                attributes[attrKey] = String(value);
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
                const prefix = `--theme-${slot.id}`;
                
                variables[prefix] = variants.main;
                variables[`${prefix}-rgb`] = variants.rgb;
                variables[`${prefix}-bg`] = variants.bg;
                variables[`${prefix}-border`] = variants.border;
                variables[`${prefix}-hover`] = variants.hover;
                variables[`${prefix}-active`] = variants.active;
            }
        });

        // 3. Fallbacks e Adaptação Bimodal Inteligente (v12.2)
        const isDark = mode === 'dark';
        
        // Função utilitária para decidir se uma cor deve ser invertida
        const shouldInvert = (color: string) => {
            if (!color) return false;
            const c = color.toLowerCase();
            if (isDark) {
                return c === '#ffffff' || c === '#f8fafc' || c === '#fafaf9' || c === '#f1f5f9';
            } else {
                return c === '#000000' || c === '#020617' || c === '#0f172a' || c === '#1c1917';
            }
        };

        let finalBody = design.bodyColor;
        let finalCard = design.cardBackgroundColor;
        let finalTitle = design.titleColor;

        // Inversão Inteligente de Fundo e Cards
        if (shouldInvert(finalBody)) {
            finalBody = isDark ? '#020617' : '#ffffff';
        }
        if (shouldInvert(finalCard)) {
            finalCard = isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.8)';
        }

        // Títulos: Garantir contraste
        if (isDark && (!finalTitle || finalTitle === '#0f172a' || finalTitle === '#000000')) finalTitle = '#f8fafc';
        if (!isDark && (!finalTitle || finalTitle === '#f8fafc' || finalTitle === '#ffffff')) finalTitle = '#0f172a';

        variables['--theme-body'] = finalBody || (isDark ? '#020617' : '#ffffff');
        variables['--theme-bg'] = variables['--theme-body'];
        variables['--theme-card-bg'] = finalCard || (isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.8)');
        variables['--theme-title'] = finalTitle || (isDark ? '#f8fafc' : '#0f172a');
        variables['--theme-text'] = isDark ? '#94a3b8' : '#475569';
        variables['--theme-muted'] = isDark ? '#64748b' : '#94a3b8';
        variables['--theme-border'] = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
        
        // 4. Lógica Derivada para Componentes Especializados
        // Mapeamento de Densidade de Auth
        const authDensity = design.authDensity || 'standard';
        const authGapMap: Record<string, string> = { 
            compact: '1rem', 
            standard: '2rem', 
            spacious: '4rem' 
        };
        variables['--sarak-auth-gap'] = authGapMap[authDensity] || '2rem';

        // Mapeamento de Variante Social
        variables['--sarak-social-variant'] = design.socialButtonStyle || 'glass';

        // 5. Efeitos Específicos (Glassmorphism & Blur)
        variables['--glass-opacity'] = String(design.glassOpacity ?? 0.4);
        variables['--glass-blur'] = `${design.glassBlur ?? 10}px`;
        variables['--theme-texture-opacity'] = String(design.textureOpacity ?? 0.08);
        // Alinha --texture-opacity (usado pelo .SarakAtmosphereLayer no CSS) com o valor do tema
        variables['--texture-opacity'] = String(design.textureOpacity ?? 0.08);
        // Propaga a cor primária como cor de textura para que todos os padrões CSS funcionem
        // sem depender de --theme-texture-color-rgb indefinido no escopo
        if (variables['--theme-primary']) {
            variables['--theme-texture-color'] = variables['--theme-primary'];
        }
        if (variables['--theme-primary-rgb']) {
            variables['--theme-texture-color-rgb'] = variables['--theme-primary-rgb'];
        }

        return { variables, attributes };
    }, [design]);
};
