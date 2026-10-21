import { ComponentSchema } from '../types';
import { ICON_TOKENS } from './icons';

/**
 * SCHEMA: CONFIGURAÇÕES GLOBAIS
 * Controla o comportamento base do sistema, scrollbars e layout.
 */
export const SystemSchema: ComponentSchema = {
    id: 'system',
    label: 'Configurações de Layout',
    tokens: [
        {
            id: 'layoutDensity',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Escala o respiro interno da região de conteúdo do cromo: compacto reduz a 75%, confortável mantém e espaçoso aumenta a 125%.",
            label: 'Densidade Visual',
            type: 'select',
            description: 'Escala o espaçamento interno da região de conteúdo do cromo: compacto reduz, confortável mantém o atual e espaçoso aumenta.',
            axis: 'density',
            defaultValue: 'comfortable',
            options: [
                { value: 'compact', label: 'Compacto' },
                { value: 'comfortable', label: 'Confortável' },
                { value: 'spacious', label: 'Espaçoso' }
            ]
        },
        {
            id: 'maxContentWidth',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Largura máxima da região de conteúdo do cromo, centralizada na tela; 100% ocupa a largura inteira.",
            label: 'Largura Máxima do Conteúdo',
            type: 'select',
            description: 'Define a largura máxima da região de conteúdo do cromo e a centraliza; 100% ocupa a largura disponível.',
            axis: 'geometry',
            defaultValue: '1440px',
            options: [
                { value: '1000px', label: 'Muito Estreito (1000px, Editorial)' },
                { value: '1200px', label: 'Estreito (1200px)' },
                { value: '1440px', label: 'Padrão (1440px)' },
                { value: '1600px', label: 'Largo (1600px)' },
                { value: '100%', label: 'Fluido (100%)' }
            ]
        },
        {
            id: 'layoutPadding',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Respiro entre a região de conteúdo do cromo e as bordas, em pixels, com um valor por breakpoint; a densidade multiplica este valor.",
            label: 'Respiro do Conteúdo (Padding)',
            type: 'slider',
            description: 'Espaçamento interno do container de conteúdo principal em relação às bordas da tela, em pixels, com valores independentes por breakpoint.',
            axis: 'geometry',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 80 },
            defaultValue: { mob: 16, tab: 24, desk: 32 },
            cssVars: ['--sarak-layout-padding']
        },
        {
            id: 'isSplitViewEnabled',
            kind: 'functional',
            modeDependent: false,
            usage: "Habilita o painel secundário ao lado do conteúdo do cromo (`secondaryContent`); desligado, o painel não é desenhado.",
            label: 'Ativar Vista Dividida (Split)',
            type: 'boolean',
            description: 'Habilita o modo de visualização dividida (dois painéis lado a lado, ex. lista + detalhe) em telas que suportam esse layout.',
            defaultValue: false
        },
        {
            id: 'isAutoHideEnabled',
            kind: 'functional',
            modeDependent: false,
            usage: "Esconde a navegação até o ponteiro chegar à borda e devolve a largura ao conteúdo; ligado, a barra não aparece no primeiro quadro.",
            label: 'Auto-ocultar Menus',
            type: 'boolean',
            description: 'Quando ativo, oculta automaticamente sidebar/topbar após um período de inatividade ou ao rolar a página, maximizando o espaço de conteúdo.',
            defaultValue: false
        },
        // --- ARQUITETURA DE BORDAS ---
        {
            id: 'borderRadius',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Raio de referência dos componentes sem raio próprio: acordeão, paleta de busca, motor de fluxo e outros; 0 deixa os cantos retos, inclusive no acordeão; vale escalar ou por breakpoint.",
            interactsWith: ['cardBorderRadius'],
            label: 'Arredondamento Padrão',
            type: 'slider',
            description: 'Raio de borda padrão do sistema, usado como referência geral quando um componente específico não define seu próprio raio — com valores independentes por breakpoint.',
            axis: 'geometry',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 40 },
            defaultValue: { mob: 8, tab: 10, desk: 12 },
            cssVars: ['--radius-theme', '--sarak-border-radius', '--border-radius']
        },
        {
            id: 'borderWidth',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Espessura das linhas divisórias do feed de atividade e do separador do painel dividido, e das demais linhas que leem a variável de borda do sistema (dados, botões de ícone com contorno).",
            label: 'Espessura da Borda',
            type: 'slider',
            description: 'Espessura padrão das bordas em todo o sistema, em pixels. Valores maiores criam contornos mais evidentes/técnicos; 0 remove bordas visíveis (depende de cor/sombra para demarcar elementos).',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 0, max: 10 },
            defaultValue: 1,
            cssVars: ['--theme-border-width', '--border-width', '--sarak-border-width']
        },
        {
            id: 'borderStyle',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Traço das bordas que seguem o sistema (contínuo, tracejado, pontilhado ou sem borda): o cromo, o separador do painel dividido e as classes utilitárias de borda.",
            label: 'Estilo da Borda',
            type: 'select',
            description: 'Padrão de traço das bordas do sistema — Contínuo é o padrão neutro; Tracejado/Pontilhado dão um clima mais técnico/rascunho; Sem borda remove o traço, dependendo de sombra/cor para demarcar.',
            axis: 'texture',
            defaultValue: 'solid',
            options: [
                { value: 'solid', label: 'Contínuo (Solid)' },
                { value: 'dashed', label: 'Tracejado' },
                { value: 'dotted', label: 'Pontilhado' },
                { value: 'none', label: 'Sem borda' }
            ],
            cssVars: ['--border-style', '--sarak-border-style']
        },
        // --- ESPAÇAMENTOS (GAPS) ---
        {
            id: 'layoutGap',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Espaçamento padrão entre irmãos quando o componente não define o seu: o `SarakFlex` e a `SarakGrid` (sem `globalSectionGap`) leem este valor, por breakpoint.",
            label: 'Espaçamento Padrão (Gap)',
            type: 'slider',
            description: 'Espaçamento padrão entre elementos irmãos em todo o sistema quando um componente não define seu próprio gap — com valores independentes por breakpoint.',
            axis: 'density',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 80 },
            defaultValue: { mob: 16, tab: 20, desk: 24 },
            cssVars: ['--theme-gap', '--sarak-layout-gap']
        },
        {
            id: 'layoutGapSm',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Escala pequena de espaçamento: o respiro dos botões e dos campos do cromo e dos agrupamentos densos, por breakpoint.",
            label: 'Espaçamento Pequeno',
            type: 'slider',
            description: 'Escala "pequena" de espaçamento entre elementos, para agrupamentos densos (ex. ícones lado a lado, tags).',
            axis: 'density',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 40 },
            defaultValue: { mob: 8, tab: 10, desk: 12 },
            cssVars: ['--sarak-layout-gap-sm']
        },
        {
            id: 'layoutGapMd',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Escala média de espaçamento, a mais usada: entre os grupos do cromo e nos blocos de conteúdo padrão, por breakpoint.",
            label: 'Espaçamento Médio',
            type: 'slider',
            description: 'Escala "média" de espaçamento entre elementos — a referência mais usada entre cards/blocos de conteúdo padrão.',
            axis: 'density',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 80 },
            defaultValue: { mob: 16, tab: 20, desk: 24 },
            cssVars: ['--sarak-layout-gap-md']
        },
        {
            id: 'layoutGapLg',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Escala grande de espaçamento: entre seções e estados vazios, por breakpoint.",
            label: 'Espaçamento Grande',
            type: 'slider',
            description: 'Escala "grande" de espaçamento entre elementos, para separar blocos de conteúdo maiores/seções distintas.',
            axis: 'density',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 120 },
            defaultValue: { mob: 24, tab: 32, desk: 36 },
            cssVars: ['--sarak-layout-gap-lg']
        },
        ...ICON_TOKENS
    ]
};
