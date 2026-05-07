import { ComponentSchema } from '../types';

/**
 * Mapeamento 100% Granular: Shell (Navegação & Estrutura Industrial)
 */
export const ShellSchema: ComponentSchema = {
    id: 'shell',
    label: 'Estrutura & Navegação',
    pilar: 'estetica',
    tokens: [
        // --- ESTRUTURA MASTER ---
        {
            id: 'layout',
            label: 'Layout do Sistema',
            category: 'Estrutura Master',
            type: 'select',
            constraints: {
                options: [
                    { id: 'sidebar', label: 'Sidebar (Fixo Esquerda)' },
                    { id: 'topbar', label: 'Topbar (Fixo Superior)' },
                    { id: 'glass', label: 'Glass (Soberano)' }
                ]
            },
            defaultValue: 'glass',
            cssVars: ['--sarak-layout-type']
        },
        {
            id: 'navigationStyle',
            label: 'Estilo de Navegação',
            category: 'Estrutura Master',
            type: 'select',
            constraints: {
                options: [
                    { id: 'sidebar', label: 'Sidebar Vertical' },
                    { id: 'topbar', label: 'Topbar Horizontal' },
                    { id: 'floating', label: 'Floating (Doca)' }
                ]
            },
            defaultValue: 'sidebar',
            cssVars: ['--sarak-nav-style']
        },

        // --- SIDEBAR CONTAINER ---
        {
            id: 'sidebarWidth',
            label: 'Largura da Sidebar',
            category: 'Sidebar Container',
            type: 'slider',
            unit: 'px',
            constraints: { min: 200, max: 450 },
            defaultValue: 240,
            cssVars: ['--sarak-sidebar-width']
        },
        {
            id: 'sidebarBg',
            label: 'Cor de Fundo Sidebar',
            category: 'Sidebar Container',
            type: 'color',
            defaultValue: 'rgba(10, 10, 12, 0.8)',
            cssVars: ['--sarak-sidebar-bg']
        },
        {
            id: 'sidebarBlur',
            label: 'Backdrop Blur Sidebar',
            category: 'Sidebar Container',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 50 },
            defaultValue: 10,
            cssVars: ['--sarak-sidebar-blur']
        },
        {
            id: 'sidebarBorderColor',
            label: 'Cor da Borda Sidebar',
            category: 'Sidebar Container',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.05)',
            cssVars: ['--sarak-sidebar-border-color']
        },

        // --- SIDEBAR NAV ITEMS ---
        {
            id: 'navItemFontSize',
            label: 'Tamanho da Fonte (Nav)',
            category: 'Navigation Items',
            type: 'slider',
            unit: 'px',
            constraints: { min: 10, max: 20 },
            defaultValue: 14,
            cssVars: ['--sarak-nav-font-size']
        },
        {
            id: 'navItemFontWeight',
            label: 'Peso da Fonte (Nav)',
            category: 'Navigation Items',
            type: 'select',
            constraints: {
                options: [
                    { id: '300', label: 'Light' },
                    { id: '400', label: 'Regular' },
                    { id: '500', label: 'Medium' },
                    { id: '600', label: 'Semi-Bold' },
                    { id: '700', label: 'Bold' }
                ]
            },
            defaultValue: '500',
            cssVars: ['--sarak-nav-font-weight']
        },
        {
            id: 'navItemColorDefault',
            label: 'Cor do Texto (Padrão)',
            category: 'Navigation Items',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.6)',
            cssVars: ['--sarak-nav-color-default']
        },
        {
            id: 'navItemColorActive',
            label: 'Cor do Texto (Ativo)',
            category: 'Navigation Items',
            type: 'color',
            defaultValue: '#00f2ff',
            cssVars: ['--sarak-nav-color-active']
        },
        {
            id: 'navIconSize',
            label: 'Tamanho do Ícone',
            category: 'Navigation Icons',
            type: 'slider',
            unit: 'px',
            constraints: { min: 16, max: 32 },
            defaultValue: 20,
            cssVars: ['--sarak-nav-icon-size']
        },
        {
            id: 'navIconStroke',
            label: 'Espessura do Ícone',
            category: 'Navigation Icons',
            type: 'slider',
            constraints: { min: 1, max: 3, step: 0.5 },
            defaultValue: 1.5,
            cssVars: ['--sarak-nav-icon-stroke']
        },

        // --- INDICADORES ---
        {
            id: 'navActiveMarkerColor',
            label: 'Cor do Indicador Ativo',
            category: 'Active Marker',
            type: 'color',
            defaultValue: '#00f2ff',
            cssVars: ['--sarak-nav-marker-color']
        },
        {
            id: 'navActiveMarkerGlow',
            label: 'Brilho do Indicador',
            category: 'Active Marker',
            type: 'slider',
            constraints: { min: 0, max: 20 },
            defaultValue: 10,
            cssVars: ['--sarak-nav-marker-glow']
        },

        {
            id: 'sidebarShadow',
            label: 'Sombra da Sidebar',
            category: 'Sidebar Container',
            type: 'text',
            defaultValue: '10px 0 30px rgba(0,0,0,0.5)',
            cssVars: ['--sarak-sidebar-shadow']
        },

        // ... (Navigation Items & Icons unchanged)

        // --- TOPBAR ---
        {
            id: 'topbarHeight',
            label: 'Altura da Topbar',
            category: 'Topbar Container',
            type: 'slider',
            unit: 'px',
            constraints: { min: 40, max: 120 },
            defaultValue: 64,
            cssVars: ['--sarak-topbar-height']
        },
        {
            id: 'topbarBg',
            label: 'Cor de Fundo Topbar',
            category: 'Topbar Container',
            type: 'color',
            defaultValue: '#000000',
            cssVars: ['--sarak-topbar-bg']
        },
        {
            id: 'topbarBlur',
            label: 'Backdrop Blur Topbar',
            category: 'Topbar Container',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 50 },
            defaultValue: 20,
            cssVars: ['--sarak-topbar-blur']
        },
        {
            id: 'topbarTitleColor',
            label: 'Cor do Título (Breadcrumb)',
            category: 'Topbar Style',
            type: 'color',
            defaultValue: '#ffffff',
            cssVars: ['--sarak-topbar-title-color']
        },

        // --- LAYOUT CONTENT ---
        {
            id: 'layoutPadding',
            label: 'Respiro do Conteúdo (Padding)',
            category: 'Layout: Geral',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 80 },
            defaultValue: 32,
            cssVars: ['--sarak-layout-padding']
        },
        {
            id: 'layoutBackground',
            label: 'Cor de Fundo Global',
            category: 'Layout: Geral',
            type: 'color',
            defaultValue: '#050505',
            cssVars: ['--sarak-layout-bg']
        },

        // --- SCROLLBARS ---
        {
            id: 'scrollbarWidth',
            label: 'Largura da Scrollbar',
            category: 'Scrollbars',
            type: 'slider',
            unit: 'px',
            constraints: { min: 2, max: 12 },
            defaultValue: 6,
            cssVars: ['--sarak-scrollbar-width']
        },
        {
            id: 'scrollbarThumbColor',
            label: 'Cor do Trilho (Thumb)',
            category: 'Scrollbars',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.1)',
            cssVars: ['--sarak-scrollbar-thumb']
        },
        {
            id: 'scrollbarThumbHover',
            label: 'Cor Hover (Thumb)',
            category: 'Scrollbars',
            type: 'color',
            defaultValue: 'rgba(0, 242, 255, 0.3)',
            cssVars: ['--sarak-scrollbar-hover']
        },
        {
            id: 'scrollbarRadius',
            label: 'Arredondamento',
            category: 'Scrollbars',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 10 },
            defaultValue: 10,
            cssVars: ['--sarak-scrollbar-radius']
        }
    ]
};
