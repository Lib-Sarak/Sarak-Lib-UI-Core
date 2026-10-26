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
    canSaveToRuntime: false,
    canDeleteTheme: false,
    onSave: vi.fn(),
    onExport: vi.fn(),
    onCreateTheme: vi.fn(),
    onDeleteTheme: vi.fn(),
    canUndoLastApply: false,
    onUndoLastApply: vi.fn(),
    ...overrides
});

describe('ThemeActionBar', () => {
    it.each([
        [0, null, true],
        [1, '1 alteração', false],
        [3, '3 alterações', false]
    ])('mostra o contador de alterações como texto auxiliar (%i)', (dirtyTokenCount, pendingCount, isDisabled) => {
        render(<ThemeActionBar {...createProps({ dirtyTokenCount })} />);

        const applyButton = screen.getByRole('button', { name: 'Aplicar' });
        expect(applyButton).toHaveProperty('disabled', isDisabled);
        expect(applyButton).toHaveClass('disabled:opacity-80');

        if (pendingCount) {
            expect(screen.getByRole('status')).toHaveTextContent(pendingCount);
            expect(applyButton).toHaveAttribute('aria-describedby', 'theme-pending-changes-count');
        } else {
            expect(screen.queryByRole('status')).toBeNull();
            expect(applyButton).not.toHaveAttribute('aria-describedby');
        }
    });

    it('permite que os rótulos quebrem dentro da largura da barra', () => {
        render(<ThemeActionBar {...createProps({ canSaveToRuntime: true })} />);

        expect(screen.getByRole('button', { name: 'Exportar JSON' })).toHaveClass('min-w-0', 'whitespace-normal', 'break-words');
        expect(screen.getByRole('button', { name: 'Salvar tema' })).toHaveClass('min-w-0', 'whitespace-normal', 'break-words');
    });

    it('descarta o rascunho pelo callback global', async () => {
        const user = userEvent.setup();
        const onDiscard = vi.fn();
        render(<ThemeActionBar {...createProps({ onDiscard })} />);

        await user.click(screen.getByRole('button', { name: 'Descartar' }));

        expect(onDiscard).toHaveBeenCalledTimes(1);
    });

    it('permite exportar e chama o callback quando não há alterações pendentes', async () => {
        const user = userEvent.setup();
        const onExport = vi.fn();
        render(<ThemeActionBar {...createProps({ isDirty: false, dirtyTokenCount: 0, onExport })} />);

        const exportButton = screen.getByRole('button', { name: 'Exportar JSON' });
        expect(exportButton).toBeEnabled();

        await user.click(exportButton);

        expect(onExport).toHaveBeenCalledTimes(1);
        expect(screen.queryByText('Exportado')).toBeNull();
    });

    it('separa salvar runtime, exportar JSON, criar e apagar tema', async () => {
        const user = userEvent.setup();
        const onSave = vi.fn();
        const onExport = vi.fn();
        const onCreateTheme = vi.fn();
        const onDeleteTheme = vi.fn();
        render(<ThemeActionBar {...createProps({
            canSaveToRuntime: true,
            canDeleteTheme: true,
            onSave,
            onExport,
            onCreateTheme,
            onDeleteTheme,
        })} />);

        await user.click(screen.getByRole('button', { name: 'Salvar tema' }));
        await user.click(screen.getByRole('button', { name: 'Exportar JSON' }));
        await user.click(screen.getByRole('button', { name: 'Novo tema' }));
        await user.click(screen.getByRole('button', { name: 'Apagar tema' }));

        expect(onSave).toHaveBeenCalledTimes(1);
        expect(onExport).toHaveBeenCalledTimes(1);
        expect(onCreateTheme).toHaveBeenCalledTimes(1);
        expect(onDeleteTheme).toHaveBeenCalledTimes(1);
    });

    it('esconde a gestão runtime sem a porta onSave', () => {
        render(<ThemeActionBar {...createProps()} />);

        expect(screen.queryByRole('button', { name: 'Salvar tema' })).toBeNull();
        expect(screen.queryByRole('button', { name: 'Novo tema' })).toBeNull();
        expect(screen.queryByRole('button', { name: 'Apagar tema' })).toBeNull();
        expect(screen.getByRole('button', { name: 'Exportar JSON' })).toBeInTheDocument();
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
