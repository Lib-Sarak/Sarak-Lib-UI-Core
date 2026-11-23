// @vitest-environment node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { runZeroBrandCheck } from '../check-zero-brand.mjs';

const roots = [];

const createSource = (files) => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-zero-brand-'));
    roots.push(root);
    const src = path.join(root, 'src');
    Object.entries(files).forEach(([name, content]) => {
        fs.mkdirSync(path.dirname(path.join(src, name)), { recursive: true });
        fs.writeFileSync(path.join(src, name), content, 'utf8');
    });
    return src;
};

const check = (files) => runZeroBrandCheck({ src: createSource(files), allowlist: new Set() }).violations;

afterEach(() => {
    while (roots.length) fs.rmSync(roots.pop(), { recursive: true, force: true });
});

// As formas em que a marca chega ao texto; o gate só ligava a string a JSX no mesmo arquivo.
const FORMS = [
    ['texto JSX', (m) => ({ 'F.tsx': `export const A = () => <span>${m}</span>;` })],
    ['atributo textual', (m) => ({ 'F.tsx': `export const A = () => <input placeholder="${m}" />;` })],
    ['padrão de prop', (m) => ({ 'F.tsx': `export const A = ({ title = '${m}' }: { title?: string }) => <h1>{title}</h1>;` })],
    ['objeto exportado', (m) => ({ 'F.ts': `export const LABELS = { header: { title: '${m}' } };` })],
    ['catálogo de idiomas em .ts', (m) => ({ 'F.ts': `export const CATALOG = { brand: { pt: '${m}', en: '${m}' } };` })],
    ['constante importada', (m) => ({ 'F.ts': `export const BRAND = '${m}';`, 'G.tsx': "import { BRAND } from './F'; export const A = () => <b>{BRAND}</b>;" })],
    ['dado em .ts', (m) => ({ 'F.ts': `export const ROWS = [{ name: \`${m}\` }];` })],
    ['document.title', (m) => ({ 'F.ts': `export const setTitle = () => { document.title = '${m}'; };` })],
    ['template com parte fixa', (m) => ({ 'F.ts': `export const greet = (n: string) => \`Olá, \${n}, aqui é ${m}\`;` })],
    ['valor de .json', (m) => ({ 'catalog/part.json': JSON.stringify({ description: m }) })],
];

// Frase da lista antiga, frase nova e cada disfarce de uso técnico que NÃO é técnico.
const BRAND_TEXTS = [
    'Sarak AI', 'SARAK TWIN', '[Sarak AI] Olá', '[Sarak OS]', 'Sarak: bem-vindo', 'Sarak/AI', 'SARAK-TWIN', 'Sarak-OS',
    'SarakOS', 'SarakAI', 'Powered-by-Sarak', 'SARAKTWIN', 'Sarak_OS', 'Ex: Sarak Sovereign Customizado',
    'scrollbar do Sarak', 'Matriz Sarak', 'sarak', 'sarak os',
];

describe('zero-brand', () => {
    describe.each(FORMS)('MUTAÇÃO: marca em %s', (_name, build) => {
        it.each(BRAND_TEXTS)('reprova "%s"', (text) => {
            expect(check(build(text)).length).toBeGreaterThan(0);
        });
    });

    it('isenta o uso técnico real: pacote, prefixos, utilitárias, comando, plugin e etiquetas exatas de diagnóstico', () => {
        expect(check({
            'F.ts': [
                "export const a = '@sarak/lib-ui-core';",
                "export const b = '--sarak-primary-color';",
                "export const c = 'data-sarak-slot';",
                "export const d = 'flex transition-sarak rounded-sarak';",
                "export const e = 'sarak:check';",
                "export const f = `sarak/${'id'}`;",
                "export const g = '[Sarak:UI] aviso';",
                "export const h = `--sarak-${'x'}-item`;",
                "export const i = '[Sarak] CSS não detectado';",
                "export const j = '[sarak verify] não achei o pacote';",
                "export const k = '[Sarak:Design] aviso';",
            ].join('\n'),
        })).toEqual([]);
    });

    it('isenta nome de componente só quando é identificador que existe em src/', () => {
        const files = { 'F.tsx': "export const SarakButton = () => null; export const name = 'SarakButton';" };
        expect(check(files)).toEqual([]);
        expect(check({ 'F.tsx': "export const name = 'SarakButton';" })).toHaveLength(1);
    });

    it('isenta o nome dos temas embarcados só nos arquivos do tema', () => {
        const theme = "export const theme = { name: 'Sarak Sovereign Classic' };";
        expect(check({ 'core/Design/presets/themes/sarak-sovereign-classic.ts': theme })).toEqual([]);
        expect(check({ 'core/Design/presets/components/cardsThemes.generated.ts': "export const c = 'Sarak Sovereign';" })).toEqual([]);
        expect(check({ 'features/Painel.ts': theme })).toHaveLength(1);
    });

    it('isenta o diagnóstico de console, o tipo literal e o uso técnico num .json', () => {
        expect(check({
            'F.ts': [
                "console.warn('Sarak: aviso para quem desenvolve');",
                "export type K = Pick<{ sarak: 1 }, 'sarak'>;",
            ].join('\n'),
            'catalog/part.json': JSON.stringify({ usage: 'a classe `transition-sarak` e a variável --sarak-x' }),
        })).toEqual([]);
    });

    it('não isenta texto de produto com a marca perto de um nome técnico', () => {
        expect(check({ 'F.tsx': 'export const A = () => <p>Bem-vindo ao Sarak SarakButton</p>;' })).toHaveLength(2);
    });
});
