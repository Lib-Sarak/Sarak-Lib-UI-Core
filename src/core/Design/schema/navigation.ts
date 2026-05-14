import { ComponentSchema } from '../types';

/**
 * SCHEMA: NAVEGAÇÃO & SHELL
 * Governa a arquitetura de menus, barras e a estrutura de navegação do sistema.
 */
export const NavigationSchema: ComponentSchema = {
    id: 'navigation',
    label: 'Container de Nav',
    pilar: 'navigation',
    subcategory: 'Navegação Principal',
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
        },
        {
            id: 'topbarTitleColor',
            label: 'Cor do Título (Topbar)',
            category: 'Topbar: Estilo',
            type: 'color',
            defaultValue: '#ffffff',
            cssVars: ['--sarak-topbar-title-color']
        },
        // --- ESTÉTICA AVANÇADA DO SHELL ---
        {
            id: 'sidebarBlur',
            label: 'Backdrop Blur (Sidebar)',
            category: 'Sidebar: Estilo',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 50 },
            defaultValue: 10,
            cssVars: ['--sarak-sidebar-blur']
        },
        {
            id: 'sidebarShadow',
            label: 'Sombra da Sidebar',
            category: 'Sidebar: Estilo',
            type: 'text',
            defaultValue: '10px 0 30px rgba(0,0,0,0.5)',
            cssVars: ['--sarak-sidebar-shadow']
        },
        {
            id: 'navActiveMarkerColor',
            label: 'Cor do Marcador Ativo',
            category: 'Itens de Menu',
            type: 'color',
            defaultValue: '#00f2ff',
            cssVars: ['--sarak-nav-marker-color']
        },
        {
            id: 'navActiveMarkerGlow',
            label: 'Brilho do Marcador',
            category: 'Itens de Menu',
            type: 'slider',
            constraints: { min: 0, max: 20 },
            defaultValue: 10,
            cssVars: ['--sarak-nav-marker-glow']
        }
    ]
};
