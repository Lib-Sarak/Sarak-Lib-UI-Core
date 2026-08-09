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
            description: 'Família tipográfica usada em títulos (H1/H2) — pode ser diferente da fonte do corpo para criar contraste hierárquico (ex. uma Display/Serif de impacto para títulos + Sans-Serif neutra para o corpo).',
            axis: 'texture',
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
            description: 'Família tipográfica usada no corpo de texto geral — deve priorizar legibilidade em blocos longos de texto acima de expressividade estética.',
            axis: 'texture',
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
            description: 'Família tipográfica monoespaçada usada para dados tabulares, código e valores numéricos — garante alinhamento vertical perfeito entre dígitos/caracteres.',
            axis: 'texture',
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
            description: 'Cor de texto padrão usada na maioria do conteúdo — deve ter o maior contraste possível contra o fundo, já que é a cor mais lida em toda a interface.',
            axis: 'color',
            defaultValue: '#ffffff',
            cssVars: ['--sarak-text-main', '--theme-title', '--theme-text-primary']
        },
        {
            id: 'textColorSecondary',
            label: 'Texto Secundário',
            type: 'color',
            description: 'Cor de texto de menor ênfase (ex. descrições, metadados) — contraste reduzido em relação a `textColorMaster` para criar hierarquia visual sem sacrificar legibilidade.',
            axis: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.7)',
            cssVars: ['--sarak-text-sec']
        },
        {
            id: 'textColorMuted',
            label: 'Texto Mudo / Hint',
            type: 'color',
            description: 'Cor de texto para dicas/placeholders/informação de menor importância — o nível mais baixo de contraste da escala de texto. Use com moderação para não comprometer acessibilidade (WCAG).',
            axis: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.4)',
            cssVars: ['--sarak-text-muted', '--theme-muted', '--theme-text-muted']
        },

        // --- H1: O IMPACTO MASTER ---
        {
            id: 'h1Size',
            label: 'Tamanho (H1)',
            type: 'slider',
            description: 'Tamanho da fonte do título de maior hierarquia (H1), em pixels, com valores independentes por breakpoint. É o elemento tipográfico mais impactante da tela — usado para o título principal de uma página/seção.',
            axis: 'density',
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
            description: 'Peso (espessura) da fonte do H1. Black/Bold dão máximo impacto visual (comum em hero sections); Light/Regular produzem um clima mais editorial/discreto.',
            axis: 'density',
            constraints: {
                options: [
                    { id: '300', label: 'Light' },
                    { id: '400', label: 'Regular' },
                    { id: '600', label: 'Semi-Bold' },
                    { id: '700', label: 'Bold' },
                    { id: '800', label: 'Extra-Bold' },
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
            description: 'Altura de linha do H1 (multiplicador do tamanho da fonte). Valores próximos de 1 deixam o título mais compacto/denso (comum em títulos grandes de uma única linha); valores maiores dão mais respiro entre linhas quando o título quebra.',
            axis: 'density',
            constraints: { min: 0.8, max: 2, step: 0.05 },
            defaultValue: 1.1,
            cssVars: ['--sarak-h1-lh']
        },
        {
            id: 'h1LetterSpacing',
            label: 'Espaçamento (H1)',
            type: 'slider',
            description: 'Espaçamento entre caracteres do H1, em pixels. Valores negativos (comum em títulos grandes/Black) aproximam as letras para um visual mais compacto/impactante; valores positivos as afastam.',
            axis: 'density',
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
            description: 'Tamanho da fonte de títulos de seção (H2), em pixels, com valores independentes por breakpoint — segundo nível da hierarquia tipográfica, abaixo do H1.',
            axis: 'density',
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
            description: 'Peso (espessura) da fonte do H2 — geralmente um passo abaixo do peso do H1 para reforçar a hierarquia entre os dois níveis de título.',
            axis: 'density',
            constraints: {
                options: [
                    { id: '300', label: 'Light' },
                    { id: '400', label: 'Regular' },
                    { id: '600', label: 'Semi-Bold' },
                    { id: '700', label: 'Bold' },
                    { id: '800', label: 'Extra-Bold' },
                    { id: '900', label: 'Black' }
                ]
            },
            defaultValue: '700',
            cssVars: ['--sarak-h2-weight']
        },
        {
            id: 'h2LineHeight',
            label: 'Altura da Linha (H2)',
            type: 'slider',
            description: 'Altura de linha do H2 (multiplicador do tamanho da fonte) — controla o respiro vertical de títulos de seção que quebram em múltiplas linhas.',
            axis: 'density',
            constraints: { min: 0.8, max: 2, step: 0.05 },
            defaultValue: 1.2,
            cssVars: ['--sarak-h2-lh']
        },
        {
            id: 'h3Size',
            label: 'Tamanho (H3)',
            type: 'slider',
            description: 'Tamanho da fonte de subtítulos (H3), em pixels — terceiro nível da hierarquia tipográfica, abaixo do H2. Reusa o peso de `h2Weight`.',
            axis: 'density',
            unit: 'px',
            constraints: { min: 14, max: 48 },
            defaultValue: 24,
            cssVars: ['--sarak-h3-size']
        },

        // --- CORPO & TEXTO ---

        {
            id: 'bodyLineHeight',
            label: 'Altura da Linha (Corpo)',
            type: 'slider',
            description: 'Altura de linha do texto de corpo (multiplicador do tamanho da fonte) — o fator mais importante para legibilidade de blocos longos de texto. Valores muito baixos (<1.3) dificultam a leitura de parágrafos.',
            axis: 'density',
            constraints: { min: 1, max: 2.5, step: 0.1 },
            defaultValue: 1.6,
            cssVars: ['--sarak-body-lh', '--sarak-line-height']
        },
        {
            id: 'bodyWeight',
            label: 'Peso do Corpo',
            type: 'select',
            description: 'Peso (espessura) da fonte do texto de corpo — Regular é o padrão universal de legibilidade; Medium dá um pouco mais de presença sem comprometer a leitura de parágrafos longos.',
            axis: 'density',
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
            description: 'Transformação de caixa aplicada aos títulos — UPPERCASE dá um clima mais técnico/institucional (comum em labels/eyebrows), Capitalize é mais editorial, Normal preserva a digitação original.',
            axis: 'texture',
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
            description: 'Liga/desliga o antialiasing de fonte (`-webkit-font-smoothing`) — mantenha ativo na maioria dos casos; só desative para depurar problemas de renderização de fonte em telas específicas.',
            defaultValue: true,
            cssVars: ['--sarak-text-smoothing']
        },
        {
            id: 'textGlowIntensity',
            label: 'Intensidade de Glow (H1)',
            type: 'slider',
            description: 'Intensidade de um brilho (text-shadow glow) aplicado ao H1 — 0 desativa o efeito; valores altos dão um clima neon/cyberpunk ao título principal. Use com moderação em temas mais sóbrios.',
            axis: 'elevation',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0,
            cssVars: ['--sarak-text-glow']
        },

        // --- MICRO TYPE-SCALE (Spec 26: rótulos, badges, legendas) ---
        {
            id: 'typeScaleMicro',
            label: 'Escala Micro (7px)',
            type: 'slider',
            description: 'Tamanho de fonte da escala tipográfica mais miúda do sistema (7px por padrão) — reservado para rótulos extremamente pequenos onde espaço é crítico (ex. tags densas). Use com cautela para não comprometer legibilidade/acessibilidade.',
            axis: 'density',
            unit: 'px',
            constraints: { min: 6, max: 10 },
            defaultValue: 7,
            cssVars: ['--sarak-type-scale-micro']
        },
        {
            id: 'typeScaleTiny',
            label: 'Escala Tiny (8px)',
            type: 'slider',
            description: 'Tamanho de fonte da escala "tiny" (8px por padrão) — usado em badges/legendas muito pequenas.',
            axis: 'density',
            unit: 'px',
            constraints: { min: 6, max: 12 },
            defaultValue: 8,
            cssVars: ['--sarak-type-scale-tiny']
        },
        {
            id: 'typeScale3xs',
            label: 'Escala 3XS (9px)',
            type: 'slider',
            description: 'Tamanho de fonte da escala "3XS" (9px por padrão) — degrau intermediário entre `typeScaleTiny` e `typeScale2xs` na micro-escala de rótulos/badges.',
            axis: 'density',
            unit: 'px',
            constraints: { min: 6, max: 12 },
            defaultValue: 9,
            cssVars: ['--sarak-type-scale3xs']
        },
        {
            id: 'typeScale2xs',
            label: 'Escala 2XS (10px)',
            type: 'slider',
            description: 'Tamanho de fonte da escala "2XS" (10px por padrão) — usado em rótulos pequenos e metadados secundários.',
            axis: 'density',
            unit: 'px',
            constraints: { min: 8, max: 14 },
            defaultValue: 10,
            cssVars: ['--sarak-type-scale2xs']
        },
        {
            id: 'typeScaleCaption',
            label: 'Escala Caption (12px)',
            type: 'slider',
            description: 'Tamanho de fonte da escala "caption" (12px por padrão) — usado em legendas de imagens, notas de rodapé e texto auxiliar.',
            axis: 'density',
            unit: 'px',
            constraints: { min: 10, max: 16 },
            defaultValue: 12,
            cssVars: ['--sarak-type-scale-caption']
        },
        {
            id: 'trackingTight',
            label: 'Tracking Tight (0.2em)',
            type: 'slider',
            description: 'Espaçamento entre caracteres (tracking) da escala "tight", em `em` — usado em textos maiúsculos pequenos onde é preciso alguma abertura sem exagerar (ex. labels de badge).',
            axis: 'density',
            unit: 'em',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.2,
            cssVars: ['--sarak-tracking-tight']
        },
        {
            id: 'trackingSnug',
            label: 'Tracking Snug (0.25em)',
            type: 'slider',
            description: 'Espaçamento entre caracteres (tracking) da escala "snug", em `em` — um degrau acima de `trackingTight` na progressão de tracking usada em textos maiúsculos pequenos.',
            axis: 'density',
            unit: 'em',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.25,
            cssVars: ['--sarak-tracking-snug']
        },
        {
            id: 'trackingWide',
            label: 'Tracking Wide (0.3em)',
            type: 'slider',
            description: 'Espaçamento entre caracteres (tracking) da escala "wide", em `em` — dá um clima mais editorial/label a textos maiúsculos curtos (ex. eyebrows, tags de categoria).',
            axis: 'density',
            unit: 'em',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.3,
            cssVars: ['--sarak-tracking-wide']
        },
        {
            id: 'trackingWider',
            label: 'Tracking Wider (0.4em)',
            type: 'slider',
            description: 'Espaçamento entre caracteres (tracking) da escala "wider", em `em` — mais espaçado que `trackingWide`, para textos maiúsculos curtos que precisam de bastante destaque/respiro.',
            axis: 'density',
            unit: 'em',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.4,
            cssVars: ['--sarak-tracking-wider']
        },
        {
            id: 'trackingWidest',
            label: 'Tracking Widest (0.5em)',
            type: 'slider',
            description: 'Espaçamento entre caracteres (tracking) da escala "widest", em `em` — o mais espaçado da progressão comum, usado só em textos muito curtos (1-2 palavras) por questão de legibilidade.',
            axis: 'density',
            unit: 'em',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.5,
            cssVars: ['--sarak-tracking-widest']
        },
        {
            id: 'trackingUltra',
            label: 'Tracking Ultra (0.8em)',
            type: 'slider',
            description: 'Espaçamento entre caracteres (tracking) extremo, em `em` — reservado para efeitos tipográficos muito específicos (ex. uma única palavra/sigla espaçada como elemento decorativo).',
            axis: 'density',
            unit: 'em',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.8,
            cssVars: ['--sarak-tracking-ultra']
        },

        // --- EXTENSÃO DA MICRO TYPE-SCALE (Spec 28: features/DesignEngine) ---
        {
            id: 'trackingSubtle',
            label: 'Tracking Subtle (0.1em)',
            type: 'slider',
            description: 'Espaçamento entre caracteres (tracking) mais discreto da escala, em `em` — abertura sutil, quase imperceptível, para textos que precisam de só um leve refinamento.',
            axis: 'density',
            unit: 'em',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.1,
            cssVars: ['--sarak-tracking-subtle']
        },
        {
            id: 'typeScaleXs',
            label: 'Escala XS (11px)',
            type: 'slider',
            description: 'Tamanho de fonte da escala "XS" (11px por padrão) — degrau entre `typeScaleCaption` e o tamanho base do corpo.',
            axis: 'density',
            unit: 'px',
            constraints: { min: 8, max: 14 },
            defaultValue: 11,
            cssVars: ['--sarak-type-scale-xs']
        },
        {
            id: 'typeScaleXl',
            label: 'Escala XL (20px)',
            type: 'slider',
            description: 'Tamanho de fonte da escala "XL" (20px por padrão) — usado em texto de destaque que não chega a ser um título (ex. lead paragraph, subtítulo de card).',
            axis: 'density',
            unit: 'px',
            constraints: { min: 14, max: 28 },
            defaultValue: 20,
            cssVars: ['--sarak-type-scale-xl']
        },
        {
            id: 'typeScaleDisplay',
            label: 'Escala Display (10rem)',
            type: 'slider',
            description: 'Tamanho de fonte "display", em `rem` — o maior da escala tipográfica, reservado para números/palavras de impacto extremo (ex. um contador gigante, hero numérico).',
            axis: 'density',
            unit: 'rem',
            constraints: { min: 4, max: 16, step: 0.5 },
            defaultValue: 10,
            cssVars: ['--sarak-type-scale-display']
        }
    ]
};

