/** Glob mínimo (`**`, `*`, `?`) para as opções `allow`/`exclude` — sem dependência. */

const SPECIALS = /[.+^${}()|[\]\\]/g;

/** Traduz o curinga que começa em `index`; devolve o trecho e quantos caracteres consumiu a mais. */
const wildcard = (glob: string, index: number): { source: string; extra: number } => {
    if (glob[index] === '?') return { source: '[^/]', extra: 0 };
    if (glob[index + 1] !== '*') return { source: '[^/]*', extra: 0 };
    const followedBySlash = glob[index + 2] === '/';
    return { source: followedBySlash ? '(?:.*/)?' : '.*', extra: followedBySlash ? 2 : 1 };
};

const globToSource = (glob: string): string => {
    let source = '';
    for (let index = 0; index < glob.length; index += 1) {
        const char = glob[index];
        if (char !== '*' && char !== '?') {
            source += char.replace(SPECIALS, '\\$&');
            continue;
        }
        const part = wildcard(glob, index);
        source += part.source;
        index += part.extra;
    }
    return source;
};

export const globToRegExp = (glob: string): RegExp => new RegExp(`^${globToSource(glob)}$`);

export const toPosix = (file: string): string => file.replace(/\\/g, '/');

/** Caminho relativo à raiz, em posix; fora da raiz, o caminho inteiro. */
export const relativeTo = (root: string, file: string): string => {
    const base = toPosix(root).replace(/\/$/, '');
    const target = toPosix(file);
    return target.startsWith(`${base}/`) ? target.slice(base.length + 1) : target;
};

export const matchesAny = (globs: readonly string[], relativeFile: string): boolean =>
    globs.some((glob) => globToRegExp(glob).test(relativeFile));
