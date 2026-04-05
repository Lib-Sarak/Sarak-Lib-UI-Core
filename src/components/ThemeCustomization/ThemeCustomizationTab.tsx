import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Check, Zap, Edit3, ChevronLeft,
    Monitor, Tablet, Smartphone, Grid, List, Keyboard, Globe, Moon, Sun
} from 'lucide-react';

import { useSarak } from '@sarak/lib-shared';
import { useThemePreview } from './useThemePreview';
import { ThemeList } from './ThemeList';
import { ThemeEditor } from './ThemeEditor';
import { PreviewCanvas } from './PreviewCanvas';

export const ThemeCustomizationTab: React.FC = () => {
    const {
        layout: currentLayout, setLayout,
        mode, setMode,
        primaryColor, setPrimaryColor,
        navigationStyle, setNavigationStyle,
        layouts, customThemes, saveCustomTheme, deleteCustomTheme,
        fontScale, setFontScale,
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
        16, // Default sidebar width
        customThemes,
        layouts
    );

    const showToast = (type: 'success' | 'warning', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    const handleCreateModel = () => {
        setEditingId(null);
        setThemeName("");
        setViewMode('editor');
    };

    const handleSave = () => {
        if (!themeName.trim()) {
            showToast('warning', 'Give your layout a name!');
            return;
        }
        const id = editingId || Date.now().toString();
        saveCustomTheme(id, themeName, config, {
            animationStyle: previewAnimationStyle,
            emojiSet: previewEmojiSet
        });
        showToast('success', editingId ? `Layout "${themeName}" updated!` : `Layout "${themeName}" saved!`);
        setViewMode('list');
    };

    const handleApplyGlobally = (forcedId?: string) => {
        const targetId = forcedId || previewLayoutId;
        
        // Se for um ID forçado (vencendo o clique do card), atualiza o preview primeiro
        if (forcedId && forcedId !== previewLayoutId) {
            setPreviewLayoutId(forcedId);
        }

        // Aplicação no Estado Global (Dispara o Effect no SarakProvider)
        setLayout(targetId);
        setGlobalAnimationStyle(previewAnimationStyle);
        setGlobalEmojiSet(previewEmojiSet);
        setPrimaryColor(previewPrimaryColor);
        setFontScale(previewFontScale);
        setNavigationStyle(previewNavigationStyle);

        // Aplicação Forçada de Tokens Custom (se houver config)
        if (config && Object.keys(config).length > 0) {
            Object.entries(config).forEach(([k, v]) => {
                document.documentElement.style.setProperty(k, v as string);
            });
        }

        showToast('success', `Applying Elite Layout "${targetId}" system-wide...`);
    };

    const handleEdit = (id: string) => {
        const cleanId = id.startsWith('custom-') ? id.replace('custom-', '') : id;
        setEditingId(id.startsWith('custom-') ? cleanId : null);
        setPreviewLayoutId(id);
        setViewMode('editor');
    };

    const toggleSection = (id: string) => {
        setOpenSections(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const primaryColors = [
        { name: 'Sarak Emerald', value: '#10b981' },
        { name: 'Forest Deep', value: '#059669' },
        { name: 'Mint Fresh', value: '#6ee7b7' },
        { name: 'Classic Blue', value: '#3b82f6' },
        { name: 'Royal Night', value: '#2563eb' },
        { name: 'Sky Clear', value: '#60a5fa' },
        { name: 'Turquoise', value: '#2dd4bf' },
        { name: 'Vibrant Amber', value: '#f59e0b' },
        { name: 'Orange Sunset', value: '#f97316' },
        { name: 'Sarak Gold', value: '#eab308' },
        { name: 'Deep Rose', value: '#f43f5e' },
        { name: 'Crimson Power', value: '#ef4444' },
        { name: 'Vivid Pink', value: '#ec4899' },
        { name: 'Cyber Indigo', value: '#6366f1' },
        { name: 'Purple Haze', value: '#8b5cf6' },
        { name: 'Lavender', value: '#a855f7' },
        { name: 'Cyan Sky', value: '#06b6d4' },
        { name: 'Teal Forest', value: '#14b8a6' },
        { name: 'Lime Pulse', value: '#84cc16' },
        { name: 'Fuchsia', value: '#d946ef' }
    ];

    return (
        <div className="flex grow overflow-hidden bg-[var(--theme-body)] text-[var(--theme-main)] selection:bg-[var(--theme-primary)] selection:text-white rounded-[var(--radius-theme)] border border-[var(--theme-border)]/50 h-full min-h-[600px]">

            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl border shadow-lg text-sm font-bold flex items-center gap-2 ${toast.type === 'success'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                            }`}
                    >
                        {toast.type === 'success' ? <Check className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex w-full h-full overflow-hidden">
                {/* LEFT SIDE: VISUAL CONFIGURATOR MAKER */}
                <aside className="w-[380px] bg-[var(--theme-card)] border-r border-[var(--theme-border)]/50 flex flex-col shrink-0 relative z-20 shadow-[20px_0_50px_rgba(0,0,0,0.1)] transition-all duration-500">
                    <AnimatePresence mode="wait">
                        {(viewMode === 'list' || viewMode === 'grid') ? (
                            <motion.div
                                key="theme-list"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar"
                            >
                                <div className="p-6">
                                    <button
                                        onClick={handleCreateModel}
                                        className="w-full py-6 rounded-2xl bg-[var(--theme-primary)]/15 border-2 border-dashed border-[var(--theme-primary)]/40 text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/25 hover:border-[var(--theme-primary)] transition-all flex flex-col items-center justify-center gap-3 group mb-8 shadow-sm"
                                    >
                                        <div className="w-10 h-10 bg-[var(--theme-primary)] rounded-full flex items-center justify-center text-white shadow-lg shadow-[var(--theme-primary)]/20 group-hover:scale-110 transition-transform">
                                            <Plus className="w-5 h-5" />
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-widest">Create Model</span>
                                    </button>

                                    <div className="space-y-4">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--theme-main)] mb-2 px-2 flex items-center justify-between">
                                            <span>Explore Themes</span>
                                            <div className="flex gap-1">
                                                <button onClick={() => setViewMode('list')} className={`p-1 ${viewMode === 'list' ? 'text-[var(--theme-primary)]' : 'text-[var(--theme-muted)]'}`}><List className="w-3 h-3" /></button>
                                                <button onClick={() => setViewMode('grid')} className={`p-1 ${viewMode === 'grid' ? 'text-[var(--theme-primary)]' : 'text-[var(--theme-muted)]'}`}><Grid className="w-3 h-3" /></button>
                                            </div>
                                        </div>

                                        <ThemeList
                                            layouts={layouts}
                                            customThemes={customThemes}
                                            currentLayout={currentLayout}
                                            previewLayoutId={previewLayoutId}
                                            viewMode={viewMode}
                                            onPreview={setPreviewLayoutId}
                                            onApply={(id) => handleApplyGlobally(id)}
                                            onEdit={handleEdit}
                                            onDelete={deleteCustomTheme}
                                        />
                                    </div>

                                    {/* Quick Global Settings */}
                                    <div className="mt-8 pt-6 border-t border-[var(--theme-border)]/50">
                                        <div className="mb-6 px-2">
                                            <h3 className="text-[9px] font-black uppercase tracking-[0.1em] text-[var(--theme-main)] mb-3">Navigation Style</h3>
                                            <div className="flex bg-black/10 p-1 rounded-xl border border-[var(--theme-border)]/50">
                                                <button onClick={() => { setNavigationStyle('sidebar'); setPreviewNavigationStyle('sidebar'); }} className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${previewNavigationStyle === 'sidebar' ? 'bg-[var(--theme-primary)] text-white shadow-md' : 'text-[var(--theme-muted)] hover:text-[var(--theme-title)]'}`}>Sidebar</button>
                                                <button onClick={() => { setNavigationStyle('topbar'); setPreviewNavigationStyle('topbar'); }} className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${previewNavigationStyle === 'topbar' ? 'bg-[var(--theme-primary)] text-white shadow-md' : 'text-[var(--theme-muted)] hover:text-[var(--theme-title)]'}`}>Topbar</button>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mb-4 px-2">
                                            <h3 className="text-[9px] font-black uppercase tracking-[0.1em] text-[var(--theme-main)]">Visualization</h3>
                                            <div className="flex gap-1 p-1 bg-black/10 border border-[var(--theme-border)]/50 rounded-lg">
                                                <button onClick={() => setMode('dark')} className={`p-1.5 rounded-md ${mode === 'dark' ? 'bg-[var(--theme-primary)] text-white' : 'text-[var(--theme-muted)]'}`}><Moon className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => setMode('light')} className={`p-1.5 rounded-md ${mode === 'light' ? 'bg-[var(--theme-primary)] text-white' : 'text-[var(--theme-muted)]'}`}><Sun className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </div>

                                        <div className="mb-6 px-2">
                                            <h3 className="text-[9px] font-black uppercase tracking-[0.1em] text-[var(--theme-main)] mb-3">Global Color</h3>
                                            <div className="grid grid-cols-5 gap-2">
                                                {primaryColors.slice(0, 10).map((color, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => {
                                                            setPrimaryColor(color.value);
                                                            setPreviewPrimaryColor(color.value);
                                                        }}
                                                        className={`w-full aspect-square rounded-full transition-all hover:scale-110 ${primaryColor === color.value ? 'ring-2 ring-[var(--theme-primary)] ring-offset-2 ring-offset-[var(--theme-card)]' : 'opacity-80'}`}
                                                        style={{ backgroundColor: color.value }}
                                                        title={color.name}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 bg-black/10 p-1.5 rounded-xl border border-[var(--theme-border)]/50">
                                            {[
                                                { id: 'desktop', icon: <Monitor className="w-4 h-4" /> },
                                                { id: 'tablet', icon: <Tablet className="w-4 h-4" /> },
                                                { id: 'smartphone', icon: <Smartphone className="w-4 h-4" /> }
                                            ].map(dev => (
                                                <button
                                                    key={dev.id}
                                                    onClick={() => setPreviewDevice(dev.id as any)}
                                                    className={`flex-grow flex items-center justify-center py-2 rounded-lg transition-all ${previewDevice === dev.id ? 'bg-[var(--theme-primary)] text-white shadow-lg' : 'text-[var(--theme-muted)] hover:bg-black/5'}`}
                                                >
                                                    {dev.icon}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="theme-editor"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex flex-col h-full overflow-hidden"
                            >
                                <div className="p-6 pb-2">
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className="flex items-center gap-2 text-[var(--theme-muted)] hover:text-[var(--theme-primary)] transition-colors text-[10px] font-black uppercase tracking-widest mb-8"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Theme List
                                    </button>

                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-2">
                                            <Edit3 className="w-4 h-4 text-[var(--theme-primary)]" />
                                            <h2 className="text-xs font-black tracking-widest text-[var(--theme-title)] uppercase italic">Customize</h2>
                                        </div>
                                        <button
                                            onClick={handleSave}
                                            className="px-4 py-2 bg-[var(--theme-primary)] text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-[var(--theme-primary)]/20 hover:scale-105 transition-all"
                                        >
                                            Save Layout
                                        </button>
                                    </div>

                                    <input
                                        type="text"
                                        value={themeName}
                                        onChange={(e) => setThemeName(e.target.value)}
                                        placeholder="Layout Name..."
                                        className="w-full bg-[var(--theme-card)]/50 border border-[var(--theme-border)] rounded-xl px-4 py-3 text-xs font-bold text-[var(--theme-title)] focus:border-[var(--theme-primary)] outline-none transition-all mb-4"
                                    />
                                </div>

                                <ThemeEditor
                                    config={config}
                                    onConfigChange={handleConfigChange}
                                    previewAnimationStyle={previewAnimationStyle}
                                    setPreviewAnimationStyle={setPreviewAnimationStyle}
                                    previewEmojiSet={previewEmojiSet}
                                    setPreviewEmojiSet={setPreviewEmojiSet}
                                    openSections={openSections}
                                    onToggleSection={toggleSection}
                                    primaryColors={primaryColors}
                                    previewPrimaryColor={previewPrimaryColor}
                                    setPreviewPrimaryColor={setPreviewPrimaryColor}
                                    previewFontScale={previewFontScale}
                                    setPreviewFontScale={setPreviewFontScale}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </aside>

                {/* RIGHT SIDE: PREVIEW CANVAS */}
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
    );
};
