// @vitest-environment node
//
// Teste do PRÓPRIO GATE (plan-12, R28): contrato de saída do CLI
// (`sarak-ui check [--notify]`). Nenhum teste exercitava `runCheckCli` —
// achado 26, "0 ocorrências de child_process/execSync nos testes de
// bin/scaffold/". As DUAS metades do contrato (specs/specs/00-regras-e-invariantes.md R28):
//
//   | Situação                     | --notify          | normal            |
//   |-------------------------------|-------------------|--------------------|
//   | Em dia                        | silêncio, exit 0  | veredito, exit 0   |
//   | Desatualizado                 | aviso, exit 0     | veredito, exit 1   |
//   | Verificação falhou/estourou   | silêncio, exit 0  | mensagem, exit 1   |
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { runCheckCli } from '../../checkUpdate.mjs';

let tmpDir;

function writeJson(file, obj) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(obj, null, 2));
}

function writeText(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
}

// Monta um consumidor `file:` com a fonte e a cópia instalada IDÊNTICAS
// (upToDate: true) ou DIVERGENTES (upToDate: false) — sem rede, sem git.
function montarConsumidorLocal({ atualizado }) {
  const consumerDir = path.join(tmpDir, 'consumer');
  const libDir = path.join(tmpDir, 'lib');

  writeJson(path.join(consumerDir, 'package.json'), {
    name: 'consumidor',
    dependencies: { '@sarak/lib-ui-core': 'file:../lib' },
  });
  writeJson(path.join(consumerDir, 'package-lock.json'), { lockfileVersion: 3 });

  writeText(path.join(libDir, 'dist', 'BUILD_INFO.json'), '{"builtAt":"fonte"}');
  writeText(path.join(libDir, 'sarak-ui', 'VERSION'), 'kitHash=fonte123');

  const installedRoot = path.join(consumerDir, 'node_modules', '@sarak', 'lib-ui-core');
  writeText(path.join(installedRoot, 'dist', 'BUILD_INFO.json'), atualizado ? '{"builtAt":"fonte"}' : '{"builtAt":"velho"}');
  writeText(path.join(installedRoot, 'sarak-ui', 'VERSION'), atualizado ? 'kitHash=fonte123' : 'kitHash=velho000');

  return consumerDir;
}

beforeEach(() => {
  tmpDir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-check-cli-')));
});

afterEach(() => {
  vi.restoreAllMocks();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('runCheckCli — modo NORMAL', () => {
  it('em dia -> exit 0', () => {
    const cwd = montarConsumidorLocal({ atualizado: true });
    const { exitCode } = runCheckCli({ argv: [], cwd });
    expect(exitCode).toBe(0);
  });

  it('desatualizado -> exit 1 (compõe com automação)', () => {
    const cwd = montarConsumidorLocal({ atualizado: false });
    const { exitCode, output } = runCheckCli({ argv: [], cwd });
    expect(exitCode).toBe(1);
    expect(output).toContain('Desatualizado');
  });

  it('verificação falhou (nenhum package.json declara a lib) -> exit 1, mensagem instrutiva', () => {
    const cwd = fs.mkdtempSync(path.join(tmpDir, 'vazio-'));
    const { exitCode, output } = runCheckCli({ argv: [], cwd });
    expect(exitCode).toBe(1);
    expect(output).toContain('Não achei');
  });
});

describe('runCheckCli — modo --notify (predev do consumidor: NUNCA pode derrubar o dev)', () => {
  it('em dia -> SILÊNCIO, exit 0', () => {
    const cwd = montarConsumidorLocal({ atualizado: true });
    const { exitCode, output } = runCheckCli({ argv: ['--notify'], cwd });
    expect(exitCode).toBe(0);
    expect(output).toBeNull();
  });

  it('desatualizado -> aviso, exit 0 (nunca 1)', () => {
    const cwd = montarConsumidorLocal({ atualizado: false });
    const { exitCode, output } = runCheckCli({ argv: ['--notify'], cwd });
    expect(exitCode).toBe(0);
    expect(output).not.toBeNull();
    expect(output).toContain('biblioteca em disco mudou');
  });

  it('verificação falhou -> SILÊNCIO, exit 0 (nunca 1)', () => {
    const cwd = fs.mkdtempSync(path.join(tmpDir, 'vazio-'));
    const { exitCode, output } = runCheckCli({ argv: ['--notify'], cwd });
    expect(exitCode).toBe(0);
    expect(output).toBeNull();
  });

  it('runCheckUpdate lança exceção -> SILÊNCIO, exit 0 (o consumidor não está depurando a lib)', async () => {
    const mod = await import('../runCheckUpdate.mjs');
    vi.spyOn(mod, 'runCheckUpdate').mockImplementation(() => {
      throw new Error('boom');
    });
    const { exitCode, output } = runCheckCli({ argv: ['--notify'], cwd: tmpDir });
    expect(exitCode).toBe(0);
    expect(output).toBeNull();
  });
});

describe('runCheckCli — modo normal com exceção (contraste com --notify)', () => {
  it('runCheckUpdate lança exceção -> exit 1 com a mensagem, NUNCA silêncio', async () => {
    const mod = await import('../runCheckUpdate.mjs');
    vi.spyOn(mod, 'runCheckUpdate').mockImplementation(() => {
      throw new Error('boom');
    });
    const { exitCode, output } = runCheckCli({ argv: [], cwd: tmpDir });
    expect(exitCode).toBe(1);
    expect(output).toContain('Falhou');
    expect(output).toContain('boom');
  });
});
