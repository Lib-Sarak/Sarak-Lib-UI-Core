import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSarakUI } from '../../Provider/SarakUIProvider';

export const useSarakShellUI = () => {
    const { design, applyConfig } = useSarakUI();

    const [state, setState] = useState({
        isSearchOpen: false,
        isNavVisible: true,
        isMobileNavOpen: false,
        resizeType: null as 'sidebar' | 'topbar' | null
    });

    const updateState = useCallback((updates: Partial<typeof state>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);

    const sidebarMinWidth = useMemo(() => design?.sidebarMinWidth || 200, [design?.sidebarMinWidth]);
    const sidebarMaxWidth = useMemo(() => design?.sidebarMaxWidth || 450, [design?.sidebarMaxWidth]);
    const topbarMinHeight = 40;
    const topbarMaxHeight = 120;

    const toggleNav = useCallback(() => {
        applyConfig({ isNavHidden: !design?.isNavHidden });
    }, [applyConfig, design?.isNavHidden]);

    const setSidebarWidth = useCallback((w: number) => {
        applyConfig({ sidebarWidth: w });
    }, [applyConfig]);

    const setTopbarHeight = useCallback((h: number) => {
        applyConfig({ topbarHeight: h });
    }, [applyConfig]);

    // Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.altKey && e.key === 'n') {
                e.preventDefault();
                toggleNav();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                updateState({ isSearchOpen: true });
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggleNav, updateState]);

    // --- Unified Resize Engine (v10.3) ---
    const startResizingSidebar = useCallback(() => updateState({ resizeType: 'sidebar' }), [updateState]);
    const startResizingTopbar = useCallback(() => updateState({ resizeType: 'topbar' }), [updateState]);
    const stopResizing = useCallback(() => updateState({ resizeType: null }), [updateState]);

    const resize = useCallback((e: MouseEvent) => {
        if (state.resizeType === 'sidebar') {
            const newWidth = e.clientX;
            if (newWidth >= sidebarMinWidth && newWidth <= sidebarMaxWidth) setSidebarWidth(newWidth);
            return;
        }
        if (state.resizeType === 'topbar') {
            const newHeight = e.clientY;
            if (newHeight >= topbarMinHeight && newHeight <= topbarMaxHeight) setTopbarHeight(newHeight);
        }
    }, [state.resizeType, setSidebarWidth, setTopbarHeight, sidebarMinWidth, sidebarMaxWidth]);

    useEffect(() => {
        if (typeof document === 'undefined') return;
        
        if (state.resizeType) {
            window.addEventListener('mousemove', resize);
            window.addEventListener('mouseup', stopResizing);
            document.body.style.cursor = state.resizeType === 'sidebar' ? 'col-resize' : 'row-resize';
            document.body.style.userSelect = 'none';
        }
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
            if (typeof document !== 'undefined' && document.body) {
                document.body.style.cursor = 'default';
                document.body.style.userSelect = 'auto';
            }
        };
    }, [state.resizeType, resize, stopResizing]);

    return {
        state,
        updateState,
        toggleNav,
        startResizingSidebar,
        startResizingTopbar
    };
};
