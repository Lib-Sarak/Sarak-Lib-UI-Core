import { ComponentSchema } from '../types';

/**
 * SCHEMA: CONFIGURAÇÕES GLOBAIS
 * Controla o comportamento base do sistema, scrollbars e layout.
 */
export const SystemSchema: ComponentSchema = {
    id: 'system',
    label: 'Configurações de Layout',
    tokens: [
        {
            id: 'bgBaseColor',
            label: 'Cor de Fundo Base',
            type: 'color',
            defaultValue: '#0a0a0c',
            cssVars: ['--sarak-bg-base']
        },
        {
            id: 'layout',
            label: 'Modo de Layout',
            type: 'select',
            defaultValue: 'grid',
            options: [
                { value: 'grid', label: 'Grid System' },
                { value: 'flex', label: 'Flexbox Layout' }
            ]
        },

        {
            id: 'layoutDensity',
            label: 'Densidade Visual',
            type: 'select',
            defaultValue: 'comfortable',
            options: [
                { value: 'compact', label: 'Compacto' },
                { value: 'comfortable', label: 'Confortável' },
                { value: 'spacious', label: 'Espaçoso' }
            ]
        },
        {
            id: 'maxContentWidth',
            label: 'Largura Máxima do Conteúdo',
            type: 'select',
            defaultValue: '1440px',
            options: [
                { value: '1200px', label: 'Estreito (1200px)' },
                { value: '1440px', label: 'Padrão (1440px)' },
                { value: '1600px', label: 'Largo (1600px)' },
                { value: '100%', label: 'Fluido (100%)' }
            ]
        },
        {
            id: 'layoutPadding',
            label: 'Respiro do Conteúdo (Padding)',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 80 },
            defaultValue: 32,
            cssVars: ['--sarak-layout-padding']
        },
        {
            id: 'isSplitViewEnabled',
            label: 'Ativar Vista Dividida (Split)',
            type: 'boolean',
            defaultValue: false
        },
        {
            id: 'isAutoHideEnabled',
            label: 'Auto-ocultar Menus',
            type: 'boolean',
            defaultValue: false
        },
        // --- ARQUITETURA DE BORDAS ---
        {
            id: 'borderRadius',
            label: 'Arredondamento Padrão',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 40 },
            defaultValue: 12,
            cssVars: ['--radius-theme', '--sarak-border-radius', '--border-radius']
        },
        {
            id: 'borderRadiusSm',
            label: 'Arredondamento Pequeno',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 20 },
            defaultValue: 6,
            cssVars: ['--sarak-border-radius-sm']
        },
        {
            id: 'borderRadiusMd',
            label: 'Arredondamento Médio',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 40 },
            defaultValue: 12,
            cssVars: ['--sarak-border-radius-md']
        },
        {
            id: 'borderRadiusLg',
            label: 'Arredondamento Grande',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 60 },
            defaultValue: 20,
            cssVars: ['--sarak-border-radius-lg']
        },
        {
            id: 'borderWidth',
            label: 'Espessura da Borda',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 10 },
            defaultValue: 1,
            cssVars: ['--theme-border-width', '--border-width', '--sarak-border-width']
        },
        {
            id: 'borderStyle',
            label: 'Estilo da Borda',
            type: 'select',
            defaultValue: 'solid',
            options: [
                { value: 'solid', label: 'Contínuo (Solid)' },
                { value: 'dashed', label: 'Tracejado' },
                { value: 'dotted', label: 'Pontilhado' },
                { value: 'none', label: 'Sem borda' }
            ],
            cssVars: ['--border-style', '--sarak-border-style']
        },
        // --- ESPAÇAMENTOS (GAPS) ---
        {
            id: 'layoutGap',
            label: 'Espaçamento Padrão (Gap)',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 80 },
            defaultValue: 24,
            cssVars: ['--theme-gap', '--sarak-layout-gap']
        },
        {
            id: 'layoutGapSm',
            label: 'Espaçamento Pequeno',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 40 },
            defaultValue: 12,
            cssVars: ['--sarak-layout-gap-sm']
        },
        {
            id: 'layoutGapMd',
            label: 'Espaçamento Médio',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 80 },
            defaultValue: 24,
            cssVars: ['--sarak-layout-gap-md']
        },
        {
            id: 'layoutGapLg',
            label: 'Espaçamento Grande',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 120 },
            defaultValue: 36,
            cssVars: ['--sarak-layout-gap-lg']
        },
        // --- ÍCONES ---
        {
            id: 'iconFamily',
            label: 'Família de Ícones',
            type: 'select',
            defaultValue: 'lucide',
            options: [
                { value: 'lucide', label: 'Lucide (Padrão)' },
                { value: 'phosphor', label: 'Phosphor' },
                { value: 'tabler', label: 'Tabler Icons' }
            ]
        },
        {
            id: 'iconWeight',
            label: 'Peso / Estilo do Ícone',
            type: 'select',
            defaultValue: 'regular',
            options: [
                { value: 'thin', label: 'Thin' },
                { value: 'light', label: 'Light' },
                { value: 'regular', label: 'Regular' },
                { value: 'bold', label: 'Bold' },
                { value: 'fill', label: 'Fill (Preenchido)' },
                { value: 'duotone', label: 'Duotone' }
            ]
        },
        {
            id: 'iconStrokeWidth',
            label: 'Espessura do Ícone',
            type: 'slider',
            constraints: { min: 1, max: 4, step: 0.5 },
            defaultValue: 2,
            cssVars: ['--sarak-icon-stroke', '--theme-icon-stroke']
        },
        // --- SCROLLBARS ---
        {
            id: 'scrollbarWidth',
            label: 'Largura da Scrollbar',
            type: 'slider',
            unit: 'px',
            constraints: { min: 2, max: 12 },
            defaultValue: 6,
            cssVars: ['--sarak-scrollbar-width']
        },
        {
            id: 'scrollbarThumbColor',
            label: 'Cor do Trilho (Thumb)',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.1)',
            cssVars: ['--sarak-scrollbar-thumb']
        },
        // --- CORE ENGINEERING ---
        {
            id: 'industrialRegistry',
            label: 'Modo do Registro Industrial',
            type: 'boolean',
            defaultValue: true
        }
    ]
};
