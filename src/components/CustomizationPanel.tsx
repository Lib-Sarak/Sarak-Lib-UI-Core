import React from 'react';

/**
 * CustomizationPanel — Gerenciador de Estética do Sarak Matrix.
 * Fornece a interface para troca de temas, branding e customização de cores.
 */
export const CustomizationPanel: React.FC = () => {
    return (
        <div className="p-8 theme-glass-dark rounded-3xl border border-white/5 animate-in fade-in zoom-in duration-500">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 mb-4 uppercase tracking-tighter">
                Central de Customização
            </h2>
            <p className="text-white/60 mb-8 max-w-2xl leading-relaxed">
                Personalize a experiência visual do seu Portal Sarak. Configure temas, 
                modifique o branding e gerencie os tokens de design do ecossistema.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <div className="w-5 h-5 rounded-full border-2 border-blue-400"></div>
                    </div>
                    <h3 className="text-lg font-bold mb-2">Temas e Cores</h3>
                    <p className="text-sm text-white/40 mb-4">Escolha entre Glassmorphism, Dark Sleek ou Custom RGB.</p>
                    <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#0a0a0b] border border-white/10 ring-2 ring-blue-500"></div>
                        <div className="w-8 h-8 rounded-full bg-slate-900 border border-white/10"></div>
                        <div className="w-8 h-8 rounded-full bg-indigo-950 border border-white/10"></div>
                    </div>
                </div>

                <div className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <div className="w-5 h-5 bg-emerald-400/50 rounded"></div>
                    </div>
                    <h3 className="text-lg font-bold mb-2">Interface & Layout</h3>
                    <p className="text-sm text-white/40 mb-4">Ajuste o comportamento da sidebar e densidade de informação.</p>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-2/3 bg-emerald-500"></div>
                    </div>
                </div>
            </div>

            <div className="mt-8 p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                <div className="flex items-center gap-3 text-blue-400">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <span className="text-xs font-bold uppercase tracking-widest">Sovereign Design Token (SDT) v1.0</span>
                </div>
            </div>
        </div>
    );
};

export default CustomizationPanel;
