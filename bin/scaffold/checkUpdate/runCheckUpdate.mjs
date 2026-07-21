/**
 * `npm run sarak:check` (Spec 39 follow-up): a verificação AUTORITATIVA de "o
 * consumidor está atualizado?" que o `BUILD_INFO.json` nunca poderá responder
 * sozinho (ver nota em `scripts/generate-build-info.mjs`). Compara o commit
 * REALMENTE instalado (`package-lock.json`, via `readInstalledCommit`) contra o
 * HEAD remoto do repositório (`git ls-remote`, via `resolveRemoteUrl`).
 *
 * `execGitLsRemote` é injetável para teste (evita rede nos testes unitários);
 * o default usa `execFileSync` (nunca `execSync` com string interpolada — a
 * URL/ref vêm do package.json do consumidor, e passar por shell seria uma
 * porta de injeção de comando desnecessária).
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { resolveRemoteUrl } from './resolveRemoteUrl.mjs';
import { readInstalledCommit } from './readInstalledCommit.mjs';

const PKG_NAME = '@sarak/lib-ui-core';

function defaultExecGitLsRemote(url, ref) {
    const output = execFileSync('git', ['ls-remote', url, ref], { encoding: 'utf8' });
    const [sha] = output.trim().split(/\s+/);
    return sha || null;
}

function readJsonNoBom(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8').replace(/^﻿/, ''));
}

export function runCheckUpdate({ rootDir = process.cwd(), execGitLsRemote = defaultExecGitLsRemote } = {}) {
    const pkgPath = path.join(rootDir, 'package.json');
    const lockPath = path.join(rootDir, 'package-lock.json');

    if (!fs.existsSync(pkgPath) || !fs.existsSync(lockPath)) {
        return {
            ok: false,
            message: `[sarak:check] package.json/package-lock.json não encontrados em ${rootDir}. Rode este comando na raiz do consumidor, depois de instalar a lib.`,
        };
    }

    const pkg = readJsonNoBom(pkgPath);
    const gitSpec = pkg.dependencies?.[PKG_NAME];
    if (!gitSpec) {
        return { ok: false, message: `[sarak:check] "${PKG_NAME}" não está em dependencies do package.json.` };
    }

    const installedCommit = readInstalledCommit(fs.readFileSync(lockPath, 'utf8'), PKG_NAME);
    if (!installedCommit) {
        return {
            ok: false,
            message: '[sarak:check] Não achei o commit instalado no package-lock.json (dependência não é git, ou lockfile em formato inesperado).',
        };
    }

    const { url, ref, pinnedCommit } = resolveRemoteUrl(gitSpec);

    if (pinnedCommit) {
        return {
            ok: true,
            message: `[sarak:check] "${gitSpec}" fixa um commit explícito no PRÓPRIO spec (${pinnedCommit.slice(0, 7)}) — não há HEAD remoto para comparar. Instalado: ${installedCommit.slice(0, 7)}.`,
        };
    }

    let remoteCommit;
    try {
        remoteCommit = execGitLsRemote(url, ref);
    } catch (err) {
        return {
            ok: false,
            message: `[sarak:check] Não consegui consultar ${url} (${ref}) — verifique a rede/o acesso ao repositório.\n${err instanceof Error ? err.message : String(err)}`,
        };
    }

    if (!remoteCommit) {
        return { ok: false, message: `[sarak:check] "git ls-remote" não retornou nenhum commit para ${url} (${ref}).` };
    }

    if (installedCommit === remoteCommit) {
        return {
            ok: true,
            upToDate: true,
            message: `[sarak:check] Atualizado — instalado ${installedCommit.slice(0, 7)} == HEAD remoto (${ref}) ${remoteCommit.slice(0, 7)}.`,
        };
    }

    return {
        ok: true,
        upToDate: false,
        message: `[sarak:check] Desatualizado — instalado ${installedCommit.slice(0, 7)}, HEAD remoto (${ref}) é ${remoteCommit.slice(0, 7)}. Rode: npm run sarak:update`,
    };
}
