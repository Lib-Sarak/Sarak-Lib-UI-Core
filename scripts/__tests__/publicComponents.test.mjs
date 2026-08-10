import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { collectFromCategoryRoot } from '../publicComponents.mjs';

// Self-test da regra R14 (plan-20): "componente público mora na RAIZ da
// categoria; subpasta é peça interna." Um caso pego (raiz — coletado) e um
// caso liberado (subpasta — NUNCA coletado, ainda que exporte um nome
// PascalCase igual a um componente de verdade).

// `collectFromCategoryRoot(root, names)` trata `root` como a RAIZ QUE CONTÉM
// AS CATEGORIAS (ex.: `atomic/`) — cada subpasta de `root` é UMA categoria, e
// só os `.tsx` que são FILHOS DIRETOS da pasta da categoria são varridos
// (categoria sem barril próprio). Por isso a fixture planta uma categoria
// (`CategoryA/`) dentro de um `root` sintético, com um componente na raiz da
// categoria e outro numa subpasta DELA.
function plantFakeAtomicRoot(files) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-public-components-'));
  for (const [rel, content] of Object.entries(files)) {
    const full = path.join(tmpDir, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content, 'utf8');
  }
  return tmpDir;
}

describe('collectFromCategoryRoot — R14 (categoria SEM barril)', () => {
  it('coleta componente na RAIZ da categoria', () => {
    const root = plantFakeAtomicRoot({
      'CategoryA/RootComponent.tsx': 'export const RootComponent = () => null;',
    });
    try {
      const names = new Set();
      collectFromCategoryRoot(root, names);
      expect(names.has('RootComponent')).toBe(true);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('NÃO coleta componente idêntico numa SUBPASTA da categoria — subpasta é peça interna', () => {
    const root = plantFakeAtomicRoot({
      'CategoryA/sub/SubComponent.tsx': 'export const SubComponent = () => null;',
    });
    try {
      const names = new Set();
      collectFromCategoryRoot(root, names);
      expect(names.has('SubComponent')).toBe(false);
      expect(names.size).toBe(0);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('a mesma varredura, com raiz E subpasta juntas: só a raiz aparece', () => {
    const root = plantFakeAtomicRoot({
      'CategoryA/RootComponent.tsx': 'export const RootComponent = () => null;',
      'CategoryA/internal/Impl.tsx': 'export const Impl = () => null;',
    });
    try {
      const names = new Set();
      collectFromCategoryRoot(root, names);
      expect([...names]).toEqual(['RootComponent']);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
