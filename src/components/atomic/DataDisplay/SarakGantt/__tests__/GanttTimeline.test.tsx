import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GANTT_TODAY_THICKNESS, GanttTimeline, type GanttTimelineProps } from '../GanttTimeline';
import { normalizeGanttTasks, resolveGanttDependencies, type SarakGanttTask } from '../ganttTasks';
import { buildGanttFormats } from '../useGanttFormats';
import { ganttToneColor } from '../ganttScale';

const RANGE = { start: new Date(2026, 9, 1), end: new Date(2026, 9, 14) };
const TASKS: SarakGanttTask[] = [
    { id: 'a', title: 'Levantamento', start: '2026-10-02', end: '2026-10-04', progress: 40, tone: 'success' },
    { id: 'b', title: 'Protótipo', start: '2026-10-06', end: '2026-10-08', dependsOn: ['a'] },
];
const full = (date: Date) => new Intl.DateTimeFormat('pt', { dateStyle: 'medium' }).format(date);
const bar = (id: string) => document.querySelector<HTMLElement>(`[data-gantt-bar="${id}"]`)!;

const renderTimeline = (overrides: Partial<GanttTimelineProps> = {}) => {
    const rows = normalizeGanttTasks(TASKS);
    return render(
        <GanttTimeline
            rows={rows}
            edges={resolveGanttDependencies(rows).edges}
            range={RANGE}
            scale="day"
            formats={buildGanttFormats('pt')}
            {...overrides}
        />,
    );
};

beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 9, 10));
});
afterEach(() => {
    vi.useRealTimers();
});

describe('GanttTimeline', () => {
    it('posiciona a barra pela escala: uma tarefa de 3 dias tem a largura de 3 dias', () => {
        renderTimeline();
        expect(bar('a').style.left).toBe('32px');
        expect(bar('a').style.width).toBe('96px');
        renderTimeline({ scale: 'week' });
        expect(document.querySelectorAll('[data-gantt-bar="a"]')[1]).toHaveStyle({ left: '12px', width: '36px' });
    });

    it('o progresso preenche a barra e entra no nome acessível', () => {
        renderTimeline();
        const fill = bar('a').querySelector<HTMLElement>('[data-gantt-progress]')!;
        expect(fill.style.width).toBe('40%');
        expect(bar('a')).toHaveAccessibleName(`Levantamento, de ${full(new Date(2026, 9, 2))} a ${full(new Date(2026, 9, 4))}, 40% concluído`);
        expect(bar('b').querySelector('[data-gantt-progress]')).toBeNull();
        expect(bar('b')).toHaveAccessibleName(`Protótipo, de ${full(new Date(2026, 9, 6))} a ${full(new Date(2026, 9, 8))}`);
    });

    it('barra recortada no início do intervalo: o progresso termina no mesmo dia da barra inteira', () => {
        renderTimeline({ range: { start: new Date(2026, 9, 3), end: new Date(2026, 9, 14) } });
        expect(bar('a')).toHaveStyle({ left: '0px', width: '64px' });
        expect(bar('a').querySelector<HTMLElement>('[data-gantt-progress]')!.style.width).toBe('10%');
    });

    it('o progresso é uma faixa na base da barra, fora do título, e a trilha é opaca (tom sobre o fundo do tema)', () => {
        renderTimeline();
        const fill = bar('a').querySelector<HTMLElement>('[data-gantt-progress]')!;
        const style = fill.getAttribute('style') ?? '';
        expect(style).toContain('inset-block-end: 0');
        expect(style).not.toContain('inset-block: 0');
        expect(style).toContain('height: calc(var(--sarak-layout-gap-sm');
        expect(fill.contains(screen.getByText('Levantamento'))).toBe(false);
        expect(bar('a').getAttribute('style')).toContain('--color-theme-body');
        expect(bar('a').getAttribute('style')).not.toContain('transparent)');
    });

    it('a cor sai do tom, pelas cores do design', () => {
        renderTimeline();
        const fill = bar('a').querySelector<HTMLElement>('[data-gantt-progress]')!;
        expect(fill.getAttribute('style')).toContain(ganttToneColor('success'));
        expect(bar('a').getAttribute('style')).not.toMatch(/#[0-9a-f]{3,8}/i);
    });

    it('a barra troca a tipografia de ação do botão pela de conteúdo', () => {
        renderTimeline();
        const classes = bar('a').className.split(/\s+/);
        expect(classes).toEqual(expect.arrayContaining(['normal-case', 'tracking-normal', 'font-normal']));
        expect(classes).not.toContain('uppercase');
        expect(classes).not.toContain('font-black');
    });

    it('clique e Enter na barra chamam onTaskClick com a tarefa', () => {
        const onTaskClick = vi.fn();
        renderTimeline({ onTaskClick });
        fireEvent.click(bar('a'));
        fireEvent.keyDown(bar('b'), { key: 'Enter' });
        expect(onTaskClick).toHaveBeenNthCalledWith(1, TASKS[0]);
        expect(onTaskClick).toHaveBeenNthCalledWith(2, TASKS[1]);
    });

    it('marcador de hoje presente na faixa visível, no meio do dia', () => {
        renderTimeline();
        const today = document.querySelector<HTMLElement>('[data-gantt-today]')!;
        expect(today.style.left).toBe(`${8 * 32 + 16}px`);
    });

    it('a espessura do marcador de hoje segue o token de borda, com piso: um tema que zera a borda não o apaga', () => {
        expect(GANTT_TODAY_THICKNESS).toBe('max(2px, calc(var(--sarak-border-width, 1px) * 2))');
        renderTimeline();
        const today = document.querySelector<HTMLElement>('[data-gantt-today]')!;
        expect(today.getAttribute('style')).toContain('max(2px, calc(var(--sarak-border-width, 1px) * 2))');
    });

    it('sem hoje no intervalo, sem marcador', () => {
        vi.setSystemTime(new Date(2026, 11, 1));
        renderTimeline();
        expect(document.querySelector('[data-gantt-today]')).toBeNull();
    });

    it('fim de semana esmaecido só na escala de dia', () => {
        renderTimeline();
        // 1–14/10/2026: sábados 3 e 10, domingos 4 e 11.
        expect(document.querySelectorAll('[data-gantt-weekend]')).toHaveLength(4);
        renderTimeline({ scale: 'week' });
        expect(document.querySelectorAll('[data-gantt-weekend]')).toHaveLength(4);
    });

    it('a linha do tempo tem role e rótulo com o intervalo; desenha as setas', () => {
        renderTimeline();
        expect(screen.getByRole('group', { name: `Linha do tempo de ${full(RANGE.start)} a ${full(RANGE.end)}` })).toBeInTheDocument();
        expect(document.querySelectorAll('[data-gantt-arrow]')).toHaveLength(1);
        expect(document.querySelectorAll('[data-gantt-header] > span')).toHaveLength(14);
    });

    it('as setas vêm antes das linhas no DOM: a barra cobre a seta que passa por ela', () => {
        renderTimeline();
        const arrows = document.querySelector('[data-gantt-dependencies]')!;
        const firstRow = document.querySelector('[data-gantt-row]')!;
        expect(arrows.compareDocumentPosition(firstRow) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('o cabeçalho de datas fixo tem fundo em camada sobre a cor de fundo do tema', () => {
        renderTimeline();
        const header = document.querySelector<HTMLElement>('[data-gantt-header]')!;
        expect(header.style.backgroundColor).toContain('--color-theme-body');
        expect(header.style.backgroundImage).toContain('--sarak-card-bg');
        expect(header.style.position).toBe('sticky');
    });
});
