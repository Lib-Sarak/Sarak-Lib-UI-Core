import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useChromeAutoHide } from '../useChromeAutoHide';

describe('useChromeAutoHide (isAutoHideEnabled)', () => {
    it('desligado (default): sempre visível, mesmo sem hover — comportamento de hoje', () => {
        const { result } = renderHook(() => useChromeAutoHide(false));
        expect(result.current.isVisible).toBe(true);
        act(() => result.current.surfaceProps.onMouseLeave());
        expect(result.current.isVisible).toBe(true);
    });

    it('ligado: começa OCULTO — a nav não vem aberta por padrão', () => {
        const { result } = renderHook(() => useChromeAutoHide(true));
        expect(result.current.isVisible).toBe(false);
    });

    it('ligado: o sensor revela a nav no hover', () => {
        const { result } = renderHook(() => useChromeAutoHide(true));
        act(() => result.current.sensorProps.onMouseEnter());
        expect(result.current.isVisible).toBe(true);
    });

    it('ligado: sair da superfície esconde de novo', () => {
        const { result } = renderHook(() => useChromeAutoHide(true));
        act(() => result.current.surfaceProps.onMouseEnter());
        expect(result.current.isVisible).toBe(true);
        act(() => result.current.surfaceProps.onMouseLeave());
        expect(result.current.isVisible).toBe(false);
    });
});
