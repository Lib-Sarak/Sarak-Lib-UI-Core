import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useOverlayLayer } from '../useOverlayLayer';
import { useModalBehavior, FOCUSABLE } from '../useModalBehavior';

describe('Spec 13 — useModalBehavior', () => {
    it('expõe ref, stepIndex inicial e handlers', () => {
        const { result } = renderHook(() => useModalBehavior(true, () => undefined));
        expect(result.current.stepIndex).toBe(0);
        expect(typeof result.current.handleTrap).toBe('function');
        expect(result.current.dialogRef).toHaveProperty('current');
    });

    it('fecha no ESC quando aberto', () => {
        const onClose = vi.fn();
        renderHook(() => useModalBehavior(true, onClose));
        act(() => {
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        });
        expect(onClose).toHaveBeenCalled();
    });

    it('NÃO reage ao ESC quando fechado', () => {
        const onClose = vi.fn();
        renderHook(() => useModalBehavior(false, onClose));
        act(() => {
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        });
        expect(onClose).not.toHaveBeenCalled();
    });

    it('trava e restaura o overflow do body conforme abre/fecha (a trava é da pilha de camadas)', () => {
        const { rerender, unmount } = renderHook(
            ({ open }: { open: boolean }) => {
                const layer = useOverlayLayer(open);
                return useModalBehavior(open, () => undefined, layer.isTop);
            },
            { initialProps: { open: true } },
        );
        expect(document.body.style.overflow).toBe('hidden');
        rerender({ open: false });
        expect(document.body.style.overflow).toBe('');
        unmount();
    });

    it('FOCUSABLE inclui seletores de botão e input', () => {
        expect(FOCUSABLE).toContain('button');
        expect(FOCUSABLE).toContain('input');
    });
});
