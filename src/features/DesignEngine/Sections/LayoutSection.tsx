import React from 'react';
import { Layout as LayoutIcon, Maximize, Grid } from 'lucide-react';
import { Section, SelectControl, SliderControl } from '../components/DesignControls';

interface LayoutSectionProps {
    draft: any;
    updateDraft: (key: string, value: any) => void;
    activeSection: string | null;
    setActiveSection: (id: string | null) => void;
}

export const LayoutSection: React.FC<LayoutSectionProps> = ({ draft, updateDraft, activeSection, setActiveSection }) => {
    return (
        <>
            <Section id="nav-strategy" icon={LayoutIcon} title="Arquitetura de Navegação" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SelectControl 
                        label="Estilo Principal" 
                        options={[
                            { id: 'sidebar', label: 'Sidebar (Lateral)' },
                            { id: 'topbar', label: 'Topbar (Superior)' },
                            { id: 'floating', label: 'Floating (Flutuante)' },
                            { id: 'minimal', label: 'Minimal (Oculto)' }
                        ]} 
                        value={draft.navigationStyle || 'sidebar'} 
                        onChange={(v: any) => updateDraft('navigationStyle', v)} 
                    />
                    <SelectControl 
                        label="Densidade de Layout" 
                        options={[
                            { id: 'compact', label: 'Compacta' },
                            { id: 'standard', label: 'Padrão' },
                            { id: 'comfortable', label: 'Confortável' }
                        ]} 
                        value={draft.layoutDensity || 'standard'} 
                        onChange={(v: any) => updateDraft('layoutDensity', v)} 
                    />
                </div>
                <div className="mt-4 flex gap-4">
                    <button 
                        onClick={() => updateDraft('isAutoHideEnabled', !draft.isAutoHideEnabled)}
                        className={`flex-1 py-2 rounded-lg text-3xs font-black uppercase transition-all border ${draft.isAutoHideEnabled ? 'bg-[var(--theme-primary)] border-transparent text-white' : 'bg-white/5 border-white/10 text-white/40'}`}
                    >
                        Auto-Hide Menu
                    </button>
                    <button 
                        onClick={() => updateDraft('isNavHidden', !draft.isNavHidden)}
                        className={`flex-1 py-2 rounded-lg text-3xs font-black uppercase transition-all border ${draft.isNavHidden ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-white/5 border-white/10 text-white/40'}`}
                    >
                        Esconder Nav
                    </button>
                </div>
            </Section>

            <Section id="sidebar-core" icon={LayoutIcon} title="Menu Lateral (Sidebar)" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SliderControl 
                        label="Largura Padrão" 
                        value={draft.sidebarWidth || 280} 
                        min={200} 
                        max={350} 
                        step={10} 
                        onChange={(v: any) => updateDraft('sidebarWidth', v)} 
                        suffix="px" 
                    />
                    <SliderControl 
                        label="Largura Recolhida" 
                        value={draft.sidebarCollapsedWidth || 80} 
                        min={60} 
                        max={100} 
                        onChange={(v: any) => updateDraft('sidebarCollapsedWidth', v)} 
                        suffix="px" 
                    />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-white/40 uppercase">Cor Fundo</span>
                        <input type="color" value={draft.sidebarColor || '#0c0c0d'} onChange={(e) => updateDraft('sidebarColor', e.target.value)} className="w-full h-8 rounded-lg bg-black/40 border border-white/5 cursor-pointer p-1" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-white/40 uppercase">Cor Item Ativo</span>
                        <input type="color" value={draft.sidebarActiveColor || draft.primaryColor} onChange={(e) => updateDraft('sidebarActiveColor', e.target.value)} className="w-full h-8 rounded-lg bg-black/40 border border-white/5 cursor-pointer p-1" />
                    </div>
                </div>
                <div className="mt-4">
                    <SliderControl 
                        label="Ruído Sidebar" 
                        value={draft.sidebarNoiseOpacity || 0.03} 
                        min={0} 
                        max={0.1} 
                        step={0.005} 
                        onChange={(v: any) => updateDraft('sidebarNoiseOpacity', v)} 
                    />
                </div>
            </Section>

            <Section id="topbar-core" icon={Grid} title="Barra Superior (Topbar)" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SliderControl 
                        label="Altura Topbar" 
                        value={draft.topbarHeight || 64} 
                        min={48} 
                        max={100} 
                        onChange={(v: any) => updateDraft('topbarHeight', v)} 
                        suffix="px" 
                    />
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-white/40 uppercase">Cor Fundo</span>
                        <input type="color" value={draft.topbarColor || '#0c0c0d'} onChange={(e) => updateDraft('topbarColor', e.target.value)} className="w-full h-8 rounded-lg bg-black/40 border border-white/5 cursor-pointer p-1" />
                    </div>
                </div>
            </Section>

            <Section id="global-metrics" icon={Maximize} title="Métricas & Contenção" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SelectControl 
                        label="Largura Máxima" 
                        options={[
                            {id: 'none', label: 'Full Width'}, 
                            {id: '1200px', label: 'Compact (1200px)'}, 
                            {id: '1440px', label: 'Standard (1440px)'}, 
                            {id: '1600px', label: 'Wide (1600px)'},
                            {id: '1920px', label: 'Ultra (1920px)'}
                        ]} 
                        value={draft.maxContentWidth || 'none'} 
                        onChange={(v: any) => updateDraft('maxContentWidth', v)} 
                    />
                    <SliderControl 
                        label="Gap do Layout" 
                        value={draft.layoutGap || 16} 
                        min={0} 
                        max={48} 
                        onChange={(v: any) => updateDraft('layoutGap', v)} 
                        suffix="px" 
                    />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                    <SliderControl 
                        label="Espaço entre Abas" 
                        value={draft.tabGap || 8} 
                        min={0} 
                        max={24} 
                        onChange={(v: any) => updateDraft('tabGap', v)} 
                        suffix="px" 
                    />
                    <SliderControl 
                        label="Largura Scroll" 
                        value={draft.scrollbarWidth || 6} 
                        min={0} 
                        max={12} 
                        step={2} 
                        onChange={(v: any) => updateDraft('scrollbarWidth', v)} 
                        suffix="px" 
                    />
                </div>
            </Section>
        </>
    );
};

