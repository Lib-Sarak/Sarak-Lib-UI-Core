import { ComponentSchema } from '../types';

/**
 * SCHEMA: TABELAS & GRIDS DE DADOS
 * Especializado em densidade de dados e visualização estruturada.
 */
export const TablesSchema: ComponentSchema = {
    id: 'tables',
    label: 'Configuração de Tabelas',
    pilar: 'systems',
    subcategory: 'Tabelas',
    tokens: [
        {
            id: 'tableHeaderBg',
            label: 'Fundo do Cabeçalho',
            category: 'Anatomia',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.03)',
            cssVars: ['--sarak-table-header-bg']
        },
        {
            id: 'tableRowHoverBg',
            label: 'Fundo Hover (Linha)',
            category: 'Interação',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.02)',
            cssVars: ['--sarak-table-row-hover']
        },
        {
            id: 'tableCellPadding',
            label: 'Densidade (Padding)',
            category: 'Anatomia',
            type: 'slider',
            unit: 'px',
            constraints: { min: 4, max: 32 },
            defaultValue: 12,
            cssVars: ['--sarak-table-padding']
        },
        {
            id: 'tableBorderColor',
            label: 'Cor das Linhas',
            category: 'Anatomia',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.05)',
            cssVars: ['--sarak-table-border']
        }
    ]
};
