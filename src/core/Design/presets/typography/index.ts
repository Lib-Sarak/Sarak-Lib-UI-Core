/**
 * Sarak Atomic Presets: Typography (v12.0)
 * 
 * Biblioteca industrial de personalidades tipográficas.
 */

export interface TypographyPreset {
    id: string;
    name: string;
    description: string;
    design: {
        headingFont: string;
        bodyFont: string;
        headingWeight: string;
        headingLetterSpacing: number;
        fontScale: 's' | 'm' | 'l' | 'xl';
    };
}

export const TYPOGRAPHY_PRESETS: TypographyPreset[] = [
    {
        id: 'modern-standard',
        name: 'Modern Standard',
        description: 'A combinação clássica Inter para máxima legibilidade e neutralidade.',
        design: {
            headingFont: "'Inter', sans-serif",
            bodyFont: "'Inter', sans-serif",
            headingWeight: '900',
            headingLetterSpacing: -0.5,
            fontScale: 'm'
        }
    },
    {
        id: 'industrial-mono',
        name: 'Industrial Mono',
        description: 'Foco em interfaces técnicas e centros de comando com toques mono-espaçados.',
        design: {
            headingFont: "'Roboto Mono', monospace",
            bodyFont: "'Inter', sans-serif",
            headingWeight: '700',
            headingLetterSpacing: 1.0,
            fontScale: 's'
        }
    },
    {
        id: 'cyber-brutalist',
        name: 'Cyber Brutalist',
        description: 'Design agressivo usando Syne para títulos imponentes e largos.',
        design: {
            headingFont: "'Syne', sans-serif",
            bodyFont: "'Outfit', sans-serif",
            headingWeight: '900',
            headingLetterSpacing: -1.0,
            fontScale: 'xl'
        }
    },
    {
        id: 'elegant-outfit',
        name: 'Elegant Outfit',
        description: 'Suavidade e geometria refinada com fontes arredondadas e amigáveis.',
        design: {
            headingFont: "'Outfit', sans-serif",
            bodyFont: "'Outfit', sans-serif",
            headingWeight: '600',
            headingLetterSpacing: 0,
            fontScale: 'l'
        }
    }
];
