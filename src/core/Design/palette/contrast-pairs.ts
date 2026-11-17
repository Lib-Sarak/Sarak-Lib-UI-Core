/** O texto de comparação: o par passa a exigir ao menos o contraste que este texto tem sobre o fundo dele. */
export interface ContrastBeat {
    fg: string;
    bgChain: readonly string[];
}

export interface ContrastPair {
    fg: string;
    bgChain: readonly string[];
    min: number;
    /** Além de `min`, o contraste do texto não pode ficar abaixo do deste outro texto (o item ativo contra o inativo). */
    beat?: ContrastBeat;
}

/**
 * Elemento de cadeia de fundo que não é token: a luz que o degradê da barra soma no fim (a cor da barra com 16% de branco,
 * `resolveChromeBackground`). Em `bgChain`, `GRADIENT_LIGHT_ID@0.16` compõe branco a 16% sobre o fundo seguinte.
 */
export const GRADIENT_LIGHT_ID = 'gradientLight';
export const GRADIENT_LIGHT_SHARE = 0.16;
export const GRADIENT_LIGHT_COLOR = '#ffffff';

/** The component contrast contract shared by the runtime palette and its audit gate. */
export const PAIRS: readonly ContrastPair[] = [
    { fg: 'textColorMaster', bgChain: ['colorBgBody'], min: 4.5 },
    { fg: 'textColorMaster', bgChain: ['colorBgLayer1'], min: 4.5 },
    { fg: 'textColorMaster', bgChain: ['colorBgLayer2'], min: 4.5 },
    { fg: 'textColorMaster', bgChain: ['cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    { fg: 'textColorMaster', bgChain: ['colorBgModal', 'colorBgBody'], min: 4.5 },
    { fg: 'textColorMaster', bgChain: ['sidebarColor', 'colorBgBody'], min: 4.5 },
    { fg: 'textColorMaster', bgChain: ['topbarColor', 'colorBgBody'], min: 4.5 },
    { fg: 'textColorSecondary', bgChain: ['colorBgBody'], min: 4.5 },
    { fg: 'textColorSecondary', bgChain: ['cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    { fg: 'textColorSecondary', bgChain: ['colorBgModal', 'colorBgBody'], min: 4.5 },
    { fg: 'textColorSecondary', bgChain: ['colorBgLayer1', 'colorBgBody'], min: 4.5 },
    { fg: 'textColorSecondary', bgChain: ['colorBgLayer2', 'colorBgBody'], min: 4.5 },
    { fg: 'textColorSecondary', bgChain: ['sidebarColor', 'colorBgBody'], min: 4.5 },
    { fg: 'textColorSecondary', bgChain: ['topbarColor', 'colorBgBody'], min: 4.5 },
    { fg: 'textColorMuted', bgChain: ['colorBgBody'], min: 4.5 },
    { fg: 'textColorMuted', bgChain: ['cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    { fg: 'textColorMuted', bgChain: ['colorBgModal', 'colorBgBody'], min: 4.5 },
    { fg: 'textColorMuted', bgChain: ['colorBgLayer1', 'colorBgBody'], min: 4.5 },
    { fg: 'textColorMuted', bgChain: ['colorBgLayer2', 'colorBgBody'], min: 4.5 },
    { fg: 'textColorMuted', bgChain: ['sidebarColor', 'colorBgBody'], min: 4.5 },
    { fg: 'textColorMuted', bgChain: ['topbarColor', 'colorBgBody'], min: 4.5 },
    { fg: 'titleColor', bgChain: ['colorBgBody'], min: 4.5 },
    { fg: 'titleColor', bgChain: ['surfaceColor', 'colorBgBody'], min: 4.5 },
    { fg: 'titleColor', bgChain: ['tableHeaderBg', 'cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    { fg: 'titleColor', bgChain: ['cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    { fg: 'titleColor', bgChain: ['colorBgModal', 'colorBgBody'], min: 4.5 },
    { fg: 'subtitleColor', bgChain: ['colorBgBody'], min: 4.5 },
    { fg: 'subtitleColor', bgChain: ['surfaceColor', 'colorBgBody'], min: 4.5 },
    { fg: 'subtitleColor', bgChain: ['cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    { fg: 'emphasisColor', bgChain: ['colorBgBody'], min: 4.5 },
    { fg: 'emphasisColor', bgChain: ['surfaceColor', 'colorBgBody'], min: 4.5 },
    { fg: 'emphasisColor', bgChain: ['cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    { fg: 'cardTitleColor', bgChain: ['cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    { fg: 'cardActionBtnText', bgChain: ['cardActionBtnPrimaryBg', 'cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    { fg: 'cardActionBtnText', bgChain: ['cardActionBtnHoverBg', 'cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    { fg: 'cardSearchTextFocusColor', bgChain: ['cardSearchBgFocus', 'cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    { fg: 'btnPrimaryText', bgChain: ['btnPrimaryBg', 'colorBgBody'], min: 4.5 },
    { fg: 'inputTextColor', bgChain: ['inputBg', 'colorBgBody'], min: 4.5 },
    { fg: 'inputIconColor', bgChain: ['inputBg', 'colorBgBody'], min: 4.5 },
    { fg: 'topbarTitleColor', bgChain: ['topbarColor', 'colorBgBody'], min: 4.5 },
    { fg: 'sidebarItemTextColor', bgChain: ['sidebarColor', 'colorBgBody'], min: 4.5 },
    { fg: 'sidebarIconColor', bgChain: ['sidebarColor', 'colorBgBody'], min: 4.5 },
    { fg: 'sidebarItemHoverTextColor', bgChain: ['sidebarHoverColor', 'sidebarColor', 'colorBgBody'], min: 4.5 },
    { fg: 'sidebarCategoryColor', bgChain: ['sidebarColor', 'colorBgBody'], min: 4.5 },
    { fg: 'sidebarBrandColor', bgChain: ['sidebarBrandBackground', 'sidebarColor', 'colorBgBody'], min: 4.5 },
    { fg: 'topbarItemTextColor', bgChain: ['topbarColor', 'colorBgBody'], min: 4.5 },
    { fg: 'topbarItemHoverTextColor', bgChain: ['topbarHoverColor', 'topbarColor', 'colorBgBody'], min: 4.5 },
    { fg: 'topbarBrandColor', bgChain: ['topbarBrandBackground', 'topbarColor', 'colorBgBody'], min: 4.5 },
    { fg: 'tooltipTextColor', bgChain: ['tooltipBg', 'colorBgBody'], min: 4.5 },
    // Na barra lateral o item inativo é apagado de propósito; o ativo é o texto mais legível da lista e nunca fica abaixo dele, mesmo
    // quando a base da paleta é escura. A topbar não apaga o inativo (texto do corpo), então só vale o piso.
    { fg: 'navItemActiveColor', bgChain: ['sidebarActiveColor', 'sidebarColor', 'colorBgBody'], min: 4.5, beat: { fg: 'sidebarItemTextColor', bgChain: ['sidebarColor', 'colorBgBody'] } },
    { fg: 'navItemActiveColor', bgChain: ['topbarActiveColor', 'topbarColor', 'colorBgBody'], min: 4.5 },
    { fg: 'on:primaryColor', bgChain: ['primaryColor', 'colorBgBody'], min: 4.5 },
    { fg: 'on:secondaryColor', bgChain: ['secondaryColor', 'colorBgBody'], min: 4.5 },
    { fg: 'on:statusSuccessColor', bgChain: ['statusSuccessColor', 'colorBgBody'], min: 4.5 },
    { fg: 'on:statusErrorColor', bgChain: ['statusErrorColor', 'colorBgBody'], min: 4.5 },
    { fg: 'on:statusWarningColor', bgChain: ['statusWarningColor', 'colorBgBody'], min: 4.5 },
    { fg: 'on:statusInfoColor', bgChain: ['statusInfoColor', 'colorBgBody'], min: 4.5 },
    { fg: 'on:chatUserBg', bgChain: ['chatUserBg', 'colorBgBody'], min: 4.5 },
    { fg: 'mix:primaryColor', bgChain: ['primaryColor@0.1', 'cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    { fg: 'mix:primaryColor', bgChain: ['primaryColor@0.1', 'colorBgBody'], min: 4.5 },
    { fg: 'mix:secondaryColor', bgChain: ['secondaryColor@0.1', 'cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    { fg: 'mix:secondaryColor', bgChain: ['secondaryColor@0.1', 'colorBgBody'], min: 4.5 },
    { fg: 'mix:statusSuccessColor', bgChain: ['statusSuccessColor@0.1', 'cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    { fg: 'mix:statusSuccessColor', bgChain: ['statusSuccessColor@0.1', 'colorBgBody'], min: 4.5 },
    { fg: 'mix:statusErrorColor', bgChain: ['statusErrorColor@0.1', 'cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    { fg: 'mix:statusErrorColor', bgChain: ['statusErrorColor@0.1', 'colorBgBody'], min: 4.5 },
    { fg: 'mix:statusWarningColor', bgChain: ['statusWarningColor@0.1', 'cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    { fg: 'mix:statusWarningColor', bgChain: ['statusWarningColor@0.1', 'colorBgBody'], min: 4.5 },
    { fg: 'mix:statusInfoColor', bgChain: ['statusInfoColor@0.1', 'cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    { fg: 'mix:statusInfoColor', bgChain: ['statusInfoColor@0.1', 'colorBgBody'], min: 4.5 },
    { fg: 'statusErrorColor', bgChain: ['cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    { fg: 'statusSuccessColor', bgChain: ['cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    { fg: 'inputErrorColor', bgChain: ['colorBgBody'], min: 4.5 },
    { fg: 'inputErrorColor', bgChain: ['cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    { fg: 'primaryColor', bgChain: ['colorBgBody'], min: 4.5 },
    { fg: 'primaryColor', bgChain: ['cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    { fg: 'textColorMuted', bgChain: ['btnSecondaryBg', 'colorBgBody'], min: 4.5 },
    { fg: 'on:textColorMuted', bgChain: ['textColorMuted', 'colorBgBody'], min: 4.5 },
    { fg: 'textColorMaster', bgChain: ['sidebarHoverColor', 'sidebarColor', 'colorBgBody'], min: 4.5 },
    { fg: 'textColorMaster', bgChain: ['topbarHoverColor', 'topbarColor', 'colorBgBody'], min: 4.5 },
    { fg: 'textColorMaster', bgChain: ['tableRowHoverBg', 'cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    { fg: 'titleColor', bgChain: ['matrixItemBg', 'cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    { fg: 'mix:statusErrorColor', bgChain: ['statusErrorColor@0.15', 'sidebarColor', 'colorBgBody'], min: 4.5 },
    { fg: 'mix:statusErrorColor', bgChain: ['statusErrorColor@0.15', 'topbarColor', 'colorBgBody'], min: 4.5 },
    { fg: 'mix:primaryColor', bgChain: ['btnGhostHoverBg', 'cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    { fg: 'mix:primaryColor', bgChain: ['btnGhostHoverBg', 'colorBgBody'], min: 4.5 },
    { fg: 'statusErrorColor', bgChain: ['colorBgBody'], min: 4.5 },
    { fg: 'statusSuccessColor', bgChain: ['colorBgBody'], min: 4.5 },
    { fg: 'textColorMuted', bgChain: ['tableHeaderBg', 'cardBackgroundColor', 'colorBgBody'], min: 4.5 },
    { fg: 'textColorSecondary', bgChain: ['tableHeaderBg', 'cardBackgroundColor', 'colorBgBody'], min: 4.5 },
];

/** Share of the source color used by the soft-badge text mix. */
export const MIX_SOURCE_SHARE = 0.4;
