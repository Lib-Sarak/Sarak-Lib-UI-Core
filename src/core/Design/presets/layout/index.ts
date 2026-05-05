/**
 * Sarak Layout Presets (v12.0)
 */

export interface LayoutPreset {
    id: string;
    name: string;
    description: string;
}

export const DENSITY = {
    COMPACT: { id: 'compact', gap: '0.5rem', pad: '0.75rem', fontSizeBase: '11px', radius: '8px', label: 'Compact' },
    STANDARD: { id: 'standard', gap: '1.25rem', pad: '1.5rem', fontSizeBase: '13px', radius: '12px', label: 'Standard' },
    COMFORTABLE: { id: 'comfortable', gap: '2rem', pad: '2rem', fontSizeBase: '15px', radius: '20px', label: 'Comfortable' }
};

export const NAVIGATION_STYLES = {
    SIDEBAR: 'sidebar',
    TOPBAR: 'topbar',
    FLOATING: 'floating',
    MINIMAL: 'minimal'
};

export const LAYOUTS: LayoutPreset[] = [
    { id: 'modern', name: 'Modern Sovereign', description: 'Layout padrão v10+' },
    { id: 'classic', name: 'Classic Sarak', description: 'Layout legado v5.0' },
    { id: 'minimal', name: 'Minimalist', description: 'Foco total no conteúdo' }
];

// Alias para o hub de presets
export const LAYOUT_PRESETS: LayoutPreset[] = LAYOUTS;
