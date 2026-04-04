import React, { ReactNode, useState, useEffect, useMemo } from 'react';
import { useSarak, getRegisteredModules, SarakModule, LAYOUTS } from '@sarak/lib-shared';
import * as LucideIcons from 'lucide-react';
import { LogOut, User, Menu, X, ChevronRight, LayoutDashboard } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { GoogleTranslateWidget, LanguagePicker } from '@sarak/lib-translator-google';

// Helper para renderizar ícone Lucide dinamicamente
const IconRenderer = ({ name, className }: { name?: string, className?: string }) => {
    if (!name) return <LayoutDashboard className={className} />;
    const IconComponent = (LucideIcons as any)[name];
    return IconComponent ? <IconComponent className={className} /> : <LayoutDashboard className={className} />;
};

interface SarakShellProps {
    children?: ReactNode;
    brand?: {
        name?: string;
        logo?: string;
    };
}

/**
 * Elite SarakShell (v5.2) — Motor de Interface Modular
 * Responsável por renderizar a navegação categorizada e injetar os tokens de design.
 */
export const SarakShell: React.FC<SarakShellProps> = ({ 
    children, 
    brand = { name: "Sarak Matrix" }
}) => {
    const { user, logout, theme, language, setLanguage, setTheme } = useSarak();
    const [modules, setModules] = useState<SarakModule[]>([]);
    const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    // Carrega módulos registrados no momento do boot
    useEffect(() => {
        const discovered = getRegisteredModules();
        setModules(discovered);
        if (discovered.length > 0) setActiveModuleId(discovered[0].id);
    }, []);

    // Agrupa módulos por categoria para navegação organizada (Elite Standard)
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
    
    // Obtém a classe de layout atual (ex: layout-glass, layout-cyberpunk)
    const currentLayoutClass = useMemo(() => {
        return Object.values(LAYOUTS).find(l => l.id === theme)?.class || 'layout-glass';
    }, [theme]);

    return (
        <div className={`sarak-shell min-h-screen text-white font-sans selection:bg-blue-500/30 overflow-hidden flex flex-col ${currentLayoutClass}`}>
            <GoogleTranslateWidget />
            
            {/* Topbar Elite */}
            <header className="h-16 border-b border-white/5 bg-black/40 backdrop-blur-2xl px-6 flex items-center justify-between z-50">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/50 hover:text-white"
                    >
                        {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                    
                    <div className="flex items-center gap-3">
                        {brand.logo ? (
                            <img src={brand.logo} alt="Logo" className="h-8 w-8" />
                        ) : (
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-xs shadow-lg shadow-blue-600/20">S</div>
                        )}
                        <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                            {brand.name}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Controles de Engine */}
                    <div className="flex items-center gap-2 pr-4 border-r border-white/5 mr-2">
                        <ThemeToggle />
                        <LanguagePicker />
                    </div>

                    {/* Perfil do Usuário */}
                    {user ? (
                        <div className="flex items-center gap-3 pl-2 group cursor-pointer">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold text-white/90 leading-tight">{user.email.split('@')[0]}</p>
                                <p className="text-[10px] text-blue-400 font-medium uppercase tracking-tighter leading-none">{user.role}</p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-blue-500/50 transition-colors relative">
                                <User size={18} className="text-white/60" />
                                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0a0a0b] rounded-full"></div>
                            </div>
                            <button 
                                onClick={logout} 
                                className="p-2 text-white/30 hover:text-red-400 transition-colors"
                                title="Sair do Sistema"
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    ) : (
                        <button className="px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-xs font-bold transition-all shadow-lg shadow-blue-600/20">
                            Entrar
                        </button>
                    )}
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Sidebar Categorizada (Auto-Generated Elite) */}
                <aside className={`${isSidebarOpen ? 'w-64' : 'w-0'} border-r border-white/5 bg-black/60 backdrop-blur-xl flex flex-col transition-all duration-300 overflow-hidden`}>
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {Object.entries(groupedModules).map(([category, mods]) => (
                            <div key={category} className="mb-6">
                                <div className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-3 px-3 flex items-center justify-between">
                                    <span>{category}</span>
                                    <ChevronRight size={10} className="opacity-50" />
                                </div>
                                <div className="space-y-1">
                                    {mods.map(mod => (
                                        <button
                                            key={mod.id}
                                            onClick={() => setActiveModuleId(mod.id)}
                                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                                                activeModuleId === mod.id 
                                                ? 'bg-blue-600/10 text-blue-400' 
                                                : 'text-white/50 hover:bg-white/5 hover:text-white'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <IconRenderer 
                                                    name={mod.icon} 
                                                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${activeModuleId === mod.id ? 'text-blue-400' : 'text-white/30'}`} 
                                                />
                                                <span className="text-sm font-medium">{mod.label}</span>
                                            </div>
                                            {activeModuleId === mod.id && (
                                                <div className="w-1 h-4 bg-blue-500 rounded-full absolute left-0 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Botão de Suporte/Config Global */}
                    <div className="p-4 border-t border-white/5 bg-black/20">
                        <button className="w-full flex items-center gap-3 px-3 py-2 text-xs text-white/40 hover:text-white transition-colors">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                            <span>System Status: Online</span>
                        </button>
                    </div>
                </aside>

                {/* Área de Conteúdo Proporcional */}
                <main className="flex-1 overflow-y-auto relative bg-[#0a0a0b] flex flex-col">
                    {/* Background Texture Overlay (Elite CSS Engine) */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03] texture-noise"></div>
                    
                    <div className="max-w-[1600px] min-h-full mx-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 relative z-10 w-full">
                        {activeModule && activeModule.component ? (
                            <activeModule.component />
                        ) : (
                            <div className="flex flex-col items-center justify-center min-h-[60vh] text-white/20 border-2 border-dashed border-white/5 rounded-3xl">
                                <LayoutDashboard size={48} className="mb-4 opacity-10" />
                                <p className="text-sm font-light italic">Selecione um módulo para começar</p>
                                {children}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SarakShell;
