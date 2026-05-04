import { ComponentSchema } from '../types';

/**
 * Mapeamento 100% Granular: Componentes Especializados
 */
export const SpecializedSchema: ComponentSchema = {
    id: 'specialized',
    label: 'Componentes Avançados',
    tokens: [
        {
            id: 'chatBubbleStyle',
            label: 'Estilo do Chat',
            category: 'Chat',
            type: 'select',
            constraints: {
                options: [
                    { id: 'glass', label: 'Glass' },
                    { id: 'flat', label: 'Flat' },
                    { id: 'industrial', label: 'Industrial' }
                ],
            },
            defaultValue: 'glass',
            cssVars: ['--chat-bubble-style']
        },
        {
            id: 'flowGridStyle',
            label: 'Grid do Fluxograma',
            category: 'Diagramas',
            type: 'select',
            constraints: {
                options: [
                    { id: 'dots', label: 'Pontos' },
                    { id: 'lines', label: 'Linhas' },
                    { id: 'cross', label: 'Cruzes' }
                ],
            },
            defaultValue: 'dots',
            cssVars: ['--flow-grid-style']
        },
        {
            id: 'performanceMode',
            label: 'Modo de Performance',
            category: 'Sistema',
            type: 'select',
            constraints: {
                options: [
                    { id: 'high', label: 'Alta Fidelidade (Animações ON)' },
                    { id: 'eco', label: 'Economia (Animações OFF)' }
                ],
            },
            defaultValue: 'high'
        }
    ]
};
