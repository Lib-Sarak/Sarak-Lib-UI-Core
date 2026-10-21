import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SarakUIProvider } from '../../../../../core/Provider/SarakUIProvider';
import { SarakDataTableView } from '../SarakDataTableView';
import { sarakComputeOffsets, type SarakColumn } from '../columnModel';
import type { SarakDataTableViewModel } from '../useSarakDataTableViewModel';

interface Row extends Record<string, unknown> {
    id: number;
    name: string;
}

const columns: Array<SarakColumn<Row>> = [{ id: 'name', header: 'Nome' }];
const ROW_HEIGHT = 44;
const people: Row[] = [{ id: 1, name: 'Ana' }, { id: 2, name: 'Beto' }];

const createModel = (): SarakDataTableViewModel<Row> => ({
    props: { columns, rows: people },
    collapseToCards: false,
    widths: {},
    ordered: columns,
    offsets: sarakComputeOffsets(columns, {}),
    containerWidth: 208,
    dragId: null,
    setDragId: vi.fn(),
    onDrop: vi.fn(),
    onResizeStart: vi.fn(),
    scrollRef: { current: null },
    interactions: {
        entries: people.map((row, index) => ({ row, index, key: row.id })),
        sort: null,
        selectedKeys: new Set(),
        allVisibleSelected: false,
        partiallySelected: false,
        changeSort: vi.fn(),
        toggleRow: vi.fn(),
        toggleAll: vi.fn(),
    },
    virtualRows: people.map((row, index) => ({
        entry: { row, index, key: row.id }, virtualIndex: index, virtualKey: index, start: index * ROW_HEIGHT, size: ROW_HEIGHT,
    })),
    virtualTotalSize: people.length * ROW_HEIGHT,
    virtualizerMeasureElement: vi.fn(),
    isAutomaticRowHeight: false,
} as unknown as SarakDataTableViewModel<Row>);

const rowOf = (name: string): HTMLElement => screen.getByText(name).closest('[role="row"]') as HTMLElement;

describe('tableZebraStriping na SarakDataTable', () => {
    it('ligado, só a linha de índice virtual ímpar tem fundo alternado', () => {
        render(<SarakUIProvider config={{ tableZebraStriping: true }}><SarakDataTableView model={createModel()} /></SarakUIProvider>);
        expect(rowOf('Ana').getAttribute('style')).not.toContain('color-mix');
        expect(rowOf('Beto').getAttribute('style')).toMatch(/color-mix\(in srgb, currentcolor 4%, transparent\)/i);
    });

    it('desligado (padrão), nenhuma linha tem fundo alternado', () => {
        render(<SarakUIProvider><SarakDataTableView model={createModel()} /></SarakUIProvider>);
        expect(rowOf('Beto').getAttribute('style')).not.toContain('color-mix');
    });
});
