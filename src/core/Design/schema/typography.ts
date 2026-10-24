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
    { value: "'Chakra Petch', sans-serif", name: "Chakra Petch", category: "Sans-Serif" },
    { value: "'Nunito', sans-serif", name: "Nunito", category: "Sans-Serif" },
    { value: "'DM Sans', sans-serif", name: "DM Sans", category: "Sans-Serif" },
    { value: "'Manrope', sans-serif", name: "Manrope", category: "Sans-Serif" },
    { value: "'Work Sans', sans-serif", name: "Work Sans", category: "Sans-Serif" },
    { value: "'Open Sans', sans-serif", name: "Open Sans", category: "Sans-Serif" },
    { value: "'Raleway', sans-serif", name: "Raleway", category: "Sans-Serif" },
    { value: "'Source Sans 3', sans-serif", name: "Source Sans 3", category: "Sans-Serif" },
    { value: "'Poppins', sans-serif", name: "Poppins", category: "Sans-Serif" },
    { value: "'Lato', sans-serif", name: "Lato", category: "Sans-Serif" },
    { value: "system-ui, -apple-system, sans-serif", name: "System Default", category: "Sans-Serif" },

    // Display & Impact
    { value: "'Unbounded', display", name: "Unbounded", category: "Display" },
    { value: "'Bebas Neue', display", name: "Bebas Neue", category: "Display" },
    { value: "'Orbitron', sans-serif", name: "Orbitron", category: "Display" },
    { value: "'VT323', monospace", name: "VT323", category: "Display" },
    { value: "'Oswald', sans-serif", name: "Oswald", category: "Display" },

    // Serifadas
    { value: "'Playfair Display', serif", name: "Playfair Display", category: "Serif" },
    { value: "'Fraunces', serif", name: "Fraunces", category: "Serif" },
    { value: "'Source Serif 4', serif", name: "Source Serif 4", category: "Serif" },
    { value: "'Roboto Slab', serif", name: "Roboto Slab", category: "Serif" },
    { value: "'Lora', serif", name: "Lora", category: "Serif" },
    { value: "'Merriweather', serif", name: "Merriweather", category: "Serif" },
    { value: "'PT Serif', serif", name: "PT Serif", category: "Serif" },

    // Script & Handwriting
    { value: "'Dancing Script', cursive", name: "Dancing Script", category: "Handwriting" },
    { value: "'Pacifico', cursive", name: "Pacifico", category: "Handwriting" },
    { value: "'Satisfy', cursive", name: "Satisfy", category: "Handwriting" },
    { value: "'Caveat', cursive", name: "Caveat", category: "Handwriting" },
    { value: "'Patrick Hand', cursive", name: "Patrick Hand", category: "Handwriting" },

    // Monospaced
    { value: "'JetBrains Mono', monospace", name: "JetBrains Mono", category: "Monospace" },
    { value: "'Fira Code', monospace", name: "Fira Code", category: "Monospace" },
    { value: "'IBM Plex Mono', monospace", name: "IBM Plex Mono", category: "Monospace" },
    { value: "'Space Mono', monospace", name: "Space Mono", category: "Monospace" }
];

