// Teste do PRÓPRIO GATE (plan-12, R30 promovida): a contagem de `tsc` passou
// a classificar produção × teste — produção é hard-block SEMPRE, teste
// continua tolerado via baseline. Um caso que PEGA (erro em produção) e um
// que LIBERA (erro só em arquivo de teste).
import { describe, expect, it } from 'vitest';
import { classifyTscOutput } from '../check-audit-baseline.mjs';

const linhaProducao = "src/core/Design/master-map.ts(12,34): error TS2322: Type 'number' is not assignable to type 'string'.";
const linhaTeste = "src/core/Provider/__tests__/Foo.test.tsx(5,10): error TS7006: Parameter 'x' implicitly has an 'any' type.";
const linhaSpec = "src/components/atomic/Templates/__tests__/Spec21.spec.tsx(3,3): error TS2741: Property missing.";

describe('classifyTscOutput — R30 promovida (produção × teste)', () => {
  it('classifica erro em src/ de produção como "producao", não "teste"', () => {
    const r = classifyTscOutput(linhaProducao);
    expect(r.producao).toBe(1);
    expect(r.teste).toBe(0);
    expect(r.linhasProducao).toHaveLength(1);
  });

  it('classifica erro em __tests__/ e .spec. como "teste", não "producao"', () => {
    const r = classifyTscOutput([linhaTeste, linhaSpec].join('\n'));
    expect(r.producao).toBe(0);
    expect(r.teste).toBe(2);
    expect(r.linhasProducao).toEqual([]);
  });

  it('soma os dois baldes em "erros"', () => {
    const r = classifyTscOutput([linhaProducao, linhaTeste].join('\n'));
    expect(r.erros).toBe(2);
  });

  it('libera saída sem nenhum "error TS"', () => {
    const r = classifyTscOutput('Compilação limpa, nada aqui.');
    expect(r).toEqual({ erros: 0, producao: 0, teste: 0, linhasProducao: [] });
  });
});
