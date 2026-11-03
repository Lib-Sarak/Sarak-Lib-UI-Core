import type { ComponentPreset } from './cards';

/**
 * Cards de estrutura: forma, respiro, sombra por números, efeitos de movimento e as peças internas (título, botão de ação,
 * imagem). Nenhum escreve cor — a cor do card vem da paleta do tema. A sombra usa os números do card, nunca o texto
 * `cardShadow`, que carregaria uma cor escrita à mão.
 */
export const CARD_STRUCTURE_PRESETS: ComponentPreset[] = [
    {
        id: 'card-flat-minimal',
        name: 'Plano e discreto',
        description: 'Cantos suaves, borda fina e nenhuma sombra: o card some e deixa o conteúdo falar.',
        keywords: ['flat', 'minimal', 'simples', 'limpo'],
        design: { cardBorderRadius: 8, cardBorderWidth: 1, cardBackdropBlur: 0, cardShadowBlur: 0, cardShadowOffsetY: 0, cardShadowSpread: 0, cardShadow: 'none', cardGlowIntensity: 0 },
    },
    {
        id: 'card-soft-elevated',
        name: 'Elevado e macio',
        description: 'Sem borda, cantos generosos e uma sombra longa e difusa que descola o card do fundo.',
        keywords: ['sombra', 'elevacao', 'shadow', 'elevated'],
        design: { cardBorderRadius: 20, cardBorderWidth: 0, cardShadowOffsetY: 18, cardShadowBlur: 44, cardShadowExpansion: -10, cardBackdropBlur: 0 },
    },
    {
        id: 'card-side-accent',
        name: 'Faixa lateral',
        description: 'Só a borda esquerda é grossa, como um marcador de seção; as outras três somem.',
        keywords: ['barra', 'marcador', 'accent', 'lateral'],
        design: { cardBorderLeft: 5, cardBorderTop: 0, cardBorderRight: 0, cardBorderBottom: 0, cardBorderRadius: 6, cardShadowBlur: 0, cardBackdropBlur: 0 },
    },
    {
        id: 'card-editorial-airy',
        name: 'Editorial arejado',
        description: 'Muito respiro interno, só uma linha na base e o título em destaque: ar de revista.',
        keywords: ['revista', 'editorial', 'espaco', 'respiro'],
        design: {
            cardPaddingMd: 36, cardHeaderPadding: 30, cardBorderTop: 0, cardBorderLeft: 0, cardBorderRight: 0, cardBorderBottom: 1,
            cardBorderRadius: 0, cardShadowBlur: 0, cardBackdropBlur: 0, cardTitleFontSize: 24, cardTitleFontWeight: '600',
        },
    },
    {
        id: 'card-dense-grid',
        name: 'Denso e compacto',
        description: 'Respiro mínimo e título pequeno: cabe mais informação na mesma tela.',
        keywords: ['compacto', 'denso', 'dense', 'tabela'],
        design: { cardPaddingMd: 10, cardHeaderPadding: 8, cardBorderRadius: 6, cardBorderWidth: 1, cardTitleFontSize: 13, cardTitleFontWeight: '700', cardShadowBlur: 0 },
    },
    {
        id: 'card-glow-halo',
        name: 'Halo luminoso',
        description: 'Um brilho espalhado ao redor do card, que cresce quando o ponteiro passa.',
        keywords: ['brilho', 'glow', 'neon', 'halo'],
        design: { cardGlowIntensity: 0.75, cardShadowSpread: 34, cardHoverGlowIncrease: 0.4, cardBorderRadius: 18, cardBackdropBlur: 8, cardInnerGlowWidth: 2 },
    },
    {
        id: 'card-spotlight-follow',
        name: 'Foco que segue o cursor',
        description: 'Uma luz suave acompanha o ponteiro por dentro do card.',
        keywords: ['spotlight', 'cursor', 'luz', 'mouse'],
        design: { cardSpotlightOpacity: 0.4, cardBorderRadius: 16, cardHoverTranslate: -4, borderBeamEnabled: false },
    },
    {
        id: 'card-beam-trace',
        name: 'Borda em movimento',
        description: 'Um traço de luz gira pela borda do card, sem mexer no resto.',
        keywords: ['feixe', 'beam', 'borda animada', 'giro'],
        design: { borderBeamEnabled: true, cardBorderWidth: 1, cardBorderRadius: 14, cardSpotlightOpacity: 0.1, cardBackdropBlur: 4 },
    },
    {
        id: 'card-horizontal',
        name: 'Em linha',
        description: 'O conteúdo corre na horizontal, alinhado à esquerda: bom para listas de itens largos.',
        keywords: ['horizontal', 'row', 'lista', 'linha'],
        design: { cardLayoutDirection: 'row', cardTextAlign: 'left', cardPaddingMd: 20, cardBorderRadius: 12, cardShadowBlur: 20 },
    },
    {
        id: 'card-centered',
        name: 'Centralizado',
        description: 'Texto centralizado e cantos redondos: vitrine de destaque ou número grande.',
        keywords: ['centro', 'center', 'destaque', 'vitrine'],
        design: { cardTextAlign: 'center', cardBorderRadius: 28, cardPaddingMd: 30, cardLayoutDirection: 'column', cardShadowBlur: 36 },
    },
    {
        id: 'card-leaf-corners',
        name: 'Cantos em folha',
        description: 'Dois cantos opostos bem redondos e dois quase retos: uma silhueta de folha.',
        keywords: ['folha', 'leaf', 'assimetrico', 'cantos'],
        design: { cardRadiusTL: 36, cardRadiusBR: 36, cardRadiusTR: 4, cardRadiusBL: 4, cardBorderWidth: 1, cardBackdropBlur: 0 },
    },
    {
        id: 'card-ghost-surface',
        name: 'Fantasma',
        description: 'Superfície quase transparente e borda tênue, deixando a atmosfera aparecer através do card.',
        keywords: ['transparente', 'ghost', 'vidro', 'translucido'],
        design: { cardSurfaceOpacity: 0.25, cardBorderOpacity: 0.35, cardBackdropBlur: 10, cardBorderRadius: 14, cardShadowBlur: 0, cardTextureOpacity: 0.04 },
    },
    {
        id: 'card-cast-shadow',
        name: 'Sombra projetada',
        description: 'Sombra deslocada para o lado e para baixo, dura e curta, como um recorte de papel.',
        keywords: ['sombra dura', 'recorte', 'papel', 'offset'],
        design: { cardShadowOffsetX: 8, cardShadowOffsetY: 8, cardShadowBlur: 0, cardShadowExpansion: 0, cardBorderRadius: 4, cardBorderWidth: 2, cardBackdropBlur: 0 },
    },
    {
        id: 'card-image-immersive',
        name: 'Imagem imersiva',
        description: 'No card de imagem, a foto cresce no hover e o véu escuro aprofunda o texto.',
        keywords: ['imagem', 'foto', 'zoom', 'image'],
        design: { imageCardHoverZoom: 1.18, imageCardOverlayOpacity: 0.65, imageCardShadowBlur: 44, imageCardShadowOffsetY: 16, imageCardShadowSpread: 4, imageCardGlowBlur: 20 },
    },
    {
        id: 'card-action-round',
        name: 'Ação em pílula',
        description: 'O botão de ação do card vira uma pílula e afunda ao clique.',
        keywords: ['acao', 'botao', 'pilula', 'clique'],
        design: { cardActionBtnBorderRadius: 40, cardActionBtnPadding: 20, cardActionClickScale: 0.9, cardTitleIconGlowBlur: 6 },
    },
    {
        id: 'card-title-loud',
        name: 'Título marcante',
        description: 'Título grande, pesado e espaçado, com brilho no ícone: o card abre com impacto.',
        keywords: ['titulo', 'impacto', 'heading', 'grande'],
        design: { cardTitleFontSize: 26, cardTitleFontWeight: '900', cardTitleLetterSpacing: 2, cardTitleIconGlowBlur: 28 },
    },
];
