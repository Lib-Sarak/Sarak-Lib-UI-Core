/**
 * Gate (a) — todo MAJOR emitido tem entrada ANCORADA em `docs/migracoes.md`
 * antes de a tag existir (03 §5: "não há gate cobrando isso — é conduta".
 * Pulado 3x — faltaram as âncoras de 4.0.0, 5.0.0 e 6.0.0. Este gate é a
 * resposta: constrói o gate, não só o texto).
 *
 * Roda dentro do script `version` do npm — NÃO no `preversion`, NÃO no
 * `pre-push`: é o único instante em que o `package.json` JÁ tem a versão
 * nova e a tag AINDA NÃO existe, então dá para barrar ANTES de publicar.
 *
 * A checagem REUSA `extractMigrationNotes` — a MESMA função que
 * `sarak-ui update --latest` (plan-10) usa para ler as notas. Gate e leitor
 * nunca divergem sobre o que conta como "ancorado": um `bounded: false`
 * aqui é exatamente o corte que um consumidor não conseguiria encontrar.
 *
 * -------------------------------------------------------------------------
 * LIMITES DECLARADOS (R18) — o que este gate NÃO vê
 * -------------------------------------------------------------------------
 * 1. Só cobra MAJOR (`X.0.0`) — minor e patch passam direto. A obrigação da
 *    03 §5 é sobre *breaking change*, e só MAJOR é, por contrato, breaking.
 * 2. Só confere a PRESENÇA da âncora (um título que cite "X.0.0" por
 *    extenso). NÃO lê o CONTEÚDO da nota — uma entrada vazia, genérica ou
 *    tecnicamente errada passa igual. Conteúdo é revisão humana, não deste
 *    gate.
 * 3. Depende de `docs/migracoes.md` existir e ser legível — repositório sem
 *    o arquivo bloqueia TODO major, de propósito (é um estado pior do que o
 *    gate detecta, não um caso a tolerar).
 * -------------------------------------------------------------------------
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractMigrationNotes } from '../../../bin/scaffold/checkUpdate/migrationNotes.mjs';

const MAJOR_VERSION_PATTERN = /^(\d+)\.0\.0$/;

/**
 * @returns {{applicable:false, reason:string}
 *         | {applicable:true, ok:true, major:number}
 *         | {applicable:true, ok:false, major:number, error:string}}
 */
export function checkMigrationAnchor({ version, migracoesText }) {
    const match = MAJOR_VERSION_PATTERN.exec(version);
    if (!match) {
        return { applicable: false, reason: `"${version}" não é MAJOR (X.0.0) — gate não se aplica.` };
    }
    const major = Number(match[1]);
    const { bounded } = extractMigrationNotes({ migracoesText, installedMajor: major });
    if (bounded) return { applicable: true, ok: true, major };
    return {
        applicable: true,
        ok: false,
        major,
        error:
            `docs/migracoes.md não tem entrada ancorada para "${major}.0.0" (um título "## ..." que cite ` +
            `"${major}.0.0" por extenso). Todo MAJOR carrega o que quebra, escrito (03 §5) — sem âncora, ` +
            `"sarak-ui update --latest" também não encontra o corte.`,
    };
}

function main() {
    console.log('--- check-migration-anchor (03 §5 — MAJOR sem nota é entrega incompleta) ---');
    const pkg = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf8'));
    const migracoesText = fs.readFileSync(path.resolve('docs/migracoes.md'), 'utf8');
    const result = checkMigrationAnchor({ version: pkg.version, migracoesText });

    if (!result.applicable) {
        console.log(`[OK] ${result.reason}`);
        process.exit(0);
    }
    if (result.ok) {
        console.log(`[OK] docs/migracoes.md ancora "${result.major}.0.0".`);
        process.exit(0);
    }
    console.log(`[ERROR] ${result.error}`);
    process.exit(1);
}

const isMain = path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] || '');
if (isMain) {
    main();
}
