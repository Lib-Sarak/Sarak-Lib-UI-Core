export const LAYOUT_PRESETS = [
    {
        id: 'sidebar-standard',
        title: 'Sidebar Navigation',
        description: 'Clássico & Funcional',
        tokens: { navigationStyle: 'sidebar', sidebarWidth: 240, layoutDensity: 'normal' }
    },
    {
        id: 'topbar-modern',
        title: 'Topbar Flow',
        description: 'Foco no Conteúdo',
        tokens: { navigationStyle: 'topbar', layoutDensity: 'comfortable' }
    },
    {
        id: 'compact-utility',
        title: 'Compact Grid',
        description: 'Alta Densidade de Dados',
        tokens: { navigationStyle: 'sidebar', sidebarWidth: 180, layoutDensity: 'compact' }
    }
];
