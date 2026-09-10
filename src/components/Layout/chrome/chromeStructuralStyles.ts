import type { ChromeContentAlignment, ChromeNavbarLayout, ChromeSidebarPosition } from './useChromeDesignTokens';

/**
 * Tradução de tokens ESTRUTURAIS de cromo (`sidebarPosition`, `navbarLayout`,
 * `contentAlignment`) em classes, para o cromo do modo ui-kit.
 *
 * Comportamento de REFERÊNCIA: `src/core/Shell/hooks/useShellLayoutStyles.ts`
 * (não importado — `src/core/Shell/` não é tocado por esta plan, §3.2). Os
 * mapas abaixo são o equivalente para a estrutura do `SarakAppChrome`, que
 * difere da do Shell (aqui a direção do flex vale só para a linha
 * sidebar+conteúdo, não para a casca inteira — banner/footer do `ChromeFrame`
 * continuam empilhados em coluna nos dois sentidos).
 */

const BODY_DIRECTION_CLASS: Record<ChromeSidebarPosition, string> = {
    left: 'flex-row',
    right: 'flex-row-reverse',
    floating: 'flex-row',
};

// `floating` não usa posicionamento absoluto (diferente do Shell): o objetivo é o
// mesmo cromo apresentacional, só com a sidebar destacada do restante — margem,
// borda e sombra em vez do `border-r` colado na borda do conteúdo.
const ASIDE_POSITION_CLASS: Record<ChromeSidebarPosition, string> = {
    left: 'border-r',
    right: 'border-l',
    floating: 'border rounded-[var(--sarak-card-radius,12px)] shadow-2xl m-3',
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

export const resolveChromeBodyDirectionClass = (position: ChromeSidebarPosition): string =>
    BODY_DIRECTION_CLASS[position] ?? BODY_DIRECTION_CLASS.left;

export const resolveChromeAsidePositionClass = (position: ChromeSidebarPosition): string =>
    ASIDE_POSITION_CLASS[position] ?? ASIDE_POSITION_CLASS.left;

export const resolveChromeNavbarLayoutClass = (layout: ChromeNavbarLayout): string =>
    NAVBAR_LAYOUT_CLASS[layout] ?? NAVBAR_LAYOUT_CLASS.sticky;

export const resolveChromeContentAlignmentClass = (alignment: ChromeContentAlignment): string =>
    CONTENT_ALIGNMENT_CLASS[alignment] ?? CONTENT_ALIGNMENT_CLASS.stretch;
