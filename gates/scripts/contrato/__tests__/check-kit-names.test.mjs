// @vitest-environment node
// Teste do PRÓPRIO GATE: o que o consumidor recebe (README, docs/, kit `sarak-ui/` e o que
// o `init` gera) só cita nome público que o barril exporta. Casos PLANTADOS que o gate
// PEGA (import de nome velho, nome velho em crase, nome de formato público que não existe
// em lugar nenhum) e os que ele DEIXA PASSAR — e, por fim, a base real.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { checkKitNames } from '../check-kit-names.mjs';

const scratchDirs = [];

const BARREL = [
    'declare const SarakButton: unknown;',
    'export { SarakButton, SarakCustomizationPanel, type SarakThemeEntry, sarakRegisterLocalComponent, useSarakUI };',
].join('\n');

const MIGRATIONS = [
    '## 6.0.0 — Prefixo',
    '',
    '| Nome antigo | Nome novo |',
    '| --- | --- |',
    '| `CustomizationPanel` | `SarakCustomizationPanel` |',
    '| `registerLocalComponent` | `sarakRegisterLocalComponent` |',
    '| `ThemeEntry` | `SarakThemeEntry` |',
].join('\n');

function makeRoot(files) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-kit-names-'));
    scratchDirs.push(root);
    const all = { 'docs/migracoes.md': MIGRATIONS, 'src/Internal.tsx': 'export const SarakInternalCards = () => null;', ...files };
    for (const [relPath, content] of Object.entries(all)) {
        const full = path.join(root, relPath);
        fs.mkdirSync(path.dirname(full), { recursive: true });
        fs.writeFileSync(full, content, 'utf8');
    }
    return root;
}

function run(files, extra = {}) {
    const root = makeRoot(files);
    return checkKitNames({ root, barrelTypes: BARREL, generated: [], ...extra });
}

afterEach(() => {
    while (scratchDirs.length) {
        fs.rmSync(scratchDirs.pop(), { recursive: true, force: true });
    }
});

describe('checkKitNames — casos pegos', () => {
    it('PLANTADO: template do kit importando o nome que o barril não tem', () => {
        const { violations, error } = run({
            'sarak-ui/templates/main.tsx': "import { SarakButton, registerLocalComponent } from '@sarak/lib-ui-core';\n",
        });
        expect(error).toBeNull();
        expect(violations).toEqual([
            { file: 'sarak-ui/templates/main.tsx', line: 1, name: 'registerLocalComponent', via: 'import' },
        ]);
    });

    it('PLANTADO: import multilinha com `type` — o nome velho dentro é acusado, com a linha do import', () => {
        const { violations } = run({
            'README.md': ["# lib", '', "import {", '    SarakButton,', '    type ThemeEntry,', "} from '@sarak/lib-ui-core';"].join('\n'),
        });
        expect(violations).toEqual([{ file: 'README.md', line: 3, name: 'ThemeEntry', via: 'import' }]);
    });

    it('PLANTADO: nome ANTIGO de renomeação registrada, citado em crase na prosa', () => {
        const { violations } = run({
            'docs/guia.md': 'Monte o painel com `CustomizationPanel` dentro do shell.\n',
        });
        expect(violations).toEqual([{ file: 'docs/guia.md', line: 1, name: 'CustomizationPanel', via: 'crase' }]);
    });

    it('PLANTADO: chamada em crase com argumentos também é lida pelo nome', () => {
        const { violations } = run({
            'docs/guia.md': 'Registre com `registerLocalComponent(\'id\', Tela)`.\n',
        });
        expect(violations.map((v) => v.name)).toEqual(['registerLocalComponent']);
    });

    it('PLANTADO: nome de formato público que não existe em lugar nenhum de src/ (fantasma)', () => {
        const { violations } = run({
            'sarak-ui/GUIA-FRONTEND.md': 'Use `SarakPainelFantasma` para isso.\n',
        });
        expect(violations).toEqual([{ file: 'sarak-ui/GUIA-FRONTEND.md', line: 1, name: 'SarakPainelFantasma', via: 'crase' }]);
    });

    it('PLANTADO: texto gerado pelo init importando nome velho', () => {
        const { violations } = run({}, {
            generated: [{ file: 'init → src/main.tsx', text: "import { registerLocalComponent } from '@sarak/lib-ui-core';" }],
        });
        expect(violations).toEqual([{ file: 'init → src/main.tsx', line: 1, name: 'registerLocalComponent', via: 'import' }]);
    });

    it('reprova com o erro de formato quando o barril não tem o bloco agrupado de export', () => {
        const { violations, error } = run({}, { barrelTypes: 'export declare const x: number;\n' });
        expect(violations).toEqual([]);
        expect(error).toContain('export { ... }');
    });
});

