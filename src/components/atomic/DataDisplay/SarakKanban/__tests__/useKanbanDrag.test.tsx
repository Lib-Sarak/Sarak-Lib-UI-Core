import React from 'react';
import { act, createEvent, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DndContextProps } from '@dnd-kit/core';
import SarakKanbanImpl from '../SarakKanbanImpl';
import type { SarakCardMove, SarakKanbanColumn } from '../kanbanTypes';

// Captura as props do DndContext REAL a cada render: os testes de índice chamam os
// manipuladores com eventos sintéticos (jsdom não mede layout), os de teclado e toque
// usam os sensores de verdade.
const captured: { props: DndContextProps | null } = { props: null };

vi.mock('@dnd-kit/core', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@dnd-kit/core')>();
    const Capturing = (props: DndContextProps) => {
        captured.props = props;
        return React.createElement(actual.DndContext, props);
    };
    return { ...actual, DndContext: Capturing };
});

const columns = (): SarakKanbanColumn[] => [
    { id: 'todo', title: 'A fazer', cards: [{ id: 'a', title: 'Tarefa A' }, { id: 'b', title: 'Tarefa B' }, { id: 'c', title: 'Tarefa C' }] },
    { id: 'doing', title: 'Em andamento', cards: [{ id: 'x', title: 'Tarefa X' }, { id: 'y', title: 'Tarefa Y' }, { id: 'z', title: 'Tarefa Z' }] },
    { id: 'empty', title: 'Vazia', cards: [] },
];

const idsIn = (columnId: string) =>
    Array.from(document.querySelectorAll(`[data-column-id="${columnId}"] [data-card-id]`)).map((el) => el.getAttribute('data-card-id'));

const overEvent = (activeId: string, overId: string, translatedTop: number, overTop = 100, overHeight = 40) =>
    ({
        active: { id: activeId, rect: { current: { translated: { top: translatedTop } } } },
        over: { id: overId, rect: { top: overTop, height: overHeight } },
    }) as never;

const drive = (fn: () => void) => act(() => { fn(); });

describe('useKanbanDrag — destino é o índice onde se soltou', () => {
    let onCardMove: ReturnType<typeof vi.fn<(move: SarakCardMove) => void>>;
    beforeEach(() => {
        onCardMove = vi.fn<(move: SarakCardMove) => void>();
        render(<SarakKanbanImpl columns={columns()} onCardMove={onCardMove} />);
    });

    it('soltar no meio de outra coluna põe o cartão NAQUELE índice e emite índices e vizinhos', () => {
        drive(() => captured.props!.onDragStart!({ active: { id: 'a' } } as never));
        drive(() => captured.props!.onDragOver!(overEvent('a', 'y', 0)));
        expect(idsIn('doing')).toEqual(['x', 'a', 'y', 'z']);
        drive(() => captured.props!.onDragEnd!({ active: { id: 'a' }, over: { id: 'a' } } as never));

        expect(onCardMove).toHaveBeenCalledTimes(1);
        expect(onCardMove).toHaveBeenCalledWith({
            cardId: 'a', fromColumn: 'todo', toColumn: 'doing', fromIndex: 0, toIndex: 1, beforeCardId: 'x', afterCardId: 'y',
        });
        expect(idsIn('todo')).toEqual(['b', 'c']);
    });

    it('na metade de baixo do cartão-alvo, entra depois dele', () => {
        drive(() => captured.props!.onDragStart!({ active: { id: 'a' } } as never));
        drive(() => captured.props!.onDragOver!(overEvent('a', 'y', 130)));
        drive(() => captured.props!.onDragEnd!({ active: { id: 'a' }, over: { id: 'a' } } as never));
        expect(onCardMove).toHaveBeenCalledWith(expect.objectContaining({ toIndex: 2, beforeCardId: 'y', afterCardId: 'z' }));
    });

    it('reordena DENTRO da coluna: o índice final e os vizinhos já sem o cartão', () => {
        drive(() => captured.props!.onDragStart!({ active: { id: 'a' } } as never));
        drive(() => captured.props!.onDragEnd!({ active: { id: 'a' }, over: { id: 'c' } } as never));
        expect(onCardMove).toHaveBeenCalledWith({
            cardId: 'a', fromColumn: 'todo', toColumn: 'todo', fromIndex: 0, toIndex: 2, beforeCardId: 'c', afterCardId: null,
        });
        expect(idsIn('todo')).toEqual(['b', 'c', 'a']);
    });

    it('soltar no mesmo lugar não chama onCardMove', () => {
        drive(() => captured.props!.onDragStart!({ active: { id: 'b' } } as never));
        drive(() => captured.props!.onDragEnd!({ active: { id: 'b' }, over: { id: 'b' } } as never));
        expect(onCardMove).not.toHaveBeenCalled();
    });

    it('soltar sobre uma coluna vazia leva o cartão a ela, com vizinhos null', () => {
        drive(() => captured.props!.onDragStart!({ active: { id: 'c' } } as never));
        drive(() => captured.props!.onDragOver!(overEvent('c', 'empty', 0)));
        drive(() => captured.props!.onDragEnd!({ active: { id: 'c' }, over: { id: 'empty' } } as never));
        expect(onCardMove).toHaveBeenCalledWith(expect.objectContaining({
            toColumn: 'empty', toIndex: 0, beforeCardId: null, afterCardId: null,
        }));
    });

    it('soltar fora de qualquer alvo, ou cancelar, devolve o quadro e não emite evento', () => {
        drive(() => captured.props!.onDragStart!({ active: { id: 'a' } } as never));
        drive(() => captured.props!.onDragOver!(overEvent('a', 'y', 0)));
        drive(() => captured.props!.onDragEnd!({ active: { id: 'a' }, over: null } as never));
        expect(idsIn('todo')).toEqual(['a', 'b', 'c']);

        drive(() => captured.props!.onDragStart!({ active: { id: 'a' } } as never));
        drive(() => captured.props!.onDragOver!(overEvent('a', 'y', 0)));
        drive(() => captured.props!.onDragCancel!({ active: { id: 'a' } } as never));
        expect(idsIn('todo')).toEqual(['a', 'b', 'c']);
        expect(onCardMove).not.toHaveBeenCalled();
    });
});

