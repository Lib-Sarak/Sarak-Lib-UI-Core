import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { SarakCarousel } from '../SarakCarousel';

const SLIDES = [
    { id: 'a', content: <p>um</p> },
    { id: 'b', content: <p>dois</p> },
    { id: 'c', content: <p>três</p> },
];

const current = (): string | null | undefined =>
    document.querySelector('[data-sarak-carousel-slide="current"]')?.textContent;

function mockReducedMotion(reduced: boolean): void {
    vi.stubGlobal('matchMedia', (query: string) => ({ matches: reduced && query.includes('reduce'), media: query, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
}

beforeEach(() => mockReducedMotion(false));
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('SarakCarousel', () => {
    it('abre no primeiro slide, sem rotação automática por padrão', () => {
        vi.useFakeTimers();
        render(<SarakCarousel slides={SLIDES} />);
        expect(current()).toBe('um');
        act(() => { vi.advanceTimersByTime(60000); });
        expect(current()).toBe('um');
        expect(screen.queryByRole('button', { name: 'Pausar rotação' })).toBeNull();
    });

    it('setas e pontos trocam o slide; nas pontas as setas ficam desligadas sem loop', () => {
        const onIndexChange = vi.fn();
        render(<SarakCarousel slides={SLIDES} onIndexChange={onIndexChange} />);
        expect((screen.getByRole('button', { name: 'Slide anterior' }) as HTMLButtonElement).disabled).toBe(true);
        fireEvent.click(screen.getByRole('button', { name: 'Próximo slide' }));
        expect(current()).toBe('dois');
        fireEvent.click(screen.getByRole('button', { name: 'Ir ao slide 3' }));
        expect(current()).toBe('três');
        expect(onIndexChange).toHaveBeenLastCalledWith(2);
        expect((screen.getByRole('button', { name: 'Próximo slide' }) as HTMLButtonElement).disabled).toBe(true);
    });

    it('com loop o último volta ao primeiro', () => {
        render(<SarakCarousel slides={SLIDES} loop defaultIndex={2} />);
        fireEvent.click(screen.getByRole('button', { name: 'Próximo slide' }));
        expect(current()).toBe('um');
    });

    it('teclado: setas, Home e End', () => {
        render(<SarakCarousel slides={SLIDES} />);
        const region = document.querySelector('[tabindex="0"]') as HTMLElement;
        fireEvent.keyDown(region, { key: 'ArrowRight' });
        expect(current()).toBe('dois');
        fireEvent.keyDown(region, { key: 'End' });
        expect(current()).toBe('três');
        fireEvent.keyDown(region, { key: 'Home' });
        expect(current()).toBe('um');
    });

    it('gesto: arrastar para a esquerda avança, para a direita volta, e curto demais não faz nada', () => {
        render(<SarakCarousel slides={SLIDES} defaultIndex={1} />);
        const region = document.querySelector('[tabindex="0"]') as HTMLElement;
        fireEvent.pointerDown(region, { clientX: 200 });
        fireEvent.pointerUp(region, { clientX: 100 });
        expect(current()).toBe('três');
        fireEvent.pointerDown(region, { clientX: 100 });
        fireEvent.pointerUp(region, { clientX: 110 });
        expect(current()).toBe('três');
        fireEvent.pointerDown(region, { clientX: 100 });
        fireEvent.pointerUp(region, { clientX: 200 });
        expect(current()).toBe('dois');
    });

    it('só o slide atual fica na árvore de acessibilidade', () => {
        render(<SarakCarousel slides={SLIDES} />);
        const hidden = document.querySelectorAll('[aria-roledescription="slide"][aria-hidden="true"]');
        expect(hidden).toHaveLength(2);
    });

    it('slide fora de vista é inert: link e botão dentro dele saem do Tab', () => {
        render(<SarakCarousel slides={[{ id: 'a', content: <a href="#um">um</a> }, { id: 'b', content: <button>dois</button> }]} />);
        const slides = document.querySelectorAll('[aria-roledescription="slide"]');
        expect(slides[0].hasAttribute('inert')).toBe(false);
        expect(slides[1].hasAttribute('inert')).toBe(true);
        fireEvent.click(screen.getByRole('button', { name: 'Próximo slide' }));
        expect(slides[0].hasAttribute('inert')).toBe(true);
        expect(slides[1].hasAttribute('inert')).toBe(false);
    });

    it('modo controlado segue a prop index', () => {
        const { rerender } = render(<SarakCarousel slides={SLIDES} index={1} />);
        expect(current()).toBe('dois');
        fireEvent.click(screen.getByRole('button', { name: 'Próximo slide' }));
        expect(current()).toBe('dois');
        rerender(<SarakCarousel slides={SLIDES} index={2} />);
        expect(current()).toBe('três');
    });

    it('autoPlay gira no intervalo, pausa sob o mouse e pelo botão', () => {
        vi.useFakeTimers();
        render(<SarakCarousel slides={SLIDES} autoPlay intervalMs={1000} />);
        act(() => { vi.advanceTimersByTime(1000); });
        expect(current()).toBe('dois');
        const region = screen.getByRole('region', { name: 'Carrossel' });
        fireEvent.mouseEnter(region);
        act(() => { vi.advanceTimersByTime(5000); });
        expect(current()).toBe('dois');
        fireEvent.mouseLeave(region);
        fireEvent.click(screen.getByRole('button', { name: 'Pausar rotação' }));
        act(() => { vi.advanceTimersByTime(5000); });
        expect(current()).toBe('dois');
        expect(screen.getByRole('button', { name: 'Retomar rotação' })).toBeTruthy();
    });

    it('movimento reduzido: autoPlay não gira, sem botão de pausa e sem animação', () => {
        mockReducedMotion(true);
        vi.useFakeTimers();
        const { container } = render(<SarakCarousel slides={SLIDES} autoPlay intervalMs={1000} />);
        act(() => { vi.advanceTimersByTime(5000); });
        expect(current()).toBe('um');
        expect(screen.queryByRole('button', { name: 'Pausar rotação' })).toBeNull();
        const track = container.querySelector('[role="group"][aria-roledescription="slide"]')!.parentElement!;
        expect(track.style.transition).toBe('none');
    });
});
