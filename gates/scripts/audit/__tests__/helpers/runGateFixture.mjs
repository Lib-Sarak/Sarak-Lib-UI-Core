import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Roda um script de gate (que resolve caminhos com `path.resolve('src/...')`,
// relativo ao `process.cwd()`) contra uma árvore de arquivos plantada em um
// diretório temporário isolado — sem tocar o repositório real.
//
// `files`: mapa `caminhoRelativo -> conteúdo`. Cada chave vira um arquivo sob o
// diretório temporário (que passa a ser o `cwd` do processo filho).
export function runGateAgainstFixture(gateAbsPath, files) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-gate-fixture-'));
  try {
    for (const [rel, content] of Object.entries(files)) {
      const full = path.join(tmpDir, rel);
      fs.mkdirSync(path.dirname(full), { recursive: true });
      fs.writeFileSync(full, content, 'utf8');
    }
    const result = spawnSync('node', [gateAbsPath], { cwd: tmpDir, encoding: 'utf8' });
    return { status: result.status, stdout: result.stdout, stderr: result.stderr };
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}
