import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { runGateAgainstFixture } from './helpers/runGateFixture.mjs';

// Teste do PRÓPRIO GATE (plan-16, R10): nenhum gate existia para composição
// atômica — o enunciado antigo ("template ou componente pré-montado") não
// era verificável. Um caso que ele PEGA (elemento nativo dentro da
// fronteira) e casos que ele LIBERA (fronteira excluída: features/,
// __tests__/). A partir da plan-20, `atomic/Buttons/` e `.../Inputs/`
// deixaram de ser exclusão de PASTA — a isenção é por marcador
// `@sarak-encapsula`, testada em separado abaixo.

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

  it('ACUSA <button> dentro de atomic/Buttons/ SEM marcador — a pasta não isenta mais (plan-20)', () => {
    const { status, stdout } = runGateAgainstFixture(GATE, {
      'src/components/atomic/Buttons/SarakButton.tsx': 'export const SarakButton = () => <button>Salvar</button>;',
    });
    expect(status).toBe(1);
    expect(stdout).toContain('<button>');
  });

  it('ACUSA <input> dentro de atomic/Inputs/ SEM marcador — a pasta não isenta mais (plan-20)', () => {
    const { status, stdout } = runGateAgainstFixture(GATE, {
      'src/components/atomic/Inputs/SarakInput.tsx': 'export const SarakInput = () => <input />;',
    });
    expect(status).toBe(1);
    expect(stdout).toContain('<input>');
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

// plan-20 (2026-08-10), item 6: R10 estreitada — <input> OCULTO acionado só
// por PROGRAMA (ref + `.current?.click()` no mesmo arquivo) não é
// composição atômica, é API do navegador. Fecha ChatInput.tsx:117.
describe('auditor_composicaoatomica — R10 estreitada: <input> oculto acionado por programa', () => {
  it('libera o <input> oculto com ref clicado programaticamente no mesmo arquivo (caso real: ChatInput)', () => {
    const { status, stdout } = runGateAgainstFixture(GATE, {
      'src/components/atomic/Templates/Fixture.tsx': [
        'export const X = () => {',
        '  const fileInputRef = useRef(null);',
        '  return (<div>',
        '    <input type="file" ref={fileInputRef} className="hidden" />',
        '    <SarakIconButton onClick={() => fileInputRef.current?.click()} />',
        '  </div>);',
        '};',
      ].join('\n'),
    });
    expect(status).toBe(0);
    expect(stdout).not.toContain('<input>');
  });

  it('AINDA acusa <input hidden> SEM acionamento por programa (self-test negativo — nenhum .current.click() no arquivo)', () => {
    const { status, stdout } = runGateAgainstFixture(GATE, {
      'src/components/atomic/Templates/Fixture.tsx': [
        'export const X = () => {',
        '  const fileInputRef = useRef(null);',
        '  return <input type="file" ref={fileInputRef} className="hidden" />;',
        '};',
      ].join('\n'),
    });
    expect(status).toBe(1);
    expect(stdout).toContain('<input>');
  });

  it('AINDA acusa <input hidden> SEM ref nenhum (self-test negativo)', () => {
    const { status, stdout } = runGateAgainstFixture(GATE, {
      'src/components/atomic/Templates/Fixture.tsx':
        'export const X = () => <input type="file" className="hidden" />;',
    });
    expect(status).toBe(1);
    expect(stdout).toContain('<input>');
  });

  it('AINDA acusa <input> VISÍVEL (sem "hidden") mesmo com ref clicado por programa (self-test negativo)', () => {
    const { status, stdout } = runGateAgainstFixture(GATE, {
      'src/components/atomic/Templates/Fixture.tsx': [
        'export const X = () => {',
        '  const inputRef = useRef(null);',
        '  return (<div>',
        '    <input type="text" ref={inputRef} />',
        '    <SarakIconButton onClick={() => inputRef.current?.click()} />',
        '  </div>);',
        '};',
      ].join('\n'),
    });
    expect(status).toBe(1);
    expect(stdout).toContain('<input>');
  });
});

// plan-20 (2026-08-10), item 7 (A1): a fronteira de R10 passa de PASTA para
// PAPEL — marcador `@sarak-encapsula <tag> — <razão>` no JSDoc do
// componente, isento POR TAG (nunca em bloco), com razão obrigatória.
describe('auditor_composicaoatomica — A1: marcador @sarak-encapsula', () => {
  it('libera a tag marcada, com razão escrita', () => {
    const { status } = runGateAgainstFixture(GATE, {
      'src/components/atomic/Buttons/Fixture.tsx': [
        '/**',
        ' * @sarak-encapsula button — encapsula o <button> nativo para a11y.',
        ' */',
        'export const Fixture = () => <button>Salvar</button>;',
      ].join('\n'),
    });
    expect(status).toBe(0);
  });

  it('isenta POR TAG, nunca em bloco: arquivo marcado para "button" AINDA acusa <input> cru no mesmo arquivo', () => {
    const { status, stdout } = runGateAgainstFixture(GATE, {
      'src/components/atomic/Buttons/Fixture.tsx': [
        '/**',
        ' * @sarak-encapsula button — encapsula o <button> nativo para a11y.',
        ' */',
        'export const Fixture = () => (<div><button>Salvar</button><input /></div>);',
      ].join('\n'),
    });
    expect(status).toBe(1);
    expect(stdout).toContain('<input>');
    expect(stdout).not.toContain('<button>');
  });

  it('marcador SEM razão NÃO isenta, e o gate reprova pedindo a razão', () => {
    const { status, stdout } = runGateAgainstFixture(GATE, {
      'src/components/atomic/Buttons/Fixture.tsx': [
        '/**',
        ' * @sarak-encapsula button',
        ' */',
        'export const Fixture = () => <button>Salvar</button>;',
      ].join('\n'),
    });
    expect(status).toBe(1);
    expect(stdout).toContain('<button>');
    expect(stdout).toContain('SEM razão');
  });

  it('tag inválida (fora de button/input/select) é ERRO do gate, não isenção silenciosa', () => {
    const { status, stdout } = runGateAgainstFixture(GATE, {
      'src/components/atomic/Buttons/Fixture.tsx': [
        '/**',
        ' * @sarak-encapsula div — não é uma das três tags válidas.',
        ' */',
        'export const Fixture = () => <button>Salvar</button>;',
      ].join('\n'),
    });
    expect(status).toBe(1);
    expect(stdout).toContain('não é uma tag válida');
  });
});
