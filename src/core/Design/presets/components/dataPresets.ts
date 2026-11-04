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

/** Gráfico: formato, espessura da linha, suavização e a grade de fundo. A cor das séries vem da paleta. */
export const CHART_PRESETS: ComponentPreset[] = [
    {
        id: 'chart-area-smooth',
        name: 'Área suave',
        description: 'Área preenchida com curva suave e grade discreta.',
        keywords: ['area', 'suave', 'smooth', 'curva'],
        design: { chartType: 'area', chartThickness: 2, chartSmoothing: true, chartShowGrid: true, chartGridOpacity: 0.06 },
    },
    {
        id: 'chart-line-sharp',
        name: 'Linha reta',
        description: 'Linha fina, de ponto a ponto, com grade visível: leitura exata dos valores.',
        keywords: ['linha', 'line', 'reta', 'preciso'],
        design: { chartType: 'line', chartThickness: 2, chartSmoothing: false, chartShowGrid: true, chartGridOpacity: 0.16 },
    },
    {
        id: 'chart-line-bold',
        name: 'Linha forte',
        description: 'Linha grossa e curva, sem grade: o traço é o protagonista.',
        keywords: ['linha', 'grossa', 'bold', 'destaque'],
        design: { chartType: 'line', chartThickness: 6, chartSmoothing: true, chartShowGrid: false, chartGridOpacity: 0.06 },
    },
    {
        id: 'chart-bars-clean',
        name: 'Barras limpas',
        description: 'Barras sem grade, para comparar valores de relance.',
        keywords: ['barras', 'bars', 'colunas', 'comparar'],
        design: { chartType: 'bar', chartThickness: 3, chartShowGrid: false, chartGridOpacity: 0.06 },
    },
    {
        id: 'chart-bars-grid',
        name: 'Barras com grade',
        description: 'Barras sobre uma grade bem marcada, para ler cada valor na escala.',
        keywords: ['barras', 'grade', 'grid', 'escala'],
        design: { chartType: 'bar', chartThickness: 3, chartShowGrid: true, chartGridOpacity: 0.28 },
    },
    {
        id: 'chart-radar-fine',
        name: 'Radar fino',
        description: 'Radar de traço fino e grade leve, para comparar várias medidas.',
        keywords: ['radar', 'aranha', 'spider', 'medidas'],
        design: { chartType: 'radar', chartThickness: 1, chartSmoothing: false, chartShowGrid: true, chartGridOpacity: 0.14 },
    },
    {
        id: 'chart-scatter',
        name: 'Dispersão',
        description: 'Pontos soltos sobre uma grade tênue, para ver agrupamentos.',
        keywords: ['dispersao', 'scatter', 'pontos', 'nuvem'],
        design: { chartType: 'scatter', chartThickness: 4, chartShowGrid: true, chartGridOpacity: 0.1 },
    },
];
