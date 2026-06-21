/**
 * Resolução Segura de Caminho (Spec 21 — Regras 2 e 5)
 *
 * Compartilhado com o motor de Data Binding (Spec 24). Lê `user.address.street`
 * de forma imune a `undefined` intermediário (nunca lança) e resolve o escopo
 * local de iteração (`item`, `index` do renderFor) ANTES do estado global.
 *
 * Determinístico e sem `any`.
 */

/** Estado/escopo arbitrário porém serializável — substitui `any` na fronteira. */
export type StateRecord = Record<string, unknown>;

/** Quebra um caminho `"a.b.c"` em segmentos, ignorando vazios. */
const segments = (path: string): string[] =>
    path.split('.').map((s) => s.trim()).filter((s) => s.length > 0);

const isIndexable = (value: unknown): value is StateRecord | unknown[] =>
    typeof value === 'object' && value !== null;

/**
 * Lê um caminho dentro de um objeto, sem lançar. Retorna `undefined` se qualquer
 * elo intermediário for ausente/primitivo. Suporta índices de array (`list.0.name`).
 */
export const getByPath = (root: unknown, path: string): unknown => {
    const parts = segments(path);
    if (parts.length === 0) return root;

    let current: unknown = root;
    for (const part of parts) {
        if (!isIndexable(current)) return undefined;
        current = (current as StateRecord)[part];
    }
    return current;
};

/**
 * Resolve um caminho consultando o escopo local antes do global (Regra 5).
 * O primeiro segmento decide a fonte: se existir como chave do escopo local,
 * a leitura inteira parte do escopo local; caso contrário, parte do global.
 * Assim `{{item.x}}` dentro de um `renderFor` não polui o estado global.
 */
export const resolveScopedPath = (
    path: string,
    localScope: StateRecord,
    globalState: unknown,
): unknown => {
    const parts = segments(path);
    if (parts.length === 0) return globalState;

    const [head] = parts;
    if (Object.prototype.hasOwnProperty.call(localScope, head)) {
        return getByPath(localScope, path);
    }
    return getByPath(globalState, path);
};

/**
 * Escreve `value` em `path` de forma IMUTÁVEL: clona apenas o trajeto afetado,
 * preservando o resto da árvore por referência (barato e anti-loop). Retorna a
 * nova raiz; objetos não tocados mantêm identidade (seletores não disparam à toa).
 */
export const setByPath = (root: StateRecord, path: string, value: unknown): StateRecord => {
    const parts = segments(path);
    if (parts.length === 0) return root;

    const nextRoot: StateRecord = { ...root };
    let cursor: StateRecord = nextRoot;

    for (let i = 0; i < parts.length - 1; i++) {
        const key = parts[i];
        const child = cursor[key];
        const clonedChild: StateRecord = isIndexable(child) && !Array.isArray(child)
            ? { ...(child as StateRecord) }
            : {};
        cursor[key] = clonedChild;
        cursor = clonedChild;
    }

    cursor[parts[parts.length - 1]] = value;
    return nextRoot;
};
