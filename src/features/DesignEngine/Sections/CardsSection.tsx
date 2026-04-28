import React from 'react';
import { Box, Maximize, Wind, Layers } from 'lucide-react';
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
            <Section id="card-geometry" icon={Box} title="Geometria do Card" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SliderControl label="Raio da Borda" value={draft.borderRadius} min={0} max={32} onChange={(v: any) => updateDraft('borderRadius', v)} suffix="px" />
                    <div className="flex flex-col gap-1">
                        <span className="text-3xs font-black uppercase tracking-widest text-white/40">Corte Angular</span>
                        <button 
                            onClick={() => updateDraft('isGeometricCut', !draft.isGeometricCut)}
                            className={`py-2 rounded-lg text-3xs font-black uppercase transition-all ${draft.isGeometricCut ? 'bg-[var(--theme-primary)] text-white' : 'bg-white/5 text-white/40'}`}
                        >
                            {draft.isGeometricCut ? 'Ativado' : 'Desativado'}
                        </button>
                    </div>
                </div>
                <div className="mt-4">
                     <SelectControl 
                        label="Textura Interna do Card" 
                        options={[
                            {id: 'none', label: 'Nenhuma'},
                            {id: 'grid', label: 'Grid Tech'},
                            {id: 'dots', label: 'Dots Clean'},
                            {id: 'circuit', label: 'Circuit'},
                            {id: 'carbon', label: 'Carbon Fiber'},
                            {id: 'silk', label: 'Silk Flow'}
                        ]} 
                        value={draft.cardTexture} 
                        onChange={(v: any) => updateDraft('cardTexture', v)} 
                    />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <SliderControl label="Espessura Borda" value={draft.borderWidth} min={0} max={4} step={1} onChange={(v: any) => updateDraft('borderWidth', v)} suffix="px" />
                    <SelectControl label="Estilo Borda" options={['solid', 'dashed', 'dotted']} value={draft.borderStyle} onChange={(v: any) => updateDraft('borderStyle', v)} />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <SelectControl label="Tipo Borda" options={[{id: 'default', label: 'Padrão'}, {id: 'neon', label: 'Neon Glow'}, {id: 'beveled', label: 'Chanfrado'}, {id: 'inlet', label: 'Interna'}]} value={draft.borderType} onChange={(v: any) => updateDraft('borderType', v)} />
                    <SliderControl label="Padding Interno" value={draft.cardPadding} min={8} max={64} onChange={(v: any) => updateDraft('cardPadding', v)} suffix="px" />
                </div>
            </Section>

            <Section id="card-atmosphere" icon={Wind} title="Atmosfera (Glassmorphism)" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SliderControl label="Opacidade Vidro" value={draft.glassOpacity} min={0} max={1} step={0.05} onChange={(v: any) => updateDraft('glassOpacity', v)} />
                    <SliderControl label="Blur (Desfoque)" value={draft.glassBlur} min={0} max={40} onChange={(v: any) => updateDraft('glassBlur', v)} suffix="px" />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <SliderControl label="Saturação Vidro" value={draft.glassSaturation} min={100} max={300} step={10} onChange={(v: any) => updateDraft('glassSaturation', v)} suffix="%" />
                    <SliderControl label="Holofote (Spotlight)" value={draft.cardSpotlight} min={0} max={0.5} step={0.01} onChange={(v: any) => updateDraft('cardSpotlight', v)} />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <SliderControl label="Curva de Contraste" value={draft.contrastCurve || 1.0} min={0.5} max={2.0} step={0.1} onChange={(v: any) => updateDraft('contrastCurve', v)} />
                    <div className="flex flex-col gap-1">
                        <span className="text-3xs font-black uppercase tracking-widest text-white/40">Efeito Border Beam</span>
                        <button 
                            onClick={() => updateDraft('borderBeamEnabled', draft.borderBeamEnabled === '1' ? '0' : '1')}
                            className={`py-2 px-3 rounded-lg text-2xs font-black uppercase transition-all border ${draft.borderBeamEnabled === '1' ? 'bg-[var(--theme-primary)] border-transparent text-white' : 'bg-white/5 border-white/10 text-white/40'}`}
                        >
                            {draft.borderBeamEnabled === '1' ? 'Ativado' : 'Desativado'}
                        </button>
                    </div>
                </div>
                <div className="mt-4">
                    <SelectControl 
                        label="Material de Superfície" 
                        options={[
                            {id: 'glass', label: 'Glass Standard'}, 
                            {id: 'acrylic', label: 'Acrylic Deep'}, 
                            {id: 'matte', label: 'Solid Matte'}, 
                            {id: 'brushed', label: 'Brushed Metal'}
                        ]} 
                        value={draft.surfaceMaterial} 
                        onChange={(v: any) => updateDraft('surfaceMaterial', v)} 
                    />
                </div>
            </Section>

            <Section id="card-shadows" icon={Layers} title="Sombras & Profundidade" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SliderControl label="Intensidade" value={draft.shadowIntensity} min={0} max={1} step={0.05} onChange={(v: any) => updateDraft('shadowIntensity', v)} />
                    <SelectControl label="Orientação" options={[{id: 'top-down', label: 'Superior'}, {id: 'isometric', label: 'Isométrica'}, {id: 'inner', label: 'Interna'}]} value={draft.shadowOrientation} onChange={(v: any) => updateDraft('shadowOrientation', v)} />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <SliderControl label="Sombras em Camadas" value={draft.layeredShadows || 1.0} min={0} max={2.0} step={0.1} onChange={(v: any) => updateDraft('layeredShadows', v)} />
                    <SelectControl label="Modo de Cor" options={[{id: 'black', label: 'Preto Absoluto'}, {id: 'colored', label: 'Baseado na Cor Primária'}]} value={draft.shadowColorMode} onChange={(v: any) => updateDraft('shadowColorMode', v)} />
                </div>
            </Section>
        </>
    );
};

