/**
 * Chaves de tema REMOVIDAS do schema (breaking change, ver docs/migracoes.md) que
 * `validateDesign` ainda pode receber de um payload persistido antigo. Arquivo à
 * parte só para não estourar o teto de linhas do auditor de Clean Code em
 * `validation.ts` — mesmo precedente de `payloadExtraKeys.ts`.
 */
export const REMOVED_TOKEN_KEYS = new Set<string>([
    'globalBackgroundBlendMode',
    // Os três controles de ruído viraram um (`bgNoiseDensity`); o valor salvo dos outros dois cai no padrão.
    'atmosphereNoiseOpacity',
    'noiseIntensity',
]);

// Aviso ÚNICO por sessão (precedente: persistenceStrategy.ts, hasWarnedRemoteWithoutPort).
let hasWarned = false;

export const warnRemovedTokenKeyOnce = (key: string, value: unknown): void => {
    if (hasWarned) return;
    hasWarned = true;
    console.warn(`[Sarak:Design] Token "${key}" foi removido do schema (ver docs/migracoes.md) — descartado.`, value);
};
