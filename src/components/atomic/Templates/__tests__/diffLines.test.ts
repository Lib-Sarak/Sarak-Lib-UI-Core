import { describe, expect, it } from 'vitest';
import { sarakDiffLines } from '../diffLines';

describe('sarakDiffLines', () => {
    it('textos iguais viram só linhas "same"', () => {
        expect(sarakDiffLines('a\nb', 'a\nb')).toEqual([{ kind: 'same', text: 'a' }, { kind: 'same', text: 'b' }]);
    });

    it('troca de linha vira removida e adicionada, e o resto fica', () => {
        expect(sarakDiffLines('a\nb\nc', 'a\nX\nc')).toEqual([
            { kind: 'same', text: 'a' },
            { kind: 'removed', text: 'b' },
            { kind: 'added', text: 'X' },
            { kind: 'same', text: 'c' },
        ]);
    });

    it('antes vazio é tudo adicionado, e depois vazio é tudo removido', () => {
        expect(sarakDiffLines('', 'x')).toEqual([{ kind: 'added', text: 'x' }]);
        expect(sarakDiffLines('x\ny', '')).toEqual([{ kind: 'removed', text: 'x' }, { kind: 'removed', text: 'y' }]);
    });

    it('texto grande com uma linha mudada no meio termina rápido e marca só essa linha', () => {
        const lines = Array.from({ length: 20_000 }, (_, index) => `linha ${index}`);
        const changed = lines.map((line, index) => (index === 10_000 ? 'mudou' : line));
        const started = performance.now();
        const diff = sarakDiffLines(lines.join('\n'), changed.join('\n'));

        expect(performance.now() - started).toBeLessThan(2_000);
        expect(diff.filter((line) => line.kind !== 'same').map((line) => `${line.kind}:${line.text}`)).toEqual(['removed:linha 10000', 'added:mudou']);
        expect(diff).toHaveLength(20_001);
    });

    it('dois textos grandes todos diferentes viram removido e adicionado, sem montar a tabela', () => {
        const before = Array.from({ length: 5_000 }, (_, index) => `a${index}`).join('\n');
        const after = Array.from({ length: 5_000 }, (_, index) => `b${index}`).join('\n');
        const started = performance.now();
        const diff = sarakDiffLines(before, after);

        expect(performance.now() - started).toBeLessThan(2_000);
        expect(diff).toHaveLength(10_000);
        expect(diff.slice(0, 5_000).every((line) => line.kind === 'removed')).toBe(true);
        expect(diff.slice(5_000).every((line) => line.kind === 'added')).toBe(true);
    });

    it('aceita fim de linha do Windows', () => {
        expect(sarakDiffLines('a\r\nb', 'a\nb').every((line) => line.kind === 'same')).toBe(true);
    });
});
