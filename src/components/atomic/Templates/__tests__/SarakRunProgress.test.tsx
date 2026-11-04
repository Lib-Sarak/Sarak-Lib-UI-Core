import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SarakRunProgress, type SarakRunPhase } from '../SarakRunProgress';

const phases: SarakRunPhase[] = [
    { id: 'baixar', label: 'Baixar arquivos', status: 'done' },
    { id: 'traduzir', label: 'Traduzir', status: 'running', progress: 50, detail: '12 de 24 páginas' },
    { id: 'montar', label: 'Montar relatório', status: 'pending' },
];

describe('SarakRunProgress', () => {
    it('escreve o estado de cada fase e marca a atual como passo corrente', () => {
        render(<SarakRunProgress phases={phases} />);
        const list = screen.getByRole('list', { name: 'Fases da execução' });
        const [done, running, pending] = within(list).getAllByRole('listitem');

        expect(done).toHaveTextContent('Concluída');
        expect(running).toHaveTextContent('Em andamento');
        expect(running).toHaveAttribute('aria-current', 'step');
        expect(running).toHaveTextContent('12 de 24 páginas');
        expect(pending).toHaveTextContent('Pendente');
        expect(pending).not.toHaveAttribute('aria-current');
    });

    it('o avanço geral é a média das fases quando o host não informa', () => {
        render(<SarakRunProgress phases={phases} />);

        expect(screen.getByRole('progressbar', { name: 'Progresso geral' })).toHaveAttribute('aria-valuenow', '50');
    });

    it('o avanço informado pelo host vence a média', () => {
        render(<SarakRunProgress phases={phases} progress={80} />);

        expect(screen.getByRole('progressbar', { name: 'Progresso geral' })).toHaveAttribute('aria-valuenow', '80');
    });

    it('mostra a duração formatada', () => {
        render(<SarakRunProgress phases={phases} title="Tradução" elapsedMs={125_000} />);

        expect(screen.getByText('Duração: 2 min 05 s')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Tradução' })).toBeInTheDocument();
    });

    it('cancelar chama o host e trava enquanto cancela', async () => {
        const onCancel = vi.fn();
        const { rerender } = render(<SarakRunProgress phases={phases} onCancel={onCancel} />);
        await userEvent.click(screen.getByRole('button', { name: 'Cancelar execução' }));

        expect(onCancel).toHaveBeenCalledTimes(1);
        rerender(<SarakRunProgress phases={phases} onCancel={onCancel} cancelling />);
        expect(screen.getByRole('button', { name: /Cancelando/ })).toBeDisabled();
    });

    it('execução terminada não oferece cancelar', () => {
        render(<SarakRunProgress phases={[{ id: 'a', label: 'Tudo', status: 'done' }]} onCancel={vi.fn()} />);

        expect(screen.queryByRole('button', { name: /Cancelar/ })).not.toBeInTheDocument();
    });

    it('fase com falha leva palavra, e o último erro aparece em alerta', () => {
        render(<SarakRunProgress phases={[{ id: 'a', label: 'Enviar', status: 'failed' }]} lastError="Tempo esgotado" />);

        expect(screen.getByText(/Falhou/)).toBeInTheDocument();
        expect(screen.getByRole('alert')).toHaveTextContent('Último erro');
        expect(screen.getByRole('alert')).toHaveTextContent('Tempo esgotado');
    });
});
