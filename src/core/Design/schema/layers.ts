import { ComponentSchema } from '../types';

/**
 * LAYERS SCHEMA (v13.0)
 * Controla a arquitetura de profundidade e empilhamento.
 * Gerencia Z-Index e a opacidade de camadas de fundo.
 */
export const LayersSchema: ComponentSchema = {
    id: 'layers',
    label: 'Camadas e Profundidade',
    tokens: [
        // --- ARQUITETURA DE Z-INDEX ---
        {
            id: 'zIndexBase',
            label: 'Base Z-Index',
            type: 'slider',
            description: 'Índice de empilhamento (z-index) mínimo do sistema — a camada mais baixa da arquitetura de profundidade, abaixo de sidebar/modal/tooltip. Serve de piso para o restante da escala de z-index.',
            axis: 'elevation',
            constraints: { min: 0, max: 100, step: 1 },
            defaultValue: 1,
            cssVars: ['--sarak-z-base']
        },
        {
            id: 'zIndexSidebar',
            label: 'Sidebar Z-Index',
            type: 'slider',
            description: 'Índice de empilhamento (z-index) da navegação (sidebar/topbar) — deve ficar acima do conteúdo comum da tela, mas abaixo de modais e tooltips, para que overlays sempre cubram a navegação quando abertos.',
            axis: 'elevation',
            constraints: { min: 100, max: 1000, step: 50 },
            defaultValue: 500,
            cssVars: ['--sarak-z-sidebar']
        },
        {
            id: 'zIndexModal',
            label: 'Modal Z-Index',
            type: 'slider',
            description: 'Índice de empilhamento (z-index) de modais/diálogos — deve ficar acima da navegação, mas abaixo de tooltips. Nota: existe um token homônimo (mesmo `id`) em `engineering.ts`, com range diferente (sem min/max) — `engineering.ts` vem ANTES de `layers.ts` em `MASTER_DESIGN_MAP.components`, então é a definição de `engineering.ts` que o `agent-design-operator` de fato preenche/valida hoje (`deduplicateById`, primeira ocorrência); esta entrada em `layers.ts` fica sombreada nesse consumidor específico. Pendência de higiene de schema — Spec 01/`backlog_cobertura.md`.',
            axis: 'elevation',
            constraints: { min: 1000, max: 5000, step: 100 },
            defaultValue: 2000,
            cssVars: ['--sarak-z-modal']
        },
        {
            id: 'zIndexTooltip',
            label: 'Tooltip Z-Index',
            type: 'slider',
            description: 'Índice de empilhamento (z-index) de tooltips — o topo da hierarquia de camadas, garantindo que uma dica contextual sempre apareça por cima de qualquer modal/overlay já aberto.',
            axis: 'elevation',
            constraints: { min: 5000, max: 9999, step: 100 },
            defaultValue: 9000,
            cssVars: ['--sarak-z-tooltip']
        },

        // --- BACKDROPS ---
        {
            id: 'layerBackdropBlur',
            label: 'Blur do Fundo (Modal)',
            type: 'slider',
            description: 'Intensidade do desfoque aplicado ao conteúdo atrás de um modal/overlay aberto — separa visualmente o conteúdo em primeiro plano do restante da tela, reforçando a hierarquia de foco.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 40, step: 1 },
            defaultValue: 10,
            cssVars: ['--sarak-layer-backdrop-blur']
        },
        {
            id: 'layerBackdropOpacity',
            label: 'Escurecimento do Fundo',
            type: 'slider',
            description: 'Opacidade da camada escura (scrim) aplicada atrás de um modal/overlay aberto — quanto maior, mais o conteúdo de fundo é obscurecido, reforçando que ele está temporariamente inativo.',
            axis: 'elevation',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.4,
            cssVars: ['--sarak-layer-backdrop-opacity']
        },

        // --- ELEVAÇÃO DINÂMICA ---
        {
            id: 'layerElevationFactor',
            label: 'Fator de Elevação',
            type: 'slider',
            description: 'Multiplicador aplicado à intensidade de sombras/profundidade de elementos elevados (cards, modais, dropdowns) — valores acima de 1 exageram a sensação de profundidade; abaixo de 1 achatam o visual (clima mais flat/minimalista).',
            axis: 'elevation',
            constraints: { min: 0.5, max: 2, step: 0.1 },
            defaultValue: 1,
            cssVars: ['--sarak-layer-elevation-factor']
        }
    ]
};
