// Teste do PRÓPRIO GATE (plan-12, vão 7): nenhum gate validava ponteiro de
// SEÇÃO (`§N.N`) — achado 29 (`sarak-dev/GUIA-MANUTENCAO.md:308`, "regenere
// com o script do §5.1 do guia", seção 5 sem subseção nenhuma). As DUAS
// convenções que precisavam estar codificadas antes de ligar: heading real
// `## N.M` em qualquer nível, e "item M da lista numerada da seção N".
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { checkSectionPointers } from '../check-section-pointers.mjs';

function montarFixture(nomeArquivo, conteudo) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-section-pointers-'));
  fs.writeFileSync(path.join(root, nomeArquivo), conteudo);
  return { root, files: [nomeArquivo] };
}

describe('checkSectionPointers — autorreferência', () => {
  it('acusa §N.M morto quando a subseção não existe nem como heading nem como item numerado', () => {
    const { root, files } = montarFixture(
      'doc.md',
      ['# 5. Lacunas', '', 'Sem subseção nem lista numerada aqui.', '', 'Ver §5.1.'].join('\n'),
    );
    const { mortos } = checkSectionPointers({ root, files });
    expect(mortos).toEqual([{ arquivo: 'doc.md', linha: 5, secao: '5.1' }]);
  });

  it('libera §N.M quando existe um heading "## N.M" real, mesmo sem "# N" pai imediato', () => {
    const { root, files } = montarFixture(
      'doc.md',
      ['## 2.1 Subseção órfã de pai', '', 'conteúdo', '', 'Ver §2.1.'].join('\n'),
    );
    const { mortos } = checkSectionPointers({ root, files });
    expect(mortos).toEqual([]);
  });

  it('libera §N.M quando M é um item de LISTA NUMERADA sob a seção N (convenção "§7.3 = item 3")', () => {
    const { root, files } = montarFixture(
      'doc.md',
      ['# 7. Proibições', '', '1. Primeira', '2. Segunda', '3. Terceira', '', '# 8. Próxima', '', 'Ver §7.3.'].join('\n'),
    );
    const { mortos } = checkSectionPointers({ root, files });
    expect(mortos).toEqual([]);
  });

  it('acusa §N.M quando M EXCEDE a contagem de itens numerados da seção N', () => {
    const { root, files } = montarFixture(
      'doc.md',
      ['# 7. Proibições', '', '1. Primeira', '2. Segunda', '', 'Ver §7.5.'].join('\n'),
    );
    const { mortos } = checkSectionPointers({ root, files });
    expect(mortos).toEqual([{ arquivo: 'doc.md', linha: 6, secao: '7.5' }]);
  });

  it('libera §N (sem decimal) quando a seção N existe', () => {
    const { root, files } = montarFixture('doc.md', ['# 9. Fecho', '', 'Ver §9.'].join('\n'));
    const { mortos } = checkSectionPointers({ root, files });
    expect(mortos).toEqual([]);
  });

  it('IGNORA (não acusa) §N.M com qualificador de outro documento — fora do escopo desta versão', () => {
    const { root, files } = montarFixture(
      'doc.md',
      ['# 1. Único', '', 'Ver [[outro-documento]] §9.9.', 'Ver `outro.md` §9.9.'].join('\n'),
    );
    const { mortos, ignoradosComQualificador } = checkSectionPointers({ root, files });
    expect(mortos).toEqual([]);
    expect(ignoradosComQualificador).toBe(2);
  });
});

// plan-17 (2026-08-08) — calibração: dois falsos positivos medidos pela plan-15,
// consertados no PRÓPRIO GATE (nunca afrouxando a regra R23). Self-test por
// conserto: um caso que AINDA pega, um caso que PASSOU a liberar.
describe('checkSectionPointers — convenção 3c: rótulo de linha de tabela', () => {
  it('libera §N.M quando existe uma linha de tabela "| **N.M** |" no corpo da seção N', () => {
    const { root, files } = montarFixture(
      'doc.md',
      [
        '# 5. Lacunas conhecidas',
        '',
        '| # | Lacuna |',
        '| --- | --- |',
        '| **5.1** | Nenhum gate de a11y |',
        '',
        'Ver §5.1.',
      ].join('\n'),
    );
    const { mortos } = checkSectionPointers({ root, files });
    expect(mortos).toEqual([]);
  });

  it('AINDA acusa §N.M quando a linha de tabela "**N.M**" não existe na seção N (self-test negativo)', () => {
    const { root, files } = montarFixture(
      'doc.md',
      [
        '# 5. Lacunas conhecidas',
        '',
        '| # | Lacuna |',
        '| --- | --- |',
        '| **5.1** | Nenhum gate de a11y |',
        '',
        'Ver §5.9 (linha de tabela inexistente).',
      ].join('\n'),
    );
    const { mortos } = checkSectionPointers({ root, files });
    expect(mortos).toEqual([{ arquivo: 'doc.md', linha: 7, secao: '5.9' }]);
  });
});

describe('checkSectionPointers — qualificador ampliado (item 4 do LIMITES DECLARADOS)', () => {
  it('IGNORA §N.M com qualificador `.md` DEPOIS do §, na mesma linha (antes só olhava os 40 chars ANTES)', () => {
    const { root, files } = montarFixture(
      'doc.md',
      ['# 1. Único', '', 'Está na §9 de [`outro-doc`](outro-doc.md).'].join('\n'),
    );
    const { mortos, ignoradosComQualificador } = checkSectionPointers({ root, files });
    expect(mortos).toEqual([]);
    expect(ignoradosComQualificador).toBe(1);
  });

  it('IGNORA §N.M com qualificador wikilink na linha SEGUINTE', () => {
    const { root, files } = montarFixture(
      'doc.md',
      ['# 1. Único', '', 'Ver §9.9', '(conforme [[outro-documento]]).'].join('\n'),
    );
    const { mortos, ignoradosComQualificador } = checkSectionPointers({ root, files });
    expect(mortos).toEqual([]);
    expect(ignoradosComQualificador).toBe(1);
  });

  it('IGNORA §N.M com qualificador em forma de PROSA ("do guia") na mesma linha', () => {
    const { root, files } = montarFixture(
      'doc.md',
      ['# 1. Único', '', 'A árvore de decisão é a §0 do guia.'].join('\n'),
    );
    const { mortos, ignoradosComQualificador } = checkSectionPointers({ root, files });
    expect(mortos).toEqual([]);
    expect(ignoradosComQualificador).toBe(1);
  });

  it('AINDA acusa §N.M morto sem NENHUM qualificador na linha, na anterior ou na seguinte (self-test negativo)', () => {
    const { root, files } = montarFixture(
      'doc.md',
      ['# 1. Único', '', 'Linha isolada, sem qualificador.', 'Ver §9.9 aqui.', 'Outra linha isolada.'].join('\n'),
    );
    const { mortos } = checkSectionPointers({ root, files });
    expect(mortos).toEqual([{ arquivo: 'doc.md', linha: 4, secao: '9.9' }]);
  });
});
