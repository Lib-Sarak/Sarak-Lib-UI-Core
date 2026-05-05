/**
 * Sarak Color Presets (v12.0)
 * Exporta paletas de cor individuais (para a galeria) e hierárquicas (para o PaletteSelector).
 */

export const PRIMARY_COLORS = [
    { name: 'Sarak Emerald', value: '#10b981' },
    { name: 'Sarak Azure', value: '#0ea5e9' },
    { name: 'Sarak Indigo', value: '#6366f1' },
    { name: 'Sarak Violet', value: '#8b5cf6' },
    { name: 'Sarak Rose', value: '#f43f5e' },
    { name: 'Sarak Amber', value: '#f59e0b' },
    { name: 'Sarak Slate', value: '#64748b' }
];

export interface ColorPreset {
    id: string;
    name: string;
    design: {
        primary: string;
    };
}

export const COLOR_PRESETS: ColorPreset[] = PRIMARY_COLORS.map(color => ({
    id: color.name.toLowerCase().replace(/\s+/g, '-'),
    name: color.name,
    design: { primary: color.value }
}));

// ─── Paletas Hierárquicas ─────────────────────────────────────────────────────
// Estrutura consumida pelo PaletteSelector: primary + secondary + accent + surface

export interface ColorPalette {
    id: string;
    name: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        surface: string;
    };
}

export const COLOR_PALETTES: ColorPalette[] = [
    {
        id: 'cyber',
        name: 'Cyber Neon',
        colors: { primary: '#00f2ff', secondary: '#ff00e5', accent: '#7c3aed', surface: '#0f172a' }
    },
    {
        id: 'emerald',
        name: 'Industrial Emerald',
        colors: { primary: '#10b981', secondary: '#3b82f6', accent: '#f59e0b', surface: '#0f1b14' }
    },
    {
        id: 'violet',
        name: 'Sovereign Violet',
        colors: { primary: '#8b5cf6', secondary: '#ec4899', accent: '#06b6d4', surface: '#13111c' }
    },
    {
        id: 'azure',
        name: 'Azure Sky',
        colors: { primary: '#0ea5e9', secondary: '#6366f1', accent: '#10b981', surface: '#0c1a2e' }
    },
    {
        id: 'amber',
        name: 'Executive Gold',
        colors: { primary: '#f59e0b', secondary: '#ef4444', accent: '#8b5cf6', surface: '#1c1408' }
    },
    {
        id: 'rose',
        name: 'Prestige Rose',
        colors: { primary: '#f43f5e', secondary: '#8b5cf6', accent: '#06b6d4', surface: '#1c0811' }
    },
    {
        id: 'slate',
        name: 'Monochrome Slate',
        colors: { primary: '#94a3b8', secondary: '#64748b', accent: '#475569', surface: '#0f172a' }
    }
];
