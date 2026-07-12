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
            description: 'Raio de borda das bolhas de mensagem no chat, com valores independentes por breakpoint. 0 = bolhas quadradas/técnicas; valores altos = bolhas arredondadas/amigáveis, padrão de apps de mensagens.',
            axis: 'geometry',
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
            description: 'Cor de fundo das bolhas de mensagem enviadas pelo usuário — costuma ter contraste maior que as mensagens do assistente/IA para facilitar a distinção rápida de quem falou.',
            axis: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.05)',
            cssVars: ['--sarak-chat-user-bg']
        },
        {
            id: 'chatBubbleStyle',
            label: 'Estilo de Bolha',
            type: 'select',
            description: 'Linguagem visual das bolhas de mensagem: Glass (translúcida com desfoque, clima moderno), Solid (fundo opaco, alto contraste/leitura fácil) ou Minimal (quase sem decoração, foco no texto). Escolha antes de ajustar cores individuais das bolhas.',
            axis: 'texture',
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
            description: 'Intervalo, em segundos, entre caracteres no efeito de "digitando" (streaming) das respostas do chat. Valores baixos simulam digitação rápida/instantânea; valores altos dão um efeito mais dramático/pausado.',
            axis: 'motion',
            unit: 's',
            constraints: { min: 0, max: 0.5, step: 0.01 },
            defaultValue: 0.05,
            cssVars: ['--sarak-chat-anim-speed']
        },

        // --- CHAT INPUT (Spec 27) ---
        {
            id: 'chatAttachmentNameMaxWidth',
            label: 'Chat Input: Largura Máxima do Nome do Anexo',
            type: 'slider',
            description: 'Largura máxima, em pixels, para o nome de um arquivo anexado exibido no input de chat — acima desse limite o nome é truncado (ex. com reticências), evitando que nomes longos quebrem o layout do input.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 60, max: 300 },
            defaultValue: 150,
            cssVars: ['--sarak-chat-attachment-name-max-width']
        },
        {
            id: 'chatTokenSliderMinWidth',
            label: 'Chat Input: Largura Mínima do Slider de Tokens',
            type: 'slider',
            description: 'Largura mínima, em pixels, do controle deslizante (slider) de limite de tokens exibido no input de chat — garante que o slider continue utilizável mesmo em containers estreitos.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 60, max: 300 },
            defaultValue: 120,
            cssVars: ['--sarak-chat-token-slider-min-width']
        }
    ]
};
