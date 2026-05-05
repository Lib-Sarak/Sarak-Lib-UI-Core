import React, { useState, useMemo } from 'react';
import { 
    Search, X, Check, Palette, Waves, MousePointer2, 
    Layout, CreditCard, Type, Zap, Activity, 
    Monitor, Sparkles, Fingerprint, 
    Database, Cpu, Filter, Settings2, Sliders
} from 'lucide-react';

import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { useDesignDraft } from '../hooks/useDesignDraft';
import { MASTER_DESIGN_MAP } from '../../../core/Design/master-map';
import { DynamicTokenControl } from '../components/DynamicTokenControl';
import { CategoryLabel } from '../components/DesignControls';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * MAPEAR ÍCONES AOS COMPONENTES DO SCHEMA
 */
const COMPONENT_ICONS: Record<string, any> = {
    shell: Layout,
    identity: Fingerprint,
    typography: Type,
    atmosphere: Waves,
    cards: CreditCard,
    controls: MousePointer2,
    data: Database,
    animations: Zap,
    specialized: Sparkles,
    system: Cpu
};

/**
 * HYPER GRANULARITY TAB (v12.0) - THE COMMAND CENTER
 * 
 * Agora 100% dinâmico. Consome o MASTER_DESIGN_MAP para gerar a UI.
 */
export const HyperGranularityTab: React.FC = () => {
    const sarak = useSarakUI();
    const { draft, updateDraft, handleApplyToSystem, toast } = useDesignDraft(sarak);
    
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // FILTRAGEM INTELIGENTE DE TOKENS
    const filteredComponents = useMemo(() => {
        if (!searchQuery) return MASTER_DESIGN_MAP.components;

        const query = searchQuery.toLowerCase();
        return MASTER_DESIGN_MAP.components.map(comp => {
            const tokens = comp.tokens.filter(token => 
                token.label.toLowerCase().includes(query) || 
                (token.category && token.category.toLowerCase().includes(query)) ||
                token.id.toLowerCase().includes(query)
            );
            
            // Se o componente em si ou algum de seus tokens derem match
            if (tokens.length > 0 || comp.label.toLowerCase().includes(query)) {
                return { 
                    ...comp, 
                    tokens: tokens.length > 0 ? tokens : comp.tokens 
                };
            }
            return null;
        }).filter(Boolean) as typeof MASTER_DESIGN_MAP.components;
    }, [searchQuery]);

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500 overflow-hidden bg-[#050505]">
            
            {/* SEARCH & FILTER HEADER */}
            <div className="px-6 py-4 border-b border-white/5 bg-black/40 backdrop-blur-md z-10">
                <div className="relative group">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[var(--theme-primary)] transition-colors" />
                    <input 
                        type="text"
                        placeholder="Buscar configuração (ex: border, glass, shadow...)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold focus:border-[var(--theme-primary)]/50 focus:outline-none focus:bg-white/[0.08] transition-all text-white placeholder:text-white/20"
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
                
                {searchQuery && (
                    <div className="mt-2 flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-[var(--theme-primary)] bg-[var(--theme-primary)]/10 px-2 py-0.5 rounded-full">
                            {filteredComponents.length} Categorias encontradas
                        </span>
                    </div>
                )}
            </div>

            {/* DYNAMIC SCROLLABLE CONTENT */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-32">
                {filteredComponents.length > 0 ? (
                    filteredComponents.map((component, idx) => {
                        const Icon = COMPONENT_ICONS[component.id] || Settings2;
                        const isOpen = activeSection === component.id || (searchQuery.length > 0);

                        // Agrupar tokens por subcategoria (token.category)
                        const groupedTokens = component.tokens.reduce((acc, token) => {
                            const cat = token.category || 'Geral';
                            if (!acc[cat]) acc[cat] = [];
                            acc[cat].push(token);
                            return acc;
                        }, {} as Record<string, any[]>);

                        return (
                            <div key={component.id} className="border-b border-white/5 last:border-0">
                                <CategoryLabel 
                                    icon={Icon} 
                                    title={component.label} 
                                    index={idx + 1} 
                                    isOpen={isOpen}
                                    onToggle={() => setActiveSection(activeSection === component.id ? null : component.id)}
                                />

                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }} 
                                            animate={{ height: 'auto', opacity: 1 }} 
                                            exit={{ height: 0, opacity: 0 }} 
                                            transition={{ duration: 0.3, ease: "circOut" }} 
                                            className="overflow-hidden bg-white/[0.02]"
                                        >
                                            <div className="p-6 pt-2 space-y-8">
                                                {Object.entries(groupedTokens).map(([cat, tokens]) => (
                                                    <div key={cat} className="space-y-4">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="w-1 h-3 bg-[var(--theme-primary)]/40 rounded-full" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{cat}</span>
                                                        </div>
                                                        <div className="space-y-4">
                                                            {tokens.map(token => (
                                                                <DynamicTokenControl 
                                                                    key={token.id} 
                                                                    token={token} 
                                                                    draft={draft} 
                                                                    updateDraft={updateDraft} 
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center p-20 text-center">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                            <Search size={24} className="text-white/10" />
                        </div>
                        <h3 className="text-xs font-black uppercase text-white/40 tracking-widest">Nenhum token encontrado</h3>
                        <p className="text-[10px] text-white/20 mt-1 uppercase italic">Tente outro termo de busca</p>
                    </div>
                )}
            </div>

            {/* ACTION FOOTER */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent border-t border-white/5">
                <button 
                    onClick={handleApplyToSystem}
                    className="w-full bg-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/90 text-black font-black uppercase py-4 rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(var(--theme-primary-rgb),0.2)] transition-all active:scale-95 group"
                >
                    <Check size={16} className="group-hover:scale-110 transition-transform" />
                    <span className="text-xs tracking-[0.2em]">Aplicar Soberania ao Sistema</span>
                </button>
                
                <div className="mt-4 flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Sarak Sovereign UI v12.0 (Stable)</span>
                </div>
            </div>

            {/* TOAST NOTIFICATION */}
            <AnimatePresence>
                {toast && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-28 left-6 right-6 z-50 pointer-events-none"
                    >
                        <div className={`p-4 rounded-xl border backdrop-blur-xl flex items-center gap-3 shadow-2xl ${
                            toast.type === 'success' 
                                ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                                : 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                        }`}>
                            <div className={`p-1.5 rounded-lg ${toast.type === 'success' ? 'bg-green-500/20' : 'bg-orange-500/20'}`}>
                                {toast.type === 'success' ? <Check size={14} /> : <Filter size={14} />}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider">{toast.message}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HyperGranularityTab;
