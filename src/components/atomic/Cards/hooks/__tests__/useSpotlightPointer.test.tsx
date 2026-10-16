import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { useSpotlightPointer } from '../useSpotlightPointer';
import type { SarakThemePayload } from '../../../../../core/Provider/types';

const Card: React.FC<{ design?: SarakThemePayload }> = ({ design }) => {
    const spotlight = useSpotlightPointer(design);
    return <div ref={spotlight.ref} data-testid="card" data-spotlight={spotlight.dataSpotlight} />;
};

/** Os `pointermove` registrados no próprio cartão — o React também ouve na raiz, e isso não conta. */
const cardListeners = (spy: { mock: { calls: unknown[][]; contexts: unknown[] } }): number =>
    spy.mock.calls.filter(([type], index) => type === 'pointermove' && (spy.mock.contexts[index] as HTMLElement).dataset?.testid === 'card').length;

const setPointer = (fine: boolean): void => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: fine,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia;
};

const moveTo = (card: HTMLElement, x: number, y: number, pointerType = 'mouse'): void => {
    const event = new MouseEvent('pointermove', { clientX: x, clientY: y, bubbles: true });
    Object.defineProperty(event, 'pointerType', { value: pointerType });
    act(() => { card.dispatchEvent(event); });
};

describe('useSpotlightPointer', () => {
    let frames: FrameRequestCallback[];

    beforeEach(() => {
        frames = [];
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => frames.push(callback));
        vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);
        setPointer(true);
    });
    afterEach(() => vi.restoreAllMocks());

    const flush = (): void => { act(() => { frames.splice(0).forEach((callback) => callback(0)); }); };

    it('token 0: data-spotlight 0 e nenhum listener é registrado', () => {
        const add = vi.spyOn(HTMLElement.prototype, 'addEventListener');
        render(<Card design={{ cardSpotlightOpacity: 0 }} />);
        expect(document.querySelector('[data-spotlight]')?.getAttribute('data-spotlight')).toBe('0');
        expect(cardListeners(add)).toBe(0);
    });

    it('token acima de zero com ponteiro fino: registra o listener e grava o ponto relativo ao cartão', () => {
        const { getByTestId } = render(<Card design={{ cardSpotlightOpacity: 0.1 }} />);
        const card = getByTestId('card');
        card.getBoundingClientRect = () => ({ left: 100, top: 50, right: 300, bottom: 150, width: 200, height: 100, x: 100, y: 50, toJSON: () => ({}) });
        expect(card.getAttribute('data-spotlight')).toBe('1');
        moveTo(card, 130, 80);
        expect(card.style.getPropertyValue('--sarak-spot-x')).toBe('');
        flush();
        expect(card.style.getPropertyValue('--sarak-spot-x')).toBe('30px');
        expect(card.style.getPropertyValue('--sarak-spot-y')).toBe('30px');
    });

    it('vários movimentos no mesmo quadro agendam uma só pintura', () => {
        const { getByTestId } = render(<Card design={{ cardSpotlightOpacity: 0.1 }} />);
        const card = getByTestId('card');
        moveTo(card, 10, 10);
        moveTo(card, 20, 20);
        moveTo(card, 30, 30);
        expect(frames).toHaveLength(1);
    });

    it('ao sair o ponteiro, as variáveis somem e o gradiente volta ao centro', () => {
        const { getByTestId } = render(<Card design={{ cardSpotlightOpacity: 0.1 }} />);
        const card = getByTestId('card');
        moveTo(card, 30, 30);
        flush();
        expect(card.style.getPropertyValue('--sarak-spot-x')).not.toBe('');
        fireEvent(card, new Event('pointerleave'));
        expect(card.style.getPropertyValue('--sarak-spot-x')).toBe('');
        expect(card.style.getPropertyValue('--sarak-spot-y')).toBe('');
    });

    it('toque não move o ponto', () => {
        const { getByTestId } = render(<Card design={{ cardSpotlightOpacity: 0.1 }} />);
        const card = getByTestId('card');
        moveTo(card, 30, 30, 'touch');
        expect(frames).toHaveLength(0);
    });

    it('sem ponteiro fino (toque): nenhum listener', () => {
        setPointer(false);
        const { getByTestId } = render(<Card design={{ cardSpotlightOpacity: 0.1 }} />);
        moveTo(getByTestId('card'), 30, 30);
        expect(frames).toHaveLength(0);
    });

    it('movimento reduzido: nenhum listener, mesmo com o token acima de zero', () => {
        const { getByTestId } = render(<Card design={{ cardSpotlightOpacity: 0.5, reducedMotion: true }} />);
        moveTo(getByTestId('card'), 30, 30);
        expect(frames).toHaveLength(0);
    });

    it('ao desmontar, remove o listener', () => {
        const add = vi.spyOn(HTMLElement.prototype, 'addEventListener');
        const remove = vi.spyOn(HTMLElement.prototype, 'removeEventListener');
        const { unmount } = render(<Card design={{ cardSpotlightOpacity: 0.1 }} />);
        expect(cardListeners(add)).toBe(1);
        unmount();
        expect(cardListeners(remove)).toBe(1);
    });
});
