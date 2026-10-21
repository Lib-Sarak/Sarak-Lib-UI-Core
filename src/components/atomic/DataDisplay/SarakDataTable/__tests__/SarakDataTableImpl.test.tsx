import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SarakDataTableImpl from '../SarakDataTableImpl';
import type { SarakColumn } from '../columnModel';
import { SarakDeviceProvider } from '../../../../../core/Provider/DeviceProvider';

vi.mock('@tanstack/react-virtual', () => ({
    useVirtualizer: ({ count, estimateSize }: { count: number; estimateSize: (index: number) => number }) => {
        const sizes = Array.from({ length: count }, (_, index) => estimateSize(index));
        const starts = sizes.map((_, index) => sizes.slice(0, index).reduce((total, size) => total + size, 0));
        return {
            getTotalSize: () => sizes.reduce((total, size) => total + size, 0),
            getVirtualItems: () => Array.from({ length: count }, (_, index) => ({ index, key: index, start: starts[index], size: sizes[index] })),
            measureElement: vi.fn(),
        };
    },
}));

interface Row {
    name: string;
    role: string;
}

const SAMPLE_ROW_COUNT = 500;
const TABLE_HEIGHT = 300;
const INITIAL_POINTER_X = 100;
const RESIZED_POINTER_X = 150;
const INITIAL_NAME_COLUMN_WIDTH = 160;
const INITIAL_ROLE_COLUMN_WIDTH = 200;
const rows: Row[] = Array.from({ length: SAMPLE_ROW_COUNT }, (_, i) => ({ name: `User ${i}`, role: 'admin' }));

const columns: Array<SarakColumn<Row>> = [
    { id: 'name', header: 'Nome', width: INITIAL_NAME_COLUMN_WIDTH, pinned: 'left', sortable: true },
    { id: 'role', header: 'Papel', width: INITIAL_ROLE_COLUMN_WIDTH },
];

const interactionRows: Row[] = [
    { name: 'Beto', role: 'admin' },
    { name: 'Ana', role: 'analista' },
];

const headerCell = (id: string): HTMLElement =>
    document.querySelector(`[role="columnheader"][data-column-id="${id}"]`) as HTMLElement;

describe('Spec 12 (Onda 9) — SarakDataTable: colunas avançadas', () => {
    it('renderiza um cabeçalho por coluna na ordem declarada', () => {
        render(<SarakDataTableImpl columns={columns} rows={rows} height={TABLE_HEIGHT} />);
        expect(screen.getByText('Nome')).toBeInTheDocument();
        expect(screen.getByText('Papel')).toBeInTheDocument();
    });

    it('aplica position: sticky à coluna congelada (pinned) no cabeçalho', () => {
        render(<SarakDataTableImpl columns={columns} rows={rows} height={TABLE_HEIGHT} />);
        expect(headerCell('name').style.position).toBe('sticky');
        expect(headerCell('role').style.position).toBe('');
    });
});

