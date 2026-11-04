import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SarakLiveStatus, type SarakLiveStatusState } from '../SarakLiveStatus';

describe('SarakLiveStatus', () => {
    it.each<[SarakLiveStatusState, string, string]>([
        ['connected', 'Conectado', '●'],
        ['reconnecting', 'Reconectando…', '▲'],
        ['offline', 'Sem conexão', '◆'],
    ])('%s: escreve o estado e usa uma forma própria, num aviso educado', (status, word, shape) => {
        render(<SarakLiveStatus status={status} label="API" />);
        const region = screen.getByRole('status');

        expect(region).toHaveAttribute('aria-live', 'polite');
        expect(region).toHaveTextContent(`API: ${word}`);
        expect(region).toHaveTextContent(shape);
    });

    it('mostra o último dado, ou diz que nenhum chegou', () => {
        const { rerender } = render(<SarakLiveStatus status="connected" lastDataAt="2026-05-02T10:00:00Z" />);
        expect(screen.getByRole('status')).toHaveTextContent(/Último dado: .+/);

        rerender(<SarakLiveStatus status="connected" lastDataAt={null} />);
        expect(screen.getByRole('status')).toHaveTextContent('Nenhum dado recebido');
    });

    it('só offline oferece tentar de novo, e chama o host', async () => {
        const onRetry = vi.fn();
        const { rerender } = render(<SarakLiveStatus status="connected" onRetry={onRetry} />);
        expect(screen.queryByRole('button')).not.toBeInTheDocument();

        rerender(<SarakLiveStatus status="offline" onRetry={onRetry} />);
        await userEvent.click(screen.getByRole('button', { name: 'Tentar agora' }));

        expect(onRetry).toHaveBeenCalledTimes(1);
    });
});
