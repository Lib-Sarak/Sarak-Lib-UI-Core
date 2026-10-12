import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { parseCubicBezier, useMotionTokens } from '../useMotionTokens';

let mockDesign: Record<string, unknown> | undefined;
vi.mock('../../../../core/Provider/SarakUIProvider', () => ({
    useSarakUIOptional: () => (mockDesign ? { design: mockDesign } : null),
}));

describe('parseCubicBezier', () => {
    it('lê os quatro números de um cubic-bezier, com sinais e espaços', () => {
        expect(parseCubicBezier('cubic-bezier(0.4, 0, 1, 1)')).toEqual([0.4, 0, 1, 1]);
        expect(parseCubicBezier(' cubic-bezier(0.175,0.885,0.32,1.275) ')).toEqual([0.175, 0.885, 0.32, 1.275]);
        expect(parseCubicBezier('cubic-bezier(-0.2, 0, 0.2, 1)')).toEqual([-0.2, 0, 0.2, 1]);
    });

    it('qualquer outra forma é recusada, para o chamador cair na curva de fábrica', () => {
        expect(parseCubicBezier('linear')).toBeUndefined();
        expect(parseCubicBezier('ease-in')).toBeUndefined();
        expect(parseCubicBezier('cubic-bezier(0.4, 0, 1)')).toBeUndefined();
        expect(parseCubicBezier(42)).toBeUndefined();
        expect(parseCubicBezier(undefined)).toBeUndefined();
    });
});

describe('useMotionTokens', () => {
    beforeEach(() => {
        mockDesign = undefined;
    });

    it('sem Provider, devolve a curva de entrada e a cascata de fábrica', () => {
        const { result } = renderHook(() => useMotionTokens());
        expect(result.current).toEqual({ easeIn: [0.4, 0, 1, 1], staggerDelay: 0.05 });
    });

    it('lê motionEaseIn e motionStaggerDelay do tema', () => {
        mockDesign = { motionEaseIn: 'cubic-bezier(0.5, 0, 0.75, 0)', motionStaggerDelay: 0.12 };
        const { result } = renderHook(() => useMotionTokens());
        expect(result.current).toEqual({ easeIn: [0.5, 0, 0.75, 0], staggerDelay: 0.12 });
    });

    it('curva que o motor não entende cai na de fábrica; atraso 0 desliga a cascata', () => {
        mockDesign = { motionEaseIn: 'linear', motionStaggerDelay: 0 };
        const { result } = renderHook(() => useMotionTokens());
        expect(result.current.easeIn).toEqual([0.4, 0, 1, 1]);
        expect(result.current.staggerDelay).toBe(0);
    });
});
