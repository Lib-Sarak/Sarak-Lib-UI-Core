import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Check, Zap, Edit3, Monitor, Tablet, Smartphone, 
    Palette, Box, Wind, Sparkles, AlertCircle, Moon, Sun, Type, Layout as LayoutIcon,
    Globe, MousePointer2, MessageSquare
} from 'lucide-react';

import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { ThemeList } from '../Library/ThemeList';
import { PreviewCanvas } from '../Canvas/PreviewCanvas';
import { LAYOUTS } from '../../../constants/design-tokens';

// Modular Hooks & Components
import { useDesignDraft } from '../hooks/useDesignDraft';
import { CategoryLabel } from '../components/DesignControls';
import { BrandingSection } from '../Sections/BrandingSection';
import { TypographySection } from '../Sections/TypographySection';
import { VisualsSection } from '../Sections/VisualsSection';
import { CardsSection } from '../Sections/CardsSection';
import { AnimationSection } from '../Sections/AnimationSection';
import { ComponentsSection } from '../Sections/ComponentsSection';
import { DashboardSection } from '../Sections/DashboardSection';
import { ChatSection } from '../Sections/ChatSection';
import { LayoutSection } from '../Sections/LayoutSection';
import { VisualizationSection } from '../Sections/VisualizationSection';

/**
 * ThemeCustomizationTab (v8.0 - Sovereign Reorganization)
 * Main design orchestrator for the Sarak ecosystem.
 */
