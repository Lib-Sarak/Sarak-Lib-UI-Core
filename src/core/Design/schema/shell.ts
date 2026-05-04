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
            constraints: {
                min: 200,
                max: 450,
            },
            defaultValue: 240,
            cssVars: ['--sidebar-width', '--sarak-sidebar-width']
        },
        {
            id: 'topbarHeight',
            label: 'Altura da Topbar',
            category: 'Topbar',
            type: 'slider',
            unit: 'px',
            constraints: {
                min: 40,
                max: 120,
            },
            defaultValue: 64,
            cssVars: ['--topbar-height', '--sarak-topbar-height']
        },
        {
            id: 'navigationStyle',
            label: 'Estilo de Navegação',
            category: 'Global',
            type: 'select',
            constraints: {
                options: [
                    { id: 'sidebar', label: 'Sidebar Lateral' },
                    { id: 'topbar', label: 'Topbar Superior' },
                    { id: 'floating', label: 'Menu Flutuante' },
                    { id: 'minimal', label: 'Minimalista' }
                ],
            },
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
            constraints: {
                options: [
                    { id: 'compact', label: 'Compacta (Tech)' },
                    { id: 'standard', label: 'Padrão (Equilibrada)' },
                    { id: 'comfortable', label: 'Confortável (Focada)' }
                ],
            },
            defaultValue: 'standard',
            cssVars: ['--layout-density']
        },
        {
            id: 'tabGap',
            label: 'Espaçamento de Abas',
            category: 'Navegação',
            type: 'slider',
            unit: 'px',
            constraints: {
                min: 0,
                max: 40,
            },
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
            cssVars: ['--sidebar-active', '--sarak-sidebar-active-color']
        },
        {
            id: 'topbarColor',
            label: 'Cor da Topbar',
            category: 'Topbar',
            type: 'color',
            defaultValue: '#000000',
            cssVars: ['--theme-topbar-bg', '--sarak-topbar-bg']
        },
        {
            id: 'topbarHoverColor',
            label: 'Cor Hover (Topbar)',
            category: 'Topbar Interação',
            type: 'color',
            defaultValue: 'transparent',
            cssVars: ['--sarak-topbar-hover-color']
        },
        {
            id: 'topbarActiveColor',
            label: 'Cor Ativa (Topbar)',
            category: 'Topbar Interação',
            type: 'color',
            defaultValue: 'transparent',
            cssVars: ['--sarak-topbar-active-color']
        },
        {
            id: 'sidebarNoiseOpacity',
            label: 'Ruído (Sidebar)',
            category: 'Sidebar Estilo',
            type: 'slider',
            constraints: {
                min: 0,
                max: 1,
                step: 0.01,
            },
            defaultValue: 0.05,
            cssVars: ['--sarak-sidebar-noise-opacity']
        },
        {
            id: 'topbarNoiseOpacity',
            label: 'Ruído (Topbar)',
            category: 'Topbar Estilo',
            type: 'slider',
            constraints: {
                min: 0,
                max: 1,
                step: 0.01,
            },
            defaultValue: 0.05,
            cssVars: ['--sarak-topbar-noise-opacity']
        },
        {
            id: 'maxContentWidth',
            label: 'Largura Máxima Conteúdo',
            category: 'Global',
            type: 'select',
            constraints: {
                options: [
                    { id: '1200px', label: 'Estreito (1200px)' },
                    { id: '1440px', label: 'Padrão (1440px)' },
                    { id: '1600px', label: 'Largo (1600px)' },
                    { id: '100%', label: 'Full Width' }
                ],
            },
            defaultValue: '1440px',
            cssVars: ['--sarak-max-width']
        }
    ]
};
