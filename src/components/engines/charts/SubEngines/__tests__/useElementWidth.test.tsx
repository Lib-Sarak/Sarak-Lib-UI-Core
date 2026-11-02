import React from 'react';
import { act, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useElementWidth } from '../useElementWidth';

const INITIAL_WIDTH = 320;
const RESIZED_WIDTH = 180;

let notify: ResizeObserverCallback = () => undefined;

class FakeResizeObserver {
    constructor(callback: ResizeObserverCallback) { notify = callback; }
    observe = vi.fn();
    disconnect = vi.fn();
    unobserve = vi.fn();
}

function Probe({ onWidth }: { onWidth: (width: number) => void }): React.ReactElement {
    const [ref, width] = useElementWidth();
    onWidth(width);
    return <div ref={ref} />;
}

afterEach(() => vi.unstubAllGlobals());

describe('useElementWidth', () => {
    it('sem ResizeObserver a largura segue desconhecida (0)', () => {
        vi.stubGlobal('ResizeObserver', undefined);
        const seen: number[] = [];
        render(<Probe onWidth={(width) => seen.push(width)} />);

        expect(seen.at(-1)).toBe(0);
    });

    it('lê a largura ao montar e acompanha o redimensionamento', () => {
        vi.stubGlobal('ResizeObserver', FakeResizeObserver);
        vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ width: INITIAL_WIDTH } as DOMRect);
        const seen: number[] = [];
        render(<Probe onWidth={(width) => seen.push(width)} />);
        expect(seen.at(-1)).toBe(INITIAL_WIDTH);

        act(() => notify([{ contentRect: { width: RESIZED_WIDTH } } as ResizeObserverEntry], {} as ResizeObserver));
        expect(seen.at(-1)).toBe(RESIZED_WIDTH);
    });
});
