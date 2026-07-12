import { ComponentSchema } from '../types';

/**
 * SCHEMA: MÓDULOS ESPECIAIS & IA
 * Governa componentes complexos de domínio específico e IA.
 */
export const SpecializedSchema: ComponentSchema = {
    id: 'specialized',
    label: 'Ícones e Estética',
    tokens: [
        {
            id: 'aiPanelBg',
            label: 'Fundo do Painel IA',
            type: 'color',
            description: 'Cor de fundo de um painel dedicado a interações de IA. Nota: token catalogado sem componente "Painel IA" consumidor identificado no momento — ver backlog de cobertura, spec 01.',
            axis: 'color',
            defaultValue: 'rgba(0, 0, 0, 0.4)',
            cssVars: ['--sarak-ai-panel-bg']
        },
        {
            id: 'aiGlowColor',
            label: 'Cor do Brilho IA',
            type: 'color',
            description: 'Cor de brilho associada a elementos de IA (ex. indicador de "pensando"/streaming). Mesma pendência de `aiPanelBg`: sem consumidor identificado no momento.',
            axis: 'elevation',
            defaultValue: '#00f2ff',
            cssVars: ['--sarak-ai-glow']
        },
        {
            id: 'flowNodeRadius',
            label: 'Raio dos Nós (Fluxo)',
            type: 'slider',
            description: 'Raio de borda dos nós de um diagrama de fluxo (flow chart), em pixels, com valores independentes por breakpoint.',
            axis: 'geometry',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 40, step: 1 },
            defaultValue: { mob: 8, tab: 10, desk: 12 },
            cssVars: ['--sarak-flow-radius', '--sarak-flow-node-radius']
        },
        {
            id: 'flowGridStyle',
            label: 'Estilo do Grid (Fluxo)',
            type: 'select',
            description: 'Padrão do grid de fundo de um diagrama de fluxo — Dots (pontos discretos, o padrão) ou Lines (linhas contínuas, clima mais técnico/blueprint).',
            axis: 'texture',
            defaultValue: 'dots',
            options: [
                { value: 'dots', label: 'Dots (Standard)' },
                { value: 'lines', label: 'Lines (Technical)' }
            ],
            cssVars: ['--sarak-flow-grid']
        },

        // --- GRADE DE PONTOS DECORATIVA (Spec 27 — compartilhada por SarakEmptyState/AuthHero) ---
        {
            id: 'dotGridDotOffset',
            label: 'Grade de Pontos: Offset do Ponto',
            type: 'slider',
            description: 'Deslocamento, em pixels, de cada ponto dentro do seu tile na grade decorativa de pontos (compartilhada por `SarakEmptyState`/`AuthHero`) — pequenos ajustes evitam que os pontos fiquem perfeitamente colados às bordas do tile.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 0, max: 10 },
            defaultValue: 2,
            cssVars: ['--sarak-dot-grid-dot-offset']
        },
        {
            id: 'dotGridDotSize',
            label: 'Grade de Pontos: Raio do Ponto',
            type: 'slider',
            description: 'Raio de cada ponto individual da grade decorativa, em pixels — valores maiores tornam o padrão mais denso/visível.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 0, max: 6 },
            defaultValue: 1,
            cssVars: ['--sarak-dot-grid-dot-size']
        },
        {
            id: 'dotGridTileSize',
            label: 'Grade de Pontos: Tamanho do Tile',
            type: 'slider',
            description: 'Tamanho, em pixels, de cada célula/tile que se repete para formar a grade de pontos — controla o espaçamento entre pontos vizinhos.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 10, max: 100 },
            defaultValue: 40,
            cssVars: ['--sarak-dot-grid-tile-size']
        },

        // --- SARAK EMPTY STATE (Spec 27) ---
        {
            id: 'emptyStateOrbOuter',
            label: 'Empty State: Diâmetro do Anel Externo',
            type: 'slider',
            description: 'Diâmetro, em pixels, do anel decorativo mais externo exibido em telas de estado vazio (`SarakEmptyState`) — define o tamanho geral da composição decorativa.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 100, max: 900 },
            defaultValue: 500,
            cssVars: ['--sarak-empty-state-orb-outer']
        },
        {
            id: 'emptyStateOrbInner',
            label: 'Empty State: Diâmetro do Anel Interno / Orb',
            type: 'slider',
            description: 'Diâmetro, em pixels, do orbe/anel interno da composição decorativa do estado vazio — deve ser menor que `emptyStateOrbOuter` para manter a proporção do efeito.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 100, max: 600 },
            defaultValue: 300,
            cssVars: ['--sarak-empty-state-orb-inner']
        },
        {
            id: 'emptyStateOrbBlur',
            label: 'Empty State: Desfoque do Orb',
            type: 'slider',
            description: 'Intensidade do desfoque aplicado ao orbe decorativo do estado vazio — valores altos criam um brilho ambiente difuso em vez de uma forma nítida.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 200 },
            defaultValue: 100,
            cssVars: ['--sarak-empty-state-orb-blur']
        },
        {
            id: 'emptyStateVoidLetterOffset',
            label: 'Empty State: Offset da Letra (VOID)',
            type: 'slider',
            description: 'Deslocamento, em `em`, de uma letra decorativa de destaque (ex. "VOID") na composição do estado vazio — ajuste fino de posicionamento tipográfico dentro da cena.',
            axis: 'geometry',
            unit: 'em',
            constraints: { min: 0, max: 2, step: 0.1 },
            defaultValue: 0.8,
            cssVars: ['--sarak-empty-state-void-letter-offset']
        },
        {
            id: 'emptyStateRingRadius',
            label: 'Empty State: Arredondamento do Anel Tracejado',
            type: 'slider',
            description: 'Raio de borda do anel tracejado decorativo do estado vazio, em `rem`.',
            axis: 'geometry',
            unit: 'rem',
            constraints: { min: 0, max: 4, step: 0.25 },
            defaultValue: 2,
            cssVars: ['--sarak-empty-state-ring-radius']
        },
        {
            id: 'emptyStateCaptionMaxWidth',
            label: 'Empty State: Largura Máxima da Legenda',
            type: 'slider',
            description: 'Largura máxima, em pixels, do texto explicativo abaixo da composição decorativa do estado vazio — evita linhas de texto excessivamente longas.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 100, max: 500 },
            defaultValue: 280,
            cssVars: ['--sarak-empty-state-caption-max-width']
        },

        // --- SARAK SKELETON (Spec 27) ---
        {
            id: 'skeletonRowHeight',
            label: 'Skeleton: Altura Padrão da Linha',
            type: 'slider',
            description: 'Altura padrão, em `rem`, de uma linha de placeholder de carregamento (skeleton) — deve aproximar-se da altura real do conteúdo que ela substitui, para minimizar "salto" de layout quando o conteúdo real carrega.',
            axis: 'geometry',
            unit: 'rem',
            constraints: { min: 0.25, max: 4, step: 0.25 },
            defaultValue: 1,
            cssVars: ['--sarak-skeleton-row-height']
        },
        {
            id: 'skeletonCircleSize',
            label: 'Skeleton: Diâmetro Padrão (Circle)',
            type: 'slider',
            description: 'Diâmetro padrão, em `rem`, de um placeholder circular de carregamento (ex. avatar) — deve aproximar-se do tamanho real do elemento que substitui.',
            axis: 'geometry',
            unit: 'rem',
            constraints: { min: 0.5, max: 6, step: 0.25 },
            defaultValue: 2.5,
            cssVars: ['--sarak-skeleton-circle-size']
        },
        {
            id: 'skeletonRowRadius',
            label: 'Skeleton: Arredondamento da Linha/Bloco',
            type: 'slider',
            description: 'Raio de borda dos blocos/linhas de placeholder de carregamento, em pixels.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 0, max: 20 },
            defaultValue: 4,
            cssVars: ['--sarak-skeleton-row-radius']
        },

        // --- TEMPLATES: AUTH HERO (Spec 27) ---
        {
            id: 'authHeroOrbBlur',
            label: 'Auth Hero: Desfoque dos Orbs de Fundo',
            type: 'slider',
            description: 'Intensidade do desfoque dos orbes decorativos de fundo na tela de autenticação (`AuthHero`) — cria um clima ambiente/atmosférico atrás do formulário de login.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 250 },
            defaultValue: 120,
            cssVars: ['--sarak-auth-hero-orb-blur']
        },

        // --- ENGINES: PLACEHOLDERS DE ALTURA MÍNIMA (Spec 28) ---
        {
            id: 'chartEngineMinHeight',
            label: 'Engine de Gráficos: Altura Mínima',
            type: 'slider',
            description: 'Altura mínima, em pixels, reservada para o motor de gráficos antes dos dados carregarem — evita que o layout "pule" quando o gráfico é renderizado.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 100, max: 400 },
            defaultValue: 180,
            cssVars: ['--sarak-chart-engine-min-h']
        },
        {
            id: 'engineMinHeightLg',
            label: 'Engines: Altura Mínima (Grande)',
            type: 'slider',
            description: 'Altura mínima genérica, em pixels, para motores/engines de conteúdo grandes (ex. um flow builder em tela cheia) antes do conteúdo carregar.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 200, max: 800 },
            defaultValue: 500,
            cssVars: ['--sarak-engine-min-h-lg']
        },
        {
            id: 'engineMinHeightSm',
            label: 'Engines: Altura Mínima (Pequena)',
            type: 'slider',
            description: 'Altura mínima genérica, em pixels, para motores/engines de conteúdo compactos (ex. um preview embutido) antes do conteúdo carregar.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 100, max: 500 },
            defaultValue: 300,
            cssVars: ['--sarak-engine-min-h-sm']
        },

        // --- CHAT ENGINE (Spec 28) ---
        {
            id: 'chatBubbleGlassBlur',
            label: 'Chat Engine: Desfoque de Vidro da Bolha',
            type: 'slider',
            description: 'Intensidade do desfoque de vidro da bolha de mensagem no motor de chat avançado (`SarakChatEngine`) — equivalente ao `chatBubbleStyle: glass` de `chat.ts`, mas específico deste motor.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 30 },
            defaultValue: 12,
            cssVars: ['--sarak-chat-bubble-blur']
        },

        // --- FLOW ENGINE (Spec 28) ---
        {
            id: 'flowNodePadding',
            label: 'Flow Engine: Padding do Nó',
            type: 'slider',
            description: 'Espaçamento interno de cada nó do motor de diagrama de fluxo, em pixels.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 0, max: 24 },
            defaultValue: 10,
            cssVars: ['--sarak-flow-node-padding']
        },
        {
            id: 'flowNodeBlur',
            label: 'Flow Engine: Desfoque do Nó',
            type: 'slider',
            description: 'Intensidade do desfoque de fundo de cada nó do motor de fluxo — só relevante quando os nós usam fundo translúcido.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 20 },
            defaultValue: 5,
            cssVars: ['--sarak-flow-node-blur']
        },
        {
            id: 'flowHandleSize',
            label: 'Flow Engine: Tamanho do Handle',
            type: 'slider',
            description: 'Diâmetro, em pixels, dos "handles" (pontos de conexão arrastáveis) entre nós no motor de fluxo — maior facilita o clique/arraste em telas touch.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 4, max: 16 },
            defaultValue: 8,
            cssVars: ['--sarak-flow-handle-size']
        },

        // --- VISUAL ENGINE (Spec 28) ---
        {
            id: 'visualPerspective',
            label: 'Visual Engine: Perspectiva 3D',
            type: 'slider',
            description: 'Distância de perspectiva CSS 3D (`perspective`), em pixels, usada por composições visuais com profundidade/rotação — valores baixos exageram o efeito 3D (distorção forte); valores altos suavizam a profundidade percebida.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 400, max: 2000 },
            defaultValue: 1024,
            cssVars: ['--sarak-visual-perspective']
        },
        {
            id: 'visualTranslateOffsetSm',
            label: 'Visual Engine: Offset de Translação (Pequeno)',
            type: 'slider',
            description: 'Deslocamento pequeno, em pixels, usado em translações 2D/3D de elementos decorativos do motor visual.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 0, max: 60 },
            defaultValue: 20,
            cssVars: ['--sarak-visual-translate-offset-sm']
        },
        {
            id: 'visualTranslateZMd',
            label: 'Visual Engine: Translação Z (Médio)',
            type: 'slider',
            description: 'Deslocamento no eixo Z (profundidade), em pixels, usado em composições 3D do motor visual — controla o quão "à frente" ou "atrás" um elemento parece estar.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 0, max: 100 },
            defaultValue: 40,
            cssVars: ['--sarak-visual-translate-z-md']
        },
        {
            id: 'visualDotGridSize',
            label: 'Visual Engine: Tamanho da Grade de Pontos',
            type: 'slider',
            description: 'Tamanho, em pixels, da célula da grade de pontos decorativa usada em composições do motor visual — equivalente a `dotGridTileSize`, mas neste contexto específico.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 5, max: 40 },
            defaultValue: 15,
            cssVars: ['--sarak-visual-dot-grid-size']
        },
        {
            id: 'visualOrbBlur',
            label: 'Visual Engine: Desfoque do Orb',
            type: 'slider',
            description: 'Intensidade do desfoque de orbes decorativos usados em composições do motor visual — mesmo conceito de `emptyStateOrbBlur`/`authHeroOrbBlur`, neste contexto específico.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 150 },
            defaultValue: 60,
            cssVars: ['--sarak-visual-orb-blur']
        },

        // --- DESIGN ENGINE: PAINEL LATERAL DA FERRAMENTA (Spec 28) ---
        {
            id: 'designEngineSidebarMinWidth',
            label: 'Design Engine: Largura Mínima do Painel',
            type: 'slider',
            description: 'Largura mínima, em pixels, do painel lateral da própria ferramenta de customização (Design Engine) quando redimensionável.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 200, max: 400 },
            defaultValue: 280,
            cssVars: ['--sarak-design-engine-sidebar-min-w']
        },
        {
            id: 'designEngineSidebarMaxWidth',
            label: 'Design Engine: Largura Máxima do Painel',
            type: 'slider',
            description: 'Largura máxima, em pixels, do painel lateral da ferramenta de customização quando redimensionável.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 400, max: 900 },
            defaultValue: 600,
            cssVars: ['--sarak-design-engine-sidebar-max-w']
        },
        {
            id: 'layoutPreviewMaxH',
            label: 'Design Engine: Altura Máxima do Preview de Código',
            type: 'slider',
            description: 'Altura máxima, em pixels, do bloco de preview/código exibido dentro do painel da ferramenta de customização — acima desse limite o conteúdo recebe scroll interno.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 40, max: 300 },
            defaultValue: 120,
            cssVars: ['--sarak-layout-preview-max-h']
        },
        {
            id: 'kbdMinWidth',
            label: 'Design Engine: Largura Mínima da Tecla (Kbd)',
            type: 'slider',
            description: 'Largura mínima, em pixels, de um elemento visual `<kbd>` (representação de tecla de atalho) exibido na UI da ferramenta de customização.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 16, max: 48 },
            defaultValue: 28,
            cssVars: ['--sarak-kbd-min-w']
        }
    ]
};
