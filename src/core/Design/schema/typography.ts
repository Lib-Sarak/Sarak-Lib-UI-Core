import { ComponentSchema } from '../types';
export const THEME_FONTS = [
    // Sans-Serif & Grotesk
    { value: "'Inter', sans-serif", name: "Inter", category: "Sans-Serif" },
    { value: "'Outfit', sans-serif", name: "Outfit", category: "Sans-Serif" },
    { value: "'Roboto', sans-serif", name: "Roboto", category: "Sans-Serif" },
    { value: "'Montserrat', sans-serif", name: "Montserrat", category: "Sans-Serif" },
    { value: "'Space Grotesk', sans-serif", name: "Space Grotesk", category: "Sans-Serif" },
    { value: "'Plus Jakarta Sans', sans-serif", name: "Plus Jakarta Sans", category: "Sans-Serif" },
    { value: "'Lexend', sans-serif", name: "Lexend", category: "Sans-Serif" },
    { value: "'Sora', sans-serif", name: "Sora", category: "Sans-Serif" },
    { value: "'Syne', sans-serif", name: "Syne", category: "Sans-Serif" },
    { value: "'Archivo', sans-serif", name: "Archivo", category: "Sans-Serif" },
    { value: "system-ui, -apple-system, sans-serif", name: "System Default", category: "Sans-Serif" },
    
    // Display & Impact
    { value: "'Unbounded', display", name: "Unbounded", category: "Display" },
    { value: "'Bebas Neue', display", name: "Bebas Neue", category: "Display" },
    
    // Serifadas
    { value: "'Playfair Display', serif", name: "Playfair Display", category: "Serif" },
    { value: "'Fraunces', serif", name: "Fraunces", category: "Serif" },

    // Script & Handwriting
    { value: "'Dancing Script', cursive", name: "Dancing Script", category: "Handwriting" },
    { value: "'Pacifico', cursive", name: "Pacifico", category: "Handwriting" },
    { value: "'Satisfy', cursive", name: "Satisfy", category: "Handwriting" },
    { value: "'Caveat', cursive", name: "Caveat", category: "Handwriting" },

    // Monospaced
    { value: "'JetBrains Mono', monospace", name: "JetBrains Mono", category: "Monospace" }
];

const FONT_OPTIONS = THEME_FONTS.map(font => ({
    id: font.value,
    label: `${font.name} [${font.category}]`
}));

