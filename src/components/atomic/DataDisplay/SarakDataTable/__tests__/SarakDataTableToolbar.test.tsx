import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SarakDeviceProvider } from '../../../../../core/Provider/DeviceProvider';
import { SarakUIProvider } from '../../../../../core/Provider/SarakUIProvider';
import type { SarakColumn } from '../columnModel';
import SarakDataTableImpl from '../SarakDataTableImpl';
import type { SarakDataTableProps } from '../SarakDataTableImpl';
import type { SarakColumnState } from '../tableColumnState';
import type { SarakTableView } from '../useTableViews';

vi.mock('@tanstack/react-virtual', () => ({
    useVirtualizer: ({ count }: { count: number }) => ({
        getTotalSize: () => count * 44,
        getVirtualItems: () => Array.from({ length: count }, (_, index) => ({ index, key: index, start: index * 44, size: 44 })),
        measureElement: vi.fn(),
    }),
}));

interface Row {
    id: number;
    name: string;
    city: string;
}

const ROWS: Row[] = [{ id: 1, name: 'Ana', city: 'Rio' }, { id: 2, name: 'Beto', city: 'Lima' }, { id: 3, name: 'Caio', city: 'Rio' }];
const COLUMNS: Array<SarakColumn<Row>> = [{ id: 'name', header: 'Nome', sortable: true }, { id: 'city', header: 'Cidade', sortable: true }];
const VIEW: SarakTableView = {
    id: 'rio', label: 'Só Rio', filters: { searchQuery: 'rio' },
    columnState: { hidden: ['name'] }, sort: { columnId: 'city', direction: 'desc' },
};

const table = (props: Partial<SarakDataTableProps<Row>> = {}) => <SarakUIProvider><SarakDataTableImpl columns={COLUMNS} rows={ROWS} height={300} {...props} /></SarakUIProvider>;
const headers = (): Array<string | null> => screen.getAllByRole('columnheader').map((cell) => cell.getAttribute('data-column-id'));
const dataRows = (): number => screen.getAllByRole('row').length - 1;

describe('barra de visões e colunas da SarakDataTable', () => {
    it('sem as props, não há barra', () => {
        render(table());
        expect(screen.queryByRole('group', { name: 'Visões da tabela' })).toBeNull();
    });

    it('o botão Colunas abre o painel e esconder devolve o valor', async () => {
        const onColumnStateChange = vi.fn();
        render(table({ onColumnStateChange }));
        fireEvent.click(screen.getByRole('button', { name: 'Colunas' }));
        fireEvent.click(await screen.findByRole('checkbox', { name: 'Exibir coluna Cidade' }));
        expect(headers()).toEqual(['name']);
        expect(onColumnStateChange).toHaveBeenLastCalledWith(expect.objectContaining({ hidden: ['city'] }));
    });

    it('columnState controlado manda na tela', () => {
        const Controlled = () => {
            const [state, setState] = useState<SarakColumnState>({ order: ['city', 'name'] });
            return <><button onClick={() => setState({ order: ['name', 'city'] })}>trocar</button>{table({ columnState: state, onColumnStateChange: setState })}</>;
        };
        render(<Controlled />);
        expect(headers()).toEqual(['city', 'name']);
        fireEvent.click(screen.getByRole('button', { name: 'trocar' }));
        expect(headers()).toEqual(['name', 'city']);
    });

    it('a alça responde à seta e devolve a largura, só com colunas configuráveis', () => {
        const onColumnStateChange = vi.fn();
        const { unmount } = render(table());
        expect(document.querySelector('[data-resize-handle="name"]')).not.toHaveAttribute('tabindex');
        unmount();
        render(table({ onColumnStateChange }));
        const handle = document.querySelector('[data-resize-handle="name"]') as HTMLElement;
        expect(handle).toHaveAttribute('tabindex', '0');
        expect(handle).toHaveAttribute('aria-valuenow', '160');
        fireEvent.keyDown(handle, { key: 'ArrowRight' });
        expect(onColumnStateChange).toHaveBeenCalledWith(expect.objectContaining({ widths: { name: 176 } }));
    });

    it('a visão aplica filtros, colunas e ordenação, e devolve o valor', () => {
        const onViewChange = vi.fn();
        const onSortChange = vi.fn();
        const onColumnStateChange = vi.fn();
        render(table({ views: [VIEW], onViewChange, onSortChange, onColumnStateChange }));
        fireEvent.change(screen.getByRole('combobox', { name: 'Visão' }), { target: { value: 'rio' } });
        expect(onViewChange).toHaveBeenCalledWith('rio', VIEW);
        expect(headers()).toEqual(['city']);
        expect(dataRows()).toBe(2);
        expect(onSortChange).toHaveBeenCalledWith(VIEW.sort);
        expect(onColumnStateChange).toHaveBeenCalledWith(VIEW.columnState);
    });

    it('a visão que zera as linhas mantém a barra para voltar ao padrão', () => {
        render(table({ views: [{ ...VIEW, filters: { searchQuery: 'nada' } }] }));
        fireEvent.change(screen.getByRole('combobox', { name: 'Visão' }), { target: { value: 'rio' } });
        fireEvent.click(screen.getByRole('button', { name: 'Voltar ao padrão' }));
        expect(headers()).toEqual(['name', 'city']);
        expect(dataRows()).toBe(ROWS.length);
    });

    it('salvar como pede o nome e devolve a visão da tela', () => {
        const onViewSave = vi.fn();
        render(table({ views: [], onViewSave, defaultColumnState: { hidden: ['city'] } }));
        fireEvent.click(screen.getByRole('button', { name: 'Salvar como' }));
        const name = screen.getByRole('textbox', { name: 'Nome da visão' });
        fireEvent.click(screen.getByRole('button', { name: 'Salvar visão' }));
        expect(onViewSave).not.toHaveBeenCalled();
        fireEvent.change(name, { target: { value: 'Minha' } });
        fireEvent.keyDown(name, { key: 'Enter' });
        expect(onViewSave).toHaveBeenCalledWith(expect.objectContaining({ label: 'Minha', columnState: expect.objectContaining({ hidden: ['city'] }) }));
        expect(screen.queryByRole('textbox', { name: 'Nome da visão' })).toBeNull();
    });

    it('Esc e Cancelar fecham o nome da visão sem salvar', () => {
        const onViewSave = vi.fn();
        render(table({ views: [], onViewSave }));
        fireEvent.click(screen.getByRole('button', { name: 'Salvar como' }));
        fireEvent.keyDown(screen.getByRole('textbox', { name: 'Nome da visão' }), { key: 'Escape' });
        fireEvent.click(screen.getByRole('button', { name: 'Salvar como' }));
        fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
        expect(onViewSave).not.toHaveBeenCalled();
    });
});

