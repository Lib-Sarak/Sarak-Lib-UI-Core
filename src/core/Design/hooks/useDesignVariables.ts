import { useMemo } from 'react';
import { getAllDesignTokens } from '../master-map';
import { BREAKPOINT_TABLET, BREAKPOINT_DESKTOP } from '../breakpoints';
import { computeColorVariants, parseToRgba, rgbToHsl } from '../../../core/Provider/utils/color-engine';
import type { SarakTokenValue } from '../types';

/**
 * Helper para converter camelCase para kebab-case (ex: cardBorderRadius -> card-border-radius)
 */
const toKebabCase = (str: string) =>
    str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);

/**
 * Segunda barreira contra breakout de CSS/HTML (a primeira é `validateDesign`,
 * que já deveria ter descartado qualquer valor com estes caracteres antes de
 * chegar aqui). `responsiveCSS` é interpolado cru dentro de um `<style>`
 * (`styleTag.innerHTML` no Modo App; `dangerouslySetInnerHTML` no Embarcado) —
 * Spec 44 §2.3 exige que NENHUM valor de tema chegue lá sem sanitização, mesmo
 * que uma chamada direta de `applyConfig`/`setDesign` pule `validateDesign`.
 */
const isCssSafeValue = (value: string): boolean => !/[<>{};]/.test(value);

/**
 * Hook Universal de Tradução de Design (v12.9 - Reactive Sync)
 * 
 * Este é o "Coração" da sincronização. Ele garante que qualquer token definido 
 * nos 17 schemas seja traduzido para o padrão CSS que o sistema espera.
 * Agora com suporte reativo à inversão dinâmica de cores (Sincronização de Modo).
 */
