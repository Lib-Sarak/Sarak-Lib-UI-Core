// @vitest-environment node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { runGateAgainstFixture } from './helpers/runGateFixture.mjs';

// Teste do PRÓPRIO GATE: o detector de valor lê `.ts` além de `.tsx`, com três isenções de
// escopo (dado de design, matemática de cor, condição de container query). Cada caso planta
// um arquivo numa árvore isolada e confere o código de saída.

const GATE = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'auditor_hardcoded.mjs',
);

const CLASS_WITH_PX = "export const LAYOUT = 'shrink-0 w-[12px]';";

describe('auditor_hardcoded — .ts entra no detector de valor', () => {
  it('reprova classe com medida literal num .ts de src/components/', () => {
    const { status, stdout } = runGateAgainstFixture(GATE, {
      'src/components/atomic/DataDisplay/Fixture/fixtureLayout.ts': CLASS_WITH_PX,
    });
    expect(status).toBe(1);
    expect(stdout).toContain('fixtureLayout.ts');
    expect(stdout).toContain('w-[12px]');
  });

  it('o mesmo valor num tema (dado de design) passa', () => {
    const { status } = runGateAgainstFixture(GATE, {
      'src/core/Design/presets/themes/fixture-theme.ts': CLASS_WITH_PX,
    });
    expect(status).toBe(0);
  });

  it('a isenção do dado de design vale para schema/ e palette/ também', () => {
    const { status } = runGateAgainstFixture(GATE, {
      'src/core/Design/schema/fixture.ts': "export const D = { defaultValue: '#ffffff' };",
      'src/core/Design/palette/fixture.ts': "export const P = '12px';",
    });
    expect(status).toBe(0);
  });

  it('um .tsx dentro da pasta de dado de design continua cobrado', () => {
    const { status, stdout } = runGateAgainstFixture(GATE, {
      'src/core/Design/presets/Fixture.tsx': "export const X = () => <div style={{ width: '40px' }} />;",
    });
    expect(status).toBe(1);
    expect(stdout).toContain('40px');
  });

  it('a declaração .d.ts não é lida', () => {
    const { status } = runGateAgainstFixture(GATE, {
      'src/components/fixture.d.ts': "export declare const X: '12px';",
    });
    expect(status).toBe(0);
  });

  it('o marcador sarak-allow-hardcode com motivo isenta o literal num .ts', () => {
    const { status } = runGateAgainstFixture(GATE, {
      'src/components/atomic/hooks/fixtureStyles.ts':
        "// sarak-allow-hardcode: motivo escrito\nexport const S = '0 0 20px';",
    });
    expect(status).toBe(0);
  });
});

describe('auditor_hardcoded — condição de container query', () => {
  it('a condição @min-[768px] não é acusada', () => {
    const { status } = runGateAgainstFixture(GATE, {
      'src/components/atomic/hooks/fixtureResponsive.ts': "export const R = 'flex flex-col @min-[768px]:flex-row @max-[1024px]:hidden';",
    });
    expect(status).toBe(0);
  });

  it('a classe que a condição liga continua cobrada', () => {
    const { status, stdout } = runGateAgainstFixture(GATE, {
      'src/components/atomic/hooks/fixtureResponsive.ts': "export const R = '@min-[768px]:w-[12px]';",
    });
    expect(status).toBe(1);
    expect(stdout).toContain('w-[12px]');
  });

  it('a isenção vale também num .tsx', () => {
    const { status } = runGateAgainstFixture(GATE, {
      'src/components/atomic/Fixture.tsx': "export const X = () => <div className=\"@min-[640px]:block\" />;",
    });
    expect(status).toBe(0);
  });
});

describe('auditor_hardcoded — matemática de cor', () => {
  it('os três arquivos de matemática de cor passam', () => {
    const { status } = runGateAgainstFixture(GATE, {
      'src/components/atomic/Inputs/internal/colorMath.ts': "export const BLACK = '#000000';",
      'src/core/Provider/utils/on-color.ts': "export const WHITE = '#ffffff';",
      'src/features/DesignEngine/components/controls/colorParts.ts': "export const MID = '#808080';",
    });
    expect(status).toBe(0);
  });

  it('a isenção é pelo caminho exato: o mesmo nome em outra pasta é cobrado', () => {
    const { status, stdout } = runGateAgainstFixture(GATE, {
      'src/core/Provider/other/on-color.ts': "export const WHITE = '#ffffff';",
    });
    expect(status).toBe(1);
    expect(stdout).toContain('#ffffff');
  });
});
