import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { runGateAgainstFixture } from './helpers/runGateFixture.mjs';

// Teste do PRÓPRIO GATE (plan-12, R32): nenhum gate existia para o
// acoplamento de autenticação (achado 14). Um caso que ele PEGA (sink de
// credencial, rota embutida) e um que ele DEIXA PASSAR (template de dados
// agnóstico com `endpoint`, storage não relacionado a auth).

const GATE = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'auditor_authcoupling.mjs',
);

describe('auditor_authcoupling — R32', () => {
  it('acusa sink de credencial em localStorage', () => {
    const { status, stdout } = runGateAgainstFixture(GATE, {
      'src/components/Bad.tsx': "const t = localStorage.getItem('authToken');",
    });
    expect(status).toBe(1);
    expect(stdout).toContain('sink de credencial');
  });

  it('acusa rota de autenticação embutida em template literal', () => {
    const { status, stdout } = runGateAgainstFixture(GATE, {
      'src/features/Bad.tsx': 'const url = `${endpoint}/mfa/enable`;',
    });
    expect(status).toBe(1);
    expect(stdout).toContain('rota de autenticação embutida');
  });

  it('acusa header Authorization literal', () => {
    const { status, stdout } = runGateAgainstFixture(GATE, {
      'src/components/Bad2.tsx': "fetch(endpoint, { headers: { 'Authorization': token } });",
    });
    expect(status).toBe(1);
    expect(stdout).toContain('header de credencial');
  });

  it('libera um template de dados agnóstico com endpoint', () => {
    const { status } = runGateAgainstFixture(GATE, {
      'src/components/SarakTable.tsx': 'export function SarakTable({ endpoint }) { fetch(endpoint); return null; }',
    });
    expect(status).toBe(0);
  });

  it('libera storage não relacionado a autenticação (idioma, tema)', () => {
    const { status } = runGateAgainstFixture(GATE, {
      'src/components/Controls.tsx': "localStorage.setItem('language', 'pt');",
    });
    expect(status).toBe(0);
  });

  it('libera identificador/id bare que só CONTÉM a palavra "auth" sem ser rota', () => {
    const { status } = runGateAgainstFixture(GATE, {
      'src/features/useMock.ts': "const appIds = ['dashboard', 'auth', 'settings'];",
    });
    expect(status).toBe(0);
  });
});
