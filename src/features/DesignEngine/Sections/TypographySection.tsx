import React from 'react';
import { Type, AlignLeft, Bold, MoveHorizontal } from 'lucide-react';
import { Section, SelectControl } from '../components/DesignControls';

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
                    <SelectControl label="Título (Heading)" options={['Inter', 'Poppins', 'Outfit', 'Montserrat', 'Roboto Mono', 'Syne']} value={draft.headingFont} onChange={(v: any) => updateDraft('headingFont', v)} isFont />
                    <SelectControl label="Corpo (Body)" options={['Inter', 'Poppins', 'Roboto', 'Outfit']} value={draft.bodyFont} onChange={(v: any) => updateDraft('bodyFont', v)} isFont />
                </div>
            </Section>

            <Section id="font-refinement" icon={Bold} title="Refinamento" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SelectControl label="Peso Título" options={[{id: '400', label: 'Regular'}, {id: '600', label: 'Semi-Bold'}, {id: '700', label: 'Bold'}, {id: '900', label: 'Black'}]} value={draft.headingWeight} onChange={(v: any) => updateDraft('headingWeight', v)} />
                    <SelectControl label="Letter Spacing" options={[{id: 'tight', label: 'Apertado'}, {id: 'normal', label: 'Padrão'}, {id: 'wide', label: 'Largo'}, {id: 'widest', label: 'Extra Largo'}]} value={draft.headingLetterSpacing} onChange={(v: any) => updateDraft('headingLetterSpacing', v)} />
                </div>
            </Section>
        </>
    );
};
