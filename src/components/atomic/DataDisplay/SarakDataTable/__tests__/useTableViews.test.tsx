import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useTableViews } from '../useTableViews';
import type { SarakTableView, UseTableViewsOptions } from '../useTableViews';

const VIEW: SarakTableView = {
    id: 'late', label: 'Atrasados', filters: { searchQuery: 'atraso', status: 'late' },
    columnState: { hidden: ['b'] }, sort: { columnId: 'a', direction: 'desc' },
};

const options = (over: Partial<UseTableViewsOptions> = {}): UseTableViewsOptions => ({
    views: [VIEW], query: undefined, setQuery: vi.fn(), columnState: { order: ['a'] }, commitColumns: vi.fn(), resetColumns: vi.fn(), sort: null, applySort: vi.fn(), ...over,
});

describe('useTableViews', () => {
    it('sem views, não liga e não dispara nada na montagem', () => {
        const opts = options({ views: undefined });
        const { result } = renderHook(() => useTableViews(opts));
        expect(result.current.enabled).toBe(false);
        expect(opts.commitColumns).not.toHaveBeenCalled();
        expect(opts.applySort).not.toHaveBeenCalled();
    });

    it('selecionar aplica filtros, colunas e ordenação e devolve a visão', () => {
        const opts = options({ onViewChange: vi.fn(), onSearchQueryChange: vi.fn() });
        const { result } = renderHook(() => useTableViews(opts));
        act(() => result.current.select('late'));
        expect(opts.commitColumns).toHaveBeenCalledWith(VIEW.columnState);
        expect(opts.applySort).toHaveBeenCalledWith(VIEW.sort);
        expect(opts.setQuery).toHaveBeenCalledWith('atraso');
        expect(opts.onSearchQueryChange).toHaveBeenCalledWith('atraso');
        expect(opts.onViewChange).toHaveBeenCalledWith('late', VIEW);
    });

    it('voltar ao padrão restaura colunas, ordenação e busca', () => {
        const opts = options();
        const { result } = renderHook(() => useTableViews(opts));
        act(() => result.current.select('late'));
        act(() => result.current.select(null));
        expect(opts.resetColumns).toHaveBeenCalledTimes(1);
        expect(opts.applySort).toHaveBeenLastCalledWith(null);
        expect(opts.setQuery).toHaveBeenLastCalledWith('');
    });

    it('activeView controlado aplica quando o consumidor troca', () => {
        const opts = options();
        const { result, rerender } = renderHook(({ activeView }) => useTableViews({ ...opts, activeView }), { initialProps: { activeView: null as string | null } });
        expect(opts.commitColumns).not.toHaveBeenCalled();
        act(() => result.current.select('late'));
        expect(result.current.activeId).toBeNull();
        rerender({ activeView: 'late' });
        expect(opts.commitColumns).toHaveBeenCalledWith(VIEW.columnState);
    });

    it('activeView que chega antes de views espera a visão, sem resetar as colunas do consumidor', () => {
        const opts = options({ views: [] });
        const { rerender } = renderHook(({ views }) => useTableViews({ ...opts, views, activeView: 'late' }), { initialProps: { views: [] as SarakTableView[] } });
        expect(opts.resetColumns).not.toHaveBeenCalled();
        expect(opts.commitColumns).not.toHaveBeenCalled();
        expect(opts.applySort).not.toHaveBeenCalled();
        rerender({ views: [VIEW] });
        expect(opts.resetColumns).not.toHaveBeenCalled();
        expect(opts.commitColumns).toHaveBeenCalledWith(VIEW.columnState);
        expect(opts.applySort).toHaveBeenCalledWith(VIEW.sort);
        expect(opts.setQuery).toHaveBeenCalledWith('atraso');
    });

    it('views nova depois de aplicar não reaplica por cima do que o usuário mudou', () => {
        const opts = options();
        const { rerender } = renderHook(({ views }) => useTableViews({ ...opts, views, activeView: 'late' }), { initialProps: { views: [VIEW] } });
        rerender({ views: [{ ...VIEW }] });
        expect(opts.commitColumns).toHaveBeenCalledTimes(1);
    });

    it('salvar como devolve o estado da tela e não o reaplica', () => {
        const onViewSave = vi.fn();
        const opts = options({ onViewSave, query: 'ana', sort: { columnId: 'b', direction: 'asc' } });
        const { result } = renderHook(() => useTableViews(opts));
        act(() => result.current.saveAs('Minha'));
        expect(onViewSave).toHaveBeenCalledWith(expect.objectContaining({ label: 'Minha', filters: { searchQuery: 'ana' }, columnState: opts.columnState, sort: opts.sort }));
        expect(result.current.activeId).toBe(onViewSave.mock.calls[0][0].id);
        expect(opts.commitColumns).not.toHaveBeenCalled();
    });

    it('salvar com o nome de uma visão existente mantém o id dela', () => {
        const onViewSave = vi.fn();
        const opts = options({ onViewSave });
        const { result } = renderHook(() => useTableViews(opts));
        act(() => result.current.saveAs('Atrasados'));
        expect(onViewSave.mock.calls[0][0].id).toBe('late');
    });
});
