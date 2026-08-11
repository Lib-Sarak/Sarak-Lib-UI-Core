import { describe, expect, it } from 'vitest';
import { PAIRS, parseColor, compositeOverOpaque, contrastRatio, resolveChain } from '../verify_contrast.ts';

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
  it('tem exatamente 36 pares', () => {
    expect(PAIRS.length).toBe(36);
  });

  it('todo par exige 4,5:1 — nenhum relaxamento para "texto grande"', () => {
    expect(PAIRS.every((p) => p.min === 4.5)).toBe(true);
  });

  it('todo par declara ao menos um elo de fundo', () => {
    expect(PAIRS.every((p) => Array.isArray(p.bgChain) && p.bgChain.length > 0)).toBe(true);
  });
});
