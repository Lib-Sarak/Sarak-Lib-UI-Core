// Teste do PRÓPRIO GATE (plan-12, vão 8): `generate-build-info.mjs --check`
// não existia — o artefato gerado `dist/BUILD_INFO.json` nunca era conferido.
// Um caso que ele PEGA (libVersion desatualizado) e um que ele DEIXA PASSAR.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { checkBuildInfo } from '../generate-build-info.mjs';

function writeTmpBuildInfo(content) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-build-info-'));
  const file = path.join(dir, 'BUILD_INFO.json');
  fs.writeFileSync(file, JSON.stringify(content, null, 4));
  return file;
}

describe('checkBuildInfo', () => {
  it('acusa libVersion desatualizado em relação ao package.json', () => {
    const destFile = writeTmpBuildInfo({
      baseCommit: 'abc1234567890',
      baseCommitShort: 'abc1234',
      builtAt: new Date().toISOString(),
      libVersion: '0.0.1',
      note: 'x',
    });
    const problemas = checkBuildInfo({ destFile, currentVersion: '1.2.1' });
    expect(problemas).toHaveLength(1);
    expect(problemas[0]).toContain('libVersion');
  });

  it('libera um BUILD_INFO.json íntegro e em dia', () => {
    const destFile = writeTmpBuildInfo({
      baseCommit: 'abc1234567890',
      baseCommitShort: 'abc1234',
      builtAt: new Date().toISOString(),
      libVersion: '1.2.1',
      note: 'x',
    });
    expect(checkBuildInfo({ destFile, currentVersion: '1.2.1' })).toEqual([]);
  });

  it('acusa arquivo ausente', () => {
    const problemas = checkBuildInfo({ destFile: path.join(os.tmpdir(), 'nao-existe-BUILD_INFO.json'), currentVersion: '1.2.1' });
    expect(problemas[0]).toContain('não existe');
  });
});
