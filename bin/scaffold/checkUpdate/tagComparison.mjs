/**
 * Comparação por TAG do `sarak-ui check`/`update` (ADR-008) — companion de
 * `runCheckUpdate.mjs` e de `updatePlan.mjs` (plan-10, o comando que AGE em vez de só
 * avisar).
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
 *
 * Exportada: `update`/`updatePlan.mjs` (plan-10) precisa da MESMA leitura para decidir
 * quantos majors pula — uma segunda leitura divergiria em silêncio se algum dia os
 * dois formatos discordassem.
 */
export const readInstalledVersion = (installedDir) => {
    if (!installedDir) return null;
    try {
        return readJsonNoBom(path.join(installedDir, 'package.json')).version ?? null;
    } catch {
        return null;
    }
};

/**
 * A faixa que o consumidor admite — `#semver:^1.2.3` → `{ operador:'^', major:1, minor:2 }`;
 * `#semver:~1.2.0` → `{ operador:'~', major:1, minor:2 }`.
 *
 * Existe para o aviso não virar ruído permanente: quem escreveu `^1.0.0` **não recebe**
 * um `v2.0.0` por `npm update`, então anunciá-lo seria mandar rodar um comando que não
 * resolve nada — e um aviso que nunca some é um aviso que se aprende a ignorar (é o
 * contrato de ruído da Spec 51).
 *
 * ⚠️ **Correção de plan-10** (achado da própria plan, `tagComparison.mjs:54-59` do
 * estado anterior): antes só o MAJOR era lido, então `~1.2.0` era tratado como
 * `^1.2.0` — o consumidor recebia aviso de um `v1.9.0` que o `npm update` dele NUNCA
 * entregaria, porque `~` só sobe PATCH. `^` continua filtrando só por MAJOR (é o que a
 * faixa promete: qualquer minor/patch do major serve); `~` passa a filtrar por MAJOR
 * **e** MINOR (só patch novo serve).
 *
 * Limite declarado, mantido: faixa que não fixa major (`>=1.0.0`, `*`) devolve `null` e
 * nada é filtrado — trazer um resolvedor de faixa semver inteiro para dentro do pacote
 * custaria mais do que o caso marginal vale.
 */
export const faixaDoConsumidor = (spec) => {
    const fragmento = spec.includes('#') ? spec.slice(spec.indexOf('#') + 1) : '';
    if (!fragmento.startsWith('semver:')) return null;
    const match = /^(\^|~)?(\d+)\.(\d+)\./.exec(fragmento.slice('semver:'.length).trim());
    if (!match) return null;
    const [, operador = '^', major, minor] = match;
    return { operador, major: Number(major), minor: Number(minor) };
};

/** Tags `vX.Y.Z` cruas que sobrevivem à faixa — `faixa === null` devolve a lista inteira. */
export const filterTagsByFaixa = (tags, faixa) =>
    tags.filter((tag) => {
        if (faixa === null) return true;
        const version = parseTag(tag);
        if (version === null || version[0] !== faixa.major) return false;
        return faixa.operador === '~' ? version[1] === faixa.minor : true;
    });

/** Rótulo humano da faixa — `(^1)` para quem escreveu `^`, `(~1.2)` para quem escreveu `~`. */
export const rotuloFaixa = (faixa) => (faixa.operador === '~' ? `~${faixa.major}.${faixa.minor}` : `^${faixa.major}`);

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

    const faixa = faixaDoConsumidor(context.spec);
    const candidatas = filterTagsByFaixa(parseTagRefs(refs), faixa);

    const maior = greatestTag(candidatas);
    if (!maior) return null;

    const instaladoLabel = `v${instalada.join('.')}`;
    if (compareVersions(maior.version, instalada) <= 0) {
        const dentroDaFaixa = faixa === null ? '' : ` dentro da faixa do seu package.json (${rotuloFaixa(faixa)})`;
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
