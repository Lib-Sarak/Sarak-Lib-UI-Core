import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { collectPlans, orderPlans, buildIndiceTable } from '../generate-plan-index.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const GENERATOR = path.resolve(ROOT, 'scripts', 'generate-plan-index.mjs');
const REAL_PLAN_DIR = path.join(ROOT, 'specs', 'plan');

function plantPlanDir(files) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-plan-index-'));
  for (const [name, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(tmpDir, name), content, 'utf8');
  }
  return tmpDir;
}

const withFrontmatter = (fields) =>
  `---\ntipo: "plan"\n${Object.entries(fields)
    .map(([k, v]) => `${k}: "${v}"`)
    .join('\n')}\n---\n\n# 1. Objetivo\n`;

describe('collectPlans — R17 (objetivo é obrigatório, nunca inventado)', () => {
  it('FALHA nomeando a plan quando o frontmatter não tem `objetivo`', () => {
    const dir = plantPlanDir({
      'plan-99-sem-objetivo.md': withFrontmatter({ status: '🔴 A executar', depende_de: '' }),
    });
    try {
      expect(() => collectPlans({ planDir: dir })).toThrow(/plan-99-sem-objetivo\.md/);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('coleta a plan quando `objetivo` existe', () => {
    const dir = plantPlanDir({
      'plan-99-com-objetivo.md': withFrontmatter({
        status: '🔴 A executar',
        depende_de: '',
        destino_sintese: '—',
        objetivo: 'Testar o coletor',
      }),
    });
    try {
      const plans = collectPlans({ planDir: dir });
      expect(plans).toHaveLength(1);
      expect(plans[0]).toMatchObject({ slug: 'plan-99-com-objetivo', objetivo: 'Testar o coletor' });
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('orderPlans — a ordem vem do bloco atual; plan nova entra no fim, alfabética', () => {
  it('preserva a ordem existente e acrescenta o slug novo no fim', () => {
    const plans = [
      { slug: 'plan-03-c' },
      { slug: 'plan-01-a' },
      { slug: 'plan-02-b' },
    ];
    const ordered = orderPlans(plans, ['plan-01-a', 'plan-03-c']); // plan-02-b é nova
    expect(ordered.map((p) => p.slug)).toEqual(['plan-01-a', 'plan-03-c', 'plan-02-b']);
  });

  it('bloco vazio (sem ordem prévia): reconstrói em ordem alfabética de slug', () => {
    const plans = [{ slug: 'plan-09-z' }, { slug: 'plan-01-a' }, { slug: 'plan-05-m' }];
    const ordered = orderPlans(plans, []);
    expect(ordered.map((p) => p.slug)).toEqual(['plan-01-a', 'plan-05-m', 'plan-09-z']);
  });
});

describe('buildIndiceTable — prova do gerador: apagar a tabela e reconstruir não perde dado', () => {
  it('bloco vazio + specs/plan/ REAL: reconstrói as 9 plans ativas, em ordem alfabética, sem perda', () => {
    const emptyBlock = '<!-- SARAK-INDICE:FILA:INICIO -->\n<!-- SARAK-INDICE:FILA:FIM -->';
    const table = buildIndiceTable({ planDir: REAL_PLAN_DIR, indiceContent: emptyBlock });
    const linhas = table.split('\n').slice(2); // sem header + separador
    const realFiles = fs.readdirSync(REAL_PLAN_DIR).filter((f) => /^plan-\d+-.*\.md$/.test(f));

    expect(linhas).toHaveLength(realFiles.length);
    const slugsNaTabela = linhas.map((l) => l.match(/\[(plan-\d+-[\w-]+)\]/)[1]);
    expect(slugsNaTabela).toEqual([...slugsNaTabela].sort());
    expect(new Set(slugsNaTabela)).toEqual(new Set(realFiles.map((f) => f.replace(/\.md$/, ''))));
  });
});

describe('generate-plan-index.mjs --check — contra o specs/00-indice.md REAL do repositório', () => {
  it('sai 0: o commitado bate com o gerado agora (regenerado nesta execução da plan-20)', () => {
    const result = execFileSync('node', [GENERATOR, '--check'], { cwd: ROOT, encoding: 'utf8' });
    expect(result).toContain('em dia');
  });
});
