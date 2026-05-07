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

        console.log(`[useDesignVariables] Syncing ${tokens.length} tokens for mode: ${mode}`);
        
        tokens.forEach(token => {
            const value = design[token.id] ?? token.defaultValue;
            
            if (value === undefined || value === null) {
                console.warn(`[useDesignVariables] Missing value for token: ${token.id}`);
            }

            // 1. Injeção Automática (Padrão Sarak v12.1)
            const autoVar = `--sarak-${token.id}`;
            let finalValue = String(value);
            if (token.unit && typeof value === 'number') {
                finalValue = `${value}${token.unit}`;
            }
            variables[autoVar] = finalValue;

            // 2. Injeção de Variáveis CSS Específicas
            if (token.cssVars && token.cssVars.length > 0) {
                token.cssVars.forEach(v => {
                    variables[v] = finalValue;

                    if (token.generateVariants && token.type === 'color' && value && value !== 'transparent') {
                        try {
                            const variants = computeColorVariants(value, anchorColor);
                            variables[`${v}-rgb`] = variants.rgb;
                            variables[`${v}-bg`] = variants.bg;
                            variables[`${v}-border`] = variants.border;
                            variables[`${v}-hover`] = variants.hover;
                            variables[`${v}-active`] = variants.active;
                            variables[`${v}-focus`] = variants.focus;
                            variables[`${v}-light`] = variants.light;
                        } catch (e) {
                            console.error(`[useDesignVariables] Error generating variants for ${token.id}:`, e);
                        }
                    }
                });
            }

            if (token.type === 'select' || token.type === 'boolean' || token.type === 'font') {
                const attrKey = `data-sx-${token.id.toLowerCase()}`;
                attributes[attrKey] = String(value);
            }
        });

        console.log('[useDesignVariables] Audit Complete. Sample (Primary):', variables['--theme-primary']);

        // 2. Lógica de Sincronização Legada & Mapeamento Semântico (Fallback Robusto)
        const bgColor = design.bgMain || (isDark ? '#020617' : '#ffffff');
        
        variables['--theme-body'] = bgColor;
        variables['--theme-bg'] = bgColor;
        variables['--theme-bg-alt'] = design.bgSurface || (isDark ? '#0f172a' : '#f8fafc');
        variables['--theme-card'] = design.bgOverlay || (isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.8)');
        variables['--theme-surface'] = variables['--theme-card'];
        variables['--theme-border'] = design.borderSubtle || (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)');
        
        variables['--theme-title'] = design.textColorMaster || (isDark ? '#ffffff' : '#0f172a');
        variables['--theme-text-main'] = design.textColorSecondary || (isDark ? '#94a3b8' : '#334155');
        variables['--theme-muted'] = design.textColorMuted || (isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)');
        
        variables['--theme-primary'] = design.colorPrimary || '#00f2ff';
        variables['--theme-secondary'] = design.colorSecondary || '#ff00d4';
        
        variables['--radius-theme'] = `${design.cardBorderRadius || 12}px`;
        
        // Mapeamento de Escala Tipográfica (v12.5)
        const fontScaleMap: Record<string, string> = {
            'pp': '0.75',
            'p': '0.9',
            'm': '1.0',
            'g': '1.15',
            'gg': '1.3'
        };
        variables['--font-size-factor'] = fontScaleMap[design.fontScale] || '1.0';

        // Sincroniza fontes
        variables['--theme-font-title'] = design.headingFont || "'Outfit', sans-serif";
        variables['--theme-font-body'] = design.bodyFont || "'Inter', sans-serif";
        
        // Sincronização de Texturas (Dependência do AtmosphereLayer)
        const textureColor = design.textureColor || variables['--theme-primary'];
        variables['--theme-texture-color'] = textureColor;
        
        if (textureColor) {
            const textureVariants = computeColorVariants(textureColor, anchorColor);
            variables['--theme-texture-color-rgb'] = textureVariants.rgb;
        }

        // 3. Atributos de Compatibilidade Legada (v12.0 Legacy Bridge)
        // Mapeia IDs do Design Engine para atributos que o CSS legado espera
        if (design.systemTone) attributes['data-tone'] = design.systemTone;
        if (design.surfaceMaterial) attributes['data-surface'] = design.surfaceMaterial;
        if (design.borderStyle) attributes['data-border'] = design.borderStyle;
        if (design.shadowStyle) attributes['data-shadow-orientation'] = design.shadowStyle;
        if (design.shadowColorMode) attributes['data-shadow-color-mode'] = design.shadowColorMode;

        return { variables, attributes };
    }, [design]);
};
