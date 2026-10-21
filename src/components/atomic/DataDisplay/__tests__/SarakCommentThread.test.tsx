import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SarakCommentThread } from '../SarakCommentThread';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

const NOW = new Date('2026-10-09T12:00:00Z');
const comments = [
    { id: 'c1', author: { name: 'Ana Souza' }, body: 'Primeira linha\nSegunda linha', createdAt: new Date(NOW.getTime() - 3 * 3_600_000) },
    { id: 'c2', author: { name: 'Bruno Lima' }, body: 'Fechado.', createdAt: 'data inválida' },
];

describe('SarakCommentThread', () => {
    beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(NOW); });
    afterEach(() => { vi.useRealTimers(); });

    it('mostra autor, texto e horário relativo no idioma da lib, dentro de uma seção nomeada', () => {
        render(<SarakCommentThread comments={comments} onSubmit={vi.fn()} />);
        expect(screen.getByRole('region', { name: 'Comentários' })).toBeInTheDocument();
        const first = document.querySelector('[data-comment-id="c1"]') as HTMLElement;
        expect(within(first).getByText('Ana Souza')).toBeInTheDocument();
        expect(first).toHaveTextContent('Primeira linha');
        const time = first.querySelector('time') as HTMLTimeElement;
        expect(time).toHaveTextContent('há 3 horas');
        expect(time).toHaveAttribute('datetime', '2026-10-09T09:00:00.000Z');
    });

    it('data inválida mostra o comentário sem horário', () => {
        render(<SarakCommentThread comments={comments} onSubmit={vi.fn()} />);
        const second = document.querySelector('[data-comment-id="c2"]') as HTMLElement;
        expect(second.querySelector('time')).toBeNull();
        expect(second).toHaveTextContent('Fechado.');
    });

    it('estado vazio traduzido, e o campo de envio continua disponível', () => {
        render(<SarakCommentThread comments={[]} onSubmit={vi.fn()} />);
        expect(screen.getByText('Nenhum comentário ainda')).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Escreva um comentário' })).toBeInTheDocument();
    });

    it('renderiza SEM Provider (R34) e envia pelo botão: texto sem espaços nas pontas, campo limpo; vazio desabilita o botão', () => {
        const onSubmit = vi.fn();
        render(<SarakCommentThread comments={[]} onSubmit={onSubmit} />);
        const button = screen.getByRole('button', { name: 'Comentar' });
        expect(button).toBeDisabled();

        const box = screen.getByRole('textbox', { name: 'Escreva um comentário' }) as HTMLTextAreaElement;
        fireEvent.change(box, { target: { value: '   ' } });
        expect(button).toBeDisabled();
        fireEvent.change(box, { target: { value: '  Ótimo trabalho  ' } });
        expect(button).toBeEnabled();
        fireEvent.click(button);
        expect(onSubmit).toHaveBeenCalledWith('Ótimo trabalho');
        expect(box.value).toBe('');
    });

    it('teclado: Ctrl+Enter e Cmd+Enter enviam; Enter sozinho só quebra a linha', () => {
        const onSubmit = vi.fn();
        render(<SarakCommentThread comments={[]} onSubmit={onSubmit} />);
        const box = screen.getByRole('textbox', { name: 'Escreva um comentário' });
        fireEvent.change(box, { target: { value: 'um' } });
        fireEvent.keyDown(box, { key: 'Enter' });
        expect(onSubmit).not.toHaveBeenCalled();
        fireEvent.keyDown(box, { key: 'Enter', ctrlKey: true });
        expect(onSubmit).toHaveBeenCalledWith('um');

        fireEvent.change(box, { target: { value: 'dois' } });
        fireEvent.keyDown(box, { key: 'Enter', metaKey: true });
        expect(onSubmit).toHaveBeenLastCalledWith('dois');
    });

    it('sem onDelete não há botão de excluir', () => {
        render(<SarakCommentThread comments={comments} onSubmit={vi.fn()} />);
        expect(screen.queryByRole('button', { name: /Excluir comentário/ })).toBeNull();
    });

    it('com onDelete, dispara com o id e o nome acessível cita o autor; o ícone vem da porta de ícones', () => {
        const onDelete = vi.fn();
        render(<SarakCommentThread comments={comments} onSubmit={vi.fn()} onDelete={onDelete} />);
        const button = screen.getByRole('button', { name: 'Excluir comentário de Bruno Lima' });
        expect(button.querySelector('svg')).not.toBeNull();
        fireEvent.click(button);
        expect(onDelete).toHaveBeenCalledWith('c2');
    });
});

describe('SarakCommentThread — idioma do Provider', () => {
    // O Provider persiste a preferência de idioma: sem limpar, o alemão vazaria para os outros testes.
    afterEach(() => { window.localStorage.clear(); });

    it('vale para o texto da lib e para o horário relativo', async () => {
        const threeHoursAgo = new Date(Date.now() - 3 * 3_600_000);
        render(
            <SarakUIProvider options={{ preferences: { onLoad: () => ({ language: 'de' }) } }}>
                <SarakCommentThread comments={[{ ...comments[0], createdAt: threeHoursAgo }]} onSubmit={vi.fn()} />
            </SarakUIProvider>,
        );
        expect(await screen.findByRole('region', { name: 'Kommentare' })).toBeInTheDocument();
        expect(document.querySelector('time')).toHaveTextContent('vor 3 Stunden');
    });
});
