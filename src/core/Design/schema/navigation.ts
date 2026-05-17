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
            defaultValue: 'sidebar',
            options: [
                { value: 'sidebar', label: 'Sidebar Vertical' },
                { value: 'topbar', label: 'Topbar Horizontal' },
                { value: 'dock', label: 'Doca Flutuante' }
            ],
            cssVars: ['--sarak-navigation-style', '--sarak-nav-style', '--nav-style']
        },
        {
            id: 'isNavHidden',
            label: 'Ocultar Navegação',
            category: 'Estrutura Master',
            type: 'boolean',
            defaultValue: false,
            cssVars: ['--is-nav-hidden']
        },
        // --- SIDEBAR CONFIGURATIONS ---
        {
            id: 'sidebarWidth',
            label: 'Largura da Sidebar',
            category: 'Sidebar: Anatomia',
            type: 'slider',
            unit: 'px',
            constraints: { min: 200, max: 400 },
            defaultValue: 240,
            cssVars: ['--sidebar-width', '--sarak-sidebar-width']
        },
        {
            id: 'sidebarMinWidth',
            label: 'Largura Mínima da Sidebar',
            category: 'Sidebar: Anatomia',
            type: 'slider',
            unit: 'px',
            constraints: { min: 150, max: 300 },
            defaultValue: 200,
            cssVars: ['--sidebar-min-width']
        },
        {
            id: 'sidebarMaxWidth',
            label: 'Largura Máxima da Sidebar',
            category: 'Sidebar: Anatomia',
            type: 'slider',
            unit: 'px',
            constraints: { min: 300, max: 600 },
            defaultValue: 450,
            cssVars: ['--sidebar-max-width']
        },
        {
            id: 'sidebarColor',
            label: 'Cor da Sidebar (Fundo)',
            category: 'Sidebar: Estilo',
            type: 'color',
            defaultValue: '#000000',
            cssVars: ['--theme-sidebar-bg', '--sarak-sidebar-bg']
        },
        {
            id: 'sidebarHoverColor',
            label: 'Hover da Sidebar',
            category: 'Sidebar: Estilo',
            type: 'color',
            defaultValue: 'transparent',
            cssVars: ['--sarak-sidebar-hover-color']
        },
        {
            id: 'sidebarActiveColor',
            label: 'Ativo da Sidebar',
            category: 'Sidebar: Estilo',
            type: 'color',
            defaultValue: 'transparent',
            cssVars: ['--sarak-sidebar-active-color']
        },
        {
            id: 'sidebarNoiseOpacity',
            label: 'Opacidade do Ruído (Sidebar)',
            category: 'Sidebar: Estilo',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0,
            cssVars: ['--sarak-sidebar-noise-opacity']
        },
        // --- TOPBAR CONFIGURATIONS ---
        {
            id: 'topbarHeight',
            label: 'Altura da Topbar',
            category: 'Topbar: Anatomia',
            type: 'slider',
            unit: 'px',
            constraints: { min: 48, max: 100 },
            defaultValue: 64,
            cssVars: ['--topbar-height', '--sarak-topbar-height', '--theme-topbar-height']
        },
        {
            id: 'topbarColor',
            label: 'Cor da Topbar (Fundo)',
            category: 'Topbar: Estilo',
            type: 'color',
            defaultValue: '#000000',
            cssVars: ['--theme-topbar-bg', '--sarak-topbar-bg']
        },
        {
            id: 'topbarHoverColor',
            label: 'Hover da Topbar',
            category: 'Topbar: Estilo',
            type: 'color',
            defaultValue: 'transparent',
            cssVars: ['--sarak-topbar-hover-color']
        },
        {
            id: 'topbarActiveColor',
            label: 'Ativo da Topbar',
            category: 'Topbar: Estilo',
            type: 'color',
            defaultValue: 'transparent',
            cssVars: ['--sarak-topbar-active-color']
        },
        {
            id: 'topbarNoiseOpacity',
            label: 'Opacidade do Ruído (Topbar)',
            category: 'Topbar: Estilo',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0,
            cssVars: ['--sarak-topbar-noise-opacity']
        },
        {
            id: 'topbarTitleColor',
            label: 'Cor do Título (Topbar)',
            category: 'Topbar: Estilo',
            type: 'color',
            defaultValue: '#ffffff',
            cssVars: ['--sarak-topbar-title-color']
        },
        // --- SEÇÕES E TABS ---
        {
            id: 'tabGap',
            label: 'Espaço entre Abas',
            category: 'Abas (Tabs)',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 24 },
            defaultValue: 8,
            cssVars: ['--tab-gap', '--sarak-tab-gap', '--theme-tab-gap']
        },
        {
            id: 'tabSectionMargin',
            label: 'Margem da Seção de Abas',
            category: 'Abas (Tabs)',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 48 },
            defaultValue: 16,
            cssVars: ['--tab-section-margin', '--sarak-tab-section-margin', '--theme-tab-section-margin', '--safe-area-padding']
        },
        // --- ITENS DE MENU ---
        {
            id: 'navItemActiveColor',
            label: 'Cor do Item Ativo',
            category: 'Itens de Menu',
            type: 'color',
            defaultValue: '#00f2ff',
            cssVars: ['--sarak-nav-active-color', '--theme-primary']
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
        }
    ]
};
