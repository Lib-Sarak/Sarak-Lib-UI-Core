import React, { useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { LAYOUTS } from '../constants/design-tokens';
import { useModuleDiscovery } from '../shared/hooks/useModuleDiscovery';
import { DiscoveredModule } from '../constants/discovery';
import * as LucideIcons from 'lucide-react';
import { 
    LogOut, User, Menu, X, ChevronRight, LayoutDashboard, 
    ChevronLeft, Settings, Search, Bell, Monitor, Zap
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useSarakUI } from './SarakUIProvider';
import { motion, AnimatePresence } from 'framer-motion';
import SarakCursor from './SarakCursor';
import SarakSearch from './SarakSearch';
import { SarakEmptyState } from './SarakEmptyState';

// Helper para renderizar ícone Lucide dinamicamente
const IconRenderer = ({ name, className, size = 16 }: { name?: string, className?: string, size?: number }) => {
    if (!name) return <LayoutDashboard size={size} className={className} />;
    const IconComponent = (LucideIcons as any)[name];
    return IconComponent ? <IconComponent size={size} className={className} /> : <LayoutDashboard size={size} className={className} />;
};

interface SarakShellProps {
    children?: ReactNode;
    brand?: {
        name?: string;
        logo?: string;
    };
    extraToolbarItems?: ReactNode;
    // Injected Auth Props (v5.6)
    user?: any;
    logout?: () => void;
    token?: string;
    authApi?: any;
}

/**
 * Elite SarakShell (v6.2 Final) — Motor de Interface Modular Premium
 */
export const SarakShell: React.FC<SarakShellProps> = ({ 
    children, 
    brand = { name: "Sarak Matrix" },
    extraToolbarItems,
    user,
    logout,
    token,
    authApi
}) => {
    const { design, applyConfig, discoveryEndpoints } = useSarakUI();
    const loggedIn = !!token;
    
    // Destruturação direta do motor visual (Nomes oficiais v6.1)
    const { 
        layout: theme, mode, primaryColor, layoutDensity, 
        texture, navigationStyle, sidebarWidth, headingFont, 
        subtitleFont, tabFont, bodyFont, headingWeight, headingLetterSpacing,
        borderRadius, borderWidth, borderStyle, glassOpacity, glassBlur, shadowIntensity,
        isGeometricCut, textureOpacity, animationSpeed, layoutGap,
        systemName, logoUrl, logoDarkUrl, logoScale, logoPosition,
        systemTone, surfaceMaterial, borderType, interfaceElasticity,
        isSplitViewEnabled, chartStyle, chartPalette, shadowOrientation,
        shadowColorMode, isAutoHideEnabled, searchStyle,
        cursorPhysics, isNavHidden
    } = design || {};

    // Fallbacks para funções de estado/shared
    const toggleNav = () => applyConfig({ isNavHidden: !isNavHidden });
    const setSidebarWidth = (w: number) => applyConfig({ sidebarWidth: w });
    const secondaryModuleId = design?.secondaryModuleId;
    const emptyStateId = design?.emptyStateId || 'default';
    
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isNavVisible, setIsNavVisible] = useState(true);
    
    const { modules: discoveredModules, isLoading: isDiscovering } = useModuleDiscovery(loggedIn);
    const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
    const [isResizing, setIsResizing] = useState(false);

    // MOUSE TRACKING MOTOR (v6.2 Premium Effects) - Propaga coordenadas globais para cards
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

    // Gerencia o módulo ativo com base na descoberta
    useEffect(() => {
        if (discoveredModules.length > 0 && !activeModuleId) {
            const customMod = discoveredModules.find(m => m.id === 'mx-customization');
            setActiveModuleId(customMod ? customMod.id : discoveredModules[0].id);
        }
    }, [discoveredModules, activeModuleId]);

    // Atalhos Globais
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

    // Resizing Logic para Sidebar
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
            const cat = mod.category || 'Módulos de Sistema';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(mod);
            return acc;
        }, {} as Record<string, DiscoveredModule[]>);
    }, [discoveredModules]);

    const isTopbar = navigationStyle === 'topbar';
    const isSidebar = navigationStyle === 'sidebar';
    const isDock = navigationStyle === 'dock';

    return (
        <div className="flex w-full h-screen overflow-hidden bg-[var(--theme-body)] text-white font-sans selection:bg-[var(--theme-primary)] selection:text-white">
            
            {/* HOVER SENSORS (v6.2) - Ativadores de borda para barras ocultas */}
            {isAutoHideEnabled && !isNavVisible && (
                <>
                    {isSidebar && (
                        <div 
                            onMouseEnter={() => setIsNavVisible(true)}
                            className="fixed left-0 top-0 w-4 h-full z-[1000] cursor-pointer"
                        />
                    )}
                    {isDock && (
                        <div 
                            onMouseEnter={() => setIsNavVisible(true)}
                            className="fixed bottom-0 left-0 w-full h-8 z-[1000] cursor-pointer"
                        />
                    )}
                </>
            )}

            {/* SIDEBAR NAVIGATION */}
            {isSidebar && (
                <aside 
                    onMouseEnter={() => setIsNavVisible(true)}
                    onMouseLeave={() => isAutoHideEnabled && setIsNavVisible(false)}
                    style={{ 
                        width: isNavHidden || (isAutoHideEnabled && !isNavVisible) ? '0px' : `${sidebarWidth}px`,
                        opacity: isNavHidden || (isAutoHideEnabled && !isNavVisible) ? 0 : 1,
                        visibility: isNavHidden || (isAutoHideEnabled && !isNavVisible) ? 'hidden' : 'visible',
                        transition: `all ${animationSpeed}s cubic-bezier(0.16, 1, 0.3, 1)`
                    }}
                    className="h-screen sarak-shell-sidebar bg-[var(--theme-sidebar)] border-r border-[var(--theme-border)] flex flex-col shrink-0 relative z-[100] shadow-2xl overflow-hidden"
                >
                    <div className="h-16 sarak-shell-header px-6 flex items-center justify-between border-b border-[var(--theme-border)] bg-[var(--theme-title)]/5">
                        <div className={`flex items-center gap-3 w-full ${logoPosition === 'center' ? 'justify-center' : ''}`}>
                            {logoUrl ? (
                                <img src={mode === 'dark' && logoDarkUrl ? logoDarkUrl : logoUrl} alt={systemName} style={{ transform: `scale(${logoScale})`, transformOrigin: logoPosition === 'center' ? 'center' : 'left' }} className="max-h-8 object-contain transition-transform" />
                            ) : (
                                <div className="w-8 h-8 rounded-[var(--radius-theme)] bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-primary-rgb),0.5] flex items-center justify-center font-black text-xs text-white shrink-0">S</div>
                            )}
                            <span className="text-sm font-bold tracking-tighter opacity-80 text-[var(--theme-title)] truncate">{systemName || brand.name}</span>
                        </div>
                        {logoPosition !== 'center' && (
                            <button onClick={toggleNav} className="p-1.5 hover:bg-white/5 rounded-md text-white/20 hover:text-white transition-colors">
                                <ChevronLeft size={16} />
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                        {Object.entries(groupedModules).map(([category, mods]) => (
                            <div key={category}>
                                <h4 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-3 px-3">{category}</h4>
                                <div className="space-y-1">
                                    {mods.map(mod => {
                                        const isOffline = mod.status === 'offline';
                                        return (
                                            <button 
                                                key={mod.id} 
                                                onClick={() => !isOffline && setActiveModuleId(mod.id)} 
                                                disabled={isOffline}
                                                title={isOffline ? `Módulo Offline: ${mod.error || 'Erro de conexão'}` : mod.label}
                                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative group font-tab 
                                                    ${activeModuleId === mod.id ? 'bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] font-bold shadow-[inset_0_0_20px_rgba(59,130,246,0.05)]' : 'text-white/40 hover:bg-white/5 hover:text-white'}
                                                    ${isOffline ? 'opacity-30 grayscale cursor-not-allowed border border-dashed border-white/5' : ''}
                                                `}
                                            >
                                                <IconRenderer name={mod.icon} className={activeModuleId === mod.id ? 'text-[var(--theme-primary)]' : 'text-[var(--theme-muted)]'} />
                                                <div className="flex flex-col items-start overflow-hidden">
                                                    <span className="text-sm truncate">{mod.label}</span>
                                                    {isOffline && <span className="text-[8px] text-red-500 font-bold uppercase tracking-wider">Serviço Offline</span>}
                                                </div>
                                                {activeModuleId === mod.id && <motion.div layoutId="active-pill" className="absolute left-0 w-1 h-4 bg-[var(--theme-primary)] rounded-full shadow-[0_0_15px_var(--theme-primary)]" />}
                                                {isOffline && <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_5px_red]" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 border-t border-[var(--theme-border)] bg-[var(--theme-card)]/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[var(--theme-primary)]/20 border border-[var(--theme-primary)]/30 flex items-center justify-center text-[var(--theme-primary)]"><User size={14} /></div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-[var(--theme-title)]/80">{user?.email?.split('@')[0] || 'Sarak User'}</span>
                                    <span className="text-[9px] text-[var(--theme-muted)] uppercase tracking-widest">{user?.role || 'Guest'}</span>
                                </div>
                            </div>
                            <button onClick={logout} className="p-2 text-[var(--theme-muted)] hover:text-red-400 transition-colors"><LogOut size={14} /></button>
                        </div>
                    </div>
                    <div onMouseDown={startResizing} className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[var(--theme-primary)]/50 transition-colors z-[60]" />
                </aside>
            )}

            {/* DOCK NAVIGATION */}
            {isDock && (
                <AnimatePresence>
                    {(isNavVisible || !isAutoHideEnabled) && (
                        <motion.div initial={{ y: 100, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 100, opacity: 0, scale: 0.9 }} transition={{ duration: animationSpeed, ease: "circOut" }} onMouseEnter={() => setIsNavVisible(true)} onMouseLeave={() => isAutoHideEnabled && setIsNavVisible(false)} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[500] flex items-center gap-2 p-2 rounded-[var(--radius-theme)] bg-[var(--theme-card)]/40 backdrop-blur-[var(--glass-blur)] border border-[var(--theme-border)] shadow-[var(--dynamic-shadow)] group/dock">
                            {discoveredModules.filter(m => m.status === 'online').slice(0, 7).map((mod, i) => (
                                <motion.button key={mod.id} whileHover={{ scale: 1.25, y: -12 }} transition={{ type: "spring", stiffness: 400, damping: 17 }} onClick={() => setActiveModuleId(mod.id)} className={`w-12 h-12 rounded-[calc(var(--radius-theme)*0.8)] flex items-center justify-center transition-all ${activeModuleId === mod.id ? 'bg-[var(--theme-primary)] text-white shadow-[0_0_20px_rgba(var(--theme-primary-rgb),0.3)]' : 'text-[var(--theme-muted)] hover:text-white hover:bg-white/5'}`}>
                                    <IconRenderer name={mod.icon} size={22} />
                                </motion.button>
                            ))}
                            <div className="w-px h-8 bg-[var(--theme-border)] mx-1" />
                            <motion.button whileHover={{ scale: 1.25, y: -12 }} transition={{ type: "spring", stiffness: 400, damping: 17 }} onClick={() => setIsSearchOpen(true)} className="w-12 h-12 rounded-[calc(var(--radius-theme)*0.8)] flex items-center justify-center text-[var(--theme-muted)] hover:text-white hover:bg-white/5"><Search size={22} /></motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}

            {/* CONTENT AREA */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative bg-[var(--theme-body)]">
                
                {/* SHELL HEADER */}
                {(isTopbar || isSidebar) && (
                    <header className={`h-16 border-b border-[var(--theme-border)] bg-[var(--theme-card)] backdrop-blur-2xl px-6 flex items-center justify-between z-[45] shrink-0`}>
                        <div className="flex items-center gap-6">
                            {(isTopbar || (isSidebar && isNavHidden)) && (
                                <div className="flex items-center gap-4">
                                    {isNavHidden && isSidebar && (
                                        <button onClick={toggleNav} className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-white transition-all mr-2"><Menu size={18} /></button>
                                    )}
                                    <div className={`flex items-center gap-3 pr-6 border-r border-white/5 ${logoPosition === 'center' ? 'mx-auto' : ''}`}>
                                        {logoUrl ? (
                                            <img src={mode === 'dark' && logoDarkUrl ? logoDarkUrl : logoUrl} alt={systemName} style={{ transform: `scale(${logoScale})` }} className="max-h-8 object-contain transition-transform" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-lg bg-[var(--theme-primary)] flex items-center justify-center font-bold text-xs shrink-0">S</div>
                                        )}
                                        <span className="font-black tracking-tighter text-sm uppercase italic truncate">{systemName || brand.name}</span>
                                    </div>
                                </div>
                            )}
                            
                            {isTopbar && (
                                <nav className="hidden lg:flex items-center gap-1">
                                    {discoveredModules.filter(m => m.status === 'online').slice(0, 8).map(mod => (
                                        <button key={mod.id} onClick={() => setActiveModuleId(mod.id)} className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all font-tab ${activeModuleId === mod.id ? 'bg-[var(--theme-primary)] text-white shadow-lg shadow-[var(--theme-primary)]/30' : 'text-white/40 hover:text-white'}`}>{mod.label}</button>
                                    ))}
                                </nav>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            {/* SEARCH INLINE HEAD (v6.2) */}
                            {searchStyle === 'minimal' && (
                                <div className="hidden md:flex items-center w-64 group relative">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-muted)] group-focus-within:text-[var(--theme-primary)] transition-colors" />
                                    <input type="text" placeholder="Busca Smart..." onClick={() => setIsSearchOpen(true)} readOnly className="w-full h-9 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-[var(--radius-theme)] pl-10 pr-4 text-[11px] font-bold text-[var(--theme-title)]/60 hover:bg-white/[0.08] hover:border-[var(--theme-primary)]/50 transition-all cursor-pointer" />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] text-white/20 font-black opacity-0 group-hover:opacity-100"><span>CTRL</span><span>K</span></div>
                                </div>
                            )}
                            
                            <div className="flex items-center gap-1 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                                <ThemeToggle />
                                {searchStyle !== 'minimal' && (
                                    <button onClick={() => setIsSearchOpen(true)} className="p-2 text-white/20 hover:text-white transition-colors"><Search size={16} /></button>
                                )}
                                {extraToolbarItems}
                            </div>
                            <div className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors cursor-pointer"><Bell size={14} /></div>
                        </div>
                    </header>
                )}

                {/* MAIN CONTENT CANVAS */}
                <main className="flex-1 overflow-y-auto custom-scrollbar relative flex flex-col w-full min-h-0 bg-[var(--theme-body)] isolate">
                    {/* SarakAtmosphereLayer (Soberania de Textura v6.7) */}
                    <div className={`absolute inset-0 pointer-events-none z-0 texture-${texture} SarakAtmosphereLayer`} />

                    
                    <div className="flex-1 flex flex-col relative w-full pt-8 lg:pt-12 z-10" style={{ gap: `var(--theme-gap, ${layoutGap}px)` }}>
                        <AnimatePresence mode="wait">
                            {activeModule ? (
                                <motion.div key={activeModule.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="pb-12 flex flex-col min-h-full" style={{ paddingLeft: 'var(--theme-pad)', paddingRight: 'var(--theme-pad)' }}>
                                    
                                    <header className="mb-10 flex items-end justify-between border-b border-[var(--theme-border)]/50 pb-8 shrink-0">
                                        <div>
                                            <div className="flex items-center gap-3 text-[var(--theme-primary)] mb-2">
                                                <div className="p-2 rounded-[var(--radius-theme)] bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/20 shadow-[0_0_15px_rgba(var(--theme-primary-rgb),0.1)]"><IconRenderer name={activeModule.icon} size={20} /></div>
                                                <span className="text-[10px] font-black uppercase tracking-[0.4em] italic opacity-60 text-[var(--theme-muted)]">{activeModule.category || 'Módulo'}</span>
                                            </div>
                                            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-[var(--theme-title)] uppercase">{activeModule.label}</h1>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setIsSearchOpen(true)} className="p-3 rounded-[var(--radius-theme)] bg-[var(--theme-card)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)]/50 transition-all text-[var(--theme-muted)] hover:text-[var(--theme-primary)]"><Search size={18} /></button>
                                            <button className="hidden sm:flex items-center gap-2 px-6 py-3 rounded-[var(--radius-theme)] bg-[var(--theme-primary)] hover:opacity-90 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-[var(--theme-primary)]/20 text-center"><Zap size={14} className="fill-current" /> Novo Registro</button>
                                        </div>
                                    </header>

                                    <div className={`flex-1 ${isSplitViewEnabled ? 'grid grid-cols-2 gap-[var(--theme-gap)]' : 'flex flex-col'} animate-in fade-in zoom-in-95 duration-700`}>
                                        <div className="flex flex-col min-h-full">
                                            {(() => {
                                                const ModComponent = (activeModule as any)?.component;
                                                return ModComponent ? (
                                                    <ModComponent 
                                                        modules={discoveredModules} 
                                                        user={user}
                                                        authApi={authApi}
                                                    />
                                                ) : <div className="opacity-20 flex items-center justify-center h-full text-[var(--theme-muted)] uppercase font-black text-xs tracking-widest">Módulo em Modo API (Sem Interface Local)</div>;
                                            })()}

                                        </div>
                                        {isSplitViewEnabled && secondaryModuleId && (
                                            <div className="flex flex-col min-h-full border-l border-[var(--theme-border)]/30 pl-[var(--theme-gap)]">
                                                {(() => {
                                                    const SecMod = (discoveredModules.find(m => m.id === secondaryModuleId) as any)?.component;
                                                    return SecMod ? <SecMod /> : <div className="opacity-20 flex items-center justify-center h-full text-[var(--theme-muted)]">Selecione um módulo secundário</div>;
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div key="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-grow flex flex-col items-center justify-center p-12"><SarakEmptyState type={emptyStateId as any} /></motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </main>
            </div>
            {cursorPhysics && <SarakCursor />}
            <SarakSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </div>
    );
};

export default SarakShell;
