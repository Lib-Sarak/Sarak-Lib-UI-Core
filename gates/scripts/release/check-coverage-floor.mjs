// R8.1 — cobertura em %, PISO MÓVEL. Segunda rede do R8 (1:1): o 1:1 garante
// que todo componente/hook TEM um teste ao lado; isto mede o quanto de
// DENTRO de cada arquivo o teste alcança. Mesma mecânica do `audit:baseline`
// (R20): mede agora, grava como piso, e o piso só sobe — nunca desce sem
// alguém decidir por quê.
//
// -------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que este gate NÃO vê
// -------------------------------------------------------------------------
// 1. Depende de `coverage/coverage-summary.json` já existir — este script
//    NÃO roda a suíte. Gere com `npx vitest run --coverage` antes (ou use
//    `npm run coverage:check`, que já encadeia os dois). Não entra no
//    `pre-push` (que roda a suíte pura, sem instrumentação, por custo);
//    mora no `gates:full`.
// 2. Compara UM número agregado (`lines.pct`, o total do projeto) — um
//    arquivo que caia de 100% para 10% pode não mover a média o bastante
//    para bloquear, se o resto do projeto for grande. A rede principal
//    contra arquivo-sem-teste-nenhum continua sendo o 1:1 (R8).
// -------------------------------------------------------------------------
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const SUMMARY_FILE = path.join(ROOT, 'coverage', 'coverage-summary.json');
const FLOOR_FILE = path.join(ROOT, 'gates', 'baselines', 'coverage-floor.json');

function readSummaryPct({ summaryFile = SUMMARY_FILE } = {}) {
  if (!fs.existsSync(summaryFile)) return null;
  const summary = JSON.parse(fs.readFileSync(summaryFile, 'utf8'));
  return summary.total?.lines?.pct ?? null;
}

function readFloor({ floorFile = FLOOR_FILE } = {}) {
  if (!fs.existsSync(floorFile)) return null;
  return JSON.parse(fs.readFileSync(floorFile, 'utf8'));
}

function writeFloor(pct, { floorFile = FLOOR_FILE } = {}) {
  const agora = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const medidoEm = `${agora.getFullYear()}-${pad(agora.getMonth() + 1)}-${pad(agora.getDate())}`;
  const conteudo = {
    _doc: 'Piso móvel de R8.1 (specs/specs/00-regras-e-invariantes.md). NÃO editar à mão: rode `npm run coverage:check -- --write` DEPOIS de medir, e commite junto.',
    _leitura: '`linesPct` é o MÍNIMO tolerado. Menor que isto = regressão = bloqueio.',
    medidoEm,
    linesPct: pct,
  };
  fs.mkdirSync(path.dirname(floorFile), { recursive: true });
  fs.writeFileSync(floorFile, `${JSON.stringify(conteudo, null, 4)}\n`, 'utf8');
}

export function compareCoverageFloor({ summaryFile = SUMMARY_FILE, floorFile = FLOOR_FILE } = {}) {
  const atual = readSummaryPct({ summaryFile });
  if (atual === null) {
    return { status: 'sem-summary' };
  }
  const piso = readFloor({ floorFile });
  if (!piso) {
    return { status: 'sem-piso', atual };
  }
  if (atual < piso.linesPct) return { status: 'regrediu', atual, piso: piso.linesPct };
  if (atual > piso.linesPct) return { status: 'melhorou', atual, piso: piso.linesPct };
  return { status: 'igual', atual, piso: piso.linesPct };
}

function main() {
  console.log('--- check-coverage-floor (R8.1) ---');
  const write = process.argv.includes('--write');

  if (write) {
    const atual = readSummaryPct();
    if (atual === null) {
      console.log('[ERROR] coverage/coverage-summary.json não existe — rode `npx vitest run --coverage` primeiro.');
      process.exit(1);
    }
    writeFloor(atual);
    console.log(`[coverage:check] piso regravado em gates/baselines/coverage-floor.json — ${atual}% de linhas.`);
    console.log('[coverage:check] COMMITE este arquivo junto do conserto que o justificou.');
    return;
  }

  const resultado = compareCoverageFloor();
  if (resultado.status === 'sem-summary') {
    console.log('[ERROR] coverage/coverage-summary.json não existe — rode `npx vitest run --coverage` primeiro.');
    process.exit(1);
  }
  if (resultado.status === 'sem-piso') {
    console.log(`[ERROR] gates/baselines/coverage-floor.json não existe. Cobertura atual: ${resultado.atual}%.`);
    console.log('  Gere com: npm run coverage:check -- --write');
    process.exit(1);
  }
  if (resultado.status === 'regrediu') {
    console.log(`[ERROR] REGRESSÃO — cobertura de linhas caiu: ${resultado.piso}% -> ${resultado.atual}%.`);
    process.exit(1);
  }
  if (resultado.status === 'melhorou') {
    console.log(`[coverage:check] MELHOROU (nada bloqueado): ${resultado.piso}% -> ${resultado.atual}%.`);
    console.log('  Atualize o piso com: npm run coverage:check -- --write');
    return;
  }
  console.log(`[coverage:check] igual ao piso (${resultado.piso}%) — nenhuma regressão.`);
}

const isMain = path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] || '');
if (isMain) {
  main();
}
