/**
 * Chaves de tema REMOVIDAS do schema (breaking change, ver docs/migracoes.md) que
 * `validateDesign` ainda pode receber de um payload persistido antigo. Arquivo à
 * parte só para não estourar o teto de linhas do auditor de Clean Code em
 * `validation.ts` — mesmo precedente de `payloadExtraKeys.ts`.
 */
export const REMOVED_TOKEN_KEYS = new Set<string>(['globalBackgroundBlendMode']);

// Aviso ÚNICO por sessão (precedente: persistenceStrategy.ts, hasWarnedRemoteWithoutPort).
let hasWarned = false;

export const warnRemovedTokenKeyOnce = (key: string, value: unknown): void => {
    if (hasWarned) return;
    hasWarned = true;
    console.warn(`[Sarak:Design] Token "${key}" foi removido do schema (7.0.0) — descartado.`, value);
};
