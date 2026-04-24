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
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <SelectControl label="Subtítulos" options={['Inter', 'Poppins', 'Outfit', 'Syne']} value={draft.subtitleFont} onChange={(v: any) => updateDraft('subtitleFont', v)} isFont />
                    <SelectControl label="Abas & UI" options={['Inter', 'Outfit', 'Roboto Mono']} value={draft.tabFont} onChange={(v: any) => updateDraft('tabFont', v)} isFont />
                </div>
            </Section>

            <Section id="font-refinement" icon={Type} title="Refinamento Técnico" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="flex flex-col gap-2 mb-4">
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Tamanho Global (Escala)</span>
                    <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
                        {['pp', 'p', 'm', 'g', 'gg'].map(s => (
                            <button key={s} onClick={() => updateDraft('fontScale', s)} className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${draft.fontScale === s ? 'bg-[var(--theme-primary)] text-white' : 'text-white/20 hover:text-white/40'}`}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <SelectControl label="Peso Título" options={[{id: '400', label: 'Regular'}, {id: '600', label: 'Semi-Bold'}, {id: '700', label: 'Bold'}, {id: '900', label: 'Black'}]} value={draft.headingWeight} onChange={(v: any) => updateDraft('headingWeight', v)} />
                    <SliderControl label="Espaçamento (Letters)" value={draft.headingLetterSpacing || 'normal'} min={-0.05} max={0.25} step={0.05} onChange={(v: any) => updateDraft('headingLetterSpacing', v)} />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                    <SliderControl label="Densidade de Escala" value={draft.scaleRatio || 1.0} min={0.8} max={1.5} step={0.05} onChange={(v: any) => updateDraft('scaleRatio', v)} />
                    <div className="flex flex-col gap-1">
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Números Tabulares</span>
                        <button 
                            onClick={() => updateDraft('useTabularNums', !draft.useTabularNums)}
                            className={`py-2 px-3 rounded-lg text-[9px] font-black uppercase transition-all border ${draft.useTabularNums ? 'bg-[var(--theme-primary)] border-transparent text-white' : 'bg-white/5 border-white/10 text-white/40'}`}
                        >
                            {draft.useTabularNums ? 'Ativado' : 'Desativado'}
                        </button>
                    </div>
                </div>
            </Section>
        </>
    );
};
