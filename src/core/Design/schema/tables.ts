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
            kind: 'aesthetic',
            modeDependent: false,
            usage: 'Escala o respiro das células da `SarakTable`: o compacto aperta e reduz a fonte, o espaçoso afrouxa; a `SarakDataTable` não lê este token.',
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
            id: 'tableHeaderBg',
            label: 'Fundo do Cabeçalho',
            type: 'color',
            kind: 'aesthetic',
            modeDependent: true,
            usage: 'Fundo do cabeçalho da `SarakTable` e da `SarakDataTable`; também pinta a barra de ferramentas do editor de texto rico e a do visualizador de PDF.',
            description: 'Cor de fundo da linha de cabeçalho da tabela — normalmente levemente destacada do corpo da tabela para diferenciar títulos de coluna dos dados.',
            axis: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.03)',
            cssVars: ['--sarak-table-header-bg']
        },
        {
            id: 'tableRowHoverBg',
            label: 'Fundo Hover (Linha)',
            type: 'color',
            kind: 'aesthetic',
            modeDependent: true,
            usage: 'Fundo da linha sob o ponteiro na `SarakTable`; a `SarakDataTable` não lê este token.',
            description: 'Cor de fundo aplicada a uma linha da tabela quando o mouse passa sobre ela — ajuda o usuário a rastrear visualmente qual linha está lendo, especialmente em tabelas largas.',
            axis: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.02)',
            cssVars: ['--sarak-table-row-hover']
        },
        {
            id: 'tableZebraStriping',
            label: 'Listras Alternadas (Zebra)',
            type: 'boolean',
            kind: 'aesthetic',
            modeDependent: false,
            usage: 'Alterna o fundo das linhas da `SarakTable` e da `SarakDataTable`, para seguir a linha em tabelas largas.',
            description: 'Quando ativo, alterna a cor de fundo de linhas pares/ímpares (efeito "zebra") para facilitar o rastreamento horizontal em tabelas com muitas colunas. Recomendado para tabelas densas com mais de ~8 colunas.',
            axis: 'texture',
            defaultValue: false,
            cssVars: ['--sarak-table-zebra-striping']
        },
        {
            id: 'tableBorderRadius',
            label: 'Arredondamento da Tabela',
            type: 'slider',
            kind: 'aesthetic',
            modeDependent: false,
            usage: 'Arredonda o contêiner da `SarakTable`, por dispositivo; sem declarar, segue o raio do cartão.',
            description: 'Raio de borda do container da tabela, em pixels. 0 = cantos retos/técnicos; valores altos = container arredondado, combinando com o clima geral de cards do tema.',
            axis: 'geometry',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 40 },
            defaultValue: { mob: 10, tab: 14, desk: 14 },
            cssVars: ['--sarak-table-border-radius']
        },
        {
            id: 'tableCellPadding',
            label: 'Densidade (Padding)',
            type: 'slider',
            kind: 'aesthetic',
            modeDependent: false,
            usage: 'Respiro horizontal das células da `SarakDataTable` (cabeçalho e linhas), por dispositivo; a `SarakTable` usa `tableDensity`.',
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
            kind: 'aesthetic',
            modeDependent: true,
            usage: 'Cor das linhas divisórias da `SarakTable` e da `SarakDataTable`.',
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
            kind: 'aesthetic',
            modeDependent: false,
            usage: 'Respiro vertical do título de cada coluna do `SarakKanban`, em px.',
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
            kind: 'aesthetic',
            modeDependent: false,
            usage: 'Espaço entre as letras do título de cada coluna do `SarakKanban`, em `em`.',
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
            kind: 'aesthetic',
            modeDependent: false,
            usage: 'Arredonda os cartões arrastáveis do `SarakKanban`, em px.',
            description: 'Raio de borda dos cards arrastáveis dentro das colunas do Kanban, em pixels.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 0, max: 24 },
            defaultValue: 8,
            cssVars: ['--sarak-kanban-card-radius']
        }
    ]
};
