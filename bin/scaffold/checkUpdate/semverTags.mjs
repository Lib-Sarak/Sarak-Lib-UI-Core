/**
 * Leitura das TAGS de release do repositório remoto (ADR-008).
 *
 * A partir do ciclo de release por tag, a pergunta "o consumidor está atualizado?"
 * deixa de ser "que commit ele tem?" e passa a ser "que VERSÃO ele tem?". Este módulo
 * é só a parte chata: transformar a saída crua de `git ls-remote --tags` numa versão
 * comparável, sem trazer uma dependência de semver para dentro do pacote.
 *
 * Escopo deliberado: **só `vX.Y.Z`**. Tag de pré-release, tag sem `v`, tag de qualquer
 * outro formato é IGNORADA em vez de adivinhada — a comparação alimenta um aviso que o
 * consumidor lê a cada `npm run dev`, e um aviso errado é pior que aviso nenhum.
 */

const TAG_RE = /^v(\d+)\.(\d+)\.(\d+)$/;

/** @returns {[number, number, number] | null} */
export const parseTag = (tag) => {
    const match = TAG_RE.exec(String(tag).trim());
    return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null;
};

/** @returns {number} negativo se `a` < `b`, 0 se iguais, positivo se `a` > `b`. */
export const compareVersions = (a, b) => {
    for (let i = 0; i < 3; i += 1) {
        if (a[i] !== b[i]) return a[i] - b[i];
    }
    return 0;
};

/**
 * `git ls-remote --tags` devolve uma linha por ref, e para tag ANOTADA devolve DUAS:
 * a tag e o `^{}` que aponta para o commit. As duas carregam o mesmo nome de versão,
 * então basta descartar o sufixo e deduplicar pelo maior.
 */
export const parseTagRefs = (saida) =>
    String(saida)
        .split('\n')
        .map((linha) => linha.trim())
        .filter((linha) => linha !== '')
        .map((linha) => linha.split(/\s+/)[1] ?? '')
        .filter((ref) => ref.startsWith('refs/tags/'))
        .map((ref) => ref.slice('refs/tags/'.length).replace(/\^\{\}$/, ''));

/** @returns {{ tag: string, version: [number,number,number] } | null} a maior tag `vX.Y.Z`. */
export const greatestTag = (tags) => {
    let melhor = null;
    for (const tag of tags) {
        const version = parseTag(tag);
        if (!version) continue;
        if (melhor === null || compareVersions(version, melhor.version) > 0) melhor = { tag, version };
    }
    return melhor;
};

/** `1.0.0` (do `package.json` instalado) → `[1,0,0]`. Aceita com e sem o `v`. */
export const parseVersion = (value) => parseTag(String(value).trim().startsWith('v') ? value : `v${value}`);
