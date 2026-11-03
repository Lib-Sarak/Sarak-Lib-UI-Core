import type { ComponentPreset } from './cards';

/** Botões de estrutura: forma, escala de resposta e brilho dos botões de ícone e de ação. Nenhum escreve cor. */
export const BUTTON_STRUCTURE_PRESETS: ComponentPreset[] = [
    {
        id: 'btn-solid-pill',
        name: 'Pílula sólida',
        description: 'Botão cheio e totalmente arredondado: chamada de ação amigável.',
        keywords: ['pilula', 'pill', 'redondo', 'cheio'],
        design: { btnStyleType: 'matte', btnBorderRadius: 120, btnHoverScale: 1.04, btnActiveScale: 0.97 },
    },
    {
        id: 'btn-square-flat',
        name: 'Quadrado e plano',
        description: 'Cantos retos, sem desfoque e sem animação de escala: direto e utilitário.',
        keywords: ['reto', 'square', 'plano', 'flat'],
        design: { btnStyleType: 'matte', btnBorderRadius: 0, btnBackdropBlur: 0, btnHoverScale: 1, btnActiveScale: 1 },
    },
    {
        id: 'btn-leaf-corners',
        name: 'Cantos em folha',
        description: 'Dois cantos opostos bem redondos e dois quase retos.',
        keywords: ['folha', 'leaf', 'assimetrico'],
        design: { btnStyleType: 'matte', btnRadiusTL: 24, btnRadiusBR: 24, btnRadiusTR: 3, btnRadiusBL: 3 },
    },
    {
        id: 'btn-press-deep',
        name: 'Afunda ao clicar',
        description: 'Não cresce no hover, mas afunda bastante no clique: resposta de tecla.',
        keywords: ['tecla', 'press', 'clique', 'tatil'],
        design: { btnStyleType: 'matte', btnBorderRadius: 8, btnHoverScale: 1, btnActiveScale: 0.9 },
    },
    {
        id: 'btn-soft-glow',
        name: 'Brilho de ação',
        description: 'Sombra luminosa larga sob o botão de ação e brilho nos botões de ícone.',
        keywords: ['brilho', 'glow', 'sombra', 'icone'],
        design: {
            btnBorderRadius: 14, actionGlowShadowOffsetY: 14, actionGlowShadowBlur: 40, actionGlowShadowSpread: 18,
            iconButtonGlowBlurSm: 10, iconButtonGlowBlurMd: 16, iconButtonGlowBlurLg: 24,
        },
    },
    {
        id: 'btn-glass-icon',
        name: 'Ícone em vidro',
        description: 'Botões de ícone foscos, com sombra funda e desfoque forte por trás.',
        keywords: ['vidro', 'glass', 'icone', 'fosco'],
        design: { btnStyleType: 'frosted', btnBorderRadius: 14, btnBackdropBlur: 18, iconButtonFrostedShadowOffsetY: 10, iconButtonFrostedShadowBlur: 30 },
    },
    {
        id: 'btn-outline-round',
        name: 'Contorno redondo',
        description: 'Só contorno, em pílula, que cresce um pouco no hover.',
        keywords: ['contorno', 'outline', 'borda', 'pilula'],
        design: { btnStyleType: 'borderline', btnBorderRadius: 120, btnHoverScale: 1.06, btnActiveScale: 0.96 },
    },
];
