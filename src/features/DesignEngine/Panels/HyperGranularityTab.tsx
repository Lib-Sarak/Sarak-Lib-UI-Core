import React, { useState, useMemo } from 'react';
import { 
    Search, X, Check, Palette, Waves, MousePointer2, 
    Layout, CreditCard, Type, Zap, Activity, 
    Monitor, Sparkles, Fingerprint, 
    Database, Cpu, Filter, Settings2, Sliders, RotateCcw
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
 * DEFINIÇÃO DOS PILARES DE SOBERANIA (v12.0)
 * Agrupa os 10 schemas em 6 categorias lógicas.
 */
const SOVEREIGN_PILLARS = [
    { id: 'core', label: 'Fundação (DNA)', icon: Fingerprint, schemas: ['identity'] },
    { id: 'typo', label: 'Semântica Texto', icon: Type, schemas: ['typography'] },
    { id: 'body', label: 'Arquitetura UI', icon: Layout, schemas: ['shell', 'cards'] },
    { id: 'vibe', label: 'Atmosfera (Vibe)', icon: Waves, schemas: ['atmosphere', 'animations'] },
    { id: 'action', label: 'Fluxo & Input', icon: MousePointer2, schemas: ['controls'] },
    { id: 'system', label: 'Core Engine', icon: Cpu, schemas: ['specialized', 'data', 'system'] },
];

/**
 * HYPER GRANULARITY TAB (v12.0) - THE COMMAND CENTER
 * 
 * Agora 100% dinâmico e organizado por Pilares de Soberania.
 */
export const HyperGranularityTab: React.FC = () => {
    const sarak = useSarakUI();
    const { draft, updateDraft, handleApplyToSystem, resetPillar, resetToken, toast } = useDesignDraft(sarak);
    
    const [activePillar, setActivePillar] = useState<string>('core');
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // IDENTIFICA QUAIS PILARES POSSUEM DRAFTS ATIVOS
    const pillarsWithDrafts = useMemo(() => {
        const changedKeys = Object.keys(draft);
        return SOVEREIGN_PILLARS.filter(pillar => {
            const pillarTokens = MASTER_DESIGN_MAP.components
                .filter(c => pillar.schemas.includes(c.id))
                .flatMap(c => c.tokens.map(t => t.id));
            return changedKeys.some(key => pillarTokens.includes(key));
        }).map(p => p.id);
    }, [draft]);

    // FILTRAGEM INTELIGENTE (BUSCA OU PILAR)
    const filteredComponents = useMemo(() => {
        const query = searchQuery.toLowerCase();
        
        // Se houver busca, ignora os pilares e mostra tudo que der match
        if (query) {
            return MASTER_DESIGN_MAP.components.map(comp => {
                const tokens = comp.tokens.filter(token => 
                    token.label.toLowerCase().includes(query) || 
                    (token.category && token.category.toLowerCase().includes(query)) ||
                    token.id.toLowerCase().includes(query)
                );
                
                if (tokens.length > 0 || comp.label.toLowerCase().includes(query)) {
                    return { ...comp, tokens: tokens.length > 0 ? tokens : comp.tokens };
                }
                return null;
            }).filter(Boolean) as typeof MASTER_DESIGN_MAP.components;
        }

        // Se não houver busca, filtra pelo pilar ativo
        const currentPillar = SOVEREIGN_PILLARS.find(p => p.id === activePillar);
        if (!currentPillar) return [];

        return MASTER_DESIGN_MAP.components.filter(comp => 
            currentPillar.schemas.includes(comp.id)
        );
    }, [searchQuery, activePillar]);

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500 overflow-hidden bg-[#050505]">
            
            {/* HEADER: SEARCH & PILLARS */}
            <div className="pt-6 px-6 pb-2 border-b border-white/5 bg-black/40 backdrop-blur-md z-10 space-y-4">
                <div className="relative group">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[var(--theme-primary)] transition-colors" />
                    <input 
                        type="text"
                        placeholder="Busca universal em 200+ tokens..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-[10px] font-bold focus:border-[var(--theme-primary)]/50 focus:outline-none transition-all text-white placeholder:text-white/20"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white">
                            <X size={12} />
                        </button>
                    )}
                </div>

                {/* PILLAR SELECTOR - Só exibe se não estiver buscando */}
                <AnimatePresence mode="wait">
                    {!searchQuery ? (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center justify-between gap-1 p-1 bg-white/5 rounded-xl border border-white/5"
                        >
                            {SOVEREIGN_PILLARS.map((pillar) => {
                                const Icon = pillar.icon;
                                const isActive = activePillar === pillar.id;
                                const hasDraft = pillarsWithDrafts.includes(pillar.id);

                                return (
                                    <button
                                        key={pillar.id}
                                        onClick={() => {
                                            setActivePillar(pillar.id);
                                            setActiveSection(null);
                                        }}
                                        className={`relative flex-1 flex flex-col items-center gap-1.5 py-2 rounded-lg transition-all ${
                                            isActive 
                                                ? 'bg-[var(--theme-primary)] text-black shadow-lg' 
                                                : 'hover:bg-white/5 text-white/30 hover:text-white/60'
                                        }`}
                                        title={pillar.label}
                                    >
                                        <Icon size={14} strokeWidth={isActive ? 3 : 2} />
                                        <span className="text-[8px] font-black uppercase tracking-tighter">{pillar.label}</span>
                                        
                                        {hasDraft && (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    resetPillar(pillar.schemas);
                                                }}
                                                className={`absolute top-1 right-1 p-0.5 rounded-full transition-all ${isActive ? 'bg-black text-[var(--theme-primary)] hover:scale-110' : 'bg-[var(--theme-primary)] text-black animate-pulse hover:animate-none hover:scale-110'}`}
                                                title="Resetar Pilar"
                                            >
                                                <RotateCcw size={8} strokeWidth={4} />
                                            </button>
                                        )}
                                    </button>
                                );
                            })}
                        </motion.div>
                    ) : (
                        <div className="flex items-center gap-2 py-2">
                            <span className="text-[10px] font-black uppercase text-[var(--theme-primary)] bg-[var(--theme-primary)]/10 px-2 py-0.5 rounded-full">
                                {filteredComponents.length} Categorias em foco
                            </span>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* DYNAMIC SCROLLABLE CONTENT */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-32">
                {filteredComponents.length > 0 ? (
                    filteredComponents.map((component, idx) => {
                        const Icon = COMPONENT_ICONS[component.id] || Settings2;
                        const isOpen = activeSection === component.id || (searchQuery.length > 0);

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
                                                            {tokens.map(token => {
                                                                const isTokenDirty = draft[token.id] !== undefined && JSON.stringify(draft[token.id]) !== JSON.stringify(sarak[token.id]);
                                                                
                                                                return (
                                                                    <div key={token.id} className="relative group/token">
                                                                        <DynamicTokenControl 
                                                                            token={token} 
                                                                            draft={draft} 
                                                                            updateDraft={updateDraft} 
                                                                        />
                                                                        {isTokenDirty && (
                                                                            <button 
                                                                                onClick={() => resetToken(token.id)}
                                                                                className="absolute -top-1 -right-1 p-1 bg-orange-500/20 text-orange-500 rounded-lg opacity-0 group-hover/token:opacity-100 transition-all hover:bg-orange-500 hover:text-black shadow-lg z-10"
                                                                                title="Reverter Token"
                                                                            >
                                                                                <RotateCcw size={10} strokeWidth={3} />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
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
                        <p className="text-[10px] text-white/20 mt-1 uppercase italic">Aumente a abrangência da busca</p>
                    </div>
                )}
            </div>

            {/* ACTION FOOTER */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent border-t border-white/5">
                <button 
                    onClick={handleApplyToSystem}
                    disabled={Object.keys(draft).length === 0}
                    className={`w-full font-black uppercase py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 group ${
                        Object.keys(draft).length > 0 
                            ? 'bg-[var(--theme-primary)] text-black shadow-[0_0_30px_rgba(var(--theme-primary-rgb),0.2)] hover:bg-[var(--theme-primary)]/90' 
                            : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                    }`}
                >
                    <Check size={16} className={Object.keys(draft).length > 0 ? 'group-hover:scale-110 transition-transform' : ''} />
                    <span className="text-xs tracking-[0.2em]">Aplicar Soberania</span>
                </button>
                
                <div className="mt-4 flex items-center justify-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${Object.keys(draft).length > 0 ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`} />
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/20">
                        {Object.keys(draft).length > 0 ? 'Sessão com Alterações Pendentes' : 'Sarak Sovereign UI v12.0'}
                    </span>
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

