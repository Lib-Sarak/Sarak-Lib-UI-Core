import { TABLE_PRESETS } from '../../../../../core/Design/presets/components/dataPresets';
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
    columns: { managed: false },
    views: { enabled: false },
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

describe('tableBorderRadius na SarakDataTable', () => {
    const frameOf = (container: HTMLElement): HTMLElement => container.querySelector('[data-sarak-datatable="true"]') as HTMLElement;

    it('com o token no design, a moldura da tabela recebe os cantos dele', () => {
        const { container } = render(<SarakUIProvider config={{ tableBorderRadius: 14 }}><SarakDataTableView model={createModel()} /></SarakUIProvider>);
        expect(frameOf(container).style.borderRadius).toBe('var(--sarak-table-border-radius, var(--sarak-card-radius, 10px))');
    });

    it('sem Provider (átomo solto, sem design), a moldura não ganha estilo de canto', () => {
        const { container } = render(<SarakDataTableView model={createModel()} />);
        expect(frameOf(container).style.borderRadius).toBe('');
    });
});

describe('tableCellPadding na SarakDataTable', () => {
    it.each(TABLE_PRESETS.map((preset) => [preset.name, preset.design.tableCellPadding as number]))('%s (tableCellPadding %s): a célula lê o respiro de --sarak-table-padding', (_name, padding) => {
        render(<SarakUIProvider config={{ tableCellPadding: padding }}><SarakDataTableView model={createModel()} /></SarakUIProvider>);
        const cell = screen.getByText('Ana');
        expect(cell.closest('[role="cell"]')?.getAttribute('style')).toContain('var(--sarak-table-padding, 12px)');
    });
});
