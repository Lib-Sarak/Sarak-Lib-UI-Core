// @vitest-environment node
// Teste do PRÓPRIO GATE (plan-45): `barrel:check` cobra componente, nunca cobriu
// tipo — um tipo podia ficar declarado em dist/index.d.ts e nunca chegar ao bloco
// `export { … }` final, sem gate nenhum acusando (foi o achado de um consumidor
// real: TS2459 em `SarakThemePayload`). Casos PLANTADOS que o gate PEGA (tipo
// esquecido, exclusão obsoleta) e os que ele DEIXA PASSAR (exportado, ou na
// allowlist com motivo) — e, por fim, o repositório real.
import fs from 'fs';
import os from 'os';
import path from 'path';
import { describe, expect, it, afterEach } from 'vitest';
import {
  parseDeclaredTypeNames,
  parseExportedNames,
  runPublicTypesParityCheck,
} from '../check-public-types-parity.mjs';

const scratchDirs = [];

function makeFixture(dtsContent) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-types-parity-'));
  scratchDirs.push(root);
  const distDir = path.join(root, 'dist');
  fs.mkdirSync(distDir, { recursive: true });
  const file = path.join(distDir, 'index.d.ts');
  fs.writeFileSync(file, dtsContent, 'utf8');
  return file;
}

afterEach(() => {
  while (scratchDirs.length) {
    fs.rmSync(scratchDirs.pop(), { recursive: true, force: true });
  }
});

describe('parseDeclaredTypeNames — plan-45', () => {
  it('acha interface e type de nível superior, com e sem "declare"', () => {
    const content = [
      'interface Foo {}',
      'declare interface Bar {}',
      'type Baz = string;',
      'declare const notAType: number;',
    ].join('\n');
    expect(parseDeclaredTypeNames(content)).toEqual(new Set(['Foo', 'Bar', 'Baz']));
  });
});

describe('parseExportedNames — plan-45', () => {
  it('extrai nomes de um bloco export { } de uma linha só, com "type" e "as"', () => {
    const content = 'export { type Foo, Bar, Baz as Qux };\n';
    expect(parseExportedNames(content)).toEqual(new Set(['Foo', 'Bar', 'Qux']));
  });

  it('devolve conjunto vazio quando não há bloco export { }', () => {
    expect(parseExportedNames('interface Foo {}\n')).toEqual(new Set());
  });
});

describe('runPublicTypesParityCheck — plan-45 (o defeito real: TS2459)', () => {
  it('PLANTADO: tipo declarado e NÃO exportado — reprova, sem allowlist', () => {
    const distIndexDts = makeFixture([
      'interface SarakThemePayload {}',
      'interface SarakUIOptions { onSave?: (p: SarakThemePayload) => void; }',
      "export { SarakUIOptions };",
    ].join('\n'));

    const { missing, staleExclusions } = runPublicTypesParityCheck({ distIndexDts, exclusions: {} });
    expect(missing).toEqual(['SarakThemePayload']);
    expect(staleExclusions).toEqual([]);
  });

  it('libera tipo declarado e exportado', () => {
    const distIndexDts = makeFixture([
      'interface SarakThemePayload {}',
      'export { type SarakThemePayload };',
    ].join('\n'));

    expect(runPublicTypesParityCheck({ distIndexDts, exclusions: {} }).missing).toEqual([]);
  });

  it('libera tipo declarado e NÃO exportado quando está na allowlist, com motivo', () => {
    const distIndexDts = makeFixture([
      'interface SarakRuntimeExtras {}',
      'interface SarakDesignState {}',
      'export { type SarakDesignState };',
    ].join('\n'));

    const { missing, staleExclusions } = runPublicTypesParityCheck({
      distIndexDts,
      exclusions: { SarakRuntimeExtras: 'detalhe de composição interna, ver types.ts' },
    });
    expect(missing).toEqual([]);
    expect(staleExclusions).toEqual([]);
  });

  it('PLANTADO: exclusão OBSOLETA — o tipo da allowlist passou a ser exportado', () => {
    const distIndexDts = makeFixture([
      'interface SarakThemePayload {}',
      'export { type SarakThemePayload };',
    ].join('\n'));

    const { missing, staleExclusions } = runPublicTypesParityCheck({
      distIndexDts,
      exclusions: { SarakThemePayload: 'motivo qualquer, agora obsoleto' },
    });
    expect(missing).toEqual([]);
    expect(staleExclusions).toEqual(['SarakThemePayload']);
  });

  it('reporta erro (não estoura) quando dist/index.d.ts não existe', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-types-parity-missing-'));
    scratchDirs.push(root);
    const { missing, staleExclusions, error } = runPublicTypesParityCheck({
      distIndexDts: path.join(root, 'dist', 'index.d.ts'),
      exclusions: {},
    });
    expect(missing).toEqual([]);
    expect(staleExclusions).toEqual([]);
    expect(error).toContain('não existe');
  });
});

describe('check-public-types-parity — repositório real (plan-45)', () => {
  it('todo tipo declarado em dist/index.d.ts real está exportado ou tem exclusão com motivo', () => {
    const { missing, staleExclusions, error } = runPublicTypesParityCheck();
    expect(error).toBeNull();
    expect(missing).toEqual([]);
    expect(staleExclusions).toEqual([]);
  });

  it('os 3 tipos EXATOS do achado desta plan continuam importáveis pelo nome (não regridem para a allowlist)', () => {
    const { missing } = runPublicTypesParityCheck();
    expect(missing).not.toContain('SarakThemePayload');
    expect(missing).not.toContain('SarakUIOptions');
    expect(missing).not.toContain('ThemeEntry');
  });
});
