import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OptionTile } from '../OptionTile';
import { canPeekHere, PEEK_DELAY_MS, usePeekHandlers } from '../peek';

const stubTouch = (touchOnly: boolean) => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: touchOnly && query === '(hover: none)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia;
};

const renderTile = () => {
    const onPeek = vi.fn();
    const onApply = vi.fn();
    const tokens = { primaryColor: '#ff0000' };
    render(
        <OptionTile name="Opção" description="Descrição" onApply={onApply} peekTokens={() => tokens} onPeek={onPeek}>
            <span>amostra</span>
        </OptionTile>,
    );
    return { onPeek, onApply, tokens, option: screen.getByRole('button', { name: 'Opção' }) };
};

describe('espiada de uma opção', () => {
    beforeEach(() => { vi.useFakeTimers(); stubTouch(false); });
    afterEach(() => { vi.useRealTimers(); });

    it('o mouse sobre a opção compõe os tokens depois da espera, e sair devolve null', () => {
        const { onPeek, onApply, tokens, option } = renderTile();
        fireEvent.mouseEnter(option.parentElement!);
        expect(onPeek).not.toHaveBeenCalled();

        act(() => { vi.advanceTimersByTime(PEEK_DELAY_MS); });
        expect(onPeek).toHaveBeenCalledWith(tokens);

        fireEvent.mouseLeave(option.parentElement!);
        expect(onPeek).toHaveBeenLastCalledWith(null);
        expect(onApply).not.toHaveBeenCalled();
    });

    it('atravessar a opção sem esperar não compõe nada', () => {
        const { onPeek, option } = renderTile();
        fireEvent.mouseEnter(option.parentElement!);
        act(() => { vi.advanceTimersByTime(PEEK_DELAY_MS - 1); });
        fireEvent.mouseLeave(option.parentElement!);
        act(() => { vi.advanceTimersByTime(PEEK_DELAY_MS * 2); });
        expect(onPeek).not.toHaveBeenCalled();
    });

    it('funciona por teclado: o foco espia e sair do foco volta', () => {
        const { onPeek, onApply, tokens, option } = renderTile();
        fireEvent.focus(option);
        act(() => { vi.advanceTimersByTime(PEEK_DELAY_MS); });
        expect(onPeek).toHaveBeenCalledWith(tokens);

        fireEvent.blur(option);
        expect(onPeek).toHaveBeenLastCalledWith(null);
        expect(onApply).not.toHaveBeenCalled();
    });

    it('opção sem tokens ainda (tema que não chegou) não muda a prévia', () => {
        const onPeek = vi.fn();
        render(<OptionTile name="Pendente" onApply={() => {}} peekTokens={() => null} onPeek={onPeek}><span /></OptionTile>);
        fireEvent.mouseEnter(screen.getByRole('button', { name: 'Pendente' }).parentElement!);
        act(() => { vi.advanceTimersByTime(PEEK_DELAY_MS); });
        expect(onPeek).not.toHaveBeenCalled();
    });

    it('desmontar a opção enquanto espia devolve a prévia ao rascunho', () => {
        const onPeek = vi.fn();
        const { unmount } = render(<OptionTile name="Opção" onApply={() => {}} peekTokens={() => ({})} onPeek={onPeek}><span /></OptionTile>);
        fireEvent.mouseEnter(screen.getByRole('button', { name: 'Opção' }).parentElement!);
        act(() => { vi.advanceTimersByTime(PEEK_DELAY_MS); });
        unmount();
        expect(onPeek).toHaveBeenLastCalledWith(null);
    });

    it('em dispositivo de toque não há espiada: o toque já escolhe', () => {
        stubTouch(true);
        expect(canPeekHere()).toBe(false);
        const { onPeek, onApply, option } = renderTile();
        fireEvent.mouseEnter(option.parentElement!);
        fireEvent.focus(option);
        act(() => { vi.advanceTimersByTime(PEEK_DELAY_MS * 2); });
        expect(onPeek).not.toHaveBeenCalled();

        fireEvent.click(option);
        expect(onApply).toHaveBeenCalledTimes(1);
    });

    describe('tema que ainda vai chegar (promessa)', () => {
        const renderAsync = (promise: Promise<Record<string, unknown> | null>) => {
            const onPeek = vi.fn();
            render(<OptionTile name="Assíncrona" onApply={() => {}} peekTokens={() => promise} onPeek={onPeek}><span /></OptionTile>);
            return { onPeek, tile: screen.getByRole('button', { name: 'Assíncrona' }).parentElement! };
        };

        it('compõe os tokens quando chegam e o mouse ainda está na opção', async () => {
            const { onPeek, tile } = renderAsync(Promise.resolve({ primaryColor: '#00ff00' }));
            fireEvent.mouseEnter(tile);
            await act(async () => { vi.advanceTimersByTime(PEEK_DELAY_MS); });
            expect(onPeek).toHaveBeenCalledWith({ primaryColor: '#00ff00' });
        });

        it('sair antes de chegar não aplica nada', async () => {
            let arrive: (tokens: Record<string, unknown>) => void = () => {};
            const { onPeek, tile } = renderAsync(new Promise((resolve) => { arrive = resolve; }));
            fireEvent.mouseEnter(tile);
            await act(async () => { vi.advanceTimersByTime(PEEK_DELAY_MS); });
            fireEvent.mouseLeave(tile);
            await act(async () => { arrive({ primaryColor: '#00ff00' }); });
            expect(onPeek).not.toHaveBeenCalled();
        });

        it('promessa que falha deixa a prévia como está', async () => {
            const { onPeek, tile } = renderAsync(Promise.reject(new Error('sem rede')));
            fireEvent.mouseEnter(tile);
            await act(async () => { vi.advanceTimersByTime(PEEK_DELAY_MS); });
            expect(onPeek).not.toHaveBeenCalled();
        });
    });

    describe('elemento que nasce sob o ponteiro', () => {
        const Born: React.FC<{ onPeek: () => void }> = ({ onPeek }) => {
            const root = React.useRef<HTMLButtonElement>(null);
            const handlers = usePeekHandlers(onPeek, () => ({ primaryColor: '#abcdef' }), root);
            return <button ref={root} {...handlers}>nasceu</button>;
        };

        it('espia sem novo movimento do mouse quando já está sob o ponteiro', () => {
            const matches = vi.spyOn(HTMLElement.prototype, 'matches').mockImplementation((selector: string) => selector === ':hover');
            const onPeek = vi.fn();
            render(<Born onPeek={onPeek} />);
            act(() => { vi.advanceTimersByTime(PEEK_DELAY_MS); });
            expect(onPeek).toHaveBeenCalledWith({ primaryColor: '#abcdef' });
            matches.mockRestore();
        });

        it('fora do ponteiro não espia', () => {
            const onPeek = vi.fn();
            render(<Born onPeek={onPeek} />);
            act(() => { vi.advanceTimersByTime(PEEK_DELAY_MS * 2); });
            expect(onPeek).not.toHaveBeenCalled();
        });
    });
});
