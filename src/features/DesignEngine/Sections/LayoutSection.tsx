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
            <Section id="navigation-core" icon={LayoutIcon} title="Arquitetura Global" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SelectControl label="Estilo de Navegação" options={[{id: 'sidebar', label: 'Lateral (Sidebar)'}, {id: 'topbar', label: 'Superior (Topbar)'}]} value={draft.navigationStyle} onChange={(v: any) => updateDraft('navigationStyle', v)} />
                    <SelectControl label="Densidade UI" options={[{id: 'compact', label: 'Compacto'}, {id: 'standard', label: 'Padrão'}, {id: 'comfortable', label: 'Confortável'}]} value={draft.layoutDensity} onChange={(v: any) => updateDraft('layoutDensity', v)} />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <button 
                        onClick={() => updateDraft('isNavHidden', !draft.isNavHidden)}
                        className={`py-2 rounded-lg text-3xs font-black uppercase transition-all ${draft.isNavHidden ? 'bg-amber-500 text-white' : 'bg-white/5 text-white/20'}`}
                    >
                        {draft.isNavHidden ? 'Nav: Recolhida' : 'Nav: Expandida'}
                    </button>
                    <button 
                        onClick={() => updateDraft('isAutoHideEnabled', !draft.isAutoHideEnabled)}
                        className={`py-2 rounded-lg text-3xs font-black uppercase transition-all ${draft.isAutoHideEnabled ? 'bg-[var(--theme-primary)] text-white' : 'bg-white/5 text-white/20'}`}
                    >
                        {draft.isAutoHideEnabled ? 'Auto-Hide On' : 'Auto-Hide Off'}
                    </button>
                </div>
                <div className="mt-4">
                    <SelectControl 
                        label="Módulo Secundário" 
                        options={[{id: 'none', label: 'Nenhum'}, {id: 'help', label: 'Ajuda'}, {id: 'notifs', label: 'Notificações'}]} 
                        value={draft.secondaryModuleId || 'none'} 
                        onChange={(v: any) => updateDraft('secondaryModuleId', v)} 
                    />
                </div>
            </Section>

            <Section id="layout-geometry" icon={Maximize} title="Layout & Estrutura" activeSection={activeSection} onToggle={setActiveSection}>
                {draft.navigationStyle === 'sidebar' && (
                    <div className="mb-4 p-4 bg-white/5 rounded-xl border border-white/5">
                        <SliderControl label="Largura Sidebar" value={draft.sidebarWidth} min={60} max={320} step={10} onChange={(v: any) => updateDraft('sidebarWidth', v)} suffix="px" />
                    </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                    <SliderControl label="Gap Global" value={draft.layoutGap} min={0} max={48} onChange={(v: any) => updateDraft('layoutGap', v)} suffix="px" />
                    <SliderControl label="Padding Interno" value={draft.cardPadding || 24} min={0} max={64} onChange={(v: any) => updateDraft('cardPadding', v)} suffix="px" />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <SliderControl label="Margem Topbar" value={draft.tabSectionMargin || 0} min={0} max={64} onChange={(v: any) => updateDraft('tabSectionMargin', v)} suffix="px" />
                    <SelectControl 
                        label="Safe Area" 
                        options={[
                            {id: 'none', label: 'Full Width'}, 
                            {id: '1200px', label: 'Desktop (1200px)'}, 
                            {id: '1440px', label: 'Wide (1440px)'}, 
                            {id: '1600px', label: 'Ultra (1600px)'}
                        ]} 
                        value={draft.maxContentWidth || 'none'} 
                        onChange={(v: any) => updateDraft('maxContentWidth', v)} 
                    />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <SliderControl label="Espessura Scroll" value={draft.scrollbarStyle || 6} min={0} max={12} step={2} onChange={(v: any) => updateDraft('scrollbarStyle', v)} suffix="px" />
                    <SliderControl label="Intensidade Háptica" value={draft.hapticIntensity || 0.02} min={0} max={0.1} step={0.01} onChange={(v: any) => updateDraft('hapticIntensity', v)} />
                </div>
            </Section>
        </>
    );
};

