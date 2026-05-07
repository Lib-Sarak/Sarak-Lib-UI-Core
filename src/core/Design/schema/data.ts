import { ComponentSchema } from '../types';

/**
 * Mapeamento 100% Atômico: Dados & Status (v12.0)
 * Governa a exibição de informações complexas e indicadores de estado.
 */
export const DataSchema: ComponentSchema = {
    id: 'data',
    label: 'Dados & Gráficos',
    pilar: 'visual',
    tokens: [
        // --- TABELAS: ANATOMIA ---
        {
            id: 'tableHeaderBg',
            label: 'Fundo do Cabeçalho',
            category: 'Tabelas: Anatomia',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.03)',
            cssVars: ['--sarak-table-header-bg']
        },
        {
            id: 'tableRowHover',
            label: 'Cor Hover da Linha',
            category: 'Tabelas: Anatomia',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.05)',
            cssVars: ['--sarak-table-row-hover']
        },
        {
            id: 'tableZebraBg',
            label: 'Fundo Zebra (Linhas Pares)',
            category: 'Tabelas: Anatomia',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.01)',
            cssVars: ['--sarak-table-zebra-bg']
        },
        {
            id: 'tableBorderColor',
            label: 'Cor das Divisórias',
            category: 'Tabelas: Anatomia',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.05)',
            cssVars: ['--sarak-table-border']
        },

        // --- STATUS & INDICADORES (Soberania) ---
        {
            id: 'statusSuccess',
            label: 'Cor: Sucesso / Normal',
            category: 'Status: Cores',
            type: 'color',
            defaultValue: '#10b981',
            cssVars: ['--sarak-status-success']
        },
        {
            id: 'statusWarning',
            label: 'Cor: Alerta / Atenção',
            category: 'Status: Cores',
            type: 'color',
            defaultValue: '#f59e0b',
            cssVars: ['--sarak-status-warning']
        },
        {
            id: 'statusDanger',
            label: 'Cor: Perigo / Crítico',
            category: 'Status: Cores',
            type: 'color',
            defaultValue: '#ef4444',
            cssVars: ['--sarak-status-danger']
        },
        {
            id: 'statusInfo',
            label: 'Cor: Informação / Neutro',
            category: 'Status: Cores',
            type: 'color',
            defaultValue: '#3b82f6',
            cssVars: ['--sarak-status-info']
        },
        {
            id: 'statusGlowIntensity',
            label: 'Intensidade do Brilho (Status)',
            category: 'Status: Efeitos',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.4,
            cssVars: ['--sarak-status-glow']
        },

        // --- GRÁFICOS: ESTILO INDUSTRIAL ---
        {
            id: 'chartLineWidth',
            label: 'Espessura da Linha',
            category: 'Gráficos: Desenho',
            type: 'slider',
            unit: 'px',
            constraints: { min: 1, max: 6 },
            defaultValue: 2,
            cssVars: ['--sarak-chart-width']
        },
        {
            id: 'chartAreaOpacity',
            label: 'Opacidade da Área (Fill)',
            category: 'Gráficos: Desenho',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.15,
            cssVars: ['--sarak-chart-area-opacity']
        },
        {
            id: 'chartGridOpacity',
            label: 'Opacidade do Grid',
            category: 'Gráficos: Desenho',
            type: 'slider',
            constraints: { min: 0, max: 0.5, step: 0.01 },
            defaultValue: 0.05,
            cssVars: ['--sarak-chart-grid-opacity']
        },
        {
            id: 'chartPointRadius',
            label: 'Raio dos Pontos (Nodes)',
            category: 'Gráficos: Desenho',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 8 },
            defaultValue: 4,
            cssVars: ['--sarak-chart-point-radius']
        },
        {
            id: 'chartLineSmoothing',
            label: 'Suavização da Curva (Smooth)',
            category: 'Gráficos: Desenho',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.1 },
            defaultValue: 0.3,
            cssVars: ['--sarak-chart-smooth']
        },

        // --- CORES DE SÉRIES (Paleta Industrial) ---
        {
            id: 'chartSeriesA',
            label: 'Série A (Primária)',
            category: 'Gráficos: Cores',
            type: 'color',
            defaultValue: '#00f2ff',
            cssVars: ['--sarak-chart-series-a']
        },
        {
            id: 'chartSeriesB',
            label: 'Série B (Secundária)',
            category: 'Gráficos: Cores',
            type: 'color',
            defaultValue: '#3b82f6',
            cssVars: ['--sarak-chart-series-b']
        },
        {
            id: 'chartSeriesC',
            label: 'Série C (Terciária)',
            category: 'Gráficos: Cores',
            type: 'color',
            defaultValue: '#8b5cf6',
            cssVars: ['--sarak-chart-series-c']
        }
    ]
};

