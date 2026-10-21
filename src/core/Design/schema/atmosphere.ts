import { ComponentSchema } from '../types';

export const TEXTURE_OPTIONS = [
    { value: 'none', label: 'Nenhuma' },
    { value: 'grid', label: 'Grid Técnico' },
    { value: 'dots', label: 'Pontos (Dotted)' },
    { value: 'noise', label: 'Ruído Analógico' },
    { value: 'grain', label: 'Grão Fotográfico' },
    { value: 'mesh', label: 'Mesh Orgânico' },
    { value: 'waves', label: 'Ondas Senoidais' },
    { value: 'squares', label: 'Quadrados Industriais' },
    { value: 'stripes', label: 'Listras Militares' },
    { value: 'topo', label: 'Topografia' },
    { value: 'diamond', label: 'Diamante' },
    { value: 'prestige', label: 'Prestige' },
    { value: 'carbon', label: 'Fibra de Carbono' },
    { value: 'brushed', label: 'Metal Escovado' },
    { value: 'frosted', label: 'Vidro Fosco (Frosted)' },
    { value: 'circuit', label: 'Circuitos (Classic)' },
    { value: 'paper', label: 'Papel Craft' },
    { value: 'scanlines', label: 'Scanlines (CRT)' },
    { value: 'hexagon', label: 'Hexagonais (Céptico)' },
    { value: 'silk', label: 'Seda Líquida' },
    { value: 'blueprint', label: 'Blueprint (Cianótipo)' },
    { value: 'aurora', label: 'Aurora Boreal' },
    { value: 'stars', label: 'Campo Estelar' },
    { value: 'honeycomb', label: 'Favo de Mel' },
    { value: 'isometric', label: 'Projeção Isométrica' },
    { value: 'radar', label: 'Radar Tático' },
    { value: 'crosshatch', label: 'Crosshatch' },
    { value: 'micro-dots', label: 'Micro-Pontos' },
    { value: 'pinstripes', label: 'Pinstripes' },
    { value: 'constellation', label: 'Constelação' },
    { value: 'circuit-pro', label: 'Circuitos (Pro)' },
    { value: 'carbon-tech', label: 'Carbon Tech' },
    { value: 'topo-deep', label: 'Topografia Profunda' },
    { value: 'prism-mesh', label: 'Prism Mesh' },
    { value: 'cyber-binary', label: 'Código Binário' },
    { value: 'blueprint-pro', label: 'Blueprint Pro' },
    { value: 'wave-pulse', label: 'Pulso de Onda' },
    { value: 'wood', label: 'Madeira (Organic)' },
    { value: 'stucco', label: 'Stucco (Parede)' },
    { value: 'fluid', label: 'Fluido Dinâmico' },
    { value: 'nebula', label: 'Nebulosa' }
];

/**
 * Mapeamento 100% Granular: Atmosfera & Ambiente
 */
