#!/usr/bin/env node
/**
 * `sarak-ui update [--latest] [--yes]` (plan-10) — o comando que faltava. `check`
 * (Spec 51) só avisa; dentro da faixa o consumidor já descobria sozinho que era
 * `npm update`, mas **atravessar um major** exigia editar o `package.json` à mão, sem
 * ninguém dizer o que quebra — foi exatamente onde o dono travou subindo um
 * consumidor real de `3.0.0` para `4.0.0`.
 *
 * Duas metades:
 *  - sem `--latest`: atualiza DENTRO da faixa (ou, sem faixa declarada, dentro do
 *    MAJOR já instalado — nunca atravessa sozinho), com o comando do gerenciador já
 *    validado por `packageManager.mjs`. Nunca reescreve o spec.
 *  - com `--latest`: mostra quantos majors pula e as notas de `docs/migracoes.md`
 *    ENTRE a versão instalada e a mais nova, pede confirmação, e só então reescreve a
 *    faixa e roda o comando de atualização para o major alvo.
 *
 * REGRA DURA (herdada da Spec 51): comando não validado para o gerenciador nunca é
 * executado — degrada para instrução genérica. O `refresh` roda de todo jeito ao
 * final: a lib pode ter sido atualizada por fora, e o kit não pode ficar velho por
 * causa disso (mesmo comportamento do `sarak:update` gerado — `packageJsonFields.mjs`).
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { PKG_NAME, resolveConsumerContext } from './checkUpdate/consumerContext.mjs';
import { isLocalSpec, inspectLocalDependency } from './checkUpdate/localDependency.mjs';
import { resolveRemoteUrl } from './checkUpdate/resolveRemoteUrl.mjs';
import { compareVersions } from './checkUpdate/semverTags.mjs';
import { defaultExecGitLsRemoteTags } from './checkUpdate/tagComparison.mjs';
import { resolveUpdatePlan } from './checkUpdate/updatePlan.mjs';
import { extractMigrationNotes } from './checkUpdate/migrationNotes.mjs';
import { bumpSpecMajor, rewritePackageJsonDependency } from './checkUpdate/rewriteRange.mjs';
import { confirm } from './checkUpdate/confirmPrompt.mjs';
import { escapeCaretForWindowsShell } from './checkUpdate/shellEscape.mjs';
import { gitUpdateCommand, localRefreshCommand } from './packageManager.mjs';
import { runRefreshKit } from './refreshKit/runRefreshKit.mjs';

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const defaultExecCommand = (command, cwd) => execSync(escapeCaretForWindowsShell(command), { cwd, stdio: 'inherit' });

const pluraliza = (n, singular, plural) => `${n} ${n === 1 ? singular : plural}`;

/** Roda um comando REAL de gerenciador, ou degrada (Spec 51 — regra dura). */
function runManagerCommand({ command, validated, cwd, execCommand, verb }) {
    if (!command || !validated) {
        return {
            lines: [
                `[sarak:update] Comando não validado para este gerenciador — não vou rodar um chute.`,
                `              Rode você mesmo: ${verb}.`,
            ],
            exitCode: 1,
        };
    }
    execCommand(command, cwd);
    return { lines: [`[sarak:update] Executado: ${command}`], exitCode: 0 };
}

/** A dependência é `file:`/`link:` — não há major para pular, `--latest` não se aplica. */
function updateLocal({ context, cwd, execCommand }) {
    const inspection = inspectLocalDependency(context);
    if (inspection.kind === 'live') {
        return { lines: [`[sarak:update] "${context.spec}" é link vivo — reflete o disco na hora, nada a atualizar.`], exitCode: 0 };
    }
    const { command, validated } = localRefreshCommand({ manager: context.manager.name, packageName: context.packageName });
    return runManagerCommand({ command, validated, cwd, execCommand, verb: 'reinstale a dependência local do gerenciador deste projeto' });
}

