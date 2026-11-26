// @vitest-environment node
// Teste do runner da release: prazo de 30 s só no caminho da release, e o
// relatório dos lentos é puro (não decide código de saída).
import { describe, expect, it } from 'vitest';
import { buildVitestArgs, formatSummary, summarizeSlowCases } from '../run-release-tests.mjs';

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
