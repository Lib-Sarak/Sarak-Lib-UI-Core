import { ComponentSchema } from '../types';

/**
 * SCHEMA: NAVEGAÇÃO & SHELL
 * Governa a arquitetura de menus, barras e a estrutura de navegação do sistema.
 */
export const NavigationSchema: ComponentSchema = {
    id: 'navigation',
    label: 'Navegação & Shell',
    pilar: 'navigation',
    tokens: [
        {
            id: 'navigationStyle',
            label: 'Modo de Navegação',
            category: 'Estrutura Master',
            type: 'select',
            constraints: {
                options: [
                    { id: 'sidebar', label: 'Sidebar Vertical' },
                    { id: 'topbar', label: 'Topbar Horizontal' },
                    { id: 'dock', label: 'Doca Flutuante' }
                ]
            },
            defaultValue: 'sidebar',
            cssVars: ['--sarak-nav-style']
        },
        {
            id: 'sidebarWidth',
            label: 'Largura da Sidebar',
            category: 'Sidebar: Anatomia',
            type: 'slider',
            unit: 'px',
            constraints: { min: 200, max: 400 },
            defaultValue: 240,
            cssVars: ['--sarak-sidebar-width']
        },
        {
            id: 'sidebarBg',
            label: 'Fundo da Sidebar',
            category: 'Sidebar: Estilo',
            type: 'color',
            defaultValue: 'rgba(10, 10, 12, 0.8)',
            cssVars: ['--sarak-sidebar-bg', '--theme-sidebar']
        },
        {
            id: 'topbarHeight',
            label: 'Altura da Topbar',
            category: 'Topbar: Anatomia',
            type: 'slider',
            unit: 'px',
            constraints: { min: 48, max: 100 },
            defaultValue: 64,
            cssVars: ['--sarak-topbar-height']
        },
        {
            id: 'topbarBg',
            label: 'Fundo da Topbar',
            category: 'Topbar: Estilo',
            type: 'color',
            defaultValue: 'rgba(10, 10, 12, 0.8)',
            cssVars: ['--sarak-topbar-bg']
        },
        {
            id: 'navItemActiveColor',
            label: 'Cor do Item Ativo',
            category: 'Itens de Menu',
            type: 'color',
            defaultValue: '#00f2ff',
            cssVars: ['--sarak-nav-active-color', '--theme-primary']
        }
    ]
};
