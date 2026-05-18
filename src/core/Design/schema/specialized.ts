import { ComponentSchema } from '../types';

/**
 * SCHEMA: MÓDULOS ESPECIAIS & IA
 * Governa componentes complexos de domínio específico e IA.
 */
export const SpecializedSchema: ComponentSchema = {
    id: 'specialized',
    label: 'Ícones e Estética',
    pilar: 'systems',
    subcategory: 'Módulos e IA',
    tokens: [
        {
            id: 'aiPanelBg',
            label: 'Fundo do Painel IA',
            category: 'IA Core',
            type: 'color',
            defaultValue: 'rgba(0, 0, 0, 0.4)',
            cssVars: ['--sarak-ai-panel-bg']
        },
        {
            id: 'aiGlowColor',
            label: 'Cor do Brilho IA',
            category: 'IA Core',
            type: 'color',
            defaultValue: '#00f2ff',
            cssVars: ['--sarak-ai-glow']
        },
        {
            id: 'flowNodeRadius',
            label: 'Raio dos Nós (Fluxo)',
            category: 'Editor de Fluxos',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 40, step: 1 },
            defaultValue: 12,
            cssVars: ['--sarak-flow-radius', '--sarak-flow-node-radius']
        },
        {
            id: 'flowGridStyle',
            label: 'Estilo do Grid (Fluxo)',
            category: 'Editor de Fluxos',
            type: 'select',
            defaultValue: 'dots',
            options: [
                { value: 'dots', label: 'Dots (Standard)' },
                { value: 'lines', label: 'Lines (Technical)' }
            ],
            cssVars: ['--sarak-flow-grid']
        }
    ]
};
