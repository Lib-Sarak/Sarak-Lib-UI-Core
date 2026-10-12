// @vitest-environment node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
    ALLOWLIST,
    checkTokenReader,
    parseManifest,
    parseSchemaTokens,
} from '../check-token-reader.mjs';

const fixtureRoots = [];

function createFixtureRoot(files) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-token-reader-'));
    fixtureRoots.push(root);
    for (const [relativePath, content] of Object.entries(files)) {
        const fullPath = path.join(root, relativePath);
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, content, 'utf8');
    }
    return root;
}

afterEach(() => {
    while (fixtureRoots.length) fs.rmSync(fixtureRoots.pop(), { recursive: true, force: true });
});

const MANIFEST = `
import type { SarakTokenValue } from '../Design/types';
export const SARAK_DESIGN_MANIFEST: Record<string, {
    vars?: string[],
    attr?: string,
}> = {
    // comentário com { chave } solta
    surfaceMaterial: { attr: 'data-surface', vars: ['--sarak-surface'] },
    glassBlur: { vars: ['--glass-blur'], unit: 'px' },
    fontScale: {
        vars: ['--sarak-font-scale'],
        attr: 'data-font-scale',
        transform: (v: SarakTokenValue) => { return String(v); }
    },
};
`;

const SCHEMA = `
const MATERIAL_OPTIONS = [
    { value: 'frosted', label: 'Vidro' },
    { value: 'none', label: 'Nenhum' },
];
export const AtmosphereSchema = {
    id: 'atmosphere',
    tokens: [
        {
            id: 'surfaceMaterial',
            type: 'select',
            options: MATERIAL_OPTIONS,
            defaultValue: 'frosted',
            cssVars: ['--sarak-surface', '--surface-material']
        },
        {
            id: 'glassBlur',
            type: 'slider',
            constraints: { min: 0, max: 10 },
            cssVars: ['--glass-blur']
        },
        {
            id: 'fontScale',
            type: 'select',
            constraints: { options: [{ id: 'sm', value: 'sm' }, { id: 'lg', value: 'lg' }] },
            cssVars: ['--sarak-font-scale']
        }
    ]
};
`;

const baseFiles = {
    'src/core/Provider/manifest.ts': MANIFEST,
    'src/core/Design/schema/atmosphere.ts': SCHEMA,
};

describe('parseManifest', () => {
    it('lê vars, attr e classPrefix de cada entrada, inclusive com transform em linha', () => {
        const entries = parseManifest(MANIFEST);

        expect(entries.surfaceMaterial).toEqual({ vars: ['--sarak-surface'], attr: 'data-surface', classPrefix: null });
        expect(entries.glassBlur.vars).toEqual(['--glass-blur']);
        expect(entries.fontScale.vars).toEqual(['--sarak-font-scale']);
        expect(entries.fontScale.attr).toBe('data-font-scale');
    });
});

describe('parseSchemaTokens', () => {
    it('resolve opções inline, constantes do arquivo e cssVars', () => {
        const tokens = parseSchemaTokens(SCHEMA);
        const byId = Object.fromEntries(tokens.map((t) => [t.id, t]));

        expect(byId.surfaceMaterial.options).toEqual(['frosted', 'none']);
        expect(byId.surfaceMaterial.cssVars).toEqual(['--sarak-surface', '--surface-material']);
        expect(byId.fontScale.options).toEqual(['sm', 'lg']);
        expect(byId.glassBlur.options).toBeNull();
    });
});

