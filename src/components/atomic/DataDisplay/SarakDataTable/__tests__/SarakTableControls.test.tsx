import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SarakExpandToggle, SarakSelectAllBanner } from '../SarakTableControls';

describe('SarakExpandToggle', () => {
    it('expõe o estado em aria-expanded e o nome acessível, e avisa o clique sem propagá-lo', () => {
        const onToggle = vi.fn();
        const onParent = vi.fn();
        render(<div onClick={onParent}><SarakExpandToggle expanded={false} label="Expandir linha" onToggle={onToggle} /></div>);
        const button = screen.getByRole('button', { name: 'Expandir linha' });
        expect(button).toHaveAttribute('aria-expanded', 'false');
        fireEvent.click(button);
        expect(onToggle).toHaveBeenCalledTimes(1);
        expect(onParent).not.toHaveBeenCalled();
    });

    it('aberto marca aria-expanded true', () => {
        render(<SarakExpandToggle expanded label="Recolher linha" onToggle={vi.fn()} />);
        expect(screen.getByRole('button', { name: 'Recolher linha' })).toHaveAttribute('aria-expanded', 'true');
    });
});

describe('SarakSelectAllBanner', () => {
    const base = { canSelectAllTotal: false, selectAll: false, totalCount: 120, selectAllTotal: vi.fn(), clearSelection: vi.fn() };

    it('não aparece sem oferta nem modo ligado, nem sem totalCount', () => {
        const { container, rerender } = render(<SarakSelectAllBanner {...base} />);
        expect(container).toBeEmptyDOMElement();
        rerender(<SarakSelectAllBanner {...base} canSelectAllTotal totalCount={undefined} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('oferece "Selecionar todos os N" e dispara selectAllTotal', () => {
        const selectAllTotal = vi.fn();
        render(<SarakSelectAllBanner {...base} canSelectAllTotal selectAllTotal={selectAllTotal} />);
        fireEvent.click(screen.getByRole('button', { name: 'Selecionar todos os 120' }));
        expect(selectAllTotal).toHaveBeenCalledTimes(1);
    });

    it('com o modo ligado informa e oferece limpar', () => {
        const clearSelection = vi.fn();
        render(<SarakSelectAllBanner {...base} selectAll clearSelection={clearSelection} />);
        expect(screen.getByRole('status')).toHaveTextContent('Todos os 120 itens estão selecionados.');
        fireEvent.click(screen.getByRole('button', { name: 'Limpar seleção' }));
        expect(clearSelection).toHaveBeenCalledTimes(1);
    });
});
