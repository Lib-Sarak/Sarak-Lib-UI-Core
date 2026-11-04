import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { UIContext } from '../../../../core/Provider/context';
import type { SarakUIContextType } from '../../../../core/Provider/types';
import { useSidebarResize } from '../useSidebarResize';

const asideWithWidth = (width: number, vars: Record<string, string> = { '--sidebar-min-width': '200px', '--sidebar-max-width': '400px' }): React.RefObject<HTMLElement> => {
    const element = document.createElement('aside');
    Object.entries(vars).forEach(([name, value]) => element.style.setProperty(name, value));
    element.getBoundingClientRect = () => ({ width }) as DOMRect;
    document.body.appendChild(element);
    return { current: element };
};

const setup = (width: number, side: 'left' | 'right' = 'left') => {
    const updatePreferences = vi.fn();
    const context = { updatePreferences } as unknown as SarakUIContextType;
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <UIContext.Provider value={context}>{children}</UIContext.Provider>
    );
    const ref = asideWithWidth(width);
    const hook = renderHook(() => useSidebarResize(ref, side), { wrapper });
    return { ...hook, updatePreferences };
};

const pointer = (clientX: number) => ({ clientX, pointerId: 1, currentTarget: { setPointerCapture: vi.fn() } }) as never;
const key = (name: string, shiftKey = false) => ({ key: name, shiftKey, preventDefault: vi.fn() }) as never;

describe('useSidebarResize', () => {
    it('sem ajuste, a largura é a do tema (null) e a faixa vem das variáveis de piso e teto', () => {
        const { result } = setup(260);
        expect(result.current.width).toBeNull();
        expect(result.current.bounds).toEqual({ min: 200, max: 400, now: 260 });
    });

    it('arrastar acompanha o ponteiro sem gravar; soltar grava a preferência', () => {
        const { result, updatePreferences } = setup(260);
        act(() => result.current.handlers.onPointerDown(pointer(260)));
        act(() => result.current.handlers.onPointerMove(pointer(300)));
        expect(result.current.width).toBe(300);
        expect(updatePreferences).not.toHaveBeenCalled();
        act(() => result.current.handlers.onPointerUp(pointer(320)));
        expect(result.current.width).toBe(320);
        expect(updatePreferences).toHaveBeenCalledWith({ sidebarWidth: 320 });
    });

    it('o arrasto fica entre o piso e o teto', () => {
        const { result, updatePreferences } = setup(260);
        act(() => result.current.handlers.onPointerDown(pointer(260)));
        act(() => result.current.handlers.onPointerUp(pointer(2000)));
        expect(updatePreferences).toHaveBeenLastCalledWith({ sidebarWidth: 400 });
        act(() => result.current.handlers.onPointerDown(pointer(2000)));
        act(() => result.current.handlers.onPointerUp(pointer(-2000)));
        expect(updatePreferences).toHaveBeenLastCalledWith({ sidebarWidth: 200 });
    });

    it('com a lateral à direita o arrasto para a esquerda alarga', () => {
        const { result, updatePreferences } = setup(260, 'right');
        act(() => result.current.handlers.onPointerDown(pointer(500)));
        act(() => result.current.handlers.onPointerUp(pointer(460)));
        expect(updatePreferences).toHaveBeenCalledWith({ sidebarWidth: 300 });
    });

    it('as setas ajustam em passos de 16 px (Shift: 64), e Home/End vão ao piso e ao teto', () => {
        const { result, updatePreferences } = setup(260);
        act(() => result.current.handlers.onKeyDown(key('ArrowRight')));
        expect(updatePreferences).toHaveBeenLastCalledWith({ sidebarWidth: 276 });
        act(() => result.current.handlers.onKeyDown(key('ArrowLeft')));
        expect(updatePreferences).toHaveBeenLastCalledWith({ sidebarWidth: 244 });
        act(() => result.current.handlers.onKeyDown(key('ArrowRight', true)));
        expect(updatePreferences).toHaveBeenLastCalledWith({ sidebarWidth: 324 });
        act(() => result.current.handlers.onKeyDown(key('Home')));
        expect(updatePreferences).toHaveBeenLastCalledWith({ sidebarWidth: 200 });
        act(() => result.current.handlers.onKeyDown(key('End')));
        expect(updatePreferences).toHaveBeenLastCalledWith({ sidebarWidth: 400 });
    });

    it('tecla que não é da alça não faz nada e não é consumida', () => {
        const { result, updatePreferences } = setup(260);
        const event = key('a');
        act(() => result.current.handlers.onKeyDown(event));
        expect(updatePreferences).not.toHaveBeenCalled();
        expect((event as unknown as { preventDefault: () => void }).preventDefault).not.toHaveBeenCalled();
    });

    it('duplo clique volta ao padrão: largura do tema e preferência removida', () => {
        const { result, updatePreferences } = setup(260);
        act(() => result.current.handlers.onKeyDown(key('End')));
        act(() => result.current.handlers.onDoubleClick());
        expect(result.current.width).toBeNull();
        expect(updatePreferences).toHaveBeenLastCalledWith({ sidebarWidth: undefined });
    });

    it('movimento sem arrasto iniciado é ignorado', () => {
        const { result } = setup(260);
        act(() => result.current.handlers.onPointerMove(pointer(999)));
        expect(result.current.width).toBeNull();
    });
});
