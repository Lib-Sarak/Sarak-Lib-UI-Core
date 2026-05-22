import { ComponentSchema } from '../types';

/**
 * SCHEMA: ALTERNADORES & SWITCHES
 * Governa seletores binários, checkboxes, switches premium e toggles táteis.
 */
export const SwitchesSchema: ComponentSchema = {
    id: 'switches',
    label: 'Alternadores (Toggles)',
    tokens: [
        {
            id: 'switchTrackActiveBg',
            label: 'Cor: Switch Ativo',
            type: 'color',
            defaultValue: '#00f2ff',
            generateVariants: true,
            cssVars: ['--sarak-switch-active-bg']
        },
        {
            id: 'switchThumbBg',
            label: 'Cor: Switch Botão',
            type: 'color',
            defaultValue: '#ffffff',
            cssVars: ['--sarak-switch-thumb']
        },
        {
            id: 'checkboxActiveColor',
            label: 'Cor do Check Selecionado',
            type: 'color',
            defaultValue: '#00f2ff',
            generateVariants: true,
            cssVars: ['--sarak-checkbox-active']
        },
        {
            id: 'switchStyleType',
            label: 'Estilo do Alternador (Switch)',
            type: 'select',
            constraints: {
                options: [
                    { id: 'tactile', value: 'tactile', label: 'Tactile Slider' },
                    { id: 'asymmetric', value: 'asymmetric', label: 'Asymmetric Toggle' },
                    { id: 'pulsing', value: 'pulsing', label: 'Pulsing Dot' },
                    { id: 'glass', value: 'glass', label: 'Micro Glass Tab' }
                ]
            },
            defaultValue: 'tactile',
            cssVars: ['--sarak-switch-style-type']
        },
        {
            id: 'switchBackdropBlur',
            label: 'Desfoque do Alternador (Vidro)',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 20 },
            defaultValue: 4,
            cssVars: ['--sarak-switch-backdrop-blur']
        },
        {
            id: 'switchPulseColor',
            label: 'Cor do Pulso (Pulsing Dot)',
            type: 'color',
            defaultValue: '#00f2ff',
            cssVars: ['--sarak-switch-pulse-color']
        }
    ]
};
