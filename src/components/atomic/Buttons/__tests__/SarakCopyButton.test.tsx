import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SarakCopyButton } from '../SarakCopyButton';

const RESET_MS = 2000;

const stubClipboard = (writeText: (text: string) => Promise<void>): void => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
};

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
    vi.useRealTimers();
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
});

describe('SarakCopyButton', () => {
    it('copia o texto, confirma no rótulo e volta ao normal depois do prazo', async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        stubClipboard(writeText);
        const onCopy = vi.fn();
        render(<SarakCopyButton value="segredo" onCopy={onCopy} />);

        await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Copiar' })); });

        expect(writeText).toHaveBeenCalledWith('segredo');
        expect(onCopy).toHaveBeenCalledWith(true);
        expect(screen.getByRole('button', { name: 'Copiado' })).toHaveAttribute('aria-live', 'polite');

        act(() => { vi.advanceTimersByTime(RESET_MS); });
        expect(screen.getByRole('button', { name: 'Copiar' })).toBeInTheDocument();
    });

    it('lê o valor no momento do clique quando ele é uma função', async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        stubClipboard(writeText);
        let current = 'antes';
        render(<SarakCopyButton value={() => current} />);
        current = 'depois';

        await act(async () => { fireEvent.click(screen.getByRole('button')); });

        expect(writeText).toHaveBeenCalledWith('depois');
    });

    it('avisa quando a área de transferência recusa', async () => {
        stubClipboard(vi.fn().mockRejectedValue(new Error('negado')));
        const onCopy = vi.fn();
        render(<SarakCopyButton value="x" onCopy={onCopy} />);

        await act(async () => { fireEvent.click(screen.getByRole('button')); });

        expect(onCopy).toHaveBeenCalledWith(false);
        expect(screen.getByRole('button', { name: 'Não foi possível copiar' })).toBeInTheDocument();
    });

    it('sem a API de área de transferência, copia pela seleção de texto', async () => {
        const execCommand = vi.fn().mockReturnValue(true);
        Object.defineProperty(document, 'execCommand', { value: execCommand, configurable: true });
        const onCopy = vi.fn();
        render(<SarakCopyButton value="http" onCopy={onCopy} label="Copiar link" copiedLabel="Link copiado" />);

        await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Copiar link' })); });

        expect(execCommand).toHaveBeenCalledWith('copy');
        expect(onCopy).toHaveBeenCalledWith(true);
        expect(screen.getByRole('button', { name: 'Link copiado' })).toBeInTheDocument();
    });
});
