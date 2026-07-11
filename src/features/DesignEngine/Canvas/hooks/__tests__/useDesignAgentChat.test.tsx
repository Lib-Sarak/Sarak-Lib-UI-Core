import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useDesignAgentChat } from '../useDesignAgentChat';
import { SarakUIProvider } from '../../../../../core/Provider/SarakUIProvider';
import { SarakUIOptions } from '../../../../../core/Provider/types';

const wrapperWithOptions = (options?: SarakUIOptions) => {
    const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <SarakUIProvider options={options}>{children}</SarakUIProvider>
    );
    return Wrapper;
};

describe('useDesignAgentChat', () => {
    it('começa com a mensagem de boas-vindas e isConfigured=false sem designAgent', () => {
        const { result } = renderHook(
            () => useDesignAgentChat({ draftTokens: {}, onApplyFullTheme: vi.fn() }),
            { wrapper: wrapperWithOptions() }
        );

        expect(result.current.messages).toHaveLength(1);
        expect(result.current.messages[0].role).toBe('assistant');
        expect(result.current.isConfigured).toBe(false);
    });

    it('sem sendPrompt injetado, sendMessage adiciona mensagem de usuário + aviso de sistema, sem aplicar nada', async () => {
        const onApplyFullTheme = vi.fn();
        const { result } = renderHook(
            () => useDesignAgentChat({ draftTokens: {}, onApplyFullTheme }),
            { wrapper: wrapperWithOptions() }
        );

        await act(async () => {
            await result.current.sendMessage('Crie um tema escuro');
        });

        expect(result.current.messages.some(m => m.role === 'user' && m.content === 'Crie um tema escuro')).toBe(true);
        expect(result.current.messages.some(m => m.role === 'system' && /não configurado/i.test(m.content))).toBe(true);
        expect(onApplyFullTheme).not.toHaveBeenCalled();
    });

    it('com sendPrompt injetado, aplica themePatch e reporta a mensagem do agente', async () => {
        const onApplyFullTheme = vi.fn();
        const onAgentTheme = vi.fn();
        const onAgentComponentPresets = vi.fn();
        const sendPrompt = vi.fn().mockResolvedValue({
            message: 'Pronto!',
            themePatch: { primaryColor: '#000000' },
            componentPresets: [{ category: 'buttons', design: { btnRadius: 4 } }],
        });

        const { result } = renderHook(
            () => useDesignAgentChat({ draftTokens: { mode: 'dark' }, onApplyFullTheme, onAgentTheme, onAgentComponentPresets }),
            { wrapper: wrapperWithOptions({ designAgent: { sendPrompt } }) }
        );

        await act(async () => {
            await result.current.sendMessage('Tema minimalista');
        });

        await waitFor(() => {
            expect(result.current.messages.some(m => m.content === 'Pronto!')).toBe(true);
        });

        expect(sendPrompt).toHaveBeenCalledWith({ prompt: 'Tema minimalista', draftTokens: { mode: 'dark' } });
        expect(onApplyFullTheme).toHaveBeenCalledWith({ primaryColor: '#000000' });
        expect(onAgentTheme).toHaveBeenCalledWith({ primaryColor: '#000000' }, 'Tema minimalista');
        expect(onAgentComponentPresets).toHaveBeenCalledWith(
            [{ category: 'buttons', design: { btnRadius: 4 } }],
            'Tema minimalista'
        );
        expect(result.current.isLoading).toBe(false);
    });

    it('quando sendPrompt rejeita, reporta erro como mensagem de sistema', async () => {
        const sendPrompt = vi.fn().mockRejectedValue(new Error('Falha no provider LLM'));

        const { result } = renderHook(
            () => useDesignAgentChat({ draftTokens: {}, onApplyFullTheme: vi.fn() }),
            { wrapper: wrapperWithOptions({ designAgent: { sendPrompt } }) }
        );

        await act(async () => {
            await result.current.sendMessage('Tema qualquer');
        });

        await waitFor(() => {
            expect(result.current.messages.some(m => m.role === 'system' && m.content.includes('Falha no provider LLM'))).toBe(true);
        });
    });
});
