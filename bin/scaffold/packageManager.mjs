/**
 * Detecção do gerenciador de pacotes do consumidor e os comandos correspondentes
 * (Spec 51 — L2).
 *
 * Por que existe: até a Spec 50 todo o fluxo de atualização era npm cru
 * (`npm uninstall && npm cache clean --force && npm install`). Num workspace pnpm
 * isso **quebra** — o npm entra em `node_modules/.pnpm/` e tenta rodar o `prepare`
 * de um pacote de terceiro (achado real, 2026-07-26). Como o kit da Spec 50
 * documenta monorepo/monolito modular como topologias de primeira classe, mandar
 * comando npm para todo mundo era garantia de quebrar o repositório de quem seguisse
 * a instrução.
 *
 * REGRA DURA desta spec: só entra aqui comando **executado de verdade**. O que não
 * foi validado é declarado como tal (`validated: false`) e a mensagem degrada para
 * instrução genérica em vez de mandar o consumidor rodar um chute.
 */
import fs from 'node:fs';
import path from 'node:path';

export const DEFAULT_MANAGER = 'npm';

/** Lockfile → gerenciador. A ordem importa quando há mais de um no mesmo diretório. */
const LOCKFILES = [
    ['pnpm-lock.yaml', 'pnpm'],
    ['yarn.lock', 'yarn'],
    ['package-lock.json', 'npm'],
];

const readJsonNoBom = (file) => JSON.parse(fs.readFileSync(file, 'utf8').replace(/^﻿/, ''));

/** `pnpm@11.17.0` → `pnpm`. Campo padrão do Node/corepack; é a declaração explícita do projeto. */
const nameFromPackageManagerField = (value) =>
    typeof value === 'string' ? value.split('@')[0].trim() : null;

/** Lockfiles presentes num diretório, do mais recente para o mais antigo. */
const lockfilesIn = (dir) =>
    LOCKFILES.map(([file, manager]) => ({ manager, file, full: path.join(dir, file) }))
        .filter((entry) => fs.existsSync(entry.full))
        .map((entry) => ({ ...entry, mtime: fs.statSync(entry.full).mtimeMs }))
        .sort((a, b) => b.mtime - a.mtime);

/**
 * Diretórios de `startDir` até a raiz do volume, de dentro para fora.
 *
 * `stopAt` é uma FRONTEIRA opcional: a subida inclui esse diretório e para ali, sem
 * nunca ultrapassá-lo. Em produção ela não é passada — subir até a raiz é a feature
 * (é assim que um pacote de monorepo herda o gerenciador da raiz). Ela existe porque
 * sem fronteira o resultado de uma busca depende do que houver ACIMA da sub-árvore
 * observada: um `package-lock.json` solto no `$HOME` de uma máquina é achado de
 * verdade, e a detecção acerta — mas quem quer observar só uma sub-árvore não tem
 * como dizê-lo. `stopAt` torna esse recorte parte do CONTRATO da função, em vez de
 * depender do estado do sistema de arquivos ao redor.
 *
 * Se `stopAt` não estiver na linha de ancestrais de `startDir`, a subida vai até a
 * raiz (comportamento sem fronteira) — a fronteira delimita, não redireciona.
 */
export const ancestorDirs = (startDir, { stopAt = null } = {}) => {
    const boundary = stopAt === null ? null : path.resolve(stopAt);
    const dirs = [];
    let current = path.resolve(startDir);
    for (;;) {
        dirs.push(current);
        if (current === boundary) return dirs;
        const parent = path.dirname(current);
        if (parent === current) return dirs;
        current = parent;
    }
};

/**
 * Detecta o gerenciador subindo a árvore. Em CADA nível: o campo `packageManager`
 * vence primeiro, depois os lockfiles. A precedência do campo é deliberada — um
 * repositório pode ter lockfile RESÍDUO de outro gerenciador (o consumidor
 * investigado tinha `pnpm-lock.yaml` e um `package-lock.json` dois dias mais velho),
 * e o campo é a declaração de intenção; o lockfile é só um rastro.
 *
 * `stopAt` (opcional) delimita a subida — ver `ancestorDirs`. Uso real não passa.
 *
 * @returns {{ name: string, source: 'packageManager'|'lockfile'|'default', dir: string|null, ambiguous: string[] }}
 */
