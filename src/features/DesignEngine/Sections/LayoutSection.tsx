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
            <Section id="navigation-core" icon={LayoutIcon} title="Navegação & Menu" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SelectControl label="Estilo de Navegação" options={[{id: 'sidebar', label: 'Lateral (Sidebar)'}, {id: 'topbar', label: 'Superior (Topbar)'}]} value={draft.navigationStyle} onChange={(v: any) => updateDraft('navigationStyle', v)} />
                    <SelectControl label="Densidade" options={[{id: 'compact', label: 'Compacto'}, {id: 'standard', label: 'Padrão'}, {id: 'comfortable', label: 'Confortável'}]} value={draft.layoutDensity} onChange={(v: any) => updateDraft('layoutDensity', v)} />
                </div>
                {draft.navigationStyle === 'sidebar' && (
                    <SliderControl label="Largura Sidebar" value={draft.sidebarWidth} min={60} max={320} step={10} onChange={(v: any) => updateDraft('sidebarWidth', v)} suffix="px" />
                )}
            </Section>

            <Section id="layout-geometry" icon={Maximize} title="Espaçamento & Grid" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SliderControl label="Gap Global" value={draft.layoutGap} min={0} max={48} onChange={(v: any) => updateDraft('layoutGap', v)} suffix="px" />
                    <SliderControl label="Scale Ratio" value={draft.scaleRatio || 1.0} min={0.5} max={1.5} step={0.05} onChange={(v: any) => updateDraft('scaleRatio', v)} />
                </div>
            </Section>
        </>
    );
};
