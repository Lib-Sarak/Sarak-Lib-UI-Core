/**
 * Linha do tempo do SarakGantt: cabeçalho de datas fixo no topo, uma linha por tarefa com a barra posicionada
 * pela escala, fim de semana esmaecido (escala de dia), marcador de hoje e as setas de dependência.
 *
 * A barra é um `SarakButton` (focável; `Enter` e clique chamam `onTaskClick`) com a tipografia de conteúdo,
 * não a de ação. Nenhuma medida solta: posição e largura saem de `ganttScale.ts` em números, que o React
 * escreve em pixels; alturas, do token de espaçamento.
 */

import React from 'react';
import { isAfter, isBefore, startOfDay } from 'date-fns';
import { SarakButton } from '../../Buttons/SarakButton';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import { GanttDependencies } from './GanttDependencies';
import { GANTT_BAR_CLASS, GANTT_HEADER_HEIGHT, GANTT_ROW_SIZE, GANTT_STICKY_SURFACE } from './ganttLayout';
import {
    GANTT_DAY_WIDTH,
    buildGanttTicks,
    ganttBarGeometry,
    ganttDateToPixel,
    ganttRangeWidth,
    ganttToneColor,
    ganttVisibleBar,
    ganttVisibleProgress,
    type GanttRange,
    type GanttTick,
    type SarakGanttScale,
} from './ganttScale';
import { ganttProgress, type GanttEdge, type GanttRow, type SarakGanttTask } from './ganttTasks';
import type { GanttFormats } from './useGanttFormats';

export interface GanttTimelineProps {
    rows: GanttRow[];
    edges: GanttEdge[];
    range: GanttRange;
    scale: SarakGanttScale;
    formats: GanttFormats;
    onTaskClick?: (task: SarakGanttTask) => void;
}

const HAIRLINE = 'var(--sarak-border-width, 1px) solid var(--border-color, currentColor)';
const CAPTION = 'var(--sarak-type-scale-caption, 12px)';
const MUTED = 'var(--sarak-text-muted, var(--theme-muted, currentColor))';
const GAP_XS = 'calc(var(--sarak-layout-gap-sm, 8px) * 0.25)';
/**
 * Espessura do marcador de hoje: o dobro da borda do tema, com PISO. O marcador é informação, não decoração, e um
 * tema tem direito de zerar `--sarak-border-width` (o `minimalist-airy` zera); as linhas divisórias somem com ele,
 * o marcador não.
 */
// sarak-allow-hardcode: piso do marcador de hoje — o token de borda pode ser 0 e o marcador nunca pode sumir.
export const GANTT_TODAY_THICKNESS = 'max(2px, calc(var(--sarak-border-width, 1px) * 2))';
/** Alvo mínimo de toque (`0px` com ponteiro fino); a barra nunca fica menor que ele nem desce de 60% da linha. */
const GANTT_TOUCH_ACTIVE = 'var(--sarak-touch-target-active, 0px)';
const GANTT_BAR_HEIGHT = `max(60%, ${GANTT_TOUCH_ACTIVE})`;
/** O progresso é uma faixa fina na base da barra, fora do título. */
const GANTT_PROGRESS_HEIGHT = 'calc(var(--sarak-layout-gap-sm, 8px) * 0.375)';

function GanttHeader({ ticks, scale, formats, width }: { ticks: GanttTick[]; scale: SarakGanttScale; formats: GanttFormats; width: number }) {
    return (
        <div
            data-gantt-header="true"
            aria-hidden="true"
            style={{ position: 'sticky', top: 0, zIndex: 1, height: GANTT_HEADER_HEIGHT, width, ...GANTT_STICKY_SURFACE, borderBottom: HAIRLINE }}
        >
            {ticks.map((tick, index) => (
                <GanttHeaderTick key={tick.x} tick={tick} scale={scale} formats={formats} isFirst={index === 0} />
            ))}
        </div>
    );
}

const tickStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    borderInlineStart: HAIRLINE,
    fontSize: CAPTION,
    color: MUTED,
};

function GanttHeaderTick({ tick, scale, formats, isFirst }: { tick: GanttTick; scale: SarakGanttScale; formats: GanttFormats; isFirst: boolean }) {
    const context = formats.tickContext(tick.date, scale, isFirst);
    return (
        <span title={formats.full.format(tick.date)} style={{ ...tickStyle, left: tick.x, width: tick.width }}>
            {context && <span style={{ lineHeight: 1 }}>{context}</span>}
            <span style={{ lineHeight: 1.2 }}>{formats.tick(tick.date, scale)}</span>
        </span>
    );
}

