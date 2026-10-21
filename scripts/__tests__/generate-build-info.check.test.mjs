// @vitest-environment node
// Teste do PRÓPRIO GATE (plan-12, vão 8): `generate-build-info.mjs --check`
// não existia — o artefato gerado `dist/BUILD_INFO.json` nunca era conferido.
// Um caso que ele PEGA (libVersion desatualizado) e um que ele DEIXA PASSAR.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { checkBuildInfo } from '../generate-build-info.mjs';

function checkTmpBuildInfo(content, { currentVersion, bundleContent = content } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-build-info-'));
  const distDir = path.join(dir, 'dist');
  const destFile = path.join(distDir, 'BUILD_INFO.json');
  const sourceFile = path.join(dir, 'buildInfo.ts');
  const publicSourceFile = path.join(dir, 'publicBuildInfo.ts');
  fs.mkdirSync(distDir);
  fs.writeFileSync(destFile, JSON.stringify(content, null, 4));
  fs.writeFileSync(sourceFile, `export const SARAK_BUILD_INFO = ${JSON.stringify(content, null, 4)} as const;\n`);
  const publicContent = {
    libVersion: content.libVersion,
    baseCommitShort: content.baseCommitShort,
    builtAt: content.builtAt,
  };
  fs.writeFileSync(publicSourceFile, `export const SARAK_BUILD_INFO = ${JSON.stringify(publicContent, null, 4)} as const;\n`);

  const seal = JSON.stringify({
    libVersion: bundleContent.libVersion,
    baseCommitShort: bundleContent.baseCommitShort,
    builtAt: bundleContent.builtAt,
  });
  for (const bundleName of ['index.js', 'index.cjs']) {
    fs.writeFileSync(path.join(distDir, bundleName), `const stamp = 'data-sarak-build-info'; const value = ${JSON.stringify(seal)};`);
  }

  try {
    return checkBuildInfo({ destFile, sourceFile, publicSourceFile, distDir, currentVersion });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

describe('checkBuildInfo', () => {
  it('acusa libVersion desatualizado em relação ao package.json', () => {
    const problemas = checkTmpBuildInfo({
      baseCommit: 'abc1234567890',
      baseCommitShort: 'abc1234',
      builtAt: new Date().toISOString(),
      libVersion: '0.0.1',
      note: 'x',
    }, { currentVersion: '1.2.1' });
    expect(problemas).toHaveLength(1);
    expect(problemas[0]).toContain('libVersion');
  });

  it('libera um BUILD_INFO.json íntegro e em dia', () => {
    const problemas = checkTmpBuildInfo({
      baseCommit: 'abc1234567890',
      baseCommitShort: 'abc1234',
      builtAt: new Date().toISOString(),
      libVersion: '1.2.1',
      note: 'x',
    }, { currentVersion: '1.2.1' });
    expect(problemas).toEqual([]);
  });

  it('reprova quando o selo embutido diverge do BUILD_INFO.json', () => {
    const buildInfo = {
      baseCommit: 'abc1234567890',
      baseCommitShort: 'abc1234',
      builtAt: '2026-10-04T12:00:00.000Z',
      libVersion: '1.2.1',
      note: 'x',
    };
    const problemas = checkTmpBuildInfo(buildInfo, {
      currentVersion: '1.2.1',
      bundleContent: { ...buildInfo, builtAt: '2026-10-03T12:00:00.000Z' },
    });

    expect(problemas).toHaveLength(2);
    expect(problemas.join(' ')).toContain('index.js');
    expect(problemas.join(' ')).toContain('index.cjs');
  });

  it('acusa arquivo ausente', () => {
    const problemas = checkBuildInfo({ destFile: path.join(os.tmpdir(), 'nao-existe-BUILD_INFO.json'), currentVersion: '1.2.1' });
    expect(problemas[0]).toContain('não existe');
  });
});
