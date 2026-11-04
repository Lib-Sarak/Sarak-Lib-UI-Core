import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCanvasSync } from '../useCanvasSync';

function fakeCanvas() {
    const context = { clearRect: vi.fn(), beginPath: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(), stroke: vi.fn(), arc: vi.fn(), fill: vi.fn(), fillText: vi.fn() };
    const canvas = document.createElement('canvas');
    vi.spyOn(canvas, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D);
    return { canvas, context };
}

describe('useCanvasSync', () => {
  it('desenha os traços quando não está digitando e o nome quando está', () => {
    const { canvas, context } = fakeCanvas();
    const ref = { current: canvas };
    const strokes = [[{ x: 1, y: 1 }, { x: 5, y: 5 }]];
    const { rerender } = renderHook(({ typing }) => useCanvasSync(ref, strokes, typing, 'Ana'), { initialProps: { typing: false } });
    expect(context.lineTo).toHaveBeenCalled();
    expect(context.fillText).not.toHaveBeenCalled();
    rerender({ typing: true });
    expect(context.fillText).toHaveBeenCalledWith('Ana', expect.any(Number), expect.any(Number), expect.any(Number));
  });

  it('sem canvas montado não faz nada', () => {
    expect(() => renderHook(() => useCanvasSync({ current: null }, [], false, ''))).not.toThrow();
  });
});
