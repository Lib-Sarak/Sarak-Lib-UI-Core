// @vitest-environment node
// Teste do PRÓPRIO GATE (plan-12, R8.1): cobertura em % com PISO MÓVEL —
// mesma mecânica de R20 (`audit:baseline`). Um caso que PEGA (cobertura caiu
// abaixo do piso) e um que LIBERA (igual ou acima).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { compareCoverageFloor } from '../check-coverage-floor.mjs';

function montarFixture({ summaryPct, floorPct }) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-coverage-floor-'));
  const summaryFile = path.join(root, 'coverage-summary.json');
  fs.writeFileSync(summaryFile, JSON.stringify({ total: { lines: { pct: summaryPct } } }));
  let floorFile = path.join(root, 'coverage-floor.json');
  if (floorPct !== undefined) {
    fs.writeFileSync(floorFile, JSON.stringify({ medidoEm: '2026-08-05', linesPct: floorPct }));
  } else {
    floorFile = path.join(root, 'nao-existe.json');
  }
  return { summaryFile, floorFile };
}

describe('compareCoverageFloor — R8.1', () => {
  it('acusa REGRESSÃO quando a cobertura caiu abaixo do piso', () => {
    const { summaryFile, floorFile } = montarFixture({ summaryPct: 60, floorPct: 70 });
    expect(compareCoverageFloor({ summaryFile, floorFile })).toEqual({ status: 'regrediu', atual: 60, piso: 70 });
  });

  it('libera quando a cobertura está IGUAL ao piso', () => {
    const { summaryFile, floorFile } = montarFixture({ summaryPct: 70, floorPct: 70 });
    expect(compareCoverageFloor({ summaryFile, floorFile })).toEqual({ status: 'igual', atual: 70, piso: 70 });
  });

  it('reporta MELHOROU (não bloqueia) quando a cobertura subiu', () => {
    const { summaryFile, floorFile } = montarFixture({ summaryPct: 75, floorPct: 70 });
    expect(compareCoverageFloor({ summaryFile, floorFile })).toEqual({ status: 'melhorou', atual: 75, piso: 70 });
  });

  it('acusa piso ausente separadamente de regressão', () => {
    const { summaryFile, floorFile } = montarFixture({ summaryPct: 70 });
    expect(compareCoverageFloor({ summaryFile, floorFile })).toEqual({ status: 'sem-piso', atual: 70 });
  });
});
