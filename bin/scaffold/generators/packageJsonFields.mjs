/**
 * Funções puras: (answers, ctx) → fatia de `package.json` do starter padrão
 * (Spec 45 — front Vite puro, sem backend). `dependencies` sempre espelha as
 * `peerDependencies` reais da lib (nunca uma cópia à mão — Spec 21 §2.3).
 */
import { STARTER_DEV_DEPENDENCIES, DEFAULT_LIB_GIT_SPEC } from '../constants.mjs';
import { DEFAULT_MANAGER, gitUpdateCommand } from '../packageManager.mjs';

const PKG_NAME = '@sarak/lib-ui-core';

/** Superfície PÚBLICA da CLI (Spec 51 — D2): o consumidor para de decorar caminho interno nosso. */
const CLI = `node node_modules/${PKG_NAME}/bin/sarak-ui.mjs`;

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
 *
 * A 4ª etapa (Spec 50 §7) re-sincroniza o kit `sarak-ui/` e as cópias que o
 * importador moveu para `specs/`/`.claude/skills/` — sem ela, a lib estaria nova
 * e as instruções de uso descreveriam a API velha.
 */
export function buildUpdateScript({ ctx }) {
    const libSpec = ctx.libGitSpec ?? DEFAULT_LIB_GIT_SPEC;
    const manager = ctx.manager?.name ?? DEFAULT_MANAGER;
    const { command } = gitUpdateCommand({ manager, packageName: PKG_NAME, gitSpec: libSpec });
    // Gerenciador sem comando validado (Spec 51 — regra dura): melhor um script que
    // só re-sincroniza o kit do que um que manda o consumidor rodar um chute.
    const update = command ?? `echo "Atualize ${PKG_NAME} com o gerenciador deste projeto e rode: ${CLI} refresh"`;
    return `${update} && ${CLI} refresh`;
}

/**
 * Verificação AUTORITATIVA de "estou atualizado?" (Spec 39 follow-up, item 2):
 * o `dist/BUILD_INFO.json` da lib NUNCA pode responder isso sozinho (é o
 * commit-BASE do build, não o commit publicado — auto-referência impossível).
 * A fonte exata é o `resolved` do `package-lock.json` do próprio consumidor,
 * comparado contra o HEAD remoto — é isso que `checkUpdate.mjs` faz.
 */
export function buildCheckScript() {
    return `${CLI} check`;
}

/**
 * O AVISO de atualização (Spec 51 — L1), ligado como `predev`: o importador descobre
 * que há versão nova a cada `npm run dev`, sem precisar lembrar de rodar nada. Em dia
 * não imprime uma linha, e sai sempre com 0 — um aviso jamais derruba o dev de ninguém.
 *
 * Se o consumidor JÁ tiver um `predev`, o merge preserva o dele (reporta em `skipped`)
 * e a receita de encadear à mão está no `sarak-ui/GUIA-FRONTEND.md`.
 */
export function buildNoticeScript() {
    return `${CLI} check --notify`;
}

function starterScripts() {
    return {
        dev: 'vite',
        build: 'tsc --noEmit && vite build',
        predev: buildNoticeScript(),
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
