import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSarakUI } from '../Provider/SarakUIProvider';
import { useModuleDiscovery } from '../../shared/hooks/useModuleDiscovery';
import { DiscoveredModule } from '../../constants/discovery';

export const useSarakShell = (loggedIn: boolean) => {
    const { design, applyConfig } = useSarakUI();
    const { modules: discoveredModules, isLoading: isDiscovering } = useModuleDiscovery(loggedIn);
    
    const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isNavVisible, setIsNavVisible] = useState(true);
    const [isResizing, setIsResizing] = useState(false);

    const toggleNav = useCallback(() => {
        applyConfig({ isNavHidden: !design?.isNavHidden });
    }, [applyConfig, design?.isNavHidden]);

    const setSidebarWidth = useCallback((w: number) => {
        applyConfig({ sidebarWidth: w });
    }, [applyConfig]);

    // Mouse Tracking Engine
    useEffect(() => {
        let rafId: number;
        const handleMouseMove = (e: MouseEvent) => {
            rafId = requestAnimationFrame(() => {
                const cards = document.querySelectorAll('.bg-theme-card');
                if (cards.length === 0) return;
                
                cards.forEach(card => {
                    const rect = (card as HTMLElement).getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    (card as HTMLElement).style.setProperty('--mouse-x', `${x}%`);
                    (card as HTMLElement).style.setProperty('--mouse-y', `${y}%`);
                });
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(rafId);
        };
    }, []);

    // Module activation
    useEffect(() => {
        if (discoveredModules.length > 0 && !activeModuleId) {
            const customMod = discoveredModules.find(m => m.id === 'mx-customization');
            setActiveModuleId(customMod ? customMod.id : discoveredModules[0].id);
        }
    }, [discoveredModules, activeModuleId]);

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

    // Resize logic
    const startResizing = useCallback(() => setIsResizing(true), []);
    const stopResizing = useCallback(() => setIsResizing(false), []);
    const resize = useCallback((e: MouseEvent) => {
        if (isResizing) {
            const newWidth = e.clientX;
            if (newWidth > 200 && newWidth < 450) setSidebarWidth(newWidth);
        }
    }, [isResizing, setSidebarWidth]);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', resize);
            window.addEventListener('mouseup', stopResizing);
        }
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [isResizing, resize, stopResizing]);

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
        startResizing
    };
};
