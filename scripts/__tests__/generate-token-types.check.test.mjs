// @vitest-environment node
// Teste do PRÓPRIO GATE (plan-12, R4/R29/vão 1): `generate-token-types.ts
// --check` não existia — `design-token-ids.ts` ficou defasado em 105 tokens
// (304 × 409) por mais de um mês sem nenhum gate acusar (achado 22).
// Um caso que ele PEGA (arquivo divergente do gerador) e um que ele DEIXA
// PASSAR (arquivo em dia). Opera sobre o arquivo REAL do repositório —
// `MASTER_DESIGN_MAP` é grande demais para uma fixture isolada — com
// backup/restore garantido mesmo se a asserção falhar.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const OUT_FILE = path.resolve('src/core/Provider/generated/design-token-ids.ts');
const DOCS_FILE = path.resolve('src/core/Provider/generated/design-token-docs.json');
let original;
let originalDocs;

beforeAll(() => {
  original = fs.readFileSync(OUT_FILE, 'utf-8');
  originalDocs = fs.readFileSync(DOCS_FILE, 'utf-8');
});

afterAll(() => {
  fs.writeFileSync(OUT_FILE, original, 'utf-8');
  fs.writeFileSync(DOCS_FILE, originalDocs, 'utf-8');
});

function runCheck() {
  try {
    execSync('npx tsx scripts/generate-token-types.ts --check', { encoding: 'utf8' });
    return 0;
  } catch (error) {
    return error.status ?? 1;
  }
}

describe('generate-token-types --check', () => {
  // `npx tsx` gasta ~3 s por invocação (spawn de processo próprio, que carrega o schema inteiro) — medido
  // até ~12 s sob a carga da suíte completa; o `testTimeout` padrão é 5 s e os 15 s anteriores ainda estouravam.
  const SPAWN_TIMEOUT_MS = 60_000;

  it('acusa o artefato gerado divergente da fonte', () => {
    fs.writeFileSync(OUT_FILE, `${original}\n// linha estranha plantada pelo teste\n`, 'utf-8');
    expect(runCheck()).toBe(1);
  }, SPAWN_TIMEOUT_MS);

  it('acusa o JSON de documentação divergente do schema', () => {
    fs.writeFileSync(DOCS_FILE, originalDocs.replace('"group": "cards"', '"group": "plantado"'), 'utf-8');
    expect(runCheck()).toBe(1);
  }, SPAWN_TIMEOUT_MS);

  it('libera o artefato em dia com a fonte', () => {
    fs.writeFileSync(DOCS_FILE, originalDocs, 'utf-8');
    fs.writeFileSync(OUT_FILE, original, 'utf-8');
    expect(runCheck()).toBe(0);
  }, SPAWN_TIMEOUT_MS);
});
