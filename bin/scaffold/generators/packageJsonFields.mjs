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
} from '../constants.mjs';

export function buildDependencies({ ctx }) {
    return {
        '@sarak/lib-ui-core': `^${ctx.libVersion}`,
        ...ctx.peerDependencies,
    };
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

    if (answers.stack === 'next') {
        return {
            scripts: nextScripts(),
            dependencies: { ...dependencies, next: NEXT_VERSION_RANGE },
            devDependencies: { ...NEXT_DEV_DEPENDENCIES },
        };
    }

    if (answers.stack === 'frontend-only') {
        return {
            scripts: frontendOnlyScripts(),
            dependencies,
            devDependencies: { ...FRONTEND_ONLY_DEV_DEPENDENCIES },
        };
    }

    return {
        scripts: viteExpressScripts(),
        dependencies: { ...dependencies, ...GOLDEN_PATH_DEPENDENCIES },
        devDependencies: { ...GOLDEN_PATH_DEV_DEPENDENCIES },
    };
}
