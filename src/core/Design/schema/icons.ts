import type { SarakDesignToken } from '../types';

const ICON_STROKE_MAX = 4;
const ICON_STROKE_STEP = 0.25;

export const ICON_TOKENS: SarakDesignToken[] = [
    {
        id: 'iconFamily',
        kind: 'aesthetic',
        modeDependent: false,
        usage: "Família dos ícones do cromo e dos componentes: Phosphor, Lucide ou Tabler; troca o desenho de todos os ícones (Phosphor em peso, as outras em traço).",
        label: 'Família de Ícones',
        type: 'select',
        description: 'Família de ícones usada pelos componentes da biblioteca por meio de SarakIcon. Lucide é o padrão; Phosphor e Tabler têm caráter visual próprio.',
        axis: 'texture',
        defaultValue: 'lucide',
        options: [
            { value: 'lucide', label: 'Lucide (Padrão)' },
            { value: 'phosphor', label: 'Phosphor' },
            { value: 'tabler', label: 'Tabler Icons' },
        ],
    },
    {
        id: 'iconWeight',
        kind: 'aesthetic',
        modeDependent: false,
        usage: "Peso do ícone: na família Phosphor escolhe o desenho (fino, regular, negrito, preenchido); em Tabler ajusta a espessura do traço.",
        interactsWith: ['iconFamily'],
        label: 'Peso / Estilo do Ícone',
        type: 'select',
        description: 'Peso visual aplicado pelos componentes que usam SarakIcon. Phosphor oferece pesos nativos; Lucide e Tabler aproximam o peso por espessura de traço.',
        axis: 'density',
        defaultValue: 'regular',
        options: [
            { value: 'thin', label: 'Thin' },
            { value: 'light', label: 'Light' },
            { value: 'regular', label: 'Regular' },
            { value: 'bold', label: 'Bold' },
            { value: 'fill', label: 'Fill (Preenchido)' },
            { value: 'duotone', label: 'Duotone' },
        ],
    },
    {
        id: 'iconStrokeWidth',
        kind: 'aesthetic',
        modeDependent: false,
        usage: "Espessura do traço dos ícones Lucide e Tabler; os ícones Phosphor, desenhados por peso, ignoram o valor.",
        interactsWith: ['iconFamily'],
        label: 'Espessura do Ícone',
        type: 'slider',
        description: 'Escala a espessura do traço dos ícones vetoriais renderizados por SarakIcon — valores altos dão mais presença; valores baixos, um traço mais fino.',
        axis: 'geometry',
        constraints: { min: 1, max: ICON_STROKE_MAX, step: ICON_STROKE_STEP },
        defaultValue: 2,
        cssVars: ['--sarak-icon-stroke', '--theme-icon-stroke'],
    },
];
