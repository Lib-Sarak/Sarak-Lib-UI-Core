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
            id: 'colorPalette',
            label: 'Paleta Ativa (Preset)',
            type: 'select',
            description: 'Preset de paleta cromática completa aplicado de uma vez (define combinação coerente de `primaryColor`/`secondaryColor`/`tertiaryColor`). Use como ponto de partida rápido antes de ajustar cores individuais.',
            axis: 'color',
            defaultValue: 'default',
            options: [
                { value: 'default', label: 'Padrão (Cyberpunk)' },
                { value: 'neon', label: 'Neon Glow' },
                { value: 'matrix', label: 'Green Matrix' },
                { value: 'slate', label: 'Slate Industrial' },
                { value: 'sunset', label: 'Sunset Orange' }
            ]
        },
        {
            id: 'primaryColor',
            label: 'Cor Primária (Base)',
            type: 'color',
            description: 'Cor de marca principal do sistema — usada em botões primários, links, elementos de destaque e como base para várias variantes automáticas (`generateVariants: true`). É a cor mais impactante na identidade visual.',
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
            description: 'Cor de destaque pontual, usada com moderação para chamar atenção a um elemento específico (ex. um badge "novo") sem competir com a cor primária.',
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
            defaultValue: 1,
            min: 1,
            max: 5,
            cssVars: ['--sarak-color-depth']
        },
        {
            id: 'colorVariation',
            label: 'Variação da Cor',
            type: 'number',
            description: 'Fator que controla o quanto as variantes derivadas automaticamente das cores base variam entre si em matiz/saturação — valores maiores produzem uma família de cores mais diversa a partir da mesma cor base.',
            axis: 'color',
            defaultValue: 1,
            min: 1,
            max: 5,
            cssVars: ['--sarak-color-variation']
        },
        // --- CORES DE SUPERFÍCIE ---
        {
            id: 'colorBgBody',
            label: 'Background Geral (Body)',
            type: 'color',
            description: 'Cor de fundo base de toda a aplicação (atrás de qualquer card/painel) — a camada mais profunda da hierarquia de superfícies.',
            axis: 'color',
            defaultValue: '#050505',
            cssVars: ['--sarak-bg-body', '--theme-bg', '--theme-body', '--bg-body', '--sarak-bg-base']
        },
        {
            id: 'colorBgLayer1',
            label: 'Background Layer 1',
            type: 'color',
            description: 'Cor de fundo da primeira camada de profundidade acima do body — usada em containers/seções intermediárias que precisam se destacar levemente do fundo geral.',
            axis: 'color',
            defaultValue: '#0f0f0f',
            cssVars: ['--sarak-bg-layer-1', '--theme-surface-1']
        },
        {
            id: 'colorBgLayer2',
            label: 'Background Layer 2',
            type: 'color',
            description: 'Cor de fundo da segunda camada de profundidade — mais clara/destacada que `colorBgLayer1`, para elementos ainda mais elevados na hierarquia visual (ex. um card dentro de uma seção).',
            axis: 'color',
            defaultValue: '#1a1a1a',
            cssVars: ['--sarak-bg-layer-2', '--theme-surface-2']
        },
        {
            id: 'colorBgModal',
            label: 'Background Modais',
            type: 'color',
            description: 'Cor de fundo do container de conteúdo de modais/diálogos — diferente do overlay/scrim atrás do modal (`modalOverlayColor` em `overlays.ts`), esta é a cor do próprio painel do modal.',
            axis: 'color',
            defaultValue: 'rgba(15, 15, 15, 0.8)',
            cssVars: ['--sarak-bg-modal', '--theme-modal-bg']
        },
        // --- CORES DE COMPONENTES ---
        {
            id: 'cardBackgroundColor',
            label: 'Background dos Cards',
            type: 'color',
            description: 'Cor de fundo padrão de todos os cards do sistema. Nota: existe um token homônimo em `cards.ts` com `cssVars` parcialmente divergente (`--theme-card-bg`/`--theme-card-border` a mais) — pendência de higiene de schema já registrada no backlog de cobertura, fora do escopo desta spec.',
            axis: 'color',
            defaultValue: 'rgba(15, 23, 42, 0.6)',
            cssVars: ['--card-bg', '--theme-surface', '--theme-card', '--sarak-card-bg', '--theme-card-bg']
        },
        {
            id: 'cardBorderColor',
            label: 'Borda dos Cards',
            type: 'color',
            description: 'Cor de borda padrão de todos os cards do sistema — costuma ser sutil (baixa opacidade) para demarcar o card sem criar contraste forte. Ver nota de duplicação em `cardBackgroundColor`.',
            axis: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.1)',
            cssVars: ['--card-border-color', '--theme-border', '--sarak-card-border-color', '--theme-card-border']
        }
    ]
};