function printCrossingSummary({ plan, bounded, notes, output }) {
    const cabecalho = `v${plan.installed.join('.')} → ${plan.latest.tag} — ${pluraliza(plan.majorsSkipped, 'major pulado', 'majors pulados')}.`;
    output.write(`\n[sarak:update --latest] ${cabecalho}\n\n`);
    if (!bounded) {
        output.write(
            '[sarak:update --latest] Não achei, em docs/migracoes.md, a entrada que ancora a SUA versão ' +
                'instalada — seguem TODAS as notas registradas (pode haver mudanças anteriores à sua versão ' +
                'misturadas aqui).\n\n',
        );
    }
    if (notes.length === 0) {
        output.write('[sarak:update --latest] Nenhuma nota de migração registrada em docs/migracoes.md.\n\n');
        return;
    }
    for (const note of notes) output.write(`${note}\n\n---\n\n`);
}

async function confirmLatestCrossing({ plan, packageRoot, yes, input, output }) {
    const migracoesText = fs.readFileSync(path.join(packageRoot, 'docs', 'migracoes.md'), 'utf8');
    const { bounded, notes } = extractMigrationNotes({ migracoesText, installedMajor: plan.installed[0] });
    printCrossingSummary({ plan, bounded, notes, output });
    const pergunta = `Atravessar ${pluraliza(plan.majorsSkipped, 'major', 'majors')} e reescrever a faixa para "${plan.latest.tag}". Confirmar?`;
    return confirm({ question: pergunta, input, output, yes });
}

/** Reescreve a faixa no `package.json` do consumidor; devolve o spec NOVO (já ajustado). */
function rewriteConsumerRange({ context, novoMajor }) {
    const packageJsonPath = path.join(context.packageDir, 'package.json');
    const novoSpec = bumpSpecMajor(context.spec, novoMajor);
    if (novoSpec === context.spec) return context.spec;
    const texto = fs.readFileSync(packageJsonPath, 'utf8');
    const novoTexto = rewritePackageJsonDependency({ text: texto, pkgName: PKG_NAME, oldSpec: context.spec, newSpec: novoSpec });
    fs.writeFileSync(packageJsonPath, novoTexto);
    return novoSpec;
}

/** `{ ok:false, ... }` num formato de RESULTADO (`{lines,exitCode}`) — ou `{ ok:true, plan }`. */
async function fetchUpdatePlan({ context, execGitLsRemoteTags }) {
    const { url, pinnedCommit } = resolveRemoteUrl(context.spec);
    if (pinnedCommit) {
        return {
            ok: false,
            lines: [`[sarak:update] "${context.spec}" fixa um commit explícito — não há versão para "update" mirar. Edite o package.json à mão para trocar de commit.`],
            exitCode: 0,
        };
    }

    let refsCrus;
    try {
        refsCrus = execGitLsRemoteTags(url);
    } catch (err) {
        return { ok: false, lines: [`[sarak:update] Não consegui consultar as tags de ${url}.\n${err instanceof Error ? err.message : String(err)}`], exitCode: 1 };
    }

    const plan = resolveUpdatePlan({ context, refsCrus });
    if (!plan.ok) return { ok: false, lines: [plan.message], exitCode: 1 };
    return { ok: true, plan };
}

/**
 * Confirma e reescreve a faixa quando `--latest` atravessa major; devolve o spec a
 * reinstalar. `null` quando o usuário recusou ou o guard de TTY falhou — nos dois
 * casos já devolve o RESULTADO pronto em `recusado`.
 */
async function resolveSpecToReinstall({ context, plan, latest, packageRoot, yes, input, output }) {
    if (!latest || plan.majorsSkipped === 0) return { spec: context.spec };

    let confirmado;
    try {
        confirmado = await confirmLatestCrossing({ plan, packageRoot, yes, input, output });
    } catch (err) {
        // Mesmo guard de TTY do `init` (`prompts.mjs`): falha em voz alta em vez de ficar
        // pendurado — mas aqui vira RESULTADO, não exceção, para o chamador (CLI ou teste)
        // não precisar de um try/catch extra só para este caminho.
        return { recusado: { lines: [err instanceof Error ? err.message : String(err)], exitCode: 1 } };
    }
    if (!confirmado) return { recusado: { lines: ['[sarak:update --latest] Cancelado — a faixa não foi alterada.'], exitCode: 0 } };
    return { spec: rewriteConsumerRange({ context, novoMajor: plan.latest.version[0] }) };
}

