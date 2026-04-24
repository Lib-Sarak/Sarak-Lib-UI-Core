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
                <SliderControl label="Raio da Borda" value={draft.borderRadius} min={0} max={32} onChange={(v: any) => updateDraft('borderRadius', v)} suffix="px" />
                <div className="grid grid-cols-2 gap-4">
                    <SliderControl label="Espessura Borda" value={draft.borderWidth} min={0} max={4} step={1} onChange={(v: any) => updateDraft('borderWidth', v)} suffix="px" />
                    <SelectControl label="Estilo Borda" options={['solid', 'dashed', 'dotted']} value={draft.borderStyle} onChange={(v: any) => updateDraft('borderStyle', v)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <SelectControl label="Tipo Borda" options={[{id: 'default', label: 'Padrão'}, {id: 'neon', label: 'Neon Glow'}, {id: 'beveled', label: 'Chanfrado'}, {id: 'inlet', label: 'Interna'}]} value={draft.borderType} onChange={(v: any) => updateDraft('borderType', v)} />
                    <SliderControl label="Padding Interno" value={draft.cardPadding} min={8} max={64} onChange={(v: any) => updateDraft('cardPadding', v)} suffix="px" />
                </div>
            </Section>

            <Section id="card-atmosphere" icon={Wind} title="Atmosfera (Glassmorphism)" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SliderControl label="Opacidade Vidro" value={draft.glassOpacity} min={0} max={1} step={0.05} onChange={(v: any) => updateDraft('glassOpacity', v)} />
                    <SliderControl label="Blur (Desfoque)" value={draft.glassBlur} min={0} max={40} onChange={(v: any) => updateDraft('glassBlur', v)} suffix="px" />
                </div>
            </Section>

            <Section id="card-shadows" icon={Layers} title="Sombras & Profundidade" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SliderControl label="Intensidade" value={draft.shadowIntensity} min={0} max={1} step={0.05} onChange={(v: any) => updateDraft('shadowIntensity', v)} />
                    <SelectControl label="Orientação" options={[{id: 'top-down', label: 'Superior'}, {id: 'isometric', label: 'Isométrica'}, {id: 'inner', label: 'Interna'}]} value={draft.shadowOrientation} onChange={(v: any) => updateDraft('shadowOrientation', v)} />
                </div>
                <SelectControl label="Modo de Cor" options={[{id: 'black', label: 'Preto Absoluto'}, {id: 'colored', label: 'Baseado na Cor Primária'}]} value={draft.shadowColorMode} onChange={(v: any) => updateDraft('shadowColorMode', v)} />
            </Section>
        </>
    );
};
