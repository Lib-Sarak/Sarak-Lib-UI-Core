import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useSarakShell } from './useSarakShell';
import { SidebarNav } from './Components/SidebarNav';
import { TopbarNav } from './Components/TopbarNav';
import { DockNav } from './Components/DockNav';
import { ShellContent } from './Components/ShellContent';
import SarakSearch from '../../components/atomic/Inputs/SarakSearch';
import { SarakShellProps } from './Components/types';

import { useSarakUI } from '../Provider/SarakUIProvider';
import { useSarakDevice } from '../Provider/DeviceProvider';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[Sarak:Critical] Falha no Módulo:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-8 text-[var(--theme-error)] bg-[var(--theme-error-bg)] border border-[var(--theme-error-border)] rounded-lg">
          <h2 className="text-xl font-bold mb-2">Falha Industrial de Renderização</h2>
          <p>O módulo encontrou um erro crítico. Tente recarregar a página.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

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
    
    const device = useSarakDevice();
    const isMobile = device === 'smartphone';

    // --- DIMENSION GUARD (v10.1.10 Industrial Diagnostic) ---
    const [isReady, setIsReady] = React.useState(false);
    const contentRef = React.useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = React.useState({ w: 0, h: 0 });
    const stabilityTimer = React.useRef<NodeJS.Timeout | null>(null);
    const fallbackTimer = React.useRef<NodeJS.Timeout | null>(null);

    React.useEffect(() => {
        if (!contentRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                setDimensions({ w: width, h: height });
                
                if (stabilityTimer.current) clearTimeout(stabilityTimer.current);

                // Requisitos Industriais (v10.1.10: Reduzido para maior compatibilidade)
                if (width > 100 && height > 100) {
                    stabilityTimer.current = setTimeout(() => {
                        if (!isReady) {
                            setIsReady(true);
                            if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
                        }
                    }, 100);
                }
            }
        });

        observer.observe(contentRef.current);

        // FALLBACK DE SEGURANÇA: Se em 3s não estabilizar, força a renderização para não travar a UI
        fallbackTimer.current = setTimeout(() => {
            if (!isReady) {
                console.warn("[Sarak:Shell] Dimension Guard: Tempo limite de estabilização excedido. Forçando montagem.");
                setIsReady(true);
            }
        }, 3000);

        return () => {
            observer.disconnect();
            if (stabilityTimer.current) clearTimeout(stabilityTimer.current);
            if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
        };
    }, [isReady]);

    // Reset ao trocar de módulo para garantir nova verificação
    React.useEffect(() => {
        setIsReady(false);
    }, [shell.activeModuleId]);

    // --- VISUAL SAFETY GATE (v9.5 Industrial) ---
    React.useEffect(() => {
        const checkCSS = () => {
            const testElement = document.documentElement;
            const primaryColor = getComputedStyle(testElement).getPropertyValue('--theme-primary').trim();
            
            if (!primaryColor || primaryColor === '') {
                console.warn("[Sarak:Shell] Visual Safety Gate Triggered: CSS variables not detected. Theme data was not hydrated.");
            }
        };

        // Pequeno atraso para garantir que o navegador processou os estilos iniciais
        const timer = setTimeout(checkCSS, 1500);
        return () => clearTimeout(timer);
    }, []);

    // --- DESIGN HYDRATION LOG (v10.1) ---
    // Log removido para produção

    const isTopbar = design?.navigationStyle === 'topbar';
    const isDock = design?.navigationStyle === 'dock';
    const isGlass = design?.navigationStyle === 'glass';
    const isSidebar = design?.navigationStyle === 'sidebar' || (!isTopbar && !isDock && !isGlass);

    const layoutClass = `layout-${design?.navigationStyle || 'sidebar'}`;

    return (
        <div className={`flex ${isMobile ? 'flex-col' : ''} w-full h-screen overflow-hidden ${design.globalBackgroundImageUrl ? 'bg-transparent' : 'bg-[var(--theme-body)]'} text-[var(--theme-text)] font-sans selection:bg-[var(--theme-primary)] selection:text-[var(--theme-on-primary)] ${layoutClass}`}>
            
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

            {/* SIDEBAR NAVIGATION (DESKTOP) */}
            {isSidebar && !isMobile && (
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
                    startResizing={shell.startResizingSidebar}
                />
            )}

            {/* MOBILE SHELL HEADER */}
            {isMobile && isSidebar && (
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--theme-border)] bg-[var(--theme-sidebar)] z-20 shrink-0 shadow-sm">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => shell.setIsMobileNavOpen(true)}
                            className="p-1.5 -ml-1.5 rounded-md text-[var(--theme-muted)] hover:text-[var(--theme-title)] hover:bg-[var(--theme-primary)]/10 transition-colors"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                        </button>
                        <span className="font-bold tracking-tight text-[var(--theme-title)] truncate">
                            {brand.name || "Sarak"}
                        </span>
                    </div>
                </div>
            )}

            {/* MOBILE DRAWER OVERLAY */}
            {isMobile && isSidebar && shell.isMobileNavOpen && (
                <div className="fixed inset-0 z-[9999] flex">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => shell.setIsMobileNavOpen(false)} />
                    <div className="relative w-4/5 max-w-sm h-full flex flex-col bg-[var(--theme-sidebar)] shadow-2xl animate-in slide-in-from-left duration-300">
                        <SidebarNav 
                            design={{...design, isNavHidden: false, isAutoHideEnabled: false}}
                            brand={brand}
                            user={user}
                            logout={logout}
                            toggleNav={() => shell.setIsMobileNavOpen(false)}
                            activeModuleId={shell.activeModuleId}
                            setActiveModuleId={shell.setActiveModuleId}
                            groupedModules={shell.groupedModules}
                            setIsNavVisible={shell.setIsNavVisible}
                            setIsSearchOpen={shell.setIsSearchOpen}
                            startResizing={() => {}}
                            isMobileDrawer={true}
                        />
                    </div>
                </div>
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
            <div className={`flex-1 flex flex-col h-screen overflow-hidden relative ${design.globalBackgroundImageUrl ? 'bg-transparent' : 'bg-[var(--theme-body)]'}`}>
                
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
                        startResizing={shell.startResizingTopbar}
                    />
                )}

                {/* MAIN CONTENT CANVAS */}
                <div ref={contentRef} className="flex-1 relative min-h-0 min-w-0 flex flex-col" data-sx-texture={design?.texture || 'none'}>
                    <ErrorBoundary fallback={<div className="sarak-critical-error">Falha Industrial detectada no Módulo. Reiniciando Engine...</div>}>
                        <React.Suspense fallback={<div className="sarak-loader">Sincronizando DNA Industrial...</div>}>
                            {isReady ? (
                                <ShellContent 
                                    activeModule={shell.activeModule}
                                    discoveredModules={shell.discoveredModules}
                                    design={design}
                                    user={user}
                                    authApi={authApi}
                                    setIsSearchOpen={shell.setIsSearchOpen}
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-[var(--theme-primary)] opacity-50 animate-pulse border-2 border-dashed border-[var(--theme-primary)] m-4 rounded-xl">
                                    <div className="text-xl font-bold mb-2">Estabilizando Ambiente Industrial...</div>
                                    <div className="text-xs font-mono">Monitorando Layout: {Math.round(dimensions.w)}x{Math.round(dimensions.h)}</div>
                                    <div className="text-[10px] mt-4 opacity-30 italic">v10.1.10 Diagnostic Active</div>
                                </div>
                            )}
                        </React.Suspense>
                    </ErrorBoundary>
                </div>
            </div>

            <SarakSearch isOpen={shell.isSearchOpen} onClose={() => shell.setIsSearchOpen(false)} />
        </div>
    );
};

export default SarakShell;
