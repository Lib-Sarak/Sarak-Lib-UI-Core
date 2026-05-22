import React from 'react';
import { Type, AlignLeft, Bold, MoveHorizontal } from 'lucide-react';
import { Section, SelectControl, SliderControl } from '../components/DesignControls';
const THEME_FONTS = [{ id: 'outfit', value: "'Outfit', sans-serif", name: 'Outfit', category: 'Sans-Serif' }, { id: 'inter', value: "'Inter', sans-serif", name: 'Inter', category: 'Sans-Serif' }];

interface TypographySectionProps {
    draft: any;
    updateDraft: (key: string, value: any) => void;
    activeSection: string | null;
    setActiveSection: (id: string | null) => void;
}

export const TypographySection: React.FC<TypographySectionProps> = ({ draft, updateDraft, activeSection, setActiveSection }) => {
    // Mapear catálogo completo para o formato do SelectControl
    const fontOptions = THEME_FONTS.map((f: any) => ({
        id: f.value,
        label: f.name
    }));

    return (
        <>
            <Section id="font-families" icon={Type} title="Famílias Tipográficas" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SelectControl 
                        label="Título (Heading)" 
                        options={fontOptions} 
                        value={draft.headingFont || "'Outfit', sans-serif"} 
                        onChange={(v: any) => updateDraft('headingFont', v)} 
                        isFont 
                    />
                    <SelectControl 
                        label="Corpo (Body)" 
                        options={fontOptions} 
                        value={draft.bodyFont || "'Inter', sans-serif"} 
                        onChange={(v: any) => updateDraft('bodyFont', v)} 
                        isFont 
                    />
                </div>
                
                <div className="mt-4">
                    <SelectControl 
                        label="Escala Global" 
                        options={[
                            { id: 's', label: 'Compacta (S)' },
                            { id: 'm', label: 'Padrão (M)' },
                            { id: 'l', label: 'Ampla (L)' },
                            { id: 'xl', label: 'Monumental (XL)' }
                        ]} 
                        value={draft.fontScale || 'm'} 
                        onChange={(v: any) => updateDraft('fontScale', v)} 
                    />
                </div>
            </Section>

            <Section id="font-refinement" icon={Type} title="Refinamento Técnico" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SliderControl 
                        label="Tamanho Base" 
                        value={draft.fontBaseSize || 16} 
                        min={12} 
                        max={24} 
                        onChange={(v: any) => updateDraft('fontBaseSize', v)} 
                        suffix="px" 
                    />
                    <SliderControl 
                        label="Altura da Linha" 
                        value={draft.fontLineHeight || 1.5} 
                        min={1} 
                        max={2.5} 
                        step={0.1} 
                        onChange={(v: any) => updateDraft('fontLineHeight', v)} 
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                    <SelectControl 
                        label="Peso Título" 
                        options={[
                            {id: '300', label: 'Light'},
                            {id: '400', label: 'Regular'}, 
                            {id: '500', label: 'Medium'},
                            {id: '600', label: 'Semi-Bold'}, 
                            {id: '700', label: 'Bold'}, 
                            {id: '800', label: 'Extra-Bold'},
                            {id: '900', label: 'Black'}
                        ]} 
                        value={draft.headingWeight || '700'} 
                        onChange={(v: any) => updateDraft('headingWeight', v)} 
                    />
                    <SliderControl 
                        label="Espaçamento (Letters)" 
                        value={draft.headingLetterSpacing || 0} 
                        min={-0.1} 
                        max={0.5} 
                        step={0.01} 
                        onChange={(v: any) => updateDraft('headingLetterSpacing', v)} 
                    />
                </div>
            </Section>
        </>
    );
};


