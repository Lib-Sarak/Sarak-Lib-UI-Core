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

                <div className="mb-4">
                    <span className="text-2xs font-black uppercase tracking-widest text-white/40 block mb-2">Tom de Voz (System Tone)</span>
                    <div className="grid grid-cols-3 gap-1 p-1 bg-black/20 rounded-xl border border-white/5">
                        {['formal', 'friendly', 'cyber'].map(tone => (
                            <button key={tone} onClick={() => updateDraft('systemTone', tone)} className={`py-2 rounded-lg text-3xs font-black uppercase transition-all ${draft.systemTone === tone ? 'bg-[var(--theme-primary)] text-white shadow-lg' : 'text-white/20 hover:text-white/40'}`}>{tone}</button>
                        ))}
                    </div>
                </div>

                {/* --- MULTI-TONE STRATEGY (v10.0) --- */}
                <div className="mb-6 space-y-4 pt-4 border-t border-white/5">
                    <span className="text-2xs font-black uppercase tracking-widest text-white/40 block mb-2">Profundidade Cromática</span>
                    <div className="grid grid-cols-3 gap-1 p-1 bg-black/20 rounded-xl border border-white/5">
                        {[1, 2, 3].map(level => (
                            <button key={level} onClick={() => updateDraft('colorDepth', level)} className={`py-2 rounded-lg text-3xs font-black uppercase transition-all ${draft.colorDepth === level ? 'bg-[var(--theme-primary)] text-white shadow-lg' : 'text-white/20 hover:text-white/40'}`}>
                                {level === 1 ? 'Mono' : level === 2 ? 'Dual' : 'Tri'} Tone
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-6 space-y-4">
                    <span className="text-2xs font-black uppercase tracking-widest text-white/40 block mb-2">Variação de Mapeamento</span>
                    <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3].map(v => (
                            <button key={v} onClick={() => updateDraft('colorVariation', v)} className={`p-2 rounded-xl border transition-all text-center flex flex-col items-center justify-center min-h-[50px] ${draft.colorVariation === v ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]/10 text-white shadow-[0_0_15px_rgba(var(--theme-primary-rgb),0.2)]' : 'border-white/5 bg-black/20 text-white/20 hover:text-white/40'}`}>
                                <span className="text-[8px] font-black uppercase">Var {v}</span>
                                <p className="text-[7px] font-bold opacity-60 leading-tight mt-1">
                                    {draft.colorDepth === 1 ? (v === 1 ? 'Branding' : v === 2 ? 'Industrial' : 'Glass') :
                                     draft.colorDepth === 2 ? (v === 1 ? 'Action' : v === 2 ? 'Atmos' : 'Content') :
                                     (v === 1 ? 'Soberana' : v === 2 ? 'Abstract' : 'Hyper')}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>

                {(draft.colorDepth >= 2) && (
                    <div className="grid grid-cols-2 gap-4 pb-6 mb-6 border-b border-white/5">
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold text-white/40 uppercase">Cor Secundária</span>
                            <div className="relative group">
                                <input type="color" value={draft.secondaryColor || '#6366f1'} onChange={(e) => updateDraft('secondaryColor', e.target.value)} className="w-full h-10 rounded-xl bg-black/40 border border-white/5 cursor-pointer appearance-none p-1" />
                                <div className="absolute top-1/2 left-3 -translate-y-1/2 pointer-events-none">
                                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: draft.secondaryColor }} />
                                </div>
                            </div>
                        </div>
                        {draft.colorDepth === 3 && (
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-bold text-white/40 uppercase">Cor Terciária</span>
                                <div className="relative group">
                                    <input type="color" value={draft.tertiaryColor || '#10b981'} onChange={(e) => updateDraft('tertiaryColor', e.target.value)} className="w-full h-10 rounded-xl bg-black/40 border border-white/5 cursor-pointer appearance-none p-1" />
                                    <div className="absolute top-1/2 left-3 -translate-y-1/2 pointer-events-none">
                                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: draft.tertiaryColor }} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="mb-6 space-y-4 pt-4 border-t border-white/5">
                    <span className="text-2xs font-black uppercase tracking-widest text-white/20 block">Paletas Harmonizadas</span>
                    <div className="grid grid-cols-2 gap-2">
                        {COLOR_PALETTES.map(palette => (
                            <button key={palette.id} onClick={() => {
                                updateDraft('primaryColor', palette.colors.primary);
                                updateDraft('successColor', palette.colors.success);
                                updateDraft('warningColor', palette.colors.warning);
                                updateDraft('errorColor', palette.colors.error);
                            }} className="flex flex-col gap-2 p-3 bg-black/20 rounded-xl border border-white/5 hover:border-white/20 transition-all text-left">
                                <span className="text-[10px] font-bold text-white/60 uppercase">{palette.name}</span>
                                <div className="flex w-full h-2 rounded-full overflow-hidden">
                                    <div className="flex-1" style={{ backgroundColor: palette.colors.primary }} />
                                    <div className="w-4" style={{ backgroundColor: palette.colors.success }} />
                                    <div className="w-4" style={{ backgroundColor: palette.colors.warning }} />
                                    <div className="w-4" style={{ backgroundColor: palette.colors.error }} />
                                </div>
                            </button>
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
                    <SliderControl label="Opacidade Textura" value={draft.textureOpacity} min={0} max={0.5} step={0.01} onChange={(v: any) => updateDraft('textureOpacity', v)} />
                    <SliderControl label="Noise Overlay" value={draft.atmosphereNoiseOpacity} min={0} max={0.1} step={0.005} onChange={(v: any) => updateDraft('atmosphereNoiseOpacity', v)} />
                </div>
            </Section>
        </>
    );
};

