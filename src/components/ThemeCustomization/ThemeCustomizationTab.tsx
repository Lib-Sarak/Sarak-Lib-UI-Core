import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Check, Zap, Edit3, ChevronLeft, ChevronDown,
    Monitor, Tablet, Smartphone, Grid, List, Keyboard, Globe, Moon, Sun, 
    Type, Maximize, Layout as LayoutIcon, Sidebar as SidebarIcon,
    Layers, MousePointer2, Palette, Box, Wind, Sparkles, AlertCircle
} from 'lucide-react';

import { useSarak, PRIMARY_COLORS, SCALES, DENSITY, BASE_PRESETS } from '@sarak/lib-shared';
import { useThemePreview } from './useThemePreview';
import { ThemeList } from './ThemeList';
import { PreviewCanvas } from './PreviewCanvas';

export const ThemeCustomizationTab: React.FC = () => {
    const sarak = useSarak();
    
    // --- ESTADO DE RASCUNHO (DESIGN DRAFT v5.6) ---
    // Este estado controla apenas o que aparece no Preview. 
    // Nada é persistido globalmente até o clique em "Aplicar".
    const [draft, setDraft] = useState({
        layout: sarak.layout,
        mode: sarak.mode,
        primaryColor: sarak.primaryColor,
        navigationStyle: sarak.navigationStyle,
        sidebarWidth: sarak.sidebarWidth,
        fontScale: sarak.fontScale,
        layoutDensity: sarak.layoutDensity,
        texture: sarak.texture,
        headingFont: sarak.headingFont,
        subtitleFont: sarak.subtitleFont,
        bodyFont: sarak.bodyFont,
        headingWeight: sarak.headingWeight,
        headingLetterSpacing: sarak.headingLetterSpacing,
        borderRadius: sarak.borderRadius,
        borderWidth: sarak.borderWidth,
        borderStyle: sarak.borderStyle,
        glassOpacity: sarak.glassOpacity,
        glassBlur: sarak.glassBlur,
        shadowIntensity: sarak.shadowIntensity,
        isGeometricCut: sarak.isGeometricCut,
        textureOpacity: sarak.textureOpacity,
        animationSpeed: sarak.animationSpeed
    });

    const [activeSection, setActiveSection] = useState<string | null>('arch');
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'smartphone'>('desktop');
    const [activePreviewApp, setActivePreviewApp] = useState('dashboard');
    const [toast, setToast] = useState<{ type: 'success' | 'warning', message: string } | null>(null);

    // Sync draft with global only on initial load or reset
    useEffect(() => {
        setDraft({
            layout: sarak.layout, mode: sarak.mode, primaryColor: sarak.primaryColor,
            navigationStyle: sarak.navigationStyle, sidebarWidth: sarak.sidebarWidth,
            fontScale: sarak.fontScale, layoutDensity: sarak.layoutDensity, texture: sarak.texture,
            headingFont: sarak.headingFont, subtitleFont: sarak.subtitleFont, bodyFont: sarak.bodyFont,
            headingWeight: sarak.headingWeight, headingLetterSpacing: sarak.headingLetterSpacing,
            borderRadius: sarak.borderRadius, borderWidth: sarak.borderWidth, borderStyle: sarak.borderStyle,
            glassOpacity: sarak.glassOpacity, glassBlur: sarak.glassBlur, shadowIntensity: sarak.shadowIntensity,
            isGeometricCut: sarak.isGeometricCut, textureOpacity: sarak.textureOpacity, animationSpeed: sarak.animationSpeed
        });
    }, [sarak.isHydrated]);

    const showToast = (type: 'success' | 'warning', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    // --- LOGIC: APPLY THEME PRESET TO DRAFT ---
    const handleThemePreview = (id: string) => {
        const preset = (BASE_PRESETS as any)[id.toLowerCase()];
        if (!preset) return;

        // Mapeia tokens CSS do preset para o estado atômico do Draft
        const newDraft = { ...draft, layout: id };
        
        if (preset['--radius-theme']) newDraft.borderRadius = parseInt(preset['--radius-theme']);
        if (preset['--glass-blur']) newDraft.glassBlur = parseInt(preset['--glass-blur']);
        if (preset['--glass-opacity']) newDraft.glassOpacity = parseFloat(preset['--glass-opacity']);
        if (preset['--border-width']) newDraft.borderWidth = parseInt(preset['--border-width']);
        if (preset['--shadow-intensity']) newDraft.shadowIntensity = parseFloat(preset['--shadow-intensity']);
        if (preset['--bg-texture']) newDraft.texture = preset['--bg-texture'];
        if (preset['--theme-primary']) newDraft.primaryColor = preset['--theme-primary'];
        
        // Fontes
        if (preset['--font-heading']) newDraft.headingFont = preset['--font-heading'];
        if (preset['--font-subtitle']) newDraft.subtitleFont = preset['--font-subtitle'];
        if (preset['--font-main']) newDraft.bodyFont = preset['--font-main'];
        if (preset['--font-weight-heading']) newDraft.headingWeight = preset['--font-weight-heading'];

        setDraft(newDraft);
        console.log(`%c🎨 [Matrix Design] Preview Archetype: ${id}`, 'color: #a855f7; font-weight: bold;');
    };

    // --- LOGIC: COMMIT DRAFT TO SYSTEM ---
    const handleApplyToSystem = () => {
        console.group('%c🚀 [Matrix Trace] Committing Design Engine v5.6', 'background: #0f172a; color: #38bdf8; padding: 4px;');
        
        sarak.setLayout(draft.layout);
        sarak.setMode(draft.mode);
        sarak.setPrimaryColor(draft.primaryColor);
        sarak.setNavigationStyle(draft.navigationStyle);
        sarak.setSidebarWidth(draft.sidebarWidth);
        sarak.setFontScale(draft.fontScale);
        sarak.setLayoutDensity(draft.layoutDensity);
        sarak.setTexture(draft.texture);
        sarak.setHeadingFont(draft.headingFont);
        sarak.setSubtitleFont(draft.subtitleFont);
        sarak.setBodyFont(draft.bodyFont);
        sarak.setHeadingWeight(draft.headingWeight);
        sarak.setHeadingLetterSpacing(draft.headingLetterSpacing);
        sarak.setBorderRadius(draft.borderRadius);
        sarak.setBorderWidth(draft.borderWidth);
        sarak.setBorderStyle(draft.borderStyle);
        sarak.setGlassOpacity(draft.glassOpacity);
        sarak.setGlassBlur(draft.glassBlur);
        sarak.setShadowIntensity(draft.shadowIntensity);
        sarak.setIsGeometricCut(draft.isGeometricCut);
        sarak.setTextureOpacity(draft.textureOpacity);
        sarak.setAnimationSpeed(draft.animationSpeed);

        console.log('✅ Final System Commit executed successfully.');
        console.groupEnd();

        showToast('success', 'Design aplicado com sucesso a todo o sistema.');
    };

    const fonts = [
        { id: "", label: 'Default (System)' },
        { id: "'Inter', sans-serif", label: 'Inter' },
        { id: "'Outfit', sans-serif", label: 'Outfit' },
        { id: "'Space Grotesk', sans-serif", label: 'Space Grotesk' },
        { id: "'JetBrains Mono', monospace", label: 'JetBrains Mono' },
        { id: "'Fira Code', monospace", label: 'Fira Code' },
        { id: "'Satoshi', sans-serif", label: 'Satoshi' },
        { id: "'Crimson Pro', serif", label: 'Crimson Pro' },
        { id: "'Syncopate', sans-serif", label: 'Syncopate' }
    ];

    const textures = [
        { id: 'none', label: 'Nenhum' },
        { id: 'grid', label: 'Grid' },
        { id: 'dots', label: 'Dots' },
        { id: 'noise', label: 'Noise' },
        { id: 'carbon', label: 'Carbon' },
        { id: 'topo', label: 'Topo' },
        { id: 'hexagon', label: 'Hex' },
        { id: 'circuit', label: 'Circuit' },
        { id: 'scanlines', label: 'Scan' },
        { id: 'silk', label: 'Silk' },
        { id: 'blueprint', label: 'Blueprint' },
        { id: 'aurora', label: 'Aurora' },
        { id: 'bubbles', label: 'Bubbles' }
    ];

    const updateDraft = (key: string, value: any) => setDraft(prev => ({ ...prev, [key]: value }));

    const SliderControl = ({ label, value, min, max, step = 1, onChange, suffix = '' }: any) => (
        <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{label}</span>
                <span className="text-[10px] font-mono text-[var(--theme-primary)]">{value}{suffix}</span>
            </div>
            <input 
                type="range" min={min} max={max} step={step} value={value} 
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-[var(--theme-primary)]"
            />
        </div>
    );

    const SelectControl = ({ label, options, value, onChange, isFont = false }: any) => (
        <div className="mb-4">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block mb-2">{label}</span>
            <select 
                value={value} 
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-[11px] font-bold focus:border-[var(--theme-primary)] focus:outline-none transition-all text-white/80"
                style={isFont ? { fontFamily: value } : {}}
            >
                {options.map((opt: any) => (
                    <option key={opt.id || opt} value={opt.id || opt} className="bg-[#0a0a0b]">{opt.label || opt}</option>
                ))}
            </select>
        </div>
    );

    const Section = ({ id, icon: Icon, title, children }: any) => (
        <div className="border-b border-white/5 last:border-0">
            <button onClick={() => setActiveSection(activeSection === id ? null : id)} className="w-full py-4 flex items-center justify-between hover:bg-white/[0.02] transition-all px-6 group">
                <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg transition-all ${activeSection === id ? 'bg-[var(--theme-primary)] text-white' : 'bg-white/5 text-white/30 group-hover:text-white/60'}`}><Icon size={14} /></div>
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeSection === id ? 'text-white' : 'text-white/30 group-hover:text-white/60'}`}>{title}</span>
                </div>
                <ChevronDown size={14} className={`transition-transform duration-300 ${activeSection === id ? 'rotate-180 text-[var(--theme-primary)]' : 'text-white/20'}`} />
            </button>
            <AnimatePresence>
                {activeSection === id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-black/20">
                        <div className="p-6 pt-2">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    return (
        <div className="flex grow overflow-hidden bg-[#0a0a0b] text-white/80 rounded-[var(--radius-theme)] border border-white/5 h-full min-h-0 relative">
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl border shadow-2xl text-sm font-bold flex items-center gap-2 ${toast.type === 'success' ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-amber-500 border-amber-400 text-white'}`}
                    >
                        {toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex w-full h-full overflow-hidden">
                {/* LEFT SIDE: DESIGN ENGINE */}
                <aside className="w-[360px] bg-[#0c0c0d] border-r border-white/5 flex flex-col shrink-0 relative z-20">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/20 shadow-[0_0_15px_rgba(var(--theme-primary-rgb),0.1)]">
                                <Palette size={16} className="text-[var(--theme-primary)]" />
                            </div>
                            <div>
                                <h2 className="text-xs font-black tracking-tighter uppercase italic">Design Engine</h2>
                                <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Sarak Matrix v5.6</p>
                            </div>
                        </div>
                        <div className="flex gap-1 p-1 bg-black/40 rounded-lg border border-white/5">
                            <button onClick={() => updateDraft('mode', 'dark')} className={`p-1.5 rounded-md transition-all ${draft.mode === 'dark' ? 'bg-[var(--theme-primary)] text-white shadow-lg' : 'text-white/20'}`}><Moon size={12} /></button>
                            <button onClick={() => updateDraft('mode', 'light')} className={`p-1.5 rounded-md transition-all ${draft.mode === 'light' ? 'bg-[var(--theme-primary)] text-white shadow-lg' : 'text-white/20'}`}><Sun size={12} /></button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <Section id="arch" icon={SidebarIcon} title="Arquitetura">
                            <div className="grid grid-cols-2 gap-2 mb-6">
                                <button onClick={() => updateDraft('navigationStyle', 'sidebar')} className={`p-3 rounded-xl border transition-all ${draft.navigationStyle === 'sidebar' ? 'bg-[var(--theme-primary)]/10 border-[var(--theme-primary)] text-[var(--theme-primary)]' : 'bg-white/5 border-transparent text-white/20 hover:text-white'}`}>
                                    <SidebarIcon size={16} className="mx-auto mb-2" /><span className="text-[8px] font-black uppercase block">Sidebar</span>
                                </button>
                                <button onClick={() => updateDraft('navigationStyle', 'topbar')} className={`p-3 rounded-xl border transition-all ${draft.navigationStyle === 'topbar' ? 'bg-[var(--theme-primary)]/10 border-[var(--theme-primary)] text-[var(--theme-primary)]' : 'bg-white/5 border-transparent text-white/20 hover:text-white'}`}>
                                    <Maximize size={16} className="mx-auto mb-2" /><span className="text-[8px] font-black uppercase block">Topbar</span>
                                </button>
                            </div>
                            <SliderControl label="Largura Sidebar" value={draft.sidebarWidth} min={60} max={400} onChange={(v: any) => updateDraft('sidebarWidth', v)} suffix="px" />
                            <div className="grid grid-cols-3 gap-1 p-1 bg-black/20 rounded-xl border border-white/5 mt-4">
                                {Object.values(DENSITY).map(d => (
                                    <button key={d.id} onClick={() => updateDraft('layoutDensity', d.id)} className={`py-2 rounded-lg text-[8px] font-black uppercase transition-all ${draft.layoutDensity === d.id ? 'bg-[var(--theme-primary)] text-white shadow-lg' : 'text-white/20'}`}>{d.label}</button>
                                ))}
                            </div>
                        </Section>

                        <Section id="type" icon={Type} title="Tipografia">
                            <SelectControl label="Fonte Título" options={fonts} value={draft.headingFont} onChange={(v: any) => updateDraft('headingFont', v)} isFont />
                            <SelectControl label="Fonte Subtítulo" options={fonts} value={draft.subtitleFont} onChange={(v: any) => updateDraft('subtitleFont', v)} isFont />
                            <SelectControl label="Fonte Texto" options={fonts} value={draft.bodyFont} onChange={(v: any) => updateDraft('bodyFont', v)} isFont />
                            <div className="grid grid-cols-2 gap-4">
                                <SelectControl label="Peso" options={['300', '400', '600', '800', '900']} value={draft.headingWeight} onChange={(v: any) => updateDraft('headingWeight', v)} />
                                <SelectControl label="Espaçamento" options={['tight', 'normal', 'wide', 'widest']} value={draft.headingLetterSpacing} onChange={(v: any) => updateDraft('headingLetterSpacing', v)} />
                            </div>
                        </Section>

                        <Section id="geom" icon={Box} title="Geometria">
                            <SliderControl label="Radius" value={draft.borderRadius} min={0} max={60} onChange={(v: any) => updateDraft('borderRadius', v)} suffix="px" />
                            <SliderControl label="Borda" value={draft.borderWidth} min={0} max={8} onChange={(v: any) => updateDraft('borderWidth', v)} suffix="px" />
                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 mt-4 group">
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Cortes Geométricos</span>
                                <button onClick={() => updateDraft('isGeometricCut', !draft.isGeometricCut)} className={`w-10 h-5 rounded-full relative transition-all ${draft.isGeometricCut ? 'bg-[var(--theme-primary)]' : 'bg-white/10'}`}>
                                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${draft.isGeometricCut ? 'left-6' : 'left-1'}`} />
                                </button>
                            </div>
                            <SliderControl label="Sombra" value={draft.shadowIntensity} min={0} max={1} step={0.1} onChange={(v: any) => updateDraft('shadowIntensity', v)} />
                        </Section>

                        <Section id="atmos" icon={Wind} title="Atmosfera">
                            <SliderControl label="Opacity Glass" value={draft.glassOpacity} min={0} max={1} step={0.05} onChange={(v: any) => updateDraft('glassOpacity', v)} />
                            <SliderControl label="Blur Glass" value={draft.glassBlur} min={0} max={60} onChange={(v: any) => updateDraft('glassBlur', v)} suffix="px" />
                            <div className="mb-6">
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block mb-3">Texturas</span>
                                <div className="flex flex-wrap gap-2">
                                    {textures.map(tex => (
                                        <button key={tex.id} onClick={() => updateDraft('texture', tex.id)} className={`px-3 py-1 rounded-full border text-[8px] font-black uppercase transition-all ${draft.texture === tex.id ? 'bg-[var(--theme-primary)] border-transparent text-white shadow-lg' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}>{tex.label}</button>
                                    ))}
                                </div>
                            </div>
                            <SliderControl label="Opacidade Textura" value={draft.textureOpacity} min={0} max={0.3} step={0.01} onChange={(v: any) => updateDraft('textureOpacity', v)} />
                        </Section>

                        <Section id="motion" icon={Zap} title="Movimento & Cor">
                            <SliderControl label="Velocidade" value={draft.animationSpeed} min={0} max={1} step={0.05} onChange={(v: any) => updateDraft('animationSpeed', v)} suffix="s" />
                            <div className="mt-4">
                                <div className="grid grid-cols-7 gap-2">
                                    {PRIMARY_COLORS.map((color, i) => (
                                        <button key={i} onClick={() => updateDraft('primaryColor', color.value)} className={`w-full aspect-square rounded-full transition-all hover:scale-125 relative ${draft.primaryColor === color.value ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0c0c0d] scale-110' : 'opacity-80'}`} style={{ backgroundColor: color.value }}>
                                            {draft.primaryColor === color.value && <Check size={10} className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </Section>
                    </div>

                    <div className="p-6 bg-black/40 border-t border-white/5">
                         <button onClick={handleApplyToSystem} className="w-full py-4 rounded-xl bg-gradient-to-r from-[var(--theme-primary)] to-indigo-600 text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                            <Sparkles size={14} /> Aplicar ao Sistema
                        </button>
                    </div>
                </aside>

                {/* RIGHT SIDE: PREVIEW */}
                <main className="flex-1 flex flex-col min-w-0 bg-[#000] relative">
                    <div className="h-16 px-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-4">
                            <div className="flex gap-1 p-1 bg-black/40 rounded-lg border border-white/5">
                                <button onClick={() => setPreviewDevice('desktop')} className={`px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${previewDevice === 'desktop' ? 'bg-white/10 text-white' : 'text-white/20'}`}>Desktop</button>
                                <button onClick={() => setPreviewDevice('tablet')} className={`px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${previewDevice === 'tablet' ? 'bg-white/10 text-white' : 'text-white/20'}`}>Tablet</button>
                                <button onClick={() => setPreviewDevice('smartphone')} className={`px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${previewDevice === 'smartphone' ? 'bg-white/10 text-white' : 'text-white/20'}`}>Mobile</button>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/20 text-[var(--theme-primary)]">
                            <Zap size={12} className="fill-current" /><span className="text-[9px] font-black uppercase tracking-widest">Live Forge v5.6</span>
                        </div>
                    </div>

                    <div className="flex-1 flex overflow-hidden">
                        <div className="w-[360px] border-r border-white/5 flex flex-col bg-white/[0.01] overflow-y-auto custom-scrollbar">
                            <div className="p-6">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-6 flex items-center gap-2">
                                    <div className="w-8 h-[1px] bg-white/10" /> Archetypes
                                </h2>
                                <ThemeList
                                    layouts={sarak.layouts}
                                    customThemes={[]}
                                    currentLayout={sarak.layout}
                                    previewLayoutId={draft.layout}
                                    onPreview={handleThemePreview}
                                    onApply={handleThemePreview}
                                />
                            </div>
                        </div>

                        <div className="flex-1 relative overflow-hidden bg-[#050505]">
                            <PreviewCanvas
                                previewDevice={previewDevice}
                                previewLayoutId={draft.layout}
                                activePreviewApp={activePreviewApp}
                                setActivePreviewApp={setActivePreviewApp}
                                previewAnimationStyle={sarak.animationStyle}
                                previewEmojiSet={sarak.emojiSet}
                                config={{}}
                                previewPrimaryColor={draft.primaryColor}
                                mode={draft.mode}
                                // Passando Tokens de Rascunho para o Canvas
                                draftTokens={draft}
                            />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ThemeCustomizationTab;
