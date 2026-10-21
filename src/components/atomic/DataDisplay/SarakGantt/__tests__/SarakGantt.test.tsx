import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SarakGantt } from '../SarakGantt';
import type { SarakGanttTask } from '../ganttTasks';

const TASKS: SarakGanttTask[] = [
    { id: 'a', title: 'Levantamento', start: '2026-10-02', end: '2026-10-04', group: 'Descoberta' },
    { id: 'b', title: 'Protótipo', start: '2026-10-06', end: '2026-10-08', dependsOn: ['a'] },
];
const full = (date: Date) => new Intl.DateTimeFormat('pt', { dateStyle: 'medium' }).format(date);

beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 9, 10));
});
afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
});

describe('SarakGantt', () => {
    it('renderiza sem Provider uma região rolável nomeada, com a lista de tarefas e as datas para leitor de tela', () => {
        render(<SarakGantt tasks={TASKS} />);
        const region = screen.getByRole('region', { name: 'Cronograma' });
        expect(region).toHaveAttribute('tabindex', '0');
        const list = screen.getByRole('list', { name: 'Tarefas' });
        const items = within(list).getAllByRole('listitem');
        expect(items).toHaveLength(2);
        expect(items[0]).toHaveTextContent('Levantamento');
        expect(items[0]).toHaveTextContent('Descoberta');
        expect(items[0]).toHaveTextContent(`de ${full(new Date(2026, 9, 2))} a ${full(new Date(2026, 9, 4))}`);
    });

    it('o rótulo passado vence o traduzido', () => {
        render(<SarakGantt tasks={TASKS} label="Projeto X" />);
        expect(screen.getByRole('region', { name: 'Projeto X' })).toBeInTheDocument();
    });

    it('duas tarefas com dependsOn desenham uma seta', () => {
        render(<SarakGantt tasks={TASKS} />);
        expect(document.querySelectorAll('[data-gantt-arrow]')).toHaveLength(1);
    });

    it('dependência para id inexistente não lança e avisa uma vez em desenvolvimento', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const tasks = [...TASKS, { id: 'c', title: 'Teste', start: '2026-10-09', end: '2026-10-10', dependsOn: ['nao-existe-1'] }];
        const { rerender } = render(<SarakGantt tasks={tasks} />);
        rerender(<SarakGantt tasks={[...tasks]} />);
        expect(document.querySelectorAll('[data-gantt-bar]')).toHaveLength(3);
        // Só os avisos do Gantt: sem Provider, os átomos também avisam que usam o próprio default.
        const ganttWarnings = warn.mock.calls.map((call) => String(call[0])).filter((message) => message.includes('SarakGantt'));
        expect(ganttWarnings).toHaveLength(1);
        expect(ganttWarnings[0]).toContain('c → nao-existe-1');
    });

    it('um ciclo não trava a renderização', () => {
        const cycle: SarakGanttTask[] = [
            { id: 'x', title: 'X', start: '2026-10-02', end: '2026-10-03', dependsOn: ['y'] },
            { id: 'y', title: 'Y', start: '2026-10-05', end: '2026-10-06', dependsOn: ['x'] },
        ];
        render(<SarakGantt tasks={cycle} scale="day" />);
        expect(document.querySelectorAll('[data-gantt-arrow]')).toHaveLength(2);
    });

    it('Enter na barra chama onTaskClick', async () => {
        const onTaskClick = vi.fn();
        const user = userEvent.setup();
        render(<SarakGantt tasks={TASKS} onTaskClick={onTaskClick} />);
        document.querySelector<HTMLElement>('[data-gantt-bar="b"]')!.focus();
        await user.keyboard('{Enter}');
        expect(onTaskClick).toHaveBeenCalledTimes(1);
        expect(onTaskClick).toHaveBeenCalledWith(TASKS[1]);
    });

    it('a escala muda a largura do dia; rangeStart/rangeEnd fixam o intervalo', () => {
        render(<SarakGantt tasks={TASKS} scale="day" rangeStart="2026-10-01" rangeEnd="2026-10-31" />);
        expect(document.querySelector<HTMLElement>('[data-gantt-timeline]')!.style.width).toBe(`${31 * 32}px`);
        expect(document.querySelector<HTMLElement>('[data-gantt-bar="a"]')!.style.left).toBe('32px');
    });

    it('marcador de hoje presente; sem tarefas, estado vazio traduzido', () => {
        const { unmount } = render(<SarakGantt tasks={TASKS} />);
        expect(document.querySelector('[data-gantt-today]')).not.toBeNull();
        unmount();
        render(<SarakGantt tasks={[]} />);
        expect(screen.getByText('Nenhuma tarefa')).toBeInTheDocument();
        expect(screen.queryByRole('region')).toBeNull();
    });

    it('a raiz acompanha a altura do host e a área que rola a ocupa (min 100%), com o teto só para host sem altura', () => {
        const { container } = render(<SarakGantt tasks={TASKS} />);
        const root = container.firstElementChild as HTMLElement;
        const region = screen.getByRole('region');
        expect(root.style.height).toBe('100%');
        expect(root.style.flexDirection).toBe('column');
        expect(region.style.minHeight).toBe('100%');
        expect(region.getAttribute('style')).toContain('max-height: calc(var(--sarak-layout-gap-md');
    });

    it('com rangeStart/rangeEnd, nada sai do intervalo: barra fora some, barra na borda é recortada, seta com ponta fora some', () => {
        const tasks: SarakGanttTask[] = [
            { id: 'antes', title: 'Antes', start: '2026-10-01', end: '2026-10-05' },
            { id: 'cruza-inicio', title: 'Cruza o início', start: '2026-10-08', end: '2026-10-12', progress: 80 },
            { id: 'dentro', title: 'Dentro', start: '2026-10-14', end: '2026-10-15', dependsOn: ['antes'] },
            { id: 'cruza-fim', title: 'Cruza o fim', start: '2026-10-18', end: '2026-10-23', dependsOn: ['cruza-inicio'] },
            { id: 'depois', title: 'Depois', start: '2026-10-25', end: '2026-10-28', dependsOn: ['dentro'] },
        ];
        render(<SarakGantt tasks={tasks} scale="day" rangeStart="2026-10-10" rangeEnd="2026-10-20" />);
        const timelineWidth = 11 * 32;
        const bar = (id: string) => document.querySelector<HTMLElement>(`[data-gantt-bar="${id}"]`);

        expect(within(screen.getByRole('list', { name: 'Tarefas' })).getAllByRole('listitem')).toHaveLength(5);
        expect(document.querySelectorAll('[data-gantt-row]')).toHaveLength(5);
        expect(bar('antes')).toBeNull();
        expect(bar('depois')).toBeNull();
        expect(bar('cruza-inicio')).toHaveStyle({ left: '0px', width: `${3 * 32}px` });
        expect(bar('cruza-fim')).toHaveStyle({ left: `${8 * 32}px`, width: `${3 * 32}px` });
        for (const visible of document.querySelectorAll<HTMLElement>('[data-gantt-bar]')) {
            expect(parseFloat(visible.style.left)).toBeGreaterThanOrEqual(0);
            expect(parseFloat(visible.style.left) + parseFloat(visible.style.width)).toBeLessThanOrEqual(timelineWidth);
        }
        const arrows = [...document.querySelectorAll('[data-gantt-arrow]')].map((arrow) => arrow.getAttribute('data-gantt-arrow'));
        expect(arrows).toEqual(['cruza-inicio->cruza-fim']);
    });

    it('planta @container na raiz, ancestral das classes da lista', () => {
        const { container } = render(<SarakGantt tasks={TASKS} className="extra" />);
        const root = container.firstElementChild as HTMLElement;
        expect(root.className).toContain('@container');
        expect(root.className).toContain('extra');
        expect(root.contains(document.querySelector('[data-gantt-list]'))).toBe(true);
    });
});

describe('SarakGantt — alvo de toque', () => {
    it('a barra e a linha leem o alvo mínimo de toque ativo, que vale 0 com ponteiro fino', () => {
        render(<SarakGantt tasks={TASKS} />);
        const bar = document.querySelector<HTMLElement>('[data-gantt-bar="a"]')!;
        expect(bar.style.height).toBe('max(60%, var(--sarak-touch-target-active, 0px))');
        expect(bar.style.minWidth).toBe('var(--sarak-touch-target-active, 0px)');
        const row = document.querySelector<HTMLElement>('[data-gantt-row="a"]')!;
        expect(row.style.height).toContain('var(--sarak-touch-target-active, 0px)');
        const listRow = document.querySelector<HTMLElement>('[data-gantt-list-row="a"]')!;
        expect(listRow.style.height).toBe(row.style.height);
    });
});
