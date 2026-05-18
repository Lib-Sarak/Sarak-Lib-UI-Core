import { ComponentSchema } from '../types';

/**
 * SCHEMA: CHAT & MENSAGENS
 * Especializado em interfaces de conversação e IA.
 */
export const ChatSchema: ComponentSchema = {
    id: 'chat',
    label: 'Interface de Chat',
    pilar: 'systems',
    subcategory: 'Chat e IA',
    tokens: [
        {
            id: 'chatBubbleRadius',
            label: 'Arredondamento das Bolhas',
            category: 'Anatomia',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 24 },
            defaultValue: 12,
            cssVars: ['--sarak-chat-radius']
        },
        {
            id: 'chatUserBg',
            label: 'Fundo (Usuário)',
            category: 'Cores',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.05)',
            cssVars: ['--sarak-chat-user-bg']
        },
        {
            id: 'chatBubbleStyle',
            label: 'Estilo de Bolha',
            category: 'Anatomia',
            type: 'select',
            defaultValue: 'glass',
            options: [
                { value: 'glass', label: 'Glass' },
                { value: 'solid', label: 'Solid' },
                { value: 'minimal', label: 'Minimal' }
            ],
            cssVars: ['--sarak-chat-bubble']
        },
        {
            id: 'chatAnimationSpeed',
            label: 'Velocidade de Digitação',
            category: 'IA Core',
            type: 'slider',
            unit: 's',
            constraints: { min: 0, max: 0.5, step: 0.01 },
            defaultValue: 0.05,
            cssVars: ['--sarak-chat-anim-speed']
        }
    ]
};
