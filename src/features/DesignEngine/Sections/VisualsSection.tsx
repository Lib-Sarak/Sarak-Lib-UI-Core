import React from 'react';
import { Palette, Box, Grid, AlertCircle, Check, Plus } from 'lucide-react';
import { Section, SelectControl, SliderControl } from '../components/DesignControls';
import { PRIMARY_COLORS, TEXTURE_LIBRARY } from '../../../constants/design-tokens';

interface VisualsSectionProps {
    draft: any;
    updateDraft: (key: string, value: any) => void;
    activeSection: string | null;
    setActiveSection: (id: string | null) => void;
}

export const VisualsSection: React.FC<VisualsSectionProps> = ({ draft, updateDraft, activeSection, setActiveSection }) => {
    return (
        <>
            <Section id="color-core" icon={Palette} title="Cores Mestras" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-7 gap-2 mb-6">
                    {PRIMARY_COLORS.map((color, i) => (
                        <button key={i} onClick={() => updateDraft('primaryColor', color.value)} className={`w-full aspect-square rounded-full transition-all hover:scale-125 relative ${draft.primaryColor === color.value ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0c0c0d] scale-110' : 'opacity-80'}`} style={{ backgroundColor: color.value }}>
                            {draft.primaryColor === color.value && <Check size={10} className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                        </button>
                    ))}
                    <div className="relative w-full aspect-square">
                        <input 
                            type="color" 
                            value={draft.primaryColor} 
                            onChange={(e) => updateDraft('primaryColor', e.target.value)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="absolute inset-0 rounded-full border border-white/20 flex items-center justify-center bg-white/5 hover:bg-white/10 transition-all">
                            <Plus size={10} className="text-white/40" />
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block mb-2">Tom de Voz (System Tone)</span>
                    <div className="grid grid-cols-3 gap-1 p-1 bg-black/20 rounded-xl border border-white/5">
                        {['formal', 'friendly', 'cyber'].map(tone => (
                            <button key={tone} onClick={() => updateDraft('systemTone', tone)} className={`py-2 rounded-lg text-[8px] font-black uppercase transition-all ${draft.systemTone === tone ? 'bg-[var(--theme-primary)] text-white shadow-lg' : 'text-white/20 hover:text-white/40'}`}>{tone}</button>
                        ))}
                    </div>
                </div>
            </Section>

            <Section id="textures-core" icon={Grid} title="Texturas & Superfícies" activeSection={activeSection} onToggle={setActiveSection}>
                <SelectControl label="Biblioteca de Texturas" options={TEXTURE_LIBRARY} value={draft.texture} onChange={(v: any) => updateDraft('texture', v)} />
                <SliderControl label="Opacidade da Textura" value={draft.textureOpacity} min={0} max={0.3} step={0.01} onChange={(v: any) => updateDraft('textureOpacity', v)} />
                <SelectControl label="Material de Superfície" options={[{id: 'glass', label: 'Glassmorphism'}, {id: 'solid', label: 'Sólido'}, {id: 'gradient', label: 'Gradiente Dinâmico'}]} value={draft.surfaceMaterial} onChange={(v: any) => updateDraft('surfaceMaterial', v)} />
            </Section>
        </>
    );
};
