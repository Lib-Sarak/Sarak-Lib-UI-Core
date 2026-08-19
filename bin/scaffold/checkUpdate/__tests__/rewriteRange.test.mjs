// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { bumpSpecMajor, rewritePackageJsonDependency } from '../rewriteRange.mjs';

describe('bumpSpecMajor — só o dígito do major muda, minor/patch voltam a .0.0', () => {
    it('`^3.0.0` -> `^6.0.0`', () => {
        expect(bumpSpecMajor('github:Lib-Sarak/Sarak-Lib-UI-Core#semver:^3.0.0', 6)).toBe(
            'github:Lib-Sarak/Sarak-Lib-UI-Core#semver:^6.0.0',
        );
    });

    it('`~1.2.3` preserva o operador `~`', () => {
        expect(bumpSpecMajor('github:x/y#semver:~1.2.3', 2)).toBe('github:x/y#semver:~2.0.0');
    });

    it('spec sem faixa `#semver:` (github: puro, commit fixo) -> devolvido sem alteração', () => {
        expect(bumpSpecMajor('github:x/y', 6)).toBe('github:x/y');
        expect(bumpSpecMajor(`github:x/y#${'a'.repeat(40)}`, 6)).toBe(`github:x/y#${'a'.repeat(40)}`);
    });
});

describe('rewritePackageJsonDependency — troca só o VALOR, texto cru', () => {
    const texto = ['{', '  "name": "consumidor",', '  "dependencies": {', '    "@sarak/lib-ui-core": "github:x/y#semver:^3.0.0"', '  }', '}', ''].join(
        '\n',
    );

    it('substitui a ocorrência única e preserva o resto do arquivo byte a byte', () => {
        const novoTexto = rewritePackageJsonDependency({
            text: texto,
            pkgName: '@sarak/lib-ui-core',
            oldSpec: 'github:x/y#semver:^3.0.0',
            newSpec: 'github:x/y#semver:^6.0.0',
        });
        expect(novoTexto).toContain('"@sarak/lib-ui-core": "github:x/y#semver:^6.0.0"');
        expect(novoTexto).not.toContain('^3.0.0');
        expect(novoTexto.replace('^6.0.0', '^3.0.0')).toBe(texto);
    });

    it('recusa (lança) quando a ocorrência não é exatamente 1 — nunca arrisca reescrever o arquivo errado', () => {
        expect(() =>
            rewritePackageJsonDependency({ text: texto, pkgName: '@sarak/lib-ui-core', oldSpec: 'github:x/y#semver:^9.9.9', newSpec: 'x' }),
        ).toThrow(/exatamente 1 ocorrência/);
    });
});
