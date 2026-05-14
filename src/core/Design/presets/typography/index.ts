/**
 * Sarak v14.0 - Pilar 2: Tipografia e Escala
 * Foco em legibilidade, hierarquia e soberania visual.
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
        scaleRatio: number;
        fontScale: 's' | 'm' | 'l' | 'xl';
    };
}

export const TYPOGRAPHY_PRESETS: TypographyPreset[] = [
    // --- GRUPO 1: QUADRADAS E TÉCNICAS ---
    {
        id: 'inter-preset',
        name: 'Inter',
        description: 'Precisão industrial e legibilidade máxima.',
        design: { headingFont: "'Inter', sans-serif", bodyFont: "'Inter', sans-serif", headingWeight: '900', headingLetterSpacing: -0.8, scaleRatio: 1.25, fontScale: 'm' }
    },
    {
        id: 'satoshi-preset',
        name: 'Satoshi',
        description: 'Geometria moderna e minimalista.',
        design: { headingFont: "'Satoshi', sans-serif", bodyFont: "'Satoshi', sans-serif", headingWeight: '700', headingLetterSpacing: -0.5, scaleRatio: 1.3, fontScale: 'l' }
    },
    {
        id: 'cabinet-preset',
        name: 'Cabinet Grotesk',
        description: 'Design expressivo de alto impacto.',
        design: { headingFont: "'Cabinet Grotesk', sans-serif", bodyFont: "'Satoshi', sans-serif", headingWeight: '800', headingLetterSpacing: -1, scaleRatio: 1.4, fontScale: 'xl' }
    },
    {
        id: 'space-grotesk-preset',
        name: 'Space Grotesk',
        description: 'Estética futurista e brutalista.',
        design: { headingFont: "'Space Grotesk', sans-serif", bodyFont: "'Inter', sans-serif", headingWeight: '700', headingLetterSpacing: -0.8, scaleRatio: 1.4, fontScale: 'xl' }
    },
    {
        id: 'jetbrains-preset',
        name: 'JetBrains Mono',
        description: 'Foco técnico e legibilidade de dados.',
        design: { headingFont: "'JetBrains Mono', monospace", bodyFont: "'JetBrains Mono', monospace", headingWeight: '700', headingLetterSpacing: 0, scaleRatio: 1.2, fontScale: 's' }
    },
    {
        id: 'bebas-preset',
        name: 'Bebas Neue',
        description: 'Impacto visual massivo para títulos.',
        design: { headingFont: "'Bebas Neue', sans-serif", bodyFont: "'Inter', sans-serif", headingWeight: '400', headingLetterSpacing: 1.5, scaleRatio: 1.6, fontScale: 'xl' }
    },
    {
        id: 'archivo-preset',
        name: 'Archivo',
        description: 'Neutralidade técnica e precisão industrial.',
        design: { headingFont: "'Archivo', sans-serif", bodyFont: "'Archivo', sans-serif", headingWeight: '700', headingLetterSpacing: -0.2, scaleRatio: 1.25, fontScale: 'm' }
    },
    {
        id: 'roboto-preset',
        name: 'Roboto',
        description: 'O clássico onipresente da web moderna.',
        design: { headingFont: "'Roboto', sans-serif", bodyFont: "'Roboto', sans-serif", headingWeight: '900', headingLetterSpacing: 0, scaleRatio: 1.2, fontScale: 'm' }
    },
    {
        id: 'unbounded-preset',
        name: 'Unbounded',
        description: 'Sofisticação geométrica de peso variável.',
        design: { headingFont: "'Unbounded', sans-serif", bodyFont: "'Inter', sans-serif", headingWeight: '900', headingLetterSpacing: -0.5, scaleRatio: 1.45, fontScale: 'xl' }
    },
    {
        id: 'syne-preset',
        name: 'Syne',
        description: 'Avant-garde e design de vanguarda.',
        design: { headingFont: "'Syne', sans-serif", bodyFont: "'Inter', sans-serif", headingWeight: '800', headingLetterSpacing: -0.8, scaleRatio: 1.4, fontScale: 'xl' }
    },
    {
        id: 'playfair-preset',
        name: 'Playfair Display',
        description: 'Elegância clássica e sofisticação editorial.',
        design: { headingFont: "'Playfair Display', serif", bodyFont: "'Inter', sans-serif", headingWeight: '700', headingLetterSpacing: 0, scaleRatio: 1.5, fontScale: 'xl' }
    },

    // --- GRUPO 2: ARREDONDADAS E SUAVES ---
    {
        id: 'outfit-preset',
        name: 'Outfit',
        description: 'Curvas suaves e estética amigável.',
        design: { headingFont: "'Outfit', sans-serif", bodyFont: "'Outfit', sans-serif", headingWeight: '800', headingLetterSpacing: -0.4, scaleRatio: 1.25, fontScale: 'm' }
    },
    {
        id: 'sora-preset',
        name: 'Sora',
        description: 'Inovação e clareza para interfaces digitais.',
        design: { headingFont: "'Sora', sans-serif", bodyFont: "'Sora', sans-serif", headingWeight: '800', headingLetterSpacing: -0.6, scaleRatio: 1.35, fontScale: 'l' }
    },
    {
        id: 'lexend-preset',
        name: 'Lexend',
        description: 'Otimizada para leitura e acessibilidade.',
        design: { headingFont: "'Lexend', sans-serif", bodyFont: "'Lexend', sans-serif", headingWeight: '700', headingLetterSpacing: -0.2, scaleRatio: 1.25, fontScale: 'm' }
    },
    {
        id: 'plus-jakarta-preset',
        name: 'Plus Jakarta Sans',
        description: 'Equilíbrio perfeito entre o orgânico e o técnico.',
        design: { headingFont: "'Plus Jakarta Sans', sans-serif", bodyFont: "'Plus Jakarta Sans', sans-serif", headingWeight: '800', headingLetterSpacing: -0.4, scaleRatio: 1.3, fontScale: 'l' }
    },
    {
        id: 'montserrat-preset',
        name: 'Montserrat',
        description: 'Energia urbana e versatilidade total.',
        design: { headingFont: "'Montserrat', sans-serif", bodyFont: "'Montserrat', sans-serif", headingWeight: '800', headingLetterSpacing: -0.2, scaleRatio: 1.3, fontScale: 'l' }
    },
    {
        id: 'fraunces-preset',
        name: 'Fraunces',
        description: 'Serifa expressiva com personalidade única.',
        design: { headingFont: "'Fraunces', serif", bodyFont: "'Inter', sans-serif", headingWeight: '900', headingLetterSpacing: 0, scaleRatio: 1.5, fontScale: 'xl' }
    },

    // --- GRUPO 3: CURSIVAS E MANUSCRITAS ---
    {
        id: 'dancing-script-preset',
        name: 'Dancing Script',
        description: 'Elegância fluida e toque artesanal.',
        design: { headingFont: "'Dancing Script', cursive", bodyFont: "'Inter', sans-serif", headingWeight: '700', headingLetterSpacing: 0, scaleRatio: 1.5, fontScale: 'xl' }
    },
    {
        id: 'pacifico-preset',
        name: 'Pacifico',
        description: 'Estética retro e caligrafia marcante.',
        design: { headingFont: "'Pacifico', cursive", bodyFont: "'Inter', sans-serif", headingWeight: '400', headingLetterSpacing: 0, scaleRatio: 1.6, fontScale: 'xl' }
    },
    {
        id: 'satisfy-preset',
        name: 'Satisfy',
        description: 'Sofisticação clássica em cada traço.',
        design: { headingFont: "'Satisfy', cursive", bodyFont: "'Inter', sans-serif", headingWeight: '400', headingLetterSpacing: 0, scaleRatio: 1.5, fontScale: 'xl' }
    },
    {
        id: 'caveat-preset',
        name: 'Caveat',
        description: 'Personalidade manuscrita e moderna.',
        design: { headingFont: "'Caveat', cursive", bodyFont: "'Inter', sans-serif", headingWeight: '700', headingLetterSpacing: 0, scaleRatio: 1.4, fontScale: 'xl' }
    }
];

export const THEME_FONTS = [
    // QUADRADAS (Square / Technical)
    { id: 'inter', name: 'Inter', value: "'Inter', sans-serif", category: 'SANS', weights: [400, 500, 600, 700, 800, 900], group: 'Quadrada' },
    { id: 'satoshi', name: 'Satoshi', value: "'Satoshi', sans-serif", category: 'SANS', weights: [300, 400, 500, 700, 900], group: 'Quadrada' },
    { id: 'cabinet', name: 'Cabinet Grotesk', value: "'Cabinet Grotesk', sans-serif", category: 'DISPLAY', weights: [400, 500, 700, 800, 900], group: 'Quadrada' },
    { id: 'space-grotesk', name: 'Space Grotesk', value: "'Space Grotesk', sans-serif", category: 'DISPLAY', weights: [300, 400, 500, 600, 700], group: 'Quadrada' },
    { id: 'jetbrains', name: 'JetBrains Mono', value: "'JetBrains Mono', monospace", category: 'MONO', weights: [400, 500, 700, 800], group: 'Quadrada' },
    { id: 'bebas', name: 'Bebas Neue', value: "'Bebas Neue', sans-serif", category: 'DISPLAY', weights: [400], group: 'Quadrada' },
    { id: 'archivo', name: 'Archivo', value: "'Archivo', sans-serif", category: 'SANS', weights: [400, 500, 600, 700], group: 'Quadrada' },
    { id: 'roboto', name: 'Roboto', value: "'Roboto', sans-serif", category: 'SANS', weights: [300, 400, 500, 700, 900], group: 'Quadrada' },
    { id: 'unbounded', name: 'Unbounded', value: "'Unbounded', sans-serif", category: 'DISPLAY', weights: [300, 400, 500, 600, 700, 800, 900], group: 'Quadrada' },
    { id: 'syne', name: 'Syne', value: "'Syne', sans-serif", category: 'DISPLAY', weights: [400, 500, 600, 700, 800], group: 'Quadrada' },
    { id: 'playfair', name: 'Playfair Display', value: "'Playfair Display', serif", category: 'SERIF', weights: [400, 500, 600, 700, 800, 900], group: 'Quadrada' },

    // ARREDONDADAS (Rounded / Soft)
    { id: 'outfit', name: 'Outfit', value: "'Outfit', sans-serif", category: 'SANS', weights: [300, 400, 500, 600, 700, 800, 900], group: 'Arredondada' },
    { id: 'sora', name: 'Sora', value: "'Sora', sans-serif", category: 'SANS', weights: [400, 500, 600, 700, 800], group: 'Arredondada' },
    { id: 'lexend', name: 'Lexend', value: "'Lexend', sans-serif", category: 'SANS', weights: [300, 400, 500, 600, 700, 800, 900], group: 'Arredondada' },
    { id: 'plus-jakarta', name: 'Plus Jakarta Sans', value: "'Plus Jakarta Sans', sans-serif", category: 'SANS', weights: [300, 400, 500, 600, 700, 800], group: 'Arredondada' },
    { id: 'montserrat', name: 'Montserrat', value: "'Montserrat', sans-serif", category: 'SANS', weights: [300, 400, 500, 600, 700, 800, 900], group: 'Arredondada' },
    { id: 'fraunces', name: 'Fraunces', value: "'Fraunces', serif", category: 'SERIF', weights: [300, 400, 500, 600, 700, 800, 900], group: 'Arredondada' },

    // CURSIVAS (Cursive / Script)
    { id: 'dancing-script', name: 'Dancing Script', value: "'Dancing Script', cursive", category: 'CURSIVE', weights: [400, 500, 600, 700], group: 'Cursiva' },
    { id: 'pacifico', name: 'Pacifico', value: "'Pacifico', cursive", category: 'CURSIVE', weights: [400], group: 'Cursiva' },
    { id: 'satisfy', name: 'Satisfy', value: "'Satisfy', cursive", category: 'CURSIVE', weights: [400], group: 'Cursiva' },
    { id: 'caveat', name: 'Caveat', value: "'Caveat', cursive", category: 'CURSIVE', weights: [400, 500, 600, 700], group: 'Cursiva' }
];
