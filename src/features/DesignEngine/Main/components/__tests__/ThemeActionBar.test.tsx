import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ThemeActionBar } from '../ThemeActionBar';

const createProps = (overrides: Partial<React.ComponentProps<typeof ThemeActionBar>> = {}) => ({
    isDirty: true,
    dirtyTokenCount: 1,
    onApply: vi.fn(),
    onDiscard: vi.fn(),
    onExport: vi.fn(),
    canUndoLastApply: false,
    onUndoLastApply: vi.fn(),
    ...overrides
});

describe('ThemeActionBar', () => {
    it.each([
        [0, 'Aplicar', true],
        [1, 'Aplicar (1)', false],
        [3, 'Aplicar (3)', false]
    ])('mostra a contagem de tokens alterados (%i)', (dirtyTokenCount, label, isDisabled) => {
        render(<ThemeActionBar {...createProps({ dirtyTokenCount })} />);

        expect(screen.getByRole('button', { name: label })).toHaveProperty('disabled', isDisabled);
    });

    it('descarta o rascunho pelo callback global', async () => {
        const user = userEvent.setup();
        const onDiscard = vi.fn();
        render(<ThemeActionBar {...createProps({ onDiscard })} />);

        await user.click(screen.getByRole('button', { name: 'Descartar' }));

        expect(onDiscard).toHaveBeenCalledTimes(1);
    });

    it('mantém Exportar fixo e desabilitado quando não há alterações', () => {
        render(<ThemeActionBar {...createProps({ isDirty: false, dirtyTokenCount: 0 })} />);

        expect(screen.getByRole('button', { name: 'Exportar' })).toBeDisabled();
        expect(screen.queryByText('Exportado')).toBeNull();
    });

    it('só mostra Desfazer última aplicação quando há um snapshot disponível', async () => {
        const user = userEvent.setup();
        const onUndoLastApply = vi.fn();
        const { rerender } = render(<ThemeActionBar {...createProps({ canUndoLastApply: false })} />);

        expect(screen.queryByRole('button', { name: 'Desfazer última aplicação' })).toBeNull();

        rerender(<ThemeActionBar {...createProps({ canUndoLastApply: true, onUndoLastApply })} />);
        await user.click(screen.getByRole('button', { name: 'Desfazer última aplicação' }));

        expect(onUndoLastApply).toHaveBeenCalledTimes(1);
    });
});
