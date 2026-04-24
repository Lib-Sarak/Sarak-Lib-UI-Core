import React from 'react';
import { motion } from 'framer-motion';
import { 
    Search, Bell, Settings, Layout, 
    ChevronRight, Plus, Check, AlertCircle,
    BarChart2, MessageSquare, Share2, MoreHorizontal
} from 'lucide-react';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';

export const KitchenSinkPreview: React.FC = () => {
    const sarak = useSarakUI();
    const { design } = sarak;

    return (
        <div className="p-8 space-y-12 mx-auto">
            {/* Header Section */}
            <header className="flex items-center justify-between p-6 bg-theme-card rounded-theme border-theme shadow-theme backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[var(--theme-primary)] flex items-center justify-center text-white shadow-lg shadow-[var(--theme-primary)]/30">
                        <Layout size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-[var(--theme-title)]">Sarak OS Kitchen Sink</h1>
                        <p className="text-2xs font-black uppercase tracking-widest text-[var(--theme-muted)]">Manifest v8.5 • Preview Mode</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-muted)]" size={14} />
                        <input 
                            type="text" 
                            placeholder="Pesquisar..." 
                            className="pl-9 pr-4 py-2 bg-black/20 border border-theme rounded-theme text-xs focus:outline-none focus:border-[var(--theme-primary)] transition-all w-40 focus:w-60"
                            style={{ 
                                borderWidth: 'var(--theme-border-width)',
                                borderStyle: 'var(--border-style)'
                            }}
                        />
                    </div>
                    <button className="p-2 bg-white/5 rounded-theme text-[var(--theme-muted)] hover:text-[var(--theme-title)] transition-colors border-theme">
                        <Bell size={18} />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--theme-primary)] to-indigo-500 border-2 border-theme shadow-theme" />
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Inputs & Controls */}
                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Settings size={16} className="text-[var(--theme-primary)]" />
                        <h2 className="text-sm font-black uppercase tracking-widest text-[var(--theme-title)]">Inputs & Controles</h2>
                    </div>
                    
                    <div className="bg-theme-card rounded-theme border-theme p-6 space-y-4 shadow-theme">
                        <div className="space-y-2">
                            <label className="text-2xs font-bold uppercase text-[var(--theme-muted)]">Campo de Texto</label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-3 bg-black/20 border border-theme rounded-theme text-sm focus:ring-2 focus:ring-[var(--theme-primary)]/20 transition-all focus:outline-none focus:border-[var(--theme-primary)]"
                                placeholder="Fidelidade absoluta..."
                                style={{ 
                                    borderWidth: 'var(--theme-border-width)',
                                    borderStyle: 'var(--border-style)'
                                }}
                            />
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="flex-1 space-y-2">
                                <label className="text-2xs font-bold uppercase text-[var(--theme-muted)]">Select Dinâmico</label>
                                <select className="w-full px-4 py-3 bg-black/20 border border-theme rounded-theme text-sm outline-none">
                                    <option>Opção Alpha</option>
                                    <option>Opção Beta</option>
                                </select>
                            </div>
                            <div className="w-24 space-y-2">
                                <label className="text-2xs font-bold uppercase text-[var(--theme-muted)]">Toggle</label>
                                <div className="h-[46px] flex items-center justify-center bg-black/20 border border-theme rounded-theme">
                                    <div className="w-10 h-5 bg-[var(--theme-primary)] rounded-full relative p-1 cursor-pointer">
                                        <div className="w-3 h-3 bg-white rounded-full absolute right-1" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-2xs font-bold uppercase text-[var(--theme-muted)]">Slider de Precisão</label>
                            <input type="range" className="w-full accent-[var(--theme-primary)]" />
                        </div>
                    </div>
                </motion.section>

                {/* Buttons & Actions */}
                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Plus size={16} className="text-[var(--theme-primary)]" />
                        <h2 className="text-sm font-black uppercase tracking-widest text-[var(--theme-title)]">Botões & Ações</h2>
                    </div>
                    
                    <div className="bg-theme-card rounded-theme border-theme p-6 grid grid-cols-2 gap-4 shadow-theme">
                        <button className="w-full py-3 bg-[var(--theme-primary)] text-white rounded-theme font-bold text-xs uppercase tracking-widest shadow-lg shadow-[var(--theme-primary)]/20 hover:brightness-110 active:scale-95 transition-all border-theme">
                            Ação Primária
                        </button>
                        <button className="w-full py-3 bg-white/5 border border-theme text-white rounded-theme font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
                            Secundário
                        </button>
                        <button className="w-full py-3 border border-[var(--theme-primary)] text-[var(--theme-primary)] rounded-theme font-bold text-xs uppercase tracking-widest hover:bg-[var(--theme-primary)]/5 transition-all col-span-2">
                            Outline Button
                        </button>
                        <button className="w-full py-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-theme font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                            <Check size={14} /> Sucesso
                        </button>
                        <button className="w-full py-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-theme font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                            <AlertCircle size={14} /> Erro
                        </button>
                    </div>
                </motion.section>

                {/* Data Displays */}
                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-6 col-span-1 md:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart2 size={16} className="text-[var(--theme-primary)]" />
                        <h2 className="text-sm font-black uppercase tracking-widest text-[var(--theme-title)]">Tabelas & Listas</h2>
                    </div>
                    
                    <div className="bg-theme-card rounded-theme border-theme overflow-hidden shadow-theme">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-theme bg-white/5">
                                    <th className="px-6 py-4 text-2xs font-black uppercase tracking-widest text-[var(--theme-muted)]">Módulo</th>
                                    <th className="px-6 py-4 text-2xs font-black uppercase tracking-widest text-[var(--theme-muted)]">Status</th>
                                    <th className="px-6 py-4 text-2xs font-black uppercase tracking-widest text-[var(--theme-muted)]">Uso</th>
                                    <th className="px-6 py-4 text-2xs font-black uppercase tracking-widest text-[var(--theme-muted)]">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-theme">
                                {[1, 2, 3].map((i) => (
                                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-theme bg-white/5 flex items-center justify-center text-[var(--theme-primary)] border-theme">
                                                    <Layout size={14} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-[var(--theme-title)]">Módulo Satélite {i}</div>
                                                    <div className="text-2xs text-[var(--theme-muted)]">ID: sarak-mod-0{i}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-2xs font-black uppercase">Ativo</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="w-full max-w-[100px] h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-[var(--theme-primary)] rounded-full" style={{ width: `${30 * i}%` }} />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="p-2 hover:bg-white/5 rounded-theme transition-colors text-[var(--theme-muted)]">
                                                <MoreHorizontal size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.section>

                {/* Modals & Toasts Mockup */}
                <motion.section initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                        <MessageSquare size={16} className="text-[var(--theme-primary)]" />
                        <h2 className="text-sm font-black uppercase tracking-widest text-[var(--theme-title)]">Modais & Feedback</h2>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="p-4 bg-theme-card border-theme rounded-theme shadow-theme flex items-center gap-4 relative overflow-hidden group">
                            <div className="spotlight-effect" />

                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--theme-primary)]" />
                            <div className="w-8 h-8 rounded-full bg-[var(--theme-primary)]/10 flex items-center justify-center text-[var(--theme-primary)]">
                                <Share2 size={14} />
                            </div>
                            <div className="flex-1">
                                <div className="text-xs font-bold text-[var(--theme-title)]">DNA Sincronizado</div>
                                <div className="text-2xs text-[var(--theme-muted)]">O manifesto visual foi aplicado globalmente.</div>
                            </div>
                        </div>

                        <div className="bg-theme-card rounded-theme border-theme p-6 shadow-theme space-y-6 relative overflow-hidden group">
                            <div className="spotlight-effect" />

                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-[var(--theme-title)]">Confirmar Alterações</h3>
                                <Plus className="rotate-45 text-[var(--theme-muted)]" size={18} />
                            </div>
                            <p className="text-xs text-[var(--theme-muted)] leading-relaxed">
                                Você está prestes a aplicar um novo DNA visual globalmente. Esta ação não pode ser desfeita e afetará todos os módulos ativos.
                            </p>
                            <div className="flex gap-3">
                                <button className="flex-1 py-3 bg-white/5 rounded-theme text-2xs font-black uppercase border-theme text-[var(--theme-muted)]">Cancelar</button>
                                <button className="flex-1 py-3 bg-[var(--theme-primary)] rounded-theme text-2xs font-black uppercase shadow-lg shadow-[var(--theme-primary)]/20 border-theme text-white">Confirmar</button>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Cards & Lists */}
                <motion.section initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Layout size={16} className="text-[var(--theme-primary)]" />
                        <h2 className="text-sm font-black uppercase tracking-widest text-[var(--theme-title)]">Superfícies de Dados</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-theme-card rounded-theme border-theme p-6 group hover:translate-y-[-4px] transition-all relative overflow-hidden shadow-theme">
                            <div className="spotlight-effect" />
                            {/* Spotlight effect placeholder */}

                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--theme-primary)]/5 to-transparent pointer-events-none" />
                            
                            <div className="flex items-start justify-between mb-4 relative">
                                <div className="p-3 rounded-theme bg-[var(--theme-primary)]/10 border-theme">
                                    <Layout className="text-[var(--theme-primary)]" size={24} />
                                </div>
                                <span className="text-2xs font-black text-[var(--theme-primary)] bg-[var(--theme-primary)]/10 px-2 py-1 rounded-md uppercase">Quantum Engine</span>
                            </div>
                            <h3 className="text-lg font-bold mb-2 relative text-[var(--theme-title)]">Sovereign Architecture</h3>
                            <p className="text-xs text-[var(--theme-muted)] leading-relaxed mb-6 relative">
                                O sistema garante que cada componente seja renderizado com fidelidade absoluta ao manifesto JSON exportado pelo motor de design.
                            </p>
                            <div className="flex items-center justify-between pt-4 border-t border-theme relative">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-6 h-6 rounded-full border-2 border-theme bg-white/10" />
                                    ))}
                                </div>
                                <button className="text-[var(--theme-primary)] text-2xs font-black uppercase flex items-center gap-1 hover:gap-2 transition-all">
                                    Explorar <ChevronRight size={10} />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.section>
            </div>
        </div>
    );
};

