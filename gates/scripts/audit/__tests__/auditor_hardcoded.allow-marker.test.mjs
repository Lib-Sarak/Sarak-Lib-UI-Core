import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { runGateAgainstFixture } from './helpers/runGateFixture.mjs';

// Teste do PRÓPRIO GATE (plan-20, R2/B1, 2026-08-10): `VALUE_ALLOWLIST`
// (chaveada por `caminho::literal`) deixou de existir — `git mv` a apagava
// em silêncio (medido pela plan-19: mover SocialButton.tsx invalidou as 4
// entradas de uma vez). A isenção agora é `sarak-allow-hardcode: <razão>`
// na linha do literal ou na imediatamente acima — viaja DENTRO do arquivo,
// não referenciada de fora.
const GATE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'auditor_hardcoded.mjs');

describe('auditor_hardcoded — B1: marcador sarak-allow-hardcode', () => {
  it('LIBERA um literal com o marcador na MESMA linha (comentário JSX)', () => {
    const { status } = runGateAgainstFixture(GATE, {
      'src/components/Fixture.tsx':
        'export const X = () => <path fill="#4285F4" />; // sarak-allow-hardcode: cor de marca fixa',
    });
    expect(status).toBe(0);
  });

  it('LIBERA um literal com o marcador na linha IMEDIATAMENTE ACIMA', () => {
    const { status } = runGateAgainstFixture(GATE, {
      'src/components/Fixture.tsx': [
        '// sarak-allow-hardcode: cor oficial de marca de terceiro, não é tema.',
        "const BRAND_BLUE = '#4285F4';",
        'export const X = () => <div style={{ color: BRAND_BLUE }} />;',
      ].join('\n'),
    });
    expect(status).toBe(0);
  });

  it('AINDA acusa o literal quando o marcador NÃO tem razão depois dos dois-pontos (self-test negativo)', () => {
    const { status, stdout } = runGateAgainstFixture(GATE, {
      'src/components/Fixture.tsx': [
        '// sarak-allow-hardcode:',
        "const BRAND_BLUE = '#4285F4';",
      ].join('\n'),
    });
    expect(status).toBe(1);
    expect(stdout).toContain('#4285F4');
  });

  it('AINDA acusa o literal quando NÃO HÁ marcador nenhum (self-test negativo)', () => {
    const { status, stdout } = runGateAgainstFixture(GATE, {
      'src/components/Fixture.tsx': "const BRAND_BLUE = '#4285F4';",
    });
    expect(status).toBe(1);
    expect(stdout).toContain('#4285F4');
  });

  it('A PROVA QUE IMPORTA: o mesmo conteúdo marcado, em um caminho DIFERENTE (simulando `git mv`), continua liberado', () => {
    const conteudo = [
      '// sarak-allow-hardcode: cor oficial de marca de terceiro, não é tema.',
      "const BRAND_BLUE = '#4285F4';",
      'export const X = () => <div style={{ color: BRAND_BLUE }} />;',
    ].join('\n');
    const antes = runGateAgainstFixture(GATE, { 'src/components/atomic/Atoms/Fixture.tsx': conteudo });
    const depoisDoMv = runGateAgainstFixture(GATE, { 'src/components/atomic/Buttons/Fixture.tsx': conteudo });
    expect(antes.status).toBe(0);
    expect(depoisDoMv.status).toBe(0);
  });
});
