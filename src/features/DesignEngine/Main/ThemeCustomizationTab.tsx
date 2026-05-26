import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, Check, Monitor, Tablet, Smartphone, 
    Palette, Moon, Sun, Globe, AlertCircle, Sparkles, Command, RotateCcw,
    Shield, Layout, Menu, Box, MousePointer2, Type, Hash, BarChart, Layers, 
    MessageSquare, Bell, Cpu, ExternalLink, Table, Settings, FileJson, ChevronDown, Search, Activity
} from 'lucide-react';

import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { PreviewCanvas } from '../Canvas/PreviewCanvas';
import { DesignScope } from '../../../core/Design/components/DesignScope';

import { MASTER_DESIGN_MAP } from '../../../core/Design/master-map';
import { TokenCatalog } from '../../../core/Design/catalog';
import { buildDynamicGroups } from '../utils/dynamic-categories';



// Modular Hooks & Components
import { useDesignDraft } from '../hooks/useDesignDraft';
import { useResizable } from '../hooks/useResizable';
import { 
    CategoryLabel, 
    Section, 
    ColorControl, 
    SliderControl, 
    SelectControl, 
    SwitchControl,
    InputControl,
    ImageUploaderControl
} from '../components/DesignControls';
import { MasterControlPanel } from './MasterControlPanel';
import { TemplatesTab } from './TemplatesTab';


/**
 * TokenControl (v12.1)
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
                    options={token.constraints?.options || token.options} 
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
 * ThemeCustomizationTab (v14.0 - Sovereign 6-Pillar Architecture)
 * Refatorado para a nova taxonomia de 6 pilares de soberania.
 */
