import { ComponentSchema } from '../types';

/**
 * SCHEMA: CHAT & MENSAGENS
 * Especializado em interfaces de conversação e IA.
 */
export const ChatSchema: ComponentSchema = {
    id: 'chat',
    label: 'Chat & Mensagens',
    pilar: 'chat',
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
        }
    ]
};
