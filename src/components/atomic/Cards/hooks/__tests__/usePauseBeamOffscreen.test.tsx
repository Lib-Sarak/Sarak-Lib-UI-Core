import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { usePauseBeamOffscreen } from '../usePauseBeamOffscreen';

const Card: React.FC<{ beamOn: boolean }> = ({ beamOn }) => {
    const ref = React.useRef<HTMLDivElement>(null);
    usePauseBeamOffscreen(ref, beamOn);
    return <div ref={ref} data-testid="card" />;
};

describe('usePauseBeamOffscreen', () => {
    let callback: IntersectionObserverCallback;
    const observe = vi.fn();
    const disconnect = vi.fn();

    beforeEach(() => {
        observe.mockClear();
        disconnect.mockClear();
        class FakeObserver {
            constructor(cb: IntersectionObserverCallback) { callback = cb; }
            observe = observe;
            disconnect = disconnect;
        }
        vi.stubGlobal('IntersectionObserver', FakeObserver);
    });
    afterEach(() => vi.unstubAllGlobals());

    const intersect = (isIntersecting: boolean): void => {
        act(() => { callback([{ isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver); });
    };

    it('traço apagado: não observa nada', () => {
        render(<Card beamOn={false} />);
        expect(observe).not.toHaveBeenCalled();
    });

    it('fora da tela marca a raiz como pausada; ao voltar, desmarca', () => {
        const { getByTestId } = render(<Card beamOn />);
        expect(observe).toHaveBeenCalledTimes(1);
        intersect(false);
        expect(getByTestId('card').getAttribute('data-border-beam-paused')).toBe('1');
        intersect(true);
        expect(getByTestId('card').hasAttribute('data-border-beam-paused')).toBe(false);
    });

    it('desmontar desconecta o observador', () => {
        const { unmount } = render(<Card beamOn />);
        unmount();
        expect(disconnect).toHaveBeenCalledTimes(1);
    });
});
