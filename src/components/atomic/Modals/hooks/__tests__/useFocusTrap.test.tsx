import React, { useRef } from 'react';
import { render, renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useFocusTrap, FOCUSABLE } from '../useFocusTrap';

describe('useFocusTrap (Spec 41 — modelo de foco dos overlays)', () => {
    it('FOCUSABLE cobre botão e input', () => {
        expect(FOCUSABLE).toContain('button');
        expect(FOCUSABLE).toContain('input');
    });

    it('fecha no ESC quando aberto e ignora quando fechado', () => {
        const onClose = vi.fn();
        const { rerender } = renderHook(({ open }: { open: boolean }) => useFocusTrap(open, onClose), {
            initialProps: { open: false },
        });
        act(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); });
        expect(onClose).not.toHaveBeenCalled();
        rerender({ open: true });
        act(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); });
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('devolve o foco ao gatilho ao fechar (Regra 1 — restauração)', () => {
        const trigger = document.createElement('button');
        document.body.appendChild(trigger);
        trigger.focus();
        expect(document.activeElement).toBe(trigger);

        const Overlay: React.FC<{ open: boolean }> = ({ open }) => {
            const { containerRef } = useFocusTrap(open, () => undefined);
            return (
                <div ref={containerRef as React.RefObject<HTMLDivElement>} tabIndex={-1}>
                    <button>dentro</button>
                </div>
            );
        };

        const { rerender, unmount } = render(<Overlay open={true} />);
        // ao abrir, o foco entrou no overlay (saiu do gatilho)
        expect(document.activeElement).not.toBe(trigger);
        // ao fechar, o foco volta ao gatilho
        rerender(<Overlay open={false} />);
        expect(document.activeElement).toBe(trigger);

        unmount();
        trigger.remove();
    });
});
