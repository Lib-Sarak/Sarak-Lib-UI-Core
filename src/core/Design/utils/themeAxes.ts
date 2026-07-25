/**
 * Cobertura de EIXOS de um tema (Spec 40.1 — L6, aviso de omissão).
 *
 * Um tema "completo" preenche todos os eixos conceituais que o consumidor espera ver
 * mudar ao trocar de tema: cor, fonte, cromo (topbar/sidebar), raio e espaçamento. Um
 * tema que omite um eixo inteiro (o `ERP_THEMES` do v5, só cor) faz o consumidor achar
 * que "a lib não muda fonte/cromo", quando na verdade o TEMA é que não os declara.
 *
 * `findMissingThemeAxes` detecta esses buracos; `warnOnIncompleteTheme` avisa uma vez
 * (dev), sem lançar. São utilitários OPT-IN — a lib não força completude, só ajuda o
 * consumidor a não ficar silenciosamente incompleto.
 */
import type { SarakDesignState } from '../../Provider/types';

/** Eixo conceitual → tokens representativos (basta UM presente para o eixo contar). */
export const THEME_AXES: Readonly<Record<string, readonly string[]>> = {
    color: ['primaryColor', 'accentColor', 'textColorMaster', 'colorBgBody', 'surfaceColor'],
    font: ['bodyFont', 'headingFont', 'monoFont'],
    chrome: ['sidebarColor', 'topbarColor', 'sidebarWidth', 'topbarHeight'],
    radius: ['borderRadius', 'cardBorderRadius', 'btnBorderRadius'],
    spacing: ['layoutGap', 'layoutPadding', 'cardPaddingMd'],
};

const hasValue = (design: Record<string, unknown>, key: string): boolean =>
    design[key] !== undefined && design[key] !== null && design[key] !== '';

/** Eixos que o tema NÃO declara (nenhum token representativo presente). Vazio = completo. */
export const findMissingThemeAxes = (design: SarakDesignState | Record<string, unknown>): string[] => {
    const record = (design ?? {}) as Record<string, unknown>;
    return Object.entries(THEME_AXES)
        .filter(([, tokens]) => !tokens.some((token) => hasValue(record, token)))
        .map(([axis]) => axis);
};

/**
 * Avisa (uma vez, `console.warn`) se o tema omite eixos inteiros. Não lança — apenas
 * sinaliza ao dev. Chame ao aplicar um tema custom para não ficar incompleto em silêncio.
 */
export const warnOnIncompleteTheme = (design: SarakDesignState | Record<string, unknown>, label = 'tema'): string[] => {
    const missing = findMissingThemeAxes(design);
    if (missing.length > 0) {
        console.warn(
            `[Sarak:Design] O ${label} omite o(s) eixo(s): ${missing.join(', ')}. ` +
                `Ao trocar de tema, esse(s) eixo(s) NÃO mudarão. Parta de SARAK_REFERENCE_THEMES ` +
                `(ou exporte um tema completo pelo CustomizationPanel) para manter todos os eixos.`,
        );
    }
    return missing;
};
