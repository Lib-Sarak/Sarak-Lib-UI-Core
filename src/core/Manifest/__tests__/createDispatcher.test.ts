import { describe, it, expect, vi, afterEach } from 'vitest';
import { runActions, type DispatchContext } from '../Dispatcher/createDispatcher';
import { createSarakDataStore } from '../DataStore/SarakDataStore';
import type { NetworkRequest } from '../DataSource/useDataSource';
import type { ActionList } from '../types';

const EMPTY_SCOPE = {} as Record<string, unknown>;

afterEach(() => vi.restoreAllMocks());

describe('Spec 25 — Dispatcher: catálogo e interpolação', () => {
    it('deve construir a URL interpolando o payload ANTES de chamar o HTTP (Regra 4)', async () => {
        const calls: NetworkRequest[] = [];
        const interceptor = vi.fn(async (req: NetworkRequest) => {
            calls.push(req);
            return { ok: true };
        });
        const ctx: DispatchContext = {
            interceptor,
            scope: EMPTY_SCOPE,
            global: { user: { id: 7, name: 'Ana' } },
        };
        const actions: ActionList = [
            {
                type: 'api_call',
                payload: {
                    endpoint: '/users/{{user.id}}',
                    method: 'POST',
                    params: { name: '{{user.name}}' },
                },
            },
        ];

        await runActions(actions, ctx);

        expect(calls).toHaveLength(1);
        expect(calls[0].endpoint).toBe('/users/7');
        expect(calls[0].method).toBe('POST');
        expect(calls[0].params).toEqual({ name: 'Ana' });
    });

    it('mutate_state deve escrever no DataStore', async () => {
        const store = createSarakDataStore({ counter: 0 });
        const ctx: DispatchContext = { store, scope: EMPTY_SCOPE, global: store.getSnapshot() };
        await runActions([{ type: 'mutate_state', payload: { path: 'counter', value: 5 } }], ctx);
        expect(store.get('counter')).toBe(5);
    });
});

describe('Spec 25 — Sequência e bloqueio (Regra 2 + Critérios 1 e 2)', () => {
    it('fluxo feliz: api_call → trigger_toast → navigate, em ordem', async () => {
        const order: string[] = [];
        const interceptor = vi.fn(async () => {
            order.push('api');
            return {};
        });
        const toast = { notify: vi.fn(() => { order.push('toast'); return 'id'; }), dismiss: vi.fn() };
        const navigate = vi.fn(() => order.push('nav'));
        const ctx: DispatchContext = { interceptor, toast, navigate, scope: EMPTY_SCOPE, global: {} };

        await runActions(
            [
                { type: 'api_call', payload: { endpoint: '/save' } },
                { type: 'trigger_toast', payload: { message: 'Salvo!', variant: 'success' } },
                { type: 'navigate', payload: { to: '/home' } },
            ],
            ctx,
        );

        expect(order).toEqual(['api', 'toast', 'nav']);
        expect(toast.notify).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'Salvo!', variant: 'success' }),
        );
        expect(navigate).toHaveBeenCalledWith('/home', expect.objectContaining({ to: '/home' }));
    });

    it('se api_call falhar, as ações seguintes são BLOQUEADAS e onError dispara', async () => {
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const interceptor = vi.fn(async () => {
            throw new Error('500');
        });
        const toast = { notify: vi.fn(() => 'id'), dismiss: vi.fn() };
        const navigate = vi.fn();
        const ctx: DispatchContext = { interceptor, toast, navigate, scope: EMPTY_SCOPE, global: {} };

        await runActions(
            [
                { type: 'api_call', payload: { endpoint: '/save' } },
                { type: 'trigger_toast', payload: { message: 'Sucesso' } }, // bloqueada
                { type: 'navigate', payload: { to: '/home' } }, // bloqueada
            ],
            ctx,
            [{ type: 'trigger_toast', payload: { message: 'Falhou', variant: 'error' } }],
        );

        // Toast de sucesso e navegação NÃO ocorreram.
        expect(navigate).not.toHaveBeenCalled();
        // Apenas o toast de erro do onError.
        expect(toast.notify).toHaveBeenCalledTimes(1);
        expect(toast.notify).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'Falhou', variant: 'error' }),
        );
    });

    it('open_modal usa o overlay controller injetado', async () => {
        const overlay = { open: vi.fn(), close: vi.fn() };
        const ctx: DispatchContext = { overlay, scope: EMPTY_SCOPE, global: {} };
        await runActions([{ type: 'open_modal', payload: { title: 'Oi', message: 'corpo' } }], ctx);
        expect(overlay.open).toHaveBeenCalledWith(
            expect.objectContaining({ kind: 'modal', title: 'Oi', message: 'corpo' }),
        );
    });

    it('ação desconhecida é ignorada (não quebra a cadeia)', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const navigate = vi.fn();
        const ctx: DispatchContext = { navigate, scope: EMPTY_SCOPE, global: {} };
        await runActions(
            [{ type: 'inexistente' }, { type: 'navigate', payload: { to: '/x' } }],
            ctx,
        );
        expect(warn).toHaveBeenCalled();
        expect(navigate).toHaveBeenCalledWith('/x', expect.anything());
    });
});
