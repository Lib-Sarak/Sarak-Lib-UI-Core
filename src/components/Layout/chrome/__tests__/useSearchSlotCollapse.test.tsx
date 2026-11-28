import { afterEach, describe, expect, it, vi } from 'vitest';
import { createElement, type ReactElement } from 'react';
import { act, render } from '@testing-library/react';
import { useSearchSlotCollapse } from '../useSearchSlotCollapse';

let fire: () => void = () => undefined;

class FakeResizeObserver {
    constructor(callback: () => void) {
        fire = callback;
    }
    observe(): void {}
    disconnect(): void {}
}

const Probe = ({ enabled = true, hasField = true, resetKey = 'a' }: { enabled?: boolean; hasField?: boolean; resetKey?: string }): ReactElement => {
    const { collapsed, barRef } = useSearchSlotCollapse(enabled, resetKey);
    return createElement(
        'header',
        { ref: barRef, 'data-testid': 'barra', 'data-collapsed': String(collapsed) },
        createElement('div', { 'data-sarak-slot': 'search' }, hasField ? createElement('input') : null),
    );
};

/** A barra e o slot medem como um navegador: o `jsdom` não calcula largura. */
const stubWidths = (bar: HTMLElement, barWidth: () => number, slotWidth: () => number): void => {
    bar.getBoundingClientRect = () => ({ width: barWidth() }) as DOMRect;
    const slot = bar.querySelector<HTMLElement>('[data-sarak-slot="search"]') as HTMLElement;
    slot.getBoundingClientRect = () => ({ width: slotWidth() }) as DOMRect;
};

const collapsed = (bar: HTMLElement): string | null => bar.getAttribute('data-collapsed');

describe('useSearchSlotCollapse', () => {
    afterEach(() => vi.unstubAllGlobals());

    it('sem layout (jsdom, largura 0), não recolhe', () => {
        vi.stubGlobal('ResizeObserver', FakeResizeObserver);
        const { getByTestId } = render(createElement(Probe));
        expect(collapsed(getByTestId('barra'))).toBe('false');
    });

    it('recolhe quando o slot fica abaixo do mínimo útil e não alterna enquanto o que molda o espaço é o mesmo', () => {
        vi.stubGlobal('ResizeObserver', FakeResizeObserver);
        let slotWidth = 106;
        const { getByTestId } = render(createElement(Probe));
        const bar = getByTestId('barra');
        stubWidths(bar, () => 820, () => slotWidth);

        act(() => fire());
        expect(collapsed(bar)).toBe('true');

        // O slot agora é só o ícone: a largura dele não decide nada, e a mesma assinatura não reabre (sem laço de medida).
        slotWidth = 36;
        act(() => fire());
        act(() => fire());
        expect(collapsed(bar)).toBe('true');
    });

    it('com outra chave (tema, itens), tenta o campo de novo: volta se cabe, recolhe de novo se não cabe', () => {
        vi.stubGlobal('ResizeObserver', FakeResizeObserver);
        let slotWidth = 106;
        const { getByTestId, rerender } = render(createElement(Probe, { resetKey: 'aurora' }));
        const bar = getByTestId('barra');
        stubWidths(bar, () => 820, () => slotWidth);
        act(() => fire());
        expect(collapsed(bar)).toBe('true');

        // Outro tema que comporta o campo: o campo volta, sem a barra ter mudado de largura.
        slotWidth = 164;
        rerender(createElement(Probe, { resetKey: 'cyberpunk' }));
        expect(collapsed(bar)).toBe('false');

        // Outro tema que de novo não comporta: recolhe.
        slotWidth = 100;
        rerender(createElement(Probe, { resetKey: 'aurora' }));
        expect(collapsed(bar)).toBe('true');
    });

    it('com a barra mais larga, tenta o campo de novo', () => {
        vi.stubGlobal('ResizeObserver', FakeResizeObserver);
        let barWidth = 820;
        let slotWidth = 106;
        const { getByTestId } = render(createElement(Probe));
        const bar = getByTestId('barra');
        stubWidths(bar, () => barWidth, () => slotWidth);
        act(() => fire());
        expect(collapsed(bar)).toBe('true');
        barWidth = 900;
        slotWidth = 160;
        act(() => fire());
        expect(collapsed(bar)).toBe('false');
    });

    it('não recolhe com o campo fora de cena (abaixo de md) nem quando o slot cabe', () => {
        vi.stubGlobal('ResizeObserver', FakeResizeObserver);
        const wide = render(createElement(Probe));
        const wideBar = wide.getByTestId('barra');
        stubWidths(wideBar, () => 1440, () => 256);
        act(() => fire());
        expect(collapsed(wideBar)).toBe('false');

        const noField = render(createElement(Probe, { hasField: false }));
        const noFieldBar = noField.getAllByTestId('barra')[1];
        stubWidths(noFieldBar, () => 600, () => 0);
        act(() => fire());
        expect(collapsed(noFieldBar)).toBe('false');
    });

    it('desligado, nunca recolhe', () => {
        vi.stubGlobal('ResizeObserver', FakeResizeObserver);
        const { getByTestId } = render(createElement(Probe, { enabled: false }));
        const bar = getByTestId('barra');
        stubWidths(bar, () => 820, () => 10);
        act(() => fire());
        expect(collapsed(bar)).toBe('false');
    });
});
