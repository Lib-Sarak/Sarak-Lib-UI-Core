import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Check, Zap, Edit3, Monitor, Tablet, Smartphone, 
    Palette, Box, Wind, Sparkles, AlertCircle, Moon, Sun, Type, Layout as LayoutIcon,
    Globe, MousePointer2, MessageSquare, Shield, Layers, Command
} from 'lucide-react';

import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { ThemeList } from '../Library/ThemeList';
import { PreviewCanvas } from '../Canvas/PreviewCanvas';
import { PRESETS } from '../../../core/Design/presets';
import { MASTER_DESIGN_MAP } from '../../../core/Design/master-map';

// Modular Hooks & Components
import { useDesignDraft } from '../hooks/useDesignDraft';
import { 
    CategoryLabel, 
    Section, 
    ColorControl, 
    SliderControl, 
    SelectControl, 
    SwitchControl 
} from '../components/DesignControls';

/**
 * TokenControl - Renderizador dinâmico de inputs baseado no tipo do token
 */
const TokenControl = ({ token, value, onChange }: { token: any, value: any, onChange: (val: any) => void }) => {
    switch (token.type) {
        case 'color':
            return <ColorControl label={token.label} value={value} onChange={onChange} />;
        case 'slider':
            return (
                <SliderControl 
                    label={token.label} 
                    value={value} 
                    min={token.constraints?.min} 
                    max={token.constraints?.max} 
                    step={token.constraints?.step} 
                    unit={token.unit}
                    onChange={onChange} 
                />
            );
        case 'select':
        case 'font':
            return (
                <SelectControl 
                    label={token.label} 
                    options={token.constraints?.options} 
                    value={value} 
                    onChange={onChange} 
                    isFont={token.type === 'font'}
                />
            );
        case 'boolean':
            return <SwitchControl label={token.label} value={value} onChange={onChange} description={token.description} />;
        default:
            return null;
    }
};

/**
 * ThemeCustomizationTab (v12.0 - Data-Driven Evolution)
 * Orquestrador dinâmico de design baseado no Mapa Mestre.
 */
