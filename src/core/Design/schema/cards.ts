import { ComponentSchema } from '../types';
import { TEXTURE_OPTIONS } from './atmosphere';

/**
 * Mapeamento 100% Atômico: Cards & Superfícies (v12.0)
 * Governa a anatomia de todos os containers do sistema.
 */
export const CardSchema: ComponentSchema = {
    id: 'cards',
    label: 'Card Geral',
    tokens: [
        // --- GEOMETRIA ---
        {
            id: 'cardBorderRadius',
            label: 'Raio da Borda (Master)',
            type: 'slider',
            description: 'Raio de borda geral de todos os cards do sistema, em pixels, com valores independentes por breakpoint. É o valor "mestre" — os 4 cantos individuais (`cardRadiusTL/TR/BL/BR`) sobrescrevem por canto quando precisar de assimetria.',
            axis: 'geometry',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 120 },
            defaultValue: { mob: 8, tab: 12, desk: 12 },
            cssVars: ['--radius-theme', '--sarak-card-radius', '--sarak-card-radius-tl', '--sarak-card-radius-tr', '--sarak-card-radius-bl', '--sarak-card-radius-br']
        },
        {
            id: 'cardRadiusTL',
            label: 'Quina Superior Esquerda',
            type: 'slider',
            description: 'Raio de borda do canto superior esquerdo do card, em pixels — sobrescreve `cardBorderRadius` só nesse canto. Use para formas assimétricas.',
            axis: 'geometry',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 120 },
            defaultValue: { mob: 8, tab: 12, desk: 12 },
            cssVars: ['--sarak-card-radius-tl']
        },
        {
            id: 'cardRadiusTR',
            label: 'Quina Superior Direita',
            type: 'slider',
            description: 'Raio de borda do canto superior direito do card, em pixels — sobrescreve `cardBorderRadius` só nesse canto.',
            axis: 'geometry',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 120 },
            defaultValue: { mob: 8, tab: 12, desk: 12 },
            cssVars: ['--sarak-card-radius-tr']
        },
        {
            id: 'cardRadiusBL',
            label: 'Quina Inferior Esquerda',
            type: 'slider',
            description: 'Raio de borda do canto inferior esquerdo do card, em pixels — sobrescreve `cardBorderRadius` só nesse canto.',
            axis: 'geometry',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 120 },
            defaultValue: { mob: 8, tab: 12, desk: 12 },
            cssVars: ['--sarak-card-radius-bl']
        },
        {
            id: 'cardRadiusBR',
            label: 'Quina Inferior Direita',
            type: 'slider',
            description: 'Raio de borda do canto inferior direito do card, em pixels — sobrescreve `cardBorderRadius` só nesse canto.',
            axis: 'geometry',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 120 },
            defaultValue: { mob: 8, tab: 12, desk: 12 },
            cssVars: ['--sarak-card-radius-br']
        },
        {
            id: 'cardGeometricCut',
            label: 'Corte Geométrico (Chanfro)',
            type: 'slider',
            description: 'Tamanho, em pixels, de um chanfro (corte diagonal) aplicado a um canto do card — efeito geométrico alternativo ao arredondamento tradicional, dá um clima mais técnico/industrial. 0 desativa o corte.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 0, max: 100 },
            defaultValue: 0,
            cssVars: ['--sarak-card-geometric-cut']
        },

        // --- SUPERFÍCIE ---
        {
            id: 'cardBackdropBlur',
            label: 'Backdrop Blur (Glass)',
            type: 'slider',
            description: 'Intensidade do desfoque de fundo dos cards — só produz efeito visível quando o card tem fundo translúcido (`cardBackgroundColor` com opacidade baixa), criando um clima de vidro fosco (glassmorphism).',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 100 },
            defaultValue: 12,
            cssVars: ['--sarak-card-backdrop-blur', '--sarak-card-blur', '--sarak-glass-blur']
        },
        {
            id: 'cardSurfaceOpacity',
            label: 'Opacidade da Superfície',
            type: 'slider',
            description: 'Opacidade geral da superfície do card — valores baixos deixam o card mais transparente (mostra bastante do fundo atrás); valores altos o aproximam de uma superfície opaca comum.',
            axis: 'texture',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.8,
            cssVars: ['--sarak-card-surface-opacity', '--sarak-card-opacity']
        },

        // --- BORDAS & LINHAS ---
        {
            id: 'cardBorderWidth',
            label: 'Espessura da Borda',
            type: 'slider',
            description: 'Espessura da borda do card, em pixels. 0 remove a borda visível (depende de sombra/cor de fundo para demarcar o card); valores altos criam um contorno mais técnico/evidente.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 0, max: 20 },
            defaultValue: 1,
            cssVars: ['--card-border-width', '--theme-border-width', '--sarak-card-border-width']
        },
        {
            id: 'cardBorderOpacity',
            label: 'Opacidade da Borda',
            type: 'slider',
            description: 'Opacidade aplicada sobre `cardBorderColor` — permite atenuar a borda sem precisar reescrever a cor em formato rgba.',
            axis: 'color',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 1,
            cssVars: ['--sarak-card-border-opacity']
        },

        // --- BORDAS ASSIMÉTRICAS ---
        {
            id: 'cardBorderTop',
            label: 'Espessura: Topo',
            type: 'slider',
            description: 'Espessura da borda superior do card, em pixels — sobrescreve `cardBorderWidth` só nesse lado. Use para destacar um lado específico (ex. uma faixa de status colorida no topo).',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 0, max: 40 },
            defaultValue: 1,
            cssVars: ['--sarak-card-border-top']
        },
        {
            id: 'cardBorderBottom',
            label: 'Espessura: Base',
            type: 'slider',
            description: 'Espessura da borda inferior do card, em pixels — sobrescreve `cardBorderWidth` só nesse lado.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 0, max: 40 },
            defaultValue: 1,
            cssVars: ['--sarak-card-border-bottom']
        },
        {
            id: 'cardBorderLeft',
            label: 'Espessura: Esquerda',
            type: 'slider',
            description: 'Espessura da borda esquerda do card, em pixels — sobrescreve `cardBorderWidth` só nesse lado.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 0, max: 40 },
            defaultValue: 1,
            cssVars: ['--sarak-card-border-left']
        },
        {
            id: 'cardBorderRight',
            label: 'Espessura: Direita',
            type: 'slider',
            description: 'Espessura da borda direita do card, em pixels — sobrescreve `cardBorderWidth` só nesse lado.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 0, max: 40 },
            defaultValue: 1,
            cssVars: ['--sarak-card-border-right']
        },

        // --- ILUMINAÇÃO INTERNA ---
        {
            id: 'cardInnerGlowColor',
            label: 'Cor do Glow Interno',
            type: 'color',
            description: 'Cor de um brilho projetado para dentro da borda do card (inner glow) — cria uma sensação sutil de profundidade/luz interna, diferente do glow externo (`cardGlowColor`).',
            axis: 'elevation',
            defaultValue: 'rgba(255, 255, 255, 0.05)',
            cssVars: ['--sarak-card-inner-glow-color']
        },
        {
            id: 'cardInnerGlowWidth',
            label: 'Largura do Glow Interno',
            type: 'slider',
            description: 'Largura, em pixels, da faixa de brilho interno ao redor da borda do card.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 30 },
            defaultValue: 1,
            cssVars: ['--sarak-card-inner-glow-width']
        },

        // --- TEXTURA DO CARD ---
        {
            id: 'cardTextureType',
            label: 'Textura da Superfície',
            type: 'select',
            description: 'Padrão visual sobreposto à superfície do card (mesmo catálogo de texturas de `atmosphere.ts` — grid, ruído, grão etc.). "Nenhuma" mantém a superfície lisa; qualquer outra opção adiciona caráter/textura ao card.',
            axis: 'texture',
            constraints: {
                options: TEXTURE_OPTIONS
            },
            defaultValue: 'none',
            cssVars: ['--sarak-card-texture-type']
        },
        {
            id: 'cardTextureOpacity',
            label: 'Opacidade da Textura',
            type: 'slider',
            description: 'Opacidade da textura de superfície do card — só relevante quando `cardTextureType` é diferente de \'none\'. Valores baixos mantêm a textura discreta.',
            axis: 'texture',
            constraints: { min: 0, max: 1, step: 0.01 },
            defaultValue: 0.03,
            cssVars: ['--sarak-card-texture-opacity']
        },

        // --- HEADER ---
        {
            id: 'cardHeaderBg',
            label: 'Fundo do Header',
            type: 'color',
            description: 'Cor de fundo da seção de cabeçalho do card — normalmente sutilmente diferente do corpo do card, para separar visualmente o título das demais informações.',
            axis: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.03)',
            cssVars: ['--sarak-card-header-bg']
        },
        {
            id: 'cardHeaderBorder',
            label: 'Linha Divisora (Bottom)',
            type: 'color',
            description: 'Cor da linha divisória na base do cabeçalho do card, separando-o do corpo.',
            axis: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.05)',
            cssVars: ['--sarak-card-header-border']
        },
        {
            id: 'cardHeaderPadding',
            label: 'Padding Vertical',
            type: 'slider',
            description: 'Espaçamento interno vertical do cabeçalho do card, em pixels, com valores independentes por breakpoint.',
            axis: 'geometry',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 120 },
            defaultValue: { mob: 12, tab: 16, desk: 16 },
            cssVars: ['--sarak-card-header-padding']
        },

        // --- FOOTER ---
        {
            id: 'cardFooterBg',
            label: 'Fundo do Footer',
            type: 'color',
            description: 'Cor de fundo da seção de rodapé do card — "transparent" por padrão, deixando o rodapé se misturar visualmente com o corpo do card.',
            axis: 'color',
            defaultValue: 'transparent',
            cssVars: ['--sarak-card-footer-bg']
        },
        {
            id: 'cardFooterBorder',
            label: 'Linha Divisora (Top)',
            type: 'color',
            description: 'Cor da linha divisória no topo do rodapé do card, separando-o do corpo.',
            axis: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.05)',
            cssVars: ['--sarak-card-footer-border']
        },

        // --- EFEITOS & GLOW ---
        {
            id: 'cardShadowSpread',
            label: 'Espalhamento da Sombra',
            type: 'slider',
            description: 'Espalhamento (spread), em pixels, da sombra base do card — valores maiores aumentam a área ocupada pela sombra antes do desfoque, dando mais presença/peso ao card.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 200 },
            defaultValue: 20,
            cssVars: ['--sarak-card-shadow-spread']
        },
        {
            id: 'cardGlowColor',
            label: 'Cor do Brilho (Neon)',
            type: 'color',
            description: 'Cor do brilho externo ao redor do card — normalmente uma versão translúcida da cor primária, usada para dar destaque neon/tech ao card. Combine com `cardGlowIntensity`.',
            axis: 'elevation',
            defaultValue: 'rgba(0, 242, 255, 0.05)',
            cssVars: ['--sarak-card-glow-color']
        },
        {
            id: 'cardGlowIntensity',
            label: 'Intensidade do Brilho',
            type: 'slider',
            description: 'Intensidade do brilho externo do card — 0 desativa o efeito completamente; valores altos tornam o glow o traço visual dominante do card.',
            axis: 'elevation',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0,
            cssVars: ['--sarak-card-glow-intensity']
        },

        // --- INTERAÇÃO (HOVER) ---
        {
            id: 'cardHoverTranslate',
            label: 'Elevação no Hover (Y)',
            type: 'slider',
            description: 'Deslocamento vertical do card ao passar o mouse, em pixels — valores negativos "elevam" o card (sobe), dando feedback tátil de interatividade. É o token consumido pelo estilo de hover \'lift\' de `cardHoverStyle` (`animations.ts`).',
            axis: 'motion',
            unit: 'px',
            constraints: { min: -50, max: 10 },
            defaultValue: -4,
            cssVars: ['--sarak-card-hover-y']
        },
        {
            id: 'cardHoverGlowIncrease',
            label: 'Aumento de Brilho',
            type: 'slider',
            description: 'Quanto o brilho do card (`cardGlowIntensity`) aumenta adicionalmente no hover — reforça o feedback de interatividade combinado com `cardHoverTranslate`.',
            axis: 'elevation',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.2,
            cssVars: ['--sarak-card-hover-glow']
        },
        {
            id: 'cardSpotlightOpacity',
            label: 'Opacidade do Spotlight',
            type: 'slider',
            description: 'Opacidade de um efeito de "spotlight" que segue o cursor do mouse sobre o card (iluminação radial no ponto do cursor) — 0 desativa o efeito.',
            axis: 'elevation',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.1,
            cssVars: ['--spotlight-opacity']
        },

        // --- ESCALA DE ESPAÇAMENTO ---
        {
            id: 'cardPaddingMd',
            label: 'Padding Interno (MD)',
            type: 'slider',
            description: 'Espaçamento interno padrão do corpo do card, em pixels, com valores independentes por breakpoint — a escala de padding mais usada entre os cards do sistema.',
            axis: 'geometry',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 120 },
            defaultValue: { mob: 16, tab: 20, desk: 24 },
            cssVars: ['--sarak-card-padding-md', '--theme-gap']
        },

        // --- ESTRUTURA (LAYOUT DATA-DRIVEN) ---
        {
            id: 'cardLayoutDirection',
            label: 'Direção do Layout',
            type: 'select',
            description: 'Direção de empilhamento do conteúdo interno do card — Vertical é o padrão (imagem/título acima, corpo abaixo); Horizontal organiza os elementos lado a lado (comum em cards de lista compactos).',
            axis: 'geometry',
            constraints: {
                options: [
                    { id: 'column', value: 'column', label: 'Vertical (Coluna)' },
                    { id: 'row', value: 'row', label: 'Horizontal (Linha)' }
                ]
            },
            defaultValue: 'column',
            cssVars: ['--sarak-card-layout-direction'],
            structuralConsumer: ['useCardLayoutStyles']
        },
        {
            id: 'cardImagePosition',
            label: 'Posição da Imagem',
            type: 'select',
            description: 'Posição da imagem de capa dentro do card — Nenhuma remove a imagem; Topo é o padrão para cards verticais; Esquerda/Direita posicionam a imagem lateralmente em cards horizontais.',
            axis: 'geometry',
            constraints: {
                options: [
                    { id: 'none', value: 'none', label: 'Nenhuma' },
                    { id: 'top', value: 'top', label: 'Topo' },
                    { id: 'left', value: 'left', label: 'Esquerda' },
                    { id: 'right', value: 'right', label: 'Direita' }
                ]
            },
            defaultValue: 'top',
            cssVars: ['--sarak-card-image-position'],
            structuralConsumer: ['useCardLayoutStyles', 'useStructuralStyles.getCardStyles']
        },
        {
            id: 'cardTextAlign',
            label: 'Alinhamento de Texto',
            type: 'select',
            description: 'Alinhamento horizontal do texto dentro do card — Esquerda é o padrão para leitura; Centro é comum em cards de destaque/hero; Direita é raro, usado em contextos específicos (ex. RTL ou layouts espelhados).',
            axis: 'geometry',
            constraints: {
                options: [
                    { id: 'left', value: 'left', label: 'Esquerda' },
                    { id: 'center', value: 'center', label: 'Centro' },
                    { id: 'right', value: 'right', label: 'Direita' }
                ]
            },
            defaultValue: 'left',
            cssVars: ['--sarak-card-text-align'],
            structuralConsumer: ['useCardLayoutStyles']
        },
        {
            id: 'cardContentAlignment',
            label: 'Alinhamento do Conteúdo',
            type: 'select',
            description: 'Alinhamento vertical/distribuição do conteúdo interno do card — Início agrupa no topo; Centro centraliza; Espaçado (Between) empurra os elementos para as extremidades (útil quando o rodapé deve "grudar" na base do card).',
            axis: 'geometry',
            constraints: {
                options: [
                    { id: 'start', value: 'start', label: 'Início' },
                    { id: 'center', value: 'center', label: 'Centro' },
                    { id: 'space-between', value: 'space-between', label: 'Espaçado (Between)' }
                ]
            },
            defaultValue: 'start',
            cssVars: ['--sarak-card-content-alignment'],
            structuralConsumer: ['useStructuralStyles.getCardStyles']
        },
        {
            id: 'cardShadow',
            label: 'Sombra do Card (CSS)',
            type: 'text',
            description: 'Definição CSS completa de `box-shadow` do card — permite compor sombras arbitrárias (múltiplas camadas) que os tokens numéricos individuais não cobrem. "none" desativa qualquer sombra.',
            axis: 'elevation',
            defaultValue: 'none',
            cssVars: ['--sarak-card-shadow']
        },
        {
            id: 'borderBeamEnabled',
            label: 'Ativar Border Beam',
            type: 'boolean',
            description: 'Ativa um traço luminoso animado percorrendo a borda do card (efeito "Border Beam"), o mesmo conceito de `cardSearchBorderBeamActive` mas aplicável a qualquer card do sistema.',
            defaultValue: false
        },

        // --- ESPECIALIZAÇÕES (GRANULARIDADE) ---
        {
            id: 'cardVariant',
            label: 'Variante de Card',
            type: 'select',
            description: 'Especialização de card a ser renderizada — Classic (detalhe genérico), Sleek Title (metadados de título), Tactile CTA (ação/botão) ou Reactive Search (filtro de busca). Cada variante ativa os tokens das famílias `cardTitle`/`cardAction`/`cardSearch` correspondentes.',
            axis: 'texture',
            constraints: {
                options: [
                    { id: 'classic', value: 'classic', label: 'Classic IA Detail Card' },
                    { id: 'title', value: 'title', label: 'Sleek Title Metadata Card' },
                    { id: 'action', value: 'action', label: 'Tactile CTA Action Card' },
                    { id: 'search', value: 'search', label: 'Reactive Search Filter Card' }
                ]
            },
            defaultValue: 'classic',
            cssVars: ['--sarak-card-variant']
        },

        // --- IMAGE CARDS ---
        {
            id: 'imageCardOverlayOpacity',
            label: 'Opacidade do Overlay (Imagem)',
            type: 'slider',
            description: 'Opacidade da camada escura sobreposta a uma imagem de capa de card — melhora a legibilidade de texto exibido sobre a imagem. Valores baixos preservam mais a imagem original; valores altos priorizam a leitura do texto.',
            axis: 'elevation',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.5,
            cssVars: ['--sarak-image-card-overlay-opacity']
        },
        {
            id: 'imageCardHoverZoom',
            label: 'Escala de Zoom no Hover (Imagem)',
            type: 'slider',
            description: 'Fator de zoom aplicado à imagem de capa do card ao passar o mouse — 1.0 sem efeito; valores acima disso criam um leve zoom que reforça a interatividade do card.',
            axis: 'motion',
            constraints: { min: 1, max: 1.5, step: 0.01 },
            defaultValue: 1.05,
            cssVars: ['--sarak-image-card-hover-zoom']
        },
        {
            id: 'imageCardShadowOffsetY',
            label: 'Sombra do Image Card: Offset Y',
            type: 'slider',
            description: 'Deslocamento vertical da sombra projetada por um card com imagem de capa, em pixels.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 30 },
            defaultValue: 10,
            cssVars: ['--sarak-image-card-shadow-offset-y']
        },
        {
            id: 'imageCardShadowBlur',
            label: 'Sombra do Image Card: Desfoque',
            type: 'slider',
            description: 'Raio de desfoque da sombra projetada por um card com imagem de capa.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 60 },
            defaultValue: 30,
            cssVars: ['--sarak-image-card-shadow-blur']
        },
        {
            id: 'imageCardShadowSpread',
            label: 'Sombra do Image Card: Espalhamento',
            type: 'slider',
            description: 'Espalhamento da sombra projetada por um card com imagem de capa.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 30 },
            defaultValue: 10,
            cssVars: ['--sarak-image-card-shadow-spread']
        },
        {
            id: 'imageCardGlowBlur',
            label: 'Image Card: Desfoque do Glow Interno',
            type: 'slider',
            description: 'Raio de desfoque de um brilho interno aplicado a cards com imagem de capa — reforço visual sutil ao redor da imagem.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 80 },
            defaultValue: 40,
            cssVars: ['--sarak-image-card-glow-blur']
        },

        // --- TEMPLATES: MANAGEMENT GROUP CARD (Spec 27) ---
        {
            id: 'managementGroupListMaxHeight',
            label: 'Management Group: Altura Máxima da Lista',
            type: 'slider',
            description: 'Altura máxima, em pixels, da lista de itens dentro de um `ManagementGroupCard` — acima desse limite a lista recebe scroll interno.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 100, max: 800 },
            defaultValue: 340,
            cssVars: ['--sarak-management-group-list-max-height']
        },
        {
            id: 'managementGroupDescMaxWidth',
            label: 'Management Group: Largura Máxima da Descrição',
            type: 'slider',
            description: 'Largura máxima, em pixels, do texto de descrição de um item dentro do `ManagementGroupCard` — evita que descrições longas quebrem o layout do card.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 60, max: 400 },
            defaultValue: 140,
            cssVars: ['--sarak-management-group-desc-max-width']
        },

        // --- TEMPLATES: RECURSIVE MATRIX NODE (Spec 27) ---
        {
            id: 'matrixNodeMinWidth',
            label: 'Matrix Node: Largura Mínima',
            type: 'slider',
            description: 'Largura mínima, em pixels, de um nó filho dentro do `SarakExpandableMatrix` — evita que nós com pouco conteúdo fiquem espremidos.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 60, max: 400 },
            defaultValue: 140,
            cssVars: ['--sarak-matrix-node-min-width']
        },

        // --- TEMPLATES: SECURITY / MFA (Spec 27) ---
        {
            id: 'mfaQrCodeSize',
            label: 'MFA: Tamanho do QR Code',
            type: 'slider',
            description: 'Tamanho, em pixels, do QR Code exibido na tela de configuração de autenticação de dois fatores (MFA).',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 100, max: 400 },
            defaultValue: 200,
            cssVars: ['--sarak-mfa-qr-code-size']
        },

        // --- TEMPLATES: CATALOG / CARD GRID (Spec 27) ---
        {
            id: 'catalogFilterMinWidth',
            label: 'Catálogo: Largura Mínima do Filtro',
            type: 'slider',
            description: 'Largura mínima, em pixels, de cada campo de filtro na grade de catálogo — garante que os filtros continuem utilizáveis mesmo em containers estreitos.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 80, max: 320 },
            defaultValue: 160,
            cssVars: ['--sarak-catalog-filter-min-width']
        },
        {
            id: 'catalogSectionRadius',
            label: 'Catálogo: Arredondamento da Seção',
            type: 'slider',
            description: 'Raio de borda de uma seção inteira da grade de catálogo, em `rem`.',
            axis: 'geometry',
            unit: 'rem',
            constraints: { min: 0, max: 4, step: 0.25 },
            defaultValue: 3,
            cssVars: ['--sarak-catalog-section-radius']
        },
        {
            id: 'catalogItemRadius',
            label: 'Catálogo: Arredondamento do Item',
            type: 'slider',
            description: 'Raio de borda de cada item individual dentro da grade de catálogo, em `rem` — normalmente menor que `catalogSectionRadius` para manter hierarquia visual entre seção e item.',
            axis: 'geometry',
            unit: 'rem',
            constraints: { min: 0, max: 4, step: 0.25 },
            defaultValue: 2,
            cssVars: ['--sarak-catalog-item-radius']
        },

        // --- DESIGN ENGINE CANVAS: SOMBRAS DE PREVIEW DE PRESET (Spec 28) ---
        {
            id: 'presetCardHoverShadowOffsetY',
            label: 'Preview de Preset: Sombra de Hover — Offset Y',
            type: 'slider',
            description: 'Deslocamento vertical da sombra de um card de preview de preset ao passar o mouse, dentro da ferramenta de customização (Design Engine).',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 30 },
            defaultValue: 10,
            cssVars: ['--sarak-preset-card-hover-shadow-offset-y']
        },
        {
            id: 'presetCardHoverShadowBlur',
            label: 'Preview de Preset: Sombra de Hover — Desfoque',
            type: 'slider',
            description: 'Raio de desfoque da sombra de hover de um card de preview de preset.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 80 },
            defaultValue: 40,
            cssVars: ['--sarak-preset-card-hover-shadow-blur']
        },
        {
            id: 'presetCardHoverShadowSpread',
            label: 'Preview de Preset: Sombra de Hover — Espalhamento',
            type: 'slider',
            description: 'Espalhamento da sombra de hover de um card de preview de preset.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 30 },
            defaultValue: 10,
            cssVars: ['--sarak-preset-card-hover-shadow-spread']
        },
        {
            id: 'presetGlowShadowBlur',
            label: 'Preview de Preset: Glow Simples — Desfoque',
            type: 'slider',
            description: 'Raio de desfoque de um brilho simples aplicado a cards de preview de preset — variante mais leve que o glow "grande" (`presetGlowShadowBlurLg`).',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 40 },
            defaultValue: 20,
            cssVars: ['--sarak-preset-glow-shadow-blur']
        },
        {
            id: 'presetGlowShadowBlurLg',
            label: 'Preview de Preset: Glow Simples — Desfoque Grande',
            type: 'slider',
            description: 'Raio de desfoque da variante "grande" do brilho simples de cards de preview de preset — usado em previews de maior destaque.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 60 },
            defaultValue: 32,
            cssVars: ['--sarak-preset-glow-shadow-blur-lg']
        },
        {
            id: 'presetPreviewPaddingY',
            label: 'Preview de Preset: Padding Vertical',
            type: 'slider',
            description: 'Espaçamento interno vertical do card de preview de preset, em pixels.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 0, max: 24 },
            defaultValue: 12,
            cssVars: ['--sarak-preset-preview-padding-y']
        },
        {
            id: 'presetMatteShadowBlur1',
            label: 'Preview de Preset: Sombra Matte — Desfoque 1',
            type: 'slider',
            description: 'Raio de desfoque da primeira camada de uma sombra "matte" (composta por múltiplas camadas) usada em cards de preview de preset com estilo fosco/sólido.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 30 },
            defaultValue: 15,
            cssVars: ['--sarak-preset-matte-shadow-blur1']
        },
        {
            id: 'presetMatteShadowSpread1',
            label: 'Preview de Preset: Sombra Matte — Espalhamento 1',
            type: 'slider',
            description: 'Espalhamento da primeira camada da sombra "matte" de cards de preview de preset.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 10 },
            defaultValue: 3,
            cssVars: ['--sarak-preset-matte-shadow-spread1']
        },
        {
            id: 'presetMatteShadowOffsetY2',
            label: 'Preview de Preset: Sombra Matte — Offset Y 2',
            type: 'slider',
            description: 'Deslocamento vertical da segunda camada da sombra "matte" de cards de preview de preset — combinada com a primeira camada para um efeito de sombra mais realista/suave.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 10 },
            defaultValue: 4,
            cssVars: ['--sarak-preset-matte-shadow-offset-y2']
        },
        {
            id: 'presetMatteShadowBlur2',
            label: 'Preview de Preset: Sombra Matte — Desfoque 2',
            type: 'slider',
            description: 'Raio de desfoque da segunda camada da sombra "matte" de cards de preview de preset.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 12 },
            defaultValue: 6,
            cssVars: ['--sarak-preset-matte-shadow-blur2']
        },
        {
            id: 'presetMatteShadowSpread2',
            label: 'Preview de Preset: Sombra Matte — Espalhamento 2',
            type: 'slider',
            description: 'Espalhamento da segunda camada da sombra "matte" de cards de preview de preset.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 10 },
            defaultValue: 4,
            cssVars: ['--sarak-preset-matte-shadow-spread2']
        },
        {
            id: 'presetPreviewMinHeight',
            label: 'Preview de Preset: Altura Mínima',
            type: 'slider',
            description: 'Altura mínima, em pixels, do card de preview de um preset dentro da ferramenta de customização — evita "salto" de layout enquanto o preview carrega.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 100, max: 500 },
            defaultValue: 320,
            cssVars: ['--sarak-preset-preview-min-height']
        },
        {
            id: 'presetMiniCardMaxWidth',
            label: 'Preview de Preset: Largura Máxima do Mini-Card',
            type: 'slider',
            description: 'Largura máxima, em pixels, de um mini-card usado para representar visualmente um preset numa lista/grade de opções.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 100, max: 400 },
            defaultValue: 280,
            cssVars: ['--sarak-preset-mini-card-max-width']
        },
        {
            id: 'presetMiniCardHeight',
            label: 'Preview de Preset: Altura do Mini-Card',
            type: 'slider',
            description: 'Altura, em pixels, de um mini-card usado para representar visualmente um preset numa lista/grade de opções.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 60, max: 300 },
            defaultValue: 128,
            cssVars: ['--sarak-preset-mini-card-height']
        },
        {
            id: 'presetCardShadowOffsetY',
            label: 'Preview de Preset: Sombra do Card — Offset Y',
            type: 'slider',
            description: 'Deslocamento vertical da sombra base (em repouso, sem hover) de um card de preview de preset.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 10 },
            defaultValue: 4,
            cssVars: ['--sarak-preset-card-shadow-offset-y']
        },
        {
            id: 'presetCardShadowBlur',
            label: 'Preview de Preset: Sombra do Card — Desfoque',
            type: 'slider',
            description: 'Raio de desfoque da sombra base de um card de preview de preset.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 20 },
            defaultValue: 10,
            cssVars: ['--sarak-preset-card-shadow-blur']
        },
        {
            id: 'presetCardShadowSpread',
            label: 'Preview de Preset: Sombra do Card — Espalhamento (negativo)',
            type: 'slider',
            description: 'Espalhamento (aplicado como valor negativo) da sombra base de um card de preview de preset — contrai a sombra para mais perto do card, efeito comum em sombras sutis de UI.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 10 },
            defaultValue: 2,
            cssVars: ['--sarak-preset-card-shadow-spread']
        },
        {
            id: 'presetGridTextureSize',
            label: 'Preview de Preset: Tamanho da Textura de Grade',
            type: 'slider',
            description: 'Tamanho, em pixels, da célula de uma textura de grade decorativa exibida no fundo do preview de preset.',
            axis: 'texture',
            unit: 'px',
            constraints: { min: 4, max: 20 },
            defaultValue: 8,
            cssVars: ['--sarak-preset-grid-texture-size']
        },

        // --- DESIGN ENGINE CANVAS: KITCHEN SINK PREVIEW (Spec 28) ---
        {
            id: 'controlHeightToggle',
            label: 'Kitchen Sink: Altura do Toggle',
            type: 'slider',
            description: 'Altura, em pixels, do controle de switch/toggle exibido na tela de preview "kitchen sink" (galeria de todos os componentes) da ferramenta de customização.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 24, max: 64 },
            defaultValue: 46,
            cssVars: ['--sarak-control-height-toggle']
        },
        {
            id: 'progressBarMaxWidth',
            label: 'Kitchen Sink: Largura Máxima da Barra de Progresso',
            type: 'slider',
            description: 'Largura máxima, em pixels, da barra de progresso exibida na tela de preview "kitchen sink".',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 40, max: 300 },
            defaultValue: 100,
            cssVars: ['--sarak-progress-bar-max-width']
        },
        {
            id: 'cardHoverLift',
            label: 'Kitchen Sink: Elevação no Hover',
            type: 'slider',
            description: 'Elevação, em pixels, aplicada aos cards de exemplo na tela de preview "kitchen sink" ao passar o mouse — equivalente de demonstração de `cardHoverTranslate`.',
            axis: 'motion',
            unit: 'px',
            constraints: { min: 0, max: 12 },
            defaultValue: 4,
            cssVars: ['--sarak-card-hover-lift']
        },

        // --- DESIGN ENGINE CANVAS: PREVIEW CANVAS (MOCKUP DE DISPOSITIVO) (Spec 28) ---
        {
            id: 'devicePhoneWidth',
            label: 'Preview Canvas: Largura do Telefone',
            type: 'slider',
            description: 'Largura, em pixels, do mockup de dispositivo "telefone" exibido no canvas de preview responsivo da ferramenta de customização.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 300, max: 450 },
            defaultValue: 375,
            cssVars: ['--sarak-device-phone-width']
        },
        {
            id: 'devicePhoneHeight',
            label: 'Preview Canvas: Altura do Telefone',
            type: 'slider',
            description: 'Altura, em pixels, do mockup de dispositivo "telefone" exibido no canvas de preview responsivo.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 600, max: 1000 },
            defaultValue: 812,
            cssVars: ['--sarak-device-phone-height']
        },
        {
            id: 'deviceTabletHeight',
            label: 'Preview Canvas: Altura do Tablet',
            type: 'slider',
            description: 'Altura, em pixels, do mockup de dispositivo "tablet" exibido no canvas de preview responsivo.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 700, max: 1400 },
            defaultValue: 1024,
            cssVars: ['--sarak-device-tablet-height']
        },
        {
            id: 'devicePhoneNotchRadius',
            label: 'Preview Canvas: Arredondamento do Notch',
            type: 'slider',
            description: 'Raio de borda do "notch" (recorte da câmera) desenhado no mockup de telefone, em `rem`.',
            axis: 'geometry',
            unit: 'rem',
            constraints: { min: 0, max: 3, step: 0.25 },
            defaultValue: 1,
            cssVars: ['--sarak-device-phone-notch-radius']
        },
        {
            id: 'deviceFrameRadius',
            label: 'Preview Canvas: Arredondamento da Moldura',
            type: 'slider',
            description: 'Raio de borda da moldura externa dos mockups de dispositivo (telefone/tablet), em `rem`.',
            axis: 'geometry',
            unit: 'rem',
            constraints: { min: 0, max: 4, step: 0.25 },
            defaultValue: 2,
            cssVars: ['--sarak-device-frame-radius']
        },
        {
            id: 'deviceDesktopMinWidth',
            label: 'Preview Canvas: Largura Mínima do Desktop',
            type: 'slider',
            description: 'Largura mínima, em pixels, do mockup de dispositivo "desktop" exibido no canvas de preview responsivo.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 150, max: 400 },
            defaultValue: 250,
            cssVars: ['--sarak-device-desktop-min-width']
        }
    ]
};

