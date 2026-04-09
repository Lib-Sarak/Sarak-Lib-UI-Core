import React from 'react';
import { useSarakUI } from '../SarakUIProvider';
import { getRegisteredModules } from '@sarak/lib-shared';
import { Settings, Cpu, HardDrive, RefreshCw, Zap, Shield, HelpCircle, Activity } from 'lucide-react';

export const AdvancedTab: React.FC = () => {
    const { effective: sarak } = useSarakUI();
    
    // Destruturação com fallbacks para modo standalone
    const systemId = (sarak as any).systemId || 'STANDALONE-MODE';
    const isHydrated = (sarak as any).isHydrated ?? true;
    const registeredModules = (sarak as any).registeredModules || getRegisteredModules();

    const [isResetting, setIsResetting] = useState(false);

    const handleHardReset = () => {
        if (confirm("ATENÇÃO: Isso restaurará TODAS as configurações visuais para o padrão de fábrica. Continuar?")) {
            setIsResetting(true);
            setTimeout(() => {
                localStorage.clear();
                window.location.reload();
            }, 1000);
        }
    };

    const stats = [
        { label: 'ID do Sistema', value: systemId, icon: Shield },
        { label: 'Status da Engine', value: isHydrated ? 'HIDRATADA' : 'INICIALIZANDO', icon: Activity, color: isHydrated ? 'text-emerald-400' : 'text-amber-400' },
        { label: 'Módulos Ativos', value: registeredModules.length.toString(), icon: Cpu },
        { label: 'SDT Version', value: 'v1.0 (Elite)', icon: Zap },
    ];

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500 overflow-y-auto custom-scrollbar p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* ENGINE STATUS */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                            <Settings className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest italic text-white/90">Sovereign Engine Status</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {stats.map((stat, i) => (
                            <div key={i} className="flex flex-col gap-2 p-4 rounded-2xl bg-white/5 border border-white/5">
                                <div className="flex items-center gap-2 text-white/20">
                                    <stat.icon className="w-3.5 h-3.5" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">{stat.label}</span>
                                </div>
                                <span className={`text-xs font-mono font-bold tracking-tight ${stat.color || 'text-white/70'}`}>{stat.value}</span>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-4">
                        <HelpCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-1" />
                        <div className="space-y-2">
                            <h4 className="text-[10px] font-bold text-white/80 uppercase">Sobre a Sarak Matrix v5.0</h4>
                            <p className="text-[9px] text-white/40 leading-relaxed uppercase font-medium">
                                O Motor Elite SDT gerencia 100% da visualidade através de tokens source-driven. 
                                Qualquer alteração aqui reflete em todos os módulos registrados instantaneamente via Context Bridge.
                            </p>
                        </div>
                    </div>
                </div>

                {/* MANUTENÇÃO & SEGURANÇA */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
                            <Shield className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest italic text-white/90">Gestão de Persistência</h3>
                    </div>

                    <div className="p-6 rounded-3xl bg-rose-500/5 border border-rose-500/10 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-rose-500 rounded-2xl text-white shadow-lg shadow-rose-900/20">
                                <HardDrive className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-widest text-white/90">Factory Hard Reset</h4>
                                <p className="text-[9px] text-white/30 uppercase font-medium">Limpar cache local e configurações de tema</p>
                            </div>
                        </div>

                        <button
                            onClick={handleHardReset}
                            disabled={isResetting}
                            className="w-full py-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 transition-all duration-300 flex items-center justify-center gap-3 group disabled:opacity-50"
                        >
                            {isResetting ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                            )}
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Restaurar Padrões</span>
                        </button>

                        <div className="text-center">
                            <span className="text-[8px] text-white/10 uppercase font-black tracking-widest">Ação Irreversível • Sincronize com a Nuvem Antes</span>
                        </div>
                    </div>

                    {/* API SYNC */}
                    <div className="space-y-4 pt-4">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                            <span>Sincronização Cloud</span>
                            <span className="text-emerald-400">Ativa (v2)</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full w-full bg-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvancedTab;
