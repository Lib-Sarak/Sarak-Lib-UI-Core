/**
 * ANEL DE PUSH — "o artefato publicado mudou e não há tag nova"
 * (ADR-008; spec `specs/specs/02-enforcement-por-commit.md`).
 *
 * Por que existe: **zero tags em 331 commits.** O problema nunca foi não saber taggear,
 * foi ESQUECER — e o preço do esquecimento é o consumidor preso commits atrás em
 * silêncio, porque `#semver:` não tem tag a que se agarrar.
 *
 * O gatilho é **"o artefato publicado mudou"**, não "houve commit": neste repositório
 * todo trabalho acontece direto na `main`, e taggear por commit produziria centenas de
 * tags até o número virar contador de build. Commit que só mexe em `specs/` não muda
 * artefato, não pede tag e não incomoda ninguém.
 *
 * O nível do bump é **SUGERIDO**, nunca decidido: os 8 commits mais recentes deste
 * repositório são todos `feat:` — inclusive remoções e correções —, então derivar o
 * nível da mensagem diria `minor` sempre, e um dia diria `minor` num breaking. Tag
 * errada é pior que tag ausente.
 *
 * Uso:
 *   - como hook: `.githooks/pre-push` repassa o stdin do git (protocolo pre-push);
 *   - à mão:     `npm run release:check` (avalia o HEAD atual).
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que este gate NÃO vê
 * -------------------------------------------------------------------------
 * Só push para `refs/heads/main`; só `dist/` + `sarak-ui/` (`SIGNED_DIRS`)
 * contam como "artefato publicado" — mudança em `bin/` ou `docs/` sozinha
 * não pede tag. NÃO decide o nível do bump, só sugere. Repositório sem tag
 * nenhuma não bloqueia (nada para comparar ainda).
 * -------------------------------------------------------------------------
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { SIGNED_DIRS, hashInventoryLines } from '../../../bin/scaffold/checkUpdate/localDependency.mjs';

/** Só a `main` publica. Push de branch de trabalho não pede tag. */
const RELEASE_BRANCH_REF = 'refs/heads/main';
const ZERO_SHA = /^0+$/;

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();

/**
 * O stdin do `pre-push`: `<ref local> <sha local> <ref remota> <sha remoto>` por linha.
 * Rodando à mão não há stdin — `readFileSync(0)` estoura e o fallback é o HEAD.
 */
const lerStdin = () => {
    try {
        return fs.readFileSync(0, 'utf8');
    } catch {
        return '';
    }
};

/** @returns {string|null} o sha que está sendo empurrado para a `main`, se houver. */
const shaEmpurradoParaMain = (stdin) => {
    if (stdin.trim() === '') return 'HEAD';
    for (const linha of stdin.split('\n')) {
        const [, shaLocal, refRemota] = linha.trim().split(/\s+/);
        if (refRemota !== RELEASE_BRANCH_REF) continue;
        if (!shaLocal || ZERO_SHA.test(shaLocal)) continue; // deleção de ref
        return shaLocal;
    }
    return null;
};

/** Maior tag `vX.Y.Z` do repositório, por ordenação de versão (não alfabética). */
const ultimaTag = () => {
    const saida = git('for-each-ref', '--sort=-v:refname', '--format=%(refname:short)', 'refs/tags/v*');
    return saida === '' ? null : saida.split('\n')[0].trim();
};

/**
 * Inventário `caminho:tamanho` do artefato publicado NUMA REF do git — a contraparte
 * da leitura em disco de `localDependency.mjs`, com o mesmo formato de linha.
 * `git ls-tree -r -l` devolve `<modo> blob <sha> <tamanho>\t<caminho>`.
 */
const inventarioDaRef = (ref) => {
    const saida = git('ls-tree', '-r', '-l', ref, '--', ...SIGNED_DIRS);
    if (saida === '') return [];
    return saida.split('\n').map((linha) => {
        const [meta, caminho] = linha.split('\t');
        const tamanho = meta.trim().split(/\s+/)[3];
        return `${caminho}:${tamanho}`;
    });
};

const assinatura = (ref) => hashInventoryLines(inventarioDaRef(ref));

/**
 * SUGESTÃO de nível, lida dos commits desde a última tag. Explicitamente falível — é
 * por isso que o texto que a acompanha diz "sugestão" e o comando não é executado.
 */
const nivelSugerido = (tag, alvo) => {
    let mensagens = '';
    try {
        mensagens = git('log', `${tag}..${alvo}`, '--format=%s%n%b');
    } catch {
        return 'patch';
    }
    if (/BREAKING[ -]CHANGE|^\w+(\([^)]*\))?!:/m.test(mensagens)) return 'major';
    if (/^feat(\([^)]*\))?:/m.test(mensagens)) return 'minor';
    return 'patch';
};

const bloquear = ({ tag, alvo, assinaturaTag, assinaturaAlvo }) => {
    const nivel = nivelSugerido(tag, alvo);
    console.error('');
    console.error('⛔ PUSH BLOQUEADO — o artefato publicado mudou desde a última tag, e não há tag nova.');
    console.error('');
    console.error(`   última tag : ${tag}   (${SIGNED_DIRS.join(' + ')} → ${assinaturaTag})`);
    console.error(`   a empurrar : ${alvo}  (${SIGNED_DIRS.join(' + ')} → ${assinaturaAlvo})`);
    console.error('');
    console.error('   Quem instala com "#semver:^X.Y.Z" resolve por TAG. Sem tag nova, o consumidor');
    console.error('   fica no artefato antigo — em silêncio. É o incidente do ADR-007, de novo.');
    console.error('');
    console.error('   Emita o release (ele roda os gates, regenera dist/ + sarak-ui/ no MESMO commit,');
    console.error('   cria a tag e empurra):');
    console.error('');
    console.error(`       npm version <major|minor|patch>      # sugestão desta faixa: ${nivel}`);
    console.error('');
    console.error('   A SUGESTÃO acima vem das mensagens de commit e NÃO é uma decisão — quem escolhe');
    console.error('   o nível é você (ADR-008 §2.2). Se este push não é um release, use --no-verify.');
    console.error('');
    process.exit(1);
};

const main = () => {
    const alvo = shaEmpurradoParaMain(lerStdin());
    if (alvo === null) {
        console.log('[release:check] nada sendo empurrado para main — nada a cobrar.');
        return;
    }

    const tag = ultimaTag();
    if (tag === null) {
        console.log('[release:check] o repositório ainda não tem nenhuma tag "v*" — nada a comparar.');
        console.log('               Assim que existir a primeira, este anel passa a cobrar as seguintes.');
        return;
    }

    const tagsNoAlvo = git('tag', '--points-at', alvo, '--list', 'v*');
    if (tagsNoAlvo !== '') {
        console.log(`[release:check] OK — o commit empurrado JÁ carrega tag (${tagsNoAlvo.split('\n').join(', ')}).`);
        return;
    }

    const assinaturaTag = assinatura(tag);
    const assinaturaAlvo = assinatura(alvo);
    if (assinaturaTag === assinaturaAlvo) {
        console.log(`[release:check] OK — o artefato publicado é idêntico ao de ${tag} (${assinaturaAlvo}). Nenhuma tag devida.`);
        return;
    }

    bloquear({ tag, alvo, assinaturaTag, assinaturaAlvo });
};

main();
