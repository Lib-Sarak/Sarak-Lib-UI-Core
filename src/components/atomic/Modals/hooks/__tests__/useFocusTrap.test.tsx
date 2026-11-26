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

    it('camada que não é a do topo ignora Escape e Tab (confirmação aberta sobre a gaveta)', () => {
        const onClose = vi.fn();
        const { result, rerender } = renderHook(({ top }: { top: boolean }) => useFocusTrap(true, onClose, top), {
            initialProps: { top: false },
        });
        act(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); });
        expect(onClose).not.toHaveBeenCalled();

        const container = document.createElement('div');
        container.innerHTML = '<button id="a">a</button><button id="b">b</button>';
        document.body.appendChild(container);
        result.current.containerRef.current = container;
        (container.querySelector('#b') as HTMLElement).focus();
        const tab = { key: 'Tab', shiftKey: false, preventDefault: vi.fn() } as unknown as React.KeyboardEvent<HTMLDivElement>;
        result.current.handleTrap(tab);
        expect(tab.preventDefault).not.toHaveBeenCalled();

        rerender({ top: true });
        act(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); });
        expect(onClose).toHaveBeenCalledTimes(1);
        container.remove();
    });
});

describe('useFocusTrap — só alcança o que aparece', () => {
    const Overlay: React.FC = () => {
        const { containerRef, handleTrap } = useFocusTrap(true, () => undefined);
        return (
            <div ref={containerRef} onKeyDown={handleTrap} tabIndex={-1}>
                <div style={{ display: 'none' }}><button type="button">escondido no início</button></div>
                <button type="button">primeiro visível</button>
                <button type="button">último visível</button>
                <div style={{ display: 'none' }}><button type="button">escondido no fim</button></div>
            </div>
        );
    };

    it('entra no primeiro focável visível, e o Tab do último volta ao primeiro (não a um alvo que não recebe foco)', () => {
        const { getByText } = render(<Overlay />);
        const first = getByText('primeiro visível');
        const last = getByText('último visível');
        expect(document.activeElement).toBe(first);

        last.focus();
        const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
        act(() => { last.dispatchEvent(event); });
        expect(event.defaultPrevented).toBe(true);
        expect(document.activeElement).toBe(first);
    });
});
