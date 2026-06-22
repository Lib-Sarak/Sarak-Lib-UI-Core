import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useDataSource, type NetworkInterceptor } from '../useDataSource';
import { createSarakDataStore } from '../../DataStore/SarakDataStore';

const directive = { endpoint: '/clients', into: 'clients' };

describe('Spec 31 — useDataSource (unidade do hook)', () => {
    it('busca no onMount, deposita em `into` e transita para success', async () => {
        const store = createSarakDataStore<{ clients: unknown[] }>({ clients: [] });
        const interceptor: NetworkInterceptor = vi.fn(async () => [{ id: 1 }]);

        const { result } = renderHook(() =>
            useDataSource(directive, store, interceptor, {}, store.getSnapshot()),
        );

        expect(result.current.state).toBe('loading');
        await waitFor(() => expect(result.current.state).toBe('success'));
        expect(interceptor).toHaveBeenCalledTimes(1);
        expect(store.get('clients')).toEqual([{ id: 1 }]);
    });

    it('transita para empty quando o resultado é lista vazia', async () => {
        const store = createSarakDataStore({ clients: [] });
        const interceptor: NetworkInterceptor = vi.fn(async () => []);

        const { result } = renderHook(() => useDataSource(directive, store, interceptor, {}, {}));
        await waitFor(() => expect(result.current.state).toBe('empty'));
    });

    it('transita para error quando a rede falha, sem lançar', async () => {
        const store = createSarakDataStore({ clients: [] });
        const interceptor: NetworkInterceptor = vi.fn(async () => {
            throw new Error('500');
        });

        const { result } = renderHook(() => useDataSource(directive, store, interceptor, {}, {}));
        await waitFor(() => expect(result.current.state).toBe('error'));
        expect(result.current.error).toBeInstanceOf(Error);
    });

    it('sem networkInterceptor não busca e vai a error (Regra 5)', async () => {
        const store = createSarakDataStore({ clients: [] });
        const { result } = renderHook(() => useDataSource(directive, store, undefined, {}, {}));
        await waitFor(() => expect(result.current.state).toBe('error'));
    });

    it('trigger manual não busca na montagem; reload() dispara (Regra 4)', async () => {
        const store = createSarakDataStore({ clients: [] });
        const interceptor: NetworkInterceptor = vi.fn(async () => [{ id: 1 }]);

        const { result } = renderHook(() =>
            useDataSource({ ...directive, trigger: 'manual' }, store, interceptor, {}, {}),
        );

        expect(interceptor).not.toHaveBeenCalled(); // não busca na montagem
        act(() => result.current.reload());
        await waitFor(() => expect(interceptor).toHaveBeenCalledTimes(1));
    });
});
