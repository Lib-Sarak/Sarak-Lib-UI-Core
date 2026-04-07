import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Check, Zap, Edit3, ChevronLeft,
    Monitor, Tablet, Smartphone, Grid, List, Keyboard, Globe, Moon, Sun, 
    Type, Maximize, Layout as LayoutIcon, Sidebar as SidebarIcon,
    Layers, MousePointer2, Palette
} from 'lucide-react';

import { useSarak } from '@sarak/lib-shared';
import { useThemePreview } from './useThemePreview';
import { ThemeList } from './ThemeList';
import { ThemeEditor } from './ThemeEditor';
import { PreviewCanvas } from './PreviewCanvas';
import { PRIMARY_COLORS, SCALES, DENSITY } from '../../constants/theme';

export const ThemeCustomizationTab: React.FC = () => {
    const {
        layout: currentLayout, setLayout,
        mode, setMode,
        primaryColor, setPrimaryColor,
        navigationStyle, setNavigationStyle,
        layouts, customThemes, saveCustomTheme, deleteCustomTheme,
        fontScale, setFontScale,
        layoutDensity, setLayoutDensity,
        animationStyle: globalAnimationStyle, setAnimationStyle: setGlobalAnimationStyle,
        emojiSet: globalEmojiSet, setEmojiSet: setGlobalEmojiSet
    } = useSarak();

    const [viewMode, setViewMode] = useState<'list' | 'editor' | 'grid'>('list');
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'smartphone'>('desktop');
    const [activePreviewApp, setActivePreviewApp] = useState('dashboard');
    const [openSections, setOpenSections] = useState(['colors', 'geo']);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [toast, setToast] = useState<{ type: 'success' | 'warning', message: string } | null>(null);

    const {
        previewLayoutId, setPreviewLayoutId,
        previewAnimationStyle, setPreviewAnimationStyle,
        previewEmojiSet, setPreviewEmojiSet,
        previewPrimaryColor, setPreviewPrimaryColor,
        previewFontScale, setPreviewFontScale,
        previewNavigationStyle, setPreviewNavigationStyle,
        config,
        themeName, setThemeName,
        handleConfigChange
    } = useThemePreview(
        currentLayout,
        globalAnimationStyle,
        globalEmojiSet,
        primaryColor,
        fontScale,
        navigationStyle,
        260, // Sidebar width
        customThemes,
        layouts
    );

    const showToast = (type: 'success' | 'warning', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    const handleApplyGlobally = (forcedId?: string) => {
        const targetId = forcedId || previewLayoutId;
        
        setLayout(targetId);
        setGlobalAnimationStyle(previewAnimationStyle);
        setGlobalEmojiSet(previewEmojiSet);
        setPrimaryColor(previewPrimaryColor);
        setFontScale(previewFontScale);
        setNavigationStyle(previewNavigationStyle);

        showToast('success', `Applying Elite Layout "${targetId}" system-wide...`);
    };

    // --- RENDER HELPERS ---
    const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
        <div className="flex items-center gap-2 mb-4 mt-6 first:mt-0">
            <Icon size={14} className="text-[var(--theme-primary)]" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--theme-title)]/60">{title}</h3>
        </div>
    );

    return (
        <div className="flex grow overflow-hidden bg-[var(--theme-body)] text-[var(--theme-main)] selection:bg-[var(--theme-primary)] selection:text-white rounded-[var(--radius-theme)] border border-[var(--theme-border)]/50 h-full min-h-0 relative">
            
            {/* Toast System */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl border shadow-2xl text-sm font-bold flex items-center gap-2 ${toast.type === 'success' ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-amber-500 border-amber-400 text-white'}`}
                    >
                        {toast.type === 'success' ? <Check className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex w-full h-full overflow-hidden">
                
                {/* LEFT SIDE: ELITE CUSTOMIZATION PANEL (SYNC 1:1 WITH PRINT) */}
                <aside className="w-[340px] bg-[var(--theme-sidebar)] border-r border-[var(--theme-border)]/50 flex flex-col shrink-0 relative z-20 shadow-[10px_0_30px_rgba(0,0,0,0.2)]">
                    
                    {/* Header Panel */}
                    <div className="p-6 border-b border-[var(--theme-border)]/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                                <Palette size={16} className="text-[var(--theme-primary)]" />
                            </div>
                            <h2 className="text-sm font-black tracking-tighter uppercase italic">Design Engine</h2>
                        </div>
                        <div className="flex gap-1 p-1 bg-white/5 rounded-lg border border-white/5">
                            <button onClick={() => setMode('dark')} className={`p-1.5 rounded-md transition-all ${mode === 'dark' ? 'bg-[var(--theme-primary)] text-white shadow-lg' : 'text-white/20 hover:text-white'}`}><Moon size={14} /></button>
                            <button onClick={() => setMode('light')} className={`p-1.5 rounded-md transition-all ${mode === 'light' ? 'bg-[var(--theme-primary)] text-white shadow-lg' : 'text-white/20 hover:text-white'}`}><Sun size={14} /></button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                        
                        {/* 1. LAYOUT DENSITY */}
                        <div>
                            <SectionHeader icon={Layers} title="Density & Spacing" />
                            <div className="grid grid-cols-3 gap-1 p-1 bg-black/20 rounded-xl border border-[var(--theme-border)]/30">
                                {Object.values(DENSITY).map(d => (
                                    <button 
                                        key={d.id}
                                        onClick={() => setLayoutDensity(d.id)}
                                        className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${layoutDensity === d.id ? 'bg-[var(--theme-primary)] text-white shadow-lg' : 'text-white/20 hover:text-white'}`}
                                    >
                                        {d.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2. NAVIGATION STYLE */}
                        <div>
                            <SectionHeader icon={SidebarIcon} title="Navigation Structure" />
                            <div className="grid grid-cols-2 gap-2">
                                <button 
                                    onClick={() => setNavigationStyle('sidebar')}
                                    className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${navigationStyle === 'sidebar' ? 'bg-[var(--theme-primary)]/10 border-[var(--theme-primary)] text-[var(--theme-primary)]' : 'bg-white/5 border-transparent text-white/20 hover:border-white/10 hover:text-white'}`}
                                >
                                    <div className="w-10 h-8 border-2 border-current/20 rounded flex overflow-hidden">
                                        <div className="w-3 h-full bg-current/40" />
                                        <div className="flex-1 bg-current/10" />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">Sidebar</span>
                                </button>
                                <button 
                                    onClick={() => setNavigationStyle('topbar')}
                                    className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${navigationStyle === 'topbar' ? 'bg-[var(--theme-primary)]/10 border-[var(--theme-primary)] text-[var(--theme-primary)]' : 'bg-white/5 border-transparent text-white/20 hover:border-white/10 hover:text-white'}`}
                                >
                                    <div className="w-10 h-8 border-2 border-current/20 rounded flex flex-col overflow-hidden">
                                        <div className="h-2 w-full bg-current/40" />
                                        <div className="flex-1 bg-current/10" />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">Topbar</span>
                                </button>
                            </div>
                        </div>

                        {/* 3. FONT SCALE (P1 - G1) */}
                        <div>
                            <SectionHeader icon={Type} title="Typography Scale" />
                            <div className="grid grid-cols-5 gap-1">
                                {Object.values(SCALES).map(s => (
                                    <button 
                                        key={s.id}
                                        onClick={() => setFontScale(s.id)}
                                        className={`aspect-square flex items-center justify-center rounded-xl border-2 transition-all font-black text-xs ${fontScale === s.id ? 'bg-[var(--theme-primary)] border-[var(--theme-primary)] text-white shadow-lg' : 'bg-white/5 border-transparent text-white/20 hover:border-white/10 hover:text-white'}`}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 4. PRIMARY COLOR GRID (21 COLORS) */}
                        <div>
                            <SectionHeader icon={MousePointer2} title="Accent Palette" />
                            <div className="grid grid-cols-7 gap-2">
                                {PRIMARY_COLORS.map((color, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPrimaryColor(color.value)}
                                        className={`w-full aspect-square rounded-full transition-all hover:scale-110 relative ${primaryColor === color.value ? 'ring-2 ring-white/40 ring-offset-2 ring-offset-[var(--theme-sidebar)]' : 'opacity-80'}`}
                                        style={{ backgroundColor: color.value }}
                                        title={color.name}
                                    >
                                        {primaryColor === color.value && <Check size={10} className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 5. PREVIEW CLONE (OPTIONAL) */}
                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <button 
                                onClick={() => handleApplyGlobally()}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-[var(--theme-primary)] to-indigo-600 text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-[var(--theme-primary)]/20 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                Persist Changes
                            </button>
                        </div>
                    </div>
                </aside>

                {/* RIGHT SIDE: THEME EXPLORER & PREVIEW CANVAS */}
                <main className="flex-1 flex flex-col min-w-0 bg-[#000] relative">
                    {/* Toolbar Topo Preview */}
                    <div className="h-16 px-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-2">
                                <Monitor size={14} className="text-white/40" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/60 italic">Live Forge Preview</span>
                            </div>
                            <div className="flex gap-1 p-1 bg-black/40 rounded-lg border border-white/5">
                                <button onClick={() => setPreviewDevice('desktop')} className={`px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${previewDevice === 'desktop' ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white'}`}>Ultra Wide</button>
                                <button onClick={() => setPreviewDevice('tablet')} className={`px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${previewDevice === 'tablet' ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white'}`}>Precision</button>
                                <button onClick={() => setPreviewDevice('smartphone')} className={`px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${previewDevice === 'smartphone' ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white'}`}>Mobile</button>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                             <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/20 text-[var(--theme-primary)]">
                                <Zap size={12} className="fill-current" />
                                <span className="text-[9px] font-black uppercase tracking-widest">v5.4.1 Matrix Stable</span>
                             </div>
                        </div>
                    </div>

                    <div className="flex-1 flex overflow-hidden">
                        {/* Theme Grid (List) */}
                        <div className="w-[450px] border-r border-white/5 flex flex-col bg-white/[0.01]">
                            <div className="p-6 pb-2">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-6 flex items-center gap-3">
                                    <div className="w-8 h-[1px] bg-white/10" />
                                    Available Layouts
                                </h2>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 pt-0 custom-scrollbar">
                                <ThemeList
                                    layouts={layouts}
                                    customThemes={customThemes}
                                    currentLayout={currentLayout}
                                    previewLayoutId={previewLayoutId}
                                    viewMode="list"
                                    onPreview={setPreviewLayoutId}
                                    onApply={(id) => handleApplyGlobally(id)}
                                    // Adicionando suporte ao design de cards Elite
                                />
                            </div>
                        </div>

                        {/* Interactive Canvas */}
                        <div className="flex-1 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-repeat">
                            <PreviewCanvas
                                previewDevice={previewDevice}
                                previewLayoutId={previewLayoutId}
                                activePreviewApp={activePreviewApp}
                                setActivePreviewApp={setActivePreviewApp}
                                previewAnimationStyle={previewAnimationStyle}
                                previewEmojiSet={previewEmojiSet}
                                config={config}
                                previewPrimaryColor={previewPrimaryColor}
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
