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
