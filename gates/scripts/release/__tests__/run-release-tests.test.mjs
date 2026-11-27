// @vitest-environment node
// Teste do runner da release: prazo de 30 s só no caminho da release, e o
// relatório dos lentos é puro (não decide código de saída).
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { findOwnTimeouts, findOwnTimeoutsInTree } from '../find-own-timeouts.mjs';
import { buildVitestArgs, formatSummary, RELEASE_TIMEOUT_ENV, RELEASE_TIMEOUT_MS, summarizeSlowCases } from '../run-release-tests.mjs';

describe('buildVitestArgs', () => {
  it('põe o prazo de 30 s por caso e por gancho e liga o reporter JSON', () => {
    const args = buildVitestArgs({ jsonFile: 'x.json' });
    expect(args).toContain('--testTimeout=30000');
    expect(args).toContain('--hookTimeout=30000');
    expect(args).toContain('--outputFile.json=x.json');
    expect(args).toContain('--coverage');
  });
});

describe('summarizeSlowCases', () => {
  const report = {
    testResults: [
      { name: 'C:/a/um.test.ts', assertionResults: [{ fullName: 'rápido', duration: 10 }, { fullName: 'lento', duration: 2500 }] },
      { name: 'C:/a/dois.test.ts', assertionResults: [{ fullName: 'médio', duration: 1500 }] },
    ],
  };

  it('ordena do mais lento e conta os que passaram de 1 s', () => {
    const s = summarizeSlowCases(report, { top: 2 });
    expect(s.total).toBe(3);
    expect(s.overThreshold).toBe(2);
    expect(s.top.map((c) => c.name)).toEqual(['lento', 'médio']);
  });

  it('o resumo do terminal respeita o teto de 25 linhas', () => {
    const muitos = { total: 99, overThreshold: 99, top: Array.from({ length: 99 }, (_, i) => ({ file: 'f', name: `c${i}`, ms: i })) };
    expect(formatSummary(muitos, 'r.json').split('\n').length).toBeLessThanOrEqual(25);
  });
});

// O prazo declarado no próprio caso vence a flag `--testTimeout`; só a porta `prazoDeTeste`,
// alimentada pela variável do runner, faz o caminho da release valer para ele.
describe('prazo próprio de teste no caminho da release', () => {
  const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
  // Fora de `src/`: a trava varre `src/**/__tests__` em paralelo e não pode ver o caso sintético.
  const FIXTURE_DIR = path.dirname(fileURLToPath(import.meta.url));
  const DECLARED_MS = 300;
  const RELEASE_MS = 5000;
  const RUN_MS = 1200;
  const OUTER_TIMEOUT_MS = 60000;

  function runFixture(label, deadlineExpr) {
    const file = path.join(FIXTURE_DIR, `tmp-prazo-${label}-${process.pid}.test.ts`);
    fs.writeFileSync(
      file,
      `import { it } from 'vitest';\nimport { prazoDeTeste } from '../../../../src/shared/testing/prazoDeTeste';\n` +
        `it('dura mais que o declarado e menos que o da release', async () => { await new Promise((r) => setTimeout(r, ${RUN_MS})); }, ${deadlineExpr});\n`,
    );
    try {
      const vitestBin = path.join(ROOT, 'node_modules', 'vitest', 'vitest.mjs');
      const env = { ...process.env, [RELEASE_TIMEOUT_ENV]: String(RELEASE_MS) };
      return spawnSync(process.execPath, [vitestBin, 'run', file, '--reporter=dot', `--testTimeout=${RELEASE_MS}`], { cwd: ROOT, env, encoding: 'utf8' });
    } finally {
      fs.rmSync(file, { force: true });
    }
  }

  it('prazo literal ignora o da release e reprova', () => {
    expect(runFixture('literal', String(DECLARED_MS)).status).not.toBe(0);
  }, OUTER_TIMEOUT_MS);

  it('prazo pela porta vale o da release e passa', () => {
    expect(runFixture('porta', `prazoDeTeste(${DECLARED_MS})`).status).toBe(0);
  }, OUTER_TIMEOUT_MS);

  it('o runner entrega o prazo da release ao filho por variável de ambiente', () => {
    expect(RELEASE_TIMEOUT_ENV).toBe('RELEASE_TEST_TIMEOUT_MS');
    expect(RELEASE_TIMEOUT_MS).toBe(30000);
  });
});

describe('trava: prazo numérico declarado fora da porta', () => {
  it('reprova literal, constante literal, setConfig e it.each', () => {
    const ruim = [
      "it('a', () => {}, 20_000);",
      "it('b', { timeout: 60_000 }, () => {});",
      "const T = 30000;\nit('c', () => {}, T);",
      'vi.setConfig({ testTimeout: 30000 });',
      "it.each([1])('d', () => {}, 120_000);",
      "describe('e', { timeout: 1000 * 5 }, () => {});",
    ];
    for (const src of ruim) expect(findOwnTimeouts(src).length, src).toBeGreaterThan(0);
  });

  it('aceita a porta, waitFor/findBy e it sem prazo', () => {
    const bom = [
      "it('a', () => {}, prazoDeTeste(20_000));",
      "const T = prazoDeTeste(30000);\nit('c', () => {}, T);",
      'vi.setConfig({ testTimeout: prazoDeTeste(30000) });',
      "await screen.findByText('x', {}, { timeout: 8000 });\nawait waitFor(() => {}, { timeout: 8000 });",
      "it('sem prazo', () => {});",
      'setTimeout(() => {}, 1500);',
    ];
    for (const src of bom) expect(findOwnTimeouts(src), src).toEqual([]);
  });

  it('nenhum teste de src/ declara prazo fora da porta', () => {
    const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..', 'src');
    expect(findOwnTimeoutsInTree(root)).toEqual([]);
  });
});
