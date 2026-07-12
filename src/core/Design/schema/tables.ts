import { ComponentSchema } from '../types';

/**
 * SCHEMA: TABELAS & GRIDS DE DADOS
 * Especializado em densidade de dados e visualização estruturada.
 */
export const TablesSchema: ComponentSchema = {
    id: 'tables',
    label: 'Configuração de Tabelas',
    tokens: [
        {
            id: 'tableDensity',
            label: 'Densidade da Tabela',
            type: 'select',
            description: 'Densidade geral de linhas/colunas da tabela. Compacta favorece ver mais dados de uma vez (dashboards analíticos); Espaçosa favorece legibilidade e área de toque (mobile/dados críticos).',
            axis: 'density',
            constraints: {
                options: [
                    { id: 'compact', value: 'compact', label: 'Compacta' },
                    { id: 'comfortable', value: 'comfortable', label: 'Confortável' },
                    { id: 'spacious', value: 'spacious', label: 'Espaçosa' }
                ]
            },
            defaultValue: 'comfortable',
            structuralConsumer: ['useTableLayoutStyles']
        },
        {
            id: 'tableActionPosition',
            label: 'Posição das Ações',
            type: 'select',
            description: 'Lado da linha da tabela onde os botões de ação (editar, excluir etc.) são renderizados. Direita é a convenção mais comum em tabelas ocidentais.',
            axis: 'geometry',
            constraints: {
                options: [
                    { id: 'left', value: 'left', label: 'Esquerda' },
                    { id: 'right', value: 'right', label: 'Direita' }
                ]
            },
            defaultValue: 'right',
            structuralConsumer: ['useTableLayoutStyles']
        },
        {
            id: 'tableHeaderBg',
            label: 'Fundo do Cabeçalho',
            type: 'color',
            description: 'Cor de fundo da linha de cabeçalho da tabela — normalmente levemente destacada do corpo da tabela para diferenciar títulos de coluna dos dados.',
            axis: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.03)',
            cssVars: ['--sarak-table-header-bg']
        },
        {
            id: 'tableRowHoverBg',
            label: 'Fundo Hover (Linha)',
            type: 'color',
            description: 'Cor de fundo aplicada a uma linha da tabela quando o mouse passa sobre ela — ajuda o usuário a rastrear visualmente qual linha está lendo, especialmente em tabelas largas.',
            axis: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.02)',
            cssVars: ['--sarak-table-row-hover']
        },
        {
            id: 'tableZebraStriping',
            label: 'Listras Alternadas (Zebra)',
            type: 'boolean',
            description: 'Quando ativo, alterna a cor de fundo de linhas pares/ímpares (efeito "zebra") para facilitar o rastreamento horizontal em tabelas com muitas colunas. Recomendado para tabelas densas com mais de ~8 colunas.',
            axis: 'texture',
            defaultValue: false,
            cssVars: ['--sarak-table-zebra-striping']
        },
        {
            id: 'tableBorderRadius',
            label: 'Arredondamento da Tabela',
            type: 'slider',
            description: 'Raio de borda do container da tabela, em pixels. 0 = cantos retos/técnicos; valores altos = container arredondado, combinando com o clima geral de cards do tema.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 0, max: 40 },
            defaultValue: 8,
            cssVars: ['--sarak-table-border-radius']
        },
        {
            id: 'tableCellPadding',
            label: 'Densidade (Padding)',
            type: 'slider',
            description: 'Espaçamento interno das células da tabela, em pixels, com valores independentes por breakpoint. Controla o "respiro" de cada célula — reduza para tabelas mais densas, aumente para melhor legibilidade/toque.',
            axis: 'geometry',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 4, max: 32 },
            defaultValue: { mob: 8, tab: 10, desk: 12 },
            cssVars: ['--sarak-table-padding']
        },
        {
            id: 'tableBorderColor',
            label: 'Cor das Linhas',
            type: 'color',
            description: 'Cor das linhas divisórias entre células/linhas da tabela — normalmente bem sutil, só o suficiente para separar visualmente os dados sem criar ruído visual.',
            axis: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.05)',
            cssVars: ['--sarak-table-border']
        },

        // --- KANBAN (Spec 27) ---
        {
            id: 'kanbanHeaderPaddingY',
            label: 'Kanban: Padding Vertical do Cabeçalho da Coluna',
            type: 'slider',
            description: 'Espaçamento vertical interno do cabeçalho de cada coluna do Kanban, em pixels — controla a altura/"respiro" do título da coluna.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 0, max: 16 },
            defaultValue: 4,
            cssVars: ['--sarak-kanban-header-padding-y']
        },
        {
            id: 'kanbanHeaderTracking',
            label: 'Kanban: Tracking do Cabeçalho da Coluna',
            type: 'slider',
            description: 'Espaçamento entre caracteres (tracking) do título de cada coluna do Kanban, em `em`. Valores positivos dão um clima mais editorial/label (comum em títulos maiúsculos de coluna).',
            axis: 'density',
            unit: 'em',
            constraints: { min: 0, max: 1, step: 0.01 },
            defaultValue: 0.04,
            cssVars: ['--sarak-kanban-header-tracking']
        },
        {
            id: 'kanbanCardRadius',
            label: 'Kanban: Arredondamento do Card',
            type: 'slider',
            description: 'Raio de borda dos cards arrastáveis dentro das colunas do Kanban, em pixels.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 0, max: 24 },
            defaultValue: 8,
            cssVars: ['--sarak-kanban-card-radius']
        }
    ]
};
