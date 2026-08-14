// Teste do PRÓPRIO GATE (plan-39): nenhum gate existia para "classe de container
// query montada por interpolação nunca chega ao CSS" — só o defeito real
// (TopbarNav.tsx:114 e outros), sem verificação. Um caso PLANTADO que ele PEGA
// (interpolação) e um que ele DEIXA PASSAR (literal, e o mesmo caso dentro de
// `__tests__/`, onde a interpolação é o idioma correto).
import fs from 'fs';
import os from 'os';
import path from 'path';
import { describe, expect, it, afterEach } from 'vitest';
import {
  findInterpolatedContainerQueries,
  findInvalidMeasureContainerQueries,
  isValidMeasure,
  checkSourceRestriction,
} from '../check-container-query-literal.mjs';

const scratchDirs = [];

function makeFixture(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-cq-'));
  scratchDirs.push(root);
  for (const [relPath, content] of Object.entries(files)) {
    const full = path.join(root, relPath);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content, 'utf8');
  }
  return root;
}

afterEach(() => {
  while (scratchDirs.length) {
    fs.rmSync(scratchDirs.pop(), { recursive: true, force: true });
  }
});

describe('findInterpolatedContainerQueries — plan-39', () => {
  it('acusa classe de container query montada por interpolação em arquivo de produção', () => {
    const root = makeFixture({
      'Foo.tsx': "export const cls = `hidden @min-[${BREAKPOINT_DESKTOP}px]:flex`;\n",
    });
    const problemas = findInterpolatedContainerQueries({ root, relativeTo: root });
    expect(problemas).toEqual([{ arquivo: 'Foo.tsx', linha: 1 }]);
  });

  it('libera classe LITERAL (o conserto desta plan)', () => {
    const root = makeFixture({
      'Foo.tsx': "export const cls = 'hidden @min-[1024px]:flex';\n",
    });
    expect(findInterpolatedContainerQueries({ root, relativeTo: root })).toEqual([]);
  });

  it('ignora __tests__/ — o teste companheiro continua interpolando de propósito', () => {
    const root = makeFixture({
      '__tests__/Foo.test.ts': "expect(cls).toBe(`hidden @min-[${BREAKPOINT_DESKTOP}px]:flex`);\n",
    });
    expect(findInterpolatedContainerQueries({ root, relativeTo: root })).toEqual([]);
  });
});

describe('isValidMeasure — plan-44', () => {
  it('aceita número + unidade CSS', () => {
    expect(isValidMeasure('768px')).toBe(true);
    expect(isValidMeasure('48rem')).toBe(true);
    expect(isValidMeasure('1024')).toBe(false); // sem unidade — não é medida válida
  });

  it('rejeita placeholder e reticências', () => {
    expect(isValidMeasure('…')).toBe(false);
    expect(isValidMeasure('N')).toBe(false);
    expect(isValidMeasure('Npx')).toBe(false);
    expect(isValidMeasure('')).toBe(false);
  });
});

describe('findInvalidMeasureContainerQueries — plan-44 (o defeito que derrubou o build)', () => {
  it('PLANTADO: acusa @min-[…]:grid-cols-12 — o texto EXATO que quebrou o build (SarakGrid.test.tsx:12)', () => {
    const root = makeFixture({
      'Foo.tsx': '// @min-[…]:grid-cols-12\n',
    });
    const problemas = findInvalidMeasureContainerQueries({ root, relativeTo: root });
    expect(problemas).toEqual([{ arquivo: 'Foo.tsx', linha: 1, medida: '…', utilitario: 'grid-cols-12' }]);
  });

  it('PLANTADO: acusa dentro de __tests__/ — é exatamente o buraco que deixou passar SarakGrid.test.tsx:12', () => {
    const root = makeFixture({
      '__tests__/Foo.test.tsx': '// @min-[…]:grid-cols-12\n',
    });
    const problemas = findInvalidMeasureContainerQueries({ root, relativeTo: root });
    expect(problemas).toEqual([{ arquivo: '__tests__/Foo.test.tsx', linha: 1, medida: '…', utilitario: 'grid-cols-12' }]);
  });

  it('libera @min-[768px]:grid-cols-12 — medida válida', () => {
    const root = makeFixture({
      'Foo.tsx': "export const cls = '@min-[768px]:grid-cols-12';\n",
    });
    expect(findInvalidMeasureContainerQueries({ root, relativeTo: root })).toEqual([]);
  });

  it('libera @min-[…] SOZINHO, sem utilitário depois — não forma candidato', () => {
    const root = makeFixture({
      'Foo.tsx': '// container query: prefixo @min-[…] explicado aqui\n',
    });
    expect(findInvalidMeasureContainerQueries({ root, relativeTo: root })).toEqual([]);
  });

  it('ignora bracket interpolado (${...}) — delega para findInterpolatedContainerQueries / idioma de teste', () => {
    const root = makeFixture({
      'Foo.tsx': 'export const cls = `@min-[${BREAKPOINT_DESKTOP}px]:flex`;\n',
    });
    expect(findInvalidMeasureContainerQueries({ root, relativeTo: root })).toEqual([]);
  });
});

describe('checkSourceRestriction — plan-39, emenda §2.0', () => {
  it('acusa @import "tailwindcss" SEM source(none) — a detecção automática volta a varrer o repo inteiro', () => {
    const root = makeFixture({
      'sarak-base.css': '@import "tailwindcss";\n@source "../**/*.{ts,tsx}";\n',
    });
    const problemas = checkSourceRestriction({ file: path.join(root, 'sarak-base.css') });
    expect(problemas).toHaveLength(1);
    expect(problemas[0]).toContain('source(none)');
  });

  it('acusa a ausência de @source explícito, mesmo com source(none)', () => {
    const root = makeFixture({
      'sarak-base.css': '@import "tailwindcss" source(none);\n',
    });
    const problemas = checkSourceRestriction({ file: path.join(root, 'sarak-base.css') });
    expect(problemas).toHaveLength(1);
    expect(problemas[0]).toContain('@source');
  });

  it('libera source(none) + @source explícito juntos (o conserto da emenda §2.0)', () => {
    const root = makeFixture({
      'sarak-base.css': '@import "tailwindcss" source(none);\n@source "../**/*.{ts,tsx}";\n',
    });
    expect(checkSourceRestriction({ file: path.join(root, 'sarak-base.css') })).toEqual([]);
  });
});

describe('check-container-query-literal — repositório real (plan-44)', () => {
  it('nenhuma classe com medida inválida sobrou em src/, comentário incluído em __tests__/', () => {
    expect(findInvalidMeasureContainerQueries()).toEqual([]);
  });

  it('nenhuma interpolação sobrou em src/ de produção', () => {
    expect(findInterpolatedContainerQueries()).toEqual([]);
  });
});
