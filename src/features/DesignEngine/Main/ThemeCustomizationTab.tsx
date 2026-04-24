import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Check, Zap, Edit3, Monitor, Tablet, Smartphone, 
    Palette, Box, Wind, Sparkles, AlertCircle
} from 'lucide-react';

import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { ThemeList } from '../Library/ThemeList';
import { PreviewCanvas } from '../Canvas/PreviewCanvas';
import { LAYOUTS } from '../../../constants/design-tokens';

// Modular Hooks & Components
import { useDesignDraft } from '../hooks/useDesignDraft';
import { CategoryLabel } from '../components/DesignControls';
import { IdentitySection } from '../Sections/IdentitySection';
import { StructureSection } from '../Sections/StructureSection';
import { AtmosphereSection } from '../Sections/AtmosphereSection';
import { EnginesSection } from '../Sections/EnginesSection';

/**
 * ThemeCustomizationTab (v7.2 - Modular Refactor)
 * Main design orchestrator for the Sarak ecosystem.
 */
export const ThemeCustomizationTab: React.FC = () => {
    const { design, ...rest } = useSarakUI();
    const sarak = { ...design, ...rest };
    // useThemePreview is partially redundant now that we use useDesignDraft for live updates,
    // but we can still use it for managing preview-only states if needed.
    // However, to fix the "not applying to preview" issue, we MUST use 'draft' in PreviewCanvas.
    
    // Logic extracted to custom hook
    const { 
        draft, 
        updateDraft, 
        handleThemePreview, 
        handleApplyToSystem, 
        toast, 
        showToast 
    } = useDesignDraft(sarak);
    
    const [activePreviewApp, setActivePreviewApp] = useState('dashboard');
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'smartphone'>('desktop');

    const [activeCategory, setActiveCategory] = useState<string | null>('id');
    const [activeSection, setActiveSection] = useState<string | null>('color-core');

    // Auto-switch preview app based on section
    useEffect(() => {
        if (activeSection === 'chat-engine') setActivePreviewApp('chat');
        else if (activeSection === 'flow-engine') setActivePreviewApp('settings');
        else if (activeSection === 'chart-engine') setActivePreviewApp('dashboard');
        else if (activeSection === 'typography') setActivePreviewApp('typography');
        else if (activeSection && [
            'color-core', 'branding', 'appearance', 
            'layout-dna', 'geometry', 
            'glassmorphism', 'textures', 'kinetics'
        ].includes(activeSection)) {
            setActivePreviewApp('kitchen-sink');
        }
    }, [activeSection]);

    return (
        <div className="flex flex-1 h-[800px] bg-[#0c0c0d] overflow-hidden">
            {/* Sidebar de Configuração */}
            <div className="w-[420px] flex flex-col border-r border-white/5 bg-[#0a0a0b] relative z-10">
                <div className="p-8 pb-4 shrink-0 bg-gradient-to-b from-black/40 to-transparent">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-[var(--theme-primary)] flex items-center justify-center shadow-[0_0_30px_rgba(var(--theme-primary-rgb),0.3)]">
                                <Palette className="text-white w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-white tracking-tight uppercase">Design Engine</h2>
                                <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Sovereignty v7.2.4</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {['desktop', 'tablet', 'smartphone'].map((t) => {
                                const Icon = t === 'desktop' ? Monitor : t === 'tablet' ? Tablet : Smartphone;
                                return (
                                    <button key={t} onClick={() => setPreviewDevice(t as any)} className={`p-2 rounded-lg transition-all ${previewDevice === t ? 'bg-[var(--theme-primary)]/20 text-[var(--theme-primary)]' : 'bg-white/5 text-white/20 hover:text-white/40'}`}>
                                        <Icon size={12} />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <button onClick={handleApplyToSystem} className="w-full group relative overflow-hidden bg-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/90 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-[0.98] shadow-[0_20px_40px_-10px_rgba(var(--theme-primary-rgb),0.4)]">
                        <div className="flex items-center justify-center gap-3 relative z-10">
                            <Zap size={14} className="group-hover:animate-pulse" />
                            <span>Aplicar ao Sistema</span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </button>
                </div>

                {/* Scrollable Configuration Areas */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="py-2">
                        {/* 0. BIBLIOTECA DE TEMAS */}
                        <CategoryLabel icon={Edit3} title="Modelos & Presets" index={0} isOpen={activeCategory === 'presets'} onToggle={() => setActiveCategory(activeCategory === 'presets' ? null : 'presets')} />
                        <AnimatePresence>
                            {activeCategory === 'presets' && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-black/40">
                                    <div className="p-4">
                                        <ThemeList 
                                            layouts={LAYOUTS} 
                                            customThemes={[]} 
                                            currentLayout={sarak.layout} 
                                            previewLayoutId={draft.layout} 
                                            onPreview={handleThemePreview} 
                                            onApply={(id) => { handleThemePreview(id); handleApplyToSystem(); }} 
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 1. IDENTIDADE */}
                        <CategoryLabel icon={Palette} title="Identidade & Presença" index={1} isOpen={activeCategory === 'id'} onToggle={() => setActiveCategory(activeCategory === 'id' ? null : 'id')} />
                        <AnimatePresence>
                            {activeCategory === 'id' && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                    <IdentitySection draft={draft} updateDraft={updateDraft} activeSection={activeSection} setActiveSection={setActiveSection} showToast={showToast} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 2. DNA ESTRUTURAL */}
                        <CategoryLabel icon={Box} title="DNA Estrutural" index={2} isOpen={activeCategory === 'dna'} onToggle={() => setActiveCategory(activeCategory === 'dna' ? null : 'dna')} />
                        <AnimatePresence>
                            {activeCategory === 'dna' && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                    <StructureSection draft={draft} updateDraft={updateDraft} activeSection={activeSection} setActiveSection={setActiveSection} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 3. ATMOSFERA */}
                        <CategoryLabel icon={Wind} title="Atmosfera & Profundidade" index={3} isOpen={activeCategory === 'env'} onToggle={() => setActiveCategory(activeCategory === 'env' ? null : 'env')} />
                        <AnimatePresence>
                            {activeCategory === 'env' && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                    <AtmosphereSection draft={draft} updateDraft={updateDraft} activeSection={activeSection} setActiveSection={setActiveSection} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 4. MOTORES ATÔMICOS */}
                        <CategoryLabel icon={Zap} title="Motores de Experiência" index={4} isOpen={activeCategory === 'engines'} onToggle={() => setActiveCategory(activeCategory === 'engines' ? null : 'engines')} />
                        <AnimatePresence>
                            {activeCategory === 'engines' && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                    <EnginesSection draft={draft} updateDraft={updateDraft} activeSection={activeSection} setActiveSection={setActiveSection} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Preview Canvas (Source of Truth Display) */}
            <div className="flex-1 relative bg-[#060607]">
                <PreviewCanvas 
                    previewDevice={previewDevice}
                    previewLayoutId={draft.layout || sarak.layout || 'glass'}
                    activePreviewApp={activePreviewApp}
                    setActivePreviewApp={setActivePreviewApp}
                    previewAnimationStyle={draft.animationStyle || sarak.animationStyle || 'standard'}
                    previewEmojiSet={draft.emojiSet || sarak.emojiSet || 'none'}
                    config={draft}
                    previewPrimaryColor={draft.primaryColor || sarak.primaryColor || '#3b82f6'}
                    mode={draft.mode || sarak.mode || 'dark'}
                    draftTokens={draft}
                />
                
                {/* Toast de Confirmação */}
                <AnimatePresence>
                    {toast && (
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[100]">
                            <div className={`px-6 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-xl border shadow-2xl ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                                {toast.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
                                <span className="text-[10px] font-black uppercase tracking-widest">{toast.message}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ThemeCustomizationTab;
