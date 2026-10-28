// Completude dos temas embarcados — todo tema declara todo token estético obrigatório no modo principal e, na `contraparte`,
// todo estético que carrega modo; nenhum funcional, em lugar nenhum. É o que impede um tema de "herdar" a cara do
// padrão por omissão: o token que ele não declara vale o padrão do schema, e o tema deixa de ser dele. Os
// funcionais valem o padrão do sistema, iguais em todo tema (critério: funcional é o que deve ser igual em todo tema por segurança, acessibilidade ou consistência de comportamento).
//
// Por que GATE e não teste: o resultado tem de bloquear o commit antes de um tema incompleto entrar no catálogo,
// e a lista de exceção é dado versionado que esvazia a cada lote de tema — comportamento de gate (mesmo formato de
// `check-token-documentation`), que um teste de suíte não cobra no Anel 1.
//
// Exceção: `gates/allowlists/themeCompletenessPending.json`, `{ "<id do tema>": <lote em que o tema sai> }`. Os 14
// temas atuais entram nela; cada lote de tema remove o seu. Tema completo que continua na lista também bloqueia.
// Tema novo não entra na lista: nasce completo.
//
// Uso: `npx tsx gates/scripts/contrato/check-theme-completeness.ts`.
//
// -------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que este gate NÃO vê
// -------------------------------------------------------------------------
// 1. ESCOPO: os temas de `SARAK_ALL_THEMES` (`design` e `contraparte`) contra os tokens de `MASTER_DESIGN_MAP`.
//    Não vê tema de consumidor, preset de componente (`presets/components/`) nem `docs/`.
// 2. Confere PRESENÇA, não VERDADE: um estético declarado com o valor do padrão do schema conta como declarado, e
//    um valor sem intenção de design passa. Quem julga a direção de arte é a ficha do tema e o revisor; quem julga
//    legibilidade é `auditor_contraste`; quem julga o valor dentro do contrato é `tokenContractParity`.
// 3. Só conta chave que é TOKEN do schema com `kind`. Tokens estéticos marcados `optionalForTheme` não são exigidos. Chave de payload que não é token (`enabledLanguages`), chave
//    órfã (`auditor_presets`) e token sem `kind` (`token-docs:check`) ficam fora — cada um tem o seu gate.
// 4. A classificação vem do schema (`kind`, `modeDependent`) e NÃO é conferida aqui: um funcional marcado estético
//    seria exigido de todo tema, e um estético marcado funcional seria proibido. O critério é o do `kind` no schema.
// 5. A `contraparte` não pode declarar estético que não carrega modo (preserva a identidade entre os modos), com UMA
//    exceção fixa, `mode` (o eixo do par). Se um token estético for reclassificado para `modeDependent: true`, o
//    gate passa a exigi-lo na contraparte de todo tema que não esteja em exceção.
// 6. Valor `undefined` conta como não declarado; `null`, `0`, `''` e `false` contam como declarado.
// 7. A lista de exceção é por tema, sem validade de data: ela esvazia porque o lote do tema a consome, não porque o
//    gate force um prazo. O número do lote no valor é informação, não é conferido.
// -------------------------------------------------------------------------
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MASTER_DESIGN_MAP } from '../../../src/core/Design/master-map';
import { SARAK_ALL_THEMES } from '../../../src/core/Design/presets/themes/all';
import {
    buildCompletenessReport,
    type CompletenessGap,
    type CompletenessReport,
    type CompletenessThemeLike,
} from './helpers/theme-completeness-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const PENDING_FILE = path.join(ROOT, 'gates', 'allowlists', 'themeCompletenessPending.json');
const SAMPLE_SIZE = 4;

export function readPending(file: string = PENDING_FILE): Record<string, unknown> {
    if (!fs.existsSync(file)) return {};
    return JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, unknown>;
}

export function buildReport(pending: Record<string, unknown> = readPending()): CompletenessReport {
    const tokens = MASTER_DESIGN_MAP.components.flatMap((component) => component.tokens);
    const themes: CompletenessThemeLike[] = SARAK_ALL_THEMES.map((theme) => ({
        id: theme.id,
        design: theme.design,
        contraparte: theme.contraparte as Record<string, unknown> | undefined,
    }));
    return buildCompletenessReport(themes, tokens, pending);
}

/** Uma linha por tema e motivo: a contagem e uma amostra dos ids, para o relatório não despejar centenas de linhas. */
function summarize(gaps: CompletenessGap[]): string[] {
    const groups = new Map<string, string[]>();
    for (const gap of gaps) {
        const key = `${gap.themeId} [${gap.reason}]`;
        groups.set(key, [...(groups.get(key) ?? []), gap.tokenId]);
    }
    return [...groups.entries()].map(([key, ids]) => {
        const sample = ids.slice(0, SAMPLE_SIZE).join(', ');
        return `❌ ${key}: ${ids.length} token(s) — ${sample}${ids.length > SAMPLE_SIZE ? ', …' : ''}`;
    });
}

function main(): void {
    console.log('--- theme-completeness:check (completude dos temas embarcados) ---');
    const report = buildReport();
    for (const line of summarize(report.gaps)) console.error(line);
    for (const id of report.staleExceptions) {
        console.error(`❌ exceção obsoleta: "${id}" já está completo (ou não existe) — remova de themeCompletenessPending.json`);
    }
    if (report.gaps.length > 0 || report.staleExceptions.length > 0) {
        console.error(
            `\n⛔ ${report.gaps.length} lacuna(s) e ${report.staleExceptions.length} exceção(ões) obsoleta(s). ` +
                `Completos: ${report.complete}/${report.total}; em exceção: ${report.excepted}.`,
        );
        process.exit(1);
    }
    console.log(`✅ ${report.complete} de ${report.total} temas completos; ${report.excepted} em exceção (esvazia a cada lote de tema).`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
