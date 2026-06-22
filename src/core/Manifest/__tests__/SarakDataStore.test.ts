import { describe, it, expect, vi } from 'vitest';
import { createSarakDataStore } from '../DataStore/SarakDataStore';
import {
    getByPath,
    resolveScopedPath,
    setByPath,
} from '../DataStore/resolvePath';

const tick = () => new Promise<void>((resolve) => queueMicrotask(resolve));

describe('Spec 21 — resolvePath (Regra 2: leitura segura)', () => {
    it('deve ler caminho profundo existente', () => {
        const state = { user: { address: { street: 'Rua A' } } };
        expect(getByPath(state, 'user.address.street')).toBe('Rua A');
    });

    it('deve devolver undefined sem lançar quando elo intermediário é indefinido', () => {
        const state = { user: {} };
        expect(() => getByPath(state, 'user.address.street')).not.toThrow();
        expect(getByPath(state, 'user.address.street')).toBeUndefined();
    });

    it('deve suportar índice de array no caminho', () => {
        const state = { list: [{ name: 'X' }, { name: 'Y' }] };
        expect(getByPath(state, 'list.1.name')).toBe('Y');
    });
});

describe('Spec 21 — resolveScopedPath (Regra 5: escopo local sobre global)', () => {
    it('deve resolver item.x do escopo local sem consultar o global', () => {
        const local = { item: { x: 42 }, index: 0 };
        const global = { item: { x: 999 } };
        expect(resolveScopedPath('item.x', local, global)).toBe(42);
    });

    it('deve cair para o global quando o primeiro segmento não está no escopo local', () => {
        const local = { item: { x: 42 } };
        const global = { user: { name: 'Ana' } };
        expect(resolveScopedPath('user.name', local, global)).toBe('Ana');
    });
});

describe('Spec 21 — setByPath (Regra 3: imutabilidade)', () => {
    it('deve produzir nova raiz preservando ramos não tocados por referência', () => {
        const state = { a: { x: 1 }, b: { y: 2 } };
        const next = setByPath(state, 'a.x', 10);
        expect(next).not.toBe(state);
        expect(next.a).not.toBe(state.a);
        expect(next.b).toBe(state.b); // ramo intacto mantém identidade
        expect((next.a as { x: number }).x).toBe(10);
        expect(state.a.x).toBe(1); // original imutável
    });

    it('deve PRESERVAR array ao escrever em índice (list.0.name), não colapsar em objeto', () => {
        const state = { list: [{ name: 'X' }, { name: 'Y' }] };
        const next = setByPath(state, 'list.0.name', 'Z') as { list: { name: string }[] };

        expect(Array.isArray(next.list)).toBe(true);
        expect(next.list).toHaveLength(2);
        expect(next.list[0].name).toBe('Z');
        expect(next.list[1]).toBe(state.list[1]); // item não tocado mantém identidade
        expect(state.list[0].name).toBe('X'); // original imutável
    });

    it('deve criar array (não objeto) quando o caminho ausente tem próximo segmento numérico', () => {
        const next = setByPath({}, 'items.0', 'a') as { items: string[] };
        expect(Array.isArray(next.items)).toBe(true);
        expect(next.items[0]).toBe('a');
    });
});

describe('Spec 21 — SarakDataStore', () => {
    it('deve coalescer múltiplas escritas síncronas num único flush (anti-loop)', async () => {
        const store = createSarakDataStore<{ count: number }>({ count: 0 });
        const listener = vi.fn();
        store.subscribe((s) => s.count, listener);

        for (let i = 1; i <= 10; i++) {
            store.mutate_state('count', i);
        }

        expect(listener).not.toHaveBeenCalled(); // ainda não houve flush
        await tick();
        expect(listener).toHaveBeenCalledTimes(1); // 10 escritas → 1 notificação
        expect(store.get('count')).toBe(10);
    });

    it('deve notificar apenas assinantes da fatia alterada', async () => {
        const store = createSarakDataStore({ a: 1, b: 1 });
        const listenerA = vi.fn();
        const listenerB = vi.fn();
        store.subscribe((s) => s.a, listenerA);
        store.subscribe((s) => s.b, listenerB);

        store.set('a', 2);
        await tick();

        expect(listenerA).toHaveBeenCalledTimes(1);
        expect(listenerB).not.toHaveBeenCalled();
    });

    it('deve refletir leitura segura via get após escrita', async () => {
        const store = createSarakDataStore<{ user: { name?: string } }>({ user: {} });
        store.set('user.name', 'Bia');
        await tick();
        expect(store.get('user.name')).toBe('Bia');
        expect(store.get('user.missing.deep')).toBeUndefined();
    });

    it('deve preservar array no store ao mutar índice (mutate_state em rows.0.done)', async () => {
        const store = createSarakDataStore<{ rows: { done: boolean }[] }>({
            rows: [{ done: false }, { done: false }],
        });
        store.mutate_state('rows.0.done', true);
        await tick();

        expect(Array.isArray(store.getSnapshot().rows)).toBe(true);
        expect(store.get('rows.0.done')).toBe(true);
        expect(store.get('rows.1.done')).toBe(false);
    });

    it('deve parar de notificar após unsubscribe', async () => {
        const store = createSarakDataStore({ v: 0 });
        const listener = vi.fn();
        const unsubscribe = store.subscribe((s) => s.v, listener);

        store.set('v', 1);
        await tick();
        expect(listener).toHaveBeenCalledTimes(1);

        unsubscribe();
        store.set('v', 2);
        await tick();
        expect(listener).toHaveBeenCalledTimes(1); // não disparou após unsubscribe
    });

    it('deve expor getScoped resolvendo escopo local sobre o estado global', () => {
        const store = createSarakDataStore({ item: { x: 1 } });
        expect(store.getScoped('item.x', { item: { x: 7 } })).toBe(7);
        expect(store.getScoped('item.x', {})).toBe(1);
    });
});
