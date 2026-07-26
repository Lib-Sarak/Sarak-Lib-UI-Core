/**
 * `sarak-ui check` (Spec 39 follow-up, reescrito pela Spec 51).
 *
 * Responde "o consumidor está atualizado?" nos DOIS modos de dependência e devolve,
 * junto, o COMANDO certo para o gerenciador daquele projeto:
 *  - **git spec** — commit instalado (`resolved` do lockfile) × HEAD remoto (`git ls-remote`);
 *  - **`file:`/`link:`** — assinatura de build instalada × a do repositório em disco
 *    (`localDependency.mjs`), porque aqui não existe commit remoto para comparar.
 *
 * O que a Spec 51 mudou: o contexto é resolvido subindo a árvore (monorepo funciona),
 * `file:` deixou de ser tratado como erro, o comando sugerido deixou de ser npm cru, e
 * há um modo `--notify` que **nunca falha e nunca fala à toa** (§ `formatNotice`).
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
import { gitUpdateCommand, localRefreshCommand } from '../packageManager.mjs';
import { renderNotice } from './renderNotice.mjs';

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

const gitResult = (context, execGitLsRemote) => {
    const { command, validated } = gitUpdateCommand({
        manager: context.manager.name,
        packageName: PKG_NAME,
        gitSpec: context.spec,
    });
    const base = { ok: true, mode: 'git', manager: context.manager, command, commandValidated: validated };

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

    const { url, ref, pinnedCommit } = resolveRemoteUrl(context.spec);
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

export function runCheckUpdate({ rootDir = process.cwd(), execGitLsRemote = defaultExecGitLsRemote } = {}) {
    const context = resolveConsumerContext({ startDir: rootDir });
    if (!context.ok) return { ok: false, upToDate: null, message: context.message };

    const result = isLocalSpec(context.spec)
        ? localResult(context, inspectLocalDependency(context))
        : gitResult(context, execGitLsRemote);

    if (context.manager.ambiguous.length > 0) {
        return {
            ...result,
            message: `${result.message}\n[sarak:check] Aviso: mais de um lockfile em ${context.manager.dir} (${context.manager.ambiguous.join(', ')}) — assumi "${context.manager.name}" (o mais recente). Um deles é resíduo.`,
        };
    }
    return result;
}

/**
 * Modo `--notify` (o pedido do dono): a saída que o `predev` do consumidor imprime.
 * **Silêncio absoluto** quando está em dia, quando é link vivo, quando a verificação
 * não pôde ser feita (offline, sem git, sem lockfile) — qualquer coisa que não seja
 * "existe versão nova E há um comando a rodar". Devolve `null` para "não imprima nada".
 */
export function formatNotice(result) {
    if (!result || result.upToDate !== false) return null;

    // Uma informação por linha: caminho do Windows é longo e estoura qualquer coluna.
    const linhas =
        result.mode === 'local'
            ? [
                  'A biblioteca em disco mudou desde a sua última instalação:',
                  `  ${result.sourceDir}`,
                  '',
                  `  instalado: ${result.installedLabel}`,
                  `  em disco:  ${result.remoteLabel}`,
              ]
            : [
                  'Há uma versão nova da biblioteca.',
                  '',
                  `  instalado:   ${result.installedLabel}`,
                  `  disponível:  ${result.remoteLabel}`,
              ];

    return renderNotice({
        titulo: `@sarak/lib-ui-core — atualização disponível`,
        linhas,
        comando: result.command,
        comandoValidado: result.commandValidated !== false,
    });
}