export const ThemeCustomizationTab: React.FC = () => {
    const { systemDesign, design, branding, updateBranding, ...rest } = useSarakUI();
    
    // v12.6 - Deep Reference Stability
    // Impedimos que a desestruturação do contexto crie um novo objeto sarak a cada render
    const sarak = useMemo(() => ({ 
        systemDesign, 
        design, 
        ...rest 
    }), [systemDesign, design, JSON.stringify(rest)]);
    
    const { 
        draft, 
        updateDraft, 
        handleApplyToSystem, 
        handleApplyComponent,
        isComponentDirty,
        resetComponent,
        toast 
    } = useDesignDraft(sarak);
    
    const [activePreviewApp, setActivePreviewApp] = useState('dashboard');
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'smartphone'>('desktop');

    const [activePillarId, setActivePillarId] = useState<string | null>('brand');
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'preview' | 'catalog' | 'templates'>('preview');
    const [searchQuery, setSearchQuery] = useState('');
    const [isEssentialMode, setIsEssentialMode] = useState(true);

    const appToPillarMap: Record<string, string> = useMemo(() => ({
        'dashboard': 'surfaces',
        'components': 'surfaces',
        'tabela': 'surfaces',
        'caixas-texto': 'interaction',
        'typography': 'typography',
        'chat': 'advanced',
        'graficos': 'advanced',
        'matrix': 'advanced',
        'auth': 'brand',
        'settings': 'systems',
        'logs': 'systems'
    }), []);

    useEffect(() => {
        const pillarId = appToPillarMap[activePreviewApp];
        if (pillarId && activePillarId !== pillarId) {
            setActivePillarId(pillarId);
        }
    }, [activePreviewApp, appToPillarMap]);

    // handleInspectComponent moved below groupedStructure

    // 0. Redimensionamento da Barra Design Engine
    const { size: engineSidebarWidth, startResizing: startResizingEngine, isResizing: isResizingEngine } = useResizable({
        initialSize: 320,
        minSize: 280,
        maxSize: 600,
        direction: 'horizontal'
    });

    // 1. Definição dos 6 Pilares de Soberania (Taxonomia v14.0)
    const pillars = useMemo(() => [
        { id: 'brand', title: '1. Marca e Identidade', icon: Shield, index: 1 },
        { id: 'typography', title: '2. Tipografia e Escala', icon: Type, index: 2 },
        { id: 'surfaces', title: '3. Superfícies e Profundidade', icon: Layout, index: 3 },
        { id: 'interaction', title: '4. Interação e Estado', icon: MousePointer2, index: 4 },
        { id: 'navigation', title: '5. Navegação e Estrutura', icon: Activity, index: 5 },
        { id: 'systems', title: '6. Sistemas e Experiência', icon: Cpu, index: 6 },
        { id: 'advanced', title: '7. Componentes Avançados', icon: Sparkles, index: 7 },
    ], []);

    // Componente Global (Preferências do Usuário) extraído do master map
    const globalComponent = useMemo(() => MASTER_DESIGN_MAP?.components?.find(c => c.id === 'global'), []);

    // 2. Agrupamento Dinâmico (Folksonomia) via Json
    const groupedStructure = useMemo(() => {
        if (!MASTER_DESIGN_MAP?.components || !TokenCatalog) return {};
        return buildDynamicGroups(MASTER_DESIGN_MAP.components, TokenCatalog);
    }, [pillars]);

    // 3. Tokens Essenciais Dinâmicos (Importance >= 80)
    const dynamicEssentialTokens = useMemo(() => {
        if (!TokenCatalog) return new Set<string>();
        return new Set(TokenCatalog.filter((t: any) => (t.importance || 0) >= 80).map((t: any) => t.tokenId));
    }, []);

    const handleInspectComponent = useCallback((schemaId: string) => {
        const foundPillar = Object.keys(groupedStructure).find(p => 
            Object.values(groupedStructure[p]).some(comps => 
                comps.some(c => c.id === schemaId)
            )
        );
        if (foundPillar) setActivePillarId(foundPillar);
        setTimeout(() => setActiveSectionId(schemaId), 100);
        toast && toast.message ? null : null; // Suppress unused var warning
    }, [groupedStructure, toast]);

    // Busca Filtrada
    const filteredResults = useMemo(() => {
        if (!searchQuery) return null;
        const query = searchQuery.toLowerCase();
        return MASTER_DESIGN_MAP.components.flatMap(c => 
            c.tokens.filter(t => t.label.toLowerCase().includes(query) || t.id.toLowerCase().includes(query))
        );
    }, [searchQuery]);

    return (
        <div className="flex flex-1 h-screen max-h-screen bg-[var(--theme-bg)] overflow-hidden">
            {/* Sidebar de Configuração */}
            <div 
                className={`flex flex-col h-full max-h-full border-r border-[var(--theme-border)] bg-[var(--theme-card)] relative z-10 overflow-hidden shrink-0 ${isResizingEngine ? 'transition-none' : 'transition-all duration-300'}`}
                style={{ width: `${engineSidebarWidth}px`, minWidth: '280px', maxWidth: '600px', position: 'relative' }}
            >
                <div onMouseDown={startResizingEngine} className="absolute right-0 top-0 w-1.5 h-full cursor-col-resize hover:bg-[var(--theme-primary)]/50 transition-colors z-50 active:bg-[var(--theme-primary)]" />
                
                {/* Header Superior */}
                <div className="p-5 pb-4 shrink-0 border-b border-[var(--theme-border)] bg-[var(--theme-surface)]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-[var(--theme-primary)] flex items-center justify-center">
                                <Zap className="text-white w-3.5 h-3.5" />
                            </div>
                            <div className="text-[10px] font-black text-[var(--theme-text)] tracking-tight uppercase">Design Engine <span className="text-[var(--theme-primary)] ml-0.5 opacity-50">v14.0</span></div>
                        </div>
                        <div className="flex gap-1 p-0.5 bg-[var(--theme-layer)] rounded-lg border border-[var(--theme-border)]">
                            {['preview', 'catalog', 'templates'].map((m) => (
                                <button 
                                    key={m} 
                                    onClick={() => setViewMode(m as any)} 
                                    className={`p-1.5 rounded-md transition-all ${viewMode === m ? 'bg-[var(--theme-primary)]/20 text-[var(--theme-primary)]' : 'text-[var(--theme-muted)] hover:text-[var(--theme-text)]'}`}
                                >
                                    {m === 'preview' ? <Monitor size={10} /> : m === 'catalog' ? <Table size={10} /> : <FileJson size={10} />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Busca e Toggle Essencial */}
                    <div className="flex flex-col gap-3 mb-4">
                        <div className="relative group">
                            <Search size={10} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-muted)] group-focus-within:text-[var(--theme-primary)] transition-all" />
                            <input 
                                type="text" 
                                placeholder="BUSCAR TOKEN..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-xl py-2.5 pl-9 pr-4 text-[9px] font-black tracking-widest uppercase focus:outline-none focus:border-[var(--theme-primary)]/50 transition-all text-[var(--theme-text)] placeholder:text-[var(--theme-muted)]"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <label 
                                className="flex items-center gap-2 cursor-pointer group"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsEssentialMode(!isEssentialMode);
                                }}
                            >
                                <div className={`w-6 h-3 rounded-full relative transition-all ${!isEssentialMode ? 'bg-[var(--theme-primary)]' : 'bg-[var(--theme-border)]'}`}>
                                    <div className={`absolute top-0.5 w-2 h-2 rounded-full bg-[var(--theme-text)] transition-all ${!isEssentialMode ? 'left-3.5' : 'left-0.5'}`} />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--theme-muted)] group-hover:text-[var(--theme-text)]">Modo Avançado (Hyper-Granular)</span>
                            </label>
                        </div>
                    </div>

                    <button onClick={handleApplyToSystem} className="w-full group relative overflow-hidden bg-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/90 text-white py-2.5 rounded-lg font-black text-[9px] uppercase tracking-[0.1em] transition-all active:scale-[0.98] shadow-[0_10px_20px_-5px_rgba(var(--theme-primary-rgb),0.3)]">
                        <div className="flex items-center justify-center gap-2 relative z-10">
                            <Check size={10} />
                            <span>Aplicar Alterações Globais</span>
                        </div>
                    </button>
                </div>

                {/* Área de Conteúdo (Scrollable) */}
                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar-sidebar bg-[var(--theme-bg)]/30">
                    <AnimatePresence mode="wait">
                        {searchQuery ? (
                            <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
                                <div className="text-[8px] font-black text-[var(--theme-muted)] uppercase tracking-widest mb-4">Resultados da Busca</div>
                                {filteredResults?.map(token => (
                                    <TokenControl key={token.id} token={token} value={draft[token.id]} onChange={(val) => updateDraft(token.id, val)} />
                                ))}
                            </motion.div>
                        ) : viewMode === 'preview' ? (
                            <motion.div key="pillars" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="pt-2 pb-20">
                                
                                {/* BLOCO DE CONFIGURAÇÕES GLOBAIS */}
                                {globalComponent && (
                                    <div className="mx-4 mb-4 mt-2 p-5 rounded-2xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.05] shadow-[0_0_20px_rgba(0,0,0,0.2)]">
                                        <div className="flex items-center gap-2.5 mb-5">
                                            <div className="w-5 h-5 rounded-md bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                                <Globe className="w-3 h-3 text-blue-400" />
                                            </div>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">Preferências Globais</span>
                                        </div>
                                        <div className="flex flex-col gap-4">
                                            {globalComponent.tokens.map((token: any) => (
                                                <TokenControl key={token.id} token={token} value={draft[token.id]} onChange={(val) => updateDraft(token.id, val)} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* BLOCO DE BRANDING ISOLADO */}
                                {branding && updateBranding && (
                                    <div className="mx-4 mb-4 mt-2 p-5 rounded-2xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.05] shadow-[0_0_20px_rgba(0,0,0,0.2)]">
                                        <div className="flex items-center gap-2.5 mb-5">
                                            <div className="w-5 h-5 rounded-md bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                                <Shield className="w-3 h-3 text-amber-400" />
                                            </div>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">Identidade da Empresa</span>
                                        </div>
                                        <div className="flex flex-col gap-4">
                                            <InputControl 
                                                label="Nome da Empresa (Topo/Sidebar)" 
                                                type="text" 
                                                value={branding.companyName || ''} 
                                                onChange={(val: string) => updateBranding({ companyName: val })} 
                                            />
                                            <InputControl 
                                                label="Nome no Login" 
                                                type="text" 
                                                value={branding.loginName || ''} 
                                                onChange={(val: string) => updateBranding({ loginName: val })} 
                                            />
                                            <InputControl 
                                                label="Título da Aba (Navegador)" 
                                                type="text" 
                                                value={branding.tabName || ''} 
                                                onChange={(val: string) => updateBranding({ tabName: val })} 
                                            />
                                            <ImageUploaderControl 
                                                label="Logotipo (Qualquer Formato)" 
                                                value={branding.logoBase64 || null} 
                                                onChange={(val: string | null) => updateBranding({ logoBase64: val })} 
                                            />
                                        </div>
                                    </div>
                                )}

                                {pillars.map((pillar) => {
                                    // Conta quantas subcategorias possuem pelo menos 1 token visível
                                    const activeSubcategoriesCount = Object.values(groupedStructure[pillar.id] || {}).filter((tokens) => {
                                        return (tokens as any[]).some((token: any) => !isEssentialMode || dynamicEssentialTokens.has(token.id));
                                    }).length;

                                    return (
                                    <div key={pillar.id} className="border-b border-[var(--theme-border)] last:border-0">
                                        <CategoryLabel 
                                            icon={pillar.icon} 
                                            title={`${pillar.title} (${activeSubcategoriesCount})`} 
                                            index={pillar.index} 
                                            isOpen={activePillarId === pillar.id} 
                                            onToggle={() => {
                                                const nextId = activePillarId === pillar.id ? null : pillar.id;
                                                setActivePillarId(nextId);
                                                if (nextId === 'advanced') setActivePreviewApp('matrix');
                                            }}
                                            isDirty={isComponentDirty(pillar.id)}
                                            onReset={() => resetComponent(pillar.id)}
                                            onApply={() => handleApplyComponent(pillar.id)}
                                        />
                                        <AnimatePresence>
                                            {activePillarId === pillar.id && (
                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-[var(--theme-layer)]">
                                                    <div className="px-2 py-2 flex flex-col gap-1">
                                                        {Object.entries(groupedStructure[pillar.id] || {}).map(([subcat, tokens]) => {
                                                            const visibleTokens = (tokens as any[]).filter((token: any) => !isEssentialMode || dynamicEssentialTokens.has(token.id));
                                                            if (visibleTokens.length === 0) return null;
                                                            return (
                                                                <Section 
                                                                    key={subcat} id={`${pillar.id}-${subcat}`} icon={Command} title={`${subcat} (${visibleTokens.length})`} 
                                                                    activeSection={activeSectionId} onToggle={setActiveSectionId}
                                                                >
                                                                    <div className="flex flex-col gap-4">
                                                                        {visibleTokens.map((token: any) => (
                                                                            <TokenControl key={token.id} token={token} value={draft[token.id]} onChange={(val) => updateDraft(token.id, val)} />
                                                                        ))}
                                                                    </div>
                                                                </Section>
                                                            );
                                                        })}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    );
                                })}
                            </motion.div>
                        ) : viewMode === 'catalog' ? (
                            <motion.div key="catalog" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                                <MasterControlPanel />
                            </motion.div>
                        ) : (
                            <motion.div key="templates" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                                <TemplatesTab />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Canvas de Preview */}
            <div className="flex-1 relative bg-[var(--theme-bg)] flex flex-col">
                <PreviewCanvas 
                    previewDevice={previewDevice}
                    activePreviewApp={activePreviewApp}
                    config={draft}
                    mode={draft.mode || sarak.mode || 'dark'}
                    onUpdateDraft={updateDraft}
                    sarak={sarak}
                    previewLayoutId={draft.layout || sarak.layout || 'glass'}
                    setActivePreviewApp={setActivePreviewApp}
                    previewAnimationStyle={draft.animationStyle || sarak.animationStyle || 'standard'}
                    previewEmojiSet={draft.emojiSet || sarak.emojiSet || 'none'}
                    previewPrimaryColor={draft.colorPrimary || sarak.colorPrimary || '#3b82f6'}
                    draftTokens={draft}
                    activeCategory={activePillarId}
                    activeSectionId={activeSectionId}
                    isDualView={viewMode === 'preview'}
                    customThemes={[]}
                    onInspectComponent={handleInspectComponent}
                />
                
                {/* Toasts de Feedback */}
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

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar-sidebar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar-sidebar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar-sidebar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
                .custom-scrollbar-sidebar::-webkit-scrollbar-thumb:hover { background: var(--theme-primary); }
            `}} />
        </div>
    );
};

export default ThemeCustomizationTab;
