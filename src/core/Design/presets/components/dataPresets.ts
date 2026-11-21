import type { ComponentPreset } from './cards';

/** Tabela: densidade, listras, cantos e respiro da célula. Linha e cabeçalho não têm token próprio, então não são presets. */
export const TABLE_PRESETS: ComponentPreset[] = [
    {
        id: 'table-default',
        name: 'Padrão',
        description: 'Densidade confortável, sem listras e cantos médios.',
        keywords: ['padrao', 'default', 'normal', 'confortavel'],
        design: { tableDensity: 'comfortable', tableZebraStriping: false, tableBorderRadius: 14, tableCellPadding: 12 },
    },
    {
        id: 'table-striped',
        name: 'Listrada',
        description: 'Linhas alternadas em dois tons, para acompanhar a leitura de lado a lado.',
        keywords: ['listrada', 'zebra', 'striped', 'alternada'],
        design: { tableDensity: 'comfortable', tableZebraStriping: true, tableBorderRadius: 10, tableCellPadding: 12 },
    },
    {
        id: 'table-compact',
        name: 'Compacta',
        description: 'Células apertadas e cantos curtos: muitas linhas na mesma tela.',
        keywords: ['compacta', 'compact', 'densa', 'apertada'],
        design: { tableDensity: 'compact', tableZebraStriping: false, tableBorderRadius: 6, tableCellPadding: 5 },
    },
    {
        id: 'table-airy',
        name: 'Arejada',
        description: 'Células largas e muito respiro: para poucas linhas, lidas com calma.',
        keywords: ['arejada', 'airy', 'espacosa', 'larga'],
        design: { tableDensity: 'spacious', tableZebraStriping: false, tableBorderRadius: 20, tableCellPadding: 22 },
    },
    {
        id: 'table-rounded-striped',
        name: 'Listrada e redonda',
        description: 'Listras com cantos bem arredondados: tabela com cara de cartão.',
        keywords: ['redonda', 'rounded', 'cartao', 'listras'],
        design: { tableDensity: 'comfortable', tableZebraStriping: true, tableBorderRadius: 28, tableCellPadding: 14 },
    },
    {
        id: 'table-sharp-dense',
        name: 'Reta e densa',
        description: 'Cantos retos, listras e células curtas: aparência de planilha.',
        keywords: ['planilha', 'sheet', 'reta', 'excel'],
        design: { tableDensity: 'compact', tableZebraStriping: true, tableBorderRadius: 0, tableCellPadding: 4 },
    },
];

/**
 * Gráfico: só o ESTILO (espessura do traço, suavização e grade de fundo). O tipo (linha, barras, pizza…) é de quem usa o componente,
 * no `type`; o `chartType` do design é apenas o tipo padrão, no ajuste fino. Nenhum preset grava `chartType` nem leva tipo no nome.
 * A cor das séries vem da paleta.
 */
export const CHART_PRESETS: ComponentPreset[] = [
    {
        id: 'chart-style-smooth',
        name: 'Suave',
        description: 'Traço médio e curvo sobre uma grade bem marcada: o desenho flui, com a escala sempre à vista.',
        keywords: ['suave', 'smooth', 'curva', 'discreto'],
        design: { chartThickness: 5, chartSmoothing: true, chartShowGrid: true, chartGridOpacity: 0.5 },
    },
    {
        id: 'chart-style-straight',
        name: 'Reta',
        description: 'Traço fino, de ponto a ponto, com grade visível: leitura exata dos valores.',
        keywords: ['reta', 'straight', 'preciso', 'exato'],
        design: { chartThickness: 2, chartSmoothing: false, chartShowGrid: true, chartGridOpacity: 0.16 },
    },
    {
        id: 'chart-style-bold',
        name: 'Forte',
        description: 'Traço grosso e curvo, sem grade: o desenho é o protagonista.',
        keywords: ['forte', 'bold', 'grosso', 'destaque'],
        design: { chartThickness: 8, chartSmoothing: true, chartShowGrid: false, chartGridOpacity: 0.06 },
    },
    {
        id: 'chart-style-grid',
        name: 'Com grade',
        description: 'Traço grosso, de ponto a ponto, sobre uma grade bem marcada: para ler cada valor na escala.',
        keywords: ['grade', 'grid', 'escala', 'marcada'],
        design: { chartThickness: 8, chartSmoothing: false, chartShowGrid: true, chartGridOpacity: 0.5 },
    },
    {
        id: 'chart-style-fine',
        name: 'Fina',
        description: 'O traço mais fino, de ponto a ponto e sem grade: um desenho leve, que não pesa na tela.',
        keywords: ['fina', 'fine', 'delicada', 'leve'],
        design: { chartThickness: 1, chartSmoothing: false, chartShowGrid: false, chartGridOpacity: 0.06 },
    },
];
