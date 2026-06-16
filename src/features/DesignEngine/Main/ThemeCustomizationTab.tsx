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
import DesignPillars from '../config/design-pillars.json';



// Modular Hooks & Components
import { useDesignDraft } from '../hooks/useDesignDraft';
import { useThemeEngineState } from './hooks/useThemeEngineState';
import { useResizable } from '../hooks/useResizable';
import { TokenControl } from './components/TokenControl';
import {
    CategoryLabel,
    Section,
    ColorControl,
    SliderControl,
    SelectControl,
    SwitchControl,
    InputControl,
    MediaUploaderControl
} from '../components/DesignControls';
import { MasterControlPanel } from './MasterControlPanel';
import { TemplatesTab } from './TemplatesTab';
import { SaveThemeModal, SaveThemeAction } from './components/SaveThemeModal';

/**
 * ThemeCustomizationTab (v14.0 - Sovereign 6-Pillar Architecture)
 * Refatorado para a nova taxonomia de 6 pilares de soberania.
 */
export const ThemeCustomizationTab: React.FC = () => {
    // 1) Puxamos o estado visual e métodos globais de persistência do Theme Engine
    const {
        sarak, uiBaseUrl, apiToken,
        activePreviewApp, setActivePreviewApp,
        previewDevice, setPreviewDevice,
        activePillarId, setActivePillarId,
        activeSectionId, setActiveSectionId,
        viewMode, setViewMode,
        searchQuery, setSearchQuery,
        isEssentialMode, setIsEssentialMode,
        isPreviewStacked, setIsPreviewStacked,
        currentThemeId, setCurrentThemeId,
        currentThemeOrigin, setCurrentThemeOrigin,
        currentThemeName, setCurrentThemeName,
        isSaveModalOpen, setIsSaveModalOpen,
        isSaving, setIsSaving,
        pendingApply, setPendingApply,
        fetchActiveTheme
    } = useThemeEngineState();

    const {
        draft,
        updateDraft,
        handleApplyToSystem,
        handleApplyComponent,
        isComponentDirty,
        resetComponent,
        isDirty,
        toast,
        showToast,
        handleThemePreview
    } = useDesignDraft(sarak);

    const saveNewThemeAPI = async (design: any, name: string, isActive: boolean) => {
        const headers: any = { 'Content-Type': 'application/json' };
        if (apiToken) headers['Authorization'] = `Bearer ${apiToken}`;
        const res = await fetch(`${uiBaseUrl}/themes`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ design, name, is_active: isActive })
        });
        return await res.json();
    };

    const updateThemeAPI = async (themeId: string, design: any, name: string, isActive: boolean = false) => {
        const headers: any = { 'Content-Type': 'application/json' };
        if (apiToken) headers['Authorization'] = `Bearer ${apiToken}`;
        const res = await fetch(`${uiBaseUrl}/themes/${themeId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ design, name, is_active: isActive })
        });
        return await res.json();
    };

    const activateThemeAPI = async (themeId: string) => {
        const headers: any = { 'Content-Type': 'application/json' };
        if (apiToken) headers['Authorization'] = `Bearer ${apiToken}`;
        const res = await fetch(`${uiBaseUrl}/themes/${themeId}/activate`, {
            method: 'PUT',
            headers
        });
        return await res.json();
    };

    // Busca o tema ativo na API real ao montar, para não perder o estado após reload (F5)
    useEffect(() => {
        const loadActive = async () => {
            const active = await fetchActiveTheme();
            if (active) {
                setCurrentThemeId(active.id);
                setCurrentThemeOrigin('database');
                setCurrentThemeName(active.name);
            }
        };
        loadActive();
    }, [fetchActiveTheme]);

    // handleInspectComponent moved below groupedStructure

    const handleSaveTheme = async (action: SaveThemeAction) => {
        if (action.type === 'CANCEL') {
            setIsSaveModalOpen(false);
            setPendingApply(false);
            return;
        }

        setIsSaving(true);
        try {
            if (action.type === 'CREATE_NEW') {
                const newTheme = await saveNewThemeAPI(draft, action.name, pendingApply); // Ativa junto se for pendingApply
                setCurrentThemeId(newTheme.id);
                setCurrentThemeOrigin('database');
                setCurrentThemeName(newTheme.name);
                showToast('success', `Tema "${newTheme.name}" salvo no banco com sucesso!`);
            } else if (action.type === 'OVERWRITE_EXISTING') {
                if (currentThemeId) {
                    await updateThemeAPI(currentThemeId, draft, currentThemeName, pendingApply);
                    showToast('success', `Tema atualizado no banco com sucesso!`);
                }
            }

            if (pendingApply) {
                handleApplyToSystem();
            }

            setIsSaveModalOpen(false);
        } catch (error) {
            console.error(error);
            showToast('warning', 'Erro ao salvar o tema.');
        } finally {
            setIsSaving(false);
            setPendingApply(false);
        }
    };

    const handleApplyGlobalChanges = async () => {
        if (!currentThemeId || currentThemeOrigin === 'script') {
            // Se for script (novo tema), perguntar o nome antes de salvar e aplicar
            setPendingApply(true);
            setIsSaveModalOpen(true);
            return;
        }

        if (isDirty) {
            // Se foi modificado, perguntar se atualiza ou salva novo
            setPendingApply(true);
            setIsSaveModalOpen(true);
            return;
        }

        // Se já tá no DB e não tá dirty, só ativa e aplica
        setIsSaving(true);
        try {
            await activateThemeAPI(currentThemeId);
            handleApplyToSystem();
            showToast('success', `Tema ativado com sucesso!`);
        } catch (e) {
            console.error(e);
            showToast('warning', 'Erro ao ativar tema.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleApplyFullTheme = useCallback((design: any) => {
        // Quando um tema global é escolhido, rastreamos sua origem
        setCurrentThemeOrigin('script');
        setCurrentThemeId(null);
        setCurrentThemeName(design.systemName || 'Novo Tema');

        // Joga o design inteiro pro draft (Sandbox) para refletir no Preview
        if (handleThemePreview) {
            handleThemePreview(design);
        }
    }, [handleThemePreview]);

    // 0. Redimensionamento da Barra Design Engine
    const { size: engineSidebarWidth, startResizing: startResizingEngine, isResizing: isResizingEngine } = useResizable({
        initialSize: 320,
        minSize: 280,
        maxSize: 600,
        direction: 'horizontal'
    });

    // 1. Definição dos Pilares dinamicamente via JSON
    const pillars = useMemo(() => {
        // Mapeamento dinâmico de strings para ícones do Lucide
        const IconMap: Record<string, any> = {
            Shield, Type, Layout, MousePointer2, Activity, Cpu, Sparkles
        };

        return DesignPillars.map(p => ({
            ...p,
            icon: IconMap[p.icon] || Layout // Fallback icon
        }));
    }, []);

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

    // 4. Mapa Rápido do Catálogo para injetar Nome e Descrição
    const catalogMap = useMemo(() => {
        const map = new Map();
        if (TokenCatalog) {
            TokenCatalog.forEach((t: any) => map.set(t.tokenId, t));
        }
        return map;
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
                className={`flex flex-col h-full max-h-full border-r border-[var(--theme-border)] bg-[var(--theme-card)] relative z-10 overflow-hidden shrink-0 w-[var(--engine-sidebar-width)] min-w-[280px] max-w-[600px] ${isResizingEngine ? 'transition-none' : 'transition-all duration-300'}`}
                style={{ '--engine-sidebar-width': `${engineSidebarWidth}px` } as React.CSSProperties}
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
                        <div className="flex items-center gap-2">
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

                            {/* Botão de Salvar Dinâmico */}
                            <button
                                onClick={() => setIsSaveModalOpen(true)}
                                disabled={!isDirty}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${isDirty
                                        ? 'bg-[var(--theme-primary)]/20 border-[var(--theme-primary)]/50 text-[var(--theme-primary)] hover:bg-[var(--theme-primary)] hover:text-white shadow-[0_0_15px_rgba(var(--theme-primary-rgb),0.2)]'
                                        : 'bg-black/10 border-[var(--theme-border)] text-[var(--theme-muted)] cursor-not-allowed'
                                    }`}
                                title={isDirty ? "Você possui alterações não salvas" : "Nenhuma alteração"}
                            >
                                <span className="text-[10px] font-black uppercase tracking-widest">{isDirty ? 'Salvar' : 'Salvo'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Device Switcher (Responsive Engine) */}
                    <div className="flex bg-[var(--theme-layer)] rounded-xl border border-[var(--theme-border)] p-1 mb-4">
                        {[
                            { id: 'desktop', icon: Monitor, label: 'Desktop' },
                            { id: 'tablet', icon: Tablet, label: 'Tablet' },
                            { id: 'smartphone', icon: Smartphone, label: 'Mobile' }
                        ].map((device) => (
                            <button
                                key={device.id}
                                onClick={() => setPreviewDevice(device.id as any)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${previewDevice === device.id
                                        ? 'bg-[var(--theme-primary)] text-white shadow-[0_0_10px_rgba(var(--theme-primary-rgb),0.3)]'
                                        : 'text-[var(--theme-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface)]'
                                    }`}
                            >
                                <device.icon size={12} />
                                {device.label}
                            </button>
                        ))}
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

                            <label
                                className="flex items-center gap-2 cursor-pointer group"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsPreviewStacked(!isPreviewStacked);
                                }}
                            >
                                <div className={`w-6 h-3 rounded-full relative transition-all ${isPreviewStacked ? 'bg-[var(--theme-primary)]' : 'bg-[var(--theme-border)]'}`}>
                                    <div className={`absolute top-0.5 w-2 h-2 rounded-full bg-[var(--theme-text)] transition-all ${isPreviewStacked ? 'left-3.5' : 'left-0.5'}`} />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--theme-muted)] group-hover:text-[var(--theme-text)]">Empilhar Previews</span>
                            </label>
                        </div>
                    </div>

                    <button onClick={handleApplyGlobalChanges} className="w-full group relative overflow-hidden bg-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/90 text-white py-2.5 rounded-lg font-black text-[9px] uppercase tracking-[0.1em] transition-all active:scale-[0.98] shadow-[0_10px_20px_-5px_rgba(var(--theme-primary-rgb),0.3)]">
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
                                {filteredResults?.map(token => {
                                    const meta = catalogMap.get(token.id);
                                    const enhancedToken = { ...token, label: meta?.name || token.label, description: meta?.description || token.description };
                                    return (
                                        <TokenControl key={enhancedToken.id} token={enhancedToken} value={draft[enhancedToken.id]} onChange={(val) => updateDraft(enhancedToken.id, val)} previewDevice={previewDevice} />
                                    );
                                })}
                            </motion.div>
                        ) : viewMode === 'preview' ? (
                            <motion.div key="pillars" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="pt-2 pb-20">

                                {/* PILAR 0: CONFIGURAÇÕES GLOBAIS */}
                                <div key="global-pillar" className="border-b border-[var(--theme-border)] last:border-0">
                                    <CategoryLabel
                                        icon={Globe}
                                        title="0. Configurações Globais (2)"
                                        index={0}
                                        isOpen={activePillarId === 'global'}
                                        onToggle={() => setActivePillarId(activePillarId === 'global' ? null : 'global')}
                                        isDirty={isComponentDirty('global')}
                                        onReset={() => resetComponent('global')}
                                        onApply={() => handleApplyComponent('global')}
                                    />
                                    <AnimatePresence>
                                        {activePillarId === 'global' && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                className="overflow-hidden bg-[var(--theme-surface)]"
                                            >
                                                <div className="px-2 py-2 flex flex-col gap-1">
                                                    {/* Preferências Globais */}
                                                    {globalComponent && (
                                                        <Section
                                                            id="global-preferences"
                                                            icon={Globe}
                                                            title={`Preferências Globais (${globalComponent.tokens.length})`}
                                                            activeSection={activeSectionId}
                                                            onToggle={setActiveSectionId}
                                                        >
                                                            <div className="flex flex-col gap-4">
                                                                {globalComponent.tokens.map((token: any) => {
                                                                    const meta = catalogMap.get(token.id);
                                                                    const enhancedToken = { ...token, label: meta?.name || token.label, description: meta?.description || token.description };
                                                                    return (
                                                                        <TokenControl key={enhancedToken.id} token={enhancedToken} value={draft[enhancedToken.id]} onChange={(val) => updateDraft(enhancedToken.id, val)} previewDevice={previewDevice} />
                                                                    );
                                                                })}
                                                            </div>
                                                        </Section>
                                                    )}

                                                    {/* Identidade da Empresa */}
                                                    {sarak.branding && sarak.updateBranding && (
                                                        <Section
                                                            id="global-branding"
                                                            icon={Shield}
                                                            title="Identidade da Empresa (4)"
                                                            activeSection={activeSectionId}
                                                            onToggle={setActiveSectionId}
                                                        >
                                                            <div className="flex flex-col gap-4">
                                                                <InputControl
                                                                    label="Nome da Empresa (Topo/Sidebar)"
                                                                    type="text"
                                                                    value={sarak.branding.companyName || ''}
                                                                    onChange={(val: string) => sarak.updateBranding!({ companyName: val })}
                                                                />
                                                                <InputControl
                                                                    label="Nome no Login"
                                                                    type="text"
                                                                    value={sarak.branding.loginName || ''}
                                                                    onChange={(val: string) => sarak.updateBranding!({ loginName: val })}
                                                                />
                                                                <InputControl
                                                                    label="Aba do Navegador"
                                                                    value={sarak.branding.tabName || ''}
                                                                    onChange={(val: string) => sarak.updateBranding!({ tabName: val })}
                                                                />
                                                                <MediaUploaderControl
                                                                    label="Logotipo (Mídia Híbrida)"
                                                                    value={sarak.branding.logoBase64 || null}
                                                                    onChange={(val: string | null) => sarak.updateBranding!({ logoBase64: val })}
                                                                />
                                                            </div>
                                                        </Section>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

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
                                                                            {visibleTokens.map((token: any) => {
                                                                                const meta = catalogMap.get(token.id);
                                                                                const enhancedToken = {
                                                                                    ...token,
                                                                                    label: meta?.name || token.label,
                                                                                    description: meta?.description || token.description
                                                                                };
                                                                                return (
                                                                                    <TokenControl key={enhancedToken.id} token={enhancedToken} value={draft[enhancedToken.id]} onChange={(val) => updateDraft(enhancedToken.id, val)} previewDevice={previewDevice} />
                                                                                );
                                                                            })}
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
                    isPreviewStacked={isPreviewStacked}
                    customThemes={[]}
                    onInspectComponent={handleInspectComponent}
                    onApplyFullTheme={handleApplyFullTheme}
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

            <SaveThemeModal
                isOpen={isSaveModalOpen}
                origin={currentThemeOrigin}
                themeName={currentThemeName}
                onClose={() => setIsSaveModalOpen(false)}
                onAction={handleSaveTheme}
                isSaving={isSaving}
            />

        </div>
    );
};

export default ThemeCustomizationTab;
