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
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Arredonda as bolhas de mensagens no chat em cada breakpoint.",
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
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Pinta o fundo e a borda das mensagens enviadas pelo usuário.",
            label: 'Fundo (Usuário)',
            type: 'color',
            description: 'Cor de fundo das bolhas de mensagem enviadas pelo usuário — costuma ter contraste maior que as mensagens do assistente/IA para facilitar a distinção rápida de quem falou.',
            axis: 'color',
            defaultValue: 'rgba(25, 227, 240, 0.08)',
            cssVars: ['--sarak-chat-user-bg']
        },
        {
            id: 'chatBubbleStyle',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Escolhe o acabamento das mensagens do chat: vidro, fundo sólido ou apresentação minimalista.",
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
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Define a duração das transições do contêiner e das bolhas de SarakChatEngine; também controla o ritmo da prévia de digitação no painel.",
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
            kind: 'functional',
            modeDependent: false,
            usage: "Limita a largura do nome de arquivo anexado ao campo de chat para evitar que ele quebre o layout.",
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
            kind: 'functional',
            modeDependent: false,
            usage: "Preserva largura mínima para o controle de limite de tokens no campo de chat.",
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
