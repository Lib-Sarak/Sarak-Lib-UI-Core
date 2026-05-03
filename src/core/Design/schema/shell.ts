import { ComponentSchema } from '../types';

/**
 * Mapeamento 100% Granular: Shell (Navegação & Estrutura)
 */
export const ShellSchema: ComponentSchema = {
    id: 'shell',
    label: 'Estrutura & Navegação',
    tokens: [
        {
            id: 'sidebarWidth',
            label: 'Largura da Sidebar',
            category: 'Sidebar',
            type: 'slider',
            unit: 'px',
            min: 200,
            max: 450,
            defaultValue: 240,
            cssVars: ['--sidebar-width', '--sarak-sidebar-width']
        },
        {
            id: 'topbarHeight',
            label: 'Altura da Topbar',
            category: 'Topbar',
            type: 'slider',
            unit: 'px',
            min: 40,
            max: 120,
            defaultValue: 64,
            cssVars: ['--topbar-height', '--sarak-topbar-height']
        },
        {
            id: 'navigationStyle',
            label: 'Estilo de Navegação',
            category: 'Global',
            type: 'select',
            options: [
                { id: 'sidebar', label: 'Sidebar Lateral' },
                { id: 'topbar', label: 'Topbar Superior' },
                { id: 'dock', label: 'Dock Inferior' }
            ],
            defaultValue: 'sidebar',
            cssVars: ['--sarak-navigation-style']
        },
        {
            id: 'isAutoHideEnabled',
            label: 'Auto-Ocultar Menu',
            category: 'Comportamento',
            type: 'boolean',
            defaultValue: false
        },
        {
            id: 'sidebarColor',
            label: 'Cor da Sidebar',
            category: 'Sidebar',
            type: 'color',
            defaultValue: 'rgba(0, 0, 0, 0.4)',
            cssVars: ['--theme-sidebar']
        },
        {
            id: 'layoutDensity',
            label: 'Densidade da Interface',
            category: 'Global',
            type: 'select',
            options: [
                { id: 'compact', label: 'Compacta' },
                { id: 'standard', label: 'Padrão' },
                { id: 'spacious', label: 'Espaçosa' }
            ],
            defaultValue: 'standard',
            cssVars: ['--layout-density']
        },
        {
            id: 'tabGap',
            label: 'Espaçamento de Abas',
            category: 'Navegação',
            type: 'slider',
            unit: 'px',
            min: 0,
            max: 40,
            defaultValue: 12,
            cssVars: ['--tab-gap']
        },
        {
            id: 'isNavHidden',
            label: 'Ocultar Navegação',
            category: 'Comportamento',
            type: 'boolean',
            defaultValue: false
        },
        {
            id: 'sidebarHoverColor',
            label: 'Cor Hover (Sidebar)',
            category: 'Sidebar Interação',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.08)',
            cssVars: ['--sidebar-hover']
        },
        {
            id: 'sidebarActiveColor',
            label: 'Cor Ativa (Sidebar)',
            category: 'Sidebar Interação',
            type: 'color',
            defaultValue: 'rgba(0, 242, 255, 0.15)',
            cssVars: ['--sidebar-active']
        }
    ]
};
