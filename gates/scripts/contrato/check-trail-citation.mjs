// R36 — o código não cita o rastro de execução. Comentário, string ou nome novo
// em src/, gates/, scripts/ ou bin/ não cita "plan-NN", "veredito de" nem "achado
// N" solto: a plan sai do disco na síntese e a citação vira ponteiro morto. Gate
// sobre o DIFF, não sobre o repositório inteiro — o legado que já cita plan não é
// tocado (specs/specs/00-regras-e-invariantes.md, R36).
//
// -------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que este gate NÃO vê
// -------------------------------------------------------------------------
// 1. NÃO roda na CI — o runner não tem staging (mesma razão do Anel 0,
//    specs/specs/02-enforcement-por-commit.md §9), e um intervalo de commits
//    incluiria histórico anterior ao gate.
// 2. SÓ vê linha ADICIONADA. As 505 citações já existentes no repositório na
//    data em que este gate nasceu não são cobradas — é a troca deliberada
//    para fechar a classe daqui para frente sem exigir limpar o legado antes.
// 3. NÃO varre documento — specs/, docs/, .agents/ ficam fora do escopo por
//    desenho: prosa que narra procedência (ex.: docs/migracoes.md) não é o
//    defeito que esta regra combate.
// 4. É TEXTUAL, não por AST: string de teste, comentário e nome contam igual.
//    Um teste que afirma um valor citando "plan-12" pesa o mesmo que um
//    comentário de autoria.
// 5. NÃO enxerga outra forma de apontar para o rastro de execução, como "na
//    campanha anterior" ou "no ciclo passado" — só os três padrões textuais
//    fixos (plan-N, veredito de, achado N sem 15-divida-conhecida).
// 6. A isenção da allowlist vale para o ARQUIVO INTEIRO, não só para o trecho
//    que a justificou. Qualquer linha adicionada num arquivo isento passa
//    sem ser vista — nome de teste, comentário ou string, mesmo que não
//    tenha nada a ver com o motivo declarado da isenção.
// -------------------------------------------------------------------------
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TRAIL_CITATION_EXCLUSIONS } from '../../allowlists/trailCitationExclusions.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const SCOPE_DIRS = ['src', 'gates', 'scripts', 'bin'];
const SCOPE_RE = /^(?:src|gates|scripts|bin)\//;

const PLAN_RE = /plan-\d/i;
const VEREDITO_RE = /veredito de/i;
const ACHADO_RE = /achado\D{0,4}\d/i;
const DIVIDA_CONHECIDA_RE = /15-divida-conhecida/i;

function casaPadrao(conteudo) {
    if (PLAN_RE.test(conteudo)) return 'plan-N';
    if (VEREDITO_RE.test(conteudo)) return 'veredito de';
    if (ACHADO_RE.test(conteudo) && !DIVIDA_CONHECIDA_RE.test(conteudo)) return 'achado N';
    return null;
}

// `-c core.quotePath=false` desliga o escape de caminho não-ASCII (aspas +
// octal, ex.: "b/src/Relat\303\263rio.ts") independente do config do
// repositório de origem — sem isto, `+++ b/…` e `ls-files` devolvem o nome
// citado e escapado, e nem o parser do diff nem o `path.join` de baixo
// reconhecem o arquivo.
function rodarGit(args, cwd) {
    const resultado = spawnSync('git', ['-c', 'core.quotePath=false', ...args], {
        cwd,
        encoding: 'utf8',
        maxBuffer: 1024 * 1024 * 64,
    });
    if (resultado.status !== 0) {
        throw new Error(`git ${args.join(' ')} falhou: ${resultado.stderr || resultado.stdout}`);
    }
    return resultado.stdout || '';
}

// -U0: só linhas realmente adicionadas/removidas aparecem no corpo do hunk —
// sem contexto, então "+" é sempre adição de verdade e "-" é sempre remoção.
function extrairLinhasAdicionadas(diffTexto) {
    const adicoes = [];
    let arquivoAtual = null;
    let proximaLinhaNova = null;

    for (const linha of diffTexto.split('\n')) {
        const cabecalhoArquivo = linha.match(/^\+\+\+ b\/(.+)$/);
        if (cabecalhoArquivo) {
            arquivoAtual = cabecalhoArquivo[1];
            continue;
        }
        const cabecalhoHunk = linha.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
        if (cabecalhoHunk) {
            proximaLinhaNova = Number(cabecalhoHunk[1]);
            continue;
        }
        if (!arquivoAtual || proximaLinhaNova === null) continue;
        if (linha.startsWith('+') && !linha.startsWith('+++')) {
            adicoes.push({ arquivo: arquivoAtual, linha: proximaLinhaNova, conteudo: linha.slice(1) });
            proximaLinhaNova += 1;
        }
        // "-" é remoção: não consome numeração da versão nova e nunca é acusada.
    }
    return adicoes;
}

