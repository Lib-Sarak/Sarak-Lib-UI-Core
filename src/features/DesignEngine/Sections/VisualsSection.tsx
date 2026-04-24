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
                    <span className="text-2xs font-black uppercase tracking-widest text-white/40 block mb-2">Tom de Voz (System Tone)</span>
                    <div className="grid grid-cols-3 gap-1 p-1 bg-black/20 rounded-xl border border-white/5">
                        {['formal', 'friendly', 'cyber'].map(tone => (
                            <button key={tone} onClick={() => updateDraft('systemTone', tone)} className={`py-2 rounded-lg text-3xs font-black uppercase transition-all ${draft.systemTone === tone ? 'bg-[var(--theme-primary)] text-white shadow-lg' : 'text-white/20 hover:text-white/40'}`}>{tone}</button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                    <span className="text-2xs font-black uppercase tracking-widest text-white/20 block">Cores Semânticas</span>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold text-white/40 uppercase">Sucesso</span>
                            <input type="color" value={draft.successColor || '#10b981'} onChange={(e) => updateDraft('successColor', e.target.value)} className="w-full h-8 rounded-lg bg-transparent cursor-pointer" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold text-white/40 uppercase">Aviso</span>
                            <input type="color" value={draft.warningColor || '#f59e0b'} onChange={(e) => updateDraft('warningColor', e.target.value)} className="w-full h-8 rounded-lg bg-transparent cursor-pointer" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold text-white/40 uppercase">Erro</span>
                            <input type="color" value={draft.errorColor || '#ef4444'} onChange={(e) => updateDraft('errorColor', e.target.value)} className="w-full h-8 rounded-lg bg-transparent cursor-pointer" />
                        </div>
                    </div>
                </div>
            </Section>

            <Section id="textures-core" icon={Grid} title="Texturas & Superfícies" activeSection={activeSection} onToggle={setActiveSection}>
                <SelectControl label="Biblioteca de Texturas" options={TEXTURE_LIBRARY} value={draft.texture} onChange={(v: any) => updateDraft('texture', v)} />
                
                {/* Visual Texture Preview */}
                <div className="mt-2 mb-4 h-16 rounded-xl border border-white/5 bg-black/40 relative overflow-hidden group">
                    <div className={`absolute inset-0 opacity-40 transition-all group-hover:scale-110 sarak-atmosphere-layer ${TEXTURE_LIBRARY.find(t => t.id === draft.texture)?.className || 'texture-none'}`} />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/20">Preview da Textura</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <SliderControl label="Opacidade Textura" value={draft.textureOpacity} min={0} max={0.3} step={0.01} onChange={(v: any) => updateDraft('textureOpacity', v)} />
                    <SliderControl label="Noise Overlay" value={draft.atmosphereNoiseOpacity} min={0} max={0.1} step={0.005} onChange={(v: any) => updateDraft('atmosphereNoiseOpacity', v)} />
                </div>
                <SelectControl label="Material de Superfície" options={[{id: 'glass', label: 'Glassmorphism'}, {id: 'solid', label: 'Sólido'}, {id: 'gradient', label: 'Gradiente Dinâmico'}]} value={draft.surfaceMaterial} onChange={(v: any) => updateDraft('surfaceMaterial', v)} />
            </Section>
        </>
    );
};

