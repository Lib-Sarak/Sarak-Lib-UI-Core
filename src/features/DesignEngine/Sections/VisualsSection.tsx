import React from 'react';
import { Palette, Box, Grid, AlertCircle, Check, Plus } from 'lucide-react';
import { Section, SelectControl, SliderControl } from '../components/DesignControls';
import { PRIMARY_COLORS } from '../../../core/Design/presets/colors';
import { TEXTURE_LIBRARY } from '../../../core/Design/presets/atmosphere';

interface VisualsSectionProps {
    draft: any;
    updateDraft: (key: string, value: any) => void;
    activeSection: string | null;
    setActiveSection: (id: string | null) => void;
}

export const VisualsSection: React.FC<VisualsSectionProps> = ({ draft, updateDraft, activeSection, setActiveSection }) => {
    // Mapear biblioteca de texturas
    const textureOptions = TEXTURE_LIBRARY.map(t => ({
        id: t.id,
        label: t.name
    }));

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
                            value={draft.primaryColor || '#10b981'} 
                            onChange={(e) => updateDraft('primaryColor', e.target.value)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="absolute inset-0 rounded-full border border-white/20 flex items-center justify-center bg-white/5 hover:bg-white/10 transition-all">
                            <Plus size={10} className="text-white/40" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 mb-6">
                    <ColorControl 
                        label="Cor Secundária" 
                        value={draft.secondaryColor} 
                        onChange={(v: any) => updateDraft('secondaryColor', v)} 
                    />
                    <SliderControl label="Contraste" value={draft.contrastCurve || 1} min={0.5} max={1.5} step={0.05} onChange={(v: any) => updateDraft('contrastCurve', v)} />
                </div>

                <div className="space-y-3 pt-4 border-t border-white/5">
                    <span className="text-2xs font-black uppercase tracking-widest text-white/20 block">Cores Semânticas</span>
                    <div className="grid grid-cols-1 gap-2">
                        <ColorControl label="Sucesso" value={draft.successColor} onChange={(v: any) => updateDraft('successColor', v)} />
                        <ColorControl label="Aviso" value={draft.warningColor} onChange={(v: any) => updateDraft('warningColor', v)} />
                        <ColorControl label="Erro" value={draft.errorColor} onChange={(v: any) => updateDraft('errorColor', v)} />
                    </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/5 mt-4">
                    <span className="text-2xs font-black uppercase tracking-widest text-white/20 block">Cores de Ambiente</span>
                    <div className="grid grid-cols-1 gap-2">
                        <ColorControl label="Fundo (Body)" value={draft.bodyColor} onChange={(v: any) => updateDraft('bodyColor', v)} />
                        <ColorControl label="Títulos (Title)" value={draft.titleColor} onChange={(v: any) => updateDraft('titleColor', v)} />
                    </div>
                </div>
            </Section>

            <Section id="glass-effects" icon={Box} title="Efeitos de Vidro (Glass)" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SliderControl label="Opacidade" value={draft.glassOpacity} min={0} max={1} step={0.05} onChange={(v: any) => updateDraft('glassOpacity', v)} />
                    <SliderControl label="Desfoque (Blur)" value={draft.glassBlur} min={0} max={60} step={1} onChange={(v: any) => updateDraft('glassBlur', v)} suffix="px" />
                    <SliderControl label="Saturação" value={draft.glassSaturation || 100} min={0} max={300} step={10} onChange={(v: any) => updateDraft('glassSaturation', v)} suffix="%" />
                </div>
                <div className="mt-4 flex gap-4">
                    <button 
                        onClick={() => updateDraft('spotlightEnabled', !draft.spotlightEnabled)}
                        className={`flex-1 py-3 rounded-lg text-3xs font-black uppercase transition-all border ${draft.spotlightEnabled ? 'bg-[var(--theme-primary)] border-transparent text-white' : 'bg-white/5 border-white/10 text-white/40'}`}
                    >
                        Efeito Spotlight
                    </button>
                    <button 
                        onClick={() => updateDraft('borderBeamEnabled', !draft.borderBeamEnabled)}
                        className={`flex-1 py-3 rounded-lg text-3xs font-black uppercase transition-all border ${draft.borderBeamEnabled ? 'bg-[var(--theme-primary)] border-transparent text-white' : 'bg-white/5 border-white/10 text-white/40'}`}
                    >
                        Beam Border
                    </button>
                </div>
            </Section>

            <Section id="textures-core" icon={Grid} title="Texturas & Ruído" activeSection={activeSection} onToggle={setActiveSection}>
                <SelectControl 
                    label="Textura Base" 
                    options={textureOptions} 
                    value={draft.texture || 'none'} 
                    onChange={(v: any) => updateDraft('texture', v)} 
                />
                
                <div className="mt-4 grid grid-cols-2 gap-4">
                    <SliderControl label="Opacidade Ruído" value={draft.atmosphereNoiseOpacity || 0.02} min={0} max={0.2} step={0.005} onChange={(v: any) => updateDraft('atmosphereNoiseOpacity', v)} />
                    <SliderControl label="Zoom Sistema" value={draft.scaleRatio || 1} min={0.5} max={1.5} step={0.01} onChange={(v: any) => updateDraft('scaleRatio', v)} />
                </div>
            </Section>
        </>
    );
};

