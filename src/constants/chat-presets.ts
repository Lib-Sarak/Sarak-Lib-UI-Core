/**
 * Sarak Chat & Conversation Presets (v1.0)
 * 
 * Define a estética dos balões de chat e o fluxo da conversa.
 */

export interface ChatPreset {
    id: string;
    title: string;
    description: string;
    tokens: {
        chatBubbleStyle: 'glass' | 'solid' | 'outline';
        chatBubbleRadius: number;
        chatMessageSpacing: number;
        showAvatars: boolean;
        showTimestamp: boolean;
        chatAnimationEntrance: 'slide' | 'fade' | 'pop';
    };
}

export const CHAT_PRESETS: ChatPreset[] = [
    {
        id: 'glass-interaction',
        title: 'Glass Interaction',
        description: 'Balões translúcidos com blur profundo, ideais para interfaces etéreas.',
        tokens: {
            chatBubbleStyle: 'glass',
            chatBubbleRadius: 20,
            chatMessageSpacing: 12,
            showAvatars: true,
            showTimestamp: true,
            chatAnimationEntrance: 'slide'
        }
    },
    {
        id: 'terminal-minimal',
        title: 'Terminal Minimal',
        description: 'Estética de console técnica com balões sólidos e cantos vivos.',
        tokens: {
            chatBubbleStyle: 'solid',
            chatBubbleRadius: 4,
            chatMessageSpacing: 4,
            showAvatars: false,
            showTimestamp: true,
            chatAnimationEntrance: 'fade'
        }
    },
    {
        id: 'cyber-pop',
        title: 'Cyber Pop',
        description: 'Cores vibrantes e animações de pop para interfaces dinâmicas e jovens.',
        tokens: {
            chatBubbleStyle: 'outline',
            chatBubbleRadius: 16,
            chatMessageSpacing: 16,
            showAvatars: true,
            showTimestamp: false,
            chatAnimationEntrance: 'pop'
        }
    }
];
