// @vitest-environment node
// Teste do PRÓPRIO GATE `fixed-translucent:check`: casos PLANTADOS que ele pega, passantes que ele deixa
// passar, e o repositório real.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { EXCEPTIONS, findFixedTranslucent, findInLine, insideVarFallback } from '../check-fixed-translucent.mjs';

const roots = [];

function fixture(files) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-fixed-translucent-'));
    roots.push(root);
    for (const [relative, content] of Object.entries(files)) {
        const full = path.join(root, relative);
        fs.mkdirSync(path.dirname(full), { recursive: true });
        fs.writeFileSync(full, content, 'utf8');
    }
    return root;
}

afterEach(() => {
    while (roots.length) fs.rmSync(roots.pop(), { recursive: true, force: true });
});

describe('findInLine — o que é branco/preto fixo', () => {
    it.each([
        ['<div className="bg-white/5" />', 'bg-white/5'],
        ['<div className="hover:bg-white/[0.04]" />', 'hover:bg-white/[0.04]'],
        ['<div className="border border-black/10" />', 'border-black/10'],
        ['<i className="group-hover/soc:bg-white/10" />', 'group-hover/soc:bg-white/10'],
        ['<span className="text-white" />', 'text-white'],
        ['<span className="hover:text-white" />', 'hover:text-white'],
        ["boxShadow: '0 0 4px rgba(0,0,0,0.5)'", 'rgba(0,0,0,0.5)'],
        ["border: '1px solid rgba(255, 255, 255, 0.1)'", 'rgba(255, 255, 255, 0.1)'],
    ])('PLANTADO: %s é acusado', (line, text) => {
        expect(findInLine(line).map((hit) => hit.text)).toContain(text);
    });

    it.each([
        ['<div className="bg-theme-tint" />'],
        ['<div className="text-[var(--text-main,#ffffff)]" />'],
        ["border: 'var(--theme-border, rgba(255,255,255,0.1))'"],
        ["color: 'var(--x, color-mix(in srgb, var(--y, rgba(0,0,0,0.5)) 50%, transparent))'"],
        ["backgroundColor: 'rgba(255, 255, 255, 1)'"],
        ['<div className="bg-white-label" />'],
        ["const rgba = 'rgba(15, 23, 42, 0.6)'"],
    ])('PASSANTE: %s não é acusado', (line) => {
        expect(findInLine(line)).toEqual([]);
    });

    it('a reserva só vale enquanto o `var(` está aberto', () => {
        const line = "x: 'var(--a, 1) rgba(0,0,0,0.5)'";
        expect(insideVarFallback(line, line.indexOf('rgba'))).toBe(false);
        expect(findInLine(line)).toHaveLength(1);
    });
});

describe('findFixedTranslucent — o repositório de fixture', () => {
    it('MUTAÇÃO: um bg-white/5 num componente é achado, com arquivo e linha', () => {
        const root = fixture({ 'src/components/atomic/A.tsx': 'export const A = () => <div className="p-2 bg-white/5" />;\n' });

        const { violations } = findFixedTranslucent({ root, exceptions: {} });

        expect(violations).toEqual([{ file: 'src/components/atomic/A.tsx', line: 1, kind: 'classe', text: 'bg-white/5' }]);
    });

    it('o parcial de CSS de componente também é varrido', () => {
        const root = fixture({ 'src/styles/_base.css': '.x::-webkit-scrollbar-thumb {\n    background: rgba(255, 255, 255, 0.4);\n}\n' });

        const { violations } = findFixedTranslucent({ root, exceptions: {} });

        expect(violations).toHaveLength(1);
        expect(violations[0]).toMatchObject({ file: 'src/styles/_base.css', line: 2, kind: 'rgba' });
    });

    it('CONTRAPROVA: o mesmo valor como reserva de token, em comentário ou em teste não é achado', () => {
        const root = fixture({
            'src/components/atomic/A.tsx': "const c = 'var(--border, rgba(255,255,255,0.1))';\n// bg-white/5 era assim\n",
            'src/components/atomic/__tests__/A.test.tsx': "it('x', () => { '<i className=\"bg-white/5\" />'; });\n",
            'src/features/Painel.tsx': "export const P = () => <div className=\"bg-white/5\" />;\n",
        });

        expect(findFixedTranslucent({ root, exceptions: {} }).violations).toEqual([]);
    });

    it('o marcador `sarak-allow-fixed-color:` na linha ou na anterior aceita a ocorrência', () => {
        const root = fixture({
            'src/components/atomic/A.tsx': "// sarak-allow-fixed-color: o véu é do próprio componente\nconst a = 'bg-black/50';\nconst b = 'bg-black/50'; // sarak-allow-fixed-color: idem\n",
        });

        expect(findFixedTranslucent({ root, exceptions: {} }).violations).toEqual([]);
    });

    it('exceção de arquivo vale, e acusa-se a que deixou de ter ocorrência', () => {
        const root = fixture({
            'src/components/atomic/Media/Lightbox.tsx': "const a = 'bg-black/90';\n",
            'src/components/atomic/Limpo.tsx': "const a = 'bg-theme-tint';\n",
        });
        const exceptions = {
            'src/components/atomic/Media/Lightbox.tsx': 'fundo próprio',
            'src/components/atomic/Limpo.tsx': 'não tem mais ocorrência',
        };

        const { violations, staleExceptions } = findFixedTranslucent({ root, exceptions });

        expect(violations).toEqual([]);
        expect(staleExceptions).toEqual(['src/components/atomic/Limpo.tsx']);
    });
});

describe('o repositório', () => {
    it('não tem branco/preto fixo em componente, e a lista de exceções não tem entrada obsoleta', () => {
        const { violations, staleExceptions } = findFixedTranslucent();

        expect(violations).toEqual([]);
        expect(staleExceptions).toEqual([]);
    });

    it('toda exceção traz motivo', () => {
        for (const [file, motive] of Object.entries(EXCEPTIONS)) {
            expect(motive.length, file).toBeGreaterThan(20);
        }
    });
});
