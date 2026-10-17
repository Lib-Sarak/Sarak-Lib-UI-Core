import { ComponentSchema } from '../types';
import { BREAKPOINT_TABLET, BREAKPOINT_DESKTOP } from '../breakpoints';

/**
 * STRUCTURAL SCHEMA (v13.0)
 * Tokens de macro-layout e densidade consumidos pelo hook `useStructuralStyles`
 * (Eixos de Grid, Fluxo Global, Formulários, Header e Switches). Antes eram
 * lidos do payload sem existir no schema (sempre no default) — agora plugados na
 * paridade 1:1:1:1:1.
 */
export const StructuralSchema: ComponentSchema = {
    id: 'structural',
    label: 'Estrutura e Macro-Layout',
    tokens: [
        // --- BREAKPOINTS (Spec 16, Regra 1) ---
        // Limiares de responsividade consumidos pelo gerador de media-queries
        // (useDesignVariables) e pelo detector JS (DeviceProvider). Default/legacy
        // derivam da fonte única em ../breakpoints.ts (coerência CSS↔JS, Regra 4).
        {
            id: 'breakpointTablet',
            kind: 'functional',
            modeDependent: false,
            usage: "Largura de janela a partir da qual a interface deixa de ser celular: abaixo dela o cromo usa a barra do celular e os valores `mob`; acima, os de tablet.",
            interactsWith: ['breakpointDesktop'],
            label: 'Breakpoint Tablet',
            type: 'slider',
            description: 'Largura de viewport, em pixels, a partir da qual o layout passa a usar o breakpoint "tablet" — ponto de corte entre os estilos mobile e tablet em toda a biblioteca.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 480, max: 1024, step: 1 },
            defaultValue: BREAKPOINT_TABLET,
            legacyValue: BREAKPOINT_TABLET,
            cssVars: ['--sarak-breakpoint-tablet']
        },
        {
            id: 'breakpointDesktop',
            kind: 'functional',
            modeDependent: false,
            usage: "Largura de janela a partir da qual valem os valores `desk` dos tokens responsivos e o cromo de desktop; abaixo, os de tablet.",
            interactsWith: ['breakpointTablet'],
            label: 'Breakpoint Desktop',
            type: 'slider',
            description: 'Largura de viewport, em pixels, a partir da qual o layout passa a usar o breakpoint "desktop" — ponto de corte entre os estilos tablet e desktop em toda a biblioteca.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 768, max: 1600, step: 1 },
            defaultValue: BREAKPOINT_DESKTOP,
            legacyValue: BREAKPOINT_DESKTOP,
            cssVars: ['--sarak-breakpoint-desktop']
        },

        // --- MACRO GRID ---
        {
            id: 'layoutGridTemplate',
            kind: 'functional',
            modeDependent: false,
            usage: "Como a `SarakGrid` distribui os itens: 12 colunas (cada item ocupa 4), auto-fit pela largura mínima da célula ou masonry em colunas.",
            interactsWith: ['layoutGridMinCell'],
            label: 'Template de Grid Global',
            type: 'select',
            description: 'Estratégia de grid usada para organizar seções principais da tela: Colunas (12) é o grid clássico fixo; Auto-fit Responsivo ajusta a quantidade de colunas ao espaço disponível; Masonry empilha itens de alturas diferentes ao estilo Pinterest.',
            axis: 'geometry',
            constraints: {
                options: [
                    { id: 'col-12', value: 'col-12', label: 'Colunas (12)' },
                    { id: 'auto-fit', value: 'auto-fit', label: 'Auto-fit Responsivo' },
                    { id: 'masonry', value: 'masonry', label: 'Masonry (Pinterest)' }
                ]
            },
            defaultValue: 'auto-fit',
            cssVars: ['--sarak-layout-grid-template'],
            structuralConsumer: ['useStructuralStyles.getGridStyles']
        },
        {
            id: 'layoutGridMinCell',
            kind: 'functional',
            modeDependent: false,
            usage: "Largura mínima de cada célula da grade auto-fit; célula menor cabe mais colunas, maior as reduz.",
            interactsWith: ['layoutGridTemplate'],
            label: 'Largura Mínima da Célula (Auto-fit)',
            type: 'slider',
            description: 'Largura mínima, em pixels, que cada célula assume no modo Auto-fit Responsivo antes de o grid quebrar para uma nova coluna — é o que decide quantas colunas cabem em cada largura de tela.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 160, max: 480, step: 8 },
            defaultValue: 280,
            legacyValue: 280,
            cssVars: ['--sarak-layout-grid-min-cell'],
            structuralConsumer: ['useStructuralStyles.getGridStyles']
        },
        {
            id: 'globalSectionGap',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Espaçamento entre as seções de uma grade e de um catálogo; prevalece sobre `layoutGap` na `SarakGrid`.",
            interactsWith: ['layoutGap'],
            label: 'Espaçamento entre Seções',
            type: 'slider',
            description: 'Espaço, em pixels, entre seções principais da tela (ex. entre um bloco de cards e a tabela seguinte). Controla a "respiração" macro do layout — diferente de gaps internos de um componente específico.',
            axis: 'density',
            unit: 'px',
            constraints: { min: 0, max: 96, step: 2 },
            defaultValue: 24,
            cssVars: ['--sarak-global-section-gap']
        },

        // --- FLUXO GLOBAL ---
        {
            id: 'globalFlowDirection',
            kind: 'functional',
            modeDependent: false,
            usage: "Direção em que o catálogo empilha seus blocos: coluna ou linha com quebra.",
            interactsWith: ['globalFlowAlign'],
            label: 'Direção do Fluxo Global',
            type: 'select',
            description: 'Direção de empilhamento padrão de containers de fluxo (flex) no sistema — Coluna (vertical, o padrão da maioria dos layouts) ou Linha (horizontal, para barras/toolbars).',
            axis: 'geometry',
            constraints: {
                options: [
                    { id: 'column', value: 'column', label: 'Coluna (Vertical)' },
                    { id: 'row', value: 'row', label: 'Linha (Horizontal)' }
                ]
            },
            defaultValue: 'column',
            cssVars: ['--sarak-global-flow-direction'],
            structuralConsumer: ['useStructuralStyles.getContainerStyles']
        },
        {
            id: 'globalFlowAlign',
            kind: 'functional',
            modeDependent: false,
            usage: "Alinhamento transversal do catálogo: esticar, início, centro ou fim.",
            interactsWith: ['globalFlowDirection'],
            label: 'Alinhamento do Fluxo Global',
            type: 'select',
            description: 'Alinhamento cruzado (`align-items`) padrão de containers de fluxo — Esticar preenche o eixo cruzado por completo (comum em layouts de coluna), Início/Centro/Fim alinham ao respectivo ponto sem esticar.',
            axis: 'geometry',
            constraints: {
                options: [
                    { id: 'stretch', value: 'stretch', label: 'Esticar (Stretch)' },
                    { id: 'start', value: 'start', label: 'Início' },
                    { id: 'center', value: 'center', label: 'Centro' },
                    { id: 'end', value: 'end', label: 'Fim' }
                ]
            },
            defaultValue: 'stretch',
            cssVars: ['--sarak-global-flow-align'],
            structuralConsumer: ['useStructuralStyles.getContainerStyles']
        },

        // --- HEADER ---
        {
            id: 'headerAlignment',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Disposição do cabeçalho de tabelas e catálogos: título e ações espaçados, centrados ou no início.",
            label: 'Alinhamento do Header',
            type: 'select',
            description: 'Distribuição horizontal dos elementos dentro de um cabeçalho de seção/página — Espaçado empurra título e ações para as extremidades opostas (o mais comum), Centro/Início agrupam os elementos.',
            axis: 'geometry',
            constraints: {
                options: [
                    { id: 'space-between', value: 'space-between', label: 'Espaçado (Between)' },
                    { id: 'center', value: 'center', label: 'Centro' },
                    { id: 'start', value: 'start', label: 'Início' }
                ]
            },
            defaultValue: 'space-between',
            cssVars: ['--sarak-header-alignment'],
            structuralConsumer: ['useStructuralStyles.getHeaderStyles']
        },

        // --- FORMULÁRIOS ---
        {
            id: 'formLabelPosition',
            kind: 'functional',
            modeDependent: false,
            usage: "Posição do rótulo no `SarakFormGroup`: acima do campo ou à esquerda, na mesma linha.",
            interactsWith: ['formFieldDensity'],
            label: 'Posição do Rótulo (Form)',
            type: 'select',
            description: 'Posição do rótulo (label) em relação ao campo de formulário — Acima é o padrão mais legível/responsivo; À Esquerda economiza altura vertical em formulários curtos/desktop.',
            axis: 'geometry',
            constraints: {
                options: [
                    { id: 'top', value: 'top', label: 'Acima' },
                    { id: 'left', value: 'left', label: 'À Esquerda' }
                ]
            },
            defaultValue: 'top',
            cssVars: ['--sarak-form-label-position'],
            structuralConsumer: ['useStructuralStyles.getFormGroupStyles']
        },
        {
            id: 'formFieldDensity',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Espaço entre rótulo e campo no `SarakFormGroup`: compacta 3 px, confortável 6 px, espaçosa 24 px.",
            interactsWith: ['formLabelPosition'],
            label: 'Densidade dos Campos (Form)',
            type: 'select',
            description: 'Espaçamento vertical entre campos de um formulário. Compacta cabe mais campos na tela (formulários longos/admin); Espaçosa favorece legibilidade e reduz erro de toque em mobile.',
            axis: 'density',
            constraints: {
                options: [
                    { id: 'tight', value: 'tight', label: 'Compacta' },
                    { id: 'comfortable', value: 'comfortable', label: 'Confortável' },
                    { id: 'relaxed', value: 'relaxed', label: 'Espaçosa' }
                ]
            },
            defaultValue: 'comfortable',
            cssVars: ['--sarak-form-field-density'],
            structuralConsumer: ['useStructuralStyles.getFormGroupStyles']
        },

        // --- SWITCHES / CHECKBOXES ---
        {
            id: 'switchLabelPosition',
            kind: 'functional',
            modeDependent: false,
            usage: "Posição do texto do `SarakSwitch` em relação ao controle: à direita, à esquerda ou nas pontas. O `SarakCheckbox` e o `SarakRadio` não seguem este token.",
            label: 'Posição do Rótulo (Switch)',
            type: 'select',
            description: 'Posição do texto de rótulo em relação ao controle de switch/checkbox — À Direita é o padrão mais comum; Espaçado (Between) empurra o switch para a extremidade oposta do rótulo (útil em listas de configurações).',
            axis: 'geometry',
            constraints: {
                options: [
                    { id: 'right', value: 'right', label: 'À Direita' },
                    { id: 'left', value: 'left', label: 'À Esquerda' },
                    { id: 'space-between', value: 'space-between', label: 'Espaçado (Between)' }
                ]
            },
            defaultValue: 'right',
            cssVars: ['--sarak-switch-label-position'],
            structuralConsumer: ['useStructuralStyles.getSwitchLayoutStyles']
        },

        // --- SPLIT PANE (Spec 27) ---
        {
            id: 'splitPaneMinWidth',
            kind: 'functional',
            modeDependent: false,
            usage: "Largura mínima dos dois lados do `SarakSplitPane` ao arrastar a divisória; evita fechar um painel por acidente.",
            label: 'Split Pane: Largura Mínima do Painel Secundário',
            type: 'slider',
            description: 'Largura mínima, em pixels, que o painel secundário de um `SarakSplitPane` pode ter ao ser redimensionado pelo usuário — evita que o painel colapse a ponto de ficar inutilizável.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 40, max: 400 },
            defaultValue: 100,
            cssVars: ['--sarak-split-pane-min-width']
        }
    ]
};
