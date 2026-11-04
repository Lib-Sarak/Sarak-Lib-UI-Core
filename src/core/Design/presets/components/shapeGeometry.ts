import type { ComponentPreset } from './cards';

/**
 * Cantos e densidade: um preset move vários componentes de uma vez, para o sistema inteiro ter a mesma "mão".
 * O raio de cada peça é escolhido, não derivado — um modal pede mais canto que um selo.
 */
interface CornerScale {
    base: number; card: number; button: number; input: number; table: number; modal: number; tooltip: number; badge: number; progress: number; nav: number;
}

const corners = (id: string, name: string, description: string, keywords: string[], scale: CornerScale): ComponentPreset => ({
    id,
    name,
    description,
    keywords,
    design: {
        borderRadius: scale.base,
        cardBorderRadius: scale.card,
        btnBorderRadius: scale.button,
        inputBorderRadius: scale.input,
        tableBorderRadius: scale.table,
        modalBorderRadius: scale.modal,
        tooltipRadius: scale.tooltip,
        badgeRadius: scale.badge,
        progressBarRadius: scale.progress,
        navItemRadius: scale.nav,
    },
});

export const CORNER_PRESETS: ComponentPreset[] = [
    corners('corners-sharp', 'Retos', 'Todos os cantos em ângulo reto: visual técnico e rígido.', ['reto', 'sharp', 'quadrado', 'square'],
        { base: 0, card: 0, button: 0, input: 0, table: 0, modal: 0, tooltip: 0, badge: 0, progress: 0, nav: 0 }),
    corners('corners-soft', 'Suaves', 'Um respiro nos cantos, sem perder a firmeza.', ['suave', 'soft', 'discreto'],
        { base: 6, card: 8, button: 6, input: 6, table: 8, modal: 8, tooltip: 4, badge: 4, progress: 4, nav: 6 }),
    corners('corners-rounded', 'Arredondados', 'O equilíbrio mais comum: cantos visivelmente redondos.', ['arredondado', 'rounded', 'padrao'],
        { base: 12, card: 16, button: 12, input: 12, table: 16, modal: 20, tooltip: 6, badge: 12, progress: 8, nav: 12 }),
    corners('corners-round', 'Bem redondos', 'Cantos generosos em cards, botões e janelas: tom amigável.', ['redondo', 'round', 'amigavel'],
        { base: 20, card: 28, button: 20, input: 20, table: 28, modal: 32, tooltip: 10, badge: 24, progress: 12, nav: 20 }),
    corners('corners-pill', 'Pílula', 'O máximo que cada peça aceita: botões e campos viram pílulas.', ['pilula', 'pill', 'oval', 'maximo'],
        { base: 40, card: 40, button: 120, input: 120, table: 40, modal: 40, tooltip: 12, badge: 99, progress: 32, nav: 24 }),
];

interface DensityScale {
    layout: 'compact' | 'comfortable' | 'spacious';
    form: 'tight' | 'comfortable' | 'relaxed';
    padding: number; gap: number; gapSm: number; gapMd: number; gapLg: number; card: number; header: number; cell: number; section: number; tab: number;
}

const density = (id: string, name: string, description: string, keywords: string[], scale: DensityScale): ComponentPreset => ({
    id,
    name,
    description,
    keywords,
    design: {
        layoutDensity: scale.layout,
        layoutPadding: scale.padding,
        layoutGap: scale.gap,
        layoutGapSm: scale.gapSm,
        layoutGapMd: scale.gapMd,
        layoutGapLg: scale.gapLg,
        cardPaddingMd: scale.card,
        cardHeaderPadding: scale.header,
        tableDensity: scale.layout,
        tableCellPadding: scale.cell,
        sidebarItemDensity: scale.layout,
        topbarItemDensity: scale.layout,
        formFieldDensity: scale.form,
        globalSectionGap: scale.section,
        tabGap: scale.tab,
    },
});

export const DENSITY_PRESETS: ComponentPreset[] = [
    density('density-tight', 'Muito compacta', 'Espaços mínimos: o máximo de informação por tela, para quem vive em tabelas.', ['apertada', 'tight', 'minimo', 'denso'],
        { layout: 'compact', form: 'tight', padding: 8, gap: 8, gapSm: 4, gapMd: 8, gapLg: 12, card: 8, header: 8, cell: 4, section: 12, tab: 2 }),
    density('density-compact', 'Compacta', 'Respiros curtos e organizados, sem sufocar.', ['compacta', 'compact', 'enxuta'],
        { layout: 'compact', form: 'tight', padding: 12, gap: 12, gapSm: 6, gapMd: 12, gapLg: 18, card: 14, header: 12, cell: 6, section: 16, tab: 4 }),
    density('density-comfortable', 'Confortável', 'O ponto de equilíbrio entre informação e descanso para a vista.', ['confortavel', 'comfortable', 'padrao', 'medio'],
        { layout: 'comfortable', form: 'comfortable', padding: 24, gap: 20, gapSm: 10, gapMd: 20, gapLg: 32, card: 24, header: 20, cell: 12, section: 24, tab: 6 }),
    density('density-airy', 'Arejada', 'Bastante espaço entre blocos: leitura calma, ideal para painéis de resumo.', ['arejada', 'airy', 'espacosa', 'respiro'],
        { layout: 'spacious', form: 'relaxed', padding: 40, gap: 32, gapSm: 16, gapMd: 32, gapLg: 48, card: 32, header: 28, cell: 18, section: 40, tab: 10 }),
    density('density-generous', 'Generosa', 'Espaço de sobra em tudo: poucas coisas por tela, cada uma com destaque.', ['generosa', 'spacious', 'ampla', 'luxo'],
        { layout: 'spacious', form: 'relaxed', padding: 56, gap: 44, gapSm: 20, gapMd: 44, gapLg: 72, card: 44, header: 36, cell: 24, section: 64, tab: 16 }),
];
