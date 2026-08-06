import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { runGateAgainstFixture } from './helpers/runGateFixture.mjs';

// Teste do PRÓPRIO GATE (plan-16, R10): nenhum gate existia para composição
// atômica — o enunciado antigo ("template ou componente pré-montado") não
// era verificável. Um caso que ele PEGA (elemento nativo dentro da
// fronteira) e casos que ele LIBERA (fronteira excluída: atomic/Buttons,
// atomic/Inputs, features/, __tests__/).

const GATE = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'auditor_composicaoatomica.mjs',
);

describe('auditor_composicaoatomica — R10', () => {
  it('acusa <button> cru dentro da fronteira (src/core/Shell)', () => {
    const { status, stdout } = runGateAgainstFixture(GATE, {
      'src/core/Shell/Fixture.tsx': 'export const X = () => <button>Salvar</button>;',
    });
    expect(status).toBe(1);
    expect(stdout).toContain('<button>');
  });

  it('acusa <input> cru dentro de src/components/Layout', () => {
    const { status, stdout } = runGateAgainstFixture(GATE, {
      'src/components/Layout/Fixture.tsx': 'export const X = () => <input type="text" />;',
    });
    expect(status).toBe(1);
    expect(stdout).toContain('<input>');
  });

  it('libera <button> dentro de atomic/Buttons/ (é a implementação do átomo)', () => {
    const { status } = runGateAgainstFixture(GATE, {
      'src/components/atomic/Buttons/SarakButton.tsx': 'export const SarakButton = () => <button>Salvar</button>;',
    });
    expect(status).toBe(0);
  });

  it('libera <input> dentro de atomic/Inputs/', () => {
    const { status } = runGateAgainstFixture(GATE, {
      'src/components/atomic/Inputs/SarakInput.tsx': 'export const SarakInput = () => <input />;',
    });
    expect(status).toBe(0);
  });

  it('libera <button> em src/features/ (ferramenta de autoria — fora do escopo varrido)', () => {
    const { status } = runGateAgainstFixture(GATE, {
      'src/features/DesignEngine/Fixture.tsx': 'export const X = () => <button>Painel</button>;',
    });
    expect(status).toBe(0);
  });

  it('libera <button> em __tests__/', () => {
    const { status } = runGateAgainstFixture(GATE, {
      'src/core/Shell/__tests__/Fixture.test.tsx': 'it("x", () => <button>t</button>);',
    });
    expect(status).toBe(0);
  });

  it('libera componente React de nome maiúsculo (não é elemento nativo)', () => {
    const { status } = runGateAgainstFixture(GATE, {
      'src/core/Shell/Fixture2.tsx': 'export const X = () => <SarakButton>Salvar</SarakButton>;',
    });
    expect(status).toBe(0);
  });
});
