import { ComponentSchema } from '../types';

/**
 * SCHEMA: MÓDULOS ESPECIAIS & IA
 * Governa componentes complexos de domínio específico e IA.
 */
export const SpecializedSchema: ComponentSchema = {
    id: 'specialized',
    label: 'Módulos de IA',
    pilar: 'specialized',
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
            constraints: { min: 0, max: 20 },
            defaultValue: 8,
            cssVars: ['--sarak-flow-node-radius']
        }
    ]
};
