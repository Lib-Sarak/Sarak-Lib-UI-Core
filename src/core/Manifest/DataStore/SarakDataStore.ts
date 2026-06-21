/**
 * DataStore e Estado Reativo (Spec 21)
 *
 * Container de estado externo único (padrão `useSyncExternalStore`), determinístico
 * e barato, sobre o qual interpolação (24) lê, dispatcher (25) escreve, condicional
 * (26) decide e persistência (28) hidrata. Contrato Zero Any (Regra 6).
 *
 * Propriedades centrais:
 *  - Leitura segura por caminho (Regra 2) — delega a `getByPath`/`resolveScopedPath`.
 *  - Escrita imutável e em LOTE (Regra 3) — múltiplas escritas síncronas coalescem
 *    num único flush de notificação (anti-loop infinito de re-render).
 *  - Seletores → re-render mínimo (Regra 4) — só notifica assinantes cuja fatia mudou.
 */

import {
    getByPath,
    resolveScopedPath,
    setByPath,
    type StateRecord,
} from './resolvePath';

/** Seletor de uma fatia do estado. */
export type Selector<TState, TSlice = unknown> = (state: TState) => TSlice;

/**
 * Contrato público do store (Regra 6 — Zero Any na fronteira).
 * `TState` é o formato do estado fornecido pelo importador.
 */
export interface SarakDataStore<TState extends StateRecord = StateRecord> {
    /** Leitura segura por caminho (`"a.b.c"`), imune a `undefined` intermediário. */
    get(path: string): unknown;
    /** Escrita imutável e em lote. */
    set(path: string, value: unknown): void;
    /** Alias semântico de `set` usado pelo dispatcher (ação `mutate_state`). */
    mutate_state(path: string, value: unknown): void;
    /** Assina uma FATIA do estado; o listener só dispara quando essa fatia muda. */
    subscribe(selector: Selector<TState>, listener: () => void): () => void;
    /** Resolve um caminho com escopo local (renderFor) sobreposto ao global. */
    getScoped(path: string, scope: StateRecord): unknown;
    /** Snapshot imutável do estado atual (para `useSyncExternalStore`). */
    getSnapshot(): TState;
}

interface Subscription<TState> {
    selector: Selector<TState>;
    listener: () => void;
    lastSlice: unknown;
}

/**
 * Cria um store reativo a partir do estado inicial do importador.
 * O agendamento de flush usa microtask para coalescer escritas síncronas.
 */
export const createSarakDataStore = <TState extends StateRecord = StateRecord>(
    initialState: TState,
): SarakDataStore<TState> => {
    let state: TState = initialState;
    const subscriptions = new Set<Subscription<TState>>();

    let flushScheduled = false;

    const flush = (): void => {
        flushScheduled = false;
        // Snapshot dos assinantes: alterações durante o flush entram no próximo ciclo.
        const current = state;
        for (const sub of [...subscriptions]) {
            const nextSlice = sub.selector(current);
            if (!Object.is(nextSlice, sub.lastSlice)) {
                sub.lastSlice = nextSlice;
                sub.listener();
            }
        }
    };

    const scheduleFlush = (): void => {
        if (flushScheduled) return;
        flushScheduled = true;
        queueMicrotask(flush);
    };

    const write = (path: string, value: unknown): void => {
        const nextState = setByPath(state, path, value) as TState;
        if (Object.is(nextState, state)) return;
        state = nextState;
        scheduleFlush();
    };

    return {
        get: (path: string): unknown => getByPath(state, path),

        set: write,
        mutate_state: write,

        getScoped: (path: string, scope: StateRecord): unknown =>
            resolveScopedPath(path, scope, state),

        getSnapshot: (): TState => state,

        subscribe: (selector: Selector<TState>, listener: () => void): (() => void) => {
            const sub: Subscription<TState> = {
                selector,
                listener,
                lastSlice: selector(state),
            };
            subscriptions.add(sub);
            return () => {
                subscriptions.delete(sub);
            };
        },
    };
};
