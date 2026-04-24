import React from 'react';
import { motion } from 'framer-motion';
import { 
    Search, Bell, User, Settings, Layout, 
    ChevronRight, Plus, Check, AlertCircle,
    BarChart2, MessageSquare, Share2, MoreHorizontal
} from 'lucide-react';

export const KitchenSinkPreview: React.FC = () => {
    return (
        <div className="p-8 space-y-12 max-w-5xl mx-auto">
            {/* Header Section */}
            <header className="flex items-center justify-between p-6 bg-theme-card rounded-theme border-theme shadow-theme">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[var(--theme-primary)] flex items-center justify-center text-white">
                        <Layout size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Sarak OS Kitchen Sink</h1>
                        <p className="text-xs text-[var(--theme-muted)]">Manifest-Based Rendering Engine v7.5</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-muted)]" size={14} />
                        <input 
                            type="text" 
                            placeholder="Pesquisar componentes..." 
                            className="pl-9 pr-4 py-2 bg-black/20 border border-white/10 rounded-lg text-xs focus:outline-none focus:border-[var(--theme-primary)] transition-all"
                        />
                    </div>
                    <button className="p-2 bg-white/5 rounded-lg text-[var(--theme-muted)] hover:text-white transition-colors">
                        <Bell size={18} />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border-2 border-white/10 shadow-lg" />
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Inputs & Controls */}
                <section className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Settings size={16} className="text-[var(--theme-primary)]" />
                        <h2 className="text-sm font-black uppercase tracking-widest">Inputs & Controles</h2>
                    </div>
                    
                    <div className="bg-theme-card rounded-theme border-theme p-6 space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-[var(--theme-muted)]">Standard Input</label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-3 bg-black/20 border border-white/5 rounded-lg text-sm focus:ring-2 focus:ring-[var(--theme-primary)]/20 transition-all"
                                placeholder="Digite algo..."
                            />
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="flex-1 space-y-2">
                                <label className="text-[10px] font-bold uppercase text-[var(--theme-muted)]">Select Menu</label>
                                <select className="w-full px-4 py-3 bg-black/20 border border-white/5 rounded-lg text-sm">
                                    <option>Opção 1</option>
                                    <option>Opção 2</option>
                                </select>
                            </div>
                            <div className="w-24 space-y-2">
                                <label className="text-[10px] font-bold uppercase text-[var(--theme-muted)]">Toggle</label>
                                <div className="h-[46px] flex items-center justify-center bg-black/20 border border-white/5 rounded-lg">
                                    <div className="w-10 h-5 bg-[var(--theme-primary)] rounded-full relative p-1 cursor-pointer">
                                        <div className="w-3 h-3 bg-white rounded-full absolute right-1" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-[var(--theme-muted)]">Slider Range</label>
                            <input type="range" className="w-full accent-[var(--theme-primary)]" />
                        </div>
                    </div>
                </section>

                {/* Buttons & Actions */}
                <section className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Plus size={16} className="text-[var(--theme-primary)]" />
                        <h2 className="text-sm font-black uppercase tracking-widest">Botões & Ações</h2>
                    </div>
                    
                    <div className="bg-theme-card rounded-theme border-theme p-6 grid grid-cols-2 gap-4">
                        <button className="w-full py-3 bg-[var(--theme-primary)] text-white rounded-lg font-bold text-xs uppercase tracking-widest shadow-lg shadow-[var(--theme-primary)]/20 hover:brightness-110 active:scale-95 transition-all">
                            Primary Action
                        </button>
                        <button className="w-full py-3 bg-white/5 border border-white/10 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
                            Secondary
                        </button>
                        <button className="w-full py-3 border border-[var(--theme-primary)] text-[var(--theme-primary)] rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-[var(--theme-primary)]/5 transition-all col-span-2">
                            Outline Button
                        </button>
                        <button className="w-full py-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                            <Check size={14} /> Sucesso
                        </button>
                        <button className="w-full py-3 bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                            <AlertCircle size={14} /> Erro
                        </button>
                    </div>
                </section>

                {/* Data Displays */}
                <section className="space-y-6 col-span-1 md:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart2 size={16} className="text-[var(--theme-primary)]" />
                        <h2 className="text-sm font-black uppercase tracking-widest">Tabelas & Listas</h2>
                    </div>
                    
                    <div className="bg-theme-card rounded-theme border-theme overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--theme-muted)]">Módulo</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--theme-muted)]">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--theme-muted)]">Uso</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--theme-muted)]">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {[1, 2, 3].map((i) => (
                                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[var(--theme-primary)]">
                                                    <Layout size={14} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold">Módulo Satélite {i}</div>
                                                    <div className="text-[10px] text-[var(--theme-muted)]">ID: sarak-mod-0{i}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase">Ativo</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="w-full max-w-[100px] h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-[var(--theme-primary)] rounded-full" style={{ width: `${30 * i}%` }} />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                                <MoreHorizontal size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Modals & Toasts Mockup */}
                <section className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                        <MessageSquare size={16} className="text-[var(--theme-primary)]" />
                        <h2 className="text-sm font-black uppercase tracking-widest">Modais & Toasts</h2>
                    </div>
                    
                    <div className="space-y-4">
                        {/* Toast Mock */}
                        <div className="p-4 bg-[#0a0a0b] border border-white/5 rounded-2xl shadow-2xl flex items-center gap-4 relative overflow-hidden group">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--theme-primary)]" />
                            <div className="w-8 h-8 rounded-full bg-[var(--theme-primary)]/10 flex items-center justify-center text-[var(--theme-primary)]">
                                <Share2 size={14} />
                            </div>
                            <div className="flex-1">
                                <div className="text-xs font-bold">Notificação do Sistema</div>
                                <div className="text-[10px] text-[var(--theme-muted)]">O manifesto foi sincronizado com sucesso.</div>
                            </div>
                        </div>

                        {/* Modal Mock */}
                        <div className="bg-theme-card rounded-theme border-theme p-6 shadow-2xl space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold">Confirmar Alterações</h3>
                                <Plus className="rotate-45 text-[var(--theme-muted)]" size={18} />
                            </div>
                            <p className="text-sm text-[var(--theme-muted)]">
                                Você está prestes a aplicar um novo DNA visual globalmente. Esta ação não pode ser desfeita.
                            </p>
                            <div className="flex gap-3">
                                <button className="flex-1 py-3 bg-white/5 rounded-xl text-xs font-bold">Cancelar</button>
                                <button className="flex-1 py-3 bg-[var(--theme-primary)] rounded-xl text-xs font-bold shadow-lg shadow-[var(--theme-primary)]/20">Confirmar</button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Cards & Lists */}
                <section className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Layout size={16} className="text-[var(--theme-primary)]" />
                        <h2 className="text-sm font-black uppercase tracking-widest">Cards & Listas</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-theme-card rounded-theme border-theme p-6 group hover:translate-y-[-4px] transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-2xl bg-gradient-to-br from-[var(--theme-primary)]/20 to-transparent">
                                    <Layout className="text-[var(--theme-primary)]" size={24} />
                                </div>
                                <span className="text-[10px] font-black text-[var(--theme-primary)] bg-[var(--theme-primary)]/10 px-2 py-1 rounded-md uppercase">V7.5</span>
                            </div>
                            <h3 className="text-lg font-bold mb-2">Sovereign Architecture</h3>
                            <p className="text-xs text-[var(--theme-muted)] leading-relaxed mb-6">
                                O sistema garante que cada componente seja renderizado com fidelidade absoluta ao manifesto JSON exportado.
                            </p>
                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-6 h-6 rounded-full border-2 border-[#0a0a0b] bg-white/10" />
                                    ))}
                                </div>
                                <button className="text-[var(--theme-primary)] text-[10px] font-black uppercase flex items-center gap-1">
                                    Ver Detalhes <ChevronRight size={10} />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};