export const FONT_OPTIONS = THEME_FONTS.map(font => ({
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
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Aplica a família escolhida aos cabeçalhos HTML h1–h6 e às variantes h1, h2 e h3 de SarakTypography; permite criar contraste com a fonte do corpo.",
            label: 'Fonte de Títulos',
            type: 'font',
            description: 'Família tipográfica usada nos cabeçalhos HTML h1–h6 e nas variantes h1/h2/h3 de SarakTypography — pode diferir da fonte do corpo para criar contraste hierárquico (ex.: uma Display/Serif de impacto para cabeçalhos + Sans-Serif neutra para o corpo).',
            axis: 'texture',
            constraints: {
                options: FONT_OPTIONS
            },
            defaultValue: "'Outfit', sans-serif",
            cssVars: ['--font-heading', '--sarak-font-h']
        },
        {
            id: 'bodyFont',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Aplica a família tipográfica aos parágrafos, rótulos e demais textos corridos.",
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
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Aplica a família monoespaçada a valores tabulares e trechos de código.",
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
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Colore o texto principal de parágrafos e rótulos; títulos, subtítulos e ênfases usam titleColor, subtitleColor e emphasisColor.",
            label: 'Texto Principal',
            type: 'color',
            description: 'Cor de texto padrão do conteúdo — parágrafos, rótulos e a maior parte do que se lê; deve ter o maior contraste possível contra o fundo. Os títulos e cabeçalhos usam `titleColor`.',
            axis: 'color',
            defaultValue: '#f2f6fb',
            cssVars: ['--sarak-text-main', '--theme-text-primary']
        },
        {
            id: 'textColorSecondary',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Colore textos secundários, como descrições e metadados, para reduzir a ênfase sem os ocultar.",
            label: 'Texto Secundário',
            type: 'color',
            description: 'Cor de texto de menor ênfase (ex. descrições, metadados) — contraste reduzido em relação a `textColorMaster` para criar hierarquia visual sem sacrificar legibilidade.',
            axis: 'color',
            defaultValue: 'rgba(242, 246, 251, 0.72)',
            cssVars: ['--sarak-text-sec']
        },
        {
            id: 'textColorMuted',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Colore dicas e placeholders; o contraste mais baixo da escala aparece em campos e textos auxiliares.",
            label: 'Texto Mudo / Hint',
            type: 'color',
            description: 'Cor de texto para dicas/placeholders/informação de menor importância — o nível mais baixo de contraste da escala de texto. Use com moderação para não comprometer acessibilidade (WCAG).',
            axis: 'color',
            defaultValue: 'rgba(242, 246, 251, 0.55)',
            cssVars: ['--sarak-text-muted', '--theme-muted', '--theme-text-muted']
        },

        // --- H1: O IMPACTO MASTER ---
        {
            id: 'h1Size',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Define o tamanho do título H1 em cada breakpoint; valores muito grandes podem quebrar linhas ou ocupar a tela.",
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
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Controla a espessura do título H1 e o peso visual do cabeçalho principal.",
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
            defaultValue: '800',
            cssVars: ['--sarak-h1-weight']
        },
        {
            id: 'h1LineHeight',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Controla o espaço entre linhas do H1; valores baixos comprimem títulos quebrados.",
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
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Aproxima ou afasta os caracteres do H1; valores negativos compactam o título.",
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
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Define o tamanho dos títulos de seção H2 em cada breakpoint.",
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
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Controla a espessura dos títulos H2 e sua hierarquia em relação ao H1.",
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
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Controla o espaço entre linhas dos títulos H2 quando ocupam mais de uma linha.",
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
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Define o tamanho dos subtítulos H3; eles reutilizam o peso configurado para H2.",
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
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Controla o espaço entre linhas dos parágrafos e afeta a leitura de blocos longos.",
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
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Controla a espessura do texto corrido sem mudar o tamanho da fonte.",
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
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Converte a caixa dos títulos em maiúscula, capitalizada ou preserva a digitação original.",
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
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Alterna o antialiasing tipográfico aplicado à página; desligado, o navegador usa a suavização padrão.",
            label: 'Suavização (Smoothing)',
            type: 'boolean',
            description: 'Liga/desliga o antialiasing de fonte (`-webkit-font-smoothing`) — mantenha ativo na maioria dos casos; só desative para depurar problemas de renderização de fonte em telas específicas.',
            defaultValue: true,
            cssVars: ['--sarak-text-smoothing']
        },
        {
            id: 'textGlowIntensity',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Adiciona brilho ao H1 na cor primária; zero remove o efeito.",
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
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Define a menor escala tipográfica legível, usada em rótulos densos; mantenha no mínimo 11px.",
            label: 'Escala Micro',
            type: 'slider',
            description: 'Tamanho de fonte da menor escala tipográfica do sistema (11px por padrão), usada em rótulos densos sem descer do mínimo legível.',
            axis: 'density',
            unit: 'px',
            constraints: { min: 11, max: 14 },
            defaultValue: 11,
            cssVars: ['--sarak-type-scale-micro']
        },
        {
            id: 'typeScaleTiny',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Define o tamanho mínimo de textos usados em badges e legendas; mantenha no mínimo 11px.",
            label: 'Escala Tiny',
            type: 'slider',
            description: 'Tamanho da escala "tiny" (11px por padrão), usada em badges e legendas compactos.',
            axis: 'density',
            unit: 'px',
            constraints: { min: 11, max: 14 },
            defaultValue: 11,
            cssVars: ['--sarak-type-scale-tiny']
        },
        {
            id: 'typeScale3xs',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Define o degrau 3XS usado em rótulos compactos de cartões e indicadores; mantenha no mínimo 11px.",
            label: 'Escala 3XS',
            type: 'slider',
            description: 'Tamanho da escala "3XS" (11px por padrão) — degrau intermediário entre `typeScaleTiny` e `typeScale2xs` na escala de rótulos e badges.',
            axis: 'density',
            unit: 'px',
            constraints: { min: 11, max: 14 },
            defaultValue: 11,
            cssVars: ['--sarak-type-scale3xs']
        },
        {
            id: 'typeScale2xs',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Define o tamanho de metadados e rótulos compactos; mantenha no mínimo 11px.",
            label: 'Escala 2XS',
            type: 'slider',
            description: 'Tamanho da escala "2XS" (11px por padrão), usada em rótulos pequenos e metadados secundários.',
            axis: 'density',
            unit: 'px',
            constraints: { min: 11, max: 14 },
            defaultValue: 11,
            cssVars: ['--sarak-type-scale2xs']
        },
        {
            id: 'typeScaleCaption',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Define o tamanho de legendas, notas e texto auxiliar.",
            label: 'Escala Caption',
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
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Controla o espaçamento de caracteres em rótulos pequenos e textos curtos em caixa alta.",
            label: 'Tracking Tight',
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
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Controla o espaçamento de caracteres em textos curtos, um passo acima de trackingTight.",
            label: 'Tracking Snug',
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
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Controla o espaçamento de textos curtos de categoria e de mensagens auxiliares.",
            label: 'Tracking Wide',
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
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Amplia o espaçamento de textos curtos que precisam de mais abertura que trackingWide.",
            label: 'Tracking Wider',
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
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Aplica o espaçamento mais aberto da escala comum em rótulos de poucas palavras.",
            label: 'Tracking Widest',
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
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Espaça fortemente o título do estado vazio; valores altos separam as letras.",
            label: 'Tracking Ultra',
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
            id: 'typeScaleXs',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Define o tamanho XS usado por rótulos de eixo e valores pequenos dos gráficos.",
            label: 'Escala XS',
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
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Define o tamanho XL para texto de destaque, como o campo de busca e títulos auxiliares.",
            label: 'Escala XL',
            type: 'slider',
            description: 'Tamanho de fonte da escala "XL" (20px por padrão) — usado em texto de destaque que não chega a ser um título (ex. lead paragraph, subtítulo de card).',
            axis: 'density',
            unit: 'px',
            constraints: { min: 14, max: 28 },
            defaultValue: 20,
            cssVars: ['--sarak-type-scale-xl']
        }
    ]
};

