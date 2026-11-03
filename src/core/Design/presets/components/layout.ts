import type { ComponentPreset } from './cards';

/**
 * Presets do cromo: barra lateral, barra de topo e largura do conteúdo. Cada um escreve o jeito da barra (moldura, item
 * ativo, densidade, fundo) e, onde faz sentido, o `tone`: um PAPEL da paleta, nunca uma cor escrita à mão.
 */
export const SIDEBAR_PRESETS: ComponentPreset[] = [
    {
        id: 'sidebar-clean',
        name: 'Limpa',
        description: 'Fundo neutro, uma linha na borda e o item ativo marcado por uma barrinha.',
        keywords: ['limpa', 'clean', 'simples', 'padrao'],
        design: {
            sidebarTone: 'neutral', sidebarBorderSide: 'edge', sidebarBorderStyle: 'solid', sidebarBorderWidth: 1,
            sidebarActiveItemStyle: 'bar', sidebarItemDensity: 'comfortable', sidebarBackgroundStyle: 'solid', sidebarBlur: 0, navItemRadius: 8,
        },
    },
    {
        id: 'sidebar-outlined',
        name: 'Contornada',
        description: 'A barra inteira ganha contorno e o item ativo aparece só em linha.',
        keywords: ['contorno', 'outline', 'borda'],
        design: {
            sidebarTone: 'surface', sidebarBorderSide: 'all', sidebarBorderStyle: 'solid', sidebarBorderWidth: 1,
            sidebarActiveItemStyle: 'outline', sidebarItemDensity: 'comfortable', navItemRadius: 12,
        },
    },
    {
        id: 'sidebar-solid',
        name: 'Sólida',
        description: 'Sem moldura, no tom da superfície, com o item ativo preenchido.',
        keywords: ['solida', 'solid', 'preenchida', 'filled'],
        design: {
            sidebarTone: 'surface', sidebarBorderSide: 'none', sidebarActiveItemStyle: 'filled', sidebarItemDensity: 'comfortable',
            sidebarBackgroundStyle: 'solid', sidebarBlur: 0, navItemRadius: 10,
        },
    },
    {
        id: 'sidebar-floating',
        name: 'Flutuante',
        description: 'Contornada, com vidro desfocado e itens em pílula: parece solta da tela.',
        keywords: ['flutuante', 'floating', 'vidro', 'pilula'],
        design: {
            sidebarTone: 'surface', sidebarBorderSide: 'all', sidebarBorderStyle: 'solid', sidebarBorderWidth: 1,
            sidebarBlur: 22, sidebarActiveItemStyle: 'pill', navItemRadius: 20, sidebarItemDensity: 'comfortable',
        },
    },
    {
        id: 'sidebar-compact',
        name: 'Compacta',
        description: 'Itens apertados e ícones pequenos: cabe mais menu na mesma altura.',
        keywords: ['compacta', 'compact', 'densa', 'pequena'],
        design: {
            sidebarTone: 'neutral', sidebarItemDensity: 'compact', sidebarIconSize: 16, sidebarActiveItemStyle: 'bar',
            sidebarBorderSide: 'edge', sidebarBorderWidth: 1, navItemRadius: 6,
        },
    },
    {
        id: 'sidebar-brand',
        name: 'Na cor da marca',
        description: 'A barra toma o papel primário da paleta e o item ativo vira pílula.',
        keywords: ['marca', 'brand', 'primaria', 'colorida'],
        design: { sidebarTone: 'primary', sidebarBorderSide: 'none', sidebarActiveItemStyle: 'pill', sidebarBlur: 0, navItemRadius: 14, sidebarItemDensity: 'comfortable' },
    },
    {
        id: 'sidebar-inverted',
        name: 'Invertida',
        description: 'Contraste oposto ao do tema: escura no claro, clara no escuro.',
        keywords: ['invertida', 'inverse', 'contraste', 'oposta'],
        design: { sidebarTone: 'inverse', sidebarBorderSide: 'none', sidebarActiveItemStyle: 'outline', sidebarBlur: 0, navItemRadius: 10, sidebarIconSize: 20 },
    },
    {
        id: 'sidebar-airy',
        name: 'Arejada',
        description: 'Itens espaçosos, ícones maiores e cantos bem redondos.',
        keywords: ['arejada', 'airy', 'espacosa', 'larga'],
        design: {
            sidebarTone: 'neutral', sidebarItemDensity: 'spacious', sidebarIconSize: 22, sidebarActiveItemStyle: 'pill',
            sidebarBorderSide: 'edge', sidebarBorderWidth: 1, navItemRadius: 16,
        },
    },
    {
        id: 'sidebar-gradient',
        name: 'Degradê',
        description: 'Fundo em degradê no papel secundário da paleta, sem moldura.',
        keywords: ['degrade', 'gradient', 'secundaria'],
        design: { sidebarTone: 'secondary', sidebarBackgroundStyle: 'gradient', sidebarBorderSide: 'none', sidebarActiveItemStyle: 'underline', sidebarBlur: 0 },
    },
    {
        id: 'sidebar-textured',
        name: 'Texturizada',
        description: 'Fundo com textura e grão discreto, e uma borda tracejada na lateral.',
        keywords: ['textura', 'texture', 'grao', 'ruido'],
        design: {
            sidebarTone: 'neutral', sidebarBackgroundStyle: 'texture', sidebarNoiseOpacity: 0.1, sidebarBorderSide: 'edge',
            sidebarBorderStyle: 'dashed', sidebarBorderWidth: 1, sidebarActiveItemStyle: 'bar', navActiveMarkerGlow: 16,
        },
    },
];

