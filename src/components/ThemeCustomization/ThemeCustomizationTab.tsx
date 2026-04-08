import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Check, Zap, Edit3, ChevronLeft, ChevronDown,
    Monitor, Tablet, Smartphone, Grid, List, Keyboard, Globe, Moon, Sun, 
    Type, Maximize, Layout as LayoutIcon, Sidebar as SidebarIcon,
    Layers, MousePointer2, Palette, Box, Wind, Sparkles
} from 'lucide-react';

import { useSarak } from '@sarak/lib-shared';
import { useThemePreview } from './useThemePreview';
import { ThemeList } from './ThemeList';
import { PreviewCanvas } from './PreviewCanvas';
import { PRIMARY_COLORS, SCALES, DENSITY } from '@sarak/lib-shared';

export const ThemeCustomizationTab: React.FC = () => {
    const {
        layout: currentLayout, setLayout,
        mode, setMode,
        primaryColor, setPrimaryColor,
        navigationStyle, setNavigationStyle,
        sidebarWidth, setSidebarWidth,
        layouts, customThemes,
        fontScale, setFontScale,
        layoutDensity, setLayoutDensity,
        animationStyle: globalAnimationStyle, setAnimationStyle: setGlobalAnimationStyle,
        emojiSet: globalEmojiSet, setEmojiSet: setGlobalEmojiSet,
        texture, setTexture,
        
        // Novos Tokens 5.5
        headingFont, setHeadingFont,
        subtitleFont, setSubtitleFont,
        bodyFont, setBodyFont,
        headingWeight, setHeadingWeight,
        headingLetterSpacing, setHeadingLetterSpacing,
        borderRadius, setBorderRadius,
        borderWidth, setBorderWidth,
        borderStyle, setBorderStyle,
        glassOpacity, setGlassOpacity,
        glassBlur, setGlassBlur,
        shadowIntensity, setShadowIntensity,
        isGeometricCut, setIsGeometricCut,
        textureOpacity, setTextureOpacity,
        animationSpeed, setAnimationSpeed
    } = useSarak();

    const [activeSection, setActiveSection] = useState<string | null>('geom');
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'smartphone'>('desktop');
    const [activePreviewApp, setActivePreviewApp] = useState('dashboard');
    const [toast, setToast] = useState<{ type: 'success' | 'warning', message: string } | null>(null);

    const fonts = [
        { id: "'Inter', sans-serif", label: 'Inter' },
        { id: "'Outfit', sans-serif", label: 'Outfit' },
        { id: "'Space Grotesk', sans-serif", label: 'Space Grotesk' },
        { id: "'JetBrains Mono', monospace", label: 'JetBrains Mono' },
        { id: "'Fira Code', monospace", label: 'Fira Code' },
        { id: "'Satoshi', sans-serif", label: 'Satoshi' },
        { id: "'Crimson Pro', serif", label: 'Crimson Pro' },
        { id: "'Syncopate', sans-serif", label: 'Syncopate' },
        { id: "'Tenor Sans', sans-serif", label: 'Tenor Sans' }
    ];

    const textures = [
        { id: 'none', label: 'Nenhum' },
        { id: 'grid', label: 'Grid' },
        { id: 'dots', label: 'Dots' },
        { id: 'noise', label: 'Noise' },
        { id: 'carbon', label: 'Carbon' },
        { id: 'topo', label: 'Topo' },
        { id: 'hexagon', label: 'Hex' },
        { id: 'circuit', label: 'Circuit' }
    ];

    const borderStyles = [
        { id: 'solid', label: 'Sólida' },
        { id: 'dashed', label: 'Tracejada' },
        { id: 'dotted', label: 'Pontilhada' },
        { id: 'double', label: 'Dupla' }
    ];

    const showToast = (type: 'success' | 'warning', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    const toggleSection = (id: string) => setActiveSection(activeSection === id ? null : id);

    // --- RENDER HELPERS ---
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
            <button 
                onClick={() => toggleSection(id)}
                className="w-full py-4 flex items-center justify-between hover:bg-white/[0.02] transition-all px-6 group"
            >
                <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg transition-all ${activeSection === id ? 'bg-[var(--theme-primary)] text-white' : 'bg-white/5 text-white/30 group-hover:text-white/60'}`}>
                        <Icon size={14} />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeSection === id ? 'text-white' : 'text-white/30 group-hover:text-white/60'}`}>{title}</span>
                </div>
                <ChevronDown size={14} className={`transition-transform duration-300 ${activeSection === id ? 'rotate-180 text-[var(--theme-primary)]' : 'text-white/20'}`} />
            </button>
            <AnimatePresence>
                {activeSection === id && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-black/20"
                    >
                        <div className="p-6 pt-2">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    return (
        <div className="flex grow overflow-hidden bg-[var(--theme-body)] text-[var(--theme-main)] rounded-[var(--radius-theme)] border border-[var(--theme-border)]/50 h-full min-h-0 relative">
            
            {/* Toast System */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl border shadow-2xl text-sm font-bold flex items-center gap-2 ${toast.type === 'success' ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-amber-500 border-amber-400 text-white'}`}
                    >
                        {toast.type === 'success' ? <Check className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex w-full h-full overflow-hidden">
                
                {/* LEFT SIDE: DESIGN ENGINE (THE ATOMIC CORE) */}
                <aside className="w-[360px] bg-[var(--theme-sidebar)] border-r border-[var(--theme-border)]/50 flex flex-col shrink-0 relative z-20 shadow-[10px_0_30px_rgba(0,0,0,0.2)]">
                    
                    {/* Header */}
                    <div className="p-6 border-b border-[var(--theme-border)]/30 flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/20 shadow-[0_0_15px_rgba(var(--theme-primary-rgb),0.1)]">
                                <Palette size={16} className="text-[var(--theme-primary)]" />
                            </div>
                            <div>
                                <h2 className="text-xs font-black tracking-tighter uppercase italic">Design Engine</h2>
                                <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Sarak Matrix v5.5</p>
                            </div>
                        </div>
                        <div className="flex gap-1 p-1 bg-black/40 rounded-lg border border-white/5">
                            <button onClick={() => setMode('dark')} className={`p-1.5 rounded-md transition-all ${mode === 'dark' ? 'bg-[var(--theme-primary)] text-white shadow-lg' : 'text-white/20'}`}><Moon size={12} /></button>
                            <button onClick={() => setMode('light')} className={`p-1.5 rounded-md transition-all ${mode === 'light' ? 'bg-[var(--theme-primary)] text-white shadow-lg' : 'text-white/20'}`}><Sun size={12} /></button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        
                        {/* SECTION: ARCHITECTURE */}
                        <Section id="arch" icon={SidebarIcon} title="Navegação e Estrutura">
                            <div className="grid grid-cols-2 gap-2 mb-6">
                                <button onClick={() => setNavigationStyle('sidebar')} className={`p-3 rounded-xl border transition-all ${navigationStyle === 'sidebar' ? 'bg-[var(--theme-primary)]/10 border-[var(--theme-primary)] text-[var(--theme-primary)]' : 'bg-white/5 border-transparent text-white/20 hover:text-white'}`}>
                                    <SidebarIcon size={16} className="mx-auto mb-2" />
                                    <span className="text-[8px] font-black uppercase block">Sidebar</span>
                                </button>
                                <button onClick={() => setNavigationStyle('topbar')} className={`p-3 rounded-xl border transition-all ${navigationStyle === 'topbar' ? 'bg-[var(--theme-primary)]/10 border-[var(--theme-primary)] text-[var(--theme-primary)]' : 'bg-white/5 border-transparent text-white/20 hover:text-white'}`}>
                                    <Maximize size={16} className="mx-auto mb-2" />
                                    <span className="text-[8px] font-black uppercase block">Topbar</span>
                                </button>
                            </div>
                            <SliderControl label="Largura Sidebar" value={sidebarWidth} min={60} max={400} onChange={setSidebarWidth} suffix="px" />
                            <div className="grid grid-cols-3 gap-1 p-1 bg-black/20 rounded-xl border border-white/5 mt-4">
                                {Object.values(DENSITY).map(d => (
                                    <button key={d.id} onClick={() => setLayoutDensity(d.id)} className={`py-2 rounded-lg text-[8px] font-black uppercase transition-all ${layoutDensity === d.id ? 'bg-[var(--theme-primary)] text-white shadow-lg' : 'text-white/20'}`}>{d.label}</button>
                                ))}
                            </div>
                        </Section>

                        {/* SECTION: TYPOGRAPHY */}
                        <Section id="type" icon={Type} title="Fundição Tipográfica">
                            <SelectControl label="Fonte de Títulos" options={fonts} value={headingFont} onChange={setHeadingFont} isFont />
                            <SelectControl label="Fonte de Subtítulos" options={fonts} value={subtitleFont} onChange={setSubtitleFont} isFont />
                            <SelectControl label="Fonte de Texto" options={fonts} value={bodyFont} onChange={setBodyFont} isFont />
                            <div className="grid grid-cols-2 gap-4">
                                <SelectControl label="Peso (H1)" options={['300', '400', '600', '800', '900']} value={headingWeight} onChange={setHeadingWeight} />
                                <SelectControl label="Espaçamento" options={['tight', 'normal', 'wide', 'widest']} value={headingLetterSpacing} onChange={setHeadingLetterSpacing} />
                            </div>
                            <SliderControl label="Escala Global" value={parseFloat(SCALES[fontScale.toUpperCase() as keyof typeof SCALES]?.factor || '1')} min={0.7} max={1.5} step={0.1} onChange={(v: number) => {
                                const found = Object.values(SCALES).find(s => parseFloat(s.factor) === v);
                                if (found) setFontScale(found.id);
                            }} />
                        </Section>

                        {/* SECTION: GEOMETRY */}
                        <Section id="geom" icon={Box} title="Geometria e Cards">
                            <SliderControl label="Arredondamento (Radius)" value={borderRadius} min={0} max={60} onChange={setBorderRadius} suffix="px" />
                            <SliderControl label="Espessura da Borda" value={borderWidth} min={0} max={8} onChange={setBorderWidth} suffix="px" />
                            <SelectControl label="Estilo da Linha" options={borderStyles} value={borderStyle} onChange={setBorderStyle} />
                            
                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 mt-4 group">
                                <div className="flex items-center gap-3">
                                    <Maximize size={14} className="text-[var(--theme-primary)]" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Cortes Geométricos</span>
                                </div>
                                <button 
                                    onClick={() => setIsGeometricCut(!isGeometricCut)}
                                    className={`w-10 h-5 rounded-full relative transition-all ${isGeometricCut ? 'bg-[var(--theme-primary)]' : 'bg-white/10'}`}
                                >
                                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${isGeometricCut ? 'left-6' : 'left-1'}`} />
                                </button>
                            </div>
                            <SliderControl label="Intensidade da Sombra" value={shadowIntensity} min={0} max={1} step={0.1} onChange={setShadowIntensity} />
                        </Section>

                        {/* SECTION: ATMOSPHERE */}
                        <Section id="atmos" icon={Wind} title="Atmosfera e Efeitos">
                            <SliderControl label="Transparência Glass" value={glassOpacity} min={0} max={1} step={0.05} onChange={setGlassOpacity} />
                            <SliderControl label="Nível de Desfoque (Blur)" value={glassBlur} min={0} max={60} onChange={setGlassBlur} suffix="px" />
                            <div className="mb-6">
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block mb-3">Motor de Textura</span>
                                <div className="flex flex-wrap gap-2">
                                    {textures.map(tex => (
                                        <button key={tex.id} onClick={() => setTexture(tex.id)} className={`px-3 py-1 rounded-full border text-[8px] font-black uppercase transition-all ${texture === tex.id ? 'bg-[var(--theme-primary)] border-transparent text-white shadow-lg' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}>{tex.label}</button>
                                    ))}
                                </div>
                            </div>
                            <SliderControl label="Opacidade da Textura" value={textureOpacity} min={0} max={0.3} step={0.01} onChange={setTextureOpacity} />
                        </Section>

                        {/* SECTION: MOTION & COLOR */}
                        <Section id="motion" icon={Zap} title="Movimento e Cor">
                            <SliderControl label="Velocidade de Transição" value={animationSpeed} min={0} max={1} step={0.05} onChange={setAnimationSpeed} suffix="s" />
                            <div className="mt-4">
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block mb-4">Paleta de Destaque</span>
                                <div className="grid grid-cols-7 gap-2">
                                    {PRIMARY_COLORS.map((color, i) => (
                                        <button key={i} onClick={() => setPrimaryColor(color.value)} className={`w-full aspect-square rounded-full transition-all hover:scale-125 relative ${primaryColor === color.value ? 'ring-2 ring-white ring-offset-2 ring-offset-[var(--theme-sidebar)] scale-110' : 'opacity-80'}`} style={{ backgroundColor: color.value }} title={color.name}>
                                            {primaryColor === color.value && <Check size={10} className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </Section>
                    </div>

                    <div className="p-6 bg-black/40 border-t border-white/5 space-y-4">
                         <button 
                            onClick={() => showToast('success', 'Configurações sincronizadas com a Matrix.')}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-[var(--theme-primary)] to-indigo-600 text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:shadow-[var(--theme-primary)]/20 transition-all flex items-center justify-center gap-2"
                        >
                            <Sparkles size={14} />
                            Persistir Design v5.5
                        </button>
                    </div>
                </aside>

                {/* RIGHT SIDE: PREVIEW CANVAS */}
                <main className="flex-1 flex flex-col min-w-0 bg-[#000] relative">
                    <div className="h-16 px-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-2">
                                <Monitor size={14} className="text-white/40" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/60 italic">Live Forge Preview</span>
                            </div>
                            <div className="flex gap-1 p-1 bg-black/40 rounded-lg border border-white/5">
                                <button onClick={() => setPreviewDevice('desktop')} className={`px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${previewDevice === 'desktop' ? 'bg-white/10 text-white' : 'text-white/20'}`}>Ultra Wide</button>
                                <button onClick={() => setPreviewDevice('tablet')} className={`px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${previewDevice === 'tablet' ? 'bg-white/10 text-white' : 'text-white/20'}`}>Precision</button>
                                <button onClick={() => setPreviewDevice('smartphone')} className={`px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${previewDevice === 'smartphone' ? 'bg-white/10 text-white' : 'text-white/20'}`}>Mobile</button>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/20 text-[var(--theme-primary)]">
                            <Zap size={12} className="fill-current" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Matrix v5.5 Stable</span>
                        </div>
                    </div>

                    <div className="flex-1 flex overflow-hidden">
                        {/* Theme Explorer Overlay (List of Presets) */}
                        <div className="w-[450px] border-r border-white/5 flex flex-col bg-white/[0.01]">
                            <div className="p-6">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-6 flex items-center gap-2">
                                    <div className="w-8 h-[1px] bg-white/10" />
                                    Archetypes
                                </h2>
                                <div className="flex-1 overflow-y-auto custom-scrollbar">
                                    <ThemeList
                                        layouts={layouts}
                                        customThemes={[]}
                                        currentLayout={currentLayout}
                                        previewLayoutId={currentLayout}
                                        onPreview={setLayout}
                                        onApply={setLayout}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Interactive Canvas */}
                        <div className="flex-1 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-repeat relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--theme-primary)]/5 to-transparent pointer-events-none" />
                            <PreviewCanvas
                                previewDevice={previewDevice}
                                previewLayoutId={currentLayout}
                                activePreviewApp={activePreviewApp}
                                setActivePreviewApp={setActivePreviewApp}
                                previewAnimationStyle={globalAnimationStyle}
                                previewEmojiSet={globalEmojiSet}
                                config={{}}
                                previewPrimaryColor={primaryColor}
                                mode={mode}
                            />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ThemeCustomizationTab;
