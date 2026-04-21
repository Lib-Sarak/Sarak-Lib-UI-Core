import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Check, Zap, Edit3, ChevronLeft, ChevronDown,
    Monitor, Tablet, Smartphone, Grid, List, Keyboard, Globe, Moon, Sun, 
    Type, Maximize, Layout as LayoutIcon, Sidebar as SidebarIcon,
    Layers, MousePointer2, Palette, Box, Wind, Sparkles, AlertCircle, BarChart3
} from 'lucide-react';

import { PRIMARY_COLORS, SCALES, DENSITY, BASE_PRESETS } from '../../constants/design-tokens';
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
        cursorPhysics: sarak.cursorPhysics,
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
        isAutoHideEnabled: sarak.isAutoHideEnabled
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
            isGeometricCut: sarak.isGeometricCut, textureOpacity: sarak.textureOpacity, animationSpeed: sarak.animationSpeed,
            tabFont: sarak.tabFont, layoutGap: sarak.layoutGap,
            // Identity & Branding v6.0
            systemName: sarak.systemName, logoUrl: sarak.logoUrl, logoDarkUrl: sarak.logoDarkUrl,
            logoScale: sarak.logoScale, logoPosition: sarak.logoPosition, systemTone: sarak.systemTone,
            emptyStateId: sarak.emptyStateId,
            // Materials & Borders v6.0
            surfaceMaterial: sarak.surfaceMaterial, borderType: sarak.borderType,
            cursorPhysics: sarak.cursorPhysics, interfaceElasticity: sarak.interfaceElasticity,
            // Navigation & Structures v6.0
            isSplitViewEnabled: sarak.isSplitViewEnabled, secondaryModuleId: sarak.secondaryModuleId,
            searchStyle: sarak.searchStyle,
            // Data Visualization v6.0
            chartPalette: sarak.chartPalette, chartStyle: sarak.chartStyle,
            // Sovereignty & Privacy v6.0
            shadowOrientation: sarak.shadowOrientation, shadowColorMode: sarak.shadowColorMode,
            isAutoHideEnabled: sarak.isAutoHideEnabled
        });
    }, [sarak.isHydrated]);

    const showToast = (type: 'success' | 'warning', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

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
            cursorPhysics: 'boolean', interfaceElasticity: 'number',
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
            '--cursor-physics': 'cursorPhysics', '--interface-elasticity': 'interfaceElasticity',
            '--bg-texture': 'texture', '--texture-opacity': 'textureOpacity', '--theme-primary': 'primaryColor',
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

                    <div className="flex-1 overflow-y-auto custom-scrollbar self-scrollable">
                        <Section id="arch" icon={SidebarIcon} title="Arquitetura">
                            <div className="grid grid-cols-2 gap-2 mb-6">
                                <button onClick={() => updateDraft('navigationStyle', 'sidebar')} className={`p-3 rounded-xl border transition-all ${draft.navigationStyle === 'sidebar' ? 'bg-[var(--theme-primary)]/10 border-[var(--theme-primary)] text-[var(--theme-primary)]' : 'bg-white/5 border-transparent text-white/20 hover:text-white'}`}>
                                    <SidebarIcon size={16} className="mx-auto mb-2" /><span className="text-[8px] font-black uppercase block">Sidebar</span>
                                </button>
                                <button onClick={() => updateDraft('navigationStyle', 'topbar')} className={`p-3 rounded-xl border transition-all ${draft.navigationStyle === 'topbar' ? 'bg-[var(--theme-primary)]/10 border-[var(--theme-primary)] text-[var(--theme-primary)]' : 'bg-white/5 border-transparent text-white/20 hover:text-white'}`}>
                                    <Maximize size={16} className="mx-auto mb-2" /><span className="text-[8px] font-black uppercase block">Topbar</span>
                                </button>
                                <button onClick={() => updateDraft('navigationStyle', 'dock')} className={`p-3 rounded-xl border transition-all ${draft.navigationStyle === 'dock' ? 'bg-[var(--theme-primary)]/10 border-[var(--theme-primary)] text-[var(--theme-primary)]' : 'bg-white/5 border-transparent text-white/20 hover:text-white'} col-span-2`}>
                                    <Monitor size={16} className="mx-auto mb-2" /><span className="text-[8px] font-black uppercase block">Navigation Dock (Premium)</span>
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--theme-primary)]/5 border border-[var(--theme-primary)]/20 mt-2 group">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--theme-primary)]">Auto-ocultar Barra</span>
                                    <span className="text-[8px] text-white/30 uppercase tracking-tighter">Revelar ao passar o mouse na extremidade</span>
                                </div>
                                <button onClick={() => updateDraft('isAutoHideEnabled', !draft.isAutoHideEnabled)} className={`w-10 h-5 rounded-full relative transition-all ${draft.isAutoHideEnabled ? 'bg-[var(--theme-primary)]' : 'bg-white/10'}`}>
                                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${draft.isAutoHideEnabled ? 'left-6' : 'left-1'}`} />
                                </button>
                            </div>
                            <SliderControl label="Largura Sidebar" value={draft.sidebarWidth} min={60} max={400} onChange={(v: any) => updateDraft('sidebarWidth', v)} suffix="px" />
                            <div className="grid grid-cols-3 gap-1 p-1 bg-black/20 rounded-xl border border-white/5 mt-4">
                                {Object.values(DENSITY).map(d => (
                                    <button key={d.id} onClick={() => updateDraft('layoutDensity', d.id)} className={`py-2 rounded-lg text-[8px] font-black uppercase transition-all ${draft.layoutDensity === d.id ? 'bg-[var(--theme-primary)] text-white shadow-lg' : 'text-white/20'}`}>{d.label}</button>
                                ))}
                            </div>
                        </Section>

                        <Section id="struct" icon={Grid} title="Estruturas & Busca">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 group mb-4">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Split-View Mode</span>
                                    <span className="text-[8px] text-white/20 uppercase tracking-tighter">Dois módulos em paralelo</span>
                                </div>
                                <button onClick={() => updateDraft('isSplitViewEnabled', !draft.isSplitViewEnabled)} className={`w-10 h-5 rounded-full relative transition-all ${draft.isSplitViewEnabled ? 'bg-[var(--theme-primary)]' : 'bg-white/10'}`}>
                                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${draft.isSplitViewEnabled ? 'left-6' : 'left-1'}`} />
                                </button>
                            </div>

                            {draft.isSplitViewEnabled && (
                                <SelectControl 
                                    label="Módulo Secundário" 
                                    options={sarak.registeredModules.map(m => ({ id: m.id, label: m.label }))}
                                    value={draft.secondaryModuleId}
                                    onChange={(v: any) => updateDraft('secondaryModuleId', v)}
                                />
                            )}

                            <div className="pt-4 border-t border-white/5 mt-2">
                                <SelectControl 
                                    label="Estilo de Busca Global" 
                                    options={[
                                        {id: 'command-palette', label: 'Command Palette (Premium)'},
                                        {id: 'minimal', label: 'Minimal Input'}
                                    ]} 
                                    value={draft.searchStyle} 
                                    onChange={(v: any) => updateDraft('searchStyle', v)} 
                                />
                            </div>
                        </Section>

                        <Section id="type" icon={Type} title="Tipografia">
                            <SelectControl label="Fonte Título" options={fonts} value={draft.headingFont} onChange={(v: any) => updateDraft('headingFont', v)} isFont />
                            <SelectControl label="Fonte Subtítulo" options={fonts} value={draft.subtitleFont} onChange={(v: any) => updateDraft('subtitleFont', v)} isFont />
                            <SelectControl label="Fonte Abas/Menus" options={fonts} value={draft.tabFont} onChange={(v: any) => updateDraft('tabFont', v)} isFont />
                            <SelectControl label="Fonte Texto" options={fonts} value={draft.bodyFont} onChange={(v: any) => updateDraft('bodyFont', v)} isFont />
                            <div className="grid grid-cols-2 gap-4">
                                <SelectControl label="Peso" options={['300', '400', '600', '800', '900']} value={draft.headingWeight} onChange={(v: any) => updateDraft('headingWeight', v)} />
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

                        <Section id="geom" icon={Box} title="Geometria & Materiais">
                            <SliderControl label="Radius" value={draft.borderRadius} min={0} max={60} onChange={(v: any) => updateDraft('borderRadius', v)} suffix="px" />
                            <div className="grid grid-cols-2 gap-4">
                                <SliderControl label="Borda" value={draft.borderWidth} min={0} max={8} onChange={(v: any) => updateDraft('borderWidth', v)} suffix="px" />
                                <SelectControl label="Estilo" options={['solid', 'dashed', 'dotted', 'double']} value={draft.borderStyle} onChange={(v: any) => updateDraft('borderStyle', v)} />
                            </div>
                            
                            <div className="pt-4 border-t border-white/5 mt-2">
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block mb-4">Surface Master v6.0</span>
                                <div className="grid grid-cols-1 gap-4">
                                    <SelectControl 
                                        label="Material de Superfície" 
                                        options={[
                                            {id: 'glass', label: 'Frosted Glass'},
                                            {id: 'metallic', label: 'Reflective Metallic'},
                                            {id: 'brushed', label: 'Brushed Aluminum'},
                                            {id: 'acrylic', label: 'Acrylic Deep'},
                                            {id: 'matte', label: 'Matte Velvet'}
                                        ]} 
                                        value={draft.surfaceMaterial} 
                                        onChange={(v: any) => updateDraft('surfaceMaterial', v)} 
                                    />
                                    <SelectControl 
                                        label="Tipo de Borda (Neo)" 
                                        options={[
                                            {id: 'default', label: 'Flat / Standard'},
                                            {id: 'inlet', label: 'Inlet Deep'},
                                            {id: 'neon', label: 'Neon Glow'},
                                            {id: 'beveled', label: 'Beveled 3D'}
                                        ]} 
                                        value={draft.borderType} 
                                        onChange={(v: any) => updateDraft('borderType', v)} 
                                    />
                                </div>
                            </div>

                            <SliderControl label="Espaçamento Cards (Gap)" value={draft.layoutGap} min={0} max={80} onChange={(v: any) => updateDraft('layoutGap', v)} suffix="px" />
                            <SliderControl label="Glass Opacity" value={draft.glassOpacity} min={0} max={1} step={0.05} onChange={(v: any) => updateDraft('glassOpacity', v)} />
                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 mt-4 group">
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Cortes Geométricos</span>
                                <button onClick={() => updateDraft('isGeometricCut', !draft.isGeometricCut)} className={`w-10 h-5 rounded-full relative transition-all ${draft.isGeometricCut ? 'bg-[var(--theme-primary)]' : 'bg-white/10'}`}>
                                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${draft.isGeometricCut ? 'left-6' : 'left-1'}`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 mt-2 group">
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Física do Cursor</span>
                                <button onClick={() => updateDraft('cursorPhysics', !draft.cursorPhysics)} className={`w-10 h-5 rounded-full relative transition-all ${draft.cursorPhysics ? 'bg-[var(--theme-primary)]' : 'bg-white/10'}`}>
                                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${draft.cursorPhysics ? 'left-6' : 'left-1'}`} />
                                </button>
                            </div>

                            <SliderControl label="Sombra" value={draft.shadowIntensity} min={0} max={1} step={0.1} onChange={(v: any) => updateDraft('shadowIntensity', v)} />
                        </Section>

                        <Section id="atmos" icon={Wind} title="Atmosfera">
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

                        <Section id="color" icon={Palette} title="Cores & Identidade">
                            <div className="grid grid-cols-7 gap-2 mb-4">
                                {PRIMARY_COLORS.map((color, i) => (
                                    <button key={i} onClick={() => updateDraft('primaryColor', color.value)} className={`w-full aspect-square rounded-full transition-all hover:scale-125 relative ${draft.primaryColor === color.value ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0c0c0d] scale-110' : 'opacity-80'}`} style={{ backgroundColor: color.value }}>
                                        {draft.primaryColor === color.value && <Check size={10} className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                                    </button>
                                ))}
                            </div>

                            <div className="mb-6">
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block mb-3">Paletas de Identidade</span>
                                <div className="grid grid-cols-1 gap-2">
                                    {[
                                        { id: 'warm', label: 'Cores Quentes', colors: ['#f87171', '#fb923c', '#fbbf24'] },
                                        { id: 'cold', label: 'Cores Frias', colors: ['#60a5fa', '#34d399', '#818cf8'] },
                                        { id: 'sunset', label: 'Sarak Sunset', colors: ['#ec4899', '#f43f5e', '#fb923c'] },
                                        { id: 'matrix', label: 'Matrix Deep', colors: ['#0ea5e9', '#6366f1', '#a855f7'] }
                                    ].map(pal => (
                                        <button 
                                            key={pal.id}
                                            onClick={() => updateDraft('primaryColor', pal.colors[0])} // Aplica a primeira cor como primária
                                            className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/[0.08] transition-all"
                                        >
                                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/60">{pal.label}</span>
                                            <div className="flex -space-x-1.5">
                                                {pal.colors.map((c, i) => (
                                                    <div key={i} className="w-4 h-4 rounded-full border border-[#0c0c0d]" style={{ backgroundColor: c }} />
                                                ))}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5">
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block mb-4">Branding v6.0</span>
                                
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

                                <div className="mt-4">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/20 block mb-2">Tom de Voz (Personality)</span>
                                    <div className="grid grid-cols-3 gap-1 p-1 bg-black/20 rounded-xl border border-white/5">
                                        {['formal', 'friendly', 'cyber'].map(tone => (
                                            <button 
                                                key={tone} 
                                                onClick={() => updateDraft('systemTone', tone)} 
                                                className={`py-2 rounded-lg text-[8px] font-black uppercase transition-all ${draft.systemTone === tone ? 'bg-[var(--theme-primary)] text-white shadow-lg' : 'text-white/20 hover:text-white/40'}`}
                                            >
                                                {tone}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Section>

                        <Section id="data" icon={BarChart3} title="Dados & Gráficos">
                            <div className="space-y-4">
                                <SelectControl 
                                    label="Estilo de Visualização" 
                                    options={[
                                        {id: 'glass', label: 'Glass Morphic (Translucido)'},
                                        {id: 'line', label: 'Vector Line (Minimal)'},
                                        {id: 'bar', label: 'Neumorphic Bar'},
                                        {id: 'solid', label: 'Solid Corporate'}
                                    ]} 
                                    value={draft.chartStyle} 
                                    onChange={(v: any) => updateDraft('chartStyle', v)} 
                                />

                                <div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/20 block mb-3">Paleta de Referência</span>
                                    <div className="flex flex-col gap-2">
                                        {[
                                            { id: 'matrix', label: 'Sarak Matrix (Core)', colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'] },
                                            { id: 'neon', label: 'Vivid Neon', colors: ['#06b6d4', '#ec4899', '#8b5cf6', '#10b981', '#fbbf24'] },
                                            { id: 'monochrome', label: 'Midnight Mono', colors: ['#94a3b8', '#64748b', '#475569', '#334155', '#1e293b'] }
                                        ].map((pal) => (
                                            <button 
                                                key={pal.id} 
                                                onClick={() => updateDraft('chartPalette', pal.colors)}
                                                className={`p-2 rounded-xl border transition-all flex items-center justify-between ${JSON.stringify(draft.chartPalette) === JSON.stringify(pal.colors) ? 'bg-[var(--theme-primary)]/10 border-[var(--theme-primary)]' : 'bg-white/5 border-white/10'}`}
                                            >
                                                <span className="text-[8px] font-black uppercase tracking-tighter text-white/60">{pal.label}</span>
                                                <div className="flex -space-x-1">
                                                    {pal.colors.map((c, i) => (
                                                        <div key={i} className="w-4 h-4 rounded-full border border-black/20" style={{ backgroundColor: c }} />
                                                    ))}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[8px] text-white/20 mt-3 uppercase tracking-tighter italic">Selecione uma paleta para harmonizar os gráficos do sistema.</p>
                                </div>
                            </div>
                        </Section>

                        <Section id="depth" icon={Layers} title="Sombras & Profundidade">
                            <div className="space-y-4">
                                <SelectControl 
                                    label="Orientação da Luz" 
                                    options={[
                                        {id: 'top-down', label: 'Top-Down (Standard)'},
                                        {id: 'isometric', label: 'Isometric (45°)'},
                                        {id: 'inner', label: 'Inlet (Inner Shadow)'}
                                    ]} 
                                    value={draft.shadowOrientation} 
                                    onChange={(v: any) => updateDraft('shadowOrientation', v)} 
                                />

                                <SelectControl 
                                    label="Modo de Cor da Sombra" 
                                    options={[
                                        {id: 'neutral', label: 'Neutral (Black/Gray)'},
                                        {id: 'adaptive', label: 'Adaptive (Muted Tint)'},
                                        {id: 'match', label: 'Primary Match (Glow)'}
                                    ]} 
                                    value={draft.shadowColorMode} 
                                    onChange={(v: any) => updateDraft('shadowColorMode', v)} 
                                />
                            </div>
                        </Section>

                        <Section id="effects" icon={Wind} title="Efeitos">
                            <SliderControl label="Velocidade" value={draft.animationSpeed} min={0} max={1} step={0.05} onChange={(v: any) => updateDraft('animationSpeed', v)} suffix="s" />
                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 mt-4 group">
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Micro-interações</span>
                                <div className="text-[10px] font-bold text-[var(--theme-primary)]">Ativo</div>
                            </div>
                        </Section>
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
                        <div className="w-[360px] border-r border-white/5 flex flex-col bg-white/[0.01] h-full">
                            <div className="p-6 pb-0 flex flex-col">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-6 flex items-center gap-2">
                                    <div className="w-8 h-[1px] bg-white/10" /> Archetypes
                                </h2>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-8">
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
