/**
 * SarakGantt — cronograma de tarefas com início, fim, progresso e dependências término → início.
 *
 * À esquerda, a lista das tarefas (título e grupo); à direita, a linha do tempo. As duas moram na MESMA área
 * de rolagem: a rolagem vertical é uma só (lista e linha do tempo andam juntas por construção), a lista fica
 * presa à esquerda e o cabeçalho de datas, ao topo, enquanto a linha do tempo rola na horizontal. No
 * contêiner estreito a lista vira uma coluna de título estreita. Escalas `day`, `week` e `month`; marcador de
 * hoje; fim de semana esmaecido na escala de dia. Renderiza sem `SarakUIProvider` (cai no português).
 *
 * Tamanho: até 500 tarefas sem virtualização. Fora do contrato, por ora: arrastar e redimensionar barra
 * (`onTaskChange` reservado), caminho crítico, auto-agendamento, exportação, horas e fuso.
 */

import React, { useEffect, useMemo } from 'react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import type { SarakCalendarDate } from '../SarakCalendar/calendarEvents';
import { GanttTimeline } from './GanttTimeline';
import { GANTT_GROUP_CLASS, GANTT_HEADER_HEIGHT, GANTT_LIST_CLASS, GANTT_ROW_SIZE, GANTT_SCROLL_HEIGHT, GANTT_STICKY_SURFACE } from './ganttLayout';
import { resolveGanttRange, type SarakGanttScale } from './ganttScale';
import { normalizeGanttTasks, resolveGanttDependencies, type GanttRow, type SarakGanttTask } from './ganttTasks';
import { useGanttFormats, type GanttFormats } from './useGanttFormats';

export interface SarakGanttProps {
    /** Tarefas, uma por linha, na ordem recebida. Vazio mostra o estado vazio traduzido. */
    tasks: SarakGanttTask[];
    /** Quanto cabe em cada coluna do cabeçalho: um dia, uma semana ou um mês. Omitido, `week`. */
    scale?: SarakGanttScale;
    /** Clique ou `Enter` numa barra. */
    onTaskClick?: (task: SarakGanttTask) => void;
    /** Primeiro dia exibido. Omitido, o início das tarefas com uma margem da escala. */
    rangeStart?: SarakCalendarDate;
    /** Último dia exibido, inclusive. Omitido, o fim das tarefas com uma margem da escala. */
    rangeEnd?: SarakCalendarDate;
    /** Nome acessível do cronograma. Omitido, usa o texto traduzido "Cronograma". */
    label?: string;
    className?: string;
}

const HAIRLINE = 'var(--sarak-border-width, 1px) solid var(--border-color, currentColor)';
const CAPTION = 'var(--sarak-type-scale-caption, 12px)';
const MUTED = 'var(--sarak-text-muted, var(--theme-muted, currentColor))';
const GAP_SM = 'var(--sarak-layout-gap-sm, 8px)';
const ellipsis: React.CSSProperties = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };

const WARNED_DEPENDENCIES = new Set<string>();

/** Dependência para tarefa inexistente: ignorada no desenho e avisada uma vez, só em desenvolvimento. */
function useMissingDependencyWarning(missing: string[]): void {
    const key = missing.join('|');
    useEffect(() => {
        if (process.env.NODE_ENV === 'production' || !key || WARNED_DEPENDENCIES.has(key)) return;
        WARNED_DEPENDENCIES.add(key);
        console.warn(`[Sarak] SarakGantt: dependência para tarefa inexistente, ignorada: ${key.split('|').join(', ')}.`);
    }, [key]);
}

function GanttTaskList({ rows, formats }: { rows: GanttRow[]; formats: GanttFormats }) {
    const text = useLibraryText();
    return (
        <div data-gantt-list="true" className={GANTT_LIST_CLASS} style={{ position: 'sticky', left: 0, zIndex: 2, ...GANTT_STICKY_SURFACE, borderInlineEnd: HAIRLINE }}>
            <div
                aria-hidden="true"
                style={{ ...ellipsis, position: 'sticky', top: 0, zIndex: 3, height: GANTT_HEADER_HEIGHT, lineHeight: GANTT_HEADER_HEIGHT, paddingInline: GAP_SM, ...GANTT_STICKY_SURFACE, borderBottom: HAIRLINE, fontSize: CAPTION, color: MUTED }}
            >
                {text('ganttTaskListLabel')}
            </div>
            <ul aria-label={text('ganttTaskListLabel')} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {rows.map((row) => (
                    <li
                        key={row.task.id}
                        data-gantt-list-row={row.task.id}
                        style={{ height: GANTT_ROW_SIZE, paddingInline: GAP_SM, borderBottom: HAIRLINE, boxSizing: 'border-box', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                    >
                        <span style={{ ...ellipsis, display: 'block', fontSize: CAPTION, color: 'var(--sarak-text-main, var(--color-theme-title, inherit))' }}>{row.task.title}</span>
                        {row.task.group && <span className={GANTT_GROUP_CLASS} style={{ fontSize: CAPTION, color: MUTED }}>{row.task.group}</span>}
                        <span className="sr-only">
                            {text('ganttTaskRange', { start: formats.full.format(row.start), end: formats.full.format(row.end) })}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export function SarakGantt({ tasks, scale = 'week', onTaskClick, rangeStart, rangeEnd, label, className }: SarakGanttProps) {
    const text = useLibraryText();
    const formats = useGanttFormats();
    const rows = useMemo(() => normalizeGanttTasks(tasks), [tasks]);
    const { edges, missing } = useMemo(() => resolveGanttDependencies(rows), [rows]);
    const range = useMemo(
        () => resolveGanttRange(rows, scale, { rangeStart, rangeEnd }),
        [rows, scale, rangeStart, rangeEnd],
    );
    useMissingDependencyWarning(missing);

    return (
        // Raiz em coluna com a altura do host: se o host tem altura definida, a área que rola a ocupa inteira.
        <section className={`@container ${className ?? ''}`} style={{ minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {rows.length === 0 ? (
                <span style={{ fontSize: CAPTION, color: MUTED }}>{text('ganttEmpty')}</span>
            ) : (
                // Focável para a rolagem por teclado; é ela que leva o nome do cronograma.
                <div role="region" aria-label={label ?? text('ganttLabel')} data-gantt-scroll="true" tabIndex={0} style={{ ...GANTT_SCROLL_HEIGHT, overflow: 'auto', border: HAIRLINE, borderRadius: 'var(--sarak-card-radius, 8px)' }}>
                    <div style={{ display: 'flex', width: 'max-content', minWidth: '100%' }}>
                        <GanttTaskList rows={rows} formats={formats} />
                        <GanttTimeline rows={rows} edges={edges} range={range} scale={scale} formats={formats} onTaskClick={onTaskClick} />
                    </div>
                </div>
            )}
        </section>
    );
}

export default SarakGantt;
