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
    // Fundidos no token que de fato desenha (ver docs/migracoes.md, `## 8.0.0`): o valor salvo cai no padrão.
    'colorPalette',        // preset de primária/secundária/terciária — as três cores já são tokens
    'borderRadiusSm',      // escala sem leitor: o raio é `borderRadius` e os raios por componente
    'borderRadiusMd',
    'borderRadiusLg',
    'contrastCurve',       // o único mecanismo de contraste do CSS é `globalContrast`
    'scrollbarWidth',      // duplicatas de `scrollWidth`/`scrollThumbColor`, que o CSS lê
    'scrollbarThumbColor',
]);

// Aviso ÚNICO por sessão (precedente: persistenceStrategy.ts, hasWarnedRemoteWithoutPort).
let hasWarned = false;

export const warnRemovedTokenKeyOnce = (key: string, value: unknown): void => {
    if (hasWarned) return;
    hasWarned = true;
    console.warn(`[Sarak:Design] Token "${key}" foi removido do schema (ver docs/migracoes.md) — descartado.`, value);
};
