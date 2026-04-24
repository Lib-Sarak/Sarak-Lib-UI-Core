/**
 * Sarak Component & Layout Presets (v1.0)
 * 
 * Define a densidade, espaçamento e o comportamento dos componentes de UI.
 */

export interface ComponentPreset {
    id: string;
    title: string;
    description: string;
    tokens: {
        layoutDensity: 'compact' | 'standard' | 'comfortable';
        layoutGap: number;
        navigationStyle: 'sidebar' | 'topbar';
        sidebarWidth: number;
        scrollbarStyle: number;
        maxContentWidth: string;
        isSplitViewEnabled: boolean;
        borderType?: 'neon' | 'standard' | 'minimal';
    };
}

export const COMPONENT_PRESETS: ComponentPreset[] = [
    {
        id: 'ultra-compact',
        title: 'Ultra Compact',
        description: 'Máxima densidade de informação para power users e terminais de monitoramento.',
        tokens: {
            layoutDensity: 'compact',
            layoutGap: 8,
            navigationStyle: 'sidebar',
            sidebarWidth: 220,
            scrollbarStyle: 4,
            maxContentWidth: 'none',
            isSplitViewEnabled: true,
            borderType: 'minimal'
        }
    },
    {
        id: 'standard-industrial',
        title: 'Standard Industrial',
        description: 'O equilíbrio Sarak para uso diário, com espaçamentos claros e hierarquia forte.',
        tokens: {
            layoutDensity: 'standard',
            layoutGap: 20,
            navigationStyle: 'sidebar',
            sidebarWidth: 260,
            scrollbarStyle: 8,
            maxContentWidth: '1440px',
            isSplitViewEnabled: false,
            borderType: 'standard'
        }
    },
    {
        id: 'comfort-wide',
        title: 'Comfort Wide',
        description: 'Design focado em leitura e dashboards executivos, com amplas margens e respiro.',
        tokens: {
            layoutDensity: 'comfortable',
            layoutGap: 32,
            navigationStyle: 'topbar',
            sidebarWidth: 280,
            scrollbarStyle: 12,
            maxContentWidth: '1600px',
            isSplitViewEnabled: false,
            borderType: 'neon'
        }
    }
];
