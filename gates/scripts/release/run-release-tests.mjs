// Suíte do caminho da release (`preversion` → `gates:full` → `coverage:release`).
//
// O `preversion` é um portão de CORREÇÃO: um caso correto que passa de 5 s só
// porque a máquina está carregada não pode reprovar a release. Aqui a suíte
// roda com prazo maior por caso e por gancho; o uso diário (`npx vitest run`,
// `verify`) continua no prazo do `vitest.config.ts`.
//
// O relatório dos casos lentos é INFORMATIVO: nunca muda o código de saída
// (o código de saída é o do vitest, e só ele).
//
// -------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que este script NÃO vê
// -------------------------------------------------------------------------
// 1. Não reprova caso lento: tempo depende da carga da máquina, e um gate
//    assim seria instável. A lentidão se conserta no uso diário (prazo de 5 s).
// 2. Um caso que trava de verdade ainda reprova — só que aos 30 s, não aos 5.
//    Caso com prazo próprio MAIOR que 30 s mantém o dele (a porta devolve o maior).
// 3. O relatório só existe se o vitest chegou a gravar o JSON (suíte abortada
//    antes do fim não o produz; o resumo avisa).
// -------------------------------------------------------------------------
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const RELEASE_TIMEOUT_MS = 30000;
// Teste que declara prazo próprio lê este valor pela porta `prazoDeTeste` (src/shared/testing):
// prazo declarado vence a flag de linha de comando, então a flag sozinha não o alcança.
export const RELEASE_TIMEOUT_ENV = 'RELEASE_TEST_TIMEOUT_MS';
const SLOW_THRESHOLD_MS = 1000;
const TOP_COUNT = 20;
const SUMMARY_MAX_LINES = 25;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

export function buildVitestArgs({ jsonFile, timeoutMs = RELEASE_TIMEOUT_MS, extra = [] }) {
  return [
    'run',
    '--coverage',
    `--testTimeout=${timeoutMs}`,
    `--hookTimeout=${timeoutMs}`,
    '--reporter=default',
    '--reporter=json',
    `--outputFile.json=${jsonFile}`,
    ...extra,
  ];
}

export function collectCases(report) {
  const cases = [];
  for (const file of report.testResults ?? []) {
    for (const t of file.assertionResults ?? []) {
      cases.push({ file: path.basename(file.name ?? ''), name: t.fullName ?? t.title ?? '', ms: t.duration ?? 0 });
    }
  }
  return cases;
}

export function summarizeSlowCases(report, { top = TOP_COUNT, thresholdMs = SLOW_THRESHOLD_MS } = {}) {
  const cases = collectCases(report);
  const sorted = [...cases].sort((a, b) => b.ms - a.ms);
  return {
    total: cases.length,
    overThreshold: cases.filter((c) => c.ms > thresholdMs).length,
    top: sorted.slice(0, top),
  };
}

export function formatSummary(summary, reportFile) {
  const lines = [
    `[release-tests] casos lentos (informativo, não bloqueia): ${summary.overThreshold} de ${summary.total} passaram de ${SLOW_THRESHOLD_MS} ms.`,
    ...summary.top.map((c) => `  ${String(Math.round(c.ms)).padStart(6)} ms  ${c.file} › ${c.name}`.slice(0, 160)),
    `[release-tests] relatório completo: ${reportFile}`,
  ];
  return lines.slice(0, SUMMARY_MAX_LINES).join('\n');
}

function writeSlowReport(jsonFile, reportFile) {
  if (!fs.existsSync(jsonFile)) {
    console.log('[release-tests] o vitest não gravou o JSON — sem relatório de casos lentos.');
    return;
  }
  const summary = summarizeSlowCases(JSON.parse(fs.readFileSync(jsonFile, 'utf8')), { top: Infinity });
  fs.writeFileSync(reportFile, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  console.log(formatSummary({ ...summary, top: summary.top.slice(0, TOP_COUNT) }, reportFile));
}

function main() {
  const outDir = path.join(os.tmpdir(), 'sarak-release-tests');
  fs.mkdirSync(outDir, { recursive: true });
  const jsonFile = path.join(outDir, 'vitest-result.json');
  const reportFile = path.join(outDir, 'casos-lentos.json');
  fs.rmSync(jsonFile, { force: true });

  const vitestBin = path.join(ROOT, 'node_modules', 'vitest', 'vitest.mjs');
  const args = buildVitestArgs({ jsonFile, extra: process.argv.slice(2) });
  const result = spawnSync(process.execPath, [vitestBin, ...args], { cwd: ROOT, stdio: 'inherit', env: { ...process.env, [RELEASE_TIMEOUT_ENV]: String(RELEASE_TIMEOUT_MS) } });

  try {
    writeSlowReport(jsonFile, reportFile);
  } catch (error) {
    console.log(`[release-tests] relatório dos lentos falhou (não bloqueia): ${error.message}`);
  }
  process.exit(result.status ?? 1);
}

const isMain = path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] || '');
if (isMain) {
  main();
}
