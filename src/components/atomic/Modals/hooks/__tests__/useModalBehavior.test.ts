import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
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

    it('trava e restaura o overflow do body conforme abre/fecha', () => {
        const { rerender, unmount } = renderHook(
            ({ open }: { open: boolean }) => useModalBehavior(open, () => undefined),
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
