import { ComponentSchema } from '../types';

/**
 * Mapeamento 100% Atômico: Tipografia & Escrita (v12.0)
 * Governa a hierarquia visual e legibilidade de todo o conteúdo textual.
 */
export const TypographySchema: ComponentSchema = {
    id: 'typography',
    label: 'Configuração de Fontes',
    pilar: 'typography',
    subcategory: 'Fontes',
    targetApp: 'typography',
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

        // --- H1: O IMPACTO MASTER ---
        {
            id: 'h1Size',
            label: 'Tamanho (H1)',
            category: 'H1: Configuração',
            type: 'slider',
            unit: 'px',
            constraints: { min: 20, max: 120 },
            defaultValue: 48,
            cssVars: ['--sarak-h1-size']
        },
        {
            id: 'h1Weight',
            label: 'Peso (H1)',
            category: 'H1: Configuração',
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
            defaultValue: '900',
            cssVars: ['--sarak-h1-weight']
        },
        {
            id: 'h1LineHeight',
            label: 'Altura da Linha (H1)',
            category: 'H1: Configuração',
            type: 'slider',
            constraints: { min: 0.8, max: 2, step: 0.05 },
            defaultValue: 1.1,
            cssVars: ['--sarak-h1-lh']
        },
        {
            id: 'h1LetterSpacing',
            label: 'Espaçamento (H1)',
            category: 'H1: Configuração',
            type: 'slider',
            unit: 'px',
            constraints: { min: -5, max: 10, step: 0.5 },
            defaultValue: -1,
            cssVars: ['--sarak-h1-ls']
        },

        // --- H2: O TÍTULO DE SEÇÃO ---
        {
            id: 'h2Size',
            label: 'Tamanho (H2)',
            category: 'H2: Configuração',
            type: 'slider',
            unit: 'px',
            constraints: { min: 18, max: 80 },
            defaultValue: 32,
            cssVars: ['--sarak-h2-size']
        },
        {
            id: 'h2Weight',
            label: 'Peso (H2)',
            category: 'H2: Configuração',
            type: 'select',
            constraints: {
                options: [
                    { id: '300', label: 'Light' },
                    { id: '400', label: 'Regular' },
                    { id: '600', label: 'Semi-Bold' },
                    { id: '700', label: 'Bold' }
                ]
            },
            defaultValue: '700',
            cssVars: ['--sarak-h2-weight']
        },
        {
            id: 'h2LineHeight',
            label: 'Altura da Linha (H2)',
            category: 'H2: Configuração',
            type: 'slider',
            constraints: { min: 0.8, max: 2, step: 0.05 },
            defaultValue: 1.2,
            cssVars: ['--sarak-h2-lh']
        },

        // --- CORPO & TEXTO ---
        {
            id: 'bodySize',
            label: 'Tamanho do Corpo',
            category: 'Corpo & Legibilidade',
            type: 'slider',
            unit: 'px',
            constraints: { min: 10, max: 24 },
            defaultValue: 14,
            cssVars: ['--sarak-body-size', '--theme-font-size-base']
        },
        {
            id: 'bodyLineHeight',
            label: 'Altura da Linha (Corpo)',
            category: 'Corpo & Legibilidade',
            type: 'slider',
            constraints: { min: 1, max: 2.5, step: 0.1 },
            defaultValue: 1.6,
            cssVars: ['--sarak-body-lh', '--sarak-line-height']
        },
        {
            id: 'bodyWeight',
            label: 'Peso do Corpo',
            category: 'Corpo & Legibilidade',
            type: 'select',
            constraints: {
                options: [
                    { id: '300', label: 'Light' },
                    { id: '400', label: 'Regular' },
                    { id: '500', label: 'Medium' }
                ]
            },
            defaultValue: '400',
            cssVars: ['--sarak-body-weight', '--sarak-b-weight']
        },

        // --- TRANSFORMAÇÃO & ESTÉTICA ---
        {
            id: 'headingTransform',
            label: 'Transformação de Títulos',
            category: 'Estética Global',
            type: 'select',
            constraints: {
                options: [
                    { id: 'none', label: 'Normal' },
                    { id: 'uppercase', label: 'UPPERCASE' },
                    { id: 'capitalize', label: 'Capitalize' }
                ]
            },
            defaultValue: 'none',
            cssVars: ['--sarak-h-transform']
        },
        {
            id: 'textSmoothing',
            label: 'Suavização (Smoothing)',
            category: 'Estética Global',
            type: 'boolean',
            defaultValue: true,
            cssVars: ['--sarak-text-smoothing']
        },
        {
            id: 'textGlowIntensity',
            label: 'Intensidade de Glow (H1)',
            category: 'Estética Global',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0,
            cssVars: ['--sarak-text-glow']
        }
    ]
};