function listarArquivosNaoRastreados(cwd) {
    const saida = rodarGit(['ls-files', '--others', '--exclude-standard', '--', ...SCOPE_DIRS], cwd);
    return saida.split('\n').map((l) => l.trim()).filter(Boolean);
}

function extrairLinhasDeArquivoNaoRastreado(cwd, relPath) {
    const conteudo = fs.readFileSync(path.join(cwd, relPath), 'utf8');
    return conteudo.split('\n').map((texto, indice) => ({ arquivo: relPath, linha: indice + 1, conteudo: texto }));
}

/**
 * @param {{cwd?: string, staged?: boolean}} opcoes
 * @returns {{violacoes: Array<{arquivo: string, linha: number, conteudo: string, padrao: string}>}}
 */
export function checkTrailCitation({ cwd = ROOT, staged = false } = {}) {
    const diffArgs = staged
        ? ['diff', '--cached', '--unified=0', '--diff-filter=ACMR', '--', ...SCOPE_DIRS]
        : ['diff', 'HEAD', '--unified=0', '--diff-filter=ACMR', '--', ...SCOPE_DIRS];
    const diffTexto = rodarGit(diffArgs, cwd);
    const candidatas = extrairLinhasAdicionadas(diffTexto);

    if (!staged) {
        for (const relPath of listarArquivosNaoRastreados(cwd)) {
            candidatas.push(...extrairLinhasDeArquivoNaoRastreado(cwd, relPath));
        }
    }

    const violacoes = [];
    for (const { arquivo, linha, conteudo } of candidatas) {
        if (!SCOPE_RE.test(arquivo)) continue;
        if (Object.prototype.hasOwnProperty.call(TRAIL_CITATION_EXCLUSIONS, arquivo)) continue;
        const padrao = casaPadrao(conteudo);
        if (padrao) violacoes.push({ arquivo, linha, conteudo: conteudo.trim(), padrao });
    }
    return { violacoes };
}

// A allowlist promete (próprio cabeçalho): motivo obrigatório, e exclusão
// obsoleta (arquivo que não existe mais) reprova o gate — mesmo idioma de
// `barrelExclusions.mjs`. Sem esta função a promessa era só texto: uma
// entrada sem motivo ou de arquivo removido alargava a isenção em silêncio.
/**
 * @param {{exclusions?: Record<string,string>, root?: string}} opcoes
 * @returns {{invalidas: Array<{arquivo: string, problema: string}>}}
 */
export function checkTrailCitationExclusions({ exclusions = TRAIL_CITATION_EXCLUSIONS, root = ROOT } = {}) {
    const invalidas = [];
    for (const [arquivo, motivo] of Object.entries(exclusions)) {
        if (typeof motivo !== 'string' || motivo.trim().length === 0) {
            invalidas.push({ arquivo, problema: 'motivo vazio' });
            continue;
        }
        if (!fs.existsSync(path.join(root, arquivo))) {
            invalidas.push({ arquivo, problema: 'arquivo não existe (exclusão obsoleta)' });
        }
    }
    return { invalidas };
}

function main() {
    const staged = process.argv.includes('--staged');
    console.log(`--- check-trail-citation (R36${staged ? ' · --staged' : ''}) ---`);
    const { invalidas } = checkTrailCitationExclusions();
    const { violacoes } = checkTrailCitation({ cwd: ROOT, staged });

    if (invalidas.length === 0 && violacoes.length === 0) {
        console.log('\n[OK] Nenhuma linha adicionada cita plan, veredito ou achado de veredito.');
        process.exit(0);
    }

    if (invalidas.length > 0) {
        console.log(`\n[ERROR] ${invalidas.length} entrada(s) da allowlist inválida(s):`);
        invalidas.forEach(({ arquivo, problema }) => console.log(`  - ${arquivo}: ${problema}`));
    }
    if (violacoes.length > 0) {
        console.log(`\n[ERROR] ${violacoes.length} linha(s) adicionada(s) citam o rastro de execução:`);
        violacoes.forEach(({ arquivo, linha, conteudo, padrao }) => {
            console.log(`  - ${arquivo}:${linha} [${padrao}] ${conteudo}`);
        });
        console.log('\n   Conserto: explique a decisão no próprio comentário, ou cite a spec FIXA dona do fato');
        console.log('   ("achado N" só passa citando "15-divida-conhecida" na mesma linha).');
    }
    console.log('\n   Regra violada : R36 — O código não cita o rastro de execução (specs/specs/00-regras-e-invariantes.md)');
    process.exit(1);
}

const isMain = path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] || '');
if (isMain) {
    main();
}
