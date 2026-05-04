import React from 'react';
import { Palette, Box, Grid, AlertCircle, Check, Plus } from 'lucide-react';
import { Section, SelectControl, SliderControl } from '../components/DesignControls';
import { PRIMARY_COLORS, TEXTURE_LIBRARY, COLOR_PALETTES } from '../../../constants/design-tokens';

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
                            value={draft.primaryColor || '#10b981'} 
                            onChange={(e) => updateDraft('primaryColor', e.target.value)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="absolute inset-0 rounded-full border border-white/20 flex items-center justify-center bg-white/5 hover:bg-white/10 transition-all">
                            <Plus size={10} className="text-white/40" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-white/40 uppercase">Cor Secundária</span>
                        <input type="color" value={draft.secondaryColor || '#ff00e5'} onChange={(e) => updateDraft('secondaryColor', e.target.value)} className="w-full h-10 rounded-xl bg-black/40 border border-white/5 cursor-pointer p-1" />
                    </div>
                    <SliderControl label="Contraste" value={draft.contrastCurve || 1} min={0.5} max={1.5} step={0.05} onChange={(v: any) => updateDraft('contrastCurve', v)} />
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
                    options={[
                        { id: 'none', label: 'Nenhuma' },
                        { id: 'dots', label: 'Pontos' },
                        { id: 'grid', label: 'Grade' },
                        { id: 'noise', label: 'Ruído' }
                    ]} 
                    value={draft.texture} 
                    onChange={(v: any) => updateDraft('texture', v)} 
                />
                
                <div className="mt-4 grid grid-cols-2 gap-4">
                    <SliderControl label="Opacidade Ruído" value={draft.atmosphereNoiseOpacity} min={0} max={0.1} step={0.005} onChange={(v: any) => updateDraft('atmosphereNoiseOpacity', v)} />
                    <SliderControl label="Zoom Sistema" value={draft.scaleRatio} min={0.8} max={1.2} step={0.01} onChange={(v: any) => updateDraft('scaleRatio', v)} />
                </div>
            </Section>
        </>
    );
};

