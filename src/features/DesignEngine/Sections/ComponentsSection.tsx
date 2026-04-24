import React from 'react';
import { Box, MousePointer2, Type } from 'lucide-react';
import { Section, SelectControl, SliderControl } from '../components/DesignControls';

interface ComponentsSectionProps {
    draft: any;
    updateDraft: (key: string, value: any) => void;
    activeSection: string | null;
    setActiveSection: (id: string | null) => void;
}

export const ComponentsSection: React.FC<ComponentsSectionProps> = ({ draft, updateDraft, activeSection, setActiveSection }) => {
    return (
        <>
            <Section id="button-styles" icon={MousePointer2} title="Botões & Interação" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="flex flex-col gap-4">
                    <button onClick={() => updateDraft('isGeometricCut', !draft.isGeometricCut)} className={`w-full py-4 rounded-xl text-2xs font-black uppercase transition-all flex items-center justify-center gap-3 ${draft.isGeometricCut ? 'bg-[var(--theme-primary)] text-white shadow-[0_0_20px_rgba(var(--theme-primary-rgb),0.4)]' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>
                        <Box size={14} /> Geometric Cut (Corte Angular)
                    </button>
                    <div className="grid grid-cols-2 gap-4">
                        <SelectControl label="Estilo de Hover" options={['Glow', 'Lift', 'Scale', 'None']} value={draft.buttonHoverEffect || 'Glow'} onChange={(v: any) => updateDraft('buttonHoverEffect', v)} />
                        <SliderControl label="Espaçamento Abas" value={draft.tabGap || 12} min={0} max={32} onChange={(v: any) => updateDraft('tabGap', v)} suffix="px" />
                    </div>
                </div>
            </Section>

            <Section id="form-elements" icon={Type} title="Inputs & Pesquisa" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SelectControl label="Estilo do Campo" options={[{id: 'minimal', label: 'Minimalista'}, {id: 'filled', label: 'Preenchido'}, {id: 'glass', label: 'Vidro'}]} value={draft.inputStyle || 'minimal'} onChange={(v: any) => updateDraft('inputStyle', v)} />
                    <SelectControl label="Barra de Busca" options={[{id: 'classic', label: 'Clássica'}, {id: 'floating', label: 'Flutuante'}, {id: 'hidden', label: 'Oculta'}]} value={draft.searchStyle || 'classic'} onChange={(v: any) => updateDraft('searchStyle', v)} />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <SliderControl label="Espessura Ícone" value={draft.iconStrokeWidth || 2} min={1} max={3} step={0.5} onChange={(v: any) => updateDraft('iconStrokeWidth', v)} suffix="px" />
                    <SelectControl label="ID Estado Vazio" options={[{id: 'standard', label: 'Padrão'}, {id: 'industrial', label: 'Industrial'}, {id: 'ghost', label: 'Fantasma'}]} value={draft.emptyStateId || 'standard'} onChange={(v: any) => updateDraft('emptyStateId', v)} />
                </div>
            </Section>
        </>
    );
};

