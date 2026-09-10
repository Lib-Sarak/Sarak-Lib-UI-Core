import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useSearchShortcut } from '../useSearchShortcut';

const pressKey = (init: KeyboardEventInit) => window.dispatchEvent(new KeyboardEvent('keydown', init));

describe('useSearchShortcut', () => {
    it('Ctrl+K dispara o callback', () => {
        const onTrigger = vi.fn();
        renderHook(() => useSearchShortcut(onTrigger));
        pressKey({ key: 'k', ctrlKey: true });
        expect(onTrigger).toHaveBeenCalledTimes(1);
    });

    it('Cmd+K (metaKey) também dispara — mesmo atalho em macOS', () => {
        const onTrigger = vi.fn();
        renderHook(() => useSearchShortcut(onTrigger));
        pressKey({ key: 'k', metaKey: true });
        expect(onTrigger).toHaveBeenCalledTimes(1);
    });

    it('outra tecla, ou "k" sem modificador, NÃO dispara', () => {
        const onTrigger = vi.fn();
        renderHook(() => useSearchShortcut(onTrigger));
        pressKey({ key: 'k' });
        pressKey({ key: 'j', ctrlKey: true });
        expect(onTrigger).not.toHaveBeenCalled();
    });

    it('desmontado, o listener sai — Ctrl+K não dispara mais', () => {
        const onTrigger = vi.fn();
        const { unmount } = renderHook(() => useSearchShortcut(onTrigger));
        unmount();
        pressKey({ key: 'k', ctrlKey: true });
        expect(onTrigger).not.toHaveBeenCalled();
    });
});
