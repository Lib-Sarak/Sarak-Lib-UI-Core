/**
 * Sarak Layout & Structure Presets (v1.0)
 * 
 * Define a espinha dorsal da navegação e o comportamento da Safe Area.
 */

export interface LayoutPreset {
    id: string;
    title: string;
    description: string;
    tokens: {
        navigationStyle: 'sidebar' | 'topbar';
        maxContentWidth: string;
        isAutoHideEnabled: boolean;
        isSplitViewEnabled: boolean;
        sidebarWidth: number;
        layoutDensity: 'compact' | 'standard' | 'comfortable';
    };
}

export const LAYOUT_PRESETS: LayoutPreset[] = [
    {
        id: 'sovereign-sidebar',
        title: 'Sovereign Sidebar',
        description: 'Navegação lateral persistente com foco em fluxos de trabalho complexos.',
        tokens: {
            navigationStyle: 'sidebar',
            maxContentWidth: '1600px',
            isAutoHideEnabled: false,
            isSplitViewEnabled: false,
            sidebarWidth: 260,
            layoutDensity: 'standard'
        }
    },
    {
        id: 'global-topbar',
        title: 'Global Topbar',
        description: 'Navegação superior limpa, ideal para dashboards de leitura e visão geral.',
        tokens: {
            navigationStyle: 'topbar',
            maxContentWidth: '1200px',
            isAutoHideEnabled: false,
            isSplitViewEnabled: false,
            sidebarWidth: 60,
            layoutDensity: 'comfortable'
        }
    },
    {
        id: 'immersive-full',
        title: 'Immersive Full',
        description: 'Máximo aproveitamento de tela com sidebar retrátil e conteúdo fluido.',
        tokens: {
            navigationStyle: 'sidebar',
            maxContentWidth: 'none',
            isAutoHideEnabled: true,
            isSplitViewEnabled: true,
            sidebarWidth: 280,
            layoutDensity: 'compact'
        }
    }
];