export const ThemeCustomizationTab: React.FC = () => {
    const { design, ...rest } = useSarakUI();
    const sarak = { ...design, ...rest };
    
    const { 
        draft, 
        updateDraft, 
        handleThemePreview, 
        handleApplyToSystem, 
        isPillarDirty,
        resetPillar,
        toast, 
        showToast 
    } = useDesignDraft(sarak);
    
    const [activePreviewApp, setActivePreviewApp] = useState('dashboard');
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'smartphone'>('desktop');

    const [activePillarId, setActivePillarId] = useState<string | null>('identidade');
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
    const [isDualView, setIsDualView] = useState(false);

    // 1. Dinamização de Pilares (v12.0)
    const pillars = useMemo(() => [
        { id: 'identidade', title: 'Identidade', icon: Globe, index: 1, description: 'Branding e Fundamentos' },
        { id: 'estetica', title: 'Estética', icon: Palette, index: 2, description: 'Atmosfera e Efeitos' },
        { id: 'visual', title: 'Visual', icon: Monitor, index: 3, description: 'Componentes e Dados' }
    ], []);

    // 2. Agrupamento Dinâmico de Componentes por Pilar
    const groupedComponents = useMemo(() => {
        console.log("[v13.9 Audit] Iniciando agrupamento de componentes...");
        const groups: Record<string, any[]> = { identidade: [], estetica: [], visual: [] };
        
        if (!MASTER_DESIGN_MAP || !MASTER_DESIGN_MAP.components) {
            console.error("[v13.9 Audit] ERRO CRÍTICO: MASTER_DESIGN_MAP não encontrado ou sem componentes!");
            return groups;
        }

        MASTER_DESIGN_MAP.components.forEach(comp => {
            const pillar = comp.pilar || 'visual';
            if (groups[pillar]) {
                groups[pillar].push(comp);
            } else {
                console.warn(`[v13.9 Audit] Componente ${comp.id} possui pilar desconhecido: ${pillar}`);
            }
        });
        
        // Log de Auditoria (v13.9)
        console.group(`%c [Sarak Design Engine] Pilar Coverage Audit v13.9 `, 'background: #222; color: #00f2ff; font-weight: bold;');
        Object.entries(groups).forEach(([pillar, comps]) => {
            const tokenCount = comps.reduce((acc, c) => acc + (c.tokens?.length || 0), 0);
            console.log(`Pilar: ${pillar.toUpperCase().padEnd(10)} | Módulos: ${comps.length.toString().padStart(2)} | Tokens: ${tokenCount.toString().padStart(3)}`);
        });
        console.groupEnd();
        
        return groups;
    }, []);

    // 3. Lógica de Navegação de Preview
    useEffect(() => {
        if (!activeSectionId) return;
        const mapping: Record<string, string> = {
            'chat': 'chat',
            'data': 'dashboard',
            'typography': 'typography',
            'identity': 'kitchen-sink',
            'specialized': 'auth'
        };
        const target = Object.keys(mapping).find(k => activeSectionId.includes(k));
        if (target) setActivePreviewApp(mapping[target]);
    }, [activeSectionId]);

    return (
        <div className="flex flex-1 h-full bg-[#0c0c0d] overflow-hidden">
            {/* Sidebar de Configuração (Data-Driven) */}
            <div className="w-[440px] flex flex-col border-r border-white/5 bg-[#0a0a0b] relative z-10">
                
                {/* Header e Controles Globais */}
                <div className="p-6 pb-2 shrink-0 border-b border-white/5 bg-black/20">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-[var(--theme-primary)] flex items-center justify-center shadow-[0_0_20px_rgba(var(--theme-primary-rgb),0.3)]">
                                <Zap className="text-white w-4 h-4" />
                            </div>
                            <h2 className="text-sm font-black text-white tracking-tight uppercase">Design Engine <span className="text-[var(--theme-primary)] ml-1 opacity-50">v12.0</span></h2>
                        </div>
                        <div className="flex gap-1.5 p-1 bg-white/5 rounded-xl border border-white/5">
                            {['desktop', 'tablet', 'smartphone'].map((t) => {
                                const Icon = t === 'desktop' ? Monitor : t === 'tablet' ? Tablet : Smartphone;
                                return (
                                    <button key={t} onClick={() => setPreviewDevice(t as any)} className={`p-2 rounded-lg transition-all ${previewDevice === t ? 'bg-[var(--theme-primary)] text-white shadow-lg' : 'text-white/20 hover:text-white/40'}`}>
                                        <Icon size={12} />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quick Global Settings */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex flex-col gap-1.5">
                            <span className="text-3xs font-black uppercase tracking-widest text-white/20">Modo de Exibição</span>
                            <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
                                <button onClick={() => updateDraft('mode', 'dark')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${draft.mode === 'dark' ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white/40'}`}>
                                    <Moon size={10} /> <span className="text-3xs font-black uppercase">Dark</span>
                                </button>
                                <button onClick={() => updateDraft('mode', 'light')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${draft.mode === 'light' ? 'bg-white text-black' : 'text-white/20 hover:text-white/40'}`}>
                                    <Sun size={10} /> <span className="text-3xs font-black uppercase">Light</span>
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <span className="text-3xs font-black uppercase tracking-widest text-white/20">Escala Tipográfica</span>
                            <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
                                {['pp', 'p', 'm', 'g', 'gg'].map(s => (
                                    <button key={s} onClick={() => updateDraft('fontScale', s)} className={`flex-1 py-2 rounded-lg text-3xs font-black uppercase transition-all ${draft.fontScale === s ? 'bg-[var(--theme-primary)] text-white' : 'text-white/20 hover:text-white/40'}`}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button onClick={handleApplyToSystem} className="w-full group relative overflow-hidden bg-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/90 text-white py-3.5 rounded-xl font-black text-2xs uppercase tracking-[0.2em] transition-all active:scale-[0.98] shadow-[0_15px_30px_-10px_rgba(var(--theme-primary-rgb),0.4)]">
                        <div className="flex items-center justify-center gap-3 relative z-10">
                            <Check size={12} className="group-hover:scale-125 transition-transform" />
                            <span>Aplicar ao Sistema</span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </button>
                </div>

                {/* Renderização Dinâmica por Pilar e Seção */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar-sidebar bg-black/5">
                    <style>{`
                        .custom-scrollbar-sidebar::-webkit-scrollbar {
                            width: 10px !important;
                        }
                        .custom-scrollbar-sidebar::-webkit-scrollbar-track {
                            background: rgba(0, 0, 0, 0.2) !important;
                            border-radius: 10px !important;
                            border: 1px solid rgba(255, 255, 255, 0.05) !important;
                        }
                        .custom-scrollbar-sidebar::-webkit-scrollbar-thumb {
                            background: rgba(255, 255, 255, 0.4) !important;
                            border-radius: 10px !important;
                            border: 2px solid transparent !important;
                            background-clip: content-box !important;
                        }
                        .custom-scrollbar-sidebar::-webkit-scrollbar-thumb:hover {
                            background: rgba(255, 255, 255, 0.6) !important;
                        }
                        .custom-scrollbar-sidebar {
                            scrollbar-width: auto !important;
                            scrollbar-color: rgba(255, 255, 255, 0.4) rgba(0, 0, 0, 0.2) !important;
                        }
                    `}</style>
                    <div className="pt-4 pb-20">
                        {pillars.map((pillar) => (
                            <React.Fragment key={pillar.id}>
                                <CategoryLabel 
                                    icon={pillar.icon} 
                                    title={pillar.title} 
                                    index={pillar.index} 
                                    isOpen={activePillarId === pillar.id} 
                                    onToggle={() => setActivePillarId(activePillarId === pillar.id ? null : pillar.id)}
                                    isDualView={isDualView}
                                    onToggleDual={() => setIsDualView(!isDualView)}
                                    isDirty={isPillarDirty(pillar.id)}
                                    onReset={() => resetPillar(pillar.id)}
                                />
                                <AnimatePresence>
                                    {activePillarId === pillar.id && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }} 
                                            animate={{ height: activePillarId === pillar.id ? 'auto' : 0, opacity: activePillarId === pillar.id ? 1 : 0 }} 
                                            exit={{ height: 0, opacity: 0 }} 
                                            className={`bg-white/[0.02] ${activePillarId === pillar.id ? 'overflow-visible' : 'overflow-hidden'}`}
                                        >
                                            <div className="px-1">
                                                {/* Injeção de Presets Específicos por Pilar */}
                                                <div className="p-4 bg-black/40 mb-2 border-b border-white/5 space-y-4">
                                                    <div className="flex items-center gap-2 px-2">
                                                        <Sparkles size={10} className="text-[var(--theme-primary)]" />
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Gêmeo Digital: Presets Industriais</span>
                                                    </div>
                                                    
                                                    {pillar.id === 'identidade' && (
                                                        <ThemeList 
                                                            layouts={PRESETS.themes || []} 
                                                            customThemes={[]} 
                                                            currentLayout={sarak.layout} 
                                                            previewLayoutId={draft.layout} 
                                                            onPreview={handleThemePreview} 
                                                            onApply={(id) => handleThemePreview(id)} 
                                                        />
                                                    )}

                                                    {pillar.id === 'estetica' && (
                                                        <div className="grid grid-cols-4 gap-2 px-2">
                                                            {(PRESETS.atmosphere || []).slice(0, 8).map((p: any) => (
                                                                <button 
                                                                    key={p.id}
                                                                    onClick={() => updateDraft('texture', p.id)}
                                                                    className={`aspect-square rounded-lg border transition-all flex items-center justify-center text-[8px] font-bold uppercase text-center p-1 ${draft.texture === p.id ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]/10 text-white' : 'border-white/10 bg-white/5 text-white/30 hover:border-white/30'}`}
                                                                >
                                                                    {p.label || p.name}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {pillar.id === 'visual' && (
                                                        <div className="grid grid-cols-2 gap-2 px-2">
                                                            {(PRESETS.typography || []).slice(0, 4).map((p: any) => (
                                                                <button 
                                                                    key={p.id}
                                                                    onClick={() => {
                                                                        if (p.design) {
                                                                            Object.entries(p.design).forEach(([k, v]) => updateDraft(k, v));
                                                                        }
                                                                    }}
                                                                    className={`p-2 rounded-lg border transition-all text-[8px] font-bold uppercase text-left ${draft.headingFont === p.design?.headingFont ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]/10 text-white' : 'border-white/10 bg-white/5 text-white/30 hover:border-white/30'}`}
                                                                >
                                                                    {p.label || p.name}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Renderização Dinâmica dos Componentes do Mapa Mestre */}
                                                {groupedComponents[pillar.id].map((comp) => (
                                                    <Section 
                                                        key={comp.id}
                                                        id={comp.id}
                                                        icon={Command} 
                                                        title={comp.label}
                                                        activeSection={activeSectionId}
                                                        onToggle={setActiveSectionId}
                                                    >
                                                        <div className="flex flex-col gap-4">
                                                            {comp.tokens.map((token: any) => (
                                                                <TokenControl 
                                                                    key={token.id}
                                                                    token={token}
                                                                    value={draft[token.id]}
                                                                    onChange={(val) => updateDraft(token.id, val)}
                                                                />
                                                            ))}
                                                        </div>
                                                    </Section>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            {/* Preview Canvas */}
            <div className="flex-1 relative bg-[#060607]">
                <PreviewCanvas 
                    previewDevice={previewDevice}
                    previewLayoutId={draft.layout || sarak.layout || 'glass'}
                    activePreviewApp={activePreviewApp}
                    setActivePreviewApp={setActivePreviewApp}
                    previewAnimationStyle={draft.animationStyle || sarak.animationStyle || 'standard'}
                    previewEmojiSet={draft.emojiSet || sarak.emojiSet || 'none'}
                    config={draft}
                    previewPrimaryColor={draft.colorPrimary || sarak.colorPrimary || '#3b82f6'}
                    mode={draft.mode || sarak.mode || 'dark'}
                    draftTokens={draft}
                    activeCategory={null}
                    onUpdateDraft={updateDraft}
                    isDualView={isDualView}
                    customThemes={[]}
                />

                {/* Toasts */}
                <AnimatePresence>
                    {toast && (
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[100]">
                            <div className={`px-6 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-xl border shadow-2xl ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                                {toast.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
                                <span className="text-2xs font-black uppercase tracking-widest">{toast.message}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ThemeCustomizationTab;
