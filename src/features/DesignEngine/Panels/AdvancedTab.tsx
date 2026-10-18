import React, { useState } from 'react';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { clearSarakStorage } from '../../../core/Provider/utils/storage';
import { Settings, HardDrive, RefreshCw, Zap, Shield, HelpCircle, Activity } from 'lucide-react';

/** Respiro entre o clique e o reload, para a animação de "resetando" ser vista. */
const RESET_DELAY_MS = 1000;

export const AdvancedTab: React.FC = () => {
    const sarak = useSarakUI() as ReturnType<typeof useSarakUI> & { systemId?: string };
    
    // Destruturação com fallbacks para modo standalone
    const systemId = sarak.systemId || 'STANDALONE-MODE';
    const isHydrated = sarak.isHydrated ?? true;

    const [isResetting, setIsResetting] = useState(false);

    /**
     * Reset de fábrica do que é NOSSO. Remove só as chaves da lib (tema e idioma)
     * e recarrega — o resto da origem é do host e não se toca. O texto do
     * `confirm()` descreve exatamente isto, nem mais nem menos.
     */
    const handleHardReset = () => {
        const confirmed = confirm(
            'ATENÇÃO: Isso apagará as configurações visuais da Sarak guardadas neste navegador '
            + '(tema e idioma) e recarregará a página. Nenhum outro dado deste site é afetado. Continuar?'
        );
        if (!confirmed) return;

        setIsResetting(true);
        setTimeout(() => {
            clearSarakStorage(sarak.options?.persistence?.storageKey);
            window.location.reload();
        }, RESET_DELAY_MS);
    };

    const stats = [
        { label: 'ID do Sistema', value: systemId, icon: Shield },
        { label: 'Status da Engine', value: isHydrated ? 'HIDRATADA' : 'INICIALIZANDO', icon: Activity, color: isHydrated ? 'text-[var(--sarak-status-success-color,#10b981)]' : 'text-[var(--sarak-status-warning-color,#f59e0b)]' },
        { label: 'SDT Version', value: 'v1.0 (Elite)', icon: Zap },
    ];

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-[var(--sarak-motion-dur-slow,0.6s)] overflow-y-auto custom-scrollbar p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* ENGINE STATUS */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[var(--sarak-secondary-color,#7c5cff)]/10 rounded-lg text-[var(--sarak-secondary-color,#7c5cff)]">
                            <Settings className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest italic text-theme-text/90">Sovereign Engine Status</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {stats.map((stat, i) => (
                            <div key={i} className="flex flex-col gap-2 p-4 rounded-2xl bg-theme-text/5 border border-theme-text/5">
                                <div className="flex items-center gap-2 text-theme-text/20">
                                    <stat.icon className="w-3.5 h-3.5" />
                                    <span className="text-2xs font-black uppercase tracking-widest">{stat.label}</span>
                                </div>
                                <span className={`text-xs font-mono font-bold tracking-tight ${stat.color || 'text-theme-text/70'}`}>{stat.value}</span>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 rounded-2xl bg-[var(--sarak-secondary-color,#7c5cff)]/5 border border-[var(--sarak-secondary-color,#7c5cff)]/10 flex items-start gap-4">
                        <HelpCircle className="w-5 h-5 text-[var(--sarak-secondary-color,#7c5cff)] shrink-0 mt-1" />
                        <div className="space-y-2">
                            <h4 className="text-2xs font-bold text-theme-text/80 uppercase">Sobre a Sarak Matrix v5.0</h4>
                            <p className="text-2xs text-theme-text/40 leading-relaxed uppercase font-medium">
                                O Motor Elite SDT gerencia 100% da visualidade através de tokens source-driven. 
                                Qualquer alteração aqui reflete em todos os módulos registrados instantaneamente via Context Bridge.
                            </p>
                        </div>
                    </div>
                </div>

                {/* MANUTENÇÃO & SEGURANÇA */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[var(--sarak-status-error-color,#ef4444)]/10 rounded-lg text-[var(--sarak-status-error-color,#ef4444)]">
                            <Shield className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest italic text-theme-text/90">Gestão de Persistência</h3>
                    </div>

                    <div className="p-6 rounded-3xl bg-[var(--sarak-status-error-color,#ef4444)]/5 border border-[var(--sarak-status-error-color,#ef4444)]/10 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-[var(--sarak-status-error-color,#ef4444)] rounded-2xl text-[var(--sarak-on-error,#020617)] shadow-lg shadow-[var(--sarak-status-error-color,#ef4444)]/20">
                                <HardDrive className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-widest text-theme-text/90">Factory Hard Reset</h4>
                                <p className="text-2xs text-theme-text/30 uppercase font-medium">Apagar tema e idioma guardados pela Sarak neste navegador</p>
                            </div>
                        </div>

                        <button
                            onClick={handleHardReset}
                            disabled={isResetting}
                            className="w-full py-4 rounded-2xl bg-[var(--sarak-status-error-color,#ef4444)]/10 hover:bg-[var(--sarak-status-error-color,#ef4444)] text-[var(--sarak-status-error-color,#ef4444)] hover:text-[var(--sarak-on-error,#020617)] border border-[var(--sarak-status-error-color,#ef4444)]/20 transition-all duration-[var(--sarak-motion-dur-normal,0.3s)] flex items-center justify-center gap-3 group disabled:opacity-50"
                        >
                            {isResetting ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-[var(--sarak-motion-dur-slow,0.6s)]" />
                            )}
                            <span className="text-2xs font-black uppercase tracking-[var(--sarak-tracking-tight,0.2em)]">Restaurar Padrões</span>
                        </button>

                        <div className="text-center">
                            <span className="text-3xs text-theme-text/10 uppercase font-black tracking-widest">Ação Irreversível • Sincronize com a Nuvem Antes</span>
                        </div>
                    </div>

                    {/* API SYNC */}
                    <div className="space-y-4 pt-4">
                        <div className="flex items-center justify-between text-2xs font-black uppercase tracking-widest text-theme-text/40">
                            <span>Sincronização Cloud</span>
                            <span className="text-[var(--sarak-status-success-color,#10b981)]">Ativa (v2)</span>
                        </div>
                        <div className="h-1 bg-theme-text/5 rounded-full overflow-hidden">
                            <div className="h-full w-full bg-[var(--sarak-status-success-color,#10b981)]/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvancedTab;
