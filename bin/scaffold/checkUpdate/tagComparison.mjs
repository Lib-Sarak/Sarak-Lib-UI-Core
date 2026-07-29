/**
 * Comparação por TAG do `sarak-ui check` (ADR-008) — companion de `runCheckUpdate.mjs`.
 *
 * Existe separado porque o `runCheckUpdate` já carrega três modos (git por commit,
 * git por tag, `file:`/`link:`) e passaria do teto de linhas do padrão. A fronteira é
 * limpa: aqui mora a POLÍTICA de "quem é a versão publicada e como ela se compara com
 * a instalada"; o parsing cru das refs mora em `semverTags.mjs`.
 */
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { readJsonNoBom } from './consumerContext.mjs';
import { compareVersions, greatestTag, parseTag, parseTagRefs, parseVersion } from './semverTags.mjs';

/**
 * Teto de espera da consulta remota — o mesmo do `ls-remote` de commit, e pelo mesmo
 * motivo: isto roda no `predev` do consumidor, e rede ruim não pode virar dev travado.
 */
const GIT_TIMEOUT_MS = 3000;

/** As tags de release do remoto, cruas. Injetável em teste (evita rede). */
export const defaultExecGitLsRemoteTags = (url) =>
    execFileSync('git', ['ls-remote', '--tags', url], {
        encoding: 'utf8',
        timeout: GIT_TIMEOUT_MS,
        stdio: ['ignore', 'pipe', 'ignore'],
    });

/**
 * A versão que o consumidor de fato tem instalada — lida do `package.json` do pacote
 * em `node_modules`, não do lockfile. O lockfile guarda o COMMIT resolvido; quem
 * responde "que versão é esta?" é o artefato instalado.
 */
const readInstalledVersion = (installedDir) => {
    if (!installedDir) return null;
    try {
        return readJsonNoBom(path.join(installedDir, 'package.json')).version ?? null;
    } catch {
        return null;
    }
};

/**
 * O MAJOR que a faixa do consumidor admite — `#semver:^1.2.3`, `~1.2.0` e `1.x` → `1`.
 *
 * Existe para o aviso não virar ruído permanente: quem escreveu `^1.0.0` **não recebe**
 * um `v2.0.0` por `npm update`, então anunciá-lo seria mandar rodar um comando que não
 * resolve nada — e um aviso que nunca some é um aviso que se aprende a ignorar (é o
 * contrato de ruído da Spec 51).
 *
 * Limite declarado: só o MAJOR é lido. Uma faixa que não o fixa (`>=1.0.0`, `*`) devolve
 * `null` e nada é filtrado — trazer um resolvedor de faixa semver inteiro para dentro do
 * pacote custaria mais do que o caso marginal vale.
 */
const majorDaFaixa = (spec) => {
    const fragmento = spec.includes('#') ? spec.slice(spec.indexOf('#') + 1) : '';
    if (!fragmento.startsWith('semver:')) return null;
    const match = /^[\^~]?(\d+)\./.exec(fragmento.slice('semver:'.length).trim());
    return match ? Number(match[1]) : null;
};

/**
 * @returns {object|null} `null` quando NÃO dá para decidir por tag: remoto sem nenhuma
 * `vX.Y.Z`, versão instalada ilegível, ou consulta que falhou. Nesses casos quem
 * responde é a comparação por commit — o modo pré-tag, que continua suportado porque
 * `github:` puro continua suportado.
 */
export const compareByTag = ({ base, context, url, execGitLsRemoteTags }) => {
    const instalada = parseVersion(readInstalledVersion(context.installedDir) ?? '');
    if (!instalada) return null;

    let refs;
    try {
        refs = execGitLsRemoteTags(url);
    } catch {
        return null;
    }

    const major = majorDaFaixa(context.spec);
    const candidatas = parseTagRefs(refs).filter((tag) => {
        if (major === null) return true;
        const version = parseTag(tag);
        return version !== null && version[0] === major;
    });

    const maior = greatestTag(candidatas);
    if (!maior) return null;

    const instaladoLabel = `v${instalada.join('.')}`;
    if (compareVersions(maior.version, instalada) <= 0) {
        const dentroDaFaixa = major === null ? '' : ` dentro da faixa do seu package.json (^${major})`;
        return {
            ...base,
            upToDate: true,
            message: `[sarak:check] Atualizado — ${instaladoLabel} é a maior versão publicada${dentroDaFaixa} (${maior.tag}).`,
        };
    }
    return {
        ...base,
        upToDate: false,
        installedLabel: instaladoLabel,
        remoteLabel: maior.tag,
        message:
            `[sarak:check] Desatualizado — instalado ${instaladoLabel}, publicado ${maior.tag}.\n` +
            `              Para atualizar: ${base.command}`,
    };
};
