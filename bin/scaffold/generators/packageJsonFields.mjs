/**
 * Funções puras: (answers, ctx) → fatia de `package.json` do starter padrão
 * (Spec 45 — front Vite puro, sem backend). `dependencies` sempre espelha as
 * `peerDependencies` reais da lib (nunca uma cópia à mão — Spec 21 §2.3).
 */
import { STARTER_DEV_DEPENDENCIES, DEFAULT_LIB_GIT_SPEC } from '../constants.mjs';

export function buildDependencies({ ctx }) {
    return {
        '@sarak/lib-ui-core': `^${ctx.libVersion}`,
        ...ctx.peerDependencies,
    };
}

/**
 * Comando único de atualização (Spec 39 §2.1). Como a dependência é git e a
 * `version` do pacote não muda a cada release, um `npm install` comum é um
 * NO-OP: o npm honra o `resolved` já gravado no lockfile. O script precisa
 * furar as DUAS causas do travamento: o pin do lockfile (removendo a
 * dependência) e o cache git do npm (`cache clean --force`), antes de
 * reinstalar do MESMO spec que o consumidor usou originalmente.
 */
export function buildUpdateScript({ ctx }) {
    const libSpec = ctx.libGitSpec ?? DEFAULT_LIB_GIT_SPEC;
    return `npm uninstall @sarak/lib-ui-core && npm cache clean --force && npm install ${libSpec}`;
}

/**
 * Verificação AUTORITATIVA de "estou atualizado?" (Spec 39 follow-up, item 2):
 * o `dist/BUILD_INFO.json` da lib NUNCA pode responder isso sozinho (é o
 * commit-BASE do build, não o commit publicado — auto-referência impossível).
 * A fonte exata é o `resolved` do `package-lock.json` do próprio consumidor,
 * comparado contra o HEAD remoto — é isso que `checkUpdate.mjs` faz.
 */
export function buildCheckScript() {
    return 'node node_modules/@sarak/lib-ui-core/bin/scaffold/checkUpdate.mjs';
}

function starterScripts() {
    return {
        dev: 'vite',
        build: 'tsc --noEmit && vite build',
    };
}

/** Monta as 3 fatias (`scripts`/`dependencies`/`devDependencies`) para o `mergePackageJson`. */
export function buildPackageJsonUpdates({ ctx }) {
    const dependencies = buildDependencies({ ctx });
    const updateScripts = {
        'sarak:update': buildUpdateScript({ ctx }),
        'sarak:check': buildCheckScript(),
    };

    return {
        scripts: { ...starterScripts(), ...updateScripts },
        dependencies,
        devDependencies: { ...STARTER_DEV_DEPENDENCIES },
    };
}
