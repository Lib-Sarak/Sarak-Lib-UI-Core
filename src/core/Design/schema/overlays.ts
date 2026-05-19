import { ComponentSchema } from '../types';

/**
 * SCHEMA: MODAIS & OVERLAYS
 * Governa a experiência de elementos flutuantes, diálogos e tooltips.
 */
export const OverlaysSchema: ComponentSchema = {
    id: 'overlays',
    label: 'Sobreposições (Overlays)',
    pilar: 'surfaces',
    subcategory: 'Espaço e Atmosfera',
    tokens: [
        {
            id: 'modalOverlayColor',
            label: 'Cor do Overlay',
            category: 'Modais: Background',
            type: 'color',
            defaultValue: 'rgba(0, 0, 0, 0.4)',
            cssVars: ['--sarak-modal-overlay']
        },
        {
            id: 'modalOverlayBlur',
            label: 'Blur do Overlay',
            category: 'Modais: Background',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 40 },
            defaultValue: 8,
            cssVars: ['--sarak-modal-blur']
        },
        {
            id: 'modalBorderRadius',
            label: 'Arredondamento (Modal)',
            category: 'Modais: Geometria',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 40 },
            defaultValue: 16,
            cssVars: ['--sarak-modal-border-radius']
        },
        {
            id: 'tooltipBg',
            label: 'Fundo do Tooltip',
            category: 'Tooltips & Popovers',
            type: 'color',
            defaultValue: '#0f172a',
            cssVars: ['--sarak-tooltip-bg']
        },
        {
            id: 'tooltipRadius',
            label: 'Raio do Tooltip',
            category: 'Tooltips & Popovers',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 12 },
            defaultValue: 4,
            cssVars: ['--sarak-tooltip-radius']
        }
    ]
};
