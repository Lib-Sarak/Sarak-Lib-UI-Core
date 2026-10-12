// @vitest-environment node
// Teste do PRÓPRIO GATE `variable-contract:check`: casos PLANTADOS que ele PEGA (dois donos, nome lido sem dono,
// reserva divergente) e os que ele DEIXA PASSAR (mestre + exceção, palavra-chave, piso mobile-first, variante de
// cor no padrão), mais o repositório real.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { buildReport } from '../check-variable-contract';
import { fallbackMatches, ownerConflicts, readsIn, stripComments, type TokenLike } from '../helpers/variable-contract-core';

const scratch: string[] = [];

function srcFixture(files: Record<string, string>): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-var-contract-'));
    scratch.push(dir);
    for (const [name, content] of Object.entries(files)) {
        const full = path.join(dir, name);
        fs.mkdirSync(path.dirname(full), { recursive: true });
        fs.writeFileSync(full, content, 'utf8');
    }
    return dir;
}

afterEach(() => {
    while (scratch.length) fs.rmSync(scratch.pop()!, { recursive: true, force: true });
});

const radius: TokenLike = {
    id: 'cardBorderRadius', type: 'slider', unit: 'px', defaultValue: { mob: 8, tab: 12, desk: 12 },
    cssVars: ['--sarak-card-radius', '--sarak-card-radius-tl'],
};
const cornerTL: TokenLike = {
    id: 'cardRadiusTL', type: 'slider', unit: 'px', defaultValue: { mob: 8, tab: 12, desk: 12 },
    cssVars: ['--sarak-card-radius-tl'], exceptionOf: 'cardBorderRadius',
};
const primary: TokenLike = { id: 'primaryColor', type: 'color', defaultValue: '#00f2ff', generateVariants: true, cssVars: ['--sarak-primary-color'] };

describe('(i) um dono por variável', () => {
    it('PLANTADO: dois tokens escrevendo a mesma variável, sem declarar exceção', () => {
        const other: TokenLike = { id: 'systemRadius', type: 'slider', defaultValue: 4, cssVars: ['--sarak-card-radius'] };
        expect(ownerConflicts([radius, other]).map((c) => c.name)).toEqual(['--sarak-card-radius']);
    });

    it('PLANTADO: a exceção sem o mestre dela na lista é conflito', () => {
        const stranger: TokenLike = { ...cornerTL, exceptionOf: 'outroMestre' };
        expect(ownerConflicts([radius, stranger]).length).toBe(1);
    });

    it('PASSA: mestre + exceção declarada', () => {
        expect(ownerConflicts([radius, cornerTL])).toEqual([]);
    });
});

describe('(ii) todo nome lido existe', () => {
    it('PLANTADO: var(--x) que ninguém escreve', () => {
        const src = srcFixture({ 'a.css': '.a { color: var(--sarak-fantasma); }' });
        expect(buildReport({ srcDir: src, tokens: [primary] }).ownerless.map((o) => o.name)).toEqual(['--sarak-fantasma']);
    });

    it('PASSA: nome de token, de variante de cor, declarado em CSS e escrito por chave em TS', () => {
        const src = srcFixture({
            'a.css': ':root { --minha: 1px; } .a { color: var(--sarak-primary-color-bg); width: var(--minha); }',
            'b.tsx': "export const s = { '--da-chave': 'x' }; export const c = 'bg-[var(--da-chave)] text-[var(--sarak-primary-color)]';",
        });
        expect(buildReport({ srcDir: src, tokens: [primary] }).ownerless).toEqual([]);
    });

    it('PLANTADO: o literal citado só em array não conta como dono (rigor que o auditor_ghostvars não tem)', () => {
        const src = srcFixture({ 'a.ts': "export const LISTA = ['--so-citado']; export const c = 'var(--so-citado)';" });
        expect(buildReport({ srcDir: src, tokens: [primary] }).ownerless.map((o) => o.name)).toEqual(['--so-citado']);
    });

    it('ignora comentário e `--tw-*`', () => {
        const src = srcFixture({ 'a.css': '/* var(--comentado) */ .a { transform: var(--tw-translate-x); }' });
        expect(buildReport({ srcDir: src, tokens: [primary] }).ownerless).toEqual([]);
    });
});

describe('(iii) a reserva é o padrão do token', () => {
    const find = (css: string, tokens: TokenLike[] = [primary, radius]) =>
        buildReport({ srcDir: srcFixture({ 'a.css': css }), tokens }).fallbacks;

    it('PLANTADO: a reserva azul de um token cujo padrão é ciano', () => {
        const found = find('.a { color: var(--sarak-primary-color, #3b82f6); }');
        expect(found).toHaveLength(1);
        expect(found[0].expected).toBe('#00f2ff');
    });

    it('PLANTADO: o padrão com outra notação de cor passa, a reserva de outra cor não', () => {
        expect(find('.a { color: var(--sarak-primary-color, rgb(0, 242, 255)); }')).toEqual([]);
        expect(find('.a { color: var(--sarak-primary-color, rgb(0, 242, 254)); }')).toHaveLength(1);
    });

    it('PASSA: piso mobile-first, os três pontos do responsivo e a unidade omitida', () => {
        expect(find('.a { border-radius: var(--sarak-card-radius, 8px); }')).toEqual([]);
        expect(find('.a { border-radius: var(--sarak-card-radius, 12px); }')).toEqual([]);
        expect(find('.a { border-radius: var(--sarak-card-radius, 6px); }')).toHaveLength(1);
    });

    it('PASSA: palavra-chave, outra leitura e reserva vazia', () => {
        expect(find('.a { color: var(--sarak-primary-color, currentColor); }')).toEqual([]);
        expect(find('.a { color: var(--sarak-primary-color, var(--outra, #123456)); }')).toEqual([]);
        expect(find('.a { border-radius: var(--sarak-card-radius, inherit); }')).toEqual([]);
    });

    it('PLANTADO: a variante `-bg` com o azul antigo; PASSA a que sai do padrão do token', () => {
        expect(find('.a { background: var(--sarak-primary-color-bg, rgba(59,130,246,0.1)); }')).toHaveLength(1);
        expect(find('.a { background: var(--sarak-primary-color-bg, rgba(0,242,255,0.15)); }')).toEqual([]);
    });

    it('PASSA: nome que não é de token nunca é julgado', () => {
        expect(find('.a { width: var(--so-do-componente, 17px); }')).toEqual([]);
    });

    it('a reserva interpolada em template não é julgada', () => {
        expect(fallbackMatches('${radius || 12}px', radius)).toBe(true);
    });
});

describe('o analisador', () => {
    it('lê a reserva aninhada e a leitura sem reserva', () => {
        const reads = readsIn('a { b: var(--x, var(--y, 3px)); c: var(--z); }', 'a.css');
        expect(reads.map((r) => [r.name, r.fallback])).toEqual([['--x', 'var(--y, 3px)'], ['--y', '3px'], ['--z', null]]);
    });

    it('tira o comentário preservando as linhas', () => {
        expect(stripComments('a\n/* var(--x)\n */\nb', true).split('\n')).toHaveLength(4);
    });
});

describe('o repositório real', () => {
    it('um dono por variável, nenhum nome sem dono e toda reserva no padrão', () => {
        const report = buildReport();
        expect(report.conflicts).toEqual([]);
        expect(report.ownerless).toEqual([]);
        expect(report.fallbacks).toEqual([]);
        expect(report.staleAllowlist).toEqual([]);
    });
});
