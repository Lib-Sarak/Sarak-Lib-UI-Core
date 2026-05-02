import React from 'react';
import { useSarakShell } from './useSarakShell';
import { SidebarNav } from './Components/SidebarNav';
import { TopbarNav } from './Components/TopbarNav';
import { DockNav } from './Components/DockNav';
import { ShellContent } from './Components/ShellContent';
import SarakSearch from '../../components/atomic/Inputs/SarakSearch';
import { SarakShellProps } from './Components/types';

import { useSarakUI } from '../Provider/SarakUIProvider';

/**
 * Sarak Shell Core — Interface Engine (Refactored v7.2.5)
 */
export const SarakShell: React.FC<SarakShellProps> = (props) => {
    const ui = useSarakUI();
    const { 
        brand = ui.options?.manifest?.brand || { name: "Sarak Lib" }, 
        user, 
        logout, 
        token, 
        authApi, 
        extraToolbarItems 
    } = props;
    
    const shell = useSarakShell(!!(token || ui.options?.token));
    const { design } = shell;

    // --- VISUAL SAFETY GATE (v9.5 Industrial) ---
    React.useEffect(() => {
        const checkCSS = () => {
            const testElement = document.documentElement;
            const primaryColor = getComputedStyle(testElement).getPropertyValue('--theme-primary').trim();
            
            if (!primaryColor || primaryColor === '') {
                console.warn("[Sarak:Shell] Visual Safety Gate Triggered: CSS variables not detected. Injecting emergency fallbacks.");
                testElement.style.setProperty('--theme-primary', '#3b82f6'); // Blue 500
                testElement.style.setProperty('--theme-body', '#0f172a');    // Slate 900
                testElement.style.setProperty('--theme-card', '#1e293b');    // Slate 800
                testElement.style.setProperty('--theme-text', '#f8fafc');    // Slate 50
                testElement.style.setProperty('--theme-border', '#334155');  // Slate 700
            }
        };

        // Pequeno atraso para garantir que o navegador processou os estilos iniciais
        const timer = setTimeout(checkCSS, 1500);
        return () => clearTimeout(timer);
    }, []);

    // --- DESIGN HYDRATION LOG (v10.1) ---
    React.useEffect(() => {
        if (ui.options?.debug) {
            console.log("[Sarak:Shell] Active Design:", design);
        }
    }, [design, ui.options?.debug]);

    const isTopbar = design?.navigationStyle === 'topbar';
    const isSidebar = design?.navigationStyle === 'sidebar' || !design; // Default to sidebar
    const isDock = design?.navigationStyle === 'dock';

    return (
        <div className="flex w-full h-screen overflow-hidden bg-[var(--theme-body)] text-white font-sans selection:bg-[var(--theme-primary)] selection:text-white">
            
            {/* HOVER SENSORS (v6.2) */}
            {design.isAutoHideEnabled && !shell.isNavVisible && (
                <>
                    {isSidebar && (
                        <div 
                            onMouseEnter={() => shell.setIsNavVisible(true)}
                            className="fixed left-0 top-0 w-4 h-full z-[1000] cursor-pointer"
                        />
                    )}
                    {isDock && (
                        <div 
                            onMouseEnter={() => shell.setIsNavVisible(true)}
                            className="fixed bottom-0 left-0 w-full h-8 z-[1000] cursor-pointer"
                        />
                    )}
                </>
            )}

            {/* SIDEBAR NAVIGATION */}
            {isSidebar && (
                <SidebarNav 
                    design={design}
                    brand={brand}
                    user={user}
                    logout={logout}
                    toggleNav={shell.toggleNav}
                    activeModuleId={shell.activeModuleId}
                    setActiveModuleId={shell.setActiveModuleId}
                    groupedModules={shell.groupedModules}
                    setIsNavVisible={shell.setIsNavVisible}
                    setIsSearchOpen={shell.setIsSearchOpen}
                    startResizing={shell.startResizing}
                />
            )}

            {/* DOCK NAVIGATION */}
            {isDock && (
                <DockNav 
                    design={design}
                    discoveredModules={shell.discoveredModules}
                    activeModuleId={shell.activeModuleId}
                    setActiveModuleId={shell.setActiveModuleId}
                    setIsSearchOpen={shell.setIsSearchOpen}
                    isNavVisible={shell.isNavVisible}
                    setIsNavVisible={shell.setIsNavVisible}
                />
            )}

            {/* CONTENT AREA */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative bg-[var(--theme-body)]">
                
                {/* SHELL HEADER (TOPBAR ONLY) */}
                {isTopbar && (
                    <TopbarNav 
                        design={design}
                        brand={brand}
                        toggleNav={shell.toggleNav}
                        setIsSearchOpen={shell.setIsSearchOpen}
                        activeModuleId={shell.activeModuleId}
                        setActiveModuleId={shell.setActiveModuleId}
                        discoveredModules={shell.discoveredModules}
                        extraToolbarItems={extraToolbarItems}
                        user={user}
                        logout={logout}
                    />
                )}

                {/* MAIN CONTENT CANVAS */}
                <ErrorBoundary fallback={<div className="sarak-critical-error">Falha Industrial detectada no Módulo. Reiniciando Engine...</div>}>
                    <React.Suspense fallback={<div className="sarak-loader">Sincronizando DNA Industrial...</div>}>
                        <ShellContent 
                            activeModule={shell.activeModule}
                            discoveredModules={shell.discoveredModules}
                            design={design}
                            user={user}
                            authApi={authApi}
                            setIsSearchOpen={shell.setIsSearchOpen}
                        />
                    </React.Suspense>
                </ErrorBoundary>
            </div>

            <SarakSearch isOpen={shell.isSearchOpen} onClose={() => shell.setIsSearchOpen(false)} />
        </div>
    );
};

export default SarakShell;
