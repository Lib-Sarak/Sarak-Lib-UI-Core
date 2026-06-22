/**
 * Acesso Guardado ao LocalStorage (Spec 28)
 *
 * Fronteira de confiança do storage: a biblioteca NUNCA toca o `localStorage`
 * diretamente — passa por aqui. Determinístico, sem `any`, e à prova de ambientes
 * hostis (modo anônimo, storage bloqueado, SSR sem `window`): todo acesso é guardado
 * e degrada para no-op em vez de derrubar o render (Regra de degradação suave).
 *
 *  - Namespace (Regra 3): toda chave é prefixada com `@sarak:` para não colidir com
 *    chaves do sistema importador (ex.: as legadas `sarak_*`).
 *  - sensitive (Regra 4): o valor é ofuscado em base64 (não é cripto — só evita o
 *    valor em claro no storage visível).
 */

/** Prefixo obrigatório de namespace (Regra 3). */
export const STORAGE_NAMESPACE = '@sarak:';

/** Monta a chave namespaced a partir da chave declarada no JSON. */
export const namespacedKey = (key: string): string => `${STORAGE_NAMESPACE}${key}`;

/** Resolve o `localStorage` de forma segura (null em SSR / acesso bloqueado). */
const getStorage = (): Storage | null => {
    try {
        if (typeof window === 'undefined' || !window.localStorage) return null;
        return window.localStorage;
    } catch {
        // Acesso ao localStorage pode lançar (políticas de privacidade estritas).
        return null;
    }
};

/** Codifica em base64 de forma unicode-safe (Regra 4). */
const encodeBase64 = (raw: string): string => {
    try {
        return btoa(encodeURIComponent(raw));
    } catch {
        return raw;
    }
};

/** Decodifica base64 unicode-safe; devolve o original se não for base64 válido. */
const decodeBase64 = (encoded: string): string => {
    try {
        return decodeURIComponent(atob(encoded));
    } catch {
        return encoded;
    }
};

/**
 * Lê e desserializa um valor persistido. Retorna `undefined` se ausente ou ilegível
 * (nunca lança). `sensitive` deve casar com o usado na escrita.
 */
export const readPersisted = (key: string, sensitive = false): unknown => {
    const storage = getStorage();
    if (!storage) return undefined;
    try {
        const stored = storage.getItem(namespacedKey(key));
        if (stored == null) return undefined;
        const json = sensitive ? decodeBase64(stored) : stored;
        return JSON.parse(json);
    } catch {
        console.warn(`[Sarak:Storage] valor ilegível em "${key}"; ignorado.`);
        return undefined;
    }
};

/**
 * Serializa e persiste um valor. No-op silencioso (com aviso) se o storage estiver
 * indisponível — nunca derruba o render.
 */
export const writePersisted = (key: string, value: unknown, sensitive = false): void => {
    const storage = getStorage();
    if (!storage) return;
    try {
        const json = JSON.stringify(value);
        storage.setItem(namespacedKey(key), sensitive ? encodeBase64(json) : json);
    } catch {
        console.warn(`[Sarak:Storage] falha ao persistir "${key}"; ignorado.`);
    }
};

/** Remove uma chave persistida (no-op se indisponível). */
export const removePersisted = (key: string): void => {
    const storage = getStorage();
    if (!storage) return;
    try {
        storage.removeItem(namespacedKey(key));
    } catch {
        // best-effort.
    }
};

/**
 * Assina mudanças EXTERNAS de uma chave (Regra 2 — outra aba do navegador altera o
 * storage). Dispara `onChange` com o novo valor desserializado. Devolve a função de
 * baixa. No-op (devolve cleanup vazio) fora do browser.
 */
export const subscribeStorage = (
    key: string,
    onChange: (value: unknown) => void,
    sensitive = false,
): (() => void) => {
    if (typeof window === 'undefined') return () => undefined;
    const fullKey = namespacedKey(key);
    const handler = (event: StorageEvent): void => {
        if (event.key !== fullKey) return;
        onChange(readPersisted(key, sensitive));
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
};
