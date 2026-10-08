import type { CSSProperties } from 'react';
import type { ChromeContentAlignment, ChromeLayoutDensity, ChromeNavbarLayout, ChromeSidebarPosition } from './useChromeDesignTokens';

/**
 * Converte os tokens estruturais de cromo em classes para `SarakAppChrome`.
 * A direção do flex governa a linha sidebar e conteúdo; banner e footer
 * continuam empilhados em coluna pelo `ChromeFrame`.
 */

const BODY_DIRECTION_CLASS: Record<ChromeSidebarPosition, string> = {
    left: 'flex-row',
    right: 'flex-row-reverse',
    floating: 'flex-row',
};

// `floating` não usa posicionamento absoluto (diferente do Shell): o objetivo é o
// mesmo cromo apresentacional, só com a sidebar destacada do restante — margem e
// borda em vez do `border-r` colado na borda do conteúdo. A sombra vem do token
// `sidebarShadow` (Spec 05 §2.4), aplicado por `ChromeSidebarBody` nas três
// posições — não hardcoded aqui.
const ASIDE_POSITION_CLASS: Record<ChromeSidebarPosition, string> = {
    left: 'border-r',
    right: 'border-l',
    floating: 'border rounded-[var(--sarak-card-radius,12px)] m-3',
};

const NAVBAR_LAYOUT_CLASS: Record<ChromeNavbarLayout, string> = {
    sticky: 'sticky top-0',
    inline: 'relative',
    hidden: 'hidden',
};

// `@min-[…]:` literais de propósito (07-responsividade-e-multidispositivo.md
// §6.1 regra 2) — o scanner do Tailwind lê o arquivo como texto.
const CONTENT_ALIGNMENT_CLASS: Record<ChromeContentAlignment, string> = {
    stretch: '',
    center: 'max-w-7xl mx-auto w-full px-4 @min-[640px]:px-6 @min-[1024px]:px-8',
};

const CONTENT_DENSITY_SCALE: Record<ChromeLayoutDensity, string> = {
    compact: '0.75',
    comfortable: '1',
    spacious: '1.25',
};

const CONTENT_PADDING_CSS_VALUE = 'var(--sarak-layout-padding, 16px)';

export const CHROME_SPLIT_CONTENT_LAYOUT_CLASS = 'grid min-h-full min-w-0 grid-cols-1 @min-[1024px]:grid-cols-2';

export const resolveChromeBodyDirectionClass = (position: ChromeSidebarPosition): string =>
    BODY_DIRECTION_CLASS[position] ?? BODY_DIRECTION_CLASS.left;

export const resolveChromeAsidePositionClass = (position: ChromeSidebarPosition): string =>
    ASIDE_POSITION_CLASS[position] ?? ASIDE_POSITION_CLASS.left;

export const resolveChromeNavbarLayoutClass = (layout: ChromeNavbarLayout): string =>
    NAVBAR_LAYOUT_CLASS[layout] ?? NAVBAR_LAYOUT_CLASS.sticky;

export const resolveChromeContentAlignmentClass = (alignment: ChromeContentAlignment): string =>
    CONTENT_ALIGNMENT_CLASS[alignment] ?? CONTENT_ALIGNMENT_CLASS.stretch;

export const resolveChromeContentStyle = (
    layoutDensity: ChromeLayoutDensity,
    maxContentWidth: string,
): CSSProperties => ({
    width: '100%',
    maxWidth: maxContentWidth,
    marginInline: 'auto',
    padding: layoutDensity === 'comfortable'
        ? CONTENT_PADDING_CSS_VALUE
        : `calc(${CONTENT_PADDING_CSS_VALUE} * ${CONTENT_DENSITY_SCALE[layoutDensity]})`,
});
