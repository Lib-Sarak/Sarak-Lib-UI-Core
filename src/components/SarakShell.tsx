import React, { ReactNode, useState, useEffect, useMemo, useCallback } from 'react';
import { useSarak, getRegisteredModules, SarakModule, LAYOUTS } from '@sarak/lib-shared';
import * as LucideIcons from 'lucide-react';
import { 
    LogOut, User, Menu, X, ChevronRight, LayoutDashboard, 
    ChevronLeft, Settings, Search, Bell, Monitor, Zap
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { GoogleTranslateWidget, LanguagePicker } from '@sarak/lib-translator-google';
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
}

/**
 * Elite SarakShell (v5.2) — Motor de Interface Modular Premium
 * Suporta Sidebar (Resizable), Topbar, Nav Hiding e Recovery System.
 */
export const SarakShell: React.FC<SarakShellProps> = ({ 
    children, 
    brand = { name: "Sarak Matrix" }
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
        if (discovered.length > 0 && !activeModuleId) setActiveModuleId(discovered[0].id);
    }, []);

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

    // Resizing Logic
    const startResizing = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = useCallback((e: MouseEvent) => {
        if (isResizing) {
            const newWidth = e.clientX;
            if (newWidth > 180 && newWidth < 450) {
                setSidebarWidth(newWidth);
            }
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

    // Grupos de Módulos
    const groupedModules = useMemo(() => {
        const groups: Record<string, SarakModule[]> = {};
        modules.forEach(mod => {
            const cat = mod.category || 'Módulos';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(mod);
        });
        return groups;
    }, [modules]);

    const activeModule = modules.find(m => m.id === activeModuleId);
    const currentLayoutClass = useMemo(() => {
        return Object.values(LAYOUTS).find(l => l.id === theme)?.class || 'layout-glass';
    }, [theme]);

    const isSidebar = navigationStyle === 'sidebar';
    const isTopbar = navigationStyle === 'topbar';

    return (
        <div className={`sarak-shell min-h-screen text-[var(--theme-main)] font-sans selection:bg-[var(--theme-primary)]/30 overflow-hidden flex ${isTopbar ? 'flex-col' : 'flex-row'} ${currentLayoutClass} ${isNavHidden ? 'nav-hidden' : ''}`}>
            <GoogleTranslateWidget />

            {/* Recovery Nav Button (Chevron flutuante quando oculto) */}
            <AnimatePresence>
                {isNavHidden && (
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onClick={toggleNav}
                        className="fixed top-20 left-4 z-[100] w-10 h-10 rounded-full bg-blue-600/20 backdrop-blur-xl border border-blue-500/30 flex items-center justify-center text-blue-400 hover:bg-blue-600/40 transition-all shadow-xl shadow-blue-900/20 group"
                        title="Restaurar Navegação (Alt+N)"
                    >
                        <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* SIDEBAR MODE */}
            {!isNavHidden && isSidebar && (
                <aside 
                    style={{ width: sidebarWidth }}
                    className="h-screen border-r border-[var(--theme-border)] bg-[var(--theme-sidebar)] backdrop-blur-2xl flex flex-col relative z-50 group/sidebar transition-[width] duration-300 ease-in-out"
                >
                    {/* Header da Sidebar */}
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
                                                ? 'bg-blue-600/10 text-blue-400 font-bold' 
                                                : 'text-white/40 hover:bg-white/5 hover:text-white'
                                            }`}
                                        >
                                            <IconRenderer name={mod.icon} className={activeModuleId === mod.id ? 'text-[var(--theme-primary)]' : 'text-[var(--theme-muted)]'} />
                                            <span className="text-sm truncate">{mod.label}</span>
                                            {activeModuleId === mod.id && <motion.div layoutId="active-pill" className="absolute left-0 w-1 h-4 bg-[var(--theme-primary)] rounded-full shadow-[0_0_10px_var(--theme-primary)]" />}
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
                        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500/50 transition-colors z-[60]"
                    />
                </aside>
            )}

            {/* CONTENT AREA */}
                <div className="flex-1 flex flex-col min-h-screen overflow-hidden relative bg-[var(--theme-body)]">
                    
                    {/* TOPBAR MODE OR TOP HEADER (if Sidebar) */}
                    {(isTopbar || !isNavHidden) && (
                        <header className={`h-16 border-b border-[var(--theme-border)] bg-[var(--theme-card)] backdrop-blur-2xl px-6 flex items-center justify-between z-[45] ${isTopbar && isNavHidden ? 'hidden' : ''}`}>
                        <div className="flex items-center gap-6">
                            {isTopbar && (
                                <div className="flex items-center gap-3 pr-6 border-r border-white/5">
                                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xs">S</div>
                                    <span className="font-black tracking-tighter">{brand.name}</span>
                                </div>
                            )}
                            
                            {/* Horizontal Modules (Topbar Style) */}
                            {isTopbar && (
                                <nav className="hidden lg:flex items-center gap-1">
                                    {modules.slice(0, 6).map(mod => (
                                        <button
                                            key={mod.id}
                                            onClick={() => setActiveModuleId(mod.id)}
                                            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                                                activeModuleId === mod.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-white/40 hover:text-white'
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
                                <LanguagePicker />
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

                {/* MAIN CONTENT CANVAS */}
                <main className="flex-1 overflow-hidden relative flex flex-col">
                    <div className="absolute inset-0 pointer-events-none opacity-[0.02] texture-grid"></div>
                    <div className="flex-1 flex flex-col min-h-0 relative">
                        <AnimatePresence mode="wait">
                            {activeModule ? (
                                <motion.div
                                    key={activeModule.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                    className="flex-1"
                                >
                                    <header className="mb-10 flex items-end justify-between border-b border-white/5 pb-8 px-12 pt-12">
                                        <div>
                                            <div className="flex items-center gap-3 text-[var(--theme-primary)] mb-2">
                                                <div className="p-2 rounded-lg bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/20">
                                                    <IconRenderer name={activeModule.icon} size={20} />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">{activeModule.category || 'Módulo'}</span>
                                            </div>
                                            <h1 className="text-4xl font-black tracking-tighter text-[var(--theme-title)]">{activeModule.label}</h1>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 transition-all">
                                                <Search size={16} className="text-white/40" />
                                            </button>
                                            <button className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold transition-all shadow-lg shadow-blue-600/30">
                                                Novo Registro
                                            </button>
                                        </div>
                                    </header>

                                    <div className="flex-1 min-h-0 px-12 pb-12 animate-in fade-in zoom-in-95 duration-700">
                                        <activeModule.component />
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-white/5">
                                    <LayoutDashboard size={80} strokeWidth={1} />
                                    <p className="mt-4 text-xs font-bold tracking-widest uppercase">Selecione um terminal para iniciar</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </main>
            </div>

            {/* Global Overlay Resizing Feedback */}
            {isResizing && <div className="fixed inset-0 z-[9999] cursor-col-resize" />}
        </div>
    );
};

export default SarakShell;