describe('Spec 12 — SarakDataTable: redimensionamento e reordenação', () => {
    it('redimensiona a coluna via handle pointer-driven e emite onColumnResize', () => {
        const onColumnResize = vi.fn();
        render(<SarakDataTableImpl columns={columns} rows={rows} height={TABLE_HEIGHT} onColumnResize={onColumnResize} />);

        expect(headerCell('name').style.width).toBe(`${INITIAL_NAME_COLUMN_WIDTH}px`);

        const handle = document.querySelector('[data-resize-handle="name"]') as HTMLElement;
        fireEvent.pointerDown(handle, { clientX: INITIAL_POINTER_X });
        act(() => {
            window.dispatchEvent(Object.assign(new Event('pointermove'), { clientX: RESIZED_POINTER_X }));
        });
        act(() => {
            window.dispatchEvent(Object.assign(new Event('pointerup'), { clientX: RESIZED_POINTER_X }));
        });

        const resizedWidth = INITIAL_NAME_COLUMN_WIDTH + RESIZED_POINTER_X - INITIAL_POINTER_X;
        expect(headerCell('name').style.width).toBe(`${resizedWidth}px`);
        expect(onColumnResize).toHaveBeenCalledWith('name', resizedWidth);
    });

    it('reordena as colunas via drag-and-drop nativo e emite onColumnReorder', () => {
        const onColumnReorder = vi.fn();
        render(<SarakDataTableImpl columns={columns} rows={rows} height={TABLE_HEIGHT} onColumnReorder={onColumnReorder} />);

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

describe('Spec 12 — SarakDataTable: ordenação', () => {
    it('ordena localmente em crescente, decrescente e sem ordenação', () => {
        const { container } = render(<SarakDataTableImpl columns={columns} rows={interactionRows} />);
        const readNames = (): Array<string | null> => Array.from(container.querySelectorAll('[role="cell"][data-column-id="name"]'))
            .map((cell) => cell.textContent);
        const sortButton = screen.getByRole('button', { name: 'Ordenar por name' });

        fireEvent.click(sortButton);
        expect(readNames()).toEqual(['Ana', 'Beto']);
        fireEvent.click(sortButton);
        expect(readNames()).toEqual(['Beto', 'Ana']);
        fireEvent.click(sortButton);
        expect(readNames()).toEqual(['Beto', 'Ana']);
    });

    it('com sort controlado, delega a nova direção e mantém a ordem recebida', () => {
        const onSortChange = vi.fn();
        const { container } = render(
            <SarakDataTableImpl
                columns={columns}
                rows={interactionRows}
                sort={{ columnId: 'name', direction: 'asc' }}
                onSortChange={onSortChange}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: 'Ordenar por name' }));

        expect(onSortChange).toHaveBeenCalledWith({ columnId: 'name', direction: 'desc' });
        expect(Array.from(container.querySelectorAll('[role="cell"][data-column-id="name"]'))
            .map((cell) => cell.textContent)).toEqual(['Beto', 'Ana']);
    });
});

describe('Spec 12 — SarakDataTable: seleção', () => {
    it('seleciona uma linha, mostra seleção parcial e marca as linhas visíveis', () => {
        const onSelectionChange = vi.fn();
        render(<SarakDataTableImpl columns={columns} rows={interactionRows} selectable onSelectionChange={onSelectionChange} />);

        fireEvent.click(screen.getByRole('checkbox', { name: 'Selecionar linha 0' }));
        expect(onSelectionChange).toHaveBeenLastCalledWith([0]);
        expect((screen.getByRole('checkbox', { name: 'Selecionar todas as linhas visíveis' }) as HTMLInputElement).indeterminate).toBe(true);

        fireEvent.click(screen.getByRole('checkbox', { name: 'Selecionar todas as linhas visíveis' }));
        expect(onSelectionChange).toHaveBeenLastCalledWith([0, 1]);
        expect(screen.getByRole('checkbox', { name: 'Selecionar linha 1' })).toBeChecked();
    });
});

describe('Spec 97 — SarakDataTable: altura variável', () => {
    it('estima cada linha com a altura informada para o registro', () => {
        const { container } = render(
            <SarakDataTableImpl
                columns={columns}
                rows={interactionRows}
                rowHeight={(row) => row.role === 'admin' ? 30 : 60}
            />,
        );

        expect(Array.from(container.querySelectorAll('[role="row"][data-index]'))
            .map((row) => (row as HTMLElement).style.height)).toEqual(['30px', '60px']);
    });

    it('mede a altura do conteúdo quando rowHeight é auto', () => {
        const { container } = render(<SarakDataTableImpl columns={columns} rows={interactionRows} rowHeight="auto" />);

        expect(Array.from(container.querySelectorAll('[role="row"][data-index]'))
            .every((row) => (row as HTMLElement).style.height === '')).toBe(true);
    });
});

describe('Spec 97 — SarakDataTable: estados', () => {
    it('mostra carregando, vazio e erro com nova tentativa', () => {
        const onRetry = vi.fn();
        const loading = render(<SarakDataTableImpl columns={columns} rows={[]} loading />);
        expect(screen.getByRole('status')).toHaveTextContent('Carregando');
        loading.unmount();

        const empty = render(<SarakDataTableImpl columns={columns} rows={[]} />);
        expect(screen.getByRole('status')).toHaveTextContent('Nenhum dado encontrado.');
        empty.unmount();

        render(<SarakDataTableImpl columns={columns} rows={[]} error="Indisponível" onRetry={onRetry} />);
        fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
        expect(screen.getByRole('alert')).toHaveTextContent('Indisponível');
        expect(onRetry).toHaveBeenCalledOnce();
    });
});

describe('Spec 97 — SarakDataTable: ativação da linha', () => {
    it('encaminha o registro ao ativar uma linha', () => {
        const onRowClick = vi.fn();
        const { container } = render(<SarakDataTableImpl columns={columns} rows={interactionRows} onRowClick={onRowClick} />);

        fireEvent.click(container.querySelector('[role="row"][data-index="0"]') as HTMLElement);
        expect(onRowClick).toHaveBeenCalledWith(interactionRows[0]);
    });
});

describe('Spec 40.2 — SarakDataTable: apresentação responsiva', () => {
    it('no desktop (default) renderiza a TABELA colunar (não cards)', () => {
        const { container } = render(<SarakDataTableImpl columns={columns} rows={rows} height={TABLE_HEIGHT} />);
        expect(container.querySelector('[data-sarak-datatable="true"]')).not.toBeNull();
        expect(container.querySelector('[data-sarak-datacards="true"]')).toBeNull();
    });

    it('no smartphone colapsa para CARDS empilhados (sem tabela colunar)', () => {
        const { container } = render(
            <SarakDeviceProvider overrideDevice="smartphone">
                <SarakDataTableImpl columns={columns} rows={rows} height={TABLE_HEIGHT} />
            </SarakDeviceProvider>,
        );
        expect(container.querySelector('[data-sarak-datacards="true"]')).not.toBeNull();
        expect(container.querySelector('[data-sarak-datatable="true"]')).toBeNull();
    });
});

describe('Spec 40.2 — SarakDataTable: interações dos cartões', () => {
    it('no modo cartão, mantém os controles de ordenação e seleção', () => {
        const { container } = render(
            <SarakDeviceProvider overrideDevice="smartphone">
                <SarakDataTableImpl columns={columns} rows={interactionRows} selectable />
            </SarakDeviceProvider>,
        );

        fireEvent.click(screen.getByRole('checkbox', { name: 'Selecionar linha 0' }));
        fireEvent.click(screen.getByRole('button', { name: 'Ordenar por name' }));

        expect(container.querySelector('[data-sarak-datacards="true"]')).not.toBeNull();
        expect(screen.getByRole('checkbox', { name: 'Selecionar linha 0' })).toBeChecked();
        expect(screen.getByText('Ana')).toBeInTheDocument();
        expect(screen.getByText('Beto')).toBeInTheDocument();
    });

    it('encaminha a ativação de um cartão ao callback da linha', () => {
        const onRowClick = vi.fn();
        render(
            <SarakDeviceProvider overrideDevice="smartphone">
                <SarakDataTableImpl columns={columns} rows={interactionRows} onRowClick={onRowClick} />
            </SarakDeviceProvider>,
        );

        fireEvent.click(screen.getAllByRole('listitem')[0]);

        expect(onRowClick).toHaveBeenCalledWith(interactionRows[0]);
    });
});

describe('Spec 40.2 — SarakDataTable: contenção do scroll', () => {
    it('o container de cards contém o scroll (overflow-x hidden + maxWidth 100%) — sem overflow da página', () => {
        const { container } = render(
            <SarakDeviceProvider overrideDevice="smartphone">
                <SarakDataTableImpl columns={columns} rows={rows} height={TABLE_HEIGHT} />
            </SarakDeviceProvider>,
        );
        const cards = container.querySelector('[data-sarak-datacards="true"]') as HTMLElement;
        expect(cards.style.overflowX).toBe('hidden');
        expect(cards.style.maxWidth).toBe('100%');
    });

    it('responsive={false} mantém a tabela colunar mesmo no smartphone (opt-out)', () => {
        const { container } = render(
            <SarakDeviceProvider overrideDevice="smartphone">
                <SarakDataTableImpl columns={columns} rows={rows} height={TABLE_HEIGHT} responsive={false} />
            </SarakDeviceProvider>,
        );
        expect(container.querySelector('[data-sarak-datatable="true"]')).not.toBeNull();
        expect(container.querySelector('[data-sarak-datacards="true"]')).toBeNull();
    });
});
