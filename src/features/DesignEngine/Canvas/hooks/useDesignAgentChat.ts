import { useCallback, useRef, useState } from 'react';
import { useSarakUI } from '../../../../core/Provider/SarakUIProvider';
import { DesignAgentComponentPreset, SarakDesignState } from '../../../../core/Provider/types';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface UseDesignAgentChatParams {
    draftTokens: Partial<SarakDesignState>;
    onApplyFullTheme: (design: Partial<SarakDesignState>) => void;
    onAgentTheme?: (design: Partial<SarakDesignState>, label: string) => void;
    onAgentComponentPresets?: (presets: DesignAgentComponentPreset[], label: string) => void;
}

const WELCOME_MESSAGE = 'Olá! Sou o Sarak Design Agent. Descreva como você quer que a interface se pareça (referências, brand book, descrição) e eu preencho os valores do tema para você — nada é salvo até você confirmar.';

/**
 * Orquestra o chat do Design Agent: envia o prompt pelo canal injetado
 * (`SarakUIOptions.designAgent.sendPrompt` — Spec 08 §6.2, a Sarak nunca chama rede
 * direto) e aplica o resultado só como rascunho (Preset 1) + sugestão de sessão
 * (Preset 2, via `onAgentTheme`/`onAgentComponentPresets`). Nunca persiste nada.
 */
export const useDesignAgentChat = ({
    draftTokens,
    onApplyFullTheme,
    onAgentTheme,
    onAgentComponentPresets,
}: UseDesignAgentChatParams) => {
    const { options } = useSarakUI();
    const sendPrompt = options?.designAgent?.sendPrompt;

    const idRef = useRef(0);
    const nextId = useCallback(() => {
        idRef.current += 1;
        return `msg-${idRef.current}`;
    }, []);

    const [messages, setMessages] = useState<ChatMessage[]>(() => [
        { id: 'welcome', role: 'assistant', content: WELCOME_MESSAGE },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const sendMessage = useCallback(async (prompt: string) => {
        const trimmed = prompt.trim();
        if (!trimmed || isLoading) return;

        setMessages(prev => [...prev, { id: nextId(), role: 'user', content: trimmed }]);
        setInputValue('');

        if (!sendPrompt) {
            setMessages(prev => [...prev, {
                id: nextId(),
                role: 'system',
                content: 'Agente não configurado: o app precisa injetar SarakUIProvider options.designAgent.sendPrompt.',
            }]);
            return;
        }

        setIsLoading(true);
        try {
            const result = await sendPrompt({ prompt: trimmed, draftTokens });
            setMessages(prev => [...prev, { id: nextId(), role: 'assistant', content: result.message }]);

            if (result.themePatch) {
                onApplyFullTheme(result.themePatch);
                onAgentTheme?.(result.themePatch, trimmed.slice(0, 60));
            }

            if (result.componentPresets?.length) {
                onAgentComponentPresets?.(result.componentPresets, trimmed.slice(0, 60));
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Erro ao comunicar com o agente.';
            setMessages(prev => [...prev, { id: nextId(), role: 'system', content: `Erro: ${message}` }]);
        } finally {
            setIsLoading(false);
        }
    }, [sendPrompt, draftTokens, onApplyFullTheme, onAgentTheme, onAgentComponentPresets, isLoading, nextId]);

    return {
        messages,
        inputValue,
        setInputValue,
        isLoading,
        isConfigured: Boolean(sendPrompt),
        sendMessage,
    };
};
