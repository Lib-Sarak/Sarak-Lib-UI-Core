import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SarakSessionList } from '../SarakSessionList';

const sessions = [
    { id: 's1', device: 'Chrome no Windows', location: 'São Paulo', lastActiveAt: '2026-05-02T10:00:00Z', current: true },
    { id: 's2', device: 'Safari no iPhone', lastActiveAt: '2026-05-01T08:00:00Z' },
];

describe('SarakSessionList', () => {
    it('marca a sessão atual com selo e aria-current, e não oferece encerrá-la', () => {
        render(<SarakSessionList sessions={sessions} onRevoke={vi.fn()} />);
        const [current, other] = screen.getAllByRole('listitem');

        expect(current).toHaveAttribute('aria-current', 'true');
        expect(current).toHaveTextContent('Esta sessão');
        expect(current).toHaveTextContent('São Paulo');
        expect(current).not.toContainElement(screen.getByRole('button', { name: 'Encerrar sessão em Safari no iPhone' }));
        expect(other).toContainElement(screen.getByRole('button', { name: 'Encerrar sessão em Safari no iPhone' }));
        expect(screen.getAllByRole('button')).toHaveLength(1);
    });

    it('encerrar entrega o id ao host', async () => {
        const onRevoke = vi.fn();
        render(<SarakSessionList sessions={sessions} onRevoke={onRevoke} />);
        await userEvent.click(screen.getByRole('button', { name: 'Encerrar sessão em Safari no iPhone' }));

        expect(onRevoke).toHaveBeenCalledWith('s2');
    });

    it('"Encerrar as outras" só aparece quando há outra sessão', async () => {
        const onRevokeOthers = vi.fn();
        const { rerender } = render(<SarakSessionList sessions={sessions.slice(0, 1)} onRevokeOthers={onRevokeOthers} />);
        expect(screen.queryByRole('button', { name: 'Encerrar as outras sessões' })).not.toBeInTheDocument();

        rerender(<SarakSessionList sessions={sessions} onRevokeOthers={onRevokeOthers} />);
        await userEvent.click(screen.getByRole('button', { name: 'Encerrar as outras sessões' }));

        expect(onRevokeOthers).toHaveBeenCalledTimes(1);
    });

    it('sem sessões, mostra o estado vazio', () => {
        render(<SarakSessionList sessions={[]} />);

        expect(screen.getByText('Nenhuma sessão ativa.')).toBeInTheDocument();
    });
});