describe('checkTokenReader — regra (ii): opção sem leitor', () => {
    it('MUTAÇÃO: opção do schema sem regra CSS nem componente é achado', () => {
        const root = createFixtureRoot({ ...baseFiles, 'src/styles/a.css': 'body { color: red; }' });

        const { open } = checkTokenReader({ root, allowlist: [] });

        expect(open).toContainEqual(expect.objectContaining({ kind: 'option', tokenId: 'surfaceMaterial', value: 'frosted' }));
    });

    it('a regra [data-sx-<kebab>="valor"] é o leitor da opção', () => {
        const root = createFixtureRoot({
            ...baseFiles,
            'src/styles/a.css': '[data-sx-surface-material="frosted"] .sarak-card { opacity: 1; }',
        });

        const { open } = checkTokenReader({ root, allowlist: [] });

        expect(open.filter((f) => f.kind === 'option' && f.tokenId === 'surfaceMaterial')).toEqual([]);
    });

    it('MUTAÇÃO: apagar a regra de uma opção faz o gate falhar de novo', () => {
        const withRule = createFixtureRoot({
            ...baseFiles,
            'src/styles/a.css': '[data-sx-surface-material="frosted"] .sarak-card { opacity: 1; }',
        });
        const withoutRule = createFixtureRoot({ ...baseFiles, 'src/styles/a.css': '.sarak-card { opacity: 1; }' });

        expect(checkTokenReader({ root: withRule, allowlist: [] }).open.some((f) => f.tokenId === 'surfaceMaterial')).toBe(false);
        expect(checkTokenReader({ root: withoutRule, allowlist: [] }).open.some((f) => f.tokenId === 'surfaceMaterial')).toBe(true);
    });

    it('um componente que acessa o id e cita o valor como literal é leitor', () => {
        const root = createFixtureRoot({
            ...baseFiles,
            'src/components/Scale.tsx': "export const s = (design) => design.fontScale === 'sm' ? 1 : design.fontScale === 'lg' ? 2 : 0;",
        });

        const { open } = checkTokenReader({ root, allowlist: [] });

        expect(open.filter((f) => f.tokenId === 'fontScale')).toEqual([]);
    });

    it('citar o valor sem acessar o id não é leitura', () => {
        const root = createFixtureRoot({
            ...baseFiles,
            'src/components/Scale.tsx': "export const SIZES = ['sm', 'lg'];",
        });

        const { open } = checkTokenReader({ root, allowlist: [] });

        expect(open.filter((f) => f.kind === 'option' && f.tokenId === 'fontScale').map((f) => f.value)).toEqual(['sm', 'lg']);
    });

    it('a opção `none` é a ausência do efeito e não exige leitor', () => {
        const root = createFixtureRoot({ ...baseFiles, 'src/styles/a.css': '.x { color: red; }' });

        const { findings } = checkTokenReader({ root, allowlist: [] });

        expect(findings.some((f) => f.value === 'none')).toBe(false);
    });

    it('schema, catálogo, gerados, presets e testes não contam como leitor', () => {
        const root = createFixtureRoot({
            ...baseFiles,
            'src/core/Design/presets/themes/t.ts': "export const t = { surfaceMaterial: 'frosted', fontScale: 'sm' }; const a = design.fontScale === 'lg';",
            'src/components/__tests__/x.test.tsx': "design.fontScale === 'sm'; design.fontScale === 'lg';",
            'src/core/Provider/generated/ids.ts': "design.fontScale === 'sm'",
        });

        const { open } = checkTokenReader({ root, allowlist: [] });

        expect(open.some((f) => f.tokenId === 'fontScale')).toBe(true);
    });
});

