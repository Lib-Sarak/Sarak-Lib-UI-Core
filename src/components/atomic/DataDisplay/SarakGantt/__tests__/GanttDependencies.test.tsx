import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GanttDependencies, ganttArrow } from '../GanttDependencies';
import { normalizeGanttTasks, resolveGanttDependencies } from '../ganttTasks';

const RANGE = { start: new Date(2026, 9, 1), end: new Date(2026, 9, 31) };
const rows = normalizeGanttTasks([
    { id: 'a', title: 'A', start: '2026-10-02', end: '2026-10-04' },
    { id: 'b', title: 'B', start: '2026-10-06', end: '2026-10-08', dependsOn: ['a'] },
    { id: 'c', title: 'C', start: '2026-10-06', end: '2026-10-06', dependsOn: ['a'] },
]);
const { edges } = resolveGanttDependencies(rows);

describe('ganttArrow', () => {
    it('sai do fim da predecessora, vira depois dela e entra no início da sucessora, no centro de cada linha', () => {
        expect(ganttArrow(edges[0], RANGE, 'day', 3)).toEqual({
            key: 'a->b',
            x1: 4 * 32,
            xTurn: 4 * 32 + 16,
            x2: 5 * 32,
            y1: `${(0.5 / 3) * 100}%`,
            y2: `${(1.5 / 3) * 100}%`,
        });
    });

    it('em escala apertada a volta ainda se afasta da barra', () => {
        const arrow = ganttArrow(edges[0], RANGE, 'month', 3);
        expect(arrow.xTurn - arrow.x1).toBe(6);
    });
});

describe('GanttDependencies', () => {
    it('desenha uma seta por dependência, com a ponta no marcador da instância', () => {
        const { container } = render(<GanttDependencies edges={edges} range={RANGE} scale="day" rowCount={3} />);
        const svg = container.querySelector('svg[data-gantt-dependencies]')!;
        expect(svg).toHaveAttribute('aria-hidden', 'true');
        expect(svg.querySelectorAll('[data-gantt-arrow]')).toHaveLength(2);
        const markerId = svg.querySelector('marker')!.id;
        expect(svg.querySelector('[data-gantt-arrow="a->b"] line:last-child')).toHaveAttribute('marker-end', `url(#${markerId})`);
    });

    it('dois Gantts na página não compartilham o id do marcador', () => {
        const { container } = render(
            <>
                <GanttDependencies edges={edges} range={RANGE} scale="day" rowCount={3} />
                <GanttDependencies edges={edges} range={RANGE} scale="day" rowCount={3} />
            </>,
        );
        const ids = [...container.querySelectorAll('marker')].map((marker) => marker.id);
        expect(new Set(ids).size).toBe(2);
    });

    it('sem dependência não desenha nada', () => {
        const { container } = render(<GanttDependencies edges={[]} range={RANGE} scale="day" rowCount={3} />);
        expect(container.querySelector('svg')).toBeNull();
    });
});
