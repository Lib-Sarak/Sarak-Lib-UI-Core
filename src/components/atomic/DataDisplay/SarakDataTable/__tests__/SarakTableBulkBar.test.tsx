import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SarakUIProvider } from '../../../../../core/Provider/SarakUIProvider';
import { SarakTableBulkBar } from '../SarakTableBulkBar';
import type { SarakTableBulkBarProps } from '../SarakTableBulkBar';

const interactions = (over: Partial<SarakTableBulkBarProps['interactions']> = {}): SarakTableBulkBarProps['interactions'] => ({
    selectedKeys: new Set([1, 2]), selectedCount: 2, exceptKeys: [], selectAll: false, clearSelection: vi.fn(), ...over,
});

describe('SarakTableBulkBar', () => {
    it('não aparece sem seleção nem sem ações', () => {
        const { container, rerender } = render(<SarakTableBulkBar actions={[{ label: 'Arquivar', onAction: vi.fn() }]} interactions={interactions({ selectedCount: 0 })} />);
        expect(container).toBeEmptyDOMElement();
        rerender(<SarakTableBulkBar actions={[]} interactions={interactions()} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('mostra a contagem, age com os ids e limpa', async () => {
        const onAction = vi.fn();
        const state = interactions();
        render(<SarakTableBulkBar actions={[{ label: 'Arquivar', onAction }]} interactions={state} />);
        expect(screen.getByRole('status')).toHaveTextContent('2 selecionados');
        fireEvent.click(screen.getByRole('button', { name: 'Arquivar' }));
        await waitFor(() => expect(onAction).toHaveBeenCalledWith([1, 2], { all: false, exceptKeys: [] }));
        fireEvent.click(screen.getByRole('button', { name: 'Limpar seleção' }));
        expect(state.clearSelection).toHaveBeenCalled();
    });

    it('no modo "todos os N", avisa o alcance à ação', async () => {
        const onAction = vi.fn();
        render(<SarakTableBulkBar actions={[{ label: 'Arquivar', onAction }]} interactions={interactions({ selectAll: true, selectedCount: 99, exceptKeys: [3] })} />);
        expect(screen.getByRole('status')).toHaveTextContent('99 selecionados');
        fireEvent.click(screen.getByRole('button', { name: 'Arquivar' }));
        await waitFor(() => expect(onAction).toHaveBeenCalledWith([1, 2], { all: true, exceptKeys: [3] }));
    });

    it('ação de perigo só roda depois de confirmar', async () => {
        const onAction = vi.fn();
        render(<SarakUIProvider><SarakTableBulkBar actions={[{ label: 'Excluir', tone: 'danger', onAction }]} interactions={interactions()} /></SarakUIProvider>);
        fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));
        const dialog = await screen.findByRole('dialog');
        expect(dialog).toHaveTextContent('Esta ação vale para 2 itens.');
        expect(onAction).not.toHaveBeenCalled();
        fireEvent.click(screen.getAllByRole('button', { name: 'Excluir' }).at(-1) as HTMLElement);
        await waitFor(() => expect(onAction).toHaveBeenCalledTimes(1));
    });

    it('ação de perigo cancelada não roda', async () => {
        const onAction = vi.fn();
        render(<SarakUIProvider><SarakTableBulkBar actions={[{ label: 'Excluir', tone: 'danger', onAction }]} interactions={interactions()} /></SarakUIProvider>);
        fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));
        await screen.findByRole('dialog');
        fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
        expect(onAction).not.toHaveBeenCalled();
    });
});
