import { ComponentSchema } from '../types';

export const BUTTON_STYLE_OPTIONS = [
    { id: 'matte', value: 'matte', label: 'Industrial Matte' },
    { id: 'neon', value: 'neon', label: 'Cyber Neon Glow' },
    { id: 'frosted', value: 'frosted', label: 'Glassmorphism Frosted' },
    { id: 'borderline', value: 'borderline', label: 'Minimalist Borderline' },
    { id: 'cyberpunk', value: 'cyberpunk', label: 'Cyberpunk Wireframe' },
    { id: 'neumorphism', value: 'neumorphism', label: 'Neumorphism Soft' }
];

/**
 * SCHEMA: BOTÕES & AÇÕES
 * Governa a anatomia, estados e estilos de todos os elementos clicáveis.
 */
export const ButtonsSchema: ComponentSchema = {
    id: 'buttons',
    label: 'Botão de Ação',
    tokens: [
        {
            id: 'buttonIconPosition',
            kind: 'functional',
            modeDependent: false,
            usage: "Posiciona o ícone à esquerda ou à direita do texto nos botões que recebem um ícone.",
            label: 'Posição do Ícone',
            type: 'select',
            description: 'Lado do botão em que o ícone (quando presente) é renderizado em relação ao texto. Usar "Direita" para ações que avançam um fluxo (ex. "Próximo", "Continuar") e "Esquerda" para ações de retorno/padrão (ex. "Voltar", "Salvar").',
            axis: 'geometry',
            constraints: {
                options: [
                    { id: 'left', value: 'left', label: 'Esquerda' },
                    { id: 'right', value: 'right', label: 'Direita' }
                ]
            },
            defaultValue: 'left',
            structuralConsumer: ['useButtonLayoutStyles']
        },
        {
            id: 'buttonWidthStrategy',
            kind: 'functional',
            modeDependent: false,
            usage: "Faz o botão acompanhar o conteúdo ou ocupar toda a largura do contêiner.",
            label: 'Largura do Botão',
            type: 'select',
            description: 'Estratégia de largura do botão. "Automático" ajusta ao conteúdo (padrão para botões inline/toolbar); "Largura Total" ocupa 100% do container pai — útil em formulários mobile ou CTAs de destaque.',
            axis: 'geometry',
            constraints: {
                options: [
                    { id: 'auto', value: 'auto', label: 'Automático (Conteúdo)' },
                    { id: 'full', value: 'full', label: 'Largura Total (100%)' }
                ]
            },
            defaultValue: 'auto'
        },
        {
            id: 'btnBorderRadius',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Arredonda os quatro cantos dos botões; os tokens de canto podem sobrescrever cada lado.",
            label: 'Arredondamento (Master)',
            type: 'slider',
            description: 'Raio de borda geral do botão em pixels. 0 = quadrado/anguloso (clima industrial/técnico), valores altos (>40px) = pílula/totalmente arredondado (clima amigável/lúdico). É o valor "mestre" — os 4 cantos individuais (`btnRadiusTL/TR/BL/BR`) sobrescrevem por canto quando precisar de assimetria.',
            axis: 'geometry',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 120 },
            defaultValue: { mob: 6, tab: 8, desk: 8 },
            cssVars: ['--sarak-btn-border-radius', '--sarak-btn-radius-tl', '--sarak-btn-radius-tr', '--sarak-btn-radius-bl', '--sarak-btn-radius-br']
        },
        {
            id: 'btnRadiusTL',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Sobrepõe o arredondamento do canto superior esquerdo do botão em relação ao mestre.",
            interactsWith: ['btnBorderRadius'],
            label: 'Canto: Superior Esquerdo',
            type: 'slider',
            description: 'Raio de borda do canto superior esquerdo do botão, em pixels — sobrescreve `btnBorderRadius` só nesse canto. Use para formas assimétricas (ex. botão "colado" a um input à esquerda, canto reto de um lado e arredondado do outro).',
            axis: 'geometry',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 120 },
            defaultValue: { mob: 6, tab: 8, desk: 8 },
            cssVars: ['--sarak-btn-radius-tl'],
            exceptionOf: 'btnBorderRadius'
        },
        {
            id: 'btnRadiusTR',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Sobrepõe o arredondamento do canto superior direito do botão em relação ao mestre.",
            interactsWith: ['btnBorderRadius'],
            label: 'Canto: Superior Direito',
            type: 'slider',
            description: 'Raio de borda do canto superior direito do botão, em pixels — sobrescreve `btnBorderRadius` só nesse canto. Use para formas assimétricas junto com os demais cantos individuais.',
            axis: 'geometry',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 120 },
            defaultValue: { mob: 6, tab: 8, desk: 8 },
            cssVars: ['--sarak-btn-radius-tr'],
            exceptionOf: 'btnBorderRadius'
        },
        {
            id: 'btnRadiusBL',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Sobrepõe o arredondamento do canto inferior esquerdo do botão em relação ao mestre.",
            interactsWith: ['btnBorderRadius'],
            label: 'Canto: Inferior Esquerdo',
            type: 'slider',
            description: 'Raio de borda do canto inferior esquerdo do botão, em pixels — sobrescreve `btnBorderRadius` só nesse canto. Use para formas assimétricas junto com os demais cantos individuais.',
            axis: 'geometry',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 120 },
            defaultValue: { mob: 6, tab: 8, desk: 8 },
            cssVars: ['--sarak-btn-radius-bl'],
            exceptionOf: 'btnBorderRadius'
        },
        {
            id: 'btnRadiusBR',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Sobrepõe o arredondamento do canto inferior direito do botão em relação ao mestre.",
            interactsWith: ['btnBorderRadius'],
            label: 'Canto: Inferior Direito',
            type: 'slider',
            description: 'Raio de borda do canto inferior direito do botão, em pixels — sobrescreve `btnBorderRadius` só nesse canto. Use para formas assimétricas junto com os demais cantos individuais.',
            axis: 'geometry',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 120 },
            defaultValue: { mob: 6, tab: 8, desk: 8 },
            cssVars: ['--sarak-btn-radius-br'],
            exceptionOf: 'btnBorderRadius'
        },

        // --- INTERAÇÃO ---
        {
            id: 'btnHoverScale',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Amplia ou reduz o botão enquanto o ponteiro está sobre ele; 1 mantém a escala original.",
            label: 'Escala no Hover',
            type: 'slider',
            description: 'Fator de escala (zoom) do botão ao passar o mouse. 1.0 = sem efeito, >1.0 = cresce (feedback tátil/lúdico), <1.0 = encolhe (raro, sensação de "afundar"). Valores sutis (1.01-1.05) são mais elegantes; valores altos (>1.1) chamam muita atenção.',
            axis: 'motion',
            constraints: { min: 0.8, max: 1.2, step: 0.01 },
            defaultValue: 1.02,
            cssVars: ['--sarak-btn-hover-scale']
        },
        {
            id: 'btnActiveScale',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Amplia ou comprime o botão enquanto está pressionado; 1 mantém a escala original.",
            label: 'Escala no Clique',
            type: 'slider',
            description: 'Fator de escala do botão no instante do clique/toque (estado `:active`). Valores abaixo de 1.0 simulam o botão "afundando" — reforço tátil de que o clique foi registrado. Costuma ser um pouco menor que `btnHoverScale` para dar sensação de profundidade progressiva.',
            axis: 'motion',
            constraints: { min: 0.8, max: 1.2, step: 0.01 },
            defaultValue: 0.98,
            cssVars: ['--sarak-btn-active-scale']
        },
        {
            id: 'btnPrimaryBg',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Pinta o fundo do botão primário e define a tinta usada por alguns estilos do botão.",
            label: 'Fundo Primário',
            type: 'color',
            description: 'Cor de fundo do botão de maior ênfase (ação principal da tela, ex. "Confirmar", "Salvar"). É a cor mais visível do sistema depois da cor de marca — costuma ser a mesma ou derivada de `primaryColor`. Gera variantes automáticas de hover/active (`generateVariants: true`).',
            axis: 'color',
            defaultValue: '#00f2ff',
            generateVariants: true,
            cssVars: ['--sarak-btn-primary-bg']
        },
        {
            id: 'btnPrimaryText',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Colore o texto do botão primário; escolha contraste suficiente com btnPrimaryBg.",
            label: 'Texto Primário',
            type: 'color',
            description: 'Cor do texto/ícone dentro do botão primário. Deve manter contraste alto contra `btnPrimaryBg` (ex. texto escuro sobre fundo primário claro/neon) — não é gerado automaticamente, ajuste manual sempre que `btnPrimaryBg` mudar de luminosidade.',
            axis: 'color',
            defaultValue: '#000000',
            cssVars: ['--sarak-btn-primary-text']
        },
        {
            id: 'btnSecondaryBg',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Pinta o fundo dos botões secundários, inclusive nas estratégias neon e frosted.",
            label: 'Fundo Secundário',
            type: 'color',
            description: 'Cor de fundo dos botões de ação secundária (ex. "Cancelar", "Voltar") — menos ênfase visual que o primário, tipicamente translúcido/neutro. Gera variantes automáticas de hover/active.',
            axis: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.05)',
            generateVariants: true,
            cssVars: ['--sarak-btn-secondary-bg']
        },
        {
            id: 'btnGhostHoverBg',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Pinta o fundo do botão ghost enquanto o ponteiro está sobre ele.",
            label: 'Hover (Ghost)',
            type: 'color',
            description: 'Cor de fundo aplicada no hover de botões "ghost" (sem fundo/borda em repouso, só texto) — o único feedback visual de hover para esse estilo, já que não há fundo base para escurecer/clarear.',
            axis: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.05)',
            cssVars: ['--sarak-btn-ghost-hover']
        },

        // --- ESTILOS AVANÇADOS (SELEÇÃO DO USUÁRIO) ---
        {
            id: 'btnStyleType',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Escolhe a aparência dos botões e ativa as regras condicionais de neon, vidro fosco, contorno ou relevo.",
            label: 'Estilo do Botão',
            type: 'select',
            description: 'Define a linguagem visual completa do botão — matte (sólido, sóbrio, o mais neutro/corporativo), neon (brilho pulsante, clima cyberpunk/tech), frosted (vidro fosco translúcido, clima moderno/Apple-like), borderline (só contorno, minimalista/editorial), cyberpunk (wireframe anguloso), neumorphism (relevo suave, soft UI). Escolha isto ANTES de ajustar cores — o estilo muda quais outros tokens (glow, blur) fazem efeito.',
            axis: 'texture',
            constraints: {
                options: BUTTON_STYLE_OPTIONS
            },
            defaultValue: 'matte',
            cssVars: ['--sarak-btn-style-type']
        },
        {
            id: 'btnNeonGlowColor',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Define a cor do halo de botões neon e cyberpunk.",
            interactsWith: ['btnStyleType'],
            label: 'Cor do Brilho (Neon)',
            type: 'color',
            description: 'Cor do brilho/glow ao redor do botão — só tem efeito visível quando `btnStyleType` é \'neon\' ou \'cyberpunk\'. Normalmente usa a mesma cor de `btnPrimaryBg` em formato rgba com transparência, pra o brilho combinar com o botão.',
            axis: 'elevation',
            defaultValue: 'rgba(0, 242, 255, 0.4)',
            cssVars: ['--sarak-btn-neon-glow-color']
        },
        {
            id: 'btnNeonPulseSpeed',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Define o ciclo do halo pulsante; zero mantém estático e o estilo neon precisa estar selecionado.",
            interactsWith: ['btnStyleType'],
            label: 'Velocidade de Pulso (s)',
            type: 'slider',
            description: 'Duração (em segundos) de um ciclo de pulsação do brilho neon — só relevante quando `btnStyleType` é \'neon\'. 0 (padrão) = brilho parado, sem pulso. Valores baixos (0.5-1s) = pulsação rápida/urgente; valores altos (2-4s) = pulsação lenta/ambiente.',
            axis: 'motion',
            unit: 's',
            constraints: { min: 0, max: 4, step: 0.1 },
            defaultValue: 0,
            cssVars: ['--sarak-btn-neon-pulse-speed']
        },
        {
            id: 'btnBackdropBlur',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Desfoca o fundo atrás dos botões no estilo frosted; outros estilos não aplicam o desfoque.",
            interactsWith: ['btnStyleType'],
            label: 'Desfoque de Vidro (Backdrop Blur)',
            type: 'slider',
            description: 'Intensidade do desfoque do que está atrás do botão (efeito vidro fosco) — só produz efeito visível quando `btnStyleType` é \'frosted\'. Valores altos (>15px) intensificam a sensação de vidro espesso; valores baixos deixam o conteúdo de fundo quase legível através do botão.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 30 },
            defaultValue: 8,
            cssVars: ['--sarak-btn-backdrop-blur']
        },

        // --- GLOW DO ICON BUTTON (Spec 27) ---
        {
            id: 'iconButtonGlowBlurSm',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Controla o desfoque do brilho pequeno do SarakIconButton em repouso ou no hover.",
            interactsWith: ['btnStyleType'],
            label: 'Glow do Icon Button: Desfoque Pequeno',
            type: 'slider',
            description: 'Raio de desfoque (blur) do brilho ao redor de um botão de ícone pequeno. Aplica-se ao `SarakIconButton` na variante de tamanho "sm" — mantenha proporcional a `iconButtonGlowBlurMd`/`Lg` para consistência visual entre os 3 tamanhos.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 30 },
            defaultValue: 5,
            cssVars: ['--sarak-icon-button-glow-blur-sm']
        },
        {
            id: 'iconButtonGlowBlurMd',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Controla o desfoque médio do brilho de variantes secundária e ghost do SarakIconButton.",
            interactsWith: ['btnStyleType'],
            label: 'Glow do Icon Button: Desfoque Médio',
            type: 'slider',
            description: 'Raio de desfoque (blur) do brilho ao redor de um botão de ícone de tamanho médio (variante padrão do `SarakIconButton`).',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 30 },
            defaultValue: 8,
            cssVars: ['--sarak-icon-button-glow-blur-md']
        },
        {
            id: 'iconButtonGlowBlurLg',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Controla o desfoque grande do brilho de variantes primary e danger do SarakIconButton no hover.",
            interactsWith: ['btnStyleType'],
            label: 'Glow do Icon Button: Desfoque Grande',
            type: 'slider',
            description: 'Raio de desfoque (blur) do brilho ao redor de um botão de ícone grande — use valores mais altos que `Sm`/`Md` para manter a proporção visual do glow em relação ao tamanho maior do botão.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 40 },
            defaultValue: 12,
            cssVars: ['--sarak-icon-button-glow-blur-lg']
        },
        {
            id: 'iconButtonFrostedShadowOffsetY',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Desloca para baixo a sombra do SarakIconButton quando o estilo frosted está ativo.",
            interactsWith: ['btnStyleType'],
            label: 'Sombra Frosted do Icon Button: Offset Y',
            type: 'slider',
            description: 'Deslocamento vertical (em pixels) da sombra do botão de ícone quando `btnStyleType` é \'frosted\' — valores maiores empurram a sombra mais para baixo, reforçando a sensação de elevação/flutuação do vidro fosco.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 20 },
            defaultValue: 4,
            cssVars: ['--sarak-icon-button-frosted-shadow-offset-y']
        },
        {
            id: 'iconButtonFrostedShadowBlur',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Suaviza a sombra do SarakIconButton no estilo frosted.",
            interactsWith: ['btnStyleType'],
            label: 'Sombra Frosted do Icon Button: Desfoque',
            type: 'slider',
            description: 'Raio de desfoque da sombra do botão de ícone no estilo \'frosted\' — combine com `iconButtonFrostedShadowOffsetY` para controlar o quão "suave"/difusa é a sombra projetada.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 40 },
            defaultValue: 16,
            cssVars: ['--sarak-icon-button-frosted-shadow-blur']
        },

        // --- DROPDOWN DO THEME TOGGLE (Spec 27) ---

        // --- SOMBRA DE AÇÃO (GLOW) DO SARAKCATALOGGRID (Spec 27) ---
        {
            id: 'actionGlowShadowOffsetY',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Controla o deslocamento vertical da sombra no botão da categoria selecionada em `SarakCatalogGrid`.",
            label: 'Sombra de Ação: Offset Y',
            type: 'slider',
            description: 'Deslocamento vertical, em pixels, da sombra aplicada pelo estilo inline ao botão da categoria selecionada em `SarakCatalogGrid`. No estilo `matte`, `SarakButton` preserva essa sombra; estilos com sombra dinâmica própria podem substituí-la.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 40 },
            defaultValue: 10,
            cssVars: ['--sarak-action-glow-shadow-offset-y']
        },
        {
            id: 'actionGlowShadowBlur',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Controla o desfoque da sombra no botão da categoria selecionada em `SarakCatalogGrid`.",
            label: 'Sombra de Ação: Desfoque',
            type: 'slider',
            description: 'Raio de desfoque, em pixels, da sombra aplicada pelo estilo inline ao botão da categoria selecionada em `SarakCatalogGrid`. No estilo `matte`, `SarakButton` preserva essa sombra; estilos com sombra dinâmica própria podem substituí-la.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 60 },
            defaultValue: 20,
            cssVars: ['--sarak-action-glow-shadow-blur']
        },
        {
            id: 'actionGlowShadowSpread',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Controla o espalhamento da sombra no botão da categoria selecionada em `SarakCatalogGrid`.",
            label: 'Sombra de Ação: Espalhamento',
            type: 'slider',
            description: 'Espalhamento, em pixels, da sombra aplicada pelo estilo inline ao botão da categoria selecionada em `SarakCatalogGrid`. No estilo `matte`, `SarakButton` preserva essa sombra; estilos com sombra dinâmica própria podem substituí-la.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 40 },
            defaultValue: 10,
            cssVars: ['--sarak-action-glow-shadow-spread']
        }
    ]
};