describe('checkTokenReader — regra (i): variável sem leitor', () => {
    it('MUTAÇÃO: variável que ninguém lê é achado', () => {
        const root = createFixtureRoot({ ...baseFiles, 'src/styles/a.css': '.x { color: red; }' });

        const { open } = checkTokenReader({ root, allowlist: [] });

        expect(open).toContainEqual(expect.objectContaining({ kind: 'var', tokenId: 'glassBlur' }));
    });

    it('var(--x) em CSS lê a variável do token', () => {
        const root = createFixtureRoot({
            ...baseFiles,
            'src/styles/a.css': '.x { backdrop-filter: blur(var(--glass-blur, 4px)); }',
        });

        const { open } = checkTokenReader({ root, allowlist: [] });

        expect(open.some((f) => f.tokenId === 'glassBlur')).toBe(false);
    });

    it('MUTAÇÃO: var(--glass-blur-extra) NÃO lê --glass-blur — o nome da variável é ancorado', () => {
        const prefixOnly = createFixtureRoot({
            ...baseFiles,
            'src/styles/a.css': '.x { backdrop-filter: blur(var(--glass-blur-extra, 4px)); }',
        });
        const exact = createFixtureRoot({
            ...baseFiles,
            'src/styles/a.css': '.x { backdrop-filter: blur(var(--glass-blur, 4px)); } .y { gap: var(--glass-blur-extra); }',
        });

        expect(checkTokenReader({ root: prefixOnly, allowlist: [] }).open.some((f) => f.kind === 'var' && f.tokenId === 'glassBlur')).toBe(true);
        expect(checkTokenReader({ root: exact, allowlist: [] }).open.some((f) => f.kind === 'var' && f.tokenId === 'glassBlur')).toBe(false);
    });

    it('MUTAÇÃO: o literal da variável num componente também é ancorado', () => {
        const prefixOnly = createFixtureRoot({
            ...baseFiles,
            'src/components/Blur.tsx': "export const style = { filter: 'blur(var(--glass-blur-extra, 4px))' };",
        });

        expect(checkTokenReader({ root: prefixOnly, allowlist: [] }).open.some((f) => f.kind === 'var' && f.tokenId === 'glassBlur')).toBe(true);
    });

    it('declarar a variável (sem lê-la) não é leitura', () => {
        const declared = createFixtureRoot({
            ...baseFiles,
            'src/styles/a.css': ':root { --glass-blur: 4px; }',
        });

        expect(checkTokenReader({ root: declared, allowlist: [] }).open.some((f) => f.kind === 'var' && f.tokenId === 'glassBlur')).toBe(true);
    });

    it('o id acessado num componente também lê o token', () => {
        const root = createFixtureRoot({
            ...baseFiles,
            'src/components/Blur.tsx': 'export const b = (design) => design.glassBlur;',
        });

        const { open } = checkTokenReader({ root, allowlist: [] });

        expect(open.some((f) => f.tokenId === 'glassBlur')).toBe(false);
    });

    it('token com todas as opções lidas por atributo está lido, mesmo sem ler a variável', () => {
        const root = createFixtureRoot({
            ...baseFiles,
            'src/styles/a.css': '[data-sx-surface-material="frosted"] .c { opacity: 1; }',
        });

        const { findings } = checkTokenReader({ root, allowlist: [] });

        expect(findings.filter((f) => f.tokenId === 'surfaceMaterial')).toEqual([]);
    });
});

const EXTRA_SCHEMA = `
export const ExtraSchema = {
    id: 'extra',
    tokens: [
        {
            id: 'borderType',
            type: 'select',
            options: [{ value: 'solid', label: 'Sólido' }, { value: 'glow', label: 'Neon' }, { value: 'none', label: 'Sem' }],
            cssVars: ['--sarak-border-type']
        },
        { id: 'smoothFlag', type: 'boolean', defaultValue: true },
        { id: 'orphanSlider', type: 'slider', cssVars: ['--sarak-orphan'] }
    ]
};
`;

describe('checkTokenReader — escopo: o schema inteiro, não o manifesto', () => {
    const files = { ...baseFiles, 'src/core/Design/schema/extra.ts': EXTRA_SCHEMA };

    it('MUTAÇÃO: token que o manifesto NÃO cita ainda é visto — opção e variável', () => {
        const root = createFixtureRoot({ ...files, 'src/styles/a.css': '.x { color: red; }' });

        const { open } = checkTokenReader({ root, allowlist: [] });

        expect(open).toContainEqual(expect.objectContaining({ kind: 'option', tokenId: 'borderType', value: 'glow' }));
        expect(open).toContainEqual(expect.objectContaining({ kind: 'var', tokenId: 'orphanSlider' }));
        expect(open).toContainEqual(expect.objectContaining({ kind: 'var', tokenId: 'smoothFlag' }));
    });

    it('a regra por opção basta, mesmo sem entrada no manifesto; `none` não exige regra', () => {
        const root = createFixtureRoot({
            ...files,
            'src/styles/a.css': '[data-sx-border-type="solid"] .c {} [data-sx-border-type="glow"] .c {}',
        });

        const { open } = checkTokenReader({ root, allowlist: [] });

        expect(open.filter((f) => f.tokenId === 'borderType')).toEqual([]);
    });

    it('MUTAÇÃO: apagar a regra de UMA opção de um token fora do manifesto falha o gate', () => {
        const root = createFixtureRoot({ ...files, 'src/styles/a.css': '[data-sx-border-type="solid"] .c {}' });

        const { open } = checkTokenReader({ root, allowlist: [] });

        expect(open.filter((f) => f.kind === 'option' && f.tokenId === 'borderType').map((f) => f.value)).toEqual(['glow']);
    });

    it('token booleano é lido por qualquer regra sobre o atributo dele', () => {
        const root = createFixtureRoot({ ...files, 'src/styles/a.css': '[data-sx-smooth-flag="true"] body { opacity: 1; }' });

        const { open } = checkTokenReader({ root, allowlist: [] });

        expect(open.some((f) => f.tokenId === 'smoothFlag')).toBe(false);
    });

    it('o prefixo de outro atributo não é leitura (data-sx-smooth-flag-extra ≠ data-sx-smooth-flag)', () => {
        const root = createFixtureRoot({ ...files, 'src/styles/a.css': '[data-sx-smooth-flag-extra="true"] body { opacity: 1; }' });

        const { open } = checkTokenReader({ root, allowlist: [] });

        expect(open.some((f) => f.tokenId === 'smoothFlag')).toBe(true);
    });

    it('a variável automática --sarak-<kebab> é lida mesmo sem cssVars nem manifesto', () => {
        const root = createFixtureRoot({ ...files, 'src/styles/a.css': '.x { opacity: var(--sarak-smooth-flag, 1); }' });

        const { open } = checkTokenReader({ root, allowlist: [] });

        expect(open.some((f) => f.tokenId === 'smoothFlag')).toBe(false);
    });
});

