import React, { ReactNode, useState, useEffect, useMemo, useCallback } from 'react';
import { useSarak, getRegisteredModules, SarakModule, LAYOUTS } from '@sarak/lib-shared';
import * as LucideIcons from 'lucide-react';
import { 
    LogOut, User, Menu, X, ChevronRight, LayoutDashboard, 
    ChevronLeft, Settings, Search, Bell, Monitor, Zap
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

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
}

/**
 * Elite SarakShell (v5.4 Restoration) — Motor de Interface Modular Premium
 * Suporta Sidebar (Resizable), Topbar, Nav Hiding e Recovery System.
 * Corrigido para evitar clipping e permitir scroll de conteúdos longos.
 */
export const SarakShell: React.FC<SarakShellProps> = ({ 
    children, 
    brand = { name: "Sarak Matrix" },
    extraToolbarItems
}) => {
    const { 
        user, logout, theme, navigationStyle, isNavHidden, toggleNav,
        sidebarWidth, setSidebarWidth 
    } = useSarak();
    
    const [modules, setModules] = useState<SarakModule[]>([]);
    const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
    const [isResizing, setIsResizing] = useState(false);

    // Carrega módulos registrados no boot
    useEffect(() => {
        const discovered = getRegisteredModules();
        setModules(discovered);
        if (discovered.length > 0 && !activeModuleId) {
            // Prioridade para o módulo "customization" se existir
            const customMod = discovered.find(m => m.id === 'mx-customization');
            setActiveModuleId(customMod ? customMod.id : discovered[0].id);
        }
    }, [activeModuleId]);

    // Atalhos Globais (Alt+N para toggle nav)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.altKey && e.key === 'n') {
                e.preventDefault();
                toggleNav();
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

    const activeModule = useMemo(() => modules.find(m => m.id === activeModuleId), [modules, activeModuleId]);
    
    // Grupar módulos por categoria
    const groupedModules = useMemo(() => {
        return modules.reduce((acc, mod) => {
            const cat = mod.category || 'Módulos de Sistema';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(mod);
            return acc;
        }, {} as Record<string, SarakModule[]>);
    }, [modules]);

    const isTopbar = navigationStyle === 'topbar';
    const isSidebar = !isTopbar;

    return (
        <div className="flex w-full h-screen overflow-hidden bg-[var(--theme-body)] text-white font-sans selection:bg-[var(--theme-primary)] selection:text-white">
            
            {/* SIDEBAR NAVIGATION (Desktop) */}
            {isSidebar && !isNavHidden && (
                <aside 
                    style={{ width: `${sidebarWidth}px` }}
                    className="h-screen bg-[var(--theme-sidebar)] border-r border-[var(--theme-border)] flex flex-col shrink-0 relative z-50 transition-all duration-300 shadow-2xl"
                >
                    {/* Header Sidebar */}
                    <div className="h-16 px-6 flex items-center justify-between border-b border-[var(--theme-border)] bg-[var(--theme-title)]/5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--theme-primary)] to-indigo-600 flex items-center justify-center font-black text-xs text-white">S</div>
                            <span className="text-sm font-bold tracking-tighter opacity-80 text-[var(--theme-title)]">{brand.name}</span>
                        </div>
                        <button onClick={toggleNav} className="p-1.5 hover:bg-white/5 rounded-md text-white/20 hover:text-white transition-colors">
                            <ChevronLeft size={16} />
                        </button>
                    </div>

                    {/* Módulos */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                        {Object.entries(groupedModules).map(([category, mods]) => (
                            <div key={category}>
                                <h4 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-3 px-3">{category}</h4>
                                <div className="space-y-1">
                                    {mods.map(mod => (
                                        <button
                                            key={mod.id}
                                            onClick={() => setActiveModuleId(mod.id)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative group ${
                                                activeModuleId === mod.id 
                                                ? 'bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] font-bold shadow-[inset_0_0_20px_rgba(59,130,246,0.05)]' 
                                                : 'text-white/40 hover:bg-white/5 hover:text-white'
                                            }`}
                                        >
                                            <IconRenderer name={mod.icon} className={activeModuleId === mod.id ? 'text-[var(--theme-primary)]' : 'text-[var(--theme-muted)]'} />
                                            <span className="text-sm truncate">{mod.label}</span>
                                            {activeModuleId === mod.id && (
                                                <motion.div 
                                                    layoutId="active-pill" 
                                                    className="absolute left-0 w-1 h-4 bg-[var(--theme-primary)] rounded-full shadow-[0_0_15px_var(--theme-primary)]" 
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Perfil Simplificado na Base */}
                    <div className="p-4 border-t border-white/5 bg-white/[0.01]">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                                    <User size={14} className="text-blue-400" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-white/80">{user?.email?.split('@')[0] || 'Sarak User'}</span>
                                    <span className="text-[9px] text-white/30 uppercase tracking-widest">{user?.role || 'Guest'}</span>
                                </div>
                            </div>
                            <button onClick={logout} className="p-2 text-white/20 hover:text-red-400 transition-colors">
                                <LogOut size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Resize Handle */}
                    <div 
                        onMouseDown={startResizing}
                        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[var(--theme-primary)]/50 transition-colors z-[60]"
                    />
                </aside>
            )}

            {/* CONTENT AREA */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative bg-[var(--theme-body)]">
                
                {/* HEADER (Topbar Style or Sidebar Header) */}
                {(isTopbar || (!isNavHidden && isSidebar) || (isNavHidden && isSidebar)) && (
                    <header className={`h-16 border-b border-[var(--theme-border)] bg-[var(--theme-card)] backdrop-blur-2xl px-6 flex items-center justify-between z-[45] shrink-0`}>
                        <div className="flex items-center gap-6">
                            {(isTopbar || isNavHidden) && (
                                <div className="flex items-center gap-4">
                                    {isNavHidden && isSidebar && (
                                        <button onClick={toggleNav} className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-white transition-all mr-2">
                                            <Menu size={18} />
                                        </button>
                                    )}
                                    <div className="flex items-center gap-3 pr-6 border-r border-white/5">
                                        <div className="w-8 h-8 rounded-lg bg-[var(--theme-primary)] flex items-center justify-center font-bold text-xs">S</div>
                                        <span className="font-black tracking-tighter text-sm uppercase italic">{brand.name}</span>
                                    </div>
                                </div>
                            )}
                            
                            {/* Horizontal Modules (Topbar Style) */}
                            {isTopbar && (
                                <nav className="hidden lg:flex items-center gap-1">
                                    {modules.slice(0, 8).map(mod => (
                                        <button
                                            key={mod.id}
                                            onClick={() => setActiveModuleId(mod.id)}
                                            className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                                                activeModuleId === mod.id ? 'bg-[var(--theme-primary)] text-white shadow-lg shadow-[var(--theme-primary)]/30' : 'text-white/40 hover:text-white'
                                            }`}
                                        >
                                            {mod.label}
                                        </button>
                                    ))}
                                </nav>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                                <ThemeToggle />
                                {extraToolbarItems}
                            </div>
                            <div className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors cursor-pointer">
                                <Bell size={14} />
                            </div>
                            {isTopbar && (
                                <button onClick={logout} className="p-2 hover:bg-red-500/20 rounded-lg text-white/20 hover:text-red-400 transition-colors">
                                    <LogOut size={18} />
                                </button>
                            )}
                        </div>
                    </header>
                )}

                {/* MAIN CONTENT CANVAS - FIXED SCROLL ENGINE */}
                <main className="flex-1 overflow-y-auto custom-scrollbar relative flex flex-col w-full min-h-0 bg-[var(--theme-body)]">
                    <div className="absolute inset-0 pointer-events-none opacity-[0.02] texture-grid"></div>
                    
                    <div className="flex-1 flex flex-col relative w-full pt-8 lg:pt-12">
                        <AnimatePresence mode="wait">
                            {activeModule ? (
                                <motion.div
                                    key={activeModule.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="px-8 lg:px-12 pb-12 flex flex-col min-h-full"
                                >
                                    <header className="mb-10 flex items-end justify-between border-b border-white/5 pb-8 shrink-0">
                                        <div>
                                            <div className="flex items-center gap-3 text-[var(--theme-primary)] mb-2">
                                                <div className="p-2 rounded-lg bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                                                    <IconRenderer name={activeModule.icon} size={20} />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">{activeModule.category || 'Módulo'}</span>
                                            </div>
                                            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-[var(--theme-title)] uppercase">{activeModule.label}</h1>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-[var(--theme-primary)]/50 transition-all text-white/40 hover:text-[var(--theme-primary)]">
                                                <Search size={18} />
                                            </button>
                                            <button className="hidden sm:flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--theme-primary)] hover:opacity-90 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-[var(--theme-primary)]/20">
                                                <Zap size={14} className="fill-current" />
                                                Novo Registro
                                            </button>
                                        </div>
                                    </header>

                                    <div className="flex-1 animate-in fade-in zoom-in-95 duration-700">
                                        <activeModule.component />
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-white/5 gap-10">
                                    <div className="relative">
                                        <div className="w-48 h-48 border-2 border-dashed border-white/5 rounded-full flex items-center justify-center animate-spin-slow">
                                            <div className="w-32 h-32 border-2 border-dashed border-white/5 rounded-full" />
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-4 h-4 bg-[var(--theme-primary)] rounded-full animate-pulse shadow-[0_0_20px_var(--theme-primary)]" />
                                        </div>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <span className="block text-[10px] font-black uppercase tracking-[1em] opacity-40">Sarak Matrix Engine</span>
                                        <span className="block text-[8px] font-black uppercase tracking-[0.5em] opacity-10 italic">Initializing sovereign core v5.4.1</span>
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </main>
            </div>

            <style>{`
                .animate-spin-slow { animation: spin 12s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .texture-grid {
                    background-image: linear-gradient(var(--theme-border) 1px, transparent 1px),
                                      linear-gradient(90deg, var(--theme-border) 1px, transparent 1px);
                    background-size: 40px 40px;
                }
            `}</style>
        </div>
    );
};

export default SarakShell;
