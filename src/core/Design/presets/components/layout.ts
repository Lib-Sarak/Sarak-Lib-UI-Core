import type { ComponentPreset } from './cards';

/**
 * Presets do cromo: barra lateral, barra de topo, o papel de cor das duas barras e a largura do conteúdo. Os de barra escrevem só
 * a estrutura (moldura, item ativo, densidade, fundo); o papel de cor da paleta (`sidebarTone`/`topbarTone`) é do grupo `barTone`,
 * que grava os dois juntos. Nunca uma cor escrita à mão.
 */
export const SIDEBAR_PRESETS: ComponentPreset[] = [
    {
        id: 'sidebar-clean',
        name: 'Limpa',
        description: 'Uma linha na borda e o item ativo marcado por uma barrinha.',
        keywords: ['limpa', 'clean', 'simples', 'padrao'],
        design: {
            sidebarBorderSide: 'edge', sidebarBorderStyle: 'solid', sidebarBorderWidth: 1,
            sidebarActiveItemStyle: 'bar', sidebarActiveGlass: 'off', sidebarItemDensity: 'comfortable', sidebarBackgroundStyle: 'solid', sidebarBlur: 0, navItemRadius: 8,
        },
    },
    {
        id: 'sidebar-outlined',
        name: 'Contornada',
        description: 'A barra inteira ganha contorno e o item ativo aparece só em linha.',
        keywords: ['contorno', 'outline', 'borda'],
        design: {
            sidebarBorderSide: 'all', sidebarBorderStyle: 'solid', sidebarBorderWidth: 1,
            sidebarActiveItemStyle: 'outline', sidebarItemDensity: 'comfortable', navItemRadius: 12,
        },
    },
    {
        id: 'sidebar-solid',
        name: 'Sólida',
        description: 'Sem moldura e com o item ativo preenchido.',
        keywords: ['solida', 'solid', 'preenchida', 'filled'],
        design: {
            sidebarBorderSide: 'none', sidebarActiveItemStyle: 'filled', sidebarItemDensity: 'comfortable',
            sidebarBackgroundStyle: 'solid', sidebarBlur: 0, navItemRadius: 10,
        },
    },
    {
        id: 'sidebar-floating',
        name: 'Flutuante',
        description: 'Sem contorno, num vidro em degradê e com itens em pílula: parece solta da tela.',
        keywords: ['flutuante', 'floating', 'vidro', 'pilula'],
        design: {
            sidebarBorderSide: 'none', sidebarBackgroundStyle: 'gradient',
            sidebarBlur: 22, sidebarActiveItemStyle: 'pill', sidebarActiveGlass: 'on', navItemRadius: 20, sidebarItemDensity: 'comfortable',
        },
    },
    {
        id: 'sidebar-compact',
        name: 'Compacta',
        description: 'Itens apertados e ícones pequenos: cabe mais menu na mesma altura.',
        keywords: ['compacta', 'compact', 'densa', 'pequena'],
        design: {
            sidebarItemDensity: 'compact', sidebarIconSize: 16, sidebarActiveItemStyle: 'bar',
            sidebarBorderSide: 'edge', sidebarBorderWidth: 1, navItemRadius: 6,
        },
    },
    {
        id: 'sidebar-airy',
        name: 'Arejada',
        description: 'Itens espaçosos, ícones maiores e cantos bem redondos.',
        keywords: ['arejada', 'airy', 'espacosa', 'larga'],
        design: {
            sidebarItemDensity: 'spacious', sidebarIconSize: 22, sidebarActiveItemStyle: 'pill',
            sidebarBorderSide: 'edge', sidebarBorderWidth: 1, navItemRadius: 16,
        },
    },
    {
        id: 'sidebar-gradient',
        name: 'Degradê',
        description: 'Fundo em degradê, sem moldura e com o item ativo sublinhado.',
        keywords: ['degrade', 'gradient'],
        design: { sidebarBackgroundStyle: 'gradient', sidebarBorderSide: 'none', sidebarActiveItemStyle: 'underline', sidebarBlur: 0 },
    },
    {
        id: 'sidebar-textured',
        name: 'Texturizada',
        description: 'Fundo com textura e grão discreto, e uma borda tracejada na lateral.',
        keywords: ['textura', 'texture', 'grao', 'ruido'],
        design: {
            sidebarBackgroundStyle: 'texture', sidebarNoiseOpacity: 0.3, sidebarBorderSide: 'edge',
            sidebarBorderStyle: 'dashed', sidebarBorderWidth: 2, sidebarActiveItemStyle: 'filled', navActiveMarkerGlow: 16, navItemRadius: 4,
        },
    },
];

