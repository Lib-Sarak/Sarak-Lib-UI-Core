// @vitest-environment node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { runGateAgainstFixture } from './helpers/runGateFixture.mjs';

// Self-test do PRÓPRIO GATE: só o `id` de TOKEN do schema entra no registro de variáveis
// emitidas. O `id` de uma OPÇÃO de `select` (`{ id: 'overlay', value: … }`) nomeia um valor,
// não emite `--sarak-overlay` — e, pela expansão de sufixo, nem `--sarak-overlay-bg`.
// Contar a opção como emissora escondia o consumo de uma variável que ninguém emite.
const GATE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'auditor_ghostvars.mjs');

const CONSUMER = { 'src/components/Fixture.tsx': 'const x = "var(--sarak-overlay-bg)";' };

const schemaWith = (tokenBody) => ({
  'src/core/Design/schema/fixture.ts': `export const FIXTURE_SCHEMA = { id: 'fixtureGroup', tokens: [${tokenBody}] };`,
});

describe('auditor_ghostvars — só id de token emite variável', () => {
  it('ACUSA fantasma: `--sarak-overlay-bg` só existiria por causa do id de uma OPÇÃO de select', () => {
    const { status, stdout } = runGateAgainstFixture(GATE, {
      ...schemaWith(`{
        id: 'backdropStyle', label: 'Fundo', type: 'select',
        constraints: { options: [{ id: 'overlay', value: 'overlay', label: 'Overlay' }] },
        defaultValue: 'overlay',
      }`),
      ...CONSUMER,
    });
    expect(status).toBe(1);
    expect(stdout).toContain('--sarak-overlay-bg');
  });

  it('ACUSA fantasma também quando a opção declara as chaves em outra ordem, sem `value` colado ao `id`', () => {
    const { status, stdout } = runGateAgainstFixture(GATE, {
      ...schemaWith(`{
        id: 'backdropStyle', label: 'Fundo', type: 'select',
        constraints: { options: [{ label: 'Overlay', id: 'overlay', value: 'overlay' }] },
        defaultValue: 'overlay',
      }`),
      ...CONSUMER,
    });
    expect(status).toBe(1);
    expect(stdout).toContain('--sarak-overlay-bg');
  });

  it('ACUSA fantasma: o id do GRUPO do schema também não emite variável', () => {
    const { status, stdout } = runGateAgainstFixture(GATE, {
      ...schemaWith(`{ id: 'realToken', label: 'Real', type: 'color', defaultValue: '#fff' }`),
      'src/components/Fixture.tsx': 'const x = "var(--sarak-fixture-group)";',
    });
    expect(status).toBe(1);
    expect(stdout).toContain('--sarak-fixture-group');
  });

  it('LIBERA: o id é de um TOKEN real, e `--sarak-overlay-bg` sai da expansão de sufixo dele', () => {
    const { status } = runGateAgainstFixture(GATE, {
      ...schemaWith(`{ id: 'overlay', label: 'Overlay', type: 'color', defaultValue: '#000' }`),
      ...CONSUMER,
    });
    expect(status).toBe(0);
  });

  it('LIBERA: token cujo `type` vem DEPOIS do bloco aninhado de opções continua registrado', () => {
    const { status } = runGateAgainstFixture(GATE, {
      ...schemaWith(`{
        id: 'overlay', label: 'Overlay',
        constraints: { options: [{ id: 'dark', value: 'dark', label: 'Escuro' }] },
        type: 'select', defaultValue: 'dark',
      }`),
      ...CONSUMER,
    });
    expect(status).toBe(0);
  });
});
