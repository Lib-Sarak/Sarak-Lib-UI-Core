import React from 'react';
import { Type, Maximize, Layout as LayoutIcon, Box } from 'lucide-react';
import { Section, SelectControl, SliderControl } from '../components/DesignControls';

interface StructureSectionProps {
    draft: any;
    updateDraft: (key: string, value: any) => void;
    activeSection: string | null;
    setActiveSection: (id: string | null) => void;
}

export const StructureSection: React.FC<StructureSectionProps> = ({ draft, updateDraft, activeSection, setActiveSection }) => {
    return (
        <>
            <Section id="typography" icon={Type} title="Tipografia" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SelectControl label="Título (Heading)" options={['Inter', 'Poppins', 'Outfit', 'Montserrat', 'Roboto Mono', 'Syne']} value={draft.headingFont} onChange={(v: any) => updateDraft('headingFont', v)} isFont />
                    <SelectControl label="Corpo (Body)" options={['Inter', 'Poppins', 'Roboto', 'Outfit']} value={draft.bodyFont} onChange={(v: any) => updateDraft('bodyFont', v)} isFont />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <SelectControl label="Peso Título" options={[{id: '400', label: 'Regular'}, {id: '600', label: 'Semi-Bold'}, {id: '700', label: 'Bold'}, {id: '900', label: 'Black'}]} value={draft.headingWeight} onChange={(v: any) => updateDraft('headingWeight', v)} />
                    <SelectControl label="Escala Fonte" options={[{id: 'pp', label: 'PP (Mini)'}, {id: 'p', label: 'P (Pequena)'}, {id: 'm', label: 'M (Padrão)'}, {id: 'g', label: 'G (Grande)'}, {id: 'gg', label: 'GG (Gigante)'}]} value={draft.fontScale} onChange={(v: any) => updateDraft('fontScale', v)} />
                </div>
            </Section>

            <Section id="geometry" icon={Maximize} title="Geometria" activeSection={activeSection} onToggle={setActiveSection}>
                <SliderControl label="Raio da Borda" value={draft.borderRadius} min={0} max={32} onChange={(v: any) => updateDraft('borderRadius', v)} suffix="px" />
                <div className="grid grid-cols-2 gap-4">
                    <SliderControl label="Espessura Borda" value={draft.borderWidth} min={0} max={4} step={1} onChange={(v: any) => updateDraft('borderWidth', v)} suffix="px" />
                    <SelectControl label="Estilo Borda" options={['solid', 'dashed', 'dotted']} value={draft.borderStyle} onChange={(v: any) => updateDraft('borderStyle', v)} />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <SelectControl label="Tipo Borda" options={[{id: 'default', label: 'Padrão'}, {id: 'neon', label: 'Neon Glow'}, {id: 'beveled', label: 'Chanfrado'}, {id: 'inlet', label: 'Interna'}]} value={draft.borderType} onChange={(v: any) => updateDraft('borderType', v)} />
                    <div className="flex flex-col justify-end pb-4">
                        <button onClick={() => updateDraft('isGeometricCut', !draft.isGeometricCut)} className={`w-full py-2.5 rounded-lg text-[9px] font-black uppercase transition-all flex items-center justify-center gap-2 ${draft.isGeometricCut ? 'bg-[var(--theme-primary)] text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>
                            <Box size={10} /> Geometric Cut
                        </button>
                    </div>
                </div>
            </Section>

            <Section id="layout-dna" icon={LayoutIcon} title="DNA do Layout" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SelectControl label="Estilo de Navegação" options={[{id: 'sidebar', label: 'Lateral (Sidebar)'}, {id: 'topbar', label: 'Superior (Topbar)'}]} value={draft.navigationStyle} onChange={(v: any) => updateDraft('navigationStyle', v)} />
                    <SelectControl label="Densidade" options={[{id: 'compact', label: 'Compacto'}, {id: 'standard', label: 'Padrão'}, {id: 'comfortable', label: 'Confortável'}]} value={draft.layoutDensity} onChange={(v: any) => updateDraft('layoutDensity', v)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <SliderControl label="Gap do Layout" value={draft.layoutGap} min={0} max={48} onChange={(v: any) => updateDraft('layoutGap', v)} suffix="px" />
                    <SliderControl label="Padding Cards" value={draft.cardPadding} min={8} max={64} onChange={(v: any) => updateDraft('cardPadding', v)} suffix="px" />
                </div>
                {draft.navigationStyle === 'sidebar' && (
                    <div className="grid grid-cols-1 gap-4">
                        <SliderControl label="Largura Sidebar" value={draft.sidebarWidth} min={60} max={320} step={10} onChange={(v: any) => updateDraft('sidebarWidth', v)} suffix="px" />
                    </div>
                )}
                <div className="grid grid-cols-1 gap-4">
                    <SliderControl label="Scale Ratio (Global)" value={draft.scaleRatio || 1.0} min={0.5} max={1.5} step={0.05} onChange={(v: any) => updateDraft('scaleRatio', v)} />
                </div>
            </Section>
        </>
    );
};
