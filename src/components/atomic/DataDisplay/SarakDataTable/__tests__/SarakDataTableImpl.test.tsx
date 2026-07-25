import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SarakDataTableImpl from '../SarakDataTableImpl';
import type { SarakColumn } from '../columnModel';
import { DeviceProvider } from '../../../../../core/Provider/DeviceProvider';

interface Row {
    name: string;
    role: string;
}

const rows: Row[] = Array.from({ length: 500 }, (_, i) => ({ name: `User ${i}`, role: 'admin' }));

const columns: Array<SarakColumn<Row>> = [
    { id: 'name', header: 'Nome', width: 160, pinned: 'left' },
    { id: 'role', header: 'Papel', width: 200 },
];

const headerCell = (id: string) =>
    document.querySelector(`[role="columnheader"][data-column-id="${id}"]`) as HTMLElement;

describe('Spec 12 (Onda 9) — SarakDataTable: colunas avançadas', () => {
    it('renderiza um cabeçalho por coluna na ordem declarada', () => {
        render(<SarakDataTableImpl columns={columns} rows={rows} height={300} />);
        expect(screen.getByText('Nome')).toBeInTheDocument();
        expect(screen.getByText('Papel')).toBeInTheDocument();
    });

    it('aplica position: sticky à coluna congelada (pinned) no cabeçalho', () => {
        render(<SarakDataTableImpl columns={columns} rows={rows} height={300} />);
        expect(headerCell('name').style.position).toBe('sticky');
        expect(headerCell('role').style.position).toBe('');
    });

    it('redimensiona a coluna via handle pointer-driven e emite onColumnResize', () => {
        const onColumnResize = vi.fn();
        render(<SarakDataTableImpl columns={columns} rows={rows} height={300} onColumnResize={onColumnResize} />);

        expect(headerCell('name').style.width).toBe('160px');

        const handle = document.querySelector('[data-resize-handle="name"]') as HTMLElement;
        fireEvent.pointerDown(handle, { clientX: 100 });
        act(() => {
            window.dispatchEvent(Object.assign(new Event('pointermove'), { clientX: 150 }));
        });
        act(() => {
            window.dispatchEvent(Object.assign(new Event('pointerup'), { clientX: 150 }));
        });

        expect(headerCell('name').style.width).toBe('210px');
        expect(onColumnResize).toHaveBeenCalledWith('name', 210);
    });

    it('reordena as colunas via drag-and-drop nativo e emite onColumnReorder', () => {
        const onColumnReorder = vi.fn();
        render(<SarakDataTableImpl columns={columns} rows={rows} height={300} onColumnReorder={onColumnReorder} />);

        fireEvent.dragStart(headerCell('role'));
        fireEvent.drop(headerCell('name'));

        expect(onColumnReorder).toHaveBeenCalledWith('role', 'name');
        // Após reordenar, a coluna 'role' passa a preceder 'name' no DOM.
        const headers = Array.from(document.querySelectorAll('[role="columnheader"]')).map(
            (el) => el.getAttribute('data-column-id'),
        );
        expect(headers).toEqual(['role', 'name']);
    });
});

describe('Spec 40.2 (L2) — SarakDataTable responsivo por padrão (denso é mobile-usável)', () => {
    it('no desktop (default) renderiza a TABELA colunar (não cards)', () => {
        const { container } = render(<SarakDataTableImpl columns={columns} rows={rows} height={300} />);
        expect(container.querySelector('[data-sarak-datatable="true"]')).not.toBeNull();
        expect(container.querySelector('[data-sarak-datacards="true"]')).toBeNull();
    });

    it('no smartphone colapsa para CARDS empilhados (sem tabela colunar)', () => {
        const { container } = render(
            <DeviceProvider overrideDevice="smartphone">
                <SarakDataTableImpl columns={columns} rows={rows} height={300} />
            </DeviceProvider>,
        );
        expect(container.querySelector('[data-sarak-datacards="true"]')).not.toBeNull();
        expect(container.querySelector('[data-sarak-datatable="true"]')).toBeNull();
    });

    it('o container de cards contém o scroll (overflow-x hidden + maxWidth 100%) — sem overflow da página', () => {
        const { container } = render(
            <DeviceProvider overrideDevice="smartphone">
                <SarakDataTableImpl columns={columns} rows={rows} height={300} />
            </DeviceProvider>,
        );
        const cards = container.querySelector('[data-sarak-datacards="true"]') as HTMLElement;
        expect(cards.style.overflowX).toBe('hidden');
        expect(cards.style.maxWidth).toBe('100%');
    });

    it('responsive={false} mantém a tabela colunar mesmo no smartphone (opt-out)', () => {
        const { container } = render(
            <DeviceProvider overrideDevice="smartphone">
                <SarakDataTableImpl columns={columns} rows={rows} height={300} responsive={false} />
            </DeviceProvider>,
        );
        expect(container.querySelector('[data-sarak-datatable="true"]')).not.toBeNull();
        expect(container.querySelector('[data-sarak-datacards="true"]')).toBeNull();
    });
});
