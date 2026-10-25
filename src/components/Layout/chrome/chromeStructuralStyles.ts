import type { CSSProperties } from 'react';
import type { ChromeLayoutDensity, ChromeNavbarLayout, ChromeSidebarPosition } from './useChromeDesignTokens';
import type { ChromeBackgroundStyle, ChromeBorderSide, ChromeBorderStyle } from '../../../core/Provider/useNavigationAppearance';

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
    left: '',
    right: '',
    floating: 'rounded-[var(--sarak-card-radius,10px)] m-3',
};

const NAVBAR_LAYOUT_CLASS: Record<ChromeNavbarLayout, string> = {
    sticky: 'sticky top-0',
    inline: 'relative',
    hidden: 'hidden',
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

interface ChromeBorderOptions {
    side: ChromeBorderSide;
    style: ChromeBorderStyle;
    widthVariable: string;
    colorVariable: string;
    surface: 'sidebar' | 'topbar' | 'bottom-nav';
    sidebarPosition?: ChromeSidebarPosition;
}

const getChromeBorderSides = ({ side, surface, sidebarPosition }: ChromeBorderOptions): Set<string> => {
    if (side === 'none' || (side === 'edge' && surface === 'sidebar' && sidebarPosition === 'floating')) {
        return side === 'none' ? new Set() : new Set(['top', 'right', 'bottom', 'left']);
    }
    if (side === 'all') return new Set(['top', 'right', 'bottom', 'left']);
    if (side !== 'edge') return new Set([side]);
    if (surface === 'bottom-nav') return new Set(['top']);
    if (surface === 'topbar') return new Set(['bottom']);
    return new Set([sidebarPosition === 'right' ? 'left' : 'right']);
};

export const resolveChromeSurfaceBorderStyle = (options: ChromeBorderOptions): CSSProperties => {
    const sides = getChromeBorderSides(options);
    const width = `var(${options.widthVariable}, 1px)`;
    const inactiveWidth = '0px';
    return {
        borderTopWidth: sides.has('top') ? width : inactiveWidth,
        borderRightWidth: sides.has('right') ? width : inactiveWidth,
        borderBottomWidth: sides.has('bottom') ? width : inactiveWidth,
        borderLeftWidth: sides.has('left') ? width : inactiveWidth,
        borderStyle: options.style,
        borderColor: `var(${options.colorVariable}, var(--border-color, var(--theme-border, rgba(255,255,255,0.09))))`,
    };
};

export const resolveChromeBackground = (
    style: ChromeBackgroundStyle,
    backgroundVariable: string,
    fallback: string,
): string => {
    const background = `var(${backgroundVariable}, ${fallback})`;
    if (style !== 'gradient') return background;
    return `linear-gradient(135deg, ${background}, color-mix(in srgb, ${background} 84%, white))`;
};

export const resolveChromeNavbarLayoutClass = (layout: ChromeNavbarLayout): string =>
    NAVBAR_LAYOUT_CLASS[layout] ?? NAVBAR_LAYOUT_CLASS.sticky;

// @sarak-token-reader maxContentWidth direto
// O leitor converte a opção semântica em CSS antes de chegar a `max-width`.
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
