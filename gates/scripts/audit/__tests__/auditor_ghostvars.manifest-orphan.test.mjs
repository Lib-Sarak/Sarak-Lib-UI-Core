import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { runGateAgainstFixture } from './helpers/runGateFixture.mjs';

// Self-test do PRÓPRIO GATE (R7 vão 2, plan-20): o manifesto (`DESIGN_MANIFEST`)
// só empresta as vars de uma entrada ao registro quando ela é COMPROVADA —
// (a) existe token de mesmo id em algum schema, OU (b) alguma de suas vars
// já é emitida por outra fonte. Sem prova, a entrada é órfã e as vars dela
// NÃO entram no registro — consumi-las acusa fantasma, como deveria sempre
// ter acusado.
const GATE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'auditor_ghostvars.mjs');

const SCHEMA = {
  'src/core/Design/schema/fixture.ts': `export const FIXTURE_SCHEMA = [{ id: 'realToken' }];`,
};

describe('auditor_ghostvars — R7 vão 2 (manifesto só conta como fonte quando comprovado)', () => {
  it('ACUSA fantasma: entrada do manifesto SEM token de schema e SEM var confirmada por outra fonte (órfã)', () => {
    const { status, stdout } = runGateAgainstFixture(GATE, {
      ...SCHEMA,
      'src/core/Provider/manifest.ts': `export const DESIGN_MANIFEST = {
        fakeToken: { vars: ['--fake-token-var'] },
      };`,
      'src/components/Fixture.tsx': 'const x = "var(--fake-token-var)";',
    });
    expect(status).toBe(1);
    expect(stdout).toContain('--fake-token-var');
    expect(stdout).toContain('[R7 vão 2]');
    expect(stdout).toContain('fakeToken');
  });

  it('LIBERA (a): a chave da entrada do manifesto É um id real de token de schema', () => {
    const { status, stdout } = runGateAgainstFixture(GATE, {
      ...SCHEMA,
      'src/core/Provider/manifest.ts': `export const DESIGN_MANIFEST = {
        realToken: { vars: ['--real-token-var'] },
      };`,
      'src/components/Fixture.tsx': 'const x = "var(--real-token-var)";',
    });
    expect(status).toBe(0);
    expect(stdout).not.toContain('[R7 vão 2]');
  });

  it('LIBERA (b): a entrada não bate id nenhum, mas UMA de suas vars já é emitida por OUTRA fonte (styles)', () => {
    const { status, stdout } = runGateAgainstFixture(GATE, {
      ...SCHEMA,
      'src/core/Provider/manifest.ts': `export const DESIGN_MANIFEST = {
        borrowedToken: { vars: ['--borrowed-var', '--borrowed-var-alias'] },
      };`,
      'src/styles/fixture.css': ':root { --borrowed-var: 1px; }',
      'src/components/Fixture.tsx': 'const x = "var(--borrowed-var-alias)";',
    });
    expect(status).toBe(0);
    expect(stdout).not.toContain('[R7 vão 2]');
  });
});
