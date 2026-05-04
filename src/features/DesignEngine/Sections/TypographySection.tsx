import React from 'react';
import { Type, AlignLeft, Bold, MoveHorizontal } from 'lucide-react';
import { Section, SelectControl, SliderControl } from '../components/DesignControls';

interface TypographySectionProps {
    draft: any;
    updateDraft: (key: string, value: any) => void;
    activeSection: string | null;
    setActiveSection: (id: string | null) => void;
}

export const TypographySection: React.FC<TypographySectionProps> = ({ draft, updateDraft, activeSection, setActiveSection }) => {
    return (
        <>
            <Section id="font-families" icon={Type} title="Famílias Tipográficas" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SelectControl 
                        label="Título (Heading)" 
                        options={['Inter', 'Poppins', 'Outfit', 'Montserrat', 'Roboto Mono', 'Syne']} 
                        value={draft.headingFont || 'Outfit'} 
                        onChange={(v: any) => updateDraft('headingFont', v)} 
                        isFont 
                    />
                    <SelectControl 
                        label="Corpo (Body)" 
                        options={['Inter', 'Poppins', 'Roboto', 'Outfit']} 
                        value={draft.bodyFont || 'Inter'} 
                        onChange={(v: any) => updateDraft('bodyFont', v)} 
                        isFont 
                    />
                </div>
            </Section>

            <Section id="font-refinement" icon={Type} title="Refinamento Técnico" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SliderControl 
                        label="Tamanho Base" 
                        value={draft.fontBaseSize || 16} 
                        min={12} 
                        max={20} 
                        onChange={(v: any) => updateDraft('fontBaseSize', v)} 
                        suffix="px" 
                    />
                    <SliderControl 
                        label="Altura da Linha" 
                        value={draft.fontLineHeight || 1.5} 
                        min={1} 
                        max={2} 
                        step={0.1} 
                        onChange={(v: any) => updateDraft('fontLineHeight', v)} 
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                    <SelectControl 
                        label="Peso Título" 
                        options={[
                            {id: '400', label: 'Regular'}, 
                            {id: '600', label: 'Semi-Bold'}, 
                            {id: '700', label: 'Bold'}, 
                            {id: '900', label: 'Black'}
                        ]} 
                        value={draft.headingWeight || '700'} 
                        onChange={(v: any) => updateDraft('headingWeight', v)} 
                    />
                    <SliderControl 
                        label="Espaçamento (Letters)" 
                        value={draft.headingLetterSpacing || 0} 
                        min={-0.05} 
                        max={0.25} 
                        step={0.01} 
                        onChange={(v: any) => updateDraft('headingLetterSpacing', v)} 
                    />
                </div>
            </Section>
        </>
    );
};

