import React, { ReactNode, useState, useEffect } from 'react';
import { useSarak, getRegisteredModules, SarakModule } from '@sarak/lib-shared';

interface SarakShellProps {
    children?: ReactNode;
    brand?: {
        name?: string;
        logo?: string;
    };
}

/**
 * Smart SarakShell â€” Renderiza automaticamente as abas dos mÃ³dulos registrados.
 * NÃ£o requer configuraÃ§Ã£o de navegaÃ§Ã£o manual no microsserviÃ§o.
 */
export const SarakShell: React.FC<SarakShellProps> = ({ 
    children, 
    brand = { name: "Sarak OS" }
}) => {
    const { user, logout } = useSarak();
    const [modules, setModules] = useState<SarakModule[]>([]);
    const [activeModuleId, setActiveModuleId] = useState<string | null>(null);

    // Carrega mÃ³dulos registrados no momento do boot
    useEffect(() => {
        const discovered = getRegisteredModules();
        setModules(discovered);
        if (discovered.length > 0) setActiveModuleId(discovered[0].id);
    }, []);

    const activeModule = modules.find(m => m.id === activeModuleId);

    return (
        <div className="sarak-shell min-h-screen bg-[#0a0a0b] text-white font-sans selection:bg-blue-500/30 overflow-hidden flex flex-col">
            {/* Topbar */}
            <header className="h-16 border-b border-white/5 bg-[#0a0a0b]/80 backdrop-blur-xl px-6 flex items-center justify-between z-50">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        {brand.logo && <img src={brand.logo} alt="Logo" className="h-8 w-8" />}
                        <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                            {brand.name}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {user && (
                        <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                            <span className="text-xs text-blue-400 font-medium">{user.role}</span>
                            <span className="text-sm font-light text-white/70">{user.email}</span>
                            <button onClick={logout} className="text-xs text-red-400 hover:text-red-300 transition-colors uppercase tracking-wider font-bold ml-2">Sair</button>
                        </div>
                    )}
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Lateral Navigation (Auto-Generated) */}
                <aside className="w-64 border-r border-white/5 bg-[#0f0f11] flex flex-col p-4 gap-2">
                    <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4 px-2">MÃ³dulos Ativos</div>
                    {modules.map(mod => (
                        <button
                            key={mod.id}
                            onClick={() => setActiveModuleId(mod.id)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                                activeModuleId === mod.id 
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                                : 'text-white/50 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <span className="text-sm font-medium">{mod.label}</span>
                        </button>
                    ))}
                </aside>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-8 relative bg-gradient-to-tr from-[#0a0a0b] via-[#0a0a0b] to-[#111116]">
                    <div className="max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {activeModule && activeModule.component ? (
                            <activeModule.component />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-white/30 border-2 border-dashed border-white/5 rounded-2xl">
                                <p className="text-sm font-light italic">Módulo selecionado mas sem interface implementada.</p>
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
