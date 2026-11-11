// @vitest-environment node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { runVerifyCli } from '../cli';
import { globToRegExp } from '../glob';
import { closestNames } from '../suggest';
import { stripVarAndUrl, literalKindOf } from '../detect/literals';
import { isValidSpacing } from '../detect/spacing';

let root: string;
const write = (file: string, content: string): void => {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), content);
};
const verify = (...argv: string[]) => runVerifyCli({ argv: ['--root', root, '--format', 'json', ...argv] });
const findings = (...argv: string[]) => JSON.parse(verify(...argv).output) as { ruleId: string; file: string; line: number }[];

beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-verify-'));
});
afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

describe('sarak-ui verify', () => {
    it('sem regra ligada não roda nada e sai com 2; --list mostra as regras', () => {
        expect(runVerifyCli({ argv: ['--root', root] }).exitCode).toBe(2);
        expect(runVerifyCli({ argv: ['--list'] }).output).toContain('known-css-var');
    });
    it('recusa regra desconhecida e regra só de plugin', () => {
        expect(verify('--rule', 'nao-existe').exitCode).toBe(2);
        expect(verify('--rule', 'known-icon-name').output).toContain('plugin');
    });
    it('known-css-var acusa os cinco nomes do ERP com arquivo:linha e passa o público', () => {
        write('a/proposal-ui.css', '.a {\n  border-radius: var(--sarak-border-radius-md, 8px);\n  gap: var(--sarak-layout-gap-xs, 4px);\n  padding: var(--sarak-card-padding-lg, 24px);\n  border: var(--sarak-card-border);\n  margin: var(--sarak-border-radius-lg, 1px);\n  ok: var(--sarak-card-radius, 8px);\n}\n');
        const result = findings('--rule', 'known-css-var');
        expect(result.map((item) => item.line)).toEqual([2, 3, 4, 5, 6]);
        expect(verify('--rule', 'known-css-var').exitCode).toBe(1);
    });
    it('no-literal-color-font aceita var com reserva e acusa literal', () => {
        write('x.css', '.a { color: var(--sarak-primary-color, #19e3f0); background: #fff; font-family: "Inter", sans-serif; border-color: transparent; }\n');
        expect(findings('--rule', 'no-literal-color-font')).toHaveLength(2);
    });
    it('no-internal-class-selector acusa a classe e passa a variável', () => {
        write('x.css', '.sarak-card { margin: 0 }\n.b { color: var(--sarak-primary-color, red-ish); }\n');
        expect(findings('--rule', 'no-internal-class-selector')).toHaveLength(1);
    });
    it('single-entrypoint e pinned-install leem o package.json', () => {
        write('modules/a/package.json', '{\n  "dependencies": {\n    "@sarak/lib-ui-core": "file:../lib"\n  }\n}\n');
        write('packages/ui-kit/package.json', '{"dependencies":{"@sarak/lib-ui-core":"github:Lib-Sarak/Sarak-Lib-UI-Core#v8.0.0"}}');
        write('modules/b/package.json', '{"dependencies":{"@sarak/lib-ui-core":"github:x/y#develop"}}');
        const pinned = findings('--rule', 'pinned-install');
        expect(pinned.map((item) => item.file)).toEqual(['modules/a/package.json', 'modules/b/package.json']);
        write('sarak-verify.json', JSON.stringify({ rules: { 'single-entrypoint': ['error', { allow: ['packages/ui-kit/package.json'] }] } }));
        const entry = findings();
        expect(entry.map((item) => item.file)).toEqual(['modules/a/package.json', 'modules/b/package.json']);
        expect(entry[0].line).toBe(3);
    });
    it('kit-in-sync compara o kitHash da cópia com o do pacote instalado', () => {
        write('node_modules/@sarak/lib-ui-core/sarak-ui/VERSION', 'libVersion=8\nkitHash=e96c613b93c6\n');
        write('sarak-ui/VERSION', 'libVersion=8\nkitHash=aaaaaaaaaaaa\n');
        expect(findings('--rule', 'kit-in-sync')).toHaveLength(1);
        write('sarak-ui/VERSION', 'libVersion=8\nkitHash=e96c613b93c6\n');
        expect(findings('--rule', 'kit-in-sync')).toEqual([]);
        fs.rmSync(path.join(root, 'sarak-ui'), { recursive: true });
        expect(findings('--rule', 'kit-in-sync')).toEqual([]);
    });
});

describe('detectores puros', () => {
    it('glob', () => {
        expect(globToRegExp('packages/ui-kit/src/**').test('packages/ui-kit/src/a/b.ts')).toBe(true);
        expect(globToRegExp('packages/ui-kit/src/**').test('modules/a.ts')).toBe(false);
        expect(globToRegExp('**/vendor/**').test('a/vendor/x.css')).toBe(true);
        expect(globToRegExp('a.b/*.css').test('aXb/x.css')).toBe(false);
    });
    it('var() com reserva aninhada some antes da checagem de cor', () => {
        expect(stripVarAndUrl('var(--a, var(--b, #fff)) url(#x)')).toBe(' ');
        expect(literalKindOf('color', 'var(--a, rgb(1,2,3))')).toBeNull();
        expect(literalKindOf('color', 'rgb(1,2,3)')).toBe('cor');
    });
    it('espaçamento e sugestão', () => {
        expect(isValidSpacing('md', ['spacing-md'])).toBe(false);
        expect(isValidSpacing('1.5rem', [])).toBe(true);
        expect(closestNames('Rocketship', ['Rocket', 'Home'])).toContain('Rocket');
    });
});
