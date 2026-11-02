import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import { ChromeSidebarResizeHandle } from '../ChromeSidebarResizeHandle';
import type { SidebarResize } from '../useSidebarResize';

const makeResize = (): SidebarResize => ({
    width: null,
    bounds: { min: 200, max: 400, now: 260 },
    handlers: {
        onPointerDown: vi.fn(), onPointerMove: vi.fn(), onPointerUp: vi.fn(), onKeyDown: vi.fn(), onDoubleClick: vi.fn(),
    },
});

describe('ChromeSidebarResizeHandle', () => {
    it('é um separador vertical focável, com rótulo e a faixa em aria-value*', () => {
        render(<ChromeSidebarResizeHandle resize={makeResize()} side="left" />);
        const handle = screen.getByRole('separator', { name: 'Ajustar a largura da barra lateral' });
        expect(handle).toHaveAttribute('aria-orientation', 'vertical');
        expect(handle).toHaveAttribute('aria-valuemin', '200');
        expect(handle).toHaveAttribute('aria-valuemax', '400');
        expect(handle).toHaveAttribute('aria-valuenow', '260');
        expect(handle).toHaveAttribute('tabindex', '0');
    });

    it('fica na borda voltada para o conteúdo: direita na lateral esquerda, esquerda na lateral direita', () => {
        const { rerender } = render(<ChromeSidebarResizeHandle resize={makeResize()} side="left" />);
        expect(screen.getByRole('separator').style.right).toBe('0px');
        rerender(<ChromeSidebarResizeHandle resize={makeResize()} side="right" />);
        expect(screen.getByRole('separator').style.left).toBe('0px');
    });

    it('repassa teclado e duplo clique ao hook', () => {
        const resize = makeResize();
        render(<ChromeSidebarResizeHandle resize={resize} side="left" />);
        const handle = screen.getByRole('separator');
        fireEvent.keyDown(handle, { key: 'ArrowRight' });
        fireEvent.doubleClick(handle);
        expect(resize.handlers.onKeyDown).toHaveBeenCalledTimes(1);
        expect(resize.handlers.onDoubleClick).toHaveBeenCalledTimes(1);
    });
});
