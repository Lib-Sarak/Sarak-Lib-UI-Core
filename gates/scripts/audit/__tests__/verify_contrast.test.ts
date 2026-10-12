// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  PAIRS,
  parseColor,
  compositeOverOpaque,
  contrastRatio,
  resolveChain,
  auditTheme,
  evaluatePair,
  type ContrastPair,
  auditThemeOppositeMode,
  auditContraparteRequired,
  CONTRAPARTE_EXEMPTION_LIST,
} from '../verify_contrast.ts';
import { sarakGetDefaultDesignState } from '../../../../src/core/Design/master-map.ts';
import { SARAK_GLOBAL_THEMES, type SarakThemePreset } from '../../../../src/core/Design/presets/themes/index.ts';

// Teste do PRÓPRIO GATE (R31, plan-24). Trava a MECÂNICA de cálculo — não o
// número de temas reprovados, que é baseline e muda a cada tema consertado
// na plan-24-1.

describe('parseColor', () => {
  it('resolve #rrggbb', () => {
    expect(parseColor('#ff0000')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
  });

  it('resolve #rgb (forma curta)', () => {
    expect(parseColor('#f00')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
  });

  it('resolve #rrggbbaa', () => {
    expect(parseColor('#ff000080')).toEqual({ r: 255, g: 0, b: 0, a: 128 / 255 });
  });

  it('resolve rgb() sem alfa', () => {
    expect(parseColor('rgb(10, 20, 30)')).toEqual({ r: 10, g: 20, b: 30, a: 1 });
  });

  it('resolve rgba() com alfa', () => {
    expect(parseColor('rgba(10, 20, 30, 0.5)')).toEqual({ r: 10, g: 20, b: 30, a: 0.5 });
  });

  it('resolve "transparent" como alfa zero', () => {
    expect(parseColor('transparent')).toEqual({ r: 0, g: 0, b: 0, a: 0 });
  });

  it('devolve null para hsl() — não chuta', () => {
    expect(parseColor('hsl(0, 100%, 50%)')).toBeNull();
  });

  it('devolve null para var() — não chuta', () => {
    expect(parseColor('var(--theme-primary)')).toBeNull();
  });

  it('devolve null para gradiente', () => {
    expect(parseColor('linear-gradient(#fff, #000)')).toBeNull();
  });

  it('devolve null para valor não-string', () => {
    expect(parseColor(42)).toBeNull();
  });
});

describe('compositeOverOpaque', () => {
  it('compõe um caso de alfa conhecido, à mão', () => {
    // 50% branco sobre preto opaco = cinza médio (127.5) em cada canal.
    const rgb = compositeOverOpaque({ r: 255, g: 255, b: 255, a: 0.5 }, [0, 0, 0]);
    expect(rgb).toEqual([127.5, 127.5, 127.5]);
  });

  it('alfa 1 ignora o fundo por completo', () => {
    const rgb = compositeOverOpaque({ r: 10, g: 20, b: 30, a: 1 }, [200, 200, 200]);
    expect(rgb).toEqual([10, 20, 30]);
  });

  it('alfa 0 devolve o fundo por completo', () => {
    const rgb = compositeOverOpaque({ r: 10, g: 20, b: 30, a: 0 }, [200, 200, 200]);
    expect(rgb).toEqual([200, 200, 200]);
  });
});

describe('contrastRatio', () => {
  it('preto sobre branco é 21:1 (o máximo da escala WCAG)', () => {
    expect(contrastRatio([0, 0, 0], [255, 255, 255])).toBeCloseTo(21, 5);
  });

  it('duas cores iguais é 1:1 (contraste nulo)', () => {
    expect(contrastRatio([120, 60, 200], [120, 60, 200])).toBeCloseTo(1, 5);
  });

  it('é simétrico — a ordem dos dois lados não muda o resultado', () => {
    const a = contrastRatio([255, 255, 255], [10, 10, 10]);
    const b = contrastRatio([10, 10, 10], [255, 255, 255]);
    expect(a).toBeCloseTo(b, 10);
  });
});

describe('resolveChain', () => {
  it('resolve uma cadeia de 1 elo opaco', () => {
    const result = resolveChain(['bg'], { bg: '#112233' });
    expect(result).toEqual({ ok: true, rgb: [0x11, 0x22, 0x33] });
  });

  it('compõe uma cadeia de 2 elos (elo próximo translúcido sobre base opaca)', () => {
    const result = resolveChain(['near', 'far'], { near: 'rgba(255,255,255,0.5)', far: '#000000' });
    expect(result).toEqual({ ok: true, rgb: [127.5, 127.5, 127.5] });
  });

  it('DECLARA (não chuta) quando a base final da cadeia ainda é translúcida', () => {
    const result = resolveChain(['near', 'far'], { near: '#ffffff', far: 'rgba(0,0,0,0.5)' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain('translúcida');
    }
  });

  it('DECLARA quando um elo não é parseável (hsl/var/gradiente)', () => {
    const result = resolveChain(['bg'], { bg: 'hsl(0,0%,0%)' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain('não parseável');
    }
  });
});

describe('PAIRS — o contrato da lista de pares reais (R31, veredito §11 da plan-24)', () => {
  it('tem exatamente 67 pares (36 originais + 31 que os componentes desenham)', () => {
    expect(PAIRS.length).toBe(67);
  });

  it('todo par exige 4,5:1 — nenhum relaxamento para "texto grande"', () => {
    expect(PAIRS.every((p) => p.min === 4.5)).toBe(true);
  });

  it('todo par declara ao menos um elo de fundo', () => {
    expect(PAIRS.every((p) => Array.isArray(p.bgChain) && p.bgChain.length > 0)).toBe(true);
  });
});

// O verificador mede os pares que os COMPONENTES desenham: a tinta a 10%
// (`token@0.1`), o texto que o motor escolhe sobre a cor sólida (`on:`) e o badge suave (`mix:`).
describe('pares que os componentes desenham', () => {
  const base = { ...sarakGetDefaultDesignState(), mode: 'light', colorBgBody: '#ffffff', cardBackgroundColor: '#ffffff' } as Record<string, unknown>;
  const pairOf = (fg: string, first: string): ContrastPair => {
    const found = PAIRS.find((p) => p.fg === fg && p.bgChain[0] === first);
    if (!found) throw new Error(`par ausente: ${fg} / ${first}`);
    return found;
  };

  it('um elo `token@0.1` é a cor do token com o alfa multiplicado por 0,1', () => {
    const design = { ...base, primaryColor: '#000000' };

    const result = resolveChain(['primaryColor@0.1', 'colorBgBody'], design);

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.rgb[0]).toBeCloseTo(229.5, 1); // 10% preto sobre branco
  });

  it('`on:` mede o texto ESCOLHIDO sobre a cor sólida — passa sobre qualquer cor opaca', () => {
    for (const color of ['#ffff00', '#00ff00', '#ff0000', '#808080', '#7f7fff', '#0b1020']) {
      const design = { ...base, primaryColor: color };
      const result = evaluatePair(pairOf('on:primaryColor', 'primaryColor'), design);

      expect(result.pulado, color).toBe(false);
      if (!result.pulado) expect(result.ratio, color).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('`on:` sobre cor que não é literal é DECLARADO como pulado, não chutado', () => {
    const result = evaluatePair(pairOf('on:primaryColor', 'primaryColor'), { ...base, primaryColor: 'hsl(10, 50%, 50%)' });

    expect(result.pulado).toBe(true);
  });

  it('MUTAÇÃO: sobre um fundo de meio-tom o badge suave (`mix:`) reprova', () => {
    const design = { ...base, colorBgBody: '#808080', cardBackgroundColor: '#808080', statusWarningColor: '#808080' };

    const result = evaluatePair(pairOf('mix:statusWarningColor', 'statusWarningColor@0.1'), design);

    expect(result.pulado).toBe(false);
    if (!result.pulado) {
      expect(result.pass).toBe(false);
      expect(result.ratio).toBeLessThan(4.5);
    }
  });

  it('CONTRAPROVA: sobre o fundo claro o mesmo badge passa', () => {
    const design = { ...base, statusWarningColor: '#fde047' };

    const result = evaluatePair(pairOf('mix:statusWarningColor', 'statusWarningColor@0.1'), design);

    expect(result.pulado).toBe(false);
    if (!result.pulado) expect(result.pass).toBe(true);
  });

  it('MUTAÇÃO: a mensagem de erro de campo (`inputErrorColor`) fraca sobre o corpo reprova', () => {
    const weak = evaluatePair(pairOf('inputErrorColor', 'colorBgBody'), { ...base, inputErrorColor: '#ff8f91' });
    const strong = evaluatePair(pairOf('inputErrorColor', 'colorBgBody'), { ...base, inputErrorColor: '#c70002' });

    expect(weak.pulado || weak.pass).toBe(false);
    expect(!strong.pulado && strong.pass).toBe(true);
  });

  it('MUTAÇÃO: o primário translúcido de um tema embarcado reintroduzido abaixo de 4,5:1 faz o tema reprovar', () => {
    const theme = { ...SARAK_GLOBAL_THEMES[0], design: { ...(SARAK_GLOBAL_THEMES[0].design as Record<string, unknown>), inputErrorColor: '#ffb3b3', colorBgBody: '#ffffff', mode: 'light' } } as SarakThemePreset;

    const report = auditTheme(theme);

    expect(report.falhas.some((f) => f.pair.fg === 'inputErrorColor')).toBe(true);
  });
});

// Segunda passada (plan-24-1, Passo 7) — mede o MODO OPOSTO ao nativo do
// tema. Não trava o número de temas reprovados (isso é baseline), só que a
// função RODA e devolve o mesmo formato de relatório que `auditTheme`.
describe('auditThemeOppositeMode — segunda passada (plan-24-1 · plan-26)', () => {
  it('roda para todos os temas shippados sem lançar, com o mesmo formato de auditTheme', () => {
    for (const theme of SARAK_GLOBAL_THEMES) {
      const nativo = auditTheme(theme);
      const oposto = auditThemeOppositeMode(theme);
      expect(oposto.id).toBe(nativo.id);
      expect(Array.isArray(oposto.resultados)).toBe(true);
      expect(oposto.resultados.length).toBe(PAIRS.length);
    }
  });

  it('todos os temas de referência passam AA nos dois modos (Decisão C · plan-24-1 · contraparte autorada · plan-26)', () => {
    for (const theme of SARAK_GLOBAL_THEMES) {
      const oposto = auditThemeOppositeMode(theme);
      expect(oposto.falhas, `tema "${theme.id}" reprova no modo oposto: ${JSON.stringify(oposto.falhas.map((f) => f.pair))}`).toEqual([]);
    }
  });

  it('mede a contraparte AUTORADA quando existe — não o sintetizado (plan-26)', () => {
    // Tema sintético: fundo nativo escuro, contraparte com um fundo claro
    // ESCOLHIDO (não o que `syncThemeWithMode` geraria) — se a 2ª passada
    // medisse o sintetizado, este valor exato nunca apareceria no resultado.
    const theme = {
      id: 'sarak-sovereign', // id válido só para satisfazer o tipo; não é usado para lookup
      name: 'x',
      description: 'x',
      design: { mode: 'dark', colorBgBody: '#050505', textColorMaster: '#ffffff' },
      contraparte: { colorBgBody: '#f5f0e8', textColorMaster: '#1a1208' },
    } as unknown as SarakThemePreset;

    const oposto = auditThemeOppositeMode(theme);
    const parBgBody = oposto.resultados.find((r) => r.pair.fg === 'textColorMaster' && r.pair.bgChain[0] === 'colorBgBody');
    expect(parBgBody && !parBgBody.pulado ? true : false).toBe(true);
  });
});

// A EXIGÊNCIA de contraparte (plan-26 §2.4/§3.1 item 6) — o gate, não o tipo.
describe('auditContraparteRequired', () => {
  it('a lista de isenção está vazia — todo tema do catálogo shippado tem contraparte autorada', () => {
    expect(CONTRAPARTE_EXEMPTION_LIST.length).toBe(0);
  });

  it('sobre GLOBAL_THEMES hoje: um isento por tema legado sem contraparte, e nenhum faltando', () => {
    const audit = auditContraparteRequired(SARAK_GLOBAL_THEMES);
    const comContraparte = SARAK_GLOBAL_THEMES.filter((t) => Boolean(t.contraparte)).length;
    expect(audit.isentos.length).toBe(SARAK_GLOBAL_THEMES.length - comContraparte);
    expect(audit.faltando).toEqual([]);
  });

  it('acusa um tema fora da isenção sem contraparte', () => {
    const semContraparte = { id: 'tema-novo-sem-contraparte', name: 'x', description: 'x', design: { mode: 'dark' } } as unknown as SarakThemePreset;
    const audit = auditContraparteRequired([...SARAK_GLOBAL_THEMES, semContraparte]);
    expect(audit.faltando).toEqual(['tema-novo-sem-contraparte']);
  });
});

// Vão de cobertura (R31): sete pares tinham cadeia de fundo que não terminava numa base
// opaca; com barra, botão ou superfície translúcidos o par era declarado pulado. Toda
// cadeia agora termina em `colorBgBody`.
describe('PAIRS — nenhuma cadeia termina em fundo que pode ser translúcido', () => {
  const translucentSidebar = {
    ...sarakGetDefaultDesignState(),
    colorBgBody: '#101010',
    sidebarColor: 'rgba(255, 255, 255, 0.5)',
    textColorMaster: '#ffffff',
  } as Record<string, unknown>;

  it('PLANTADO: a cadeia antiga de um elo só ficava PULADA com sidebarColor translúcido', () => {
    const cadeiaAntiga: ContrastPair = { fg: 'textColorMaster', bgChain: ['sidebarColor'], min: 4.5 };
    expect(evaluatePair(cadeiaAntiga, translucentSidebar).pulado).toBe(true);
  });

  it('o par real textColorMaster / sidebarColor compõe sobre colorBgBody e é MEDIDO, não pulado', () => {
    const par = PAIRS.find((p) => p.fg === 'textColorMaster' && p.bgChain[0] === 'sidebarColor') as ContrastPair;
    expect(par.bgChain).toEqual(['sidebarColor', 'colorBgBody']);
    const result = evaluatePair(par, translucentSidebar);
    expect(result.pulado).toBe(false);
  });

  it('nenhum par é pulado em nenhum tema do catálogo, nos dois modos', () => {
    const pulados = SARAK_GLOBAL_THEMES.flatMap((theme) =>
      [auditTheme(theme), auditThemeOppositeMode(theme)].flatMap((r) => r.pulados.map((p) => `${r.id}: ${p.pair.fg} / ${p.pair.bgChain[0]}`)),
    );
    expect(pulados).toEqual([]);
  });

  it('kinetic-flow, no modo oposto, passa os dois pares do item de navegação ativo', () => {
    const theme = SARAK_GLOBAL_THEMES.find((t) => t.id === 'kinetic-flow') as SarakThemePreset;
    const nav = auditThemeOppositeMode(theme).resultados.filter((r) => r.pair.fg === 'navItemActiveColor');
    expect(nav).toHaveLength(2);
    nav.forEach((r) => expect(!r.pulado && r.pass).toBe(true));
  });
});

describe('var(--tema) que espelha outro token de cor do próprio tema', () => {
    const base = {
        ...sarakGetDefaultDesignState(),
        colorBgBody: '#000000',
        surfaceColor: '#101010',
        titleColor: '#ffffff',
        tooltipBg: 'var(--theme-surface)',
        tooltipTextColor: 'var(--color-theme-title, #ffffff)',
    } as Record<string, unknown>;

    it('o padrão de tooltipBg/tooltipTextColor resolve pelo surfaceColor e pelo titleColor — o par é medido', () => {
        const par = PAIRS.find((p) => p.fg === 'tooltipTextColor') as ContrastPair;
        const result = evaluatePair(par, base);
        expect(result.pulado).toBe(false);
        expect(result.pulado === false && result.ratio).toBeGreaterThan(10);
    });

    it('var() de variável desconhecida segue pulada, sem chutar cor', () => {
        const par = PAIRS.find((p) => p.fg === 'tooltipTextColor') as ContrastPair;
        const result = evaluatePair(par, { ...base, tooltipTextColor: 'var(--minha-cor)' });
        expect(result.pulado).toBe(true);
    });
});
