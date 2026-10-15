// Documentação de token — todo token do schema declara `kind` (estético | funcional), `modeDependent` e `usage`
// (o que muda na tela e onde), e `interactsWith` quando só tem efeito com outro token. O schema é o mapa: o
// catálogo do kit e o apêndice do guia derivam destes campos, e não existe documento paralelo à mão.
//
// Por que GATE e não teste: o resultado tem de bloquear o commit e o build antes de o artefato do kit sair
// defasado, e a lista de exceção é dado versionado que esvazia a cada lote — comportamento de gate (mesmo
// formato de `check-variable-contract`), que um teste de suíte não cobra no Anel 1.
//
// Exceção: `gates/allowlists/tokenDocumentationPending.json`, `{ "<id do token>": <lote> }`. Os tokens dos lotes
// 2 a 4 entram nela; cada lote a esvazia. Entrada de token já documentado (ou inexistente) também bloqueia.
//
// Uso: `npx tsx gates/scripts/contrato/check-token-documentation.ts`.
//
// -------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que este gate NÃO vê
// -------------------------------------------------------------------------
// 1. ESCOPO: os tokens de `MASTER_DESIGN_MAP` (todos os grupos). Não vê `docs/`, `sarak-ui/` nem o guia à mão.
// 2. Confere FORMA, não VERDADE: que `usage` existe, tem entre 25 e 420 caracteres e não repete o rótulo; que
//    `kind` é um dos dois valores; que `modeDependent` é booleano; que cada id de `interactsWith` existe. NÃO
//    prova que o texto descreve o que o leitor faz — essa prova é a medição em navegador do lote e a amostra do
//    revisor. Um `usage` bem formado e falso passa.
// 3. NÃO confere a classificação: um token funcional marcado estético passa. O critério mora no anexo da plan de
//    temas; a trava de completude estética do tema (lote posterior) é quem cobra o efeito da classificação.
// 4. NÃO detecta transcrição de lista viva (R17) dentro do `usage`: o teto de 420 caracteres só limita o dano.
// 5. A lista de exceção é por token, sem validade de data: ela esvazia porque o lote seguinte a consome, não
//    porque o gate force um prazo.
// -------------------------------------------------------------------------
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MASTER_DESIGN_MAP } from '../../../src/core/Design/master-map';
import { buildDocumentationReport, type DocumentationReport } from './helpers/token-documentation-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const PENDING_FILE = path.join(ROOT, 'gates', 'allowlists', 'tokenDocumentationPending.json');

export function readPending(file: string = PENDING_FILE): Record<string, unknown> {
    if (!fs.existsSync(file)) return {};
    return JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, unknown>;
}

export function buildReport(pending: Record<string, unknown> = readPending()): DocumentationReport {
    const tokens = MASTER_DESIGN_MAP.components.flatMap((component) => component.tokens);
    return buildDocumentationReport(tokens, pending);
}

function main(): void {
    console.log('--- token-docs:check (documentação de token) ---');
    const report = buildReport();
    for (const gap of report.gaps) console.error(`❌ ${gap.tokenId}: ${gap.detail} [${gap.reason}]`);
    for (const id of report.staleExceptions) {
        console.error(`❌ exceção obsoleta: "${id}" já está documentado (ou não existe) — remova de tokenDocumentationPending.json`);
    }
    if (report.gaps.length > 0 || report.staleExceptions.length > 0) {
        console.error(
            `\n⛔ ${report.gaps.length} lacuna(s) e ${report.staleExceptions.length} exceção(ões) obsoleta(s). ` +
                `Documentados: ${report.documented}/${report.total}; em exceção: ${report.excepted}.`,
        );
        process.exit(1);
    }
    console.log(`✅ ${report.documented} de ${report.total} tokens documentados; ${report.excepted} em exceção (esvazia a cada lote).`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