async function updateGit({ context, cwd, packageRoot, latest, yes, execGitLsRemoteTags, execCommand, input, output }) {
    const fetched = await fetchUpdatePlan({ context, execGitLsRemoteTags });
    if (!fetched.ok) return { lines: fetched.lines, exitCode: fetched.exitCode };
    const { plan } = fetched;

    const alvo = latest ? plan.latest : plan.inRange;
    if (!alvo || compareVersions(alvo.version, plan.installed) <= 0) {
        const escopo = latest ? 'publicada' : 'dentro da faixa';
        return { lines: [`[sarak:update] Já está atualizado — v${plan.installed.join('.')} é a maior versão ${escopo}.`], exitCode: 0 };
    }

    const { spec: specParaReinstalar, recusado } = await resolveSpecToReinstall({ context, plan, latest, packageRoot, yes, input, output });
    if (recusado) return recusado;

    const { command, validated } = gitUpdateCommand({ manager: context.manager.name, packageName: PKG_NAME, gitSpec: specParaReinstalar });
    const resultado = runManagerCommand({ command, validated, cwd, execCommand, verb: `reinstale "${PKG_NAME}" com o gerenciador deste projeto, na faixa "${specParaReinstalar}"` });
    resultado.lines.unshift(`[sarak:update] Alvo: ${alvo.tag}.`);
    return resultado;
}

/** Roda o `refresh` de todo jeito ao final — nunca derruba o resultado do `update`. */
function runRefreshAfterUpdate({ cwd, packageRoot }) {
    const result = runRefreshKit({ rootDir: cwd, packageRoot });
    if (result.status === 'sem-kit') return '[sarak:update] kit `sarak-ui/` não veio nesta versão — nada a re-sincronizar.';
    return `[sarak:update] kit re-sincronizado: ${result.refreshed.join(', ')}.`;
}

export async function runUpdate({
    cwd = process.cwd(),
    packageRoot = PACKAGE_ROOT,
    latest = false,
    yes = false,
    execGitLsRemoteTags = defaultExecGitLsRemoteTags,
    execCommand = defaultExecCommand,
    input = process.stdin,
    output = process.stdout,
} = {}) {
    const context = resolveConsumerContext({ startDir: cwd });
    if (!context.ok) return { output: context.message, exitCode: 1 };

    const resultado = isLocalSpec(context.spec)
        ? updateLocal({ context, cwd, execCommand })
        : await updateGit({ context, cwd, packageRoot, latest, yes, execGitLsRemoteTags, execCommand, input, output });

    if (resultado.exitCode === 0) resultado.lines.push(runRefreshAfterUpdate({ cwd, packageRoot }));
    return { output: resultado.lines.join('\n'), exitCode: resultado.exitCode };
}

export async function runUpdateCli({ argv = [], cwd = process.cwd(), packageRoot = PACKAGE_ROOT } = {}) {
    const latest = argv.includes('--latest');
    const yes = argv.includes('--yes');
    try {
        return await runUpdate({ cwd, packageRoot, latest, yes });
    } catch (err) {
        return { output: `[sarak:update] Falhou: ${err instanceof Error ? err.message : String(err)}`, exitCode: 1 };
    }
}

const isDirectRun = process.argv[1] && process.argv[1].endsWith('runUpdate.mjs');
if (isDirectRun) {
    const { output, exitCode } = await runUpdateCli({ argv: process.argv.slice(2) });
    if (output) console.log(output);
    process.exitCode = exitCode;
}
