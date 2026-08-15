/**
 * `sarak-ui check` (Spec 39 follow-up, reescrito pela Spec 51).
 *
 * Responde "o consumidor está atualizado?" nos DOIS modos de dependência e devolve,
 * junto, o COMANDO certo para o gerenciador daquele projeto:
 *  - **git spec** — **versão instalada × maior tag `vX.Y.Z` do remoto** (ADR-008);
 *    sem tags no remoto, cai para commit instalado × HEAD remoto (o modo pré-tag);
 *  - **`file:`/`link:`** — assinatura de build instalada × a do repositório em disco
 *    (`localDependency.mjs`), porque aqui não existe commit remoto nem tag para comparar.
 *
 * O que a Spec 51 mudou: o contexto é resolvido subindo a árvore (monorepo funciona),
 * `file:` deixou de ser tratado como erro, o comando sugerido deixou de ser npm cru, e
 * há um modo `--notify` que **nunca falha e nunca fala à toa** (§ `formatNotice`).
 *
 * O que o ADR-008 mudou: a comparação PREFERE tag. O aviso passa a dizer `v1.0.0 →
 * v1.1.0` em vez de dois hashes de 7 caracteres — que é o que o consumidor consegue
 * relacionar com a faixa que ele escreveu no `package.json`. A queda para commit não
 * foi removida: `github:` puro continua SUPORTADO, e um remoto sem tag nenhuma
 * (repositório novo, fork) tem de continuar respondendo alguma coisa.
 *
 * `execGitLsRemote` é injetável para teste (evita rede); o default usa `execFileSync`
 * com timeout — nunca `execSync` com string interpolada, já que a URL vem do
 * package.json do consumidor e passar por shell seria porta de injeção desnecessária.
 */
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolveRemoteUrl } from './resolveRemoteUrl.mjs';
import { readInstalledCommit } from './readInstalledCommit.mjs';
import { PKG_NAME, resolveConsumerContext } from './consumerContext.mjs';
import { inspectLocalDependency, isLocalSpec } from './localDependency.mjs';
import { compareByTag, defaultExecGitLsRemoteTags } from './tagComparison.mjs';
import { gitUpdateCommand, localRefreshCommand } from '../packageManager.mjs';
import { inspectViteDepsCache } from './bundlerCache.mjs';

/**
 * Teto de espera da consulta remota. O `check` roda no `predev` do consumidor: o custo
 * dele é sentido em TODO `npm run dev`, e uma rede ruim não pode virar dev travado.
 * Estourou, desiste em silêncio.
 */
const GIT_TIMEOUT_MS = 3000;

const short = (sha) => (sha ? sha.slice(0, 7) : '?');

function defaultExecGitLsRemote(url, ref) {
    const output = execFileSync('git', ['ls-remote', url, ref], {
        encoding: 'utf8',
        timeout: GIT_TIMEOUT_MS,
        stdio: ['ignore', 'pipe', 'ignore'],
    });
    const [sha] = output.trim().split(/\s+/);
    return sha || null;
}

const localResult = (context, inspection) => {
    const { command, validated } = localRefreshCommand({
        manager: context.manager.name,
        packageName: context.packageName,
    });
    const base = {
        ok: true,
        mode: 'local',
        manager: context.manager,
        sourceDir: inspection.sourceDir,
        command,
        commandValidated: validated,
    };

    if (inspection.kind === 'live') {
        return { ...base, upToDate: true, message: `[sarak:check] Modo desenvolvimento local (${context.spec}) — ${inspection.detail}` };
    }
    if (inspection.kind === 'indeterminado') {
        return { ...base, upToDate: null, message: `[sarak:check] Modo desenvolvimento local (${context.spec}) — ${inspection.detail}` };
    }
    if (inspection.kind === 'fresh') {
        return { ...base, upToDate: true, message: `[sarak:check] Atualizado — ${inspection.detail} (kitHash ${inspection.installedKitHash ?? '?'}).` };
    }
    // Rótulo combina kitHash (a API pública) e a assinatura do `dist/` — só o kitHash
    // não basta: um arquivo novo/removido no `dist/` deixa o kitHash igual.
    const label = (kitHash, inventoryHash) => `kitHash ${kitHash ?? '?'} · dist ${inventoryHash ?? '?'}`;
    return {
        ...base,
        upToDate: false,
        installedLabel: label(inspection.installedKitHash, inspection.installedInventory),
        remoteLabel: label(inspection.sourceKitHash, inspection.sourceInventory),
        message:
            `[sarak:check] Desatualizado — ${inspection.detail}\n` +
            `              instalado: ${label(inspection.installedKitHash, inspection.installedInventory)}\n` +
            `              em disco:  ${label(inspection.sourceKitHash, inspection.sourceInventory)}\n` +
            `              Para atualizar: ${command ?? 'reinstale a dependência'}`,
    };
};