export const AtmosphereSchema: ComponentSchema = {
    id: 'atmosphere',
    label: 'Fundo e Atmosfera',
    tokens: [
        // --- CORES DE SUPERFÍCIE ---
        {
            id: 'colorBgBody',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Pinta o fundo da página inteira e a base do gradiente de fundo; as outras camadas e superfícies se leem contra esta cor.",
            label: 'Fundo Global (Body)',
            type: 'color',
            description: 'Cor de fundo base de toda a aplicação.',
            axis: 'color',
            defaultValue: '#06080d',
            // Os 3 últimos vieram da declaração homônima de `colors.ts`, desduplicada
            // pela plan-07. Sem herdá-los, `--theme-body` deixava de ser emitida — a
            // duplicata não era redundante, era uma UNIÃO de aliases.
            cssVars: ['--sarak-bg-body', '--theme-bg', '--theme-body', '--bg-body']
        },
        {
            id: 'colorBgLayer1',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Segunda parada do gradiente de fundo nos modos Linear e Radial (e a mancha de camada 1 da malha); com fundo Sólido não aparece.",
            interactsWith: ['bgGradientMode'],
            label: 'Background Layer 1',
            type: 'color',
            description: 'Cor de fundo da primeira camada de profundidade acima do body. Variável própria: `--sarak-bg-layer-1`.',
            axis: 'color',
            defaultValue: '#0b0f17',
            cssVars: ['--sarak-bg-layer-1', '--theme-surface-1']
        },
        {
            id: 'colorBgLayer2',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Terceira mancha da malha de fundo; só desenha com o gradiente Mesh. Nos outros modos o valor muda a variável e nenhum pixel.",
            interactsWith: ['bgGradientMode'],
            label: 'Background Layer 2',
            type: 'color',
            description: 'Cor da segunda camada de profundidade do fundo: a terceira mancha da malha (`bgGradientMode: mesh`), ao lado da camada 1. O padrão é a própria cor primária — a malha de hoje; troque por um tom de superfície para dar uma segunda camada de profundidade. Variável própria: `--sarak-bg-layer-2`.',
            axis: 'color',
            defaultValue: '#101622',
            cssVars: ['--sarak-bg-layer-2', '--theme-surface-2']
        },
        // --- BACKGROUND GLOBAL ---
        {
            id: 'bgBaseColor',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Pinta a base das superfícies de vidro (`.sarak-glass`), o fundo da gaveta e a cor dos painéis do motor de fluxo; o corpo da página é `colorBgBody`.",
            label: 'Cor de Fundo Base',
            type: 'color',
            description: 'Cor de fundo base do sistema de atmosfera — a base das superfícies de vidro e dos painéis sobrepostos (`--sarak-bg-base`, de que este token é o único dono). `colorBgBody` pinta o corpo da página.',
            axis: 'color',
            defaultValue: '#06080d',
            cssVars: ['--sarak-bg-base']
        },
        {
            id: 'bgGradientMode',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Escolhe o gradiente pintado sobre o fundo da página: Sólido não desenha; Linear e Radial misturam a camada 1 com a primária; Mesh espalha quatro manchas de cor.",
            interactsWith: ['bgGradientAngle', 'colorBgLayer1', 'colorBgLayer2'],
            label: 'Modo de Gradiente',
            type: 'select',
            description: 'Estratégia de gradiente aplicada ao fundo global — Sólido não usa gradiente; Linear/Radial/Mesh criam transições de cor progressivas, dando profundidade/atmosfera ao fundo em vez de uma cor chapada. Combine com `bgGradientAngle` no modo Linear.',
            axis: 'color',
            options: [
                { value: 'none', label: 'Sólido' },
                { value: 'linear', label: 'Linear' },
                { value: 'radial', label: 'Radial' },
                { value: 'mesh', label: 'Mesh (Orgânico)' }
            ],
            defaultValue: 'radial',
            cssVars: ['--sarak-bg-gradient-mode']
        },
        {
            id: 'bgGradientAngle',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Gira o gradiente Linear do fundo, de 0° a 360°. Nos modos Radial e Mesh o ângulo não entra na pintura.",
            interactsWith: ['bgGradientMode'],
            label: 'Direção do Gradiente',
            type: 'slider',
            description: 'Ângulo, em graus, do gradiente de fundo — só relevante quando `bgGradientMode` é \'linear\'. 135° (diagonal) é o padrão mais comum para gradientes de fundo modernos.',
            axis: 'geometry',
            unit: 'deg',
            constraints: { min: 0, max: 360, step: 1 },
            defaultValue: 135,
            cssVars: ['--sarak-bg-gradient-angle']
        },
        // --- MATERIAIS ÓPTICOS ---
        {
            id: 'surfaceMaterial',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Troca o tratamento das superfícies de cartão: Vidro Fosco (desfoque 24 px com saturação), Polido (desfoque 12 px), Industrial (listras e sombra interna) ou Orgânico (sem desfoque, sombra interna suave).",
            interactsWith: ['surfaceIntensity'],
            label: 'Material da Superfície',
            type: 'select',
            description: 'Tratamento óptico aplicado às superfícies do sistema (cards, painéis) — Vidro Fosco (translúcido/blur), Polido (liso/reflexivo), Industrial Chapa (metálico/técnico) ou Orgânico Mate (fosco/natural). Define o "material" percebido de toda a UI.',
            axis: 'texture',
            options: [
                { value: 'frosted', label: 'Vidro Fosco (Frosted)' },
                { value: 'sleek', label: 'Polido (Sleek)' },
                { value: 'industrial', label: 'Industrial Chapa' },
                { value: 'organic', label: 'Orgânico Mate' }
            ],
            defaultValue: 'frosted',
            cssVars: ['--sarak-surface', '--surface-material']
        },
        {
            id: 'surfaceIntensity',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Escala a força do material da superfície: realce interno branco, gradiente e, no vidro, o desfoque. 0 apaga o realce; 1 o torna o traço dominante dos cartões.",
            interactsWith: ['surfaceMaterial'],
            label: 'Intensidade do Efeito de Superfície',
            type: 'slider',
            description: 'Intensidade com que o `surfaceMaterial` escolhido é aplicado — valores baixos deixam o efeito sutil/quase imperceptível; valores altos o tornam o traço visual dominante das superfícies.',
            axis: 'texture',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.5,
            cssVars: ['--surface-intensity', '--sarak-surface-intensity']
        },
        {
            id: 'borderType',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Estilo da borda dos cartões: Sólido, Cyber (tracejada na cor de textura), Dupla linha, Neon Glow (borda na cor de textura) ou Sem moldura (borda transparente).",
            interactsWith: ['textureColor'],
            label: 'Estilo da Moldura (Border)',
            type: 'select',
            description: 'Padrão decorativo da borda de superfícies principais — Sólido Padrão é neutro; Cyber Tech Segmentado e Neon Glow dão um clima tech/futurista; Dupla Linha é mais formal/editorial; Sem Moldura remove o contorno.',
            axis: 'texture',
            options: [
                { value: 'solid', label: 'Sólido Padrão' },
                { value: 'cyber', label: 'Cyber Tech Segmentado' },
                { value: 'double', label: 'Dupla Linha' },
                { value: 'glow', label: 'Neon Glow' },
                { value: 'none', label: 'Sem Moldura' }
            ],
            defaultValue: 'solid',
            cssVars: ['--sarak-border-type', '--border-type']
        },
        {
            id: 'systemTone',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Acrescenta ao fundo uma grade de HUD com brilho de horizonte: Cibernético na cor de textura (grade de 20 px), Tático em monocromo (grade de 24 px). Neutro não desenha nada.",
            label: 'Tom do Ambiente',
            type: 'select',
            description: 'Personalidade gráfica do fundo, além do claro/escuro de `mode` — Neutro não acrescenta nada; Cibernético desenha uma grade de HUD e um brilho de horizonte na cor de textura; Militar Tático desenha o mesmo HUD em monocromo, de saturação baixa. Escuro e Claro não são tons: quem escolhe o modo é `mode`.',
            axis: 'color',
            options: [
                { value: 'none', label: 'Neutro (sem tom)' },
                { value: 'cyber', label: 'Cibernético' },
                { value: 'tactical', label: 'Militar Tático' }
            ],
            defaultValue: 'none',
            cssVars: ['--sarak-system-tone']
        },

        // --- TEXTURA & RUÍDO ---
        {
            id: 'texture',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Padrão gráfico sobreposto ao fundo da página (camada do `html`/`body`); não muda com `mode` nem com a contraparte, então escolha um padrão legível nos dois modos. `carbon` desenha preto fixo: prefira o escuro ou use opacidade baixa no claro. `none` não desenha camada e leva consigo a vinheta.",
            interactsWith: ['textureOpacity', 'textureColor'],
            label: 'Textura Industrial (BG)',
            type: 'select',
            description: 'Padrão visual sobreposto ao fundo global (grid, pontos, ruído, ondas etc. — mais de 40 opções). É o principal token de caráter/atmosfera do tema; combine com `textureOpacity` para controlar o quão perceptível ele é.',
            axis: 'texture',
            options: TEXTURE_OPTIONS,
            defaultValue: 'constellation',
            cssVars: ['--sarak-bg-pattern-id', '--theme-texture']
        },
        {
            id: 'textureOpacity',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Opacidade da textura de fundo: 0 a apaga, valores altos a tornam um elemento gráfico. Sem textura escolhida não há camada para regular.",
            interactsWith: ['texture'],
            label: 'Opacidade da Textura',
            type: 'slider',
            description: 'Opacidade do padrão de textura de fundo (`texture`) — valores baixos deixam o padrão quase subliminar; valores altos o tornam um elemento gráfico proeminente.',
            axis: 'texture',
            constraints: { min: 0, max: 1, step: 0.01 },
            defaultValue: 0.3,
            cssVars: ['--sarak-bg-pattern-opacity', '--theme-texture-opacity']
        },
        {
            id: 'bgNoiseDensity',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Opacidade do grão de filme, uma camada fixa que cobre a tela inteira acima do conteúdo em qualquer textura; 0 a apaga. Não altera o padrão da textura `noise` (esse é `textureOpacity`).",
            label: 'Intensidade do Ruído (Grão)',
            type: 'slider',
            description: 'Intensidade do grão de filme aplicado sobre toda a tela, em qualquer textura — 0 desliga; valores baixos dão uma sensação analógica sutil, valores altos tornam o grão o traço dominante. A opacidade do padrão da textura `noise` é `textureOpacity`.',
            axis: 'texture',
            constraints: { min: 0, max: 1, step: 0.01 },
            defaultValue: 0.05,
            cssVars: ['--sarak-noise-density']
        },
        {
            id: 'bgNoiseAnimation',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Segundos por ciclo do deslocamento do padrão da textura `noise`; 0 o mantém parado. Só vale com `texture: noise`.",
            interactsWith: ['texture'],
            label: 'Velocidade do Ruído',
            type: 'slider',
            description: 'Velocidade do grão de filme da textura `noise`, em segundos por ciclo — 0 (padrão) mantém o grão parado; valores baixos dão um efeito de "TV estática" vivo, valores altos uma oscilação lenta. Respeita movimento reduzido e o modo de desempenho eco, que o param.',
            axis: 'motion',
            unit: 's',
            constraints: { min: 0, max: 10, step: 0.1 },
            defaultValue: 0,
            cssVars: ['--sarak-noise-speed']
        },

        // --- GLASSMORPHISM PRO ---
        {
            id: 'glassBlur',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Desfoque do que está atrás das superfícies `.sarak-glass`; é o parâmetro mais visível do vidro. 0 deixa a superfície nítida.",
            label: 'Backdrop Blur (Profundidade)',
            type: 'slider',
            description: 'Intensidade do desfoque de fundo usado no efeito de vidro (glassmorphism) em superfícies translúcidas do sistema — o parâmetro mais perceptível do efeito de vidro.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 200, step: 1 },
            defaultValue: 14,
            cssVars: ['--sarak-glass-blur']
        },
        {
            id: 'glassOpacity',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Opacidade do gradiente de vidro das superfícies de cartão; 0 o deixa quase transparente e valores altos o tornam o brilho dominante. Não altera o `.sarak-glass`.",
            label: 'Opacidade do Vidro',
            type: 'slider',
            description: 'Opacidade do fundo das superfícies de vidro — valores baixos deixam o vidro quase transparente (mostra bastante do que está atrás); valores altos o aproximam de uma superfície opaca comum.',
            axis: 'texture',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.1,
            cssVars: ['--glass-opacity', '--sarak-glass-opacity', '--sarak-bg-opacity']
        },
        {
            id: 'glassSpecularity',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Força do fio de luz interno no topo das superfícies `.sarak-glass`; 0 apaga o reflexo e 1 o torna branco puro.",
            label: 'Specularity (Brilho de Luz)',
            type: 'slider',
            description: 'Intensidade de um reflexo de luz simulado sobre as superfícies de vidro — valores altos dão a impressão de uma fonte de luz refletindo no material, reforçando a sensação de vidro real.',
            axis: 'texture',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.1,
            cssVars: ['--sarak-glass-specularity']
        },
        {
            id: 'glassRoughness',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Tira contraste do que passa por trás do vidro `.sarak-glass`: 0 deixa liso, 1 o funde num campo uniforme (contraste zero).",
            label: 'Roughness (Rugosidade)',
            type: 'slider',
            description: 'Rugosidade simulada da superfície de vidro — valores baixos dão um vidro mais liso/polido; valores altos simulam um vidro fosco/áspero, difundindo mais a luz.',
            axis: 'texture',
            constraints: { min: 0, max: 1, step: 0.01 },
            defaultValue: 0.05,
            cssVars: ['--sarak-glass-roughness']
        },
        {
            id: 'glassSaturation',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Saturação das cores vistas através das superfícies `.sarak-glass`; acima de 1 as realça, abaixo de 1 as aproxima do cinza.",
            label: 'Saturação do Vidro',
            type: 'slider',
            description: 'Saturação de cor aplicada ao conteúdo visto através de superfícies de vidro (`backdrop-filter: saturate`) — valores acima de 1 tornam as cores atrás do vidro mais vibrantes, efeito comum em glassmorphism premium (ex. macOS).',
            axis: 'color',
            constraints: { min: 0.5, max: 3, step: 0.1 },
            defaultValue: 1.2,
            cssVars: ['--sarak-glass-saturation']
        },
        {
            id: 'glassEdgeWidth',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Espessura da borda das superfícies `.sarak-glass`; 0 a remove e valores altos viram moldura.",
            label: 'Espessura da Borda do Vidro',
            type: 'slider',
            description: 'Espessura, em pixels, da borda fina que demarca o contorno de uma superfície de vidro (glassmorphism) — reforça a leitura do plano translúcido contra o que está atrás dele.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 8 },
            defaultValue: 1,
            cssVars: ['--sarak-glass-edge-width']
        },
        {
            id: 'glassEdgeColor',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Cor da borda das superfícies `.sarak-glass`; o padrão é um branco translúcido que some sobre fundo claro.",
            label: 'Cor da Borda do Vidro',
            type: 'color',
            description: 'Cor da borda fina que demarca o contorno de uma superfície de vidro (glassmorphism) — normalmente branco translúcido, para simular a refração de luz na borda do material.',
            axis: 'color',
            defaultValue: 'rgba(255,255,255,0.1)',
            cssVars: ['--sarak-glass-edge-color']
        },

        // --- SOMBRAS E ELEVAÇÃO ---
        {
            id: 'shadowIntensity',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Opacidade de todo elemento com a classe `.shadow-theme` (de 0,3 a 1,0), conteúdo incluso. Não escala a sombra dos cartões.",
            label: 'Intensidade da Sombra',
            type: 'slider',
            description: 'Opacidade do elemento que usa a classe `.shadow-theme` (de 0,3 a 1,0: 0,3 + intensidade × 0,7) e da sombra em camadas dele — não é um multiplicador das sombras dos cartões, que vêm de `cardShadow*`, `shadowAmbientAlpha` e `shadowProjectionAlpha`.',
            axis: 'elevation',
            constraints: { min: 0, max: 2, step: 0.1 },
            defaultValue: 0.5,
            cssVars: ['--shadow-intensity', '--sarak-shadow-intensity']
        },
        {
            id: 'layeredShadows',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Multiplica a opacidade das duas camadas de sombra (contato e projeção) de `.shadow-theme` e da busca; 0 as apaga e 2 as dobra.",
            label: 'Sombras em Camadas (Layered)',
            type: 'slider',
            description: 'Intensidade de sombras compostas por múltiplas camadas sobrepostas (técnica usada para sombras mais realistas/suaves que uma sombra única) — valores mais altos aumentam a complexidade/suavidade da sombra composta.',
            axis: 'elevation',
            constraints: { min: 0, max: 2, step: 0.1 },
            defaultValue: 1.0,
            cssVars: ['--sarak-layered-shadows']
        },
        {
            id: 'shadowOrientation',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "De onde vem a luz: muda a direção do deslocamento da sombra dos cartões e das sobreposições (Inferior, Centro, Superior, Diagonal ou dinâmica, que segue o ponteiro).",
            label: 'Orientação das Sombras',
            type: 'select',
            description: 'Direção de onde a "luz" projeta as sombras dos elementos — Projeção Inferior é o padrão realista (luz vindo de cima); Superior Invertida cria um clima incomum/dramático; Ângulo Dinâmico varia conforme a posição do elemento.',
            axis: 'elevation',
            options: [
                { value: 'bottom', label: 'Projeção Inferior' },
                { value: 'center', label: 'Centro Uniforme' },
                { value: 'top', label: 'Superior Invertida' },
                { value: 'dynamic', label: 'Ângulo Dinâmico' },
                { value: 'bottom-right', label: 'Diagonal (Canto Inferior Direito)' }
            ],
            defaultValue: 'bottom',
            cssVars: ['--shadow-orientation']
        },
        {
            id: 'shadowColorMode',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Cor da sombra dos cartões: Neutro usa preto, Matizada a escurece na primária do tema e Ambiental usa um tom de baixa saturação derivado do fundo.",
            label: 'Colorização das Sombras',
            type: 'select',
            description: 'Como as sombras do sistema são coloridas — Neutro usa preto/cinza puro (o mais universal); Matizada usa uma versão escurecida da cor do próprio elemento (mais orgânico); Ambiental Suave usa uma cor neutra de baixa saturação para um efeito mais atmosférico.',
            axis: 'elevation',
            options: [
                { value: 'neutral', label: 'Neutro (Preto)' },
                { value: 'colored', label: 'Matizada (Colorida)' },
                { value: 'ambient', label: 'Ambiental Suave' }
            ],
            defaultValue: 'neutral',
            cssVars: ['--shadow-color-mode']
        },
        {
            id: 'shadowAmbientAlpha',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Opacidade da camada de contato (curta, rente ao elemento) da sombra de `.shadow-theme` e da busca; 0 a apaga.",
            label: 'Sombra: Contato (Ambient)',
            type: 'slider',
            description: 'Opacidade da sombra de contato (curta, rente ao elemento, simula o objeto tocando a superfície) — parte do sistema de sombra em duas camadas (contato + projeção), junto com `shadowProjectionAlpha`.',
            axis: 'elevation',
            constraints: { min: 0, max: 1, step: 0.01 },
            defaultValue: 0.4,
            cssVars: ['--sarak-shadow-ambient-alpha']
        },
        {
            id: 'shadowProjectionBlur',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Desfoque e alcance da camada de projeção (longa) da sombra de `.shadow-theme` e da busca; 0 a deixa dura e 200 a espalha.",
            label: 'Sombra: Projeção (Blur)',
            type: 'slider',
            description: 'Raio de desfoque da sombra de projeção (longa, mais distante do elemento, simula a "queda" da sombra no chão) — quanto maior, mais suave/espalhada a sombra projetada.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 200 },
            defaultValue: 40,
            cssVars: ['--sarak-shadow-projection-blur']
        },
        {
            id: 'shadowProjectionAlpha',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Opacidade da camada de projeção (longa) da sombra de `.shadow-theme` e da busca; 0 a apaga e 1 a torna preta.",
            label: 'Sombra: Projeção (Alpha)',
            type: 'slider',
            description: 'Opacidade da sombra de projeção — controla o quão escura/visível é a sombra longa em relação ao fundo. Combine com `shadowProjectionBlur` para o resultado completo.',
            axis: 'elevation',
            constraints: { min: 0, max: 1, step: 0.01 },
            defaultValue: 0.2,
            cssVars: ['--sarak-shadow-projection-alpha']
        },

        // --- EFEITOS CINEMATOGRÁFICOS ---
        {
            id: 'vignetteOpacity',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Opacidade do escurecimento das bordas da tela. Só existe quando há textura de fundo escolhida; com `texture: none` não há camada de vinheta.",
            interactsWith: ['texture', 'vignetteSoftness'],
            label: 'Intensidade do Vignette',
            type: 'slider',
            description: 'Intensidade do escurecimento gradual nas bordas da tela (efeito vignette, comum em fotografia/cinema) — foca a atenção do usuário no centro do conteúdo. 0 desativa o efeito.',
            axis: 'elevation',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.3,
            cssVars: ['--sarak-vignette-opacity']
        },
        {
            id: 'vignetteSoftness',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Onde o escurecimento das bordas começa: 0 deixa só um aro fino na borda; 60 o espalha quase até o centro. Só vale com textura de fundo escolhida.",
            interactsWith: ['texture', 'vignetteOpacity'],
            label: 'Suavidade das Bordas',
            type: 'slider',
            description: 'Suavidade da transição do efeito vignette — valores baixos criam uma borda escura mais definida/abrupta; valores altos espalham o escurecimento gradualmente por uma área maior da tela. Em 60 o escurecimento já cobre a tela inteira, por isso a faixa termina aí.',
            axis: 'elevation',
            constraints: { min: 0, max: 60 },
            defaultValue: 50,
            cssVars: ['--sarak-vignette-softness']
        },

        // --- PÓS-PROCESSAMENTO ---
        {
            id: 'globalSaturation',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Satura ou dessatura somente a camada de textura do fundo (filtro da própria textura), não a interface. Sem textura escolhida não muda nada.",
            interactsWith: ['texture'],
            label: 'Saturação Global',
            type: 'slider',
            description: 'Multiplicador de saturação aplicado à camada de textura do fundo (filtro da própria textura; sem textura escolhida não muda nada) — valores acima de 1 tornam as cores dela mais vibrantes; abaixo de 1 aproximam do preto e branco.',
            axis: 'color',
            constraints: { min: 0, max: 2, step: 0.1 },
            defaultValue: 1,
            cssVars: ['--sarak-saturation']
        },
        {
            id: 'globalContrast',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Contraste aplicado somente à camada de textura do fundo (filtro da própria textura), não à interface. Sem textura escolhida não muda nada.",
            interactsWith: ['texture'],
            label: 'Contraste Global',
            type: 'slider',
            description: 'Multiplicador de contraste aplicado à camada de textura do fundo (filtro da própria textura; sem textura escolhida não muda nada) — valores altos tornam claros mais claros e escuros mais escuros nessa camada.',
            axis: 'color',
            constraints: { min: 0.5, max: 3.0, step: 0.05 },
            defaultValue: 1,
            cssVars: ['--sarak-contrast']
        }
    ]
};
