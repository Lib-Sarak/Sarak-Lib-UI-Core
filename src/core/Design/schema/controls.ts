import { ComponentSchema } from '../types';

/**
 * Mapeamento 100% Granular: Controles de Interação
 */
export const ControlsSchema: ComponentSchema = {
    id: 'controls',
    label: 'Botões & Inputs',
    tokens: [
        {
            id: 'buttonRadius',
            label: 'Raio do Botão',
            category: 'Botões',
            type: 'slider',
            unit: 'px',
            constraints: {
                min: 0,
                max: 40,
            },
            defaultValue: 8,
            cssVars: ['--button-radius']
        },
        {
            id: 'buttonPadding',
            label: 'Padding do Botão',
            category: 'Botões',
            type: 'slider',
            unit: 'px',
            constraints: {
                min: 4,
                max: 32,
            },
            defaultValue: 12,
            cssVars: ['--button-padding']
        },
        {
            id: 'inputBackgroundColor',
            label: 'Cor de Fundo do Input',
            category: 'Inputs',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.05)',
            cssVars: ['--input-bg']
        },
        {
            id: 'inputBorderWidth',
            label: 'Borda do Input',
            category: 'Inputs',
            type: 'slider',
            unit: 'px',
            constraints: {
                min: 0,
                max: 4,
            },
            defaultValue: 1,
            cssVars: ['--input-border-width']
        },
        {
            id: 'buttonHoverLift',
            label: 'Efeito de Elevação',
            category: 'Feedback',
            type: 'boolean',
            defaultValue: true
        },
        {
            id: 'buttonColor',
            label: 'Cor Base do Botão',
            category: 'Botões',
            type: 'color',
            defaultValue: '#3b82f6',
            cssVars: ['--theme-button-bg', '--sarak-button-bg']
        },
        {
            id: 'buttonHoverColor',
            label: 'Cor Hover do Botão',
            category: 'Botões',
            type: 'color',
            defaultValue: '#60a5fa',
            cssVars: ['--theme-button-hover', '--sarak-button-hover']
        },
        {
            id: 'buttonActiveColor',
            label: 'Cor Ativa do Botão',
            category: 'Botões',
            type: 'color',
            defaultValue: 'transparent',
            cssVars: ['--sarak-button-active-color']
        },
        {
            id: 'buttonHoverEffect',
            label: 'Efeito Hover',
            category: 'Feedback',
            type: 'select',
            constraints: {
                options: [
                    { id: 'none', label: 'Nenhum' },
                    { id: 'lift', label: 'Elevação (Lift)' },
                    { id: 'glow', label: 'Brilho (Glow)' },
                    { id: 'glass', label: 'Vidro (Glass)' },
                    { id: 'outline', label: 'Borda (Outline)' }
                ],
            },
            defaultValue: 'glow',
            cssVars: ['--sarak-button-hover']
        },
        {
            id: 'inputStyle',
            label: 'Estilo do Campo',
            category: 'Inputs',
            type: 'select',
            constraints: {
                options: [
                    { id: 'flat', label: 'Flat' },
                    { id: 'glass', label: 'Glass' },
                    { id: 'bordered', label: 'Bordado' }
                ],
            },
            defaultValue: 'glass',
            cssVars: ['--sarak-input-style']
        },
        {
            id: 'interfaceElasticity',
            label: 'Elasticidade da Interface',
            category: 'Feedback',
            type: 'slider',
            constraints: {
                min: 0,
                max: 1,
                step: 0.1,
            },
            defaultValue: 0.5,
            cssVars: ['--sarak-elasticity']
        },
        {
            id: 'hapticIntensity',
            label: 'Intensidade Háptica (Simulada)',
            category: 'Feedback',
            type: 'slider',
            constraints: {
                min: 0,
                max: 1,
                step: 0.1,
            },
            defaultValue: 0.1,
            cssVars: ['--haptic-intensity']
        }
    ]
};
