import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Check, Zap, Edit3, ChevronLeft, ChevronDown,
    Monitor, Tablet, Smartphone, Grid, List, Keyboard, Globe, Moon, Sun, 
    Type, Maximize, Layout as LayoutIcon, Sidebar as SidebarIcon,
    Layers, MousePointer2, Palette, Box, Wind, Sparkles, AlertCircle, BarChart3,
    MessageSquare, Network, BarChart
} from 'lucide-react';

import { PRIMARY_COLORS, SCALES, DENSITY, BASE_PRESETS, TEXTURE_LIBRARY } from '../../constants/design-tokens';
import { useSarakUI } from '../SarakUIProvider';
import { useThemePreview } from './useThemePreview';
import { ThemeList } from './ThemeList';
import { PreviewCanvas } from './PreviewCanvas';

export const ThemeCustomizationTab: React.FC = () => {
    const { design, ...rest } = useSarakUI();
    const sarak = { ...design, ...rest };
    const { applyFullConfig } = sarak;
    
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
        animationSpeed: sarak.animationSpeed,
        tabFont: sarak.tabFont,
        layoutGap: sarak.layoutGap,
        // Identity & Branding v6.0
        systemName: sarak.systemName,
        logoUrl: sarak.logoUrl,
        logoDarkUrl: sarak.logoDarkUrl,
        logoScale: sarak.logoScale,
        logoPosition: sarak.logoPosition,
        systemTone: sarak.systemTone,
        emptyStateId: sarak.emptyStateId,
        // Materials & Borders v6.0
        surfaceMaterial: sarak.surfaceMaterial,
        borderType: sarak.borderType,
        interfaceElasticity: sarak.interfaceElasticity,
        // Navigation & Structures v6.0
        isSplitViewEnabled: sarak.isSplitViewEnabled,
        secondaryModuleId: sarak.secondaryModuleId,
        searchStyle: sarak.searchStyle,
        // Data Visualization v6.0
        chartPalette: sarak.chartPalette,
        chartStyle: sarak.chartStyle,
        // Sovereignty & Privacy v6.0
        shadowOrientation: sarak.shadowOrientation,
        shadowColorMode: sarak.shadowColorMode,
        isAutoHideEnabled: sarak.isAutoHideEnabled,
        // Advanced Engines v7.0
        chatBubbleStyle: sarak.chatBubbleStyle || 'glass',
        chatAnimationSpeed: sarak.chatAnimationSpeed || 0.05,
        flowGridStyle: sarak.flowGridStyle || 'dots',
        flowNodeRadius: sarak.flowNodeRadius || 12,
        chartShowGrid: sarak.chartShowGrid ?? true,
        cardPadding: sarak.cardPadding || 24,
        tabGap: sarak.tabGap || 12,
        tabSectionMargin: sarak.tabSectionMargin || 0,
        texture: sarak.texture || 'none',
        textureOpacity: sarak.textureOpacity || 0.05
    });

    const [activeSection, setActiveSection] = useState<string | null>('color-core');
    const [activeCategory, setActiveCategory] = useState<number | null>(1);
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'smartphone'>('desktop');
    const [activePreviewApp, setActivePreviewApp] = useState('dashboard');
    const [toast, setToast] = useState<{ type: 'success' | 'warning', message: string } | null>(null);

    // Sync draft with global only on initial load or reset
    useEffect(() => {
        setDraft({
            layout: sarak.layout, mode: sarak.mode, primaryColor: sarak.primaryColor,
            navigationStyle: sarak.navigationStyle, sidebarWidth: sarak.sidebarWidth,
            fontScale: sarak.fontScale, layoutDensity: sarak.layoutDensity,
            headingFont: sarak.headingFont, subtitleFont: sarak.subtitleFont, bodyFont: sarak.bodyFont,
            headingWeight: sarak.headingWeight, headingLetterSpacing: sarak.headingLetterSpacing,
            borderRadius: sarak.borderRadius, borderWidth: sarak.borderWidth, borderStyle: sarak.borderStyle,
            glassOpacity: sarak.glassOpacity, glassBlur: sarak.glassBlur, shadowIntensity: sarak.shadowIntensity,
            isGeometricCut: sarak.isGeometricCut, animationSpeed: sarak.animationSpeed,
            tabFont: sarak.tabFont, layoutGap: sarak.layoutGap,
            // Identity & Branding v6.0
            systemName: sarak.systemName, logoUrl: sarak.logoUrl, logoDarkUrl: sarak.logoDarkUrl,
            logoScale: sarak.logoScale, logoPosition: sarak.logoPosition, systemTone: sarak.systemTone,
            emptyStateId: sarak.emptyStateId,
            // Materials & Borders v6.0
            surfaceMaterial: sarak.surfaceMaterial, borderType: sarak.borderType,
            interfaceElasticity: sarak.interfaceElasticity,
            // Navigation & Structures v6.0
            isSplitViewEnabled: sarak.isSplitViewEnabled, secondaryModuleId: sarak.secondaryModuleId,
            searchStyle: sarak.searchStyle,
            // Data Visualization v6.0
            chartPalette: sarak.chartPalette, chartStyle: sarak.chartStyle,
            // Sovereignty & Privacy v6.0
            shadowOrientation: sarak.shadowOrientation, shadowColorMode: sarak.shadowColorMode,
            isAutoHideEnabled: sarak.isAutoHideEnabled,
            // Advanced Engines v7.0
            chatBubbleStyle: sarak.chatBubbleStyle || 'glass',
            chatAnimationSpeed: sarak.chatAnimationSpeed || 0.05,
            flowGridStyle: sarak.flowGridStyle || 'dots',
            flowNodeRadius: sarak.flowNodeRadius || 12,
            chartShowGrid: sarak.chartShowGrid ?? true,
            chartType: sarak.chartType || 'bar',
            chartThickness: sarak.chartThickness || 2,
            chartSmoothing: sarak.chartSmoothing ?? true,
            cardPadding: sarak.cardPadding || 24,
            tabGap: sarak.tabGap || 12,
            tabSectionMargin: sarak.tabSectionMargin || 0,
            texture: sarak.texture || 'none',
            textureOpacity: sarak.textureOpacity || 0.05
        });
    }, [sarak.isHydrated]);

    const showToast = (type: 'success' | 'warning', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    // --- LOGIC: AUTO-SYNC PREVIEW WITH SIDEBAR SECTION ---
    useEffect(() => {
        if (!activeSection) return;
        
        const sectionToAppMap: Record<string, string> = {
            'arch': 'dashboard',
            'struct': 'logs',
            'type': 'typography',
            'geom': 'components',
            'atmos': 'dashboard',
            'color': 'dashboard',
            'engines': 'chat'
        };
        
        if (sectionToAppMap[activeSection]) {
            setActivePreviewApp(sectionToAppMap[activeSection]);
        }
    }, [activeSection]);

    const lightLogoInputRef = useRef<HTMLInputElement>(null);
    const darkLogoInputRef = useRef<HTMLInputElement>(null);

    const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>, target: 'logoUrl' | 'logoDarkUrl') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validTypes = ['image/webp', 'image/svg+xml', 'image/png'];
        if (!validTypes.includes(file.type)) {
            showToast('warning', 'Formatos aceitos: SVG, WebP e PNG.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            updateDraft(target, event.target?.result as string);
            showToast('success', 'Asset importado!');
        };
        reader.readAsDataURL(file);
    };

    // --- LOGIC: APPLY THEME PRESET TO DRAFT ---
    const handleThemePreview = (id: string) => {
        // Busca do preset com suporte a fallbacks de ID
        const presetKey = Object.keys(BASE_PRESETS).find(k => k.toLowerCase() === id.toLowerCase());
        const preset = presetKey ? (BASE_PRESETS as any)[presetKey] : null;

        if (!preset) {
            // Silently skip if archetype not found
            return;
        }

        // DEFINIÇÃO DO SCHEMA DE TIPAGEM SOBERANA v6.1
        const TOKEN_SCHEMA: Record<string, 'number' | 'boolean' | 'string' | 'array'> = {
            navigationStyle: 'string', sidebarWidth: 'number', layoutDensity: 'string', isAutoHideEnabled: 'boolean',
            isSplitViewEnabled: 'boolean', secondaryModuleId: 'string', searchStyle: 'string',
            headingFont: 'string', subtitleFont: 'string', tabFont: 'string', bodyFont: 'string',
            headingWeight: 'string', headingLetterSpacing: 'string', fontScale: 'string',
            borderRadius: 'number', borderWidth: 'number', borderStyle: 'string',
            surfaceMaterial: 'string', borderType: 'string', layoutGap: 'number',
            glassOpacity: 'number', glassBlur: 'number', isGeometricCut: 'boolean',
            interfaceElasticity: 'number',
            tabGap: 'number', tabSectionMargin: 'number',
            texture: 'string', textureOpacity: 'number', primaryColor: 'string',
            systemName: 'string', logoUrl: 'string', logoDarkUrl: 'string', logoScale: 'number',
            logoPosition: 'string', systemTone: 'string', emptyStateId: 'string',
            chartStyle: 'string', chartPalette: 'array',
            shadowIntensity: 'number', shadowOrientation: 'string', shadowColorMode: 'string',
            animationSpeed: 'number', mode: 'string'
        };

        const tokenMap: Record<string, string> = {
            '--nav-style': 'navigationStyle', '--sidebar-width': 'sidebarWidth', '--layout-density': 'layoutDensity', '--auto-hide': 'isAutoHideEnabled',
            '--split-view': 'isSplitViewEnabled', '--secondary-module': 'secondaryModuleId', '--search-style': 'searchStyle',
            '--font-heading': 'headingFont', '--font-subtitle': 'subtitleFont', '--font-tab': 'tabFont', '--font-main': 'bodyFont',
            '--font-weight-heading': 'headingWeight', '--letter-spacing-heading': 'headingLetterSpacing', '--font-scale': 'fontScale',
            '--radius-theme': 'borderRadius', '--border-width': 'borderWidth', '--border-style': 'borderStyle',
            '--surface-material': 'surfaceMaterial', '--border-type': 'borderType', '--theme-gap': 'layoutGap',
            '--glass-opacity': 'glassOpacity', '--glass-blur': 'glassBlur', '--is-geometric': 'isGeometricCut',
            '--interface-elasticity': 'interfaceElasticity',
            '--bg-texture': 'texture', '--texture-opacity': 'textureOpacity', '--theme-primary': 'primaryColor',
            '--tab-gap': 'tabGap', '--tab-section-margin': 'tabSectionMargin',
            '--system-name': 'systemName', '--logo-url': 'logoUrl', '--logo-dark-url': 'logoDarkUrl', '--logo-scale': 'logoScale',
            '--logo-position': 'logoPosition', '--system-tone': 'systemTone', '--empty-state-id': 'emptyStateId',
            '--chart-style': 'chartStyle', '--chart-palette': 'chartPalette',
            '--shadow-intensity': 'shadowIntensity', '--shadow-orientation': 'shadowOrientation', '--shadow-color-mode': 'shadowColorMode',
            '--animation-speed': 'animationSpeed', '--mode': 'mode'
        };

        const newDraft = { ...draft, layout: id };

        Object.entries(preset).forEach(([key, value]) => {
            // Se a chave já for sintonizada no novo padrão (ex: navigationStyle), usar diretamente.
            // Caso contrário, tenta mapear do padrão antigo (--nav-style).
            const draftKey = TOKEN_SCHEMA[key] ? key : tokenMap[key];
            
            if (draftKey) {
                const targetType = TOKEN_SCHEMA[draftKey];
                let finalValue: any = value;

                switch(targetType) {
                    case 'number':
                        const rawStr = typeof value === 'string' ? value.replace(/[^\d.-]/g, '') : value;
                        finalValue = parseFloat(rawStr as string);
                        if (isNaN(finalValue)) finalValue = 0;
                        break;
                    case 'boolean':
                        finalValue = (value === 'true' || value === '1' || value === 1 || value === true);
                        break;
                    case 'array':
                        if (typeof value === 'string') finalValue = value.split(',').map(s => s.trim());
                        break;
                    default:
                        if (typeof value === 'object' && value !== null) {
                            finalValue = (value as any).id || (value as any).family || (value as any).name || (value as any).value || String(value);
                        } else {
                            finalValue = String(value);
                        }
                        break;
                }
                (newDraft as any)[draftKey] = finalValue;
            }
        });

        // Retrocompatibilidade e refinamentos de modo
        if (newDraft.mode === 'dark' || preset.mode === 'dark' || preset['--mode'] === 'dark') {
            newDraft.mode = 'dark';
        }

        setDraft(newDraft);
    };


    // --- LOGIC: COMMIT DRAFT TO SYSTEM ---
    const handleApplyToSystem = () => {
        applyFullConfig(draft);
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

    const updateDraft = (key: string, value: any) => {
        setDraft(prev => ({ ...prev, [key]: value }));
    };

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
                value={value || ''} 
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-[11px] font-bold focus:border-[var(--theme-primary)] focus:outline-none transition-all text-white/80"
                style={isFont ? { fontFamily: value } : {}}
            >
                {(options || []).map((opt: any) => (
                    <option key={opt.id || opt} value={opt.id || opt} className="bg-[#0a0a0b]">{opt.label || opt}</option>
                ))}
            </select>
        </div>
    );

    const CategoryLabel: React.FC<{ icon: any, title: string, index: number, isOpen: boolean, onToggle: () => void }> = ({ icon: Icon, title, index, isOpen, onToggle }) => (
        <button 
            onClick={onToggle}
            className={`w-full px-6 py-4 mt-6 first:mt-0 flex items-center justify-between border-y border-white/5 transition-all ${isOpen ? 'bg-white/[0.03]' : 'bg-white/[0.01] hover:bg-white/[0.02]'}`}
        >
            <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-[10px] transition-all ${isOpen ? 'bg-[var(--theme-primary)] text-white shadow-[0_0_15px_rgba(var(--theme-primary-rgb),0.3)]' : 'bg-white/5 text-white/40'}`}>
                    {index}
                </div>
                <div className="flex items-center gap-2">
                    <Icon size={12} className={`transition-all ${isOpen ? 'text-[var(--theme-primary)]' : 'text-white/20'}`} />
                    <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all ${isOpen ? 'text-white' : 'text-white/40'}`}>{title}</h3>
                </div>
            </div>
            <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-[var(--theme-primary)]' : 'text-white/20'}`} />
        </button>
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
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "circOut" }} className="overflow-hidden bg-black/20">
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

                    <div className="p-4 bg-white/[0.03] border-b border-white/5">
                        <button onClick={handleApplyToSystem} className="w-full py-4 rounded-xl bg-gradient-to-r from-[var(--theme-primary)] to-indigo-600 text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                            <Sparkles size={14} /> Aplicar ao Sistema
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <CategoryLabel 
                            index={1} icon={Sparkles} title="Identidade & Presença" 
                            isOpen={activeCategory === 1} 
                            onToggle={() => setActiveCategory(activeCategory === 1 ? null : 1)} 
                        />
                        <AnimatePresence>
                            {activeCategory === 1 && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "circOut" }} className="overflow-hidden">
                        
                        <Section id="color-core" icon={Palette} title="Cores & Tons">
                            <div className="grid grid-cols-7 gap-2 mb-4">
                                {PRIMARY_COLORS.map((color, i) => (
                                    <button key={i} onClick={() => updateDraft('primaryColor', color.value)} className={`w-full aspect-square rounded-full transition-all hover:scale-125 relative ${draft.primaryColor === color.value ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0c0c0d] scale-110' : 'opacity-80'}`} style={{ backgroundColor: color.value }}>
                                        {draft.primaryColor === color.value && <Check size={10} className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                                    </button>
                                ))}
                                <div className="relative w-full aspect-square">
                                    <input 
                                        type="color" 
                                        value={draft.primaryColor} 
                                        onChange={(e) => updateDraft('primaryColor', e.target.value)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="absolute inset-0 rounded-full border border-white/20 flex items-center justify-center bg-white/5 hover:bg-white/10 transition-all">
                                        <Plus size={10} className="text-white/40" />
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block mb-3">Cor Primária (Sovereignty Color)</span>
                                <div className="flex flex-wrap gap-2.5">
                                    {[
                                        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', 
                                        '#0ea5e9', '#f97316', '#22c55e', '#6366f1', '#141414', '#ffffff'
                                    ].map(color => (
                                        <button 
                                            key={color}
                                            onClick={() => updateDraft('primaryColor', color)}
                                            className={`w-7 h-7 rounded-full border-2 transition-all transform hover:scale-110 active:scale-95 ${draft.primaryColor === color ? 'border-white scale-110 shadow-lg shadow-white/20' : 'border-transparent'}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                    <div className="relative group">
                                        <input 
                                            type="color" 
                                            value={draft.primaryColor} 
                                            onChange={(e) => updateDraft('primaryColor', e.target.value)}
                                            className="w-7 h-7 rounded-full bg-transparent border-none cursor-pointer appearance-none p-0 overflow-hidden"
                                        />
                                        <Plus size={10} className="absolute inset-0 m-auto pointer-events-none text-white/40" />
                                    </div>
                                </div>
                            </div>

                        </Section>

                        <Section id="branding" icon={Globe} title="Branding">
                            <div className="mb-4">
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/20 block mb-2">Nome do Sistema</span>
                                <input 
                                    type="text" value={draft.systemName} 
                                    onChange={(e) => updateDraft('systemName', e.target.value)}
                                    placeholder="Ex: Sarak Matrix"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-[11px] font-bold focus:border-[var(--theme-primary)] focus:outline-none transition-all text-white/80"
                                />
                            </div>

                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Logo (Light Mode)</span>
                                    <button onClick={() => lightLogoInputRef.current?.click()} className="text-[8px] font-black uppercase text-[var(--theme-primary)] hover:underline">Importar Arquivo</button>
                                </div>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" value={draft.logoUrl} 
                                        onChange={(e) => updateDraft('logoUrl', e.target.value)}
                                        placeholder="URL ou Base64..."
                                        className="flex-1 bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-[11px] font-bold focus:border-[var(--theme-primary)] focus:outline-none transition-all text-white/80"
                                    />
                                    <input type="file" ref={lightLogoInputRef} onChange={(e) => handleFileImport(e, 'logoUrl')} className="hidden" accept=".webp,.svg,.png" />
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Logo (Dark Mode)</span>
                                    <button onClick={() => darkLogoInputRef.current?.click()} className="text-[8px] font-black uppercase text-[var(--theme-primary)] hover:underline">Importar Arquivo</button>
                                </div>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" value={draft.logoDarkUrl} 
                                        onChange={(e) => updateDraft('logoDarkUrl', e.target.value)}
                                        placeholder="URL ou Base64..."
                                        className="flex-1 bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-[11px] font-bold focus:border-[var(--theme-primary)] focus:outline-none transition-all text-white/80"
                                    />
                                    <input type="file" ref={darkLogoInputRef} onChange={(e) => handleFileImport(e, 'logoDarkUrl')} className="hidden" accept=".webp,.svg,.png" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <SelectControl label="Posição Logo" options={[{id: 'left', label: 'Esquerda'}, {id: 'center', label: 'Centro'}]} value={draft.logoPosition} onChange={(v: any) => updateDraft('logoPosition', v)} />
                                <SliderControl label="Escala Logo" value={draft.logoScale} min={0.5} max={2.5} step={0.1} onChange={(v: any) => updateDraft('logoScale', v)} />
                            </div>
                        </Section>

                        <Section id="appearance" icon={Moon} title="Aparência">
                            <div className="grid grid-cols-2 gap-2 mb-6">
                                <button onClick={() => updateDraft('mode', 'dark')} className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${draft.mode === 'dark' ? 'bg-[var(--theme-primary)]/10 border-[var(--theme-primary)] text-[var(--theme-primary)]' : 'bg-white/5 border-transparent text-white/20 hover:text-white'}`}>
                                    <Moon size={16} /><span className="text-[8px] font-black uppercase">Dark Mode</span>
                                </button>
                                <button onClick={() => updateDraft('mode', 'light')} className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${draft.mode === 'light' ? 'bg-[var(--theme-primary)]/10 border-[var(--theme-primary)] text-[var(--theme-primary)]' : 'bg-white/5 border-transparent text-white/20 hover:text-white'}`}>
                                    <Sun size={16} /><span className="text-[8px] font-black uppercase">Light Mode</span>
                                </button>
                            </div>
                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/20 block">Tom de Voz (System Tone)</span>
                                    <div className="group relative">
                                        <AlertCircle size={10} className="text-white/40 cursor-help" />
                                        <div className="absolute left-0 bottom-full mb-2 w-48 p-3 bg-[#1a1a1b] border border-white/10 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50">
                                            <p className="text-[9px] leading-relaxed text-white/60">
                                                Define a personalidade da IA na interface. 
                                                <br/><br/>
                                                <span className="text-[var(--theme-primary)] font-bold">Formal:</span> Respostas precisas e sérias.
                                                <br/>
                                                <span className="text-[var(--theme-primary)] font-bold">Friendly:</span> Tom acolhedor e casual.
                                                <br/>
                                                <span className="text-[var(--theme-primary)] font-bold">Cyber:</span> Estilo hacker/tecnológico.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-1 p-1 bg-black/20 rounded-xl border border-white/5 mb-3">
                                    {['formal', 'friendly', 'cyber'].map(tone => (
                                        <button key={tone} onClick={() => updateDraft('systemTone', tone)} className={`py-2 rounded-lg text-[8px] font-black uppercase transition-all ${draft.systemTone === tone ? 'bg-[var(--theme-primary)] text-white shadow-lg' : 'text-white/20 hover:text-white/40'}`}>{tone}</button>
                                    ))}
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                    <p className="text-[9px] leading-relaxed text-white/40">
                                        {draft.systemTone === 'formal' && "TONALIDADE FORMAL: Respostas precisas, objetivas e tom institucional. Ideal para ambientes corporativos e fluxos críticos."}
                                        {draft.systemTone === 'friendly' && "TONALIDADE FRIENDLY: Linguagem acolhedora, casual e empática. Melhora a experiência de suporte e onboarding."}
                                        {draft.systemTone === 'cyber' && "TONALIDADE CYBER: Estilo hacker, tecnicista e direto. Utiliza terminologias de sistema e estética terminal."}
                                    </p>
                                </div>
                            </div>

                        </Section>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 2. DNA ESTRUTURAL */}
                        <CategoryLabel 
                            index={2} icon={LayoutIcon} title="DNA Estrutural" 
                            isOpen={activeCategory === 2} 
                            onToggle={() => setActiveCategory(activeCategory === 2 ? null : 2)} 
                        />
                        <AnimatePresence>
                            {activeCategory === 2 && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "circOut" }} className="overflow-hidden">

                        <Section id="geom" icon={Box} title="Geometria">
                            <SliderControl label="Raio de Curvatura (Border Radius)" value={draft.borderRadius} min={0} max={60} onChange={(v: any) => updateDraft('borderRadius', v)} suffix="px" />
                            <div className="grid grid-cols-2 gap-4">
                                <SliderControl label="Espessura Borda" value={draft.borderWidth} min={0} max={8} onChange={(v: any) => updateDraft('borderWidth', v)} suffix="px" />
                                <SelectControl label="Estilo Linha" options={['solid', 'dashed', 'dotted', 'double']} value={draft.borderStyle} onChange={(v: any) => updateDraft('borderStyle', v)} />
                            </div>
                            <SelectControl 
                                label="Tipo de Borda (Effect)" 
                                options={[
                                    {id: 'default', label: 'Flat / Standard'},
                                    {id: 'inlet', label: 'Inlet Deep'},
                                    {id: 'neon', label: 'Neon Glow'},
                                    {id: 'beveled', label: 'Beveled 3D'}
                                ]} 
                                value={draft.borderType} 
                                onChange={(v: any) => updateDraft('borderType', v)} 
                            />
                        </Section>

                        <Section id="arch" icon={SidebarIcon} title="Escala & Espaçamento">
                            <div className="grid grid-cols-2 gap-2 mb-6">
                                <button onClick={() => updateDraft('navigationStyle', 'sidebar')} className={`p-3 rounded-xl border transition-all ${draft.navigationStyle === 'sidebar' ? 'bg-[var(--theme-primary)]/10 border-[var(--theme-primary)] text-[var(--theme-primary)]' : 'bg-white/5 border-transparent text-white/20 hover:text-white'}`}>
                                    <SidebarIcon size={16} className="mx-auto mb-2" /><span className="text-[8px] font-black uppercase block">Sidebar</span>
                                </button>
                                <button onClick={() => updateDraft('navigationStyle', 'topbar')} className={`p-3 rounded-xl border transition-all ${draft.navigationStyle === 'topbar' ? 'bg-[var(--theme-primary)]/10 border-[var(--theme-primary)] text-[var(--theme-primary)]' : 'bg-white/5 border-transparent text-white/20 hover:text-white'}`}>
                                    <Maximize size={16} className="mx-auto mb-2" /><span className="text-[8px] font-black uppercase block">Topbar</span>
                                </button>
                            </div>
                            
                            <div className="space-y-6">
                                <SliderControl label="Espaçamento Global (Gap)" value={draft.layoutGap} min={0} max={80} onChange={(v: any) => updateDraft('layoutGap', v)} suffix="px" />
                                <SliderControl label="Espaçamento entre Abas" value={draft.tabGap} min={0} max={40} onChange={(v: any) => updateDraft('tabGap', v)} suffix="px" />
                                <SliderControl label="Margem da Seção de Navegação" value={draft.tabSectionMargin} min={0} max={60} onChange={(v: any) => updateDraft('tabSectionMargin', v)} suffix="px" />
                                <SliderControl label="Padding Interno (Cards)" value={draft.cardPadding} min={8} max={64} onChange={(v: any) => updateDraft('cardPadding', v)} suffix="px" />
                            </div>
                            <div className="mt-4">
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block mb-3">Densidade de Layout</span>
                                <div className="grid grid-cols-3 gap-1 p-1 bg-black/20 rounded-xl border border-white/5">
                                    {Object.values(DENSITY).map(d => (
                                        <button key={d.id} onClick={() => updateDraft('layoutDensity', d.id)} className={`py-2 rounded-lg text-[8px] font-black uppercase transition-all ${draft.layoutDensity === d.id ? 'bg-[var(--theme-primary)] text-white shadow-lg' : 'text-white/20'}`}>{d.label}</button>
                                    ))}
                                </div>
                            </div>
                        </Section>

                        <Section id="type" icon={Type} title="Tipografia">
                            <SelectControl label="Fonte Título" options={fonts} value={draft.headingFont} onChange={(v: any) => updateDraft('headingFont', v)} isFont />
                            <SelectControl label="Fonte Texto" options={fonts} value={draft.bodyFont} onChange={(v: any) => updateDraft('bodyFont', v)} isFont />
                            <div className="grid grid-cols-2 gap-4">
                                <SelectControl label="Peso Títulos" options={['300', '400', '600', '800', '900']} value={draft.headingWeight} onChange={(v: any) => updateDraft('headingWeight', v)} />
                                <SelectControl label="Espaçamento" options={['tight', 'normal', 'wide', 'widest']} value={draft.headingLetterSpacing} onChange={(v: any) => updateDraft('headingLetterSpacing', v)} />
                            </div>
                            <div className="mt-6">
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block mb-3">Escala de Fonte</span>
                                <div className="grid grid-cols-5 gap-1 p-1 bg-black/20 rounded-xl border border-white/5">
                                    {Object.values(SCALES).map(s => (
                                        <button key={s.id} onClick={() => updateDraft('fontScale', s.id)} className={`py-2 rounded-lg text-[8px] font-black uppercase transition-all ${draft.fontScale === s.id ? 'bg-[var(--theme-primary)] text-white shadow-lg' : 'text-white/20'}`}>{s.label}</button>
                                    ))}
                                </div>
                            </div>
                        </Section>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 3. ATMOSFERA & PROFUNDIDADE */}
                        <CategoryLabel 
                            index={3} icon={Wind} title="Atmosfera & Profundidade" 
                            isOpen={activeCategory === 3} 
                            onToggle={() => setActiveCategory(activeCategory === 3 ? null : 3)} 
                        />
                        <AnimatePresence>
                            {activeCategory === 3 && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "circOut" }} className="overflow-hidden">

                        <Section id="depth" icon={Layers} title="Elevação">
                            <SelectControl label="Orientação da Luz" options={[{id: 'top-down', label: 'Top-Down'}, {id: 'isometric', label: 'Isometric'}, {id: 'inner', label: 'Inlet'}]} value={draft.shadowOrientation} onChange={(v: any) => updateDraft('shadowOrientation', v)} />
                            <SliderControl label="Intensidade das Sombras" value={draft.shadowIntensity} min={0} max={1} step={0.1} onChange={(v: any) => updateDraft('shadowIntensity', v)} />
                        </Section>

                        <Section id="atmos" icon={Wind} title="Materiais (Glass)">
                            <SliderControl label="Blur Glass" value={draft.glassBlur} min={0} max={60} onChange={(v: any) => updateDraft('glassBlur', v)} suffix="px" />
                            <SliderControl label="Opacidade de Superfície" value={draft.glassOpacity} min={0} max={1} step={0.05} onChange={(v: any) => updateDraft('glassOpacity', v)} />
                            <SelectControl 
                                label="Material de Base" 
                                options={[
                                    {id: 'glass', label: 'Frosted Glass'},
                                    {id: 'metallic', label: 'Metallic'},
                                    {id: 'acrylic', label: 'Acrylic Deep'},
                                    {id: 'matte', label: 'Matte Velvet'}
                                ]} 
                                value={draft.surfaceMaterial} 
                                onChange={(v: any) => updateDraft('surfaceMaterial', v)} 
                            />
                        </Section>

                        <Section id="textures" icon={Sparkles} title="Texturas & Atmosfera">
                            <SelectControl 
                                label="Padrão de Textura" 
                                options={TEXTURE_LIBRARY.map(t => ({ id: t.id, label: t.name }))} 
                                value={draft.texture} 
                                onChange={(v: any) => updateDraft('texture', v)} 
                            />
                            <SliderControl 
                                label="Intensidade da Textura" 
                                value={draft.textureOpacity} 
                                min={0} max={0.5} step={0.01} 
                                onChange={(v: any) => updateDraft('textureOpacity', v)} 
                            />
                        </Section>

                        <Section id="effects" icon={Wind} title="Cinética">
                            <SliderControl label="Duração das Transições" value={draft.animationSpeed} min={0} max={1} step={0.05} onChange={(v: any) => updateDraft('animationSpeed', v)} suffix="s" />
                            <SliderControl label="Elasticidade (Bounciness)" value={draft.interfaceElasticity} min={0} max={1} step={0.05} onChange={(v: any) => updateDraft('interfaceElasticity', v)} />
                        </Section>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 4. MOTORES DE EXPERIÊNCIA */}
                        <CategoryLabel 
                            index={4} icon={Zap} title="Motores de Experiência" 
                            isOpen={activeCategory === 4} 
                            onToggle={() => setActiveCategory(activeCategory === 4 ? null : 4)} 
                        />
                        <AnimatePresence>
                            {activeCategory === 4 && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "circOut" }} className="overflow-hidden">

                        <Section id="engines" icon={Zap} title="Sarak Engines">
                            <div className="space-y-8">
                                {/* CHAT */}
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <MessageSquare size={12} className="text-[var(--theme-primary)]" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Motor de Chat (Chat Engine)</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-1 p-1 bg-black/20 rounded-xl border border-white/5 mb-4">
                                        {['glass', 'solid', 'minimal'].map(style => (
                                            <button key={style} onClick={() => updateDraft('chatBubbleStyle', style)} className={`py-2 rounded-lg text-[8px] font-black uppercase transition-all ${draft.chatBubbleStyle === style ? 'bg-[var(--theme-primary)] text-white shadow-lg' : 'text-white/20'}`}>{style}</button>
                                        ))}
                                    </div>
                                    <SliderControl label="Velocidade Digitação" value={draft.chatAnimationSpeed} min={0} max={0.5} step={0.01} onChange={(v: any) => updateDraft('chatAnimationSpeed', v)} suffix="s" />
                                </div>

                                {/* FLOW */}
                                <div className="pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Network size={12} className="text-[var(--theme-primary)]" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Motor de Fluxos (Flow Engine)</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-1 p-1 bg-black/20 rounded-xl border border-white/5 mb-4">
                                        {['dots', 'lines'].map(style => (
                                            <button key={style} onClick={() => updateDraft('flowGridStyle', style)} className={`py-2 rounded-lg text-[8px] font-black uppercase transition-all ${draft.flowGridStyle === style ? 'bg-[var(--theme-primary)] text-white shadow-lg' : 'text-white/20'}`}>{style}</button>
                                        ))}
                                    </div>
                                    <SliderControl label="Raio das Nodes" value={draft.flowNodeRadius} min={0} max={40} onChange={(v: any) => updateDraft('flowNodeRadius', v)} suffix="px" />
                                </div>

                                {/* CHARTS */}
                                <div className="pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <BarChart size={12} className="text-[var(--theme-primary)]" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Motor de Gráficos (Chart Engine)</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <SelectControl label="Tipo" options={['bar', 'area', 'line', 'donut']} value={draft.chartType} onChange={(v: any) => updateDraft('chartType', v)} />
                                        <SliderControl label="Espessura" value={draft.chartThickness} min={1} max={10} onChange={(v: any) => updateDraft('chartThickness', v)} suffix="px" />
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Suavização</span>
                                        <button onClick={() => updateDraft('chartSmoothing', !draft.chartSmoothing)} className={`w-10 h-5 rounded-full relative transition-all ${draft.chartSmoothing ? 'bg-[var(--theme-primary)]' : 'bg-white/10'}`}>
                                            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${draft.chartSmoothing ? 'left-6' : 'left-1'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Section>
                                </motion.div>
                            )}
                        </AnimatePresence>
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
                            draftTokens={draft}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ThemeCustomizationTab;
