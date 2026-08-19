/**
 * Reescreve a FAIXA declarada no `package.json` do consumidor — só chamado depois da
 * confirmação do `--latest` (plan-10 §3.1: "só então reescreve a faixa"). Nunca toca
 * no commit nem na URL, e nunca reescreve o arquivo inteiro via `JSON.stringify`
 * (reordenaria/reformataria chaves que não são da conta deste comando) — troca só o
 * texto do valor, e recusa agir se a ocorrência não for exatamente uma.
 */
const SEMVER_FRAGMENT_RE = /^semver:(\^|~)?\d+\.\d+\.\d+$/;

/**
 * `github:owner/repo#semver:^3.0.0` + `6` → `github:owner/repo#semver:^6.0.0`. O
 * minor/patch da faixa volta a `.0.0`: o "novo piso" é a primeira versão do major
 * alvo, não um ponto arbitrário dentro dele. Spec sem faixa `#semver:` (commit fixo,
 * `github:` puro) não tem o que bumpar — devolvido sem alteração.
 */
export const bumpSpecMajor = (spec, novoMajor) => {
    const hashIndex = spec.indexOf('#');
    if (hashIndex === -1) return spec;
    const base = spec.slice(0, hashIndex);
    const fragmento = spec.slice(hashIndex + 1);
    const match = SEMVER_FRAGMENT_RE.exec(fragmento);
    if (!match) return spec;
    const operador = match[1] ?? '^';
    return `${base}#semver:${operador}${novoMajor}.0.0`;
};

/**
 * Troca só o VALOR da dependência no texto cru do `package.json` — preserva
 * formatação, ordem de chaves e comentário nenhum vira alvo. Recusa agir (lança) se a
 * ocorrência não for exatamente uma: reescrever o arquivo errado é pior que não
 * reescrever nada.
 */
export const rewritePackageJsonDependency = ({ text, pkgName, oldSpec, newSpec }) => {
    const needle = `"${pkgName}": "${oldSpec}"`;
    const ocorrencias = text.split(needle).length - 1;
    if (ocorrencias !== 1) {
        throw new Error(
            `[sarak:update] Esperava exatamente 1 ocorrência de ${needle} em package.json, achei ${ocorrencias} — ` +
                'não vou arriscar reescrever o arquivo errado. Troque a faixa à mão.',
        );
    }
    return text.replace(needle, `"${pkgName}": "${newSpec}"`);
};
