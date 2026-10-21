// @vitest-environment node
// O gerador do espelho em JS do manifesto de fontes (`src/core/Provider/generated/font-manifest.ts`): o arquivo
// versionado é exatamente o que ele gera a partir dos pacotes instalados (o `--check` do `build`), cada arquivo tem
// o seu `new URL` literal (o padrão que o bundler do importador reescreve) e pacotes que divergem no `unicode-range`
// derrubam a geração.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { FONT_MANIFEST_MODULE, buildFontManifestModule } from '../generate-font-manifest';
import { readUnicodeRanges } from '../fonts/runtimeManifest';
import type { FontEntry } from '../fonts/fontPackages';

const MODULES = path.resolve('node_modules');

describe('generate-font-manifest', () => {
    it('o módulo versionado é o que o gerador produz (byte a byte)', () => {
        expect(fs.readFileSync(FONT_MANIFEST_MODULE, 'utf8')).toBe(buildFontManifestModule(MODULES));
    });

    it('um `new URL` literal por arquivo, nenhum template com variável', () => {
        const source = buildFontManifestModule(MODULES);
        const files = [...source.matchAll(/file: "([^"]+)"/g)].map((match) => match[1]);
        const literals = [...source.matchAll(/new URL\("\.\/fonts\/([^"]+)", import\.meta\.url\)/g)].map((match) => match[1]);
        expect(files).toHaveLength(60);
        expect(literals).toEqual(files);
        expect(source).not.toContain('new URL(`');
    });

    it('saída compacta: uma linha por família, abaixo do teto de 250 linhas do auditor de Clean Code', () => {
        const source = buildFontManifestModule(MODULES);
        const familyLines = source.split('\n').filter((line) => /^ {4}"[^"]+": \{ variable: /.test(line));
        expect(familyLines).toHaveLength(41);
        expect(source.split('\n').length).toBeLessThanOrEqual(250);
    });

    it('pacotes com `unicode-range` divergente para o mesmo subconjunto derrubam', () => {
        const modulesDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-unicode-'));
        try {
            const entry = (pkg: string) => ({ package: pkg, subsets: ['latin'] }) as unknown as FontEntry;
            for (const [pkg, range] of [['a', 'U+0000-00FF'], ['b', 'U+0000-007F']]) {
                fs.mkdirSync(path.join(modulesDir, pkg));
                fs.writeFileSync(path.join(modulesDir, pkg, 'unicode.json'), JSON.stringify({ latin: range }));
            }
            expect(readUnicodeRanges({ A: entry('a') }, modulesDir)).toEqual({ latin: 'U+0000-00FF' });
            expect(() => readUnicodeRanges({ A: entry('a'), B: entry('b') }, modulesDir)).toThrow(/B: unicode-range de "latin" diverge/);
        } finally {
            fs.rmSync(modulesDir, { recursive: true, force: true });
        }
    });
});
