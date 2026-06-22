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

/** Um segmento puramente numérico endereça um índice de array (ex.: `list.0.name`). */
const isArrayIndex = (key: string): boolean => /^\d+$/.test(key);

/** Lê uma chave de um container (objeto ou array) sem `any`. */
const readKey = (container: object, key: string): unknown =>
    (container as Record<string, unknown>)[key];

/** Escreve uma chave num container (objeto ou array) sem `any`. */
const writeKey = (container: object, key: string, value: unknown): void => {
    (container as Record<string, unknown>)[key] = value;
};

/**
 * Clona o próximo elo do trajeto PRESERVANDO o tipo: array continua array (nunca
 * colapsa em objeto), objeto continua objeto. Elo ausente/primitivo vira array se o
 * próximo segmento é índice numérico, senão objeto.
 */
const cloneStep = (child: unknown, nextKey: string | undefined): object => {
    if (Array.isArray(child)) return [...child];
    if (isIndexable(child)) return { ...(child as StateRecord) };
    return nextKey !== undefined && isArrayIndex(nextKey) ? [] : {};
};

/**
 * Escreve `value` em `path` de forma IMUTÁVEL: clona apenas o trajeto afetado,
 * preservando o resto da árvore por referência (barato e anti-loop). Arrays no
 * caminho são preservados como arrays (escrita em índice como `list.0.name`).
 * Retorna a nova raiz; objetos não tocados mantêm identidade (seletores não disparam à toa).
 */
export const setByPath = (root: StateRecord, path: string, value: unknown): StateRecord => {
    const parts = segments(path);
    if (parts.length === 0) return root;

    const nextRoot: StateRecord = { ...root };
    let cursor: object = nextRoot;

    for (let i = 0; i < parts.length - 1; i++) {
        const key = parts[i];
        const cloned = cloneStep(readKey(cursor, key), parts[i + 1]);
        writeKey(cursor, key, cloned);
        cursor = cloned;
    }

    writeKey(cursor, parts[parts.length - 1], value);
    return nextRoot;
};