describe('useKanbanDrag — teclado e leitor de tela', () => {
    beforeEach(() => {
        // jsdom não implementa scrollIntoView, que o sensor de teclado chama ao levantar.
        Element.prototype.scrollIntoView = vi.fn();
        render(<SarakKanbanImpl columns={columns()} onCardClick={vi.fn()} />);
    });

    it('os anúncios saem do catálogo de i18n, com título, posição, total e coluna', () => {
        const { announcements } = captured.props!.accessibility!;
        const active = { id: 'b' } as never;
        expect(announcements!.onDragStart!({ active })).toBe('Cartão Tarefa B levantado, posição 2 de 3 em A fazer.');
        expect(announcements!.onDragOver!({ active, over: { id: 'z' } } as never)).toBe('Cartão Tarefa B na posição 3 de 3 em Em andamento.');
        expect(announcements!.onDragEnd!({ active, over: { id: 'a' } } as never)).toBe('Cartão Tarefa B solto na posição 1 de 3 em A fazer.');
        expect(announcements!.onDragCancel!({ active } as never)).toBe('Movimento cancelado. Cartão Tarefa B voltou à posição original.');
    });

    it('Espaço levanta o cartão no sensor real e Esc cancela com o anúncio de cancelamento', async () => {
        const card = document.querySelector('[data-card-id="b"]') as HTMLElement;
        card.focus();
        fireEvent.keyDown(card, { code: 'Space', key: ' ' });
        expect(screen.getByRole('status')).toHaveTextContent('Tarefa B');
        // O sensor de teclado só passa a ouvir o documento no tick seguinte à ativação.
        await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });

        fireEvent.keyDown(document, { code: 'Escape', key: 'Escape' });
        expect(screen.getByRole('status')).toHaveTextContent('Movimento cancelado. Cartão Tarefa B voltou à posição original.');
    });

    it('as instruções para leitor de tela vêm do catálogo', () => {
        expect(document.body).toHaveTextContent('Para pegar um cartão, pressione Espaço.');
    });

    it('Enter não levanta o cartão: fica livre para abrir', () => {
        const card = document.querySelector('[data-card-id="b"]') as HTMLElement;
        fireEvent.keyDown(card, { code: 'Enter', key: 'Enter' });
        expect(screen.getByRole('status')).toBeEmptyDOMElement();
    });
});

describe('useKanbanDrag — toque (ponteiro simulado)', () => {
    beforeEach(() => { vi.useFakeTimers(); });
    afterEach(() => { vi.useRealTimers(); });

    // jsdom descarta `touches` de objeto simples no construtor: define-se no próprio evento.
    const touchEvent = (type: 'touchStart' | 'touchMove', x: number) => {
        const event = createEvent[type](document.body);
        const points = [{ clientX: x, clientY: 0 }];
        Object.defineProperty(event, 'touches', { value: points });
        Object.defineProperty(event, 'changedTouches', { value: points });
        return event;
    };

    it('o arrasto só começa após a pressão longa', () => {
        render(<SarakKanbanImpl columns={columns()} />);
        const card = document.querySelector('[data-card-id="a"]') as HTMLElement;
        fireEvent(card, touchEvent('touchStart', 0));
        act(() => { vi.advanceTimersByTime(100); });
        expect(screen.getByRole('status')).toBeEmptyDOMElement();
        act(() => { vi.advanceTimersByTime(200); });
        expect(screen.getByRole('status')).toHaveTextContent('Tarefa A');
    });

    it('mover o dedo durante a espera não bloqueia a rolagem (touchmove sem preventDefault)', () => {
        render(<SarakKanbanImpl columns={columns()} />);
        const card = document.querySelector('[data-card-id="a"]') as HTMLElement;
        fireEvent(card, touchEvent('touchStart', 0));
        const move = touchEvent('touchMove', 40);
        fireEvent(document, move);
        expect(move.defaultPrevented).toBe(false);
    });

    it('o cartão não declara touch-action: none (a página continua rolando sobre ele)', () => {
        render(<SarakKanbanImpl columns={columns()} />);
        const card = document.querySelector('[data-card-id="a"]') as HTMLElement;
        expect(card.style.touchAction).toBe('');
    });
});
