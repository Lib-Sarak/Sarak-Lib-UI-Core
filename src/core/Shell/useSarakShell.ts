import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSarakUI } from '../Provider/SarakUIProvider';
import { useModuleDiscovery } from '../../shared/hooks/useModuleDiscovery';
import { useSarakRouter } from '../../shared/hooks/useSarakRouter';
import { DiscoveredModule } from '../../constants/discovery';

export const useSarakShell = (loggedIn: boolean) => {
    const { design, applyConfig, options } = useSarakUI();
    const { modules: discoveredModules, isLoading: isDiscovering } = useModuleDiscovery(loggedIn);
    const { segments, navigate } = useSarakRouter();
    
    // O módulo ativo é derivado do primeiro segmento da URL
    const activeModuleId = segments[0] || null;
    
    const setActiveModuleId = useCallback((id: string) => {
        navigate(`/${id}`);
    }, [navigate]);

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isNavVisible, setIsNavVisible] = useState(true);
    const [resizeType, setResizeType] = useState<'sidebar' | 'topbar' | null>(null);

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

    // Module activation (Native Routing v10.2) - Prioritizes default or mx-customization
    useEffect(() => {
        if (discoveredModules.length > 0 && !activeModuleId) {
            const defaultId = options?.theme?.defaultModuleId;
            const targetMod = defaultId ? discoveredModules.find(m => m.id === defaultId) : null;
            
            if (targetMod) {
                navigate(`/${targetMod.id}`, true);
            } else {
                // Fallback: Tenta encontrar mx-customization primeiro, senão pega o primeiro da lista
                const customMod = discoveredModules.find(m => m.id === 'mx-customization');
                navigate(`/${customMod ? customMod.id : discoveredModules[0].id}`, true);
            }
        }
    }, [discoveredModules, activeModuleId, navigate, options?.theme?.defaultModuleId]);

    // Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.altKey && e.key === 'n') {
                e.preventDefault();
                toggleNav();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggleNav]);

    // --- Unified Resize Engine (v10.3) ---
    const startResizingSidebar = useCallback(() => setResizeType('sidebar'), []);
    const startResizingTopbar = useCallback(() => setResizeType('topbar'), []);
    const stopResizing = useCallback(() => setResizeType(null), []);

    const resize = useCallback((e: MouseEvent) => {
        if (resizeType === 'sidebar') {
            const newWidth = e.clientX;
            if (newWidth >= sidebarMinWidth && newWidth <= sidebarMaxWidth) setSidebarWidth(newWidth);
        } else if (resizeType === 'topbar') {
            const newHeight = e.clientY;
            if (newHeight >= topbarMinHeight && newHeight <= topbarMaxHeight) setTopbarHeight(newHeight);
        }
    }, [resizeType, setSidebarWidth, setTopbarHeight, sidebarMinWidth, sidebarMaxWidth]);

    useEffect(() => {
        if (typeof document === 'undefined') return;
        
        if (resizeType) {
            window.addEventListener('mousemove', resize);
            window.addEventListener('mouseup', stopResizing);
            document.body.style.cursor = resizeType === 'sidebar' ? 'col-resize' : 'row-resize';
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
    }, [resizeType, resize, stopResizing]);

    const activeModule = useMemo(() => discoveredModules.find(m => m.id === activeModuleId), [discoveredModules, activeModuleId]);
    
    const groupedModules = useMemo(() => {
        return discoveredModules.reduce((acc, mod) => {
            const cat = mod.category || 'System Modules';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(mod);
            return acc;
        }, {} as Record<string, DiscoveredModule[]>);
    }, [discoveredModules]);

    return {
        design,
        discoveredModules,
        isDiscovering,
        activeModuleId,
        setActiveModuleId,
        activeModule,
        groupedModules,
        isSearchOpen,
        setIsSearchOpen,
        isNavVisible,
        setIsNavVisible,
        toggleNav,
        startResizingSidebar,
        startResizingTopbar,
        startResizing: startResizingSidebar // Alias para compatibilidade v10.2
    };
};