describe('ALLOWLIST', () => {
    it('cobre o achado do token e é a única forma de aceitá-lo', () => {
        const root = createFixtureRoot({ ...baseFiles, 'src/styles/a.css': '.x { color: red; }' });
        const allowlist = [
            { tokenId: 'surfaceMaterial', motivo: 'teste' },
            { tokenId: 'glassBlur', kind: 'var', motivo: 'teste' },
            { tokenId: 'fontScale', motivo: 'teste' },
        ];

        const { open, stale } = checkTokenReader({ root, allowlist });

        expect(open).toEqual([]);
        expect(stale).toEqual([]);
    });

    it('esvazia sozinha: entrada que já não é achado vira erro', () => {
        const root = createFixtureRoot({
            ...baseFiles,
            'src/styles/a.css': '[data-sx-surface-material="frosted"] .c { opacity: 1; }',
            'src/components/Blur.tsx': 'export const b = (design) => design.glassBlur;',
            'src/components/Scale.tsx': "design.fontScale === 'sm'; design.fontScale === 'lg';",
        });

        const { stale } = checkTokenReader({ root, allowlist: [{ tokenId: 'surfaceMaterial', motivo: 'obsoleta' }] });

        expect(stale).toEqual([{ tokenId: 'surfaceMaterial', motivo: 'obsoleta' }]);
    });

    it('termina VAZIA: todo token do schema tem leitor, e o mecanismo continua', () => {
        expect(ALLOWLIST).toEqual([]);
    });

    it('entrada que alguém declarar no gate traz motivo', () => {
        for (const entry of ALLOWLIST) {
            expect(typeof entry.tokenId).toBe('string');
            expect(entry.motivo.length).toBeGreaterThan(20);
        }
    });
});

const TABLE_SCHEMA = `
export const TransitionSchema = {
    id: 'transition',
    tokens: [
        {
            id: 'pageTransition',
            type: 'select',
            constraints: { options: [{ id: 'fade', value: 'fade' }, { id: 'slide-up', value: 'slide-up' }, { id: 'none', value: 'none' }] },
            cssVars: ['--sarak-page-transition']
        },
        {
            id: 'maxWidth',
            type: 'select',
            options: [{ value: '1000px', label: 'Estreito' }, { value: '100%', label: 'Fluido' }],
        }
    ]
};
`;

const TABLE_READER = `
// @sarak-token-reader pageTransition tabela
const variants = { fade: { opacity: 0 }, 'slide-up': { y: 20 }, none: {} };
export const pick = (design) => variants[design.pageTransition];
`;

const TABLE_TEST = `
it('pageTransition fade', () => { render({ pageTransition: 'fade' }); });
it('pageTransition slide-up', () => { render({ pageTransition: 'slide-up' }); });
`;

