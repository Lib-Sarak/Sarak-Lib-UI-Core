import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, Check, Monitor, Tablet, Smartphone, 
    Palette, Moon, Sun, Globe, AlertCircle, Sparkles, Command, RotateCcw
} from 'lucide-react';

import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
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
    SwitchControl,
    InputControl
} from '../components/DesignControls';

/**
 * TokenControl (v12.1)
 * Renderizador dinâmico de inputs com suporte total a tipos (color, slider, select, font, boolean, text, number).
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
        case 'text':
        case 'number':
            return <InputControl label={token.label} type={token.type} value={value} onChange={onChange} placeholder={token.defaultValue} />;
        default:
            return null;
    }
};

/**
 * ThemeCustomizationTab (v12.1 - Data-Driven Stabilized)
 * Orquestrador central de design. Garante cobertura total de tokens e aplicação granular.
 */
export const ThemeCustomizationTab: React.FC = () => {
    const { design, ...rest } = useSarakUI();
    const sarak = useMemo(() => ({ ...design, ...rest }), [design, rest]);
    
    const { 
        draft, 
        updateDraft, 
        handleApplyToSystem, 
        handleApplyPillar,
        isPillarDirty,
        resetPillar,
        toast 
    } = useDesignDraft(sarak);
    
    const [activePreviewApp, setActivePreviewApp] = useState('dashboard');
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'smartphone'>('desktop');

    const [activePillarId, setActivePillarId] = useState<string | null>('identidade');
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
    const [isDualView, setIsDualView] = useState(false);

    // 1. Definição de Pilares
    const pillars = useMemo(() => [
        { id: 'identidade', title: 'Identidade', icon: Globe, index: 1, description: 'Branding e Fundamentos' },
        { id: 'estetica', title: 'Estética', icon: Palette, index: 2, description: 'Atmosfera e Efeitos' },
        { id: 'visual', title: 'Visual', icon: Monitor, index: 3, description: 'Componentes e Dados' }
    ], []);

    // 2. Agrupamento Dinâmico de Componentes do Mapa Mestre
    const groupedComponents = useMemo(() => {
        const groups: Record<string, any[]> = { identidade: [], estetica: [], visual: [] };
        
        if (MASTER_DESIGN_MAP?.components) {
            MASTER_DESIGN_MAP.components.forEach(comp => {
                const pillar = comp.pilar || 'visual';
                if (groups[pillar]) groups[pillar].push(comp);
            });
        }
        
        return groups;
    }, []);

    const scrollRef = React.useRef<HTMLDivElement>(null);

    // 3. Navegação de Preview Inteligente (Baseada em Schema)
    useEffect(() => {
        if (!activeSectionId) return;
        
        // Buscamos o componente no mapa para ver se ele sugere um app de preview
        const comp = MASTER_DESIGN_MAP.components.find(c => c.id === activeSectionId);
        if (comp?.targetApp) {
            setActivePreviewApp(comp.targetApp);
        } else {
            // Fallback para mapeamento heurístico se não houver targetApp explícito
            const mapping: Record<string, string> = {
                'chat': 'chat',
                'data': 'dashboard',
                'typography': 'typography',
                'identity': 'kitchen-sink',
                'specialized': 'auth'
            };
            const target = Object.keys(mapping).find(k => activeSectionId.includes(k));
            if (target) setActivePreviewApp(mapping[target]);
        }
    }, [activeSectionId]);

    return (
        <div className="flex flex-1 h-screen max-h-screen bg-[#0c0c0d] overflow-hidden">
            {/* Sidebar de Configuração (v12.1 Stabilized) */}
            <div className="w-[440px] flex flex-col h-full max-h-full border-r border-white/5 bg-[#0a0a0b] relative z-10 overflow-hidden">
                
                {/* Header e Controles Globais */}
                <div className="p-6 pb-2 shrink-0 border-b border-white/5 bg-black/20">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-[var(--theme-primary)] flex items-center justify-center shadow-[0_0_20px_rgba(var(--theme-primary-rgb),0.3)]">
                                <Zap className="text-white w-4 h-4" />
                            </div>
                            <h2 className="text-sm font-black text-white tracking-tight uppercase">Design Engine <span className="text-[var(--theme-primary)] ml-1 opacity-50">v12.1</span></h2>
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

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex flex-col gap-1.5">
                            <span className="text-3xs font-black uppercase tracking-widest text-white/20">Modo</span>
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
                            <span className="text-3xs font-black uppercase tracking-widest text-white/20">Escala</span>
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
                            <span>Aplicar ao Sistema (Full Commit)</span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </button>
                </div>

                {/* Renderização Dinâmica por Pilar e Seção */}
                <div 
                    ref={scrollRef}
                    className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar-sidebar bg-black/5" 
                    style={{ 
                        scrollbarGutter: 'stable'
                    }}
                >
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
                                    onApply={() => handleApplyPillar(pillar.id)}
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
                                                {/* Injeção de Presets Específicos */}
                                                {(pillar.id === 'estetica' || pillar.id === 'visual') && (
                                                    <div className="p-4 bg-black/40 mb-2 border-b border-white/5 space-y-4">
                                                        <div className="flex items-center gap-2 px-2">
                                                            <Sparkles size={10} className="text-[var(--theme-primary)]" />
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Presets do Pilar</span>
                                                        </div>

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
                                                )}

                                                {/* Componentes do Mapa Mestre */}
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
                    sarak={sarak}
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

                <style dangerouslySetInnerHTML={{ __html: `
                    .custom-scrollbar-sidebar::-webkit-scrollbar {
                        width: 6px;
                    }
                    .custom-scrollbar-sidebar::-webkit-scrollbar-track {
                        background: rgba(0, 0, 0, 0.2);
                    }
                    .custom-scrollbar-sidebar::-webkit-scrollbar-thumb {
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 10px;
                        border: 1px solid rgba(255, 255, 255, 0.05);
                    }
                    .custom-scrollbar-sidebar::-webkit-scrollbar-thumb:hover {
                        background: var(--theme-primary, #00f2ff);
                        box-shadow: 0 0 10px var(--theme-primary, #00f2ff);
                    }
                    
                    /* Garantir que o container ocupe a altura total para a rolagem funcionar */
                    .design-sidebar-container {
                        height: 100%;
                        display: flex;
                        flex-direction: column;
                        overflow: hidden;
                    }
                `}} />
            </div>
        </div>
    );
};

export default ThemeCustomizationTab;
