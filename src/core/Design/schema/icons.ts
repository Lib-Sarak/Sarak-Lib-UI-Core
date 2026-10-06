import type { SarakDesignToken } from '../types';

const ICON_STROKE_MAX = 4;
const ICON_STROKE_STEP = 0.5;

export const ICON_TOKENS: SarakDesignToken[] = [
    {
        id: 'iconFamily',
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
        label: 'Espessura do Ícone',
        type: 'slider',
        description: 'Escala a espessura do traço dos ícones vetoriais renderizados por SarakIcon — valores altos dão mais presença; valores baixos, um traço mais fino.',
        axis: 'geometry',
        constraints: { min: 1, max: ICON_STROKE_MAX, step: ICON_STROKE_STEP },
        defaultValue: 2,
        cssVars: ['--sarak-icon-stroke', '--theme-icon-stroke'],
    },
];
