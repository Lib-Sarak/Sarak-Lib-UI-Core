// @vitest-environment node
// O harness de navegador resolve `#minproc` do `vfile` pela variante de navegador (`cwd` fixo), como um bundler
// de consumidor real; a variante `node` chama `process.cwd()`, que não existe no harness.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { afterAll, describe, expect, it } from 'vitest';
import { resolvePackageImport } from '../../browser-tests/harness-package-imports.mjs';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'harness-imports-'));
afterAll(() => fs.rmSync(root, { recursive: true, force: true }));

const writePackage = (imports) => {
    fs.mkdirSync(path.join(root, 'lib'), { recursive: true });
    fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ name: 'fake', imports }));
    return path.join(root, 'lib', 'index.js');
};

describe('resolvePackageImport', () => {
    it('escolhe `default` e nunca `node`, mesmo com `node` primeiro', () => {
        const importer = writePackage({ '#minproc': { node: './lib/minproc.js', default: './lib/minproc.browser.js' } });
        expect(resolvePackageImport('#minproc', importer)).toBe(path.join(root, 'lib', 'minproc.browser.js'));
    });

    it('não resolve o que não é `#interno` nem o que o pacote não declara', () => {
        const importer = writePackage({ '#minproc': { default: './lib/minproc.browser.js' } });
        expect(resolvePackageImport('react', importer)).toBeUndefined();
        expect(resolvePackageImport('#outro', importer)).toBeUndefined();
    });

    it('para o vfile real, devolve a variante de navegador do minproc', () => {
        const require = createRequire(import.meta.url);
        const importer = require.resolve('vfile');
        expect(path.basename(resolvePackageImport('#minproc', importer) ?? '')).toBe('minproc.browser.js');
    });
});