describe('modos da SarakDataTable', () => {
    it('relatório: todas as linhas no fluxo, sem alça e sem fundo de cabeçalho', () => {
        render(table({ density: 'report', height: 100 }));
        const root = document.querySelector('[data-sarak-datatable]') as HTMLElement;
        expect(root).toHaveAttribute('data-density', 'report');
        expect(root.style.height).toBe('');
        expect(root.style.overflow).toBe('');
        expect(document.querySelector('[data-resize-handle]')).toBeNull();
        const row = screen.getAllByRole('row')[1];
        expect(row.style.position).toBe('');
        expect(dataRows()).toBe(ROWS.length);
    });

    it('imprimindo: sai a seleção e entram as linhas no fluxo', () => {
        render(table({ selectable: true }));
        expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(0);
        act(() => { window.dispatchEvent(new Event('beforeprint')); });
        expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
        expect(screen.getAllByRole('row')[1].style.position).toBe('');
        act(() => { window.dispatchEvent(new Event('afterprint')); });
        expect(screen.getAllByRole('row')[1].style.position).toBe('absolute');
    });

    it('nos cartões valem a barra de lote, as colunas escondidas, o tom e a edição', () => {
        render(
            <SarakUIProvider>
                <SarakDeviceProvider overrideDevice="smartphone">
                    <SarakDataTableImpl
                        columns={[{ ...COLUMNS[0], editable: true }, COLUMNS[1]]} rows={ROWS} height={300} selectable
                        bulkActions={[{ label: 'Arquivar', onAction: vi.fn() }]} defaultColumnState={{ hidden: ['city'] }}
                        getCellTone={() => 'info'} onCellEdit={vi.fn()}
                    />
                </SarakDeviceProvider>
            </SarakUIProvider>,
        );
        expect(document.querySelector('[data-sarak-datacards]')).not.toBeNull();
        expect(document.querySelector('[data-column-id="city"]')).toBeNull();
        expect(document.querySelector('[data-cell-tone="info"]')).not.toBeNull();
        expect(screen.getByRole('button', { name: 'Editar Nome: Ana' })).toBeInTheDocument();
        fireEvent.click(screen.getByRole('checkbox', { name: 'Selecionar linha 1' }));
        expect(within(screen.getByRole('toolbar')).getByRole('status')).toHaveTextContent('1 selecionados');
    });

    it('a barra de lote vale na tabela', () => {
        render(table({ selectable: true, bulkActions: [{ label: 'Arquivar', onAction: vi.fn() }] }));
        expect(screen.queryByRole('toolbar')).toBeNull();
        fireEvent.click(screen.getAllByRole('checkbox')[1]);
        expect(within(screen.getByRole('toolbar')).getByRole('status')).toHaveTextContent('1 selecionados');
    });
});
