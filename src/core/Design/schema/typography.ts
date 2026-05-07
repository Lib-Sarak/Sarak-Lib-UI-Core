import { ComponentSchema } from '../types';

/**
 * Mapeamento 100% Atômico: Tipografia & Escrita (v12.0)
 * Governa a hierarquia visual e legibilidade de todo o conteúdo textual.
 */
export const TypographySchema: ComponentSchema = {
    id: 'typography',
    label: 'Tipografia & Escrita',
    pilar: 'visual',
    tokens: [
        // --- FAMÍLIAS DE FONTES ---
        {
            id: 'headingFont',
            label: 'Fonte de Títulos',
            category: 'Famílias',
            type: 'font',
            constraints: {
                options: [
                    { id: "'Inter', sans-serif", label: 'Inter (Industrial)' },
                    { id: "'Outfit', sans-serif", label: 'Outfit (Modern)' },
                    { id: "'Syne', sans-serif", label: 'Syne (Avant-Garde)' },
                    { id: "'JetBrains Mono', monospace", label: 'JetBrains Mono (Tech)' },
                    { id: "'Montserrat', sans-serif", label: 'Montserrat (Classic)' },
                    { id: "'Space Grotesk', sans-serif", label: 'Space Grotesk (Sci-Fi)' },
                    { id: "'Archivo', sans-serif", label: 'Archivo (Neutral)' },
                    { id: "'Bebas Neue', sans-serif", label: 'Bebas Neue (Impact)' }
                ]
            },
            defaultValue: "'Outfit', sans-serif",
            cssVars: ['--font-heading', '--sarak-font-h']
        },
        {
            id: 'bodyFont',
            label: 'Fonte de Corpo',
            category: 'Famílias',
            type: 'font',
            constraints: {
                options: [
                    { id: "'Inter', sans-serif", label: 'Inter (Industrial)' },
                    { id: "'Outfit', sans-serif", label: 'Outfit (Modern)' },
                    { id: "'Syne', sans-serif", label: 'Syne (Avant-Garde)' },
                    { id: "'JetBrains Mono', monospace", label: 'JetBrains Mono (Tech)' },
                    { id: "'Montserrat', sans-serif", label: 'Montserrat (Classic)' },
                    { id: "'Space Grotesk', sans-serif", label: 'Space Grotesk (Sci-Fi)' },
                    { id: "'Archivo', sans-serif", label: 'Archivo (Neutral)' },
                    { id: "'Bebas Neue', sans-serif", label: 'Bebas Neue (Impact)' }
                ]
            },
            defaultValue: "'Inter', sans-serif",
            cssVars: ['--font-main', '--sarak-font-b']
        },
        {
            id: 'monoFont',
            label: 'Fonte Mono (Dados)',
            category: 'Famílias',
            type: 'font',
            constraints: {
                options: [
                    { id: "'Inter', sans-serif", label: 'Inter (Industrial)' },
                    { id: "'Outfit', sans-serif", label: 'Outfit (Modern)' },
                    { id: "'Syne', sans-serif", label: 'Syne (Avant-Garde)' },
                    { id: "'JetBrains Mono', monospace", label: 'JetBrains Mono (Tech)' },
                    { id: "'Montserrat', sans-serif", label: 'Montserrat (Classic)' },
                    { id: "'Space Grotesk', sans-serif", label: 'Space Grotesk (Sci-Fi)' },
                    { id: "'Archivo', sans-serif", label: 'Archivo (Neutral)' },
                    { id: "'Bebas Neue', sans-serif", label: 'Bebas Neue (Impact)' }
                ]
            },
            defaultValue: "'JetBrains Mono', monospace",
            cssVars: ['--font-mono', '--sarak-font-m']
        },

        // --- CORES DE TEXTO ---
        {
            id: 'textColorMaster',
            label: 'Texto Principal',
            category: 'Cores de Texto',
            type: 'color',
            defaultValue: '#ffffff',
            cssVars: ['--sarak-text-main', '--theme-title', '--theme-text-primary']
        },
        {
            id: 'textColorSecondary',
            label: 'Texto Secundário',
            category: 'Cores de Texto',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.7)',
            cssVars: ['--sarak-text-sec']
        },
        {
            id: 'textColorMuted',
            label: 'Texto Mudo / Hint',
            category: 'Cores de Texto',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.4)',
            cssVars: ['--sarak-text-muted', '--theme-muted', '--theme-text-muted']
        },

        // --- ESCALA DE TAMANHOS ---
        {
            id: 'h1Size',
            label: 'Tamanho H1',
            category: 'Escala: Títulos',
            type: 'slider',
            unit: 'px',
            constraints: { min: 20, max: 80 },
            defaultValue: 32,
            cssVars: ['--sarak-h1-size']
        },
        {
            id: 'h2Size',
            label: 'Tamanho H2',
            category: 'Escala: Títulos',
            type: 'slider',
            unit: 'px',
            constraints: { min: 18, max: 60 },
            defaultValue: 24,
            cssVars: ['--sarak-h2-size']
        },
        {
            id: 'h3Size',
            label: 'Tamanho H3',
            category: 'Escala: Títulos',
            type: 'slider',
            unit: 'px',
            constraints: { min: 16, max: 48 },
            defaultValue: 20,
            cssVars: ['--sarak-h3-size']
        },
        {
            id: 'h4Size',
            label: 'Tamanho H4',
            category: 'Escala: Títulos',
            type: 'slider',
            unit: 'px',
            constraints: { min: 14, max: 32 },
            defaultValue: 18,
            cssVars: ['--sarak-h4-size']
        },
        {
            id: 'h5Size',
            label: 'Tamanho H5',
            category: 'Escala: Títulos',
            type: 'slider',
            unit: 'px',
            constraints: { min: 12, max: 24 },
            defaultValue: 16,
            cssVars: ['--sarak-h5-size']
        },
        {
            id: 'h6Size',
            label: 'Tamanho H6',
            category: 'Escala: Títulos',
            type: 'slider',
            unit: 'px',
            constraints: { min: 10, max: 20 },
            defaultValue: 14,
            cssVars: ['--sarak-h6-size']
        },
        {
            id: 'bodySize',
            label: 'Tamanho Corpo (Padrão)',
            category: 'Escala: Corpo',
            type: 'slider',
            unit: 'px',
            constraints: { min: 10, max: 24 },
            defaultValue: 14,
            cssVars: ['--sarak-body-size']
        },
        {
            id: 'letterSpacingBody',
            label: 'Espaçamento (Corpo)',
            category: 'Legibilidade',
            type: 'slider',
            unit: 'px',
            constraints: { min: -1, max: 4, step: 0.1 },
            defaultValue: 0,
            cssVars: ['--sarak-b-spacing']
        },

        // --- LEGIBILIDADE & ESTILO ---
        {
            id: 'lineHeightBase',
            label: 'Altura da Linha (Corpo)',
            category: 'Legibilidade',
            type: 'slider',
            constraints: { min: 1, max: 2, step: 0.1 },
            defaultValue: 1.5,
            cssVars: ['--sarak-line-height']
        },
        {
            id: 'letterSpacingHeading',
            label: 'Espaçamento (Títulos)',
            category: 'Legibilidade',
            type: 'slider',
            unit: 'px',
            constraints: { min: -2, max: 10, step: 0.5 },
            defaultValue: 0,
            cssVars: ['--letter-spacing-heading', '--sarak-h-spacing']
        },
        {
            id: 'headingWeight',
            label: 'Peso dos Títulos',
            category: 'Legibilidade',
            type: 'select',
            constraints: {
                options: [
                    { id: '300', label: 'Light' },
                    { id: '400', label: 'Regular' },
                    { id: '600', label: 'Semi-Bold' },
                    { id: '700', label: 'Bold' },
                    { id: '900', label: 'Black' }
                ]
            },
            defaultValue: '700',
            cssVars: ['--sarak-h-weight']
        },
        {
            id: 'bodyWeight',
            label: 'Peso do Corpo',
            category: 'Legibilidade',
            type: 'select',
            constraints: {
                options: [
                    { id: '300', label: 'Light' },
                    { id: '400', label: 'Regular' },
                    { id: '600', label: 'Semi-Bold' }
                ]
            },
            defaultValue: '400',
            cssVars: ['--sarak-b-weight']
        },
        {
            id: 'textSmoothing',
            label: 'Suavização (Smoothing)',
            category: 'Legibilidade',
            type: 'boolean',
            defaultValue: true,
            cssVars: ['--sarak-text-smoothing']
        },
        {
            id: 'textGlowIntensity',
            label: 'Brilho de Título (Neon)',
            category: 'Estética',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0,
            cssVars: ['--sarak-text-glow']
        }
    ]
};

