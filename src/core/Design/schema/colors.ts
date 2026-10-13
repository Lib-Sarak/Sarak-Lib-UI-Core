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
            label: 'Cor Primária (Base)',
            type: 'color',
            description: 'Cor de marca principal do sistema — links, anel de foco, estados ativos e elementos de destaque, e a base das variantes automáticas (`generateVariants: true`). O fundo do botão primário é `btnPrimaryBg` (que costuma repetir esta cor), não este token. É a cor mais impactante na identidade visual.',
            axis: 'color',
            defaultValue: '#00f2ff',
            generateVariants: true,
            cssVars: ['--primary-color', '--theme-primary', '--sarak-primary-color', '--sarak-color-primary']
        },
        {
            id: 'secondaryColor',
            label: 'Cor Secundária',
            type: 'color',
            description: 'Segunda cor de marca, usada para complementar a primária em elementos de menor ênfase ou para criar contraste em gradientes/composições multicoloridas.',
            axis: 'color',
            defaultValue: '#7000ff',
            generateVariants: true,
            cssVars: ['--secondary-color', '--theme-secondary', '--sarak-secondary-color', '--sarak-color-secondary']
        },
        {
            id: 'tertiaryColor',
            label: 'Cor Terciária',
            type: 'color',
            description: 'Terceira cor de marca, usada para variar ainda mais paletas de gráficos, ilustrações ou composições que precisam de mais de duas cores de destaque.',
            axis: 'color',
            defaultValue: '#10b981',
            generateVariants: true,
            cssVars: ['--tertiary-color', '--theme-tertiary', '--sarak-tertiary-color', '--sarak-color-tertiary']
        },
        {
            id: 'accentColor',
            label: 'Cor de Acento (Accent)',
            type: 'color',
            description: 'Cor de acento: a terceira cor das séries dos gráficos e uma das manchas da malha de fundo (`bgGradientMode: mesh`), além das variantes `--theme-accent-*` que o consumidor pode ler. Nenhum componente da lib a usa sozinha — um badge "novo" lê o status, não este token.',
            axis: 'color',
            defaultValue: '#ff00d4',
            cssVars: ['--theme-accent', '--sarak-accent-color']
        },
        {
            id: 'surfaceColor',
            label: 'Cor de Superfície',
            type: 'color',
            description: 'Cor base das superfícies elevadas do sistema (cards, painéis, modais) — geralmente um tom intermediário entre o fundo geral (`colorBgBody`) e o texto, para criar hierarquia de profundidade.',
            axis: 'color',
            defaultValue: '#1e293b',
            cssVars: ['--theme-surface', '--sarak-surface-color']
        },
        {
            id: 'textureColor',
            label: 'Cor da Textura',
            type: 'color',
            description: 'Cor usada em overlays de textura/ruído de fundo (ex. grão, padrões sutis) — normalmente aplicada com opacidade baixa, para não competir com o conteúdo principal.',
            axis: 'color',
            defaultValue: '#ffffff',
            // Os 24 leitores de CSS pedem o canal (`--theme-texture-color-rgb`) para compor o alfa
            // de cada textura; sem a variante, a variável nunca existia e toda textura caía na primária.
            generateVariants: true,
            cssVars: ['--theme-texture-color', '--sarak-texture-color']
        },
        {
            id: 'titleColor',
            label: 'Cor do Título',
            type: 'color',
            description: 'Cor padrão de títulos e cabeçalhos de texto em todo o sistema — deve manter contraste alto contra `colorBgBody`/`surfaceColor`.',
            axis: 'color',
            defaultValue: '#ffffff',
            cssVars: ['--theme-title-color', '--sarak-title-color']
        },
        {
            id: 'colorDepth',
            label: 'Profundidade da Cor',
            type: 'number',
            description: 'Fator que controla o quão escuras/claras ficam as variantes derivadas automaticamente das cores base (`generateVariants`) — valores maiores produzem variantes de contraste mais extremo entre si.',
            axis: 'color',
            constraints: { min: 0, max: 5, step: 1 },
            defaultValue: 1,
            cssVars: ['--sarak-color-depth']
        },
        {
            id: 'colorVariation',
            label: 'Variação da Cor',
            type: 'number',
            description: 'Fator que controla o quanto as variantes derivadas automaticamente das cores base variam entre si em matiz/saturação — valores maiores produzem uma família de cores mais diversa a partir da mesma cor base.',
            axis: 'color',
            constraints: { min: 1, max: 5, step: 1 },
            defaultValue: 1,
            cssVars: ['--sarak-color-variation']
        },
        // --- CORES DE SUPERFÍCIE ---
        {
            id: 'colorBgModal',
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
            label: 'Background dos Cards',
            type: 'color',
            description: 'Cor de fundo padrão de todos os cards do sistema.',
            axis: 'color',
            defaultValue: 'rgba(15, 23, 42, 0.6)',
            // `generateVariants` veio da declaração homônima de `cards.ts`, desduplicada
            // pela plan-07: era ELA que emitia as 51 variantes cromáticas (`-rgb`, `-bg`,
            // `-10`…`-50`, `-hover`, `-active`, `-light`). Remover a duplicata sem herdar
            // esta linha apagava todas — desduplicar é FUNDIR, não descartar.
            generateVariants: true,
            cssVars: ['--card-bg', '--theme-card', '--sarak-card-bg', '--theme-card-bg']
        },
        {
            id: 'cardBorderColor',
            label: 'Borda dos Cards',
            type: 'color',
            description: 'Cor de borda padrão de todos os cards do sistema — costuma ser sutil (baixa opacidade) para demarcar o card sem criar contraste forte.',
            axis: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.1)',
            cssVars: ['--card-border-color', '--theme-border', '--sarak-card-border-color']
        }
    ]
};
