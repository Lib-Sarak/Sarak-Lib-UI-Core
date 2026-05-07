/**
 * Sarak Typography Presets (v12.0)
 * Contém presets curados de personalidade tipográfica E o catálogo de fontes disponíveis.
 */

export interface TypographyPreset {
    id: string;
    name: string;
    description: string;
    design: {
        headingFont: string;
        bodyFont: string;
        headingWeight: string;
        letterSpacingHeading: number;
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
            letterSpacingHeading: -0.5,
            fontScale: 'm'
        }
    },
    {
        id: 'industrial-mono',
        name: 'Industrial Mono',
        description: 'Foco em interfaces técnicas e centros de comando com toques mono-espaçados.',
        design: {
            headingFont: "'JetBrains Mono', monospace",
            bodyFont: "'Inter', sans-serif",
            headingWeight: '700',
            letterSpacingHeading: 1.0,
            fontScale: 'm'
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
            letterSpacingHeading: -1.0,
            fontScale: 'm'
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
            letterSpacingHeading: 0,
            fontScale: 'l'
        }
    }
];

// Catálogo completo de famílias de fontes disponíveis
export const THEME_FONTS = [
    { id: 'satoshi', name: 'Satoshi Pro', value: "'Satoshi', sans-serif", category: 'sans', weights: [300, 400, 500, 700, 900] },
    { id: 'cabinet', name: 'Cabinet Grotesk', value: "'Cabinet Grotesk', sans-serif", category: 'sans', weights: [400, 700, 800, 900] },
    { id: 'inter', name: 'Inter Dynamic', value: "'Inter', sans-serif", category: 'sans', weights: [300, 400, 500, 600, 700] },
    { id: 'outfit', name: 'Outfit Tech', value: "'Outfit', sans-serif", category: 'sans', weights: [300, 400, 600, 800] },
    { id: 'sentient', name: 'Sentient Serif', value: "'Sentient', serif", category: 'serif', weights: [400, 500, 700] },
    { id: 'clash', name: 'Clash Display', value: "'Clash Display', sans-serif", category: 'display', weights: [500, 600, 700] },
    { id: 'jetbrains', name: 'JetBrains Mono', value: "'JetBrains Mono', monospace", category: 'mono', weights: [400, 500, 700] },
    { id: 'space-mono', name: 'Space Mono', value: "'Space Mono', monospace", category: 'mono', weights: [400, 700] },
    { id: 'playfair', name: 'Playfair Classic', value: "'Playfair Display', serif", category: 'serif', weights: [400, 700, 900] },
    { id: 'fraunces', name: 'Fraunces Vintage', value: "'Fraunces', serif", category: 'serif', weights: [400, 700, 900] },
    { id: 'bricolage', name: 'Bricolage Grotesque', value: "'Bricolage Grotesque', sans-serif", category: 'display', weights: [400, 700, 800] },
    { id: 'public-sans', name: 'Public Corporate', value: "'Public Sans', sans-serif", category: 'sans', weights: [400, 500, 700] },
    { id: 'space-grotesk', name: 'Space Tech', value: "'Space Grotesk', sans-serif", category: 'display', weights: [300, 500, 700] }
];