export const detectPackageManager = ({ startDir = process.cwd(), stopAt = null } = {}) => {
    for (const dir of ancestorDirs(startDir, { stopAt })) {
        const pkgPath = path.join(dir, 'package.json');
        if (fs.existsSync(pkgPath)) {
            try {
                const declared = nameFromPackageManagerField(readJsonNoBom(pkgPath).packageManager);
                if (declared) return { name: declared, source: 'packageManager', dir, ambiguous: [] };
            } catch {
                // package.json ilegível não pode derrubar a detecção — segue para o lockfile.
            }
        }
        const locks = lockfilesIn(dir);
        if (locks.length > 0) {
            return {
                name: locks[0].manager,
                source: 'lockfile',
                dir,
                // Mais de um lockfile = rastro ambíguo. O mais recente vence, mas a
                // ambiguidade é REPORTADA — silenciar aqui é como o resíduo npm num
                // repositório pnpm passa despercebido até quebrar algo.
                ambiguous: locks.length > 1 ? locks.map((lock) => lock.file) : [],
            };
        }
    }
    return { name: DEFAULT_MANAGER, source: 'default', dir: null, ambiguous: [] };
};

/**
 * Comando para reinstalar uma dependência LOCAL (`file:`/`link:`) que o gerenciador
 * copiou em vez de linkar. Medido (2026-07-26), não deduzido:
 *  - **pnpm** em workspace, com a fonte fora da raiz: cópia no store; `install --force
 *    --filter <pkg>` re-copia. Validado no consumidor real.
 *  - **yarn** (classic): cópia; `install --force` re-copia. Validado em probe.
 *  - **npm**: nas topologias medidas ele LINKA a fonte (o `node_modules` aponta para o
 *    diretório real), então nunca fica velho e este comando não chega a ser sugerido;
 *    a forma análoga fica registrada para o caso de um layout em que ele copie.
 */
export const localRefreshCommand = ({ manager, packageName }) => {
    if (manager === 'pnpm') {
        const filter = packageName ? ` --filter ${packageName}` : '';
        return { command: `pnpm install --force${filter}`, validated: true };
    }
    if (manager === 'yarn') return { command: 'yarn install --force', validated: true };
    if (manager === 'npm') return { command: 'npm install --force', validated: false };
    return { command: null, validated: false };
};

/**
 * Comando para atualizar uma dependência GIT. O npm precisa das três etapas (Spec 39):
 * a `version` do pacote não muda entre commits, então o lockfile é considerado
 * satisfeito e o cache git serviria o mesmo commit velho — remover + limpar cache +
 * reinstalar é o que fura os dois.
 *
 * Medido em 2026-07-26, contra o repositório real: `pnpm add <spec git>` e
 * `yarn add <spec git>` saem com 0 e **resolvem o HEAD remoto atual** (o `yarn.lock`
 * gravou exatamente o SHA devolvido por `git ls-remote`). Nenhum dos dois precisou de
 * limpeza de cache para isso; o `remove` que antecede existe para tirar o pin do
 * lockfile, o mesmo papel do `uninstall` no npm.
 */
export const gitUpdateCommand = ({ manager, packageName, gitSpec }) => {
    if (manager === 'npm') {
        return {
            command: `npm uninstall ${packageName} && npm cache clean --force && npm install ${gitSpec}`,
            validated: true,
        };
    }
    if (manager === 'pnpm') {
        return { command: `pnpm remove ${packageName} && pnpm add ${gitSpec}`, validated: true };
    }
    if (manager === 'yarn') {
        return { command: `yarn remove ${packageName} && yarn add ${gitSpec}`, validated: true };
    }
    return { command: null, validated: false };
};