export const useDesignVariables = (
    rawDesign: Record<string, unknown> | null | undefined,
    scopeSelector: string = ':root',
) => {
    return useMemo(() => {
        if (!rawDesign) return { variables: {}, attributes: {}, responsiveCSS: '' };

        // 0. MODO (LIGHT/DARK) — Decisão D (plan-24-1 §2.8): no modo NATIVO, emitido
        // = escrito. Este hook NÃO chama mais `syncThemeWithMode` — ela só roda no
        // ÚNICO lugar que expressa de verdade a intenção "quero este tema no OUTRO
        // modo": `ShellThemeToggle`. Rodá-la aqui, sem condição, reescrevia o valor
        // do autor a cada render (medido: 1299/1316 valores alterados, 178/648
        // veredictos de contraste divergentes entre o escrito e o emitido).
        const targetMode = (rawDesign.mode as 'light' | 'dark') || 'dark';
        const design = rawDesign as Record<string, SarakTokenValue>;

        const variables: Record<string, string> = {};
        const attributes: Record<string, string> = {};
        let responsiveCssRoot = '';
        let responsiveCssTab = '';
        let responsiveCssDesk = '';
        const tokens = getAllDesignTokens();
        
        const isDark = targetMode === 'dark';
        const anchorColor = isDark ? '#000000' : '#ffffff';

        // Breakpoints como dado (Spec 16, Regra 1): lê os tokens do tema (se o
        // tema os declarar) com fallback à fonte única; `@media` não aceita
        // `var(--...)`, então o valor numérico é interpolado aqui na geração.
        const bpTablet = typeof design.breakpointTablet === 'number' ? design.breakpointTablet : BREAKPOINT_TABLET;
        const bpDesktop = typeof design.breakpointDesktop === 'number' ? design.breakpointDesktop : BREAKPOINT_DESKTOP;

        // 1. PROCESSAMENTO ATÔMICO (Do Token para a Variável)
        tokens.forEach(token => {
            const value = design[token.id] ?? token.defaultValue;
            const kebabId = toKebabCase(token.id);
            const autoVar = `--sarak-${kebabId}`;
            
            const isResponsiveValue = value && typeof value === 'object' && 'mob' in value;

            let finalValue = '';

            if (isResponsiveValue) {
                // FALLBACK: Gerador Responsivo Inteligente
                const parseUnit = (v: unknown) => {
                    const raw = token.unit && typeof v === 'number' ? `${v}${token.unit}` : String(v);
                    if (isCssSafeValue(raw)) return raw;
                    console.warn(`[Sarak:Design] Valor responsivo inseguro para "${token.id}" — descartado.`, v);
                    return typeof token.defaultValue === 'number' ? String(token.defaultValue) : '0';
                };
                const mobVal = parseUnit(value.mob);
                const tabVal = parseUnit(value.tab);
                const deskVal = parseUnit(value.desk);

                responsiveCssRoot += `  ${autoVar}: ${mobVal};\n`;
                responsiveCssTab += `  ${autoVar}: ${tabVal};\n`;
                responsiveCssDesk += `  ${autoVar}: ${deskVal};\n`;

                if (token.cssVars && token.cssVars.length > 0) {
                    token.cssVars.forEach(v => {
                        responsiveCssRoot += `  ${v}: ${mobVal};\n`;
                        responsiveCssTab += `  ${v}: ${tabVal};\n`;
                        responsiveCssDesk += `  ${v}: ${deskVal};\n`;
                    });
                }
                // CRÍTICO: Não injetamos o valor 'deskVal' no objeto JS `variables`.
                // Se injetarmos, o DesignScope aplicará como estilo inline, o que tem
                // especificidade maior que as nossas media queries e classes (.sarak-device-*),
                // quebrando totalmente a responsividade e travando no modo desktop.
                // A responsabilidade de prover as variáveis fica 100% com o responsiveCSS injetado na tag <style>.

            } else {
                // COMPORTAMENTO ORIGINAL (Valores Primitivos / Cores)
                finalValue = String(value);
                if (token.unit && typeof value === 'number') {
                    finalValue = `${value}${token.unit}`;
                }
                if (!isCssSafeValue(finalValue)) {
                    console.warn(`[Sarak:Design] Valor inseguro para "${token.id}" — descartado.`, value);
                    finalValue = String(token.defaultValue ?? '');
                }
                variables[autoVar] = finalValue;

                // Injeção de Variáveis Extras definidas no Schema
                if (token.cssVars && token.cssVars.length > 0) {
                    token.cssVars.forEach(v => {
                        variables[v] = finalValue;

                        // Gerador de Variantes Cromáticas (RGB, Hover, Active, Light)
                        if (token.generateVariants && token.type === 'color' && value && value !== 'transparent') {
                            try {
                                const variants = computeColorVariants(String(value), anchorColor);
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
                                Number(value) > 0 && console.error(`[AtomicSync] Error for ${token.id}:`, e);
                            }
                        }
                    });
                }
            }

            // Injeção de Atributos de Estado (data-sx-*)
            if (token.type === 'select' || token.type === 'boolean' || token.type === 'font') {
                attributes[`data-sx-${kebabId}`] = isResponsiveValue ? String(value.desk) : String(value);
            }
        });

        // 2. CÁLCULOS DERIVADOS (Geometria Dinâmica)
        const aliasPairs: Array<[string, string | undefined]> = [
            ['--text-main', variables['--sarak-text-main'] || variables['--theme-text-primary']],
            ['--text-muted', variables['--sarak-text-muted'] || variables['--theme-text-muted']],
            ['--text-secondary', variables['--sarak-text-sec']],
            ['--bg-body', variables['--sarak-bg-body'] || variables['--theme-body']],
            ['--color-theme-card', variables['--sarak-card-bg'] || variables['--theme-card']],
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

        variables['--color-theme-title'] = variables['--text-main'] || (isDark ? '#ffffff' : '#0f172a');
        variables['--theme-on-primary'] = primaryLightness > 55 ? '#020617' : '#ffffff';
        variables['--sarak-vignette-color'] = isDark
            ? `rgba(0, 0, 0, ${design.vignetteOpacity ?? 0.3})`
            : 'rgba(0, 0, 0, 0)';
        variables['--sarak-vignette-blend-mode'] = isDark ? 'multiply' : 'normal';

        if (design.cardGeometricCut && Number(design.cardGeometricCut) > 0) {
            const cut = design.cardGeometricCut;
            variables['--sarak-card-clip-path'] = `polygon(${cut}px 0%, calc(100% - ${cut}px) 0%, 100% ${cut}px, 100% calc(100% - ${cut}px), calc(100% - ${cut}px) 100%, ${cut}px 100%, 0% calc(100% - ${cut}px), 0% ${cut}px)`;
        } else {
            variables['--sarak-card-clip-path'] = 'none';
        }

        const responsiveCSS = `
${scopeSelector} {
${responsiveCssRoot}
}
@media (min-width: ${bpTablet}px) {
  ${scopeSelector} {
${responsiveCssTab}
  }
}
@media (min-width: ${bpDesktop}px) {
  ${scopeSelector} {
${responsiveCssDesk}
  }
}

/* Escopos explícitos para o Gêmeo Digital (Twin Mode) */
${scopeSelector}.sarak-device-smartphone, ${scopeSelector} .sarak-device-smartphone {
${responsiveCssRoot}
}
${scopeSelector}.sarak-device-tablet, ${scopeSelector} .sarak-device-tablet {
${responsiveCssTab}
}
${scopeSelector}.sarak-device-desktop, ${scopeSelector} .sarak-device-desktop {
${responsiveCssDesk}
}
`.trim();

        return { variables, attributes, responsiveCSS };
    }, [rawDesign, scopeSelector]);
};
