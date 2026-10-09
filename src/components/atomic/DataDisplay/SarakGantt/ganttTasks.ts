/**
 * Tarefas do SarakGantt, sem React: leitura das datas, progresso e dependências término → início.
 *
 * As dependências são só PARES (predecessora, sucessora); nada aqui percorre o grafo. Por isso um ciclo
 * (A depende de B, B depende de A) desenha duas setas e nunca trava a renderização.
 */
import { isBefore } from 'date-fns';
import { parseCalendarDay, type SarakCalendarDate } from '../SarakCalendar/calendarEvents';
import type { SarakGanttTone } from './ganttScale';

export interface SarakGanttTask {
    id: string;
    title: string;
    /** Primeiro dia da tarefa: `Date` ou `AAAA-MM-DD`, lido como dia local. Ilegível, a tarefa não aparece. */
    start: SarakCalendarDate;
    /** Último dia, inclusive. Ilegível ou antes do início, a tarefa ocupa só o dia do início. */
    end: SarakCalendarDate;
    /** Percentual concluído, de 0 a 100; fora da faixa é recortado. Omitido, a barra não mostra preenchimento. */
    progress?: number;
    /** Ids das tarefas que precisam terminar antes desta começar. Id inexistente é ignorado, com aviso em desenvolvimento. */
    dependsOn?: string[];
    /** Cor da barra, pelas cores do design. Omitido ou desconhecido, `primary`. */
    tone?: SarakGanttTone;
    /** Grupo (fase, épico), mostrado sob o título na lista. */
    group?: string;
}

export interface GanttRow {
    task: SarakGanttTask;
    start: Date;
    end: Date;
    /** Posição da linha, de cima para baixo. */
    index: number;
}

export interface GanttEdge {
    from: GanttRow;
    to: GanttRow;
}

/** Linhas na ordem de entrada, só com as tarefas de início legível. */
export const normalizeGanttTasks = (tasks: readonly SarakGanttTask[]): GanttRow[] => {
    const rows: GanttRow[] = [];
    for (const task of tasks) {
        const start = parseCalendarDay(task.start);
        if (!start) continue;
        const end = parseCalendarDay(task.end);
        rows.push({ task, start, end: end && !isBefore(end, start) ? end : start, index: rows.length });
    }
    return rows;
};

/**
 * Pares término → início. Dependência de si mesma e repetida são descartadas; id inexistente vira um item de
 * `missing` (`"tarefa → id"`), para o aviso em desenvolvimento.
 */
export const resolveGanttDependencies = (rows: readonly GanttRow[]): { edges: GanttEdge[]; missing: string[] } => {
    const byId = new Map(rows.map((row) => [row.task.id, row]));
    const edges: GanttEdge[] = [];
    const missing: string[] = [];
    for (const row of rows) {
        for (const dependencyId of new Set(row.task.dependsOn ?? [])) {
            const from = byId.get(dependencyId);
            if (!from) missing.push(`${row.task.id} → ${dependencyId}`);
            if (from && from !== row) edges.push({ from, to: row });
        }
    }
    return { edges, missing };
};

/** Progresso recortado em 0–100; ausente ou não numérico devolve `null`. */
export const ganttProgress = (progress: number | undefined): number | null => {
    if (typeof progress !== 'number' || Number.isNaN(progress)) return null;
    return Math.min(100, Math.max(0, progress));
};
