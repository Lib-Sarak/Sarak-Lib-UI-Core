import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OptionTile } from '../OptionTile';
import { PEEK_DELAY_MS, SCROLL_QUIET_MS } from '../peek';

// Arquivo à parte: a janela de rolagem é estado de módulo, e um evento de rolagem daqui não pode valer para os outros testes de espiada.
const renderTile = () => {
    const onPeek = vi.fn();
    render(
        <OptionTile name="Opção" description="Descrição" onApply={() => undefined} peekTokens={() => ({ primaryColor: '#ff0000' })} onPeek={onPeek}>
            <span>amostra</span>
        </OptionTile>,
    );
    return { onPeek, option: screen.getByRole('button', { name: 'Opção' }) };
};

describe('espiada e rolagem da lista', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }) as unknown as typeof window.matchMedia;
    });
    afterEach(() => { vi.useRealTimers(); });

    it('a opção que chega sob o ponteiro parado por causa da rolagem não espia; o mouse que se mexe depois, sim', () => {
        const { onPeek, option } = renderTile();
        const tile = option.parentElement!;
        fireEvent.scroll(document.body);
        fireEvent.mouseEnter(tile);
        fireEvent.mouseMove(tile, { clientX: 5, clientY: 5 });
        act(() => { vi.advanceTimersByTime(PEEK_DELAY_MS * 2); });
        expect(onPeek).not.toHaveBeenCalled();

        act(() => { vi.advanceTimersByTime(SCROLL_QUIET_MS); });
        // O mousemove sintético que o navegador dispara quando a rolagem acaba (mesma posição) não espia.
        fireEvent.mouseMove(tile, { clientX: 5, clientY: 5 });
        act(() => { vi.advanceTimersByTime(PEEK_DELAY_MS * 2); });
        expect(onPeek).not.toHaveBeenCalled();

        fireEvent.mouseMove(tile, { clientX: 9, clientY: 5 });
        act(() => { vi.advanceTimersByTime(PEEK_DELAY_MS); });
        expect(onPeek).toHaveBeenCalledTimes(1);
    });

    it('com a espiada em curso, o mouse que se mexe não a reinicia', () => {
        const { onPeek, option } = renderTile();
        const tile = option.parentElement!;
        fireEvent.mouseEnter(tile);
        act(() => { vi.advanceTimersByTime(PEEK_DELAY_MS); });
        fireEvent.mouseMove(tile);
        act(() => { vi.advanceTimersByTime(PEEK_DELAY_MS * 2); });
        expect(onPeek).toHaveBeenCalledTimes(1);
    });
});