export const ThemeCustomizationTab: React.FC = () => {
    const { design, ...rest } = useSarakUI();
    const sarak = { ...design, ...rest };
    
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

    const [activeCategory, setActiveCategory] = useState<string | null>('presets');
    const [activeSection, setActiveSection] = useState<string | null>(null);

    // Auto-switch preview app based on section
    useEffect(() => {
        if (activeSection === 'chat-bubbles' || activeSection === 'chat-dynamics') setActivePreviewApp('chat');
        else if (activeSection === 'chart-visuals' || activeSection === 'chart-geometry') setActivePreviewApp('dashboard');
        else if (activeSection === 'font-families' || activeSection === 'font-refinement') setActivePreviewApp('typography');
        else if (activeSection && [
            'color-core', 'brand-identity', 'brand-metrics',
            'layout-dna', 'card-geometry', 'card-atmosphere', 'card-shadows',
            'textures-core', 'kinetics', 'effects-refinement', 'button-styles'
        ].includes(activeSection)) {
            setActivePreviewApp('kitchen-sink');
        }
    }, [activeSection]);

    return (
        <div className="flex flex-1 h-[800px] bg-[#0c0c0d] overflow-hidden">
            {/* Sidebar de Configuração */}
            <div className="w-[440px] flex flex-col border-r border-white/5 bg-[#0a0a0b] relative z-10">
                
                {/* 1. Global Controls Header */}
                <div className="p-6 pb-2 shrink-0 border-b border-white/5 bg-black/20">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-[var(--theme-primary)] flex items-center justify-center shadow-[0_0_20px_rgba(var(--theme-primary-rgb),0.3)]">
                                <Zap className="text-white w-4 h-4" />
                            </div>
                            <h2 className="text-sm font-black text-white tracking-tight uppercase">Design Engine</h2>
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

                {/* Scrollable Configuration Areas */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="pb-8">
                        {/* 0. BIBLIOTECA DE TEMAS */}
                        <CategoryLabel icon={Edit3} title="Modelos & Projetos" index={0} isOpen={activeCategory === 'presets'} onToggle={() => setActiveCategory(activeCategory === 'presets' ? null : 'presets')} />
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

                        {/* 1. CARDS */}
                        <CategoryLabel icon={Box} title="Cards & Containers" index={1} isOpen={activeCategory === 'cards'} onToggle={() => setActiveCategory(activeCategory === 'cards' ? null : 'cards')} />
                        <AnimatePresence>
                            {activeCategory === 'cards' && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                    <CardsSection draft={draft} updateDraft={updateDraft} activeSection={activeSection} setActiveSection={setActiveSection} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 2. FONTES */}
                        <CategoryLabel icon={Type} title="Fontes & Tipografia" index={2} isOpen={activeCategory === 'fonts'} onToggle={() => setActiveCategory(activeCategory === 'fonts' ? null : 'fonts')} />
                        <AnimatePresence>
                            {activeCategory === 'fonts' && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                    <TypographySection draft={draft} updateDraft={updateDraft} activeSection={activeSection} setActiveSection={setActiveSection} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 3. ANIMAÇÕES */}
                        <CategoryLabel icon={Sparkles} title="Efeitos & Animações" index={3} isOpen={activeCategory === 'animations'} onToggle={() => setActiveCategory(activeCategory === 'animations' ? null : 'animations')} />
                        <AnimatePresence>
                            {activeCategory === 'animations' && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                    <AnimationSection draft={draft} updateDraft={updateDraft} activeSection={activeSection} setActiveSection={setActiveSection} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 4. BRANDING */}
                        <CategoryLabel icon={Globe} title="Branding & Identidade" index={4} isOpen={activeCategory === 'branding'} onToggle={() => setActiveCategory(activeCategory === 'branding' ? null : 'branding')} />
                        <AnimatePresence>
                            {activeCategory === 'branding' && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                    <BrandingSection draft={draft} updateDraft={updateDraft} activeSection={activeSection} setActiveSection={setActiveSection} showToast={showToast} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 5. CORES E TEXTURAS */}
                        <CategoryLabel icon={Palette} title="Cores & Texturas" index={5} isOpen={activeCategory === 'visuals'} onToggle={() => setActiveCategory(activeCategory === 'visuals' ? null : 'visuals')} />
                        <AnimatePresence>
                            {activeCategory === 'visuals' && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                    <VisualsSection draft={draft} updateDraft={updateDraft} activeSection={activeSection} setActiveSection={setActiveSection} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 6. COMPONENTES */}
                        <CategoryLabel icon={MousePointer2} title="Botões & Componentes" index={6} isOpen={activeCategory === 'components'} onToggle={() => setActiveCategory(activeCategory === 'components' ? null : 'components')} />
                        <AnimatePresence>
                            {activeCategory === 'components' && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                    <ComponentsSection draft={draft} updateDraft={updateDraft} activeSection={activeSection} setActiveSection={setActiveSection} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 7. DASHBOARD */}
                        <CategoryLabel icon={Monitor} title="Dashboard & Gráficos" index={7} isOpen={activeCategory === 'dashboard'} onToggle={() => setActiveCategory(activeCategory === 'dashboard' ? null : 'dashboard')} />
                        <AnimatePresence>
                            {activeCategory === 'dashboard' && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                    <DashboardSection draft={draft} updateDraft={updateDraft} activeSection={activeSection} setActiveSection={setActiveSection} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 8. CHATS */}
                        <CategoryLabel icon={MessageSquare} title="Chats & Conversas" index={8} isOpen={activeCategory === 'chats'} onToggle={() => setActiveCategory(activeCategory === 'chats' ? null : 'chats')} />
                        <AnimatePresence>
                            {activeCategory === 'chats' && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                    <ChatSection draft={draft} updateDraft={updateDraft} activeSection={activeSection} setActiveSection={setActiveSection} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 9. VISUALIZAÇÃO 3D & MAPAS */}
                        <CategoryLabel icon={Globe} title="Visualização 3D & Mapas" index={9} isOpen={activeCategory === 'visuals-3d'} onToggle={() => setActiveCategory(activeCategory === 'visuals-3d' ? null : 'visuals-3d')} />
                        <AnimatePresence>
                            {activeCategory === 'visuals-3d' && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                    <VisualizationSection draft={draft} updateDraft={updateDraft} activeSection={activeSection} setActiveSection={setActiveSection} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 10. LAYOUT */}
                        <CategoryLabel icon={LayoutIcon} title="Layout & Estrutura" index={10} isOpen={activeCategory === 'layout'} onToggle={() => setActiveCategory(activeCategory === 'layout' ? null : 'layout')} />
                        <AnimatePresence>
                            {activeCategory === 'layout' && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                    <LayoutSection draft={draft} updateDraft={updateDraft} activeSection={activeSection} setActiveSection={setActiveSection} />
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
                    activeCategory={activeCategory}
                    onUpdateDraft={updateDraft}
                />
                
                {/* Toast de Confirmação */}
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

