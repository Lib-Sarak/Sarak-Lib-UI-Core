import React, { useState, useMemo } from 'react';
import { 
    Search, X, Check, Palette, Waves, MousePointer2, 
    Layout, CreditCard, Type, Zap, Activity, 
    Monitor, Sparkles, Fingerprint, 
    Database, Cpu, Filter, Settings2, Sliders, RotateCcw
} from 'lucide-react';

import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { MASTER_DESIGN_MAP } from '../../../core/Design/master-map';
import { SarakDesignState } from '../../../core/Provider/types';
import { SarakTokenValue, SarakDesignToken } from '../../../core/Design/types';
import { DynamicTokenControl } from '../components/DynamicTokenControl';
import { CategoryLabel } from '../components/DesignControls';
import { motion, AnimatePresence } from 'framer-motion';
import { useSovereignSearch } from './hooks/useSovereignSearch';
import { PillarSelector } from './components/PillarSelector';
import { useMotionTokens } from '../../../components/atomic/hooks/useMotionTokens';

/**
 * MAPEAR ÍCONES AOS COMPONENTES DO SCHEMA
 */
const COMPONENT_ICONS: Record<string, React.ElementType> = {
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



export interface HyperGranularityTabProps {
    draft: SarakDesignState;
    updateDraft: (id: string, value: SarakTokenValue) => void;
    handleApplyToSystem: () => void;
    resetComponent: (schemaIdOrSchemas: string | string[]) => void;
    resetToken: (tokenId: string) => void;
    toast: { type: 'success' | 'warning'; message: string } | null;
}

/**
 * HYPER GRANULARITY TAB (v12.0) - THE COMMAND CENTER
 *
 * Agora 100% dinâmico e organizado por Pilares de Soberania.
 *
 * `draft`/`updateDraft`/`resetComponent`/`resetToken`/`toast` chegam por prop — ANTES este componente instanciava a própria
 * `useDesignDraft(sarak)`, em paralelo à de `ThemeCustomizationTab`: duas fontes de
 * rascunho vivas ao mesmo tempo assim que o Command Center ficou alcançável. Segue o
 * mesmo padrão que `MasterControlPanel` já usa (plan-36) — fonte única de rascunho.
 */
export const HyperGranularityTab: React.FC<HyperGranularityTabProps> = ({
    draft, updateDraft, resetComponent, resetToken, toast
}) => {
    const sarak = useSarakUI();
    const { durations } = useMotionTokens();
    const draftRecord = draft as Record<string, SarakTokenValue>;
    
    const [activePillar, setActivePillar] = useState<string>('brand');
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const { pillarsWithDrafts, filteredComponents } = useSovereignSearch(draft, searchQuery, activePillar);

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-[var(--sarak-motion-dur-slow,0.6s)] overflow-hidden bg-[var(--color-theme-card,#101622)]">
            
            {/* HEADER: SEARCH & PILLARS */}
            <div className="pt-6 px-6 pb-2 border-b border-theme-text/5 bg-theme-body/40 backdrop-blur-md z-10 space-y-4">
                <div className="relative group">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text/20 group-focus-within:text-[var(--theme-primary)] transition-colors" />
                    <input 
                        type="text"
                        placeholder="Busca universal em 200+ tokens..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-theme-text/5 border border-theme-text/10 rounded-xl py-2 pl-10 pr-4 text-[var(--sarak-type-scale2xs,11px)] font-bold focus:border-[var(--theme-primary)]/50 focus:outline-none transition-all text-theme-text placeholder:text-theme-text/20"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-text/20 hover:text-theme-text">
                            <X size={12} />
                        </button>
                    )}
                </div>

                <PillarSelector 
                    searchQuery={searchQuery}
                    activePillar={activePillar}
                    setActivePillar={setActivePillar}
                    setActiveSection={setActiveSection}
                    pillarsWithDrafts={pillarsWithDrafts}
                    resetComponent={resetComponent}
                    filteredComponentsLength={filteredComponents.length}
                />
            </div>

            {/* DYNAMIC SCROLLABLE CONTENT */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-32">
                {filteredComponents.length > 0 ? (
                    filteredComponents.map((component, idx) => {
                        const Icon = COMPONENT_ICONS[component.id] || Settings2;
                        const isOpen = activeSection === component.id || (searchQuery.length > 0);

                        const groupedTokens = component.tokens.reduce((acc, token) => {
                            const cat = 'Configurações Globais';
                            if (!acc[cat]) acc[cat] = [];
                            acc[cat].push(token);
                            return acc;
                        }, {} as Record<string, SarakDesignToken[]>);

                        return (
                            <div key={component.id} className="border-b border-theme-text/5 last:border-0">
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
                                            transition={{ duration: durations.normal, ease: "circOut" }} 
                                            className="overflow-hidden bg-theme-text/[0.02]"
                                        >
                                            <div className="p-6 pt-2 space-y-8">
                                                {Object.entries(groupedTokens).map(([cat, tokens]) => (
                                                    <div key={cat} className="space-y-4">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="w-1 h-3 bg-[var(--theme-primary)]/40 rounded-full" />
                            <span className="text-[var(--sarak-type-scale2xs,11px)] font-black uppercase tracking-widest text-theme-text/30">{cat}</span>
                                                        </div>
                                                        <div className="space-y-4">
                                                            {tokens.map(token => {
                                                                const isTokenDirty = draftRecord[token.id] !== undefined && JSON.stringify(draftRecord[token.id]) !== JSON.stringify((sarak as unknown as Record<string, unknown>)[token.id]);
                                                                
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
                                                                                className="absolute -top-1 -right-1 p-1 bg-[var(--sarak-status-warning-color,#f59e0b)]/20 text-[var(--sarak-status-warning-color,#f59e0b)] rounded-lg opacity-0 group-hover/token:opacity-100 transition-all hover:bg-[var(--sarak-status-warning-color,#f59e0b)] hover:text-[var(--sarak-on-warning,#020617)] shadow-lg z-10"
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
                        <div className="w-16 h-16 rounded-full bg-theme-text/5 flex items-center justify-center mb-4">
                            <Search size={24} className="text-theme-text/10" />
                        </div>
                        <h3 className="text-xs font-black uppercase text-theme-text/40 tracking-widest">Nenhum token encontrado</h3>
                        <p className="text-[var(--sarak-type-scale2xs,11px)] text-theme-text/20 mt-1 uppercase italic">Aumente a abrangência da busca</p>
                    </div>
                )}
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
                                ? 'bg-[var(--sarak-status-success-color,#10b981)]/10 border-[var(--sarak-status-success-color,#10b981)]/20 text-[var(--sarak-status-success-color,#10b981)]' 
                                : 'bg-[var(--sarak-status-warning-color,#f59e0b)]/10 border-[var(--sarak-status-warning-color,#f59e0b)]/20 text-[var(--sarak-status-warning-color,#f59e0b)]'
                        }`}>
                            <div className={`p-1.5 rounded-lg ${toast.type === 'success' ? 'bg-[var(--sarak-status-success-color,#10b981)]/20' : 'bg-[var(--sarak-status-warning-color,#f59e0b)]/20'}`}>
                                {toast.type === 'success' ? <Check size={14} /> : <Filter size={14} />}
                            </div>
                    <span className="text-[var(--sarak-type-scale2xs,11px)] font-bold uppercase tracking-wider">{toast.message}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HyperGranularityTab;
