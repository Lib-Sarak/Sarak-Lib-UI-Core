import React from 'react';
import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { useContainerScale } from '../useContainerScale';

/**
 * `useContainerScale` extraído de `PreviewSystemRenderer.tsx` (plan-36, R9 — o
 * arquivo estourou o teto de 250 linhas com a lógica inline). O comportamento já era
 * coberto indiretamente por `PreviewSystemRenderer.test.tsx`; aqui é testado
 * diretamente, na fonte.
 */
describe('useContainerScale (plan-36 — escala o preview pela largura REAL do container)', () => {
    let observedCallback: ResizeObserverCallback | null = null;
    class ResizeObserverStub {
        constructor(cb: ResizeObserverCallback) {
            observedCallback = cb;
        }
        observe() {}
        unobserve() {}
        disconnect() {}
    }

    const fireWidth = (width: number) => {
        act(() => {
            observedCallback?.(
                [{ contentRect: { width } } as unknown as ResizeObserverEntry],
                {} as ResizeObserver,
            );
        });
    };

    afterEach(() => {
        observedCallback = null;
        vi.unstubAllGlobals();
    });

    // O hook só observa quando `containerRef` está anexado a um nó REAL do DOM —
    // `renderHook` puro (sem JSX) nunca preenche isso; por isso o harness renderiza
    // `<div ref={containerRef} />` de verdade.
    const Harness = ({ fallback, onScale }: { fallback: number; onScale: (scale: number) => void }) => {
        const { containerRef, scale } = useContainerScale(fallback);
        onScale(scale);
        return <div ref={containerRef} data-testid="scale-target" />;
    };

    it('começa no fallback, antes de qualquer medição', () => {
        let latestScale = -1;
        render(<Harness fallback={0.75} onScale={(s) => { latestScale = s; }} />);
        expect(latestScale).toBe(0.75);
    });

    it('mede a largura e satura nos limites [0.5, 0.95]', () => {
        vi.stubGlobal('ResizeObserver', ResizeObserverStub);
        let latestScale = -1;
        render(<Harness fallback={0.75} onScale={(s) => { latestScale = s; }} />);

        fireWidth(320); // 320/1280 = 0.25 — abaixo do piso
        expect(latestScale).toBe(0.5);

        fireWidth(2000); // acima do teto
        expect(latestScale).toBe(0.95);

        fireWidth(896); // 896/1280 = 0.7 — dentro da faixa
        expect(latestScale).toBeCloseTo(0.7, 5);
    });

    it('ignora medições degeneradas (largura 0 ou muito pequena) — mantém a escala anterior', () => {
        vi.stubGlobal('ResizeObserver', ResizeObserverStub);
        let latestScale = -1;
        render(<Harness fallback={0.75} onScale={(s) => { latestScale = s; }} />);

        fireWidth(896);
        expect(latestScale).toBeCloseTo(0.7, 5);

        fireWidth(0);
        expect(latestScale).toBeCloseTo(0.7, 5); // não regride para um valor inútil

        fireWidth(50);
        expect(latestScale).toBeCloseTo(0.7, 5); // abaixo do piso de estabilidade (100px)
    });

    it('sem ResizeObserver no ambiente, permanece no fallback para sempre — nunca quebra', () => {
        vi.stubGlobal('ResizeObserver', undefined);
        let latestScale = -1;
        render(<Harness fallback={0.95} onScale={(s) => { latestScale = s; }} />);
        expect(latestScale).toBe(0.95);
    });
});
