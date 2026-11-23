import React from 'react';
import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useValueWhileVisible } from '../useValueWhileVisible';

const Probe: React.FC<{ value: string }> = ({ value }) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const shown = useValueWhileVisible(ref, value);
    return <div ref={ref} data-testid="shown">{shown}</div>;
};

describe('useValueWhileVisible', () => {
    let callback: IntersectionObserverCallback | undefined;
    const disconnect = vi.fn();

    const withObserver = (): void => {
        class FakeObserver {
            constructor(cb: IntersectionObserverCallback) { callback = cb; }
            observe() { /* o alvo não importa ao fake */ }
            disconnect = disconnect;
        }
        vi.stubGlobal('IntersectionObserver', FakeObserver);
    };

    const intersect = (isIntersecting: boolean): void => {
        act(() => { callback?.([{ isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver); });
    };

    beforeEach(() => {
        callback = undefined;
        disconnect.mockClear();
    });
    afterEach(() => vi.unstubAllGlobals());

    it('na área visível acompanha o valor', () => {
        withObserver();
        const view = render(<Probe value="a" />);
        intersect(true);
        view.rerender(<Probe value="b" />);
        expect(screen.getByTestId('shown')).toHaveTextContent('b');
    });

    it('fora da área visível guarda o último valor mostrado, e ao voltar recebe o atual', () => {
        withObserver();
        const view = render(<Probe value="a" />);
        intersect(false);
        view.rerender(<Probe value="b" />);
        view.rerender(<Probe value="c" />);
        expect(screen.getByTestId('shown')).toHaveTextContent('a');

        intersect(true);
        expect(screen.getByTestId('shown')).toHaveTextContent('c');
    });

    it('para de observar ao desmontar', () => {
        withObserver();
        const view = render(<Probe value="a" />);
        view.unmount();
        expect(disconnect).toHaveBeenCalled();
    });

    it('sem IntersectionObserver, devolve sempre o valor atual', () => {
        vi.stubGlobal('IntersectionObserver', undefined);
        const view = render(<Probe value="a" />);
        view.rerender(<Probe value="b" />);
        expect(screen.getByTestId('shown')).toHaveTextContent('b');
    });
});
