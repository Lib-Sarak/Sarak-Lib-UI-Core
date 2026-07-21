/**
 * Funções puras: (answers, ctx) → fatia de `package.json`. Cada stack tem seu
 * próprio conjunto de scripts/devDependencies; `dependencies` sempre espelha
 * as `peerDependencies` reais da lib (nunca uma cópia à mão — Spec 21 §2.3).
 */
import {
    GOLDEN_PATH_DEPENDENCIES,
    GOLDEN_PATH_DEV_DEPENDENCIES,
    NEXT_DEV_DEPENDENCIES,
    NEXT_VERSION_RANGE,
    FRONTEND_ONLY_DEV_DEPENDENCIES,
    DEFAULT_LIB_GIT_SPEC,
} from '../constants.mjs';

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

function viteExpressScripts() {
    return {
        dev: 'concurrently "npm:dev:backend" "npm:dev:frontend"',
        'dev:backend': 'ts-node-dev --respawn --transpile-only --project tsconfig.server.json src/server.ts',
        'dev:frontend': 'vite',
        build: 'tsc --project tsconfig.server.json --noEmit && vite build',
    };
}

function nextScripts() {
    return {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
    };
}

function frontendOnlyScripts() {
    return {
        dev: 'vite',
        build: 'tsc --noEmit && vite build',
    };
}

/** Monta as 3 fatias (`scripts`/`dependencies`/`devDependencies`) para o `mergePackageJson`. */
export function buildPackageJsonUpdates({ answers, ctx }) {
    const dependencies = buildDependencies({ ctx });
    const updateScript = { 'sarak:update': buildUpdateScript({ ctx }) };

    if (answers.stack === 'next') {
        return {
            scripts: { ...nextScripts(), ...updateScript },
            dependencies: { ...dependencies, next: NEXT_VERSION_RANGE },
            devDependencies: { ...NEXT_DEV_DEPENDENCIES },
        };
    }

    if (answers.stack === 'frontend-only') {
        return {
            scripts: { ...frontendOnlyScripts(), ...updateScript },
            dependencies,
            devDependencies: { ...FRONTEND_ONLY_DEV_DEPENDENCIES },
        };
    }

    return {
        scripts: { ...viteExpressScripts(), ...updateScript },
        dependencies: { ...dependencies, ...GOLDEN_PATH_DEPENDENCIES },
        devDependencies: { ...GOLDEN_PATH_DEV_DEPENDENCIES },
    };
}
