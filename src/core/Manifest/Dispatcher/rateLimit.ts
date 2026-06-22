/**
 * Modificadores de Taxa do Dispatcher (Spec 25 — Regra 3)
 *
 * `debounce` (aguarda a parada) e `throttle` (limita a frequência) declarativos.
 * Ambos preservam os argumentos e devolvem uma função estável que mantém seu próprio
 * estado de temporização entre chamadas. Baseados em `setTimeout` (sem `Date.now`),
 * o que os torna determinísticos sob fake timers.
 *
 * Zero Any: o genérico captura a assinatura exata da função embrulhada.
 */

/** Assinatura genérica de um handler de evento (retorno ignorado). */
type AnyHandler<TArgs extends unknown[]> = (...args: TArgs) => void;

/**
 * Debounce: só executa `fn` após `waitMs` sem novas chamadas. Digitar 10 caracteres
 * rápido com `waitMs=1000` resulta em UMA execução (Critério de Aceite 3 da Spec 25).
 */
export const debounce = <TArgs extends unknown[]>(
    fn: AnyHandler<TArgs>,
    waitMs: number,
): AnyHandler<TArgs> => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    return (...args: TArgs): void => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            timer = null;
            fn(...args);
        }, waitMs);
    };
};

/**
 * Throttle (leading): executa `fn` imediatamente e bloqueia novas chamadas por `waitMs`.
 * Um double-click com `waitMs=500` dispara só a primeira (Plano de Testes da Spec 25).
 */
export const throttle = <TArgs extends unknown[]>(
    fn: AnyHandler<TArgs>,
    waitMs: number,
): AnyHandler<TArgs> => {
    let cooling = false;
    return (...args: TArgs): void => {
        if (cooling) return;
        cooling = true;
        setTimeout(() => {
            cooling = false;
        }, waitMs);
        fn(...args);
    };
};
