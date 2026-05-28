import { ComponentSchema } from '../types';

/**
 * SCHEMA: NAVEGAÇÃO & SHELL
 * Governa a arquitetura de menus, barras e a estrutura de navegação do sistema.
 */
export const NavigationSchema: ComponentSchema = {
    id: 'navigation',
    label: 'Container de Nav',
    tokens: [

        {
            id: 'isNavHidden',
            label: 'Ocultar Navegação',
            type: 'boolean',
            defaultValue: false,
            cssVars: ['--is-nav-hidden']
        },
        // --- SIDEBAR CONFIGURATIONS ---
        {
            id: 'sidebarWidth',
            label: 'Largura da Sidebar',
            type: 'slider',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 200, max: 400 },
            defaultValue: { mob: 200, tab: 220, desk: 240 },
            cssVars: ['--sidebar-width', '--sarak-sidebar-width']
        },
        {
            id: 'sidebarMinWidth',
            label: 'Largura Mínima da Sidebar',
            type: 'slider',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 150, max: 300 },
            defaultValue: { mob: 150, tab: 180, desk: 200 },
            cssVars: ['--sidebar-min-width']
        },
        {
            id: 'sidebarMaxWidth',
            label: 'Largura Máxima da Sidebar',
            type: 'slider',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 300, max: 600 },
            defaultValue: { mob: 280, tab: 350, desk: 450 },
            cssVars: ['--sidebar-max-width']
        },
        {
            id: 'sidebarColor',
            label: 'Cor da Sidebar (Fundo)',
            type: 'color',
            defaultValue: '#000000',
            cssVars: ['--theme-sidebar-bg', '--sarak-sidebar-bg']
        },
        {
            id: 'sidebarHoverColor',
            label: 'Hover da Sidebar',
            type: 'color',
            defaultValue: 'transparent',
            cssVars: ['--sarak-sidebar-hover-color']
        },
        {
            id: 'sidebarActiveColor',
            label: 'Ativo da Sidebar',
            type: 'color',
            defaultValue: 'transparent',
            cssVars: ['--sarak-sidebar-active-color']
        },
        {
            id: 'sidebarNoiseOpacity',
            label: 'Opacidade do Ruído (Sidebar)',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0,
            cssVars: ['--sarak-sidebar-noise-opacity']
        },
        // --- TOPBAR CONFIGURATIONS ---
        {
            id: 'topbarHeight',
            label: 'Altura da Topbar',
            type: 'slider',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 48, max: 100 },
            defaultValue: { mob: 56, tab: 60, desk: 64 },
            cssVars: ['--topbar-height', '--sarak-topbar-height', '--theme-topbar-height']
        },
        {
            id: 'topbarColor',
            label: 'Cor da Topbar (Fundo)',
            type: 'color',
            defaultValue: '#000000',
            cssVars: ['--theme-topbar-bg', '--sarak-topbar-bg']
        },
        {
            id: 'topbarHoverColor',
            label: 'Hover da Topbar',
            type: 'color',
            defaultValue: 'transparent',
            cssVars: ['--sarak-topbar-hover-color']
        },
        {
            id: 'topbarActiveColor',
            label: 'Ativo da Topbar',
            type: 'color',
            defaultValue: 'transparent',
            cssVars: ['--sarak-topbar-active-color']
        },
        {
            id: 'topbarNoiseOpacity',
            label: 'Opacidade do Ruído (Topbar)',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0,
            cssVars: ['--sarak-topbar-noise-opacity']
        },
        {
            id: 'topbarTitleColor',
            label: 'Cor do Título (Topbar)',
            type: 'color',
            defaultValue: '#ffffff',
            cssVars: ['--sarak-topbar-title-color']
        },
        // --- SEÇÕES E TABS ---
        {
            id: 'tabGap',
            label: 'Espaço entre Abas',
            type: 'slider',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 24 },
            defaultValue: { mob: 4, tab: 6, desk: 8 },
            cssVars: ['--tab-gap', '--sarak-tab-gap', '--theme-tab-gap']
        },
        {
            id: 'tabSectionMargin',
            label: 'Margem da Seção de Abas',
            type: 'slider',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 48 },
            defaultValue: { mob: 8, tab: 12, desk: 16 },
            cssVars: ['--tab-section-margin', '--sarak-tab-section-margin', '--theme-tab-section-margin', '--safe-area-padding']
        },
        // --- ITENS DE MENU ---
        {
            id: 'navItemActiveColor',
            label: 'Cor do Item Ativo',
            type: 'color',
            defaultValue: '#00f2ff',
            cssVars: ['--sarak-nav-active-color', '--theme-primary']
        },
        {
            id: 'navActiveMarkerColor',
            label: 'Cor do Marcador Ativo',
            type: 'color',
            defaultValue: '#00f2ff',
            cssVars: ['--sarak-nav-marker-color']
        },
        {
            id: 'navActiveMarkerGlow',
            label: 'Brilho do Marcador',
            type: 'slider',
            constraints: { min: 0, max: 20 },
            defaultValue: 10,
            cssVars: ['--sarak-nav-marker-glow']
        },
        // --- ESTÉTICA AVANÇADA DO SHELL ---
        {
            id: 'sidebarBlur',
            label: 'Backdrop Blur (Sidebar)',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 50 },
            defaultValue: 10,
            cssVars: ['--sarak-sidebar-blur']
        },
        {
            id: 'sidebarShadow',
            label: 'Sombra da Sidebar',
            type: 'text',
            defaultValue: '10px 0 30px rgba(0,0,0,0.5)',
        },
        // --- PESQUISA (SEARCH BAR) ---
        {
            id: 'searchPositionTopbar',
            label: 'Posição Pesquisa (Topbar)',
            type: 'select',
            constraints: {
                options: [
                    { id: 'left', value: 'left', label: 'Esquerda' },
                    { id: 'center', value: 'center', label: 'Centro' },
                    { id: 'right', value: 'right', label: 'Direita' },
                    { id: 'hidden', value: 'hidden', label: 'Oculta' }
                ]
            },
            defaultValue: 'left'
        },
        {
            id: 'searchPositionSidebar',
            label: 'Posição Pesquisa (Sidebar)',
            type: 'select',
            constraints: {
                options: [
                    { id: 'top', value: 'top', label: 'Topo' },
                    { id: 'bottom', value: 'bottom', label: 'Rodapé' },
                    { id: 'hidden', value: 'hidden', label: 'Oculta' }
                ]
            },
            defaultValue: 'top'
        }
    ]
};
