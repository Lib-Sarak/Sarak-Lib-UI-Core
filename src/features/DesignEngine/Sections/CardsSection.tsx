import React from 'react';
import { Box, Layers } from 'lucide-react';
import { Section, SelectControl, SliderControl } from '../components/DesignControls';

interface CardsSectionProps {
    draft: any;
    updateDraft: (key: string, value: any) => void;
    activeSection: string | null;
    setActiveSection: (id: string | null) => void;
}

export const CardsSection: React.FC<CardsSectionProps> = ({ draft, updateDraft, activeSection, setActiveSection }) => {
    return (
        <>
            <Section id="card-geometry" icon={Box} title="Geometria & Espaçamento" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SliderControl 
                        label="Raio da Borda" 
                        value={draft.cardBorderRadius || 12} 
                        min={0} 
                        max={60} 
                        onChange={(v: any) => updateDraft('cardBorderRadius', v)} 
                        suffix="px" 
                    />
                    <SliderControl 
                        label="Padding Interno" 
                        value={draft.cardPadding || 24} 
                        min={0} 
                        max={80} 
                        onChange={(v: any) => updateDraft('cardPadding', v)} 
                        suffix="px" 
                    />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <SelectControl 
                        label="Estilo da Borda" 
                        options={[
                            { id: 'solid', label: 'Sólida' },
                            { id: 'dashed', label: 'Tracejada' },
                            { id: 'dotted', label: 'Pontilhada' },
                            { id: 'double', label: 'Dupla' }
                        ]} 
                        value={draft.cardBorderStyle || 'solid'} 
                        onChange={(v: any) => updateDraft('cardBorderStyle', v)} 
                    />
                    <SliderControl 
                        label="Espessura Borda" 
                        value={draft.cardBorderWidth || 1} 
                        min={0} 
                        max={10} 
                        onChange={(v: any) => updateDraft('cardBorderWidth', v)} 
                        suffix="px" 
                    />
                </div>
                <div className="mt-4">
                    <button 
                        onClick={() => {
                            const nextState = !draft.isGeometricCut;
                            updateDraft('isGeometricCut', nextState);
                            updateDraft('cardGeometricCut', nextState ? (draft.cardGeometricCut || 12) : 0);
                        }}
                        className={`w-full py-2 rounded-lg text-3xs font-black uppercase transition-all ${draft.isGeometricCut ? 'bg-[var(--theme-primary)] text-white' : 'bg-white/5 text-white/20'}`}
                    >
                        Corte Geométrico (Chanfro) {draft.isGeometricCut ? 'Ativo' : 'Inativo'}
                    </button>
                    {draft.isGeometricCut && (
                        <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/5">
                            <SliderControl 
                                label="Tamanho do Chanfro" 
                                value={draft.cardGeometricCut !== undefined ? draft.cardGeometricCut : 12} 
                                min={2} 
                                max={40} 
                                onChange={(v: any) => updateDraft('cardGeometricCut', v)} 
                                suffix="px" 
                            />
                        </div>
                    )}
                </div>
            </Section>

            <Section id="card-surface" icon={Layers} title="Superfície & Textura" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SelectControl 
                        label="Textura Interna" 
                        options={[
                            { id: 'none', label: 'Nenhuma' },
                            { id: 'dots', label: 'Pontos' },
                            { id: 'grid', label: 'Grelha' },
                            { id: 'noise', label: 'Ruído' }
                        ]} 
                        value={draft.cardTextureType || draft.cardTexture || 'none'} 
                        onChange={(v: any) => {
                            updateDraft('cardTextureType', v);
                            updateDraft('cardTexture', v);
                        }} 
                    />
                    <SliderControl 
                        label="Opacidade Textura" 
                        value={draft.cardTextureOpacity !== undefined ? draft.cardTextureOpacity : (draft.cardNoiseOpacity || 0.03)} 
                        min={0} 
                        max={0.2} 
                        step={0.01} 
                        onChange={(v: any) => {
                            updateDraft('cardTextureOpacity', v);
                            updateDraft('cardNoiseOpacity', v);
                        }} 
                    />
                </div>
                <div className="grid grid-cols-1 gap-4 mt-4">
                    <SliderControl 
                        label="Intensidade da Sombra" 
                        value={draft.cardShadowIntensity || 0.1} 
                        min={0} 
                        max={1} 
                        step={0.05} 
                        onChange={(v: any) => updateDraft('cardShadowIntensity', v)} 
                    />
                </div>
            </Section>

            <Section id="card-interaction" icon={Box} title="Interatividade & Feedback" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-3 gap-2 mb-4">
                    <button 
                        onClick={() => updateDraft('hoverLiftEnabled', !draft.hoverLiftEnabled)}
                        className={`py-3 rounded-lg text-[8px] font-black uppercase transition-all ${draft.hoverLiftEnabled ? 'bg-[var(--theme-primary)] text-white' : 'bg-white/5 text-white/20'}`}
                    >
                        Hover Lift
                    </button>
                    <button 
                        onClick={() => updateDraft('spotlightEnabled', !draft.spotlightEnabled)}
                        className={`py-3 rounded-lg text-[8px] font-black uppercase transition-all ${draft.spotlightEnabled ? 'bg-[var(--theme-primary)] text-white' : 'bg-white/5 text-white/20'}`}
                    >
                        Spotlight
                    </button>
                    <button 
                        onClick={() => updateDraft('magneticPullEnabled', !draft.magneticPullEnabled)}
                        className={`py-3 rounded-lg text-[8px] font-black uppercase transition-all ${draft.magneticPullEnabled ? 'bg-[var(--theme-primary)] text-white' : 'bg-white/5 text-white/20'}`}
                    >
                        Magnetic
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-white/40 uppercase">Hover Color</span>
                        <input type="color" value={draft.cardHoverColor || '#ffffff05'} onChange={(e) => updateDraft('cardHoverColor', e.target.value)} className="w-full h-8 rounded-lg bg-black/40 border border-white/5 cursor-pointer p-1" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-white/40 uppercase">Spotlight Color</span>
                        <input type="color" value={draft.cardSpotlight || '#ffffff10'} onChange={(e) => updateDraft('cardSpotlight', e.target.value)} className="w-full h-8 rounded-lg bg-black/40 border border-white/5 cursor-pointer p-1" />
                    </div>
                </div>
            </Section>
        </>
    );
};
