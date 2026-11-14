import type { NavigationItemDensity } from '../../../core/Provider/useNavigationAppearance';

/**
 * A métrica da linha do menu vertical por densidade (`sidebarItemDensity`): recuo, vão entre ícone e rótulo e respiro
 * vertical, nas classes que o `SarakMenuItem` aplica. É a fonte única: a busca da barra lateral e o recuo da sub-aba leem
 * os passos destas mesmas classes, então nada se separa do item quando a densidade muda.
 */
export const VERTICAL_MENU_ITEM_CLASSES: Readonly<Record<NavigationItemDensity, string>> = {
    compact: 'gap-2 px-2 py-1.5',
    comfortable: 'gap-3 px-3 py-2.5',
    spacious: 'gap-4 px-4 py-3',
};

/** O texto da linha de menu (14 px numa linha de 20 px). */
export const MENU_ITEM_TEXT_CLASS = 'text-sm';
// sarak-allow-hardcode: o tamanho e a linha da classe `text-sm` acima, que nenhum token declara.
const MENU_ITEM_TEXT = { fontSize: '0.875rem', lineHeight: '1.25rem' } as const;
export const MENU_ITEM_FONT_SIZE = MENU_ITEM_TEXT.fontSize;
export const MENU_ITEM_LINE_HEIGHT = MENU_ITEM_TEXT.lineHeight;

// sarak-allow-hardcode: o passo da escala de espaçamento das classes utilitárias (`py-1` = 0,25 rem).
const SPACING_STEP_REM = 0.25;

/** O ícone do item vertical (`sidebarIconSize`). */
export const VERTICAL_MENU_ICON_SIZE = 'var(--sarak-sidebar-icon-size, 18px)';

export const resolveVerticalMenuItemClasses = (density: NavigationItemDensity): string =>
    VERTICAL_MENU_ITEM_CLASSES[density] ?? VERTICAL_MENU_ITEM_CLASSES.comfortable;

/** A medida de uma utilidade de espaçamento (`py`, `px`, `gap`) das classes da densidade, em rem. */
export const verticalMenuItemSpacing = (density: NavigationItemDensity, utility: 'gap' | 'px' | 'py'): string => {
    const match = resolveVerticalMenuItemClasses(density).match(new RegExp(`(?:^|\\s)${utility}-([0-9.]+)(?:\\s|$)`));
    return `${Number(match?.[1] ?? 0) * SPACING_STEP_REM}rem`;
};

/** A altura da linha: a maior entre o ícone e a linha do rótulo, mais o respiro da densidade nos dois lados. */
export const verticalMenuItemHeight = (density: NavigationItemDensity): string =>
    `calc(max(${VERTICAL_MENU_ICON_SIZE}, ${MENU_ITEM_LINE_HEIGHT}) + ${verticalMenuItemSpacing(density, 'py')} * 2)`;

/** O recuo da sub-aba dentro de um grupo aberto: o ícone dela fica sob o rótulo do pai (recuo do item, ícone e vão). */
export const nestedMenuItemIndent = (density: NavigationItemDensity): string =>
    `calc(${verticalMenuItemSpacing(density, 'px')} + ${VERTICAL_MENU_ICON_SIZE} + ${verticalMenuItemSpacing(density, 'gap')})`;

/**
 * Recuo e vão da lista vertical: o espaçamento do layout, com teto proporcional à largura da barra (16 px e 8 px numa
 * barra de 240). O espaçamento de PÁGINA é do conteúdo: num tema de respiro largo ele espremia os itens no meio da barra.
 */
export const VERTICAL_NAV_PADDING = 'min(var(--sarak-layout-gap-md, 16px), calc(var(--sarak-sidebar-width, 240px) / 15))';
export const VERTICAL_NAV_GAP = 'min(var(--sarak-layout-gap-sm, 8px), calc(var(--sarak-sidebar-width, 240px) / 30))';
/** O vão entre duas seções da lista: o vão da lista mais o respiro acima do título da seção. */
export const VERTICAL_NAV_SECTION_GAP = `calc(${VERTICAL_NAV_GAP} * 2)`;
