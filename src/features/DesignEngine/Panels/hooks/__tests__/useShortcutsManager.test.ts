import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useShortcutsManager } from '../useShortcutsManager';

describe('useShortcutsManager', () => {
    it('should initialize and search shortcuts', () => {
        const sarak = {
            shortcuts: [
                { id: '1', category: 'General', description: 'Save' },
                { id: '2', category: 'Editor', description: 'Undo' }
            ]
        } as unknown as Parameters<typeof useShortcutsManager>[0];

        const { result } = renderHook(() => useShortcutsManager(sarak));
        
        expect(result.current.shortcutsArray.length).toBe(2);
        
        act(() => {
            result.current.setSearchQuery('Undo');
        });

        // The hook filters and groups them
        expect(result.current.groupedShortcuts['Editor']).toBeDefined();
        expect(result.current.groupedShortcuts['General']).toBeUndefined();
    });

    it('should start and cancel editing', () => {
        const { result } = renderHook(() => useShortcutsManager({} as Parameters<typeof useShortcutsManager>[0]));
        
        act(() => {
            result.current.startEditing('action-1');
        });
        expect(result.current.state.editingId).toBe('action-1');
        
        act(() => {
            result.current.cancelEditing();
        });
        expect(result.current.state.editingId).toBeNull();
    });
});
