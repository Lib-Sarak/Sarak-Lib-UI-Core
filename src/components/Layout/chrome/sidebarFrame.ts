import type { CSSProperties } from 'react';
import type { ChromeSidebarPosition } from './useChromeDesignTokens';
import type { ChromeBorderSide } from '../../../core/Provider/useNavigationAppearance';

/**
 * Margem da lateral (`tabSectionMargin`) convertida em "a barra está destacada da borda da tela?": `min(valor, margem *
 * fator)` vale o próprio valor com qualquer margem de 1 px ou mais e zero com margem zero. É o que deixa o canto e a
 * linha do lado colado na tela retos sem o cromo ler a margem resolvida por breakpoint.
 */
const DETACHED_FACTOR = 1000;
const MARGIN = 'var(--sarak-tab-section-margin, 8px)';
const whenDetached = (value: string): string => `min(${value}, calc(${MARGIN} * ${DETACHED_FACTOR}))`;

/**
 * A moldura de cartão da lateral: o raio do tema (`borderRadius`, o raio de referência dos componentes sem raio
 * próprio) e, com a borda `edge`, a linha nos quatro lados. Encostada na tela (margem zero), o raio e as linhas dos lados
 * colados somem e fica só a linha do lado do conteúdo. A flutuante já tem moldura própria e não muda.
 */
export const resolveSidebarFrameStyle = (
    position: ChromeSidebarPosition,
    side: ChromeBorderSide,
    border: CSSProperties,
): CSSProperties => {
    if (position === 'floating') return border;
    const radius = whenDetached('var(--sarak-border-radius, 12px)');
    if (side !== 'edge') return { ...border, borderRadius: radius };
    const width = 'var(--sarak-sidebar-border-width, 1px)';
    const contentSide = position === 'right' ? 'borderLeftWidth' : 'borderRightWidth';
    return {
        ...border,
        borderRadius: radius,
        borderTopWidth: whenDetached(width),
        borderRightWidth: whenDetached(width),
        borderBottomWidth: whenDetached(width),
        borderLeftWidth: whenDetached(width),
        [contentSide]: width,
    };
};
