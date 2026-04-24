import React from 'react';
import { Box, MousePointer2, Type } from 'lucide-react';
import { Section, SelectControl } from '../components/DesignControls';

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
                    <button onClick={() => updateDraft('isGeometricCut', !draft.isGeometricCut)} className={`w-full py-4 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-3 ${draft.isGeometricCut ? 'bg-[var(--theme-primary)] text-white shadow-[0_0_20px_rgba(var(--theme-primary-rgb),0.4)]' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>
                        <Box size={14} /> Geometric Cut (Corte Angular)
                    </button>
                    <SelectControl label="Estilo de Hover" options={['Glow', 'Lift', 'Scale', 'None']} value={draft.buttonHoverEffect || 'Glow'} onChange={(v: any) => updateDraft('buttonHoverEffect', v)} />
                </div>
            </Section>

            <Section id="form-elements" icon={Type} title="Inputs & Formulários" activeSection={activeSection} onToggle={setActiveSection}>
                <SelectControl label="Estilo do Campo" options={[{id: 'minimal', label: 'Minimalista'}, {id: 'filled', label: 'Preenchido'}, {id: 'glass', label: 'Vidro'}]} value={draft.inputStyle || 'minimal'} onChange={(v: any) => updateDraft('inputStyle', v)} />
            </Section>
        </>
    );
};
