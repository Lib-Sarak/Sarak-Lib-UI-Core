import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useSarakShell } from './useSarakShell';
import { SidebarNav } from './Components/SidebarNav';
import { TopbarNav } from './Components/TopbarNav';
import { DockNav } from './Components/DockNav';
import { ShellContent } from './Components/ShellContent';
import SarakSearch from '../../components/atomic/Inputs/SarakSearch';
import { SarakShellProps } from './Components/types';

import { useSarakUI } from '../Provider/SarakUIProvider';

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
        <div className="p-8 text-red-500 bg-red-900/20 border border-red-500/50 rounded-lg">
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

    // --- DIMENSION GUARD (v10.1.8 Industrial Stability) ---
    const [isReady, setIsReady] = React.useState(false);
    const contentRef = React.useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = React.useState({ w: 0, h: 0 });

    React.useEffect(() => {
        if (!contentRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                setDimensions({ w: width, h: height });
                
                if (width > 0 && height > 0) {
                    if (!isReady) {
                        console.log(`%c[Sarak:Shell] Dimension Guard: Layout Estabilizado (${Math.round(width)}x${Math.round(height)})`, "color: #00f2ff; font-weight: bold;");
                        setIsReady(true);
                    }
                } else {
                    if (isReady) {
                        console.warn("[Sarak:Shell] Dimension Guard: Container perdeu dimensões. Suspendendo renderização de módulos.");
                        setIsReady(false);
                    }
                }
            }
        });

        observer.observe(contentRef.current);
        return () => observer.disconnect();
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
                <div ref={contentRef} className="flex-1 relative min-h-0 min-w-0">
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
                                <div className="flex flex-col items-center justify-center h-full text-[var(--theme-primary)] opacity-50 animate-pulse">
                                    <div className="text-xl font-bold mb-2">Estabilizando Ambiente Industrial...</div>
                                    <div className="text-xs font-mono">Aguardando Dimensões: {Math.round(dimensions.w)}x{Math.round(dimensions.h)}</div>
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
