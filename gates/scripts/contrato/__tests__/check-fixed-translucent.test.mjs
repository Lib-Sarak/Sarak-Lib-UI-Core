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

describe('findInLine — paleta do Tailwind e cor quase preta/branca', () => {
    it.each([
        ['<i className="text-slate-400" />', 'text-slate-400'],
        ['<i className="bg-emerald-500/10" />', 'bg-emerald-500/10'],
        ['<i className="hover:text-red-400" />', 'hover:text-red-400'],
        ['<i className="from-indigo-500 to-blue-400" />', 'from-indigo-500'],
        ['<i className="shadow-rose-900/20" />', 'shadow-rose-900/20'],
    ])('PLANTADO (qualquer escopo): %s é acusado', (line, text) => {
        expect(findInLine(line).map((hit) => hit.text)).toContain(text);
    });

    it.each([
        ['<i className="bg-[var(--sarak-status-success-color,#10b981)]/10" />'],
        ['<i className="text-theme-muted" />'],
        ['<i className="text-slate" />'],
        ["const reserva = 'var(--x, #000000)'"],
    ])('PASSANTE: %s não é acusado', (line) => {
        expect(findInLine(line, { strict: true })).toEqual([]);
    });

    it.each([
        ['border-[#1a1a1c]', '#1a1a1c'],
        ['stroke: "#000"', '#000'],
        ["fill=\"white\"", 'fill="white"'],
        ["background: 'rgba(10,10,10,0.5)'", 'rgba(10,10,10,0.5)'],
        ["backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)'", 'white 1px'],
        ["color: 'rgb(255, 255, 255)'", 'rgb(255, 255, 255)'],
    ])('PLANTADO (só src/features): %s é acusado no modo estrito', (line, text) => {
        expect(findInLine(line, { strict: true }).map((hit) => hit.text)).toContain(text);
        expect(findInLine(line).map((hit) => hit.text)).not.toContain(text);
    });

    it('CONTRAPROVA: hex que não é quase preto/branco passa, mesmo no painel', () => {
        expect(findInLine("const a = '#3b82f6'; const b = '#808080';", { strict: true })).toEqual([]);
    });

    it('MUTAÇÃO: hex quase preto num mock do painel é achado, e o mesmo em componente não é', () => {
        const root = fixture({
            'src/features/Mock.tsx': "export const M = () => <div style={{ color: '#0a0a0a' }} />;\n",
            'src/components/atomic/A.tsx': "export const A = () => <div style={{ color: '#0a0a0a' }} />;\n",
        });

        const { violations } = findFixedTranslucent({ root, exceptions: {} });

        expect(violations).toEqual([{ file: 'src/features/Mock.tsx', line: 1, kind: 'hex', text: '#0a0a0a' }]);
    });
});

describe('findInLine — duração, atraso e sombra com `var()` de cor', () => {
    it.each([
        ['<i className="transition-all duration-300" />', 'duration-300'],
        ['<i className="hover:duration-500" />', 'hover:duration-500'],
        ['transition={{ duration: 0.3, ease: "circOut" }}', 'duration: 0.3'],
        ['transition={{ delay: 0.2, duration: durations.slow }}', 'delay: 0.2'],
        ['<i className="animate-bounce [animation-delay:0.2s]" />', 'animation-delay:0.2s'],
        ['<i className="shadow-[0_0_10px_rgba(var(--sarak-primary-color,#00f2ff),0.5)]" />', 'rgba(var(--sarak-primary-color,#00f2ff'],
    ])('PLANTADO: %s é acusado', (line, text) => {
        expect(findInLine(line).map((hit) => hit.text)).toContain(text);
    });

    it.each([
        ['<i className="duration-[var(--sarak-motion-dur-normal,0.3s)]" />'],
        ['transition={{ duration: durations.normal, delay: staggerDelay * 2 }}'],
        ['transition={{ duration: 0, delay: 0 }}'],
        ['<i className="[animation-delay:var(--sarak-motion-dur-fast,0.2s)]" />'],
        ['<i className="shadow-[0_0_10px_rgba(var(--theme-primary-rgb),0.5)]" />'],
        ['<i className="shadow-[0_0_10px_color-mix(in_srgb,var(--sarak-primary-color,#00f2ff)_50%,transparent)]" />'],
    ])('PASSANTE: %s não é acusado', (line) => {
        const kinds = findInLine(line).map((hit) => hit.kind);

        expect(kinds.filter((kind) => kind === 'duração' || kind === 'sombra-inválida')).toEqual([]);
    });

    it('MUTAÇÃO: um `duration-300` num componente é achado, e o mesmo em teste não', () => {
        const root = fixture({
            'src/components/atomic/A.tsx': 'export const A = () => <div className="transition-all duration-300" />;\n',
            'src/components/atomic/__tests__/A.test.tsx': 'it("x", () => { "duration-300"; });\n',
        });

        const { violations } = findFixedTranslucent({ root, exceptions: {} });

        expect(violations).toEqual([{ file: 'src/components/atomic/A.tsx', line: 1, kind: 'duração', text: 'duration-300' }]);
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
            'src/features/__tests__/P.test.tsx': "it('x', () => { '<i className=\"bg-white/5\" />'; });\n",
        });

        expect(findFixedTranslucent({ root, exceptions: {} }).violations).toEqual([]);
    });

    it('PLANTADO: o painel (src/features) também é acusado, e a forma do tema não', () => {
        const root = fixture({
            'src/features/Painel.tsx': "export const P = () => <div className=\"bg-white/5 text-white\" />;\n",
            'src/features/Ok.tsx': "export const O = () => <div className=\"bg-theme-text/5 text-theme-text\" />;\n",
        });

        const { violations } = findFixedTranslucent({ root, exceptions: {} });
        expect(violations.map((v) => v.file)).toEqual(['src/features/Painel.tsx', 'src/features/Painel.tsx']);
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
    // Varre a árvore inteira de `src/components` e `src/features` (mais de 400 arquivos, 14 regexes por linha): sob a
    // suíte completa em paralelo passa dos 5 s do padrão do vitest, e o limite certo é o da varredura, não o da média.
    it('não tem cor fixa em componente nem no painel, e a lista de exceções não tem entrada obsoleta', () => {
        const { violations, staleExceptions } = findFixedTranslucent();

        expect(violations).toEqual([]);
        expect(staleExceptions).toEqual([]);
    }, 60_000);

    it('toda exceção traz motivo', () => {
        for (const [file, motive] of Object.entries(EXCEPTIONS)) {
            expect(motive.length, file).toBeGreaterThan(20);
        }
    });
});
