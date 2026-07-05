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
            defaultValue: 'rgba(255, 255, 255, 0.03)',
            cssVars: ['--sarak-table-header-bg']
        },
        {
            id: 'tableRowHoverBg',
            label: 'Fundo Hover (Linha)',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.02)',
            cssVars: ['--sarak-table-row-hover']
        },
        {
            id: 'tableZebraStriping',
            label: 'Listras Alternadas (Zebra)',
            type: 'boolean',
            defaultValue: false,
            cssVars: ['--sarak-table-zebra-striping']
        },
        {
            id: 'tableBorderRadius',
            label: 'Arredondamento da Tabela',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 40 },
            defaultValue: 8,
            cssVars: ['--sarak-table-border-radius']
        },
        {
            id: 'tableCellPadding',
            label: 'Densidade (Padding)',
            type: 'slider',
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
            defaultValue: 'rgba(255, 255, 255, 0.05)',
            cssVars: ['--sarak-table-border']
        },

        // --- KANBAN (Spec 27) ---
        {
            id: 'kanbanHeaderPaddingY',
            label: 'Kanban: Padding Vertical do Cabeçalho da Coluna',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 16 },
            defaultValue: 4,
            cssVars: ['--sarak-kanban-header-padding-y']
        },
        {
            id: 'kanbanHeaderTracking',
            label: 'Kanban: Tracking do Cabeçalho da Coluna',
            type: 'slider',
            unit: 'em',
            constraints: { min: 0, max: 1, step: 0.01 },
            defaultValue: 0.04,
            cssVars: ['--sarak-kanban-header-tracking']
        },
        {
            id: 'kanbanCardRadius',
            label: 'Kanban: Arredondamento do Card',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 24 },
            defaultValue: 8,
            cssVars: ['--sarak-kanban-card-radius']
        }
    ]
};
