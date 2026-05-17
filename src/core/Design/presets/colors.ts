/**
 * Presets: Paletas de Cores Industriais (v1.0)
 * 
 * Cada paleta define o mapeamento para primary, secondary, accent e surface.
 */

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
        id: 'default',
        name: 'Cyberpunk (Padrão)',
        colors: {
            primary: '#00f2ff',
            secondary: '#7000ff',
            accent: '#ff00d4',
            surface: '#1e293b'
        }
    },
    {
        id: 'neon',
        name: 'Neon Glow',
        colors: {
            primary: '#00ffcc',
            secondary: '#ff0055',
            accent: '#00bfff',
            surface: '#0f172a'
        }
    },
    {
        id: 'matrix',
        name: 'Green Matrix',
        colors: {
            primary: '#00ff00',
            secondary: '#003300',
            accent: '#33ff33',
            surface: '#050a05'
        }
    },
    {
        id: 'slate',
        name: 'Slate Industrial',
        colors: {
            primary: '#94a3b8',
            secondary: '#475569',
            accent: '#cbd5e1',
            surface: '#0f172a'
        }
    },
    {
        id: 'sunset',
        name: 'Sunset Orange',
        colors: {
            primary: '#f97316',
            secondary: '#ef4444',
            accent: '#e11d48',
            surface: '#1c1917'
        }
    }
];