const gitResult = (context, execGitLsRemote, execGitLsRemoteTags) => {
    const { command, validated } = gitUpdateCommand({
        manager: context.manager.name,
        packageName: PKG_NAME,
        gitSpec: context.spec,
    });
    const base = { ok: true, mode: 'git', manager: context.manager, command, commandValidated: validated };
    const { url, ref, pinnedCommit } = resolveRemoteUrl(context.spec);

    // Spec com commit fixado no próprio texto é decisão explícita do autor: nem tag nem
    // HEAD são resposta. Cai direto no caminho antigo, que sabe dizer isso.
    if (!pinnedCommit) {
        const porTag = compareByTag({ base, context, url, execGitLsRemoteTags });
        if (porTag) return porTag;

        // Um spec `#semver:` NÃO tem para onde cair: `ref` não é uma ref de verdade, e
        // insistir com `ls-remote <url> semver:^1.0.0` produziria "nenhum commit" — uma
        // mensagem que descreve o sintoma errado.
        if (ref?.startsWith('semver:')) {
            return {
                ...base,
                ok: false,
                upToDate: null,
                message:
                    `[sarak:check] "${context.spec}" resolve por TAG, e não consegui compará-la agora ` +
                    '(sem rede, remoto sem nenhuma tag "vX.Y.Z", ou versão instalada ilegível).',
            };
        }
    }

    if (!context.lockfile) {
        return { ...base, ok: false, upToDate: null, message: '[sarak:check] Nenhum lockfile encontrado (deste pacote para cima). Instale as dependências primeiro.' };
    }

    const installedCommit = readInstalledCommit(fs.readFileSync(context.lockfile.full, 'utf8'), PKG_NAME);
    if (!installedCommit) {
        return {
            ...base,
            ok: false,
            upToDate: null,
            message: `[sarak:check] Não achei o commit instalado em ${context.lockfile.file} — o formato pode não ser o esperado para este gerenciador (${context.manager.name}).`,
        };
    }

    if (pinnedCommit) {
        return {
            ...base,
            upToDate: true,
            message: `[sarak:check] "${context.spec}" fixa um commit explícito no PRÓPRIO spec (${short(pinnedCommit)}) — não há HEAD remoto para comparar. Instalado: ${short(installedCommit)}.`,
        };
    }

    let remoteCommit;
    try {
        remoteCommit = execGitLsRemote(url, ref);
    } catch (err) {
        return {
            ...base,
            ok: false,
            upToDate: null,
            message: `[sarak:check] Não consegui consultar ${url} (${ref}) — verifique a rede/o acesso ao repositório.\n${err instanceof Error ? err.message : String(err)}`,
        };
    }
    if (!remoteCommit) {
        return { ...base, ok: false, upToDate: null, message: `[sarak:check] "git ls-remote" não retornou nenhum commit para ${url} (${ref}).` };
    }

    if (installedCommit === remoteCommit) {
        return { ...base, upToDate: true, message: `[sarak:check] Atualizado — instalado ${short(installedCommit)} == HEAD remoto (${ref}) ${short(remoteCommit)}.` };
    }
    return {
        ...base,
        upToDate: false,
        installedLabel: short(installedCommit),
        remoteLabel: short(remoteCommit),
        message: `[sarak:check] Desatualizado — instalado ${short(installedCommit)}, HEAD remoto (${ref}) é ${short(remoteCommit)}.\n              Para atualizar: ${command}`,
    };
};

/**
 * plan-50: rótulo PRÓPRIO (`sarak:check:cache`), nunca `[sarak:check]` — misturar os
 * dois sinais (pacote em disco × cache do bundler) no mesmo rótulo cria um terceiro
 * veredito ambíguo, exatamente o que a plan proíbe. Só aparece quando `stale`; o
 * `checked: false` nunca produz linha (ver LIMITES DECLARADOS de `bundlerCache.mjs`).
 * Nomeia CADA `.vite/deps` com referência quebrada — no monorepo pode haver mais de um
 * (um por app Vite do workspace).
 */
const bundlerCacheWarning = (bundlerCache) => {
    if (!bundlerCache?.stale) return null;
    const dirs = bundlerCache.cacheDirs.map((dir) => `                    ${dir}`).join('\n');
    return (
        `[sarak:check:cache] Aviso: ${bundlerCache.detail}\n` +
        `${dirs}\n` +
        `                    chunk(s) órfão(s): ${bundlerCache.staleRefs.join(', ')}\n` +
        '                    Derrube o(s) dev server(s) acima, apague essa(s) pasta(s), PROVE que apagou (Test-Path ⇒ False) e suba de novo.'
    );
};

export function runCheckUpdate({
    rootDir = process.cwd(),
    execGitLsRemote = defaultExecGitLsRemote,
    execGitLsRemoteTags = defaultExecGitLsRemoteTags,
} = {}) {
    const context = resolveConsumerContext({ startDir: rootDir });
    if (!context.ok) return { ok: false, upToDate: null, message: context.message };

    const result = isLocalSpec(context.spec)
        ? localResult(context, inspectLocalDependency(context))
        : gitResult(context, execGitLsRemote, execGitLsRemoteTags);

    // plan-50 correção: a busca do cache do bundler começa na raiz do WORKSPACE (o
    // diretório do lockfile, achado subindo a árvore a partir de quem declara a lib),
    // não em `rootDir` — no monorepo real, quem declara a lib nunca é quem roda o
    // Vite, e o cache vive num pacote IRMÃO, não acima de `rootDir`.
    const bundlerCache = inspectViteDepsCache({
        rootDir,
        installedDir: context.installedDir,
        workspaceRoot: context.lockfile?.dir,
    });
    const extras = [
        context.manager.ambiguous.length > 0
            ? `[sarak:check] Aviso: mais de um lockfile em ${context.manager.dir} (${context.manager.ambiguous.join(', ')}) — assumi "${context.manager.name}" (o mais recente). Um deles é resíduo.`
            : null,
        bundlerCacheWarning(bundlerCache),
    ].filter(Boolean);

    return {
        ...result,
        bundlerCache,
        message: extras.length > 0 ? [result.message, ...extras].join('\n') : result.message,
    };
}

