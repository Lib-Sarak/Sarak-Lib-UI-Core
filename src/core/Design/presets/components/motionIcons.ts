import type { ComponentPreset } from './cards';

/** Ritmo do movimento: as quatro durações, as três curvas e o atraso em cascata. Duração em segundos. */
export const MOTION_PRESETS: ComponentPreset[] = [
    {
        id: 'motion-instant',
        name: 'Instantâneo',
        description: 'Sem animação: tudo muda no mesmo quadro. Para quem prefere resposta seca.',
        keywords: ['instantaneo', 'instant', 'sem animacao', 'seco'],
        design: { motionDurationInstant: 0, motionDurationFast: 0, motionDurationNormal: 0, motionDurationSlow: 0, motionStaggerDelay: 0 },
    },
    {
        id: 'motion-agile',
        name: 'Ágil',
        description: 'Transições curtas e secas, que acompanham o clique sem fazer esperar.',
        keywords: ['agil', 'agile', 'rapido', 'fast'],
        design: {
            motionDurationInstant: 0.05, motionDurationFast: 0.12, motionDurationNormal: 0.18, motionDurationSlow: 0.35, motionStaggerDelay: 0.02,
            motionEaseMain: 'cubic-bezier(0.2, 0, 0, 1)', motionEaseOut: 'cubic-bezier(0, 0, 0.2, 1)', motionEaseIn: 'cubic-bezier(0.4, 0, 1, 1)',
        },
    },
    {
        id: 'motion-calm',
        name: 'Sereno',
        description: 'Transições longas e suaves, entrando em cascata: tudo chega com calma.',
        keywords: ['sereno', 'calm', 'calmo', 'lento'],
        design: {
            motionDurationInstant: 0.15, motionDurationFast: 0.3, motionDurationNormal: 0.5, motionDurationSlow: 1, motionStaggerDelay: 0.09,
            motionEaseMain: 'cubic-bezier(0.45, 0, 0.15, 1)', motionEaseOut: 'cubic-bezier(0.25, 1, 0.5, 1)', motionEaseIn: 'cubic-bezier(0.5, 0, 0.75, 0)',
        },
    },
    {
        id: 'motion-expressive',
        name: 'Expressivo',
        description: 'Movimento com um leve ricochete no fim: o sistema tem personalidade.',
        keywords: ['expressivo', 'expressive', 'ricochete', 'bounce'],
        design: {
            motionDurationInstant: 0.1, motionDurationFast: 0.25, motionDurationNormal: 0.5, motionDurationSlow: 1.2, motionStaggerDelay: 0.12,
            motionEaseMain: 'cubic-bezier(0.34, 1.56, 0.64, 1)', motionEaseOut: 'cubic-bezier(0.34, 1.3, 0.64, 1)', motionEaseIn: 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
        },
    },
];

/** Troca de página: uma opção de `pageTransitionType` por preset. */
export const PAGE_TRANSITION_PRESETS: ComponentPreset[] = [
    { id: 'page-fade', name: 'Esmaecer', description: 'A tela nova surge aos poucos, sem se mexer.', keywords: ['esmaecer', 'fade', 'aparecer'], design: { pageTransitionType: 'fade' } },
    { id: 'page-slide-up', name: 'Subir', description: 'A tela nova sobe de baixo para o lugar dela.', keywords: ['subir', 'slide', 'baixo', 'cima'], design: { pageTransitionType: 'slide-up' } },
    { id: 'page-slide-side', name: 'Deslizar de lado', description: 'A tela nova entra deslizando pela lateral.', keywords: ['lateral', 'side', 'deslizar', 'lado'], design: { pageTransitionType: 'slide-side' } },
    { id: 'page-zoom', name: 'Aproximar', description: 'A tela nova cresce do centro até o tamanho final.', keywords: ['zoom', 'aproximar', 'crescer'], design: { pageTransitionType: 'zoom' } },
    { id: 'page-none', name: 'Sem transição', description: 'A tela muda de uma vez, sem efeito.', keywords: ['nenhuma', 'none', 'direto', 'corte'], design: { pageTransitionType: 'none' } },
];

/** Ícones: a família, o peso do traço e a espessura do contorno. */
export const ICON_PRESETS: ComponentPreset[] = [
    { id: 'icons-lucide-fine', name: 'Traço fino', description: 'Contornos delicados e limpos, de traço leve.', keywords: ['fino', 'fine', 'lucide', 'leve'], design: { iconFamily: 'lucide', iconWeight: 'light', iconStrokeWidth: 1.5 } },
    { id: 'icons-lucide-bold', name: 'Traço firme', description: 'Os mesmos contornos, mais grossos e fáceis de ver de longe.', keywords: ['firme', 'bold', 'lucide', 'grosso'], design: { iconFamily: 'lucide', iconWeight: 'bold', iconStrokeWidth: 2.75 } },
    { id: 'icons-phosphor-thin', name: 'Linha delicada', description: 'Linhas finíssimas, elegantes e arejadas.', keywords: ['delicada', 'thin', 'phosphor', 'fina'], design: { iconFamily: 'phosphor', iconWeight: 'thin', iconStrokeWidth: 1 } },
    { id: 'icons-phosphor-duotone', name: 'Dois tons', description: 'Cada ícone tem um preenchimento suave por trás do contorno.', keywords: ['dois tons', 'duotone', 'phosphor', 'preenchimento'], design: { iconFamily: 'phosphor', iconWeight: 'duotone', iconStrokeWidth: 2 } },
    { id: 'icons-phosphor-fill', name: 'Preenchidos', description: 'Ícones sólidos, de forma cheia e peso visual alto.', keywords: ['preenchido', 'fill', 'solido', 'phosphor'], design: { iconFamily: 'phosphor', iconWeight: 'fill', iconStrokeWidth: 2.5 } },
    { id: 'icons-phosphor-bold', name: 'Negrito', description: 'Contornos grossos e arredondados, com bastante presença.', keywords: ['negrito', 'bold', 'phosphor', 'grosso'], design: { iconFamily: 'phosphor', iconWeight: 'bold', iconStrokeWidth: 3 } },
    { id: 'icons-tabler-regular', name: 'Técnico', description: 'Traço uniforme de ar técnico, de uma família de painel de controle.', keywords: ['tecnico', 'tabler', 'uniforme', 'regular'], design: { iconFamily: 'tabler', iconWeight: 'regular', iconStrokeWidth: 2 } },
    { id: 'icons-tabler-light', name: 'Técnico leve', description: 'A mesma família técnica com traço mais fino e leve.', keywords: ['leve', 'light', 'tabler', 'fino'], design: { iconFamily: 'tabler', iconWeight: 'light', iconStrokeWidth: 1.25 } },
];
