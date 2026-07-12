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
            label: 'Fundo Global (Body)',
            type: 'color',
            description: 'Cor de fundo base de toda a aplicação. Nota: mesmo `id` existe em `colors.ts` — ambos representam o mesmo conceito de fundo global; ver pendência de higiene de schema (tokens duplicados entre famílias) registrada no backlog de cobertura, fora do escopo desta spec.',
            axis: 'color',
            defaultValue: '#050505',
            cssVars: ['--sarak-bg-body', '--theme-bg']
        },
        {
            id: 'colorBgLayer1',
            label: 'Background Layer 1',
            type: 'color',
            description: 'Cor de fundo da primeira camada de profundidade acima do body. Nota: mesmo `id` existe em `colors.ts` — mesma pendência de duplicação de `colorBgBody`.',
            axis: 'color',
            defaultValue: '#0f0f0f',
            cssVars: ['--sarak-bg-layer-1', '--theme-surface-1']
        },
        {
            id: 'colorBgLayer2',
            label: 'Background Layer 2',
            type: 'color',
            description: 'Cor de fundo da segunda camada de profundidade. Nota: mesmo `id` existe em `colors.ts` — mesma pendência de duplicação de `colorBgBody`.',
            axis: 'color',
            defaultValue: '#1a1a1a',
            cssVars: ['--sarak-bg-layer-2', '--theme-surface-2']
        },
        // --- BACKGROUND GLOBAL ---
        {
            id: 'bgBaseColor',
            label: 'Cor de Fundo Base',
            type: 'color',
            description: 'Cor de fundo base do sistema de atmosfera. Nota: mesmo `id` existe em `system.ts` — mesma pendência de duplicação de `colorBgBody`.',
            axis: 'color',
            defaultValue: '#0a0a0c',
            cssVars: ['--sarak-bg-base']
        },
        {
            id: 'bgGradientMode',
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
            defaultValue: 'linear',
            cssVars: ['--sarak-bg-gradient-mode']
        },
        {
            id: 'bgGradientAngle',
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
            label: 'Tom do Ambiente',
            type: 'select',
            description: 'Tom cromático geral do ambiente, além do simples claro/escuro de `mode` — Cibernético e Militar Tático imprimem uma personalidade cromática própria (não só luminosidade) a toda a paleta.',
            axis: 'color',
            options: [
                { value: 'dark', label: 'Escuro Profundo' },
                { value: 'light', label: 'Claro Cromado' },
                { value: 'cyber', label: 'Cibernético' },
                { value: 'tactical', label: 'Militar Tático' }
            ],
            defaultValue: 'dark',
            cssVars: ['--sarak-system-tone']
        },

        // --- TEXTURA & RUÍDO ---
        {
            id: 'texture',
            label: 'Textura Industrial (BG)',
            type: 'select',
            description: 'Padrão visual sobreposto ao fundo global (grid, pontos, ruído, ondas etc. — mais de 40 opções). É o principal token de caráter/atmosfera do tema; combine com `textureOpacity` para controlar o quão perceptível ele é.',
            axis: 'texture',
            options: TEXTURE_OPTIONS,
            defaultValue: 'grid',
            cssVars: ['--sarak-bg-pattern-id', '--theme-texture']
        },
        {
            id: 'textureOpacity',
            label: 'Opacidade da Textura',
            type: 'slider',
            description: 'Opacidade do padrão de textura de fundo (`texture`) — valores baixos deixam o padrão quase subliminar; valores altos o tornam um elemento gráfico proeminente.',
            axis: 'texture',
            constraints: { min: 0, max: 1, step: 0.01 },
            defaultValue: 0.1,
            cssVars: ['--sarak-bg-pattern-opacity', '--theme-texture-opacity']
        },
        {
            id: 'atmosphereNoiseOpacity',
            label: 'Opacidade do Ruído da Atmosfera',
            type: 'slider',
            description: 'Opacidade de um overlay de ruído/grão aplicado sobre toda a atmosfera de fundo — dá uma sensação analógica/filmica sutil. Nota: compartilha as mesmas `cssVars` de `noiseIntensity` (ambos escrevem `--sarak-noise-opacity`) — pendência de duplicação a investigar fora do escopo desta spec.',
            axis: 'texture',
            constraints: { min: 0, max: 1, step: 0.01 },
            defaultValue: 0.05,
            cssVars: ['--sarak-noise-opacity', '--theme-noise-opacity']
        },
        {
            id: 'noiseIntensity',
            label: 'Intensidade de Ruído',
            type: 'slider',
            description: 'Intensidade do overlay de ruído — mesmo efeito visual de `atmosphereNoiseOpacity`. Nota: token declara as mesmas `cssVars` de `atmosphereNoiseOpacity` (`--sarak-noise-opacity`), portanto um sobrescreve o outro em runtime dependendo da ordem de processamento — pendência de duplicação a investigar fora do escopo desta spec (documentado, não corrigido).',
            axis: 'texture',
            constraints: { min: 0, max: 1, step: 0.01 },
            defaultValue: 0.05,
            cssVars: ['--sarak-noise-opacity', '--theme-noise-opacity']
        },
        {
            id: 'bgNoiseDensity',
            label: 'Densidade de Ruído (BG)',
            type: 'slider',
            description: 'Densidade (quantidade de grãos por área) do padrão de ruído de fundo — diferente de opacidade, controla o quão "granulado fino vs. grosso" é o efeito.',
            axis: 'texture',
            constraints: { min: 0, max: 1, step: 0.01 },
            defaultValue: 0.05,
            cssVars: ['--sarak-noise-density']
        },
        {
            id: 'bgNoiseAnimation',
            label: 'Velocidade do Ruído',
            type: 'slider',
            description: 'Velocidade de animação do padrão de ruído de fundo, em segundos por ciclo — 0 mantém o ruído estático; valores baixos dão um efeito de "TV estática" sutil e vivo.',
            axis: 'motion',
            unit: 's',
            constraints: { min: 0, max: 10, step: 0.1 },
            defaultValue: 1,
            cssVars: ['--sarak-noise-speed']
        },

        // --- GLASSMORPHISM PRO ---
        {
            id: 'glassBlur',
            label: 'Backdrop Blur (Profundidade)',
            type: 'slider',
            description: 'Intensidade do desfoque de fundo usado no efeito de vidro (glassmorphism) em superfícies translúcidas do sistema — o parâmetro mais perceptível do efeito de vidro.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 200, step: 1 },
            defaultValue: 16,
            cssVars: ['--sarak-glass-blur']
        },
        {
            id: 'glassOpacity',
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
            label: 'Roughness (Rugosidade)',
            type: 'slider',
            description: 'Rugosidade simulada da superfície de vidro — valores baixos dão um vidro mais liso/polido; valores altos simulam um vidro fosco/áspero, difundindo mais a luz.',
            axis: 'texture',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.05,
            cssVars: ['--sarak-glass-roughness']
        },
        {
            id: 'glassSaturation',
            label: 'Saturação do Vidro',
            type: 'slider',
            description: 'Saturação de cor aplicada ao conteúdo visto através de superfícies de vidro (`backdrop-filter: saturate`) — valores acima de 1 tornam as cores atrás do vidro mais vibrantes, efeito comum em glassmorphism premium (ex. macOS).',
            axis: 'color',
            constraints: { min: 0.5, max: 3, step: 0.1 },
            defaultValue: 1.2,
            cssVars: ['--sarak-glass-saturation']
        },

        // --- SOMBRAS E ELEVAÇÃO ---
        {
            id: 'shadowIntensity',
            label: 'Intensidade da Sombra',
            type: 'slider',
            description: 'Multiplicador geral da intensidade de todas as sombras do sistema — um único controle para tornar as sombras mais sutis (achatado/flat) ou mais dramáticas (profundidade acentuada).',
            axis: 'elevation',
            constraints: { min: 0, max: 2, step: 0.1 },
            defaultValue: 0.5,
            cssVars: ['--shadow-intensity', '--sarak-shadow-intensity']
        },
        {
            id: 'layeredShadows',
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
            label: 'Orientação das Sombras',
            type: 'select',
            description: 'Direção de onde a "luz" projeta as sombras dos elementos — Projeção Inferior é o padrão realista (luz vindo de cima); Superior Invertida cria um clima incomum/dramático; Ângulo Dinâmico varia conforme a posição do elemento.',
            axis: 'elevation',
            options: [
                { value: 'bottom', label: 'Projeção Inferior' },
                { value: 'center', label: 'Centro Uniforme' },
                { value: 'top', label: 'Superior Invertida' },
                { value: 'dynamic', label: 'Ângulo Dinâmico' }
            ],
            defaultValue: 'bottom',
            cssVars: ['--shadow-orientation']
        },
        {
            id: 'shadowColorMode',
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
            label: 'Sombra: Contato (Ambient)',
            type: 'slider',
            description: 'Opacidade da sombra de contato (curta, rente ao elemento, simula o objeto tocando a superfície) — parte do sistema de sombra em duas camadas (contato + projeção), junto com `shadowProjectionAlpha`.',
            axis: 'elevation',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.4,
            cssVars: ['--sarak-shadow-ambient-alpha']
        },
        {
            id: 'shadowProjectionBlur',
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
            label: 'Sombra: Projeção (Alpha)',
            type: 'slider',
            description: 'Opacidade da sombra de projeção — controla o quão escura/visível é a sombra longa em relação ao fundo. Combine com `shadowProjectionBlur` para o resultado completo.',
            axis: 'elevation',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.2,
            cssVars: ['--sarak-shadow-projection-alpha']
        },

        // --- ESCUDOS DE SEGURANÇA ---
        {
            id: 'securityShieldGlow',
            label: 'Brilho do Escudo de Segurança',
            type: 'slider',
            description: 'Intensidade do brilho ao redor de um indicador visual de "escudo de segurança" (ex. selo de conexão segura/verificada). Nota: token catalogado sem componente consumidor implementado no momento — ver backlog de cobertura, spec 01.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 200 },
            defaultValue: 10,
            cssVars: ['--sarak-security-glow']
        },
        {
            id: 'securityPulseSpeed',
            label: 'Velocidade do Pulso (Escudo)',
            type: 'slider',
            description: 'Velocidade de pulsação do indicador de "escudo de segurança", em segundos por ciclo. Mesma pendência de `securityShieldGlow`: sem componente consumidor implementado no momento.',
            axis: 'motion',
            unit: 's',
            constraints: { min: 0.5, max: 5.0, step: 0.1 },
            defaultValue: 2.0,
            cssVars: ['--sarak-security-pulse']
        },

        // --- EFEITOS CINEMATOGRÁFICOS ---
        {
            id: 'vignetteOpacity',
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
            label: 'Suavidade das Bordas',
            type: 'slider',
            description: 'Suavidade da transição do efeito vignette — valores baixos criam uma borda escura mais definida/abrupta; valores altos espalham o escurecimento gradualmente por uma área maior da tela.',
            axis: 'elevation',
            constraints: { min: 0, max: 200 },
            defaultValue: 50,
            cssVars: ['--sarak-vignette-softness']
        },

        // --- PÓS-PROCESSAMENTO ---
        {
            id: 'globalSaturation',
            label: 'Saturação Global',
            type: 'slider',
            description: 'Multiplicador de saturação aplicado a toda a interface (filtro de pós-processamento) — valores acima de 1 tornam todas as cores mais vibrantes; abaixo de 1 aproximam do preto e branco.',
            axis: 'color',
            constraints: { min: 0, max: 2, step: 0.1 },
            defaultValue: 1,
            cssVars: ['--sarak-saturation']
        },
        {
            id: 'globalContrast',
            label: 'Contraste Global',
            type: 'slider',
            description: 'Multiplicador de contraste aplicado a toda a interface (filtro de pós-processamento) — valores altos tornam claros mais claros e escuros mais escuros; use com moderação para não comprometer acessibilidade.',
            axis: 'color',
            constraints: { min: 0.5, max: 3.0, step: 0.05 },
            defaultValue: 1,
            cssVars: ['--sarak-contrast']
        },
        {
            id: 'contrastCurve',
            label: 'Curva de Contraste Cinematográfico',
            type: 'slider',
            description: 'Curva de contraste não-linear aplicada como pós-processamento (ao estilo de correção de cor cinematográfica) — mais sofisticado que `globalContrast`, permite um contraste "em S" que preserva sombras e realces.',
            axis: 'color',
            constraints: { min: 0.5, max: 4.0, step: 0.1 },
            defaultValue: 1.0,
            cssVars: ['--contrast-curve', '--sarak-contrast-curve']
        }
    ]
};