describe('checkKitNames — casos liberados', () => {
    it('libera import e crase de nomes que o barril exporta', () => {
        const { violations } = run({
            'sarak-ui/templates/main.tsx': "import { SarakButton, type SarakThemeEntry, useSarakUI } from '@sarak/lib-ui-core';\n",
            'docs/guia.md': 'Use `SarakCustomizationPanel` e `sarakRegisterLocalComponent(\'id\', Tela)`.\n',
        });
        expect(violations).toEqual([]);
    });

    it('libera `docs/migracoes.md`, que cita o nome velho de propósito', () => {
        const { violations } = run({
            'docs/migracoes.md': `${MIGRATIONS}\n\nAntes: \`registerLocalComponent\`.\n`,
        });
        expect(violations).toEqual([]);
    });

    it('libera a CÓPIA de `migracoes.md` que viaja no kit (`sarak-ui/docs/migracoes.md`) — a exclusão é por nome de arquivo', () => {
        const { violations } = run({
            'sarak-ui/docs/migracoes.md': `${MIGRATIONS}\n\nAntes: \`registerLocalComponent\`.\n\nimport { registerLocalComponent } from '@sarak/lib-ui-core';\n`,
        });
        expect(violations).toEqual([]);
    });

    it('nome de arquivo parecido, mas não igual a `migracoes.md`, continua lido', () => {
        const { violations } = run({ 'sarak-ui/docs/migracoes-antigas.md': 'Antes: `registerLocalComponent`.\n' });
        expect(violations).toEqual([
            { file: 'sarak-ui/docs/migracoes-antigas.md', line: 1, name: 'registerLocalComponent', via: 'crase' },
        ]);
    });

    it('libera nome de formato público que existe em src/ mas não é exportado (componente interno descrito na prosa)', () => {
        const { violations } = run({
            'docs/responsivo.md': 'A tabela colapsa para cards (`SarakInternalCards`).\n',
        });
        expect(violations).toEqual([]);
    });

    it('libera placeholder de uma letra num import de exemplo, e crase que não é nome público (prop, token)', () => {
        const { violations } = run({
            'sarak-ui/GUIA-FRONTEND.md': "Importe: `import { X } from '@sarak/lib-ui-core'`; a prop `className` e o token `design`.\n",
        });
        expect(violations).toEqual([]);
    });

    it('não lê import de subcaminho do pacote, nem prosa sem crase', () => {
        const { violations } = run({
            'README.md': "import '@sarak/lib-ui-core/dist/sarak.css';\nuse o registerLocalComponent aqui, sem crase.\n",
        });
        expect(violations).toEqual([]);
    });

    it('não lê arquivo fora do que o consumidor recebe (ex.: specs/)', () => {
        const { violations } = run({ 'specs/nota.md': 'Antes era `registerLocalComponent`.\n' });
        expect(violations).toEqual([]);
    });
});

describe('check-kit-names — repositório real', () => {
    it('README, docs/, kit sarak-ui/ e o que o init gera só citam nomes que o barril exporta', () => {
        const { violations, error } = checkKitNames();
        expect(error).toBeNull();
        expect(violations).toEqual([]);
    });
});
