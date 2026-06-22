/**
 * Two-Way Binding `model` (Spec 32, Regra 1) — helpers puros
 *
 * O caminho de VOLTA do Data Binding (Spec 24 só lê): lê o valor do campo do DataStore
 * (respeitando o escopo local do renderFor) e extrai o novo valor de um evento de
 * mudança para reescrever no estado. Sem React, sem `any`.
 */

import { resolveScopedPath, type StateRecord } from '../DataStore/resolvePath';

/** Lê o valor atual de um `model` path, escopo local antes do global (Spec 21, Regra 5). */
export const resolveModelValue = (
    path: string,
    scope: StateRecord,
    global: unknown,
): unknown => resolveScopedPath(path, scope, global);

/** Alvo mínimo de um evento de input (checkbox usa `checked`; demais usam `value`). */
interface InputEventTarget {
    value?: unknown;
    checked?: unknown;
    type?: string;
}

const hasTarget = (event: unknown): event is { target: InputEventTarget } =>
    typeof event === 'object' &&
    event !== null &&
    'target' in event &&
    typeof (event as { target: unknown }).target === 'object' &&
    (event as { target: unknown }).target !== null;

/**
 * Extrai o valor a gravar no estado a partir do que o `onChange` recebeu:
 *  - evento de checkbox/switch → `target.checked` (boolean);
 *  - evento de input/select/textarea/range → `target.value`;
 *  - valor já primitivo (componentes que chamam `onChange(value)`) → ele mesmo.
 */
export const coerceEventValue = (event: unknown): unknown => {
    if (hasTarget(event)) {
        const target = event.target;
        if (target.type === 'checkbox') return Boolean(target.checked);
        return target.value;
    }
    return event;
};
