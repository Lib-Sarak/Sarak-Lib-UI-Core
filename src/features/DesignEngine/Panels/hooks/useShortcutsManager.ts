import { useState, useEffect, useCallback, useMemo } from 'react';

export const useShortcutsManager = (sarak: any) => {
    const shortcuts = sarak?.shortcuts || [];
    const registeredActions = sarak?.registeredActions || {};
    const updateShortcut = sarak?.updateShortcut || ((id: string, keys: string[]) => {
        sarak.applyConfig({ _shortcutUpdate: { id, keys } });
    });

    const [state, setState] = useState<{
        editingId: string | null;
        tempKeys: string[];
        isCreating: boolean;
        searchQuery: string;
        domActions: any;
    }>({
        editingId: null,
        tempKeys: [],
        isCreating: false,
        searchQuery: "",
        domActions: {}
    });

    useEffect(() => {
        const elements = document.querySelectorAll('[data-action-id]');
        const found: any = {};
        elements.forEach(el => {
            const id = el.getAttribute('data-action-id');
            if (id) {
                found[id] = { 
                    id, 
                    name: el.getAttribute('data-action-name') || id, 
                    category: el.getAttribute('data-action-category') || 'Interface', 
                    isDom: true 
                };
            }
        });
        setState(prev => ({ ...prev, domActions: found }));
    }, []);

    const shortcutsArray = Array.isArray(shortcuts) ? shortcuts : Object.values(shortcuts || {});
    
    const filteredShortcuts = useMemo(() => {
        return shortcutsArray.filter((s: any) => 
            s.description?.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            s.category?.toLowerCase().includes(state.searchQuery.toLowerCase())
        );
    }, [shortcutsArray, state.searchQuery]);

    const groupedShortcuts = useMemo(() => {
        return filteredShortcuts.reduce((acc: any, s: any) => {
            (acc[s.category] = acc[s.category] || []).push(s);
            return acc;
        }, {});
    }, [filteredShortcuts]);

    const startEditing = useCallback((id: string) => {
        setState(prev => ({ ...prev, editingId: id, tempKeys: [] }));
    }, []);

    const cancelEditing = useCallback(() => {
        setState(prev => ({ ...prev, editingId: null, tempKeys: [], isCreating: false }));
    }, []);

    const setSearchQuery = useCallback((q: string) => {
        setState(prev => ({ ...prev, searchQuery: q }));
    }, []);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!state.editingId) return;
        
        e.preventDefault();
        e.stopPropagation();

        if (e.key === 'Escape') {
            cancelEditing();
            return;
        }

        const newKeys: string[] = [];
        if (e.ctrlKey) newKeys.push('Control');
        if (e.shiftKey) newKeys.push('Shift');
        if (e.altKey) newKeys.push('Alt');
        if (e.metaKey) newKeys.push('Meta');

        const isModifier = ['Control', 'Shift', 'Alt', 'Meta'].includes(e.key);
        if (!isModifier) newKeys.push(e.key);

        setState(prev => ({ ...prev, tempKeys: newKeys }));

        if (!isModifier && newKeys.length > 0) {
            updateShortcut(state.editingId, newKeys);
            cancelEditing();
        }
    }, [state.editingId, updateShortcut, cancelEditing]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown, { capture: true });
        return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
    }, [handleKeyDown]);

    return {
        state,
        shortcutsArray,
        groupedShortcuts,
        startEditing,
        cancelEditing,
        setSearchQuery
    };
};
