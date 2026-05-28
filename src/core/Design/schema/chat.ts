import { ComponentSchema } from '../types';

/**
 * SCHEMA: CHAT & MENSAGENS
 * Especializado em interfaces de conversação e IA.
 */
export const ChatSchema: ComponentSchema = {
    id: 'chat',
    label: 'Interface de Chat',
    tokens: [
        {
            id: 'chatBubbleRadius',
            label: 'Arredondamento das Bolhas',
            type: 'slider',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 24 },
            defaultValue: { mob: 8, tab: 10, desk: 12 },
            cssVars: ['--sarak-chat-radius']
        },
        {
            id: 'chatUserBg',
            label: 'Fundo (Usuário)',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.05)',
            cssVars: ['--sarak-chat-user-bg']
        },
        {
            id: 'chatBubbleStyle',
            label: 'Estilo de Bolha',
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
            type: 'slider',
            unit: 's',
            constraints: { min: 0, max: 0.5, step: 0.01 },
            defaultValue: 0.05,
            cssVars: ['--sarak-chat-anim-speed']
        }
    ]
};