function GanttBar({ row, range, scale, formats, onTaskClick }: { row: GanttRow; range: GanttRange; scale: SarakGanttScale; formats: GanttFormats; onTaskClick?: (task: SarakGanttTask) => void }) {
    const text = useLibraryText();
    const { task } = row;
    const bar = ganttBarGeometry(row.start, row.end, range, scale);
    const visible = ganttVisibleBar(bar, range, scale);
    const progress = ganttProgress(task.progress);
    const tone = ganttToneColor(task.tone);
    const dates = { title: task.title, start: formats.full.format(row.start), end: formats.full.format(row.end) };
    const label = progress === null ? text('ganttTaskBar', dates) : text('ganttTaskBarProgress', { ...dates, progress: Math.round(progress) });
    // Tarefa inteiramente fora do intervalo não tem barra; a linha continua, alinhada com a lista.
    if (!visible) return null;

    return (
        <SarakButton
            type="button"
            variant="ghost"
            size="xs"
            data-gantt-bar={task.id}
            aria-label={label}
            className={GANTT_BAR_CLASS}
            style={{
                position: 'absolute',
                left: visible.x,
                width: visible.width,
                // 60% da linha com ponteiro fino; com o dedo a barra sobe ao alvo mínimo e se centra na linha.
                top: `calc((100% - ${GANTT_BAR_HEIGHT}) / 2)`,
                height: GANTT_BAR_HEIGHT,
                minHeight: 0,
                minWidth: GANTT_TOUCH_ACTIVE,
                padding: 0,
                justifyContent: 'flex-start',
                overflow: 'hidden',
                border: 'none',
                borderRadius: 'var(--sarak-card-radius, 8px)',
                // Trilha opaca (o tom misturado à cor de fundo do tema): o título fica sobre ela, nunca sobre o
                // preenchimento, e o contraste com o texto principal não depende da cor do tom.
                background: `color-mix(in srgb, ${tone} 22%, var(--color-theme-body, Canvas))`,
                color: 'var(--sarak-text-main, var(--color-theme-title, inherit))',
                fontSize: CAPTION,
            }}
            onClick={() => onTaskClick?.(task)}
            onKeyDown={(keyEvent) => {
                if (keyEvent.key !== 'Enter') return;
                keyEvent.preventDefault();
                onTaskClick?.(task);
            }}
        >
            {progress !== null && (
                <span
                    aria-hidden="true"
                    data-gantt-progress={Math.round(progress)}
                    style={{ position: 'absolute', insetBlockEnd: 0, insetInlineStart: 0, height: GANTT_PROGRESS_HEIGHT, width: `${ganttVisibleProgress(bar, visible, progress)}%`, background: tone }}
                />
            )}
            <span style={{ position: 'relative', paddingInline: GAP_XS, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {task.title}
            </span>
        </SarakButton>
    );
}

/**
 * Faixas de fim de semana (só na escala de dia) e o marcador de hoje, se hoje cair no intervalo. Vêm antes das
 * linhas no DOM, então as barras ficam por cima.
 */
function GanttBackdrop({ ticks, range, scale }: { ticks: GanttTick[]; range: GanttRange; scale: SarakGanttScale }) {
    const today = startOfDay(new Date());
    const showToday = !isBefore(today, range.start) && !isAfter(today, range.end);
    const weekends = scale === 'day' ? ticks.filter((tick) => tick.date.getDay() === 0 || tick.date.getDay() === 6) : [];
    const band: React.CSSProperties = { position: 'absolute', top: 0, bottom: 0 };

    return (
        <>
            {weekends.map((tick) => (
                <span
                    key={tick.x}
                    aria-hidden="true"
                    data-gantt-weekend="true"
                    style={{ ...band, left: tick.x, width: tick.width, background: `color-mix(in srgb, ${MUTED} 10%, transparent)` }}
                />
            ))}
            {showToday && (
                <span
                    aria-hidden="true"
                    data-gantt-today="true"
                    style={{
                        ...band,
                        left: ganttDateToPixel(today, range.start, scale) + GANTT_DAY_WIDTH[scale] / 2,
                        borderInlineStart: `${GANTT_TODAY_THICKNESS} solid ${ganttToneColor('danger')}`,
                    }}
                />
            )}
        </>
    );
}

export function GanttTimeline({ rows, edges, range, scale, formats, onTaskClick }: GanttTimelineProps) {
    const text = useLibraryText();
    const width = ganttRangeWidth(range, scale);
    const ticks = buildGanttTicks(range, scale);

    return (
        <div
            role="group"
            aria-label={text('ganttTimelineLabel', { start: formats.full.format(range.start), end: formats.full.format(range.end) })}
            data-gantt-timeline="true"
            style={{ position: 'relative', flexShrink: 0, width }}
        >
            <GanttHeader ticks={ticks} scale={scale} formats={formats} width={width} />
            <div data-gantt-body="true" style={{ position: 'relative', height: `calc(${GANTT_ROW_SIZE} * ${rows.length})` }}>
                <GanttBackdrop ticks={ticks} range={range} scale={scale} />
                {/* Antes das linhas: a barra cobre a seta que passa por ela, e o título continua legível. */}
                <GanttDependencies edges={edges} range={range} scale={scale} rowCount={rows.length} />
                {rows.map((row) => (
                    <div key={row.task.id} data-gantt-row={row.task.id} style={{ position: 'relative', height: GANTT_ROW_SIZE, borderBottom: HAIRLINE, boxSizing: 'border-box' }}>
                        <GanttBar row={row} range={range} scale={scale} formats={formats} onTaskClick={onTaskClick} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default GanttTimeline;
