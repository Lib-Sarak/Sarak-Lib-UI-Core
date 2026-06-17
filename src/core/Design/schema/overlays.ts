import { ComponentSchema } from '../types';

/**
 * SCHEMA: MODAIS & OVERLAYS
 * Governa a experiência de elementos flutuantes, diálogos e tooltips.
 */
export const OverlaysSchema: ComponentSchema = {
    id: 'overlays',
    label: 'Sobreposições (Overlays)',
    tokens: [
        {
            id: 'modalActionAlignment',
            label: 'Alinhamento das Ações',
            type: 'select',
            constraints: {
                options: [
                    { id: 'left', value: 'left', label: 'Esquerda' },
                    { id: 'center', value: 'center', label: 'Centro' },
                    { id: 'right', value: 'right', label: 'Direita' },
                    { id: 'stretch', value: 'stretch', label: 'Largura Total' }
                ]
            },
            defaultValue: 'right'
        },
        {
            id: 'modalHeaderStyle',
            label: 'Estilo do Cabeçalho',
            type: 'select',
            constraints: {
                options: [
                    { id: 'inline', value: 'inline', label: 'Na mesma linha' },
                    { id: 'stacked', value: 'stacked', label: 'Empilhado' },
                    { id: 'floating', value: 'floating', label: 'Flutuante (X fora)' }
                ]
            },
            defaultValue: 'inline'
        },
        {
            id: 'modalOverlayColor',
            label: 'Cor do Overlay',
            type: 'color',
            defaultValue: 'rgba(0, 0, 0, 0.4)',
            cssVars: ['--sarak-modal-overlay']
        },
        {
            id: 'modalOverlayBlur',
            label: 'Blur do Overlay',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 40 },
            defaultValue: 8,
            cssVars: ['--sarak-modal-blur']
        },
        {
            id: 'modalBorderRadius',
            label: 'Arredondamento (Modal)',
            type: 'slider',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 40 },
            defaultValue: { mob: 12, tab: 16, desk: 16 },
            cssVars: ['--sarak-modal-border-radius']
        },
        {
            id: 'tooltipBg',
            label: 'Fundo do Tooltip',
            type: 'color',
            defaultValue: '#0f172a',
            cssVars: ['--sarak-tooltip-bg']
        },
        {
            id: 'tooltipRadius',
            label: 'Raio do Tooltip',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 12 },
            defaultValue: 4,
            cssVars: ['--sarak-tooltip-radius']
        }
    ]
};