export const TOPBAR_PRESETS: ComponentPreset[] = [
    {
        id: 'topbar-flat',
        name: 'Plana',
        description: 'Sem moldura e sem desfoque, no tom do fundo: a barra some e deixa o conteúdo subir.',
        keywords: ['plana', 'flat', 'transparente', 'sem borda'],
        design: { topbarTone: 'neutral', topbarBorderSide: 'none', topbarBlur: 0, topbarActiveItemStyle: 'underline', topbarItemDensity: 'comfortable', topbarBackgroundStyle: 'solid' },
    },
    {
        id: 'topbar-solid',
        name: 'Sólida',
        description: 'No tom da superfície, com uma linha na base e o item ativo preenchido.',
        keywords: ['solida', 'solid', 'preenchida'],
        design: { topbarTone: 'surface', topbarBorderSide: 'edge', topbarBorderStyle: 'solid', topbarBorderWidth: 1, topbarActiveItemStyle: 'filled', topbarBlur: 0 },
    },
    {
        id: 'topbar-divided',
        name: 'Com separador',
        description: 'Uma linha grossa separa a barra do conteúdo.',
        keywords: ['separador', 'divider', 'linha', 'divisor'],
        design: { topbarTone: 'neutral', topbarBorderSide: 'edge', topbarBorderStyle: 'solid', topbarBorderWidth: 2, topbarActiveItemStyle: 'bar', topbarBlur: 0 },
    },
    {
        id: 'topbar-glass',
        name: 'Vidro',
        description: 'Desfoque forte por trás e itens em pílula: o conteúdo passa por baixo.',
        keywords: ['vidro', 'glass', 'desfoque', 'blur'],
        design: { topbarTone: 'surface', topbarBlur: 30, topbarBorderSide: 'edge', topbarBorderWidth: 1, topbarActiveItemStyle: 'pill', topbarBackgroundStyle: 'solid' },
    },
    {
        id: 'topbar-brand',
        name: 'Na cor da marca',
        description: 'A barra toma o papel primário da paleta, sem moldura.',
        keywords: ['marca', 'brand', 'primaria', 'colorida'],
        design: { topbarTone: 'primary', topbarBorderSide: 'none', topbarActiveItemStyle: 'pill', topbarBlur: 0, topbarItemDensity: 'comfortable' },
    },
    {
        id: 'topbar-compact',
        name: 'Compacta',
        description: 'Itens apertados e ícones pequenos, para ganhar altura de tela.',
        keywords: ['compacta', 'compact', 'baixa', 'pequena'],
        design: { topbarItemDensity: 'compact', topbarIconSize: 16, topbarActiveItemStyle: 'underline', topbarBorderSide: 'edge', topbarBorderWidth: 1, topbarBlur: 0 },
    },
    {
        id: 'topbar-inverted',
        name: 'Invertida',
        description: 'Contraste oposto ao do tema, sem moldura.',
        keywords: ['invertida', 'inverse', 'contraste'],
        design: { topbarTone: 'inverse', topbarBorderSide: 'none', topbarActiveItemStyle: 'filled', topbarBlur: 0 },
    },
    {
        id: 'topbar-outlined',
        name: 'Contornada',
        description: 'Contorno em volta de toda a barra e item ativo só em linha.',
        keywords: ['contorno', 'outline', 'borda'],
        design: { topbarTone: 'surface', topbarBorderSide: 'all', topbarBorderStyle: 'solid', topbarBorderWidth: 1, topbarActiveItemStyle: 'outline', topbarItemDensity: 'comfortable' },
    },
    {
        id: 'topbar-textured',
        name: 'Texturizada',
        description: 'Fundo com textura, grão discreto e uma linha tracejada na base.',
        keywords: ['textura', 'texture', 'grao'],
        design: { topbarBackgroundStyle: 'texture', topbarNoiseOpacity: 0.1, topbarBorderSide: 'edge', topbarBorderStyle: 'dashed', topbarBorderWidth: 1, topbarTone: 'neutral' },
    },
];

/** As seis larguras de `maxContentWidth`, uma por preset. */
export const CONTENT_WIDTH_PRESETS: ComponentPreset[] = [
    { id: 'content-width-fluid', name: 'Fluida', description: 'O conteúdo acompanha a largura da janela.', keywords: ['fluida', 'fluid', 'toda a tela'], design: { maxContentWidth: 'fluid' } },
    { id: 'content-width-1000', name: 'Estreita (1000 px)', description: 'Coluna estreita e centralizada, boa para leitura e formulários.', keywords: ['estreita', 'narrow', 'leitura'], design: { maxContentWidth: '1000px' } },
    { id: 'content-width-1200', name: 'Média (1200 px)', description: 'Largura confortável para a maioria das telas de trabalho.', keywords: ['media', 'medium', 'padrao'], design: { maxContentWidth: '1200px' } },
    { id: 'content-width-1440', name: 'Larga (1440 px)', description: 'Mais espaço para tabelas e painéis, ainda com margens nas laterais.', keywords: ['larga', 'wide', 'tabelas'], design: { maxContentWidth: '1440px' } },
    { id: 'content-width-1600', name: 'Muito larga (1600 px)', description: 'Para telas grandes com muitas colunas lado a lado.', keywords: ['muito larga', 'extra wide', 'monitor grande'], design: { maxContentWidth: '1600px' } },
    { id: 'content-width-full', name: 'Tela inteira', description: 'O conteúdo ocupa 100% da região, sem limite de largura.', keywords: ['inteira', 'full', '100%', 'sem limite'], design: { maxContentWidth: '100%' } },
];
