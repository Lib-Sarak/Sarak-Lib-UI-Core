import React from 'react';
import { useSarakShell } from './useSarakShell';
import { SidebarNav } from './Components/SidebarNav';
import { TopbarNav } from './Components/TopbarNav';
import { DockNav } from './Components/DockNav';
import { ShellContent } from './Components/ShellContent';
import SarakCursor from '../../components/atomic/UX/SarakCursor';
import SarakSearch from '../../components/atomic/Inputs/SarakSearch';
import { SarakShellProps } from './Components/types';

/**
 * Sarak Shell Core — Interface Engine (Refactored v7.2.5)
 */
export const SarakShell: React.FC<SarakShellProps> = (props) => {
    const { brand = { name: "Sarak Lib" }, user, logout, token, authApi, extraToolbarItems } = props;
    const shell = useSarakShell(!!token);
    const { design } = shell;

    if (!design) return null;

    const isTopbar = design.navigationStyle === 'topbar';
    const isSidebar = design.navigationStyle === 'sidebar';
    const isDock = design.navigationStyle === 'dock';

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
                
                {/* SHELL HEADER (TOPBAR / SIDEBAR-HIDDEN) */}
                {(isTopbar || isSidebar) && (
                    <TopbarNav 
                        design={design}
                        brand={brand}
                        toggleNav={shell.toggleNav}
                        setIsSearchOpen={shell.setIsSearchOpen}
                        activeModuleId={shell.activeModuleId}
                        setActiveModuleId={shell.setActiveModuleId}
                        discoveredModules={shell.discoveredModules}
                        extraToolbarItems={extraToolbarItems}
                    />
                )}

                {/* MAIN CONTENT CANVAS */}
                <ShellContent 
                    activeModule={shell.activeModule}
                    discoveredModules={shell.discoveredModules}
                    design={design}
                    user={user}
                    authApi={authApi}
                    setIsSearchOpen={shell.setIsSearchOpen}
                />
            </div>

            {design.cursorPhysics && <SarakCursor />}
            <SarakSearch isOpen={shell.isSearchOpen} onClose={() => shell.setIsSearchOpen(false)} />
        </div>
    );
};

export default SarakShell;

