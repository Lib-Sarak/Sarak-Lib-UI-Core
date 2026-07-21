/**
 * Traduz o spec git gravado em `dependencies['@sarak/lib-ui-core']` (Spec 39
 * follow-up, §2 item 2) para uma URL que `git ls-remote` entende + a ref a
 * consultar. Cobre os atalhos que o npm aceita como dependência git:
 * `github:owner/repo`, `gitlab:owner/repo`, `bitbucket:owner/repo`, `owner/repo`
 * nu (atalho implícito de GitHub) e URLs completas (`git+https://`/`git+ssh://`).
 *
 * Se o spec já fixa um commit no PRÓPRIO texto (ex.: `...#7fd0bd1...`), não há
 * "HEAD remoto" para comparar — quem decidiu isso foi o autor do spec, não o
 * lockfile. Sinalizamos via `pinnedCommit` em vez de tentar comparar contra HEAD.
 */
const COMMIT_SHA_RE = /^[0-9a-f]{7,40}$/i;

function toGitUrl(base) {
    if (base.startsWith('github:')) return `https://github.com/${base.slice('github:'.length)}.git`;
    if (base.startsWith('gitlab:')) return `https://gitlab.com/${base.slice('gitlab:'.length)}.git`;
    if (base.startsWith('bitbucket:')) return `https://bitbucket.org/${base.slice('bitbucket:'.length)}.git`;
    if (base.startsWith('git+')) return base.slice('git+'.length);
    if (/^[\w.-]+\/[\w.-]+$/.test(base)) return `https://github.com/${base}.git`;
    return base;
}

export function resolveRemoteUrl(gitSpec) {
    const hashIndex = gitSpec.indexOf('#');
    const base = hashIndex === -1 ? gitSpec : gitSpec.slice(0, hashIndex);
    const fragment = hashIndex === -1 ? null : gitSpec.slice(hashIndex + 1);
    const url = toGitUrl(base);

    if (fragment && COMMIT_SHA_RE.test(fragment)) {
        return { url, ref: null, pinnedCommit: fragment };
    }
    return { url, ref: fragment ?? 'HEAD', pinnedCommit: null };
}
