import { ComponentSchema } from '../types';

/**
 * SCHEMA: CAMPOS DE ENTRADA & FORMULÁRIOS
 * Governa campos de texto, seletores binários e elementos de entrada.
 */
export const InputsSchema: ComponentSchema = {
    id: 'inputs',
    label: 'Campo de Entrada (Input)',
    tokens: [
        {
            id: 'formLayoutDirection',
            label: 'Direção do Formulário',
            type: 'select',
            description: 'Direção geral de um formulário: Empilhado (label acima do campo, o mais responsivo) ou Em linha (label à esquerda do campo, economiza altura em telas largas).',
            axis: 'geometry',
            constraints: {
                options: [
                    { id: 'stack', value: 'stack', label: 'Empilhado (Top)' },
                    { id: 'inline', value: 'inline', label: 'Em linha (Left)' }
                ]
            },
            defaultValue: 'stack'
        },
        {
            id: 'inputIconPosition',
            label: 'Posição do Ícone',
            type: 'select',
            description: 'Lado do campo de entrada onde um ícone (quando presente, ex. busca, calendário) é renderizado.',
            axis: 'geometry',
            constraints: {
                options: [
                    { id: 'left', value: 'left', label: 'Esquerda' },
                    { id: 'right', value: 'right', label: 'Direita' }
                ]
            },
            defaultValue: 'left',
            structuralConsumer: ['useStructuralStyles.getInputIconStyles']
        },
        {
            id: 'inputBorderRadius',
            label: 'Arredondamento',
            type: 'slider',
            description: 'Raio de borda dos campos de entrada, em pixels, com valores independentes por breakpoint. Costuma acompanhar o mesmo clima (anguloso vs. arredondado) de `btnBorderRadius`, para consistência entre inputs e botões.',
            axis: 'geometry',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 120 },
            defaultValue: { mob: 6, tab: 8, desk: 8 },
            cssVars: ['--sarak-input-border-radius']
        },
        {
            id: 'inputPadding',
            label: 'Espaçamento Interno (Y)',
            type: 'slider',
            description: 'Espaçamento vertical interno do campo de entrada, em pixels — controla a altura/"respiro" do input. Valores maiores aumentam a área de toque; valores menores deixam o campo mais compacto.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 0, max: 32 },
            defaultValue: 12,
            cssVars: ['--sarak-input-padding']
        },
        {
            id: 'inputBorderType',
            label: 'Estilo da Borda',
            type: 'select',
            description: 'Padrão visual da borda do campo de entrada: Sólida (clássica), Tracejada (mais casual/rascunho), Nenhuma (borderless, depende do fundo para separar do resto) ou Apenas Linha Inferior (estilo Material Design).',
            axis: 'texture',
            options: [
                { id: 'solid', label: 'Sólida' },
                { id: 'dashed', label: 'Tracejada' },
                { id: 'none', label: 'Nenhuma' },
                { id: 'underline', label: 'Apenas Linha Inferior' }
            ],
            defaultValue: 'solid',
            cssVars: ['--sarak-input-border-type']
        },
        {
            id: 'inputBg',
            label: 'Fundo do Input',
            type: 'color',
            description: 'Cor de fundo padrão dos campos de entrada — normalmente sutil/translúcida para diferenciar do fundo da página sem criar contraste forte. Gera variantes automáticas de foco/hover.',
            axis: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.03)',
            generateVariants: true,
            cssVars: ['--sarak-input-bg']
        },
        {
            id: 'inputBackdropBlur',
            label: 'Desfoque de Fundo (Blur)',
            type: 'slider',
            description: 'Intensidade do desfoque atrás do campo de entrada — só produz efeito visível quando o input tem fundo translúcido (`inputBg` com baixa opacidade), criando um clima de vidro fosco.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 50 },
            defaultValue: 0,
            cssVars: ['--sarak-input-backdrop-blur']
        },
        {
            id: 'inputShadow',
            label: 'Sombra / Neumorphism',
            type: 'text',
            description: 'Definição CSS completa de `box-shadow` do campo de entrada — usada para efeitos avançados como neumorphism (relevo suave). "none" desativa qualquer sombra.',
            axis: 'elevation',
            defaultValue: 'none',
            cssVars: ['--sarak-input-shadow']
        },
        {
            id: 'inputBorderColor',
            label: 'Cor da Borda',
            type: 'color',
            description: 'Cor da borda do campo de entrada em repouso (sem foco) — costuma ser sutil, só o suficiente para demarcar os limites do campo.',
            axis: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.1)',
            cssVars: ['--sarak-input-border-color']
        },
        {
            id: 'inputFocusBorderColor',
            label: 'Cor da Borda (Foco)',
            type: 'color',
            description: 'Cor da borda do campo de entrada quando está em foco (usuário digitando/selecionado) — deve ter contraste alto contra `inputBorderColor`, para o usuário identificar rapidamente qual campo está ativo.',
            axis: 'color',
            defaultValue: '#00f2ff',
            cssVars: ['--sarak-input-focus-border-color']
        },
        {
            id: 'inputTextColor',
            label: 'Cor do Texto',
            type: 'color',
            description: 'Cor do texto digitado dentro do campo de entrada — deve manter contraste alto contra `inputBg`.',
            axis: 'color',
            defaultValue: '#ffffff',
            cssVars: ['--sarak-input-text-color']
        },
        {
            id: 'inputIconColor',
            label: 'Cor dos Ícones',
            type: 'color',
            description: 'Cor dos ícones exibidos dentro/ao lado do campo de entrada (ex. lupa de busca, olho de senha) — normalmente com opacidade reduzida em relação ao texto principal, para não competir visualmente.',
            axis: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.5)',
            cssVars: ['--sarak-input-icon-color']
        },
        {
            id: 'inputErrorColor',
            label: 'Cor de Erro',
            type: 'color',
            description: 'Cor de borda/texto aplicada ao campo de entrada quando a validação falha — convencionalmente vermelho, deve se manter coerente com `statusErrorColor` do resto do sistema.',
            axis: 'color',
            defaultValue: '#ff4d4f',
            cssVars: ['--sarak-input-error-color']
        },
        {
            id: 'inputSuccessColor',
            label: 'Cor de Sucesso',
            type: 'color',
            description: 'Cor de borda/texto aplicada ao campo de entrada quando a validação passa (ex. e-mail válido) — convencionalmente verde, deve se manter coerente com `statusSuccessColor` do resto do sistema.',
            axis: 'color',
            defaultValue: '#52c41a',
            cssVars: ['--sarak-input-success-color']
        },

        // --- MULTI-SELECT (Spec 27) ---
        {
            id: 'multiSelectInputMinWidth',
            label: 'Multi-Select: Largura Mínima do Input Interno',
            type: 'slider',
            description: 'Largura mínima, em `rem`, do input de texto interno de um campo multi-select (onde o usuário digita para filtrar opções) — evita que o campo de digitação fique espremido quando já há várias tags selecionadas.',
            axis: 'geometry',
            unit: 'rem',
            constraints: { min: 2, max: 16 },
            defaultValue: 6,
            cssVars: ['--sarak-multi-select-input-min-width']
        },

        // --- COMMAND SEARCH / PALETTE (Spec 27) ---
        {
            id: 'searchBackdropBlur',
            label: 'Search Palette: Desfoque do Backdrop',
            type: 'slider',
            description: 'Intensidade do desfoque aplicado ao conteúdo atrás da paleta de comando/busca global (Cmd+K) quando ela está aberta — reforça o foco no campo de busca.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 30 },
            defaultValue: 8,
            cssVars: ['--sarak-search-backdrop-blur']
        },

        // --- RANGE SLIDER ---
        {
            id: 'rangeActiveColor',
            label: 'Range Slider: Cor Ativa',
            type: 'color',
            description: 'Cor do polegar (thumb) arrastável de um range slider — herda a cor primária do sistema por padrão, mas pode ser customizada independentemente para destacar o controle.',
            axis: 'color',
            defaultValue: 'var(--theme-primary)',
            cssVars: ['--sarak-range-active-bg']
        }
    ]
};
