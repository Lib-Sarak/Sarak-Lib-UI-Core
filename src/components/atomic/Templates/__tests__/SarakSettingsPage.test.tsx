import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SarakSettingsPage, type SarakSettingsSection } from '../SarakSettingsPage';

const sections: SarakSettingsSection[] = [
    { id: 'geral', title: 'Geral', description: 'Nome e idioma', content: <p>Conteúdo geral</p> },
    { id: 'avisos', title: 'Avisos', content: <p>Conteúdo de avisos</p>, dirty: true },
];

const renderPage = (props: Partial<React.ComponentProps<typeof SarakSettingsPage>> = {}) => {
    const handlers = { onSave: vi.fn(), onDiscard: vi.fn() };
    render(<SarakSettingsPage title="Configurações" sections={sections} isDirty={false} {...handlers} {...props} />);
    return handlers;
};

describe('SarakSettingsPage', () => {
    it('lista as seções num índice e marca a alterada com texto', () => {
        renderPage();
        const index = screen.getByRole('navigation', { name: 'Seções' });

        expect(index).toHaveTextContent('Geral');
        expect(index).toHaveTextContent('Avisos (com alterações)');
        expect(screen.getByRole('heading', { level: 2, name: /Avisos/ })).toHaveTextContent('com alterações');
    });

    it('o índice navega: marca a seção atual e leva o foco até ela', async () => {
        renderPage();
        const link = screen.getByRole('link', { name: 'Avisos (com alterações)' });
        await userEvent.click(link);

        expect(link).toHaveAttribute('aria-current', 'location');
        expect(document.getElementById('avisos')).toHaveFocus();
    });

    it('sem rascunho, a barra diz "Tudo salvo" e trava salvar e descartar', () => {
        renderPage();
        const bar = screen.getByRole('region', { name: 'Ações das configurações' });

        expect(bar).toHaveTextContent('Tudo salvo');
        expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Descartar' })).toBeDisabled();
    });

    it('com rascunho, avisa em texto e entrega salvar e descartar ao host', async () => {
        const { onSave, onDiscard } = renderPage({ isDirty: true });

        expect(screen.getByRole('status')).toHaveTextContent('Alterações não salvas');
        await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
        await userEvent.click(screen.getByRole('button', { name: 'Descartar' }));

        expect(onSave).toHaveBeenCalledTimes(1);
        expect(onDiscard).toHaveBeenCalledTimes(1);
    });

    it('salvando, descartar trava e o erro do último salvamento aparece', () => {
        renderPage({ isDirty: true, saving: true, saveError: 'Servidor fora do ar' });

        expect(screen.getByRole('button', { name: 'Descartar' })).toBeDisabled();
        expect(screen.getByText('Salvando…')).toBeInTheDocument();
        expect(screen.getByRole('alert')).toHaveTextContent('Servidor fora do ar');
    });

    it('dentro de um <form> do host, nenhum botão da página envia o formulário', async () => {
        const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
        const { onSave, onDiscard } = { onSave: vi.fn(), onDiscard: vi.fn() };
        render(
            <form onSubmit={onSubmit}>
                <SarakSettingsPage title="Configurações" sections={sections} isDirty onSave={onSave} onDiscard={onDiscard} saveError="falhou" />
            </form>,
        );
        await userEvent.click(screen.getByRole('button', { name: 'Descartar' }));
        await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

        expect(onSubmit).not.toHaveBeenCalled();
        expect(onDiscard).toHaveBeenCalledTimes(1);
        expect(onSave).toHaveBeenCalledTimes(1);
        screen.getAllByRole('button').forEach((button) => expect(button).toHaveAttribute('type', 'button'));
    });

    it('com rascunho, fechar a aba é barrado pelo aviso de alterações', () => {
        renderPage({ isDirty: true });
        const event = new Event('beforeunload', { cancelable: true });
        fireEvent(window, event);

        expect(event.defaultPrevented).toBe(true);
    });

    it('entrega o confirmLeave ao host, que liga ao bloqueio de rota', async () => {
        const onUnsavedChangesControl = vi.fn();
        renderPage({ onUnsavedChangesControl });

        expect(onUnsavedChangesControl).toHaveBeenCalledTimes(1);
        await expect(onUnsavedChangesControl.mock.calls[0][0].confirmLeave()).resolves.toBe(true);
    });
});
