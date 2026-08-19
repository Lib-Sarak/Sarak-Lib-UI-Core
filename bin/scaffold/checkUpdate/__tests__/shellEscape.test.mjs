// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { escapeCaretForWindowsShell } from '../shellEscape.mjs';

describe('escapeCaretForWindowsShell — achado real (npm.cmd engoliu o `^` de `#semver:^6.0.0`, mesmo dobrado)', () => {
    it('no Windows, envolve em aspas SÓ o token que tem `^` — provado sobreviver ao duplo salto cmd.exe → npm.cmd', () => {
        expect(escapeCaretForWindowsShell('npm install git://x/y#semver:^6.0.0', 'win32')).toBe(
            'npm install "git://x/y#semver:^6.0.0"',
        );
    });

    it('preserva os outros tokens do comando composto (uninstall && cache clean && install) intocados', () => {
        const comando =
            'npm uninstall @sarak/lib-ui-core && npm cache clean --force && npm install git://x/y#semver:^6.0.0';
        expect(escapeCaretForWindowsShell(comando, 'win32')).toBe(
            'npm uninstall @sarak/lib-ui-core && npm cache clean --force && npm install "git://x/y#semver:^6.0.0"',
        );
    });

    it('fora do Windows, devolve o comando intacto — `^` não é metacaractere em POSIX', () => {
        expect(escapeCaretForWindowsShell('npm install x#semver:^6.0.0', 'linux')).toBe('npm install x#semver:^6.0.0');
        expect(escapeCaretForWindowsShell('npm install x#semver:^6.0.0', 'darwin')).toBe('npm install x#semver:^6.0.0');
    });

    it('comando sem `^` nenhum -> intacto nos dois casos', () => {
        expect(escapeCaretForWindowsShell('npm install x', 'win32')).toBe('npm install x');
    });
});
