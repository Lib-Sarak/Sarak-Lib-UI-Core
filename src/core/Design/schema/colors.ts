import { ComponentSchema } from '../types';

/**
 * SCHEMA: PALETAS & CORES
 * Gerencia a linguagem cromática e cores semânticas do sistema.
 */
export const ColorsSchema: ComponentSchema = {
    id: 'colors',
    label: 'Paletas e Gradientes',
    tokens: [
        {
            id: 'primaryColor',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Define a cor de marca principal usada em links, focos, estados ativos e variantes derivadas; confirme o contraste onde ela aparece como texto nos dois modos. O fundo do botão primário é `btnPrimaryBg`.",
            label: 'Cor Primária (Base)',
            type: 'color',
            description: 'Cor de marca principal do sistema — links, anel de foco, estados ativos e elementos de destaque, e a base das variantes automáticas (`generateVariants: true`). O fundo do botão primário é `btnPrimaryBg` (que costuma repetir esta cor), não este token. É a cor mais impactante na identidade visual.',
            axis: 'color',
            defaultValue: '#19e3f0',
            generateVariants: true,
            cssVars: ['--primary-color', '--theme-primary', '--sarak-primary-color', '--sarak-color-primary']
        },
        {
            id: 'secondaryColor',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Define a segunda cor de marca usada em elementos de apoio e séries dos gráficos.",
            label: 'Cor Secundária',
            type: 'color',
            description: 'Segunda cor de marca, usada para complementar a primária em elementos de menor ênfase ou para criar contraste em gradientes/composições multicoloridas.',
            axis: 'color',
            defaultValue: '#7c5cff',
            generateVariants: true,
            cssVars: ['--secondary-color', '--theme-secondary', '--sarak-secondary-color', '--sarak-color-secondary']
        },
        {
            id: 'tertiaryColor',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Define uma terceira cor de marca disponível para composições e séries dos gráficos.",
            label: 'Cor Terciária',
            type: 'color',
            description: 'Terceira cor de marca, usada para variar ainda mais paletas de gráficos, ilustrações ou composições que precisam de mais de duas cores de destaque.',
            axis: 'color',
            defaultValue: '#34d399',
            generateVariants: true,
            cssVars: ['--tertiary-color', '--theme-tertiary', '--sarak-tertiary-color', '--sarak-color-tertiary']
        },
        {
            id: 'accentColor',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Define a cor de acento usada na malha de fundo e na terceira série de marca dos gráficos.",
            label: 'Cor de Acento (Accent)',
            type: 'color',
            description: 'Cor de acento: a terceira cor das séries dos gráficos e uma das manchas da malha de fundo (`bgGradientMode: mesh`), além das variantes `--theme-accent-*` que o consumidor pode ler. Nenhum componente da lib a usa sozinha — um badge "novo" lê o status, não este token.',
            axis: 'color',
            defaultValue: '#ff4fd8',
            cssVars: ['--theme-accent', '--sarak-accent-color']
        },
        {
            id: 'surfaceColor',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Define a cor de superfície elevada publicada pelo tema e usada pelo motor de gráficos.",
            label: 'Cor de Superfície',
            type: 'color',
            description: 'Cor base das superfícies elevadas do sistema (cards, painéis, modais) — geralmente um tom intermediário entre o fundo geral (`colorBgBody`) e o texto, para criar hierarquia de profundidade.',
            axis: 'color',
            defaultValue: '#101622',
            cssVars: ['--theme-surface', '--sarak-surface-color']
        },
        {
            id: 'textureColor',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Dá cor às texturas de fundo e de cartão que aceitam cor do tema; alguns padrões usam a borda, a primária ou uma cor própria, então confira o desenho escolhido em vez de presumir que ele lê este token.",
            interactsWith: ['texture', 'cardTextureType'],
            label: 'Cor da Textura',
            type: 'color',
            description: 'Cor usada em overlays de textura/ruído de fundo (ex. grão, padrões sutis) — normalmente aplicada com opacidade baixa, para não competir com o conteúdo principal.',
            axis: 'color',
            defaultValue: '#cfe9ff',
            // Os 24 leitores de CSS pedem o canal (`--theme-texture-color-rgb`) para compor o alfa
            // de cada textura; sem a variante, a variável nunca existia e toda textura caía na primária.
            generateVariants: true,
            cssVars: ['--theme-texture-color', '--sarak-texture-color']
        },
        {
            id: 'titleColor',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Colore títulos e cabeçalhos do sistema, separado da cor dos parágrafos.",
            label: 'Cor do Título',
            type: 'color',
            description: 'Cor padrão de títulos e cabeçalhos de texto em todo o sistema — deve manter contraste alto contra `colorBgBody`/`surfaceColor`.',
            axis: 'color',
            defaultValue: '#f2f6fb',
            cssVars: ['--theme-title-color', '--sarak-title-color', '--theme-title']
        },
        {
            id: 'subtitleColor',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Colore subtítulos entre o texto principal e os títulos; preserve essa hierarquia e contraste de pelo menos 4,5:1.",
            interactsWith: ['textColorMaster', 'titleColor', 'colorBgBody', 'surfaceColor', 'cardBackgroundColor'],
            label: 'Cor do Subtítulo',
            type: 'color',
            description: 'Cor de subtítulos e descrições que precisam de destaque intermediário entre o texto principal (`textColorMaster`) e os títulos (`titleColor`). Deve manter contraste mínimo de 4,5:1 sobre corpo e cartão.',
            axis: 'color',
            defaultValue: '#f2f6fb',
            cssVars: ['--sarak-subtitle-color', '--theme-subtitle']
        },
        {
            id: 'emphasisColor',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Dá ênfase a texto usando um tom acessível da cor de acento do tema; preserve o matiz e contraste de pelo menos 4,5:1.",
            interactsWith: ['accentColor', 'colorBgBody', 'surfaceColor', 'cardBackgroundColor'],
            label: 'Cor de Ênfase',
            type: 'color',
            description: 'Cor de acento para palavras e trechos destacados. Deriva da identidade cromática do tema e mantém contraste mínimo de 4,5:1 sobre corpo e cartão.',
            axis: 'color',
            defaultValue: '#19e3f0',
            cssVars: ['--sarak-emphasis-color', '--theme-emphasis']
        },
        {
            id: 'colorDepth',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Controla a distância tonal das variantes geradas para as cores, incluindo o hover e o pressionado globais dos botões.",
            label: 'Profundidade da Cor',
            type: 'number',
            description: 'Fator passado ao gerador das variantes de cores declaradas com `generateVariants`. Nas variantes da cor primária, os valores resultantes alimentam `--theme-primary-hover` e `--theme-primary-active`, lidos pelos estados globais de hover e pressionado de `button` em `_elements.css`.',
            axis: 'color',
            constraints: { min: 0, max: 5, step: 1 },
            defaultValue: 1,
            cssVars: ['--sarak-color-depth']
        },
        {
            id: 'colorVariation',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Controla a variação de matiz e saturação das variantes geradas, incluindo o hover e o pressionado globais dos botões.",
            label: 'Variação da Cor',
            type: 'number',
            description: 'Fator passado ao gerador das variantes de cores declaradas com `generateVariants`. Nas variantes da cor primária, os valores resultantes alimentam `--theme-primary-hover` e `--theme-primary-active`, lidos pelos estados globais de hover e pressionado de `button` em `_elements.css`.',
            axis: 'color',
            constraints: { min: 1, max: 5, step: 1 },
            defaultValue: 1,
            cssVars: ['--sarak-color-variation']
        },
        // --- CORES DE SUPERFÍCIE ---
        {
            id: 'colorBgModal',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Pinta o painel de conteúdo de modais e diálogos.",
            label: 'Background Modais',
            type: 'color',
            description: 'Cor de fundo do container de conteúdo de modais/diálogos — diferente do overlay/scrim atrás do modal (`modalOverlayColor` em `overlays.ts`), esta é a cor do próprio painel do modal.',
            axis: 'color',
            defaultValue: 'var(--theme-surface)',
            cssVars: ['--sarak-bg-modal', '--theme-modal-bg']
        },
        // --- CORES DE COMPONENTES ---
        {
            id: 'cardBackgroundColor',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Pinta o fundo dos cartões e fornece a cor base às suas variantes.",
            label: 'Background dos Cards',
            type: 'color',
            description: 'Cor de fundo padrão de todos os cards do sistema.',
            axis: 'color',
            defaultValue: '#101622',
            // `generateVariants` veio da declaração homônima de `cards.ts`, desduplicada
            // pela plan-07: era ELA que emitia as 51 variantes cromáticas (`-rgb`, `-bg`,
            // `-10`…`-50`, `-hover`, `-active`, `-light`). Remover a duplicata sem herdar
            // esta linha apagava todas — desduplicar é FUNDIR, não descartar.
            generateVariants: true,
            cssVars: ['--card-bg', '--theme-card', '--sarak-card-bg', '--theme-card-bg']
        },
        {
            id: 'cardBorderColor',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Pinta o contorno dos cartões do sistema.",
            label: 'Borda dos Cards',
            type: 'color',
            description: 'Cor de borda padrão de todos os cards do sistema — costuma ser sutil (baixa opacidade) para demarcar o card sem criar contraste forte.',
            axis: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.09)',
            cssVars: ['--card-border-color', '--theme-border', '--sarak-card-border-color']
        }
    ]
};