export const TypographySchema: ComponentSchema = {
    id: 'typography',
    label: 'Tipografia e Escala',
    tokens: [
        // --- FAMÍLIAS DE FONTES ---
        {
            id: 'headingFont',
            label: 'Fonte de Títulos',
            type: 'font',
            constraints: {
                options: FONT_OPTIONS
            },
            defaultValue: "'Outfit', sans-serif",
            cssVars: ['--font-heading', '--sarak-font-h']
        },
        {
            id: 'bodyFont',
            label: 'Fonte de Corpo',
            type: 'font',
            constraints: {
                options: FONT_OPTIONS
            },
            defaultValue: "'Inter', sans-serif",
            cssVars: ['--font-main', '--sarak-font-b']
        },
        {
            id: 'monoFont',
            label: 'Fonte Mono (Dados)',
            type: 'font',
            constraints: {
                options: FONT_OPTIONS
            },
            defaultValue: "'JetBrains Mono', monospace",
            cssVars: ['--font-mono', '--sarak-font-m']
        },

        // --- CORES DE TEXTO ---
        {
            id: 'textColorMaster',
            label: 'Texto Principal',
            type: 'color',
            defaultValue: '#ffffff',
            cssVars: ['--sarak-text-main', '--theme-title', '--theme-text-primary']
        },
        {
            id: 'textColorSecondary',
            label: 'Texto Secundário',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.7)',
            cssVars: ['--sarak-text-sec']
        },
        {
            id: 'textColorMuted',
            label: 'Texto Mudo / Hint',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.4)',
            cssVars: ['--sarak-text-muted', '--theme-muted', '--theme-text-muted']
        },

        // --- H1: O IMPACTO MASTER ---
        {
            id: 'h1Size',
            label: 'Tamanho (H1)',
            type: 'slider',
            isResponsive: true, // FLAG DE RESPONSIVIDADE!
            unit: 'px',
            constraints: { min: 20, max: 120 },
            // Valores ideais matemáticos já predefinidos por dispositivo!
            defaultValue: { mob: 32, tab: 40, desk: 48 },
            cssVars: ['--sarak-h1-size']
        },
        {
            id: 'h1Weight',
            label: 'Peso (H1)',
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
            type: 'slider',
            constraints: { min: 0.8, max: 2, step: 0.05 },
            defaultValue: 1.1,
            cssVars: ['--sarak-h1-lh']
        },
        {
            id: 'h1LetterSpacing',
            label: 'Espaçamento (H1)',
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
            type: 'slider',
            isResponsive: true, // FLAG DE RESPONSIVIDADE!
            unit: 'px',
            constraints: { min: 18, max: 80 },
            // Valores ideais matemáticos já predefinidos por dispositivo!
            defaultValue: { mob: 24, tab: 28, desk: 32 },
            cssVars: ['--sarak-h2-size']
        },
        {
            id: 'h2Weight',
            label: 'Peso (H2)',
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
            type: 'slider',
            constraints: { min: 0.8, max: 2, step: 0.05 },
            defaultValue: 1.2,
            cssVars: ['--sarak-h2-lh']
        },

        // --- CORPO & TEXTO ---

        {
            id: 'bodyLineHeight',
            label: 'Altura da Linha (Corpo)',
            type: 'slider',
            constraints: { min: 1, max: 2.5, step: 0.1 },
            defaultValue: 1.6,
            cssVars: ['--sarak-body-lh', '--sarak-line-height']
        },
        {
            id: 'bodyWeight',
            label: 'Peso do Corpo',
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
            type: 'boolean',
            defaultValue: true,
            cssVars: ['--sarak-text-smoothing']
        },
        {
            id: 'textGlowIntensity',
            label: 'Intensidade de Glow (H1)',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0,
            cssVars: ['--sarak-text-glow']
        },

        // --- MICRO TYPE-SCALE (Spec 26: rótulos, badges, legendas) ---
        {
            id: 'typeScaleMicro',
            label: 'Escala Micro (7px)',
            type: 'slider',
            unit: 'px',
            constraints: { min: 6, max: 10 },
            defaultValue: 7,
            cssVars: ['--sarak-type-scale-micro']
        },
        {
            id: 'typeScaleTiny',
            label: 'Escala Tiny (8px)',
            type: 'slider',
            unit: 'px',
            constraints: { min: 6, max: 12 },
            defaultValue: 8,
            cssVars: ['--sarak-type-scale-tiny']
        },
        {
            id: 'typeScale3xs',
            label: 'Escala 3XS (9px)',
            type: 'slider',
            unit: 'px',
            constraints: { min: 6, max: 12 },
            defaultValue: 9,
            cssVars: ['--sarak-type-scale3xs']
        },
        {
            id: 'typeScale2xs',
            label: 'Escala 2XS (10px)',
            type: 'slider',
            unit: 'px',
            constraints: { min: 8, max: 14 },
            defaultValue: 10,
            cssVars: ['--sarak-type-scale2xs']
        },
        {
            id: 'typeScaleCaption',
            label: 'Escala Caption (12px)',
            type: 'slider',
            unit: 'px',
            constraints: { min: 10, max: 16 },
            defaultValue: 12,
            cssVars: ['--sarak-type-scale-caption']
        },
        {
            id: 'trackingTight',
            label: 'Tracking Tight (0.2em)',
            type: 'slider',
            unit: 'em',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.2,
            cssVars: ['--sarak-tracking-tight']
        },
        {
            id: 'trackingSnug',
            label: 'Tracking Snug (0.25em)',
            type: 'slider',
            unit: 'em',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.25,
            cssVars: ['--sarak-tracking-snug']
        },
        {
            id: 'trackingWide',
            label: 'Tracking Wide (0.3em)',
            type: 'slider',
            unit: 'em',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.3,
            cssVars: ['--sarak-tracking-wide']
        },
        {
            id: 'trackingWider',
            label: 'Tracking Wider (0.4em)',
            type: 'slider',
            unit: 'em',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.4,
            cssVars: ['--sarak-tracking-wider']
        },
        {
            id: 'trackingWidest',
            label: 'Tracking Widest (0.5em)',
            type: 'slider',
            unit: 'em',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.5,
            cssVars: ['--sarak-tracking-widest']
        },
        {
            id: 'trackingUltra',
            label: 'Tracking Ultra (0.8em)',
            type: 'slider',
            unit: 'em',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.8,
            cssVars: ['--sarak-tracking-ultra']
        }
    ]
};