describe('checkTokenReader — leitor DECLARADO: tabela e passagem direta (regras ii e iii)', () => {
    const files = { ...baseFiles, 'src/core/Design/schema/transition.ts': TABLE_SCHEMA };

    it('chave de objeto sem aspas conta como o literal da opção, no componente que acessa o id', () => {
        const root = createFixtureRoot({
            ...files,
            'src/components/Pick.tsx': 'export const pick = (design) => ({ fade: 1, "slide-up": 2 })[design.pageTransition];',
        });

        const { open } = checkTokenReader({ root, allowlist: [] });

        expect(open.filter((f) => f.tokenId === 'pageTransition')).toEqual([]);
    });

    it('a tabela declarada cobre cada opção; com um teste por opção o token passa', () => {
        const root = createFixtureRoot({
            ...files,
            'src/components/Pick.ts': TABLE_READER,
            'src/components/__tests__/Pick.test.ts': TABLE_TEST,
        });

        const { open } = checkTokenReader({ root, allowlist: [] });

        expect(open.filter((f) => f.tokenId === 'pageTransition')).toEqual([]);
    });

    it('MUTAÇÃO: apagar a linha da tabela de uma opção faz o gate acusar a opção', () => {
        const root = createFixtureRoot({
            ...files,
            'src/components/Pick.ts': TABLE_READER.replace(" 'slide-up': { y: 20 },", ''),
            'src/components/__tests__/Pick.test.ts': TABLE_TEST,
        });

        const { open } = checkTokenReader({ root, allowlist: [] });

        expect(open).toContainEqual(expect.objectContaining({ kind: 'option', tokenId: 'pageTransition', value: 'slide-up' }));
    });

    it('MUTAÇÃO: apagar o caso de teste de uma opção faz o gate acusar o teste', () => {
        const root = createFixtureRoot({
            ...files,
            'src/components/Pick.ts': TABLE_READER,
            'src/components/__tests__/Pick.test.ts': TABLE_TEST.replace("it('pageTransition slide-up', () => { render({ pageTransition: 'slide-up' }); });", ''),
        });

        const { open } = checkTokenReader({ root, allowlist: [] });

        expect(open.filter((f) => f.tokenId === 'pageTransition')).toEqual([
            expect.objectContaining({ kind: 'test', value: 'slide-up' }),
        ]);
    });

    it('a opção `none` é ausência: nem tabela nem teste a exigem', () => {
        const root = createFixtureRoot({
            ...files,
            'src/components/Pick.ts': TABLE_READER.replace(', none: {}', ''),
            'src/components/__tests__/Pick.test.ts': TABLE_TEST,
        });

        const { findings } = checkTokenReader({ root, allowlist: [] });

        expect(findings.some((f) => f.tokenId === 'pageTransition' && f.value === 'none')).toBe(false);
    });

    it('passagem direta cobre toda opção, mas a prova por opção continua sendo exigida', () => {
        const reader = '// @sarak-token-reader maxWidth direto\nexport const style = (w) => ({ maxWidth: w });';
        const withTests = createFixtureRoot({
            ...files,
            'src/components/Pick.ts': TABLE_READER,
            'src/components/Width.ts': reader,
            'src/components/__tests__/Pick.test.ts': TABLE_TEST,
            'src/components/__tests__/Width.test.ts': "it('maxWidth', () => { ['1000px', '100%'].forEach(() => 0); });",
        });
        const withoutTests = createFixtureRoot({
            ...files,
            'src/components/Pick.ts': TABLE_READER,
            'src/components/Width.ts': reader,
            'src/components/__tests__/Pick.test.ts': TABLE_TEST,
        });

        expect(checkTokenReader({ root: withTests, allowlist: [] }).open.filter((f) => f.tokenId === 'maxWidth')).toEqual([]);
        expect(checkTokenReader({ root: withoutTests, allowlist: [] }).open.filter((f) => f.tokenId === 'maxWidth').map((f) => f.value))
            .toEqual(['1000px', '100%']);
    });

    it('declaração para token que não existe no schema é achado', () => {
        const root = createFixtureRoot({
            ...files,
            'src/components/Pick.ts': TABLE_READER,
            'src/components/Ghost.ts': '// @sarak-token-reader tokenInexistente tabela\nexport const x = 1;',
            'src/components/__tests__/Pick.test.ts': TABLE_TEST,
        });

        const { open } = checkTokenReader({ root, allowlist: [] });

        expect(open).toContainEqual(expect.objectContaining({ kind: 'marker', tokenId: 'tokenInexistente' }));
    });
});

describe('o repositório', () => {
    it('não tem valor emitido sem leitor fora da ALLOWLIST, e a ALLOWLIST não tem entrada obsoleta', () => {
        const { open, stale } = checkTokenReader();

        expect(open).toEqual([]);
        expect(stale).toEqual([]);
    });
});