export const TOPBAR_PRESETS: ComponentPreset[] = [
    {
        id: 'topbar-flat',
        name: 'Plana',
        description: 'Sem moldura e sem desfoque: a barra some e deixa o conteúdo subir.',
        keywords: ['plana', 'flat', 'transparente', 'sem borda'],
        design: { topbarBorderSide: 'none', topbarBlur: 0, topbarActiveItemStyle: 'underline', topbarItemDensity: 'comfortable', topbarBackgroundStyle: 'solid' },
    },
    {
        id: 'topbar-solid',
        name: 'Sólida',
        description: 'Com uma linha na base e o item ativo preenchido.',
        keywords: ['solida', 'solid', 'preenchida'],
        design: { topbarBorderSide: 'edge', topbarBorderStyle: 'solid', topbarBorderWidth: 1, topbarActiveItemStyle: 'filled', topbarBlur: 0 },
    },
    {
        id: 'topbar-divided',
        name: 'Com separador',
        description: 'Uma linha grossa separa a barra do conteúdo.',
        keywords: ['separador', 'divider', 'linha', 'divisor'],
        design: { topbarBorderSide: 'edge', topbarBorderStyle: 'solid', topbarBorderWidth: 2, topbarActiveItemStyle: 'bar', topbarBlur: 0 },
    },
    {
        id: 'topbar-glass',
        name: 'Vidro',
        description: 'Desfoque forte por trás e itens em pílula: o conteúdo passa por baixo.',
        keywords: ['vidro', 'glass', 'desfoque', 'blur'],
        design: { topbarBlur: 30, topbarBorderSide: 'edge', topbarBorderWidth: 1, topbarActiveItemStyle: 'pill', topbarBackgroundStyle: 'solid' },
    },
    {
        id: 'topbar-compact',
        name: 'Compacta',
        description: 'Itens apertados e ícones pequenos, para ganhar altura de tela.',
        keywords: ['compacta', 'compact', 'baixa', 'pequena'],
        design: { topbarItemDensity: 'compact', topbarIconSize: 16, topbarActiveItemStyle: 'underline', topbarBorderSide: 'edge', topbarBorderWidth: 1, topbarBlur: 0 },
    },
    {
        id: 'topbar-outlined',
        name: 'Contornada',
        description: 'Contorno em volta de toda a barra e item ativo só em linha.',
        keywords: ['contorno', 'outline', 'borda'],
        design: { topbarBorderSide: 'all', topbarBorderStyle: 'solid', topbarBorderWidth: 1, topbarActiveItemStyle: 'outline', topbarItemDensity: 'comfortable' },
    },
    {
        id: 'topbar-textured',
        name: 'Texturizada',
        description: 'Fundo com textura, grão discreto e uma linha tracejada na base.',
        keywords: ['textura', 'texture', 'grao'],
        design: { topbarBackgroundStyle: 'texture', topbarNoiseOpacity: 0.1, topbarBorderSide: 'edge', topbarBorderStyle: 'dashed', topbarBorderWidth: 1, },
    },
];

/**
 * O papel de cor das barras, uma opção por papel da paleta. Cada uma grava o da lateral e o do topo juntos: escolher "Invertida"
 * inverte as duas. O ajuste de uma barra só continua no ajuste fino (token por token).
 */
const barTonePreset = (tone: 'neutral' | 'surface' | 'primary' | 'secondary' | 'inverse', name: string, description: string, keywords: string[]): ComponentPreset => ({
    id: `bar-tone-${tone}`,
    name,
    description,
    keywords,
    design: { sidebarTone: tone, topbarTone: tone },
});

export const BAR_TONE_PRESETS: ComponentPreset[] = [
    barTonePreset('neutral', 'Neutra', 'As duas barras no fundo de sempre da paleta.', ['neutra', 'neutral', 'padrao', 'fundo']),
    barTonePreset('surface', 'Superfície', 'As duas barras no tom da superfície, um degrau acima do fundo.', ['superficie', 'surface', 'clara']),
    barTonePreset('primary', 'Cor da marca', 'As duas barras tomam o papel primário da paleta.', ['marca', 'brand', 'primaria', 'colorida']),
    barTonePreset('secondary', 'Secundária', 'As duas barras tomam o papel secundário da paleta.', ['secundaria', 'secondary']),
    barTonePreset('inverse', 'Invertida', 'Contraste oposto ao do tema nas duas barras: escuras no claro, claras no escuro.', ['invertida', 'inverse', 'contraste', 'oposta']),
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
