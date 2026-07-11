import React from 'react';
import '@testing-library/jest-dom';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DesignAgentChatCard } from '../DesignAgentChatCard';
import { SarakUIProvider } from '../../../../../core/Provider/SarakUIProvider';
import { SarakUIOptions } from '../../../../../core/Provider/types';

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        button: ({ children, ...props }: any) => <button {...props}>{children}</button>
    },
    AnimatePresence: ({ children }: any) => <>{children}</>
}));

const customRender = (ui: React.ReactElement, options?: SarakUIOptions) => {
    return render(<SarakUIProvider options={options}>{ui}</SarakUIProvider>);
};

describe('DesignAgentChatCard', () => {
    let fetchSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        fetchSpy = vi.spyOn(global, 'fetch' as any);
    });

    afterEach(() => {
        fetchSpy.mockRestore();
    });

    it('renderiza a mensagem de boas-vindas', () => {
        customRender(<DesignAgentChatCard draftTokens={{}} onApplyFullTheme={vi.fn()} />);
        expect(screen.getByText(/Sou o Sarak Design Agent/)).toBeInTheDocument();
    });

    it('sem designAgent configurado, nunca chama fetch e avisa o usuário', async () => {
        customRender(<DesignAgentChatCard draftTokens={{}} onApplyFullTheme={vi.fn()} />);

        expect(screen.getByText('Não configurado')).toBeInTheDocument();

        const input = screen.getByPlaceholderText(/Crie um tema sombrio/);
        fireEvent.change(input, { target: { value: 'Tema escuro com bordas quadradas' } });
        fireEvent.keyDown(input, { key: 'Enter' });

        await waitFor(() => {
            expect(screen.getByText(/Agente não configurado/)).toBeInTheDocument();
        });
        expect(fetchSpy).not.toHaveBeenCalledWith(expect.stringContaining('design-agent'), expect.anything());
    });

    it('envia o prompt pelo designAgent.sendPrompt injetado e aplica o themePatch no draft', async () => {
        const onApplyFullTheme = vi.fn();
        const onAgentTheme = vi.fn();
        const sendPrompt = vi.fn().mockResolvedValue({
            message: 'Tema atualizado!',
            themePatch: { primaryColor: '#123456' },
        });

        customRender(
            <DesignAgentChatCard
                draftTokens={{}}
                onApplyFullTheme={onApplyFullTheme}
                onAgentTheme={onAgentTheme}
            />,
            { designAgent: { sendPrompt } }
        );

        const input = screen.getByPlaceholderText(/Crie um tema sombrio/);
        fireEvent.change(input, { target: { value: 'Tema escuro com bordas quadradas' } });
        fireEvent.keyDown(input, { key: 'Enter' });

        await waitFor(() => {
            expect(screen.getByText('Tema atualizado!')).toBeInTheDocument();
        });

        expect(sendPrompt).toHaveBeenCalledWith({ prompt: 'Tema escuro com bordas quadradas', draftTokens: {} });
        expect(onApplyFullTheme).toHaveBeenCalledWith({ primaryColor: '#123456' });
        expect(onAgentTheme).toHaveBeenCalledWith({ primaryColor: '#123456' }, 'Tema escuro com bordas quadradas');
        expect(fetchSpy).not.toHaveBeenCalledWith(expect.stringContaining('design-agent'), expect.anything());
    });
});
