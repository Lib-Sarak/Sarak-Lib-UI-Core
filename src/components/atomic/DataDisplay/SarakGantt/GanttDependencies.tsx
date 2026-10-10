/**
 * Setas de dependência do SarakGantt (término → início), em SVG por cima das barras.
 *
 * O `x` sai da escala, em pixels; o `y` sai em PORCENTAGEM da altura da área das linhas, porque todas as
 * linhas têm a mesma altura (um token de espaçamento): o centro da linha `i` de `n` fica em `(i + 0,5) / n`.
 * Assim nenhuma altura de linha precisa ser medida em JS. Decorativo para leitor de tela: a lista já diz o
 * início e o fim de cada tarefa.
 */

import React, { useId } from 'react';
import { GANTT_DAY_WIDTH, ganttBarGeometry, ganttRangeWidth, type GanttRange, type SarakGanttScale } from './ganttScale';
import type { GanttEdge } from './ganttTasks';

export interface GanttDependenciesProps {
    edges: GanttEdge[];
    range: GanttRange;
    scale: SarakGanttScale;
    rowCount: number;
}

export interface GanttArrow {
    key: string;
    /** Fim da barra predecessora. */
    x1: number;
    /** Onde a seta desce ou sobe entre as linhas, um pouco depois do fim da predecessora. */
    xTurn: number;
    /** Início da barra sucessora. */
    x2: number;
    y1: string;
    y2: string;
}

const rowCenter = (index: number, rowCount: number): string => `${((index + 0.5) / rowCount) * 100}%`;

/**
 * Geometria de uma seta: sai do fim da predecessora, anda meio dia, troca de linha e entra no início da sucessora.
 * Só existe com as duas pontas dentro do intervalo (o fim da predecessora e o início da sucessora); senão, `null`.
 * A volta nunca passa do último dia.
 */
export const ganttArrow = (edge: GanttEdge, range: GanttRange, scale: SarakGanttScale, rowCount: number): GanttArrow | null => {
    const width = ganttRangeWidth(range, scale);
    const from = ganttBarGeometry(edge.from.start, edge.from.end, range, scale);
    const x1 = from.x + from.width;
    const x2 = ganttBarGeometry(edge.to.start, edge.to.end, range, scale).x;
    if (x1 <= 0 || x1 > width || x2 < 0 || x2 >= width) return null;
    return {
        key: `${edge.from.task.id}->${edge.to.task.id}`,
        x1,
        xTurn: Math.min(x1 + Math.max(GANTT_DAY_WIDTH[scale] / 2, GANTT_DAY_WIDTH.week / 2), width),
        x2,
        y1: rowCenter(edge.from.index, rowCount),
        y2: rowCenter(edge.to.index, rowCount),
    };
};

export function GanttDependencies({ edges, range, scale, rowCount }: GanttDependenciesProps) {
    // `useId` dá um id por instância: dois Gantts na mesma página não disputam o marcador da ponta.
    const markerId = `sarak-gantt-arrow-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
    const arrows = rowCount === 0 ? [] : edges.flatMap((edge) => ganttArrow(edge, range, scale, rowCount) ?? []);
    if (arrows.length === 0) return null;

    return (
        <svg
            aria-hidden="true"
            data-gantt-dependencies="true"
            width="100%"
            height="100%"
            style={{
                position: 'absolute',
                inset: 0,
                overflow: 'visible',
                pointerEvents: 'none',
                color: 'var(--sarak-text-muted, var(--theme-muted, currentColor))',
            }}
        >
            <defs>
                <marker id={markerId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
                </marker>
            </defs>
            {arrows.map((arrow) => (
                <g key={arrow.key} data-gantt-arrow={arrow.key} stroke="currentColor" strokeWidth={1.5} fill="none">
                    <line x1={arrow.x1} y1={arrow.y1} x2={arrow.xTurn} y2={arrow.y1} />
                    <line x1={arrow.xTurn} y1={arrow.y1} x2={arrow.xTurn} y2={arrow.y2} />
                    <line x1={arrow.xTurn} y1={arrow.y2} x2={arrow.x2} y2={arrow.y2} markerEnd={`url(#${markerId})`} />
                </g>
            ))}
        </svg>
    );
}

export default GanttDependencies;
