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

describe('(iii) os furos que a reserva tinha — variante de canal, nome derivado e seletor morto', () => {
    const find = (files: Record<string, string>, tokens: TokenLike[] = [primary]) =>
        buildReport({ srcDir: srcFixture(files), tokens }).fallbacks;

    it('PLANTADO: o canal `-rgb` com a lista de outra cor (e com "banana") é acusado', () => {
        // O padrão da primária é `#00f2ff` → `0, 242, 255`. Antes o canal ia por `sameColor` e qualquer lista passava.
        expect(find({ 'a.css': '.a { color: rgba(var(--sarak-primary-color-rgb, 59, 130, 246), 0.4); }' })).toHaveLength(1);
        expect(find({ 'a.css': '.a { color: rgba(var(--sarak-primary-color-rgb, banana), 0.4); }' })).toHaveLength(1);
    });

    it('PASSA: o canal `-rgb` com o do padrão, escrito com ou sem espaço', () => {
        expect(find({ 'a.css': '.a { color: rgba(var(--sarak-primary-color-rgb, 0, 242, 255), 0.4); }' })).toEqual([]);
        expect(find({ 'a.css': '.a { color: rgba(var(--sarak-primary-color-rgb, 0,242,255), 0.4); }' })).toEqual([]);
    });

    it('PLANTADO: a reserva de um ALIAS de fachada em CSS da lib é julgada contra o token de origem', () => {
        const hook = "const aliasPairs = [['--accent-color', variables['--sarak-accent-color'] || variables['--theme-accent']]];";
        const accent: TokenLike = { id: 'accentColor', type: 'color', defaultValue: '#ff00d4', cssVars: ['--sarak-accent-color'] };
        const files = (reserve: string): Record<string, string> => ({
            'core/Design/hooks/useDesignVariables.ts': hook,
            'a.css': `.a { color: color-mix(in srgb, var(--accent-color, ${reserve}), #000 10%); }`,
        });
        expect(find(files('#06b6d4'), [accent])).toHaveLength(1);
        expect(find(files('#ff00d4'), [accent])).toEqual([]);
    });

    it('PLANTADO: o canal emitido fora do laço (`emitColorChannels`) tem a reserva julgada', () => {
        const body: TokenLike = { id: 'colorBgBody', type: 'color', defaultValue: '#050505', cssVars: ['--sarak-bg-body'] };
        const helper = "const CHANNEL_SOURCES = [['--sarak-bg-body-rgb', '--sarak-bg-body']];";
        const files = (reserve: string): Record<string, string> => ({
            'core/Design/hooks/designVariableHelpers.ts': helper,
            'a.css': `:root { --bg-body-rgb: var(--sarak-bg-body-rgb, ${reserve}); }`,
        });
        expect(find(files('248, 250, 252'), [body])).toHaveLength(1);
        expect(find(files('5, 5, 5'), [body])).toEqual([]);
    });

    it('PLANTADO: a reserva do alias em COMPONENTE (TSX) é julgada contra o token de origem, como a do CSS da lib', () => {
        const hook = "const aliasPairs = [['--accent-color', variables['--sarak-accent-color']]];";
        const accent: TokenLike = { id: 'accentColor', type: 'color', defaultValue: '#ff00d4', cssVars: ['--sarak-accent-color'] };
        const files = (reserve: string): Record<string, string> => ({
            'core/Design/hooks/useDesignVariables.ts': hook,
            'c.tsx': `export const c = 'text-[var(--accent-color,${reserve})]';`,
        });
        expect(find(files('#06b6d4'), [accent])).toHaveLength(1);
        expect(find(files('#ff00d4'), [accent])).toEqual([]);
    });

    it('PLANTADO: o alias de texto mudo com o hex antigo (`#94a3b8`) é acusado no componente; o padrão do token passa', () => {
        const muted: TokenLike = { id: 'textColorMuted', type: 'color', defaultValue: 'rgba(255, 255, 255, 0.4)', cssVars: ['--sarak-text-muted'] };
        const hook = "const aliasPairs = [['--text-muted', variables['--sarak-text-muted']]];";
        const files = (reserve: string): Record<string, string> => ({
            'core/Design/hooks/useDesignVariables.ts': hook,
            'c.tsx': `export const c = { color: 'var(--text-muted, ${reserve})' };`,
        });
        expect(find(files('#94a3b8'), [muted])).toHaveLength(1);
        expect(find(files('rgba(255,255,255,0.4)'), [muted])).toEqual([]);
    });

    it('PLANTADO: a reserva de um nome DERIVADO declarado em CSS da lib é julgada contra o valor que a cadeia carrega', () => {
        const radius: TokenLike = { id: 'borderRadius', type: 'slider', unit: 'px', defaultValue: 12, cssVars: ['--radius-theme'] };
        const files = (reserve: string): Record<string, string> => ({
            'theme.css': '@theme { --radius-sarak: var(--sarak-card-border-radius, var(--radius-theme, 12px)); --radius-btn: var(--sarak-btn-border-radius, var(--radius-sarak)); }',
            'a.tsx': `export const a = 'rounded-[var(--radius-btn,${reserve})]';`,
        });
        expect(find(files('8px'), [radius])).toHaveLength(1);
        expect(find(files('12px'), [radius])).toEqual([]);
    });

    it('PLANTADO: nome derivado com cor — `--color-theme-primary, #3b82f6` contra o `#00f2ff` que o nome carrega', () => {
        const primary2: TokenLike = { id: 'primaryColor', type: 'color', defaultValue: '#00f2ff', cssVars: ['--sarak-primary-color'] };
        const css = '@theme { --color-theme-primary: var(--sarak-primary-color, #00f2ff); }';
        const read = (reserve: string): Record<string, string> => ({ 'a.css': css, 'b.tsx': `export const b = 'var(--color-theme-primary, ${reserve})';` });
        expect(find(read('#3b82f6'), [primary2])).toHaveLength(1);
        expect(find(read('#00f2ff'), [primary2])).toEqual([]);
    });

    it('PLANTADO: reserva sem unidade em variável que carrega unidade (`calc(var(--x, 8) * 1px)`) é acusada', () => {
        const radius: TokenLike = { id: 'inputBorderRadius', type: 'slider', unit: 'px', defaultValue: 8, cssVars: ['--sarak-input-border-radius'] };
        expect(find({ 'a.tsx': "export const a = 'calc(var(--sarak-input-border-radius, 8) * 1px)';" }, [radius])).toHaveLength(1);
        expect(find({ 'a.tsx': "export const a = 'var(--sarak-input-border-radius, 8px)';" }, [radius])).toEqual([]);
    });

    it('PLANTADO: palavra-chave que não é comprimento (`thin`) como reserva de variável com unidade é acusada', () => {
        const width: TokenLike = { id: 'borderWidth', type: 'slider', unit: 'px', defaultValue: 1, cssVars: ['--sarak-border-width'] };
        expect(find({ 'a.tsx': "export const a = { width: 'var(--sarak-border-width, thin)' };" }, [width])).toHaveLength(1);
        expect(find({ 'a.tsx': "export const a = { width: 'var(--sarak-border-width, auto)' };" }, [width])).toEqual([]);
    });

    it('a tolerância de alfa é só de escrita: 0,02 e 0,03 são cores diferentes; `.05` e `0.05` são a mesma', () => {
        const bg: TokenLike = { id: 'inputBg', type: 'color', defaultValue: 'rgba(255, 255, 255, 0.03)', cssVars: ['--sarak-input-bg'] };
        const read = (reserve: string): Record<string, string> => ({ 'a.tsx': `export const a = 'var(--sarak-input-bg, ${reserve})';` });
        expect(find(read('rgba(255, 255, 255, 0.02)'), [bg])).toHaveLength(1);
        expect(find(read('rgba(255,255,255,.03)'), [bg])).toEqual([]);
    });

    it('PLANTADO: a declaração sob seletor que exige atributo que ninguém escreve NÃO é dono', () => {
        const css = '[data-font-scale="g"] { --font-size-factor: 1.25; } .a { height: calc(1px * var(--font-size-factor, 1)); }';
        expect(buildReport({ srcDir: srcFixture({ 'a.css': css }), tokens: [primary] }).ownerless.map((o) => o.name)).toEqual(['--font-size-factor']);
    });

    it('PASSA: o seletor cujo atributo o motor emite (token select) ou o código escreve é dono', () => {
        const mode: TokenLike = { id: 'surfaceMaterial', type: 'select', defaultValue: 'frosted', cssVars: [] };
        const emitted = '[data-sx-surface-material="sleek"] { --so-do-material: 1px; } .a { width: var(--so-do-material); }';
        expect(buildReport({ srcDir: srcFixture({ 'a.css': emitted }), tokens: [primary, mode] }).ownerless).toEqual([]);
        const written = { 'a.css': '[data-meu-atributo] { --do-atributo: 1px; } .a { width: var(--do-atributo); }', 'b.tsx': "export const p = { 'data-meu-atributo': '' };" };
        expect(buildReport({ srcDir: srcFixture(written), tokens: [primary] }).ownerless).toEqual([]);
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
