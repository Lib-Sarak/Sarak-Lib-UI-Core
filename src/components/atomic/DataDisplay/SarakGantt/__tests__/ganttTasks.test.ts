import { describe, expect, it } from 'vitest';
import { ganttProgress, normalizeGanttTasks, resolveGanttDependencies, type SarakGanttTask } from '../ganttTasks';

const task = (id: string, extra: Partial<SarakGanttTask> = {}): SarakGanttTask => ({
    id,
    title: `Tarefa ${id}`,
    start: '2026-10-05',
    end: '2026-10-07',
    ...extra,
});

describe('normalizeGanttTasks', () => {
    it('lê as datas como dia local e numera as linhas na ordem de entrada', () => {
        const rows = normalizeGanttTasks([task('a'), task('b', { start: new Date(2026, 9, 10, 18), end: '2026-10-12' })]);
        expect(rows.map((row) => [row.task.id, row.index])).toEqual([['a', 0], ['b', 1]]);
        expect(rows[1].start).toEqual(new Date(2026, 9, 10));
        expect(rows[1].end).toEqual(new Date(2026, 9, 12));
    });

    it('descarta início ilegível; fim ilegível ou antes do início vira o dia do início', () => {
        const rows = normalizeGanttTasks([
            task('ruim', { start: 'amanhã' }),
            task('sem-fim', { end: 'x' }),
            task('invertida', { start: '2026-10-10', end: '2026-10-01' }),
        ]);
        expect(rows.map((row) => row.task.id)).toEqual(['sem-fim', 'invertida']);
        expect(rows[0].end).toEqual(rows[0].start);
        expect(rows[1].end).toEqual(new Date(2026, 9, 10));
        expect(rows[1].index).toBe(1);
    });
});

describe('resolveGanttDependencies', () => {
    it('um par término → início por dependência existente', () => {
        const rows = normalizeGanttTasks([task('a'), task('b', { dependsOn: ['a'] })]);
        const { edges, missing } = resolveGanttDependencies(rows);
        expect(edges.map((edge) => `${edge.from.task.id}->${edge.to.task.id}`)).toEqual(['a->b']);
        expect(missing).toEqual([]);
    });

    it('id inexistente vai para missing e não vira seta; de si mesma e repetida são descartadas', () => {
        const rows = normalizeGanttTasks([task('a'), task('b', { dependsOn: ['a', 'a', 'b', 'fantasma'] })]);
        const { edges, missing } = resolveGanttDependencies(rows);
        expect(edges).toHaveLength(1);
        expect(missing).toEqual(['b → fantasma']);
    });

    it('um ciclo vira duas setas e termina (nada percorre o grafo)', () => {
        const rows = normalizeGanttTasks([task('a', { dependsOn: ['b'] }), task('b', { dependsOn: ['a'] })]);
        expect(resolveGanttDependencies(rows).edges.map((edge) => edge.from.task.id)).toEqual(['b', 'a']);
    });
});

describe('ganttProgress', () => {
    it('recorta em 0–100 e devolve null sem número', () => {
        expect(ganttProgress(45)).toBe(45);
        expect(ganttProgress(-10)).toBe(0);
        expect(ganttProgress(140)).toBe(100);
        expect(ganttProgress(undefined)).toBeNull();
        expect(ganttProgress(Number.NaN)).toBeNull();
    });
});
