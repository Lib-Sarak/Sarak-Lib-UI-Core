import React from 'react';
import { act, render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useOnFirstVisible } from '../useOnFirstVisible';

const Probe: React.FC<{ onVisible: () => void }> = ({ onVisible }) => {
    const ref = React.useRef<HTMLDivElement>(null);
    useOnFirstVisible(ref, onVisible);
    return <div ref={ref} />;
};

describe('useOnFirstVisible', () => {
    let callback: IntersectionObserverCallback;
    const disconnect = vi.fn();

    beforeEach(() => {
        disconnect.mockClear();
        class FakeObserver {
            constructor(cb: IntersectionObserverCallback) { callback = cb; }
            observe() { /* o alvo não importa ao fake */ }
            disconnect = disconnect;
        }
        vi.stubGlobal('IntersectionObserver', FakeObserver);
    });
    afterEach(() => vi.unstubAllGlobals());

    const intersect = (isIntersecting: boolean): void => {
        act(() => { callback([{ isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver); });
    };

    it('fora da área visível não chama nada', () => {
        const onVisible = vi.fn();
        render(<Probe onVisible={onVisible} />);
        intersect(false);
        expect(onVisible).not.toHaveBeenCalled();
    });

    it('ao entrar na área visível chama uma vez e para de observar', () => {
        const onVisible = vi.fn();
        render(<Probe onVisible={onVisible} />);
        intersect(true);
        expect(onVisible).toHaveBeenCalledTimes(1);
        expect(disconnect).toHaveBeenCalled();
    });

    it('sem IntersectionObserver chama na hora, em vez de perder a carga', () => {
        vi.stubGlobal('IntersectionObserver', undefined);
        const onVisible = vi.fn();
        render(<Probe onVisible={onVisible} />);
        expect(onVisible).toHaveBeenCalledTimes(1);
    });
});
