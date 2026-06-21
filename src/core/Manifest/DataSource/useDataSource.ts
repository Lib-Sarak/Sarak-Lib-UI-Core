/**
 * Fonte de Dados Declarativa (Spec 31 — Regras 1–5)
 *
 * Fecha o ciclo "JSON vira app viva": um nó com `source` carrega seus próprios
 * dados ao montar, deposita-os no DataStore na chave `into` (de onde o `renderFor`
 * itera) e dirige a máquina de estados `loading → success | empty | error`.
 *
 *  - Regra 4 (anti-loop): a busca dispara UMA vez por montagem, chaveada por
 *    endpoint+params interpolados; só refaz por `trigger: manual` (reload) ou
 *    mudança das params.
 *  - Regra 5 (sem rede embutida): a biblioteca NUNCA chama `fetch`; toda E/S passa
 *    pelo `networkInterceptor` injetado pelo importador (mantém auth/JWT fora daqui).
 *
 * Zero Any: a fronteira do payload é `unknown`; nenhuma `any`.
 */

import { useEffect, useState, useCallback } from 'react';
import type {
    DataNodeState,
    DataSourceDirective,
    DataSourceMethod,
    ManifestProps,
} from '../types';
import type { SarakDataStore } from '../DataStore/SarakDataStore';
import type { StateRecord } from '../DataStore/resolvePath';
import { interpolate, interpolateProps } from '../Binding/interpolate';

/** Requisição declarativa entregue ao interceptor do importador. */
export interface NetworkRequest {
    endpoint: string;
    method?: DataSourceMethod;
    params?: ManifestProps;
}

/**
 * Interceptor de rede injetado pelo importador (Spec 30/31, Regra 5). Recebe a
 * requisição declarativa e devolve os dados. A biblioteca não conhece auth nem fetch.
 */
export type NetworkInterceptor = (request: NetworkRequest) => Promise<unknown>;

/** Controlador retornado pelo hook: estado do ciclo + erro + recarga manual. */
export interface DataSourceController {
    state: DataNodeState;
    error: unknown;
    /** Dispara uma nova busca (modo `manual` ou re-fetch sob demanda). */
    reload: () => void;
}

const isEmptyResult = (data: unknown): boolean => {
    if (data === undefined || data === null) return true;
    if (Array.isArray(data)) return data.length === 0;
    return false;
};

/**
 * Gerencia o ciclo de vida de um nó com `source`. Deposita o resultado em
 * `directive.into` no `store` e devolve o estado para o Renderer escolher entre
 * Skeleton / Empty / Fallback / conteúdo.
 */
export const useDataSource = (
    directive: DataSourceDirective,
    store: SarakDataStore<StateRecord> | undefined,
    interceptor: NetworkInterceptor | undefined,
    scope: StateRecord,
    globalState: unknown,
): DataSourceController => {
    // Estado e erro andam juntos (uma única transição) — mantém o hook enxuto.
    const [status, setStatus] = useState<{ state: DataNodeState; error: unknown }>({
        state: 'loading',
        error: undefined,
    });
    const [reloadTick, setReloadTick] = useState(0);

    const reload = useCallback(() => {
        setReloadTick((tick) => tick + 1);
    }, []);

    // Chave de busca: endpoint + params interpolados. Estável entre re-renders quando
    // nada muda → o efeito não redispara (Regra 4).
    const endpoint = interpolate(directive.endpoint, scope, globalState);
    const params = interpolateProps(directive.params ?? {}, scope, globalState);
    const requestKey = `${endpoint}::${JSON.stringify(params)}`;

    const into = directive.into;
    const method = directive.method;
    const isManual = directive.trigger === 'manual';

    useEffect(() => {
        // Modo manual: não busca na montagem; aguarda `reload()`.
        if (isManual && reloadTick === 0) {
            return;
        }

        if (!interceptor) {
            setStatus({
                state: 'error',
                error: new Error('[Sarak:source] networkInterceptor ausente (Regra 5).'),
            });
            return;
        }

        let cancelled = false;
        setStatus({ state: 'loading', error: undefined });

        interceptor({ endpoint, method, params })
            .then((data) => {
                if (cancelled) return;
                store?.set(into, data);
                setStatus({ state: isEmptyResult(data) ? 'empty' : 'success', error: undefined });
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                setStatus({ state: 'error', error: err });
            });

        return () => {
            cancelled = true;
        };
        // `requestKey` resume endpoint+params; `reloadTick` força re-fetch manual.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [requestKey, reloadTick, interceptor, into]);

    return { state: status.state, error: status.error, reload };
};
