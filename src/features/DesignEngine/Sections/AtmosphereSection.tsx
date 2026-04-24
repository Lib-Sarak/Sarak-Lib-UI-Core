import React from 'react';
import { Layers, Wind, Sparkles } from 'lucide-react';
import { Section, SelectControl, SliderControl } from '../components/DesignControls';
import { TEXTURE_LIBRARY } from '../../../constants/design-tokens';

interface AtmosphereSectionProps {
    draft: any;
    updateDraft: (key: string, value: any) => void;
    activeSection: string | null;
    setActiveSection: (id: string | null) => void;
}

export const AtmosphereSection: React.FC<AtmosphereSectionProps> = ({ draft, updateDraft, activeSection, setActiveSection }) => {
    return (
        <>
            <Section id="glassmorphism" icon={Layers} title="Materiais & Glass" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SliderControl label="Opacidade Glass" value={draft.glassOpacity} min={0} max={1} step={0.05} onChange={(v: any) => updateDraft('glassOpacity', v)} />
                    <SliderControl label="Blur Glass" value={draft.glassBlur} min={0} max={40} onChange={(v: any) => updateDraft('glassBlur', v)} suffix="px" />
                </div>
                <SelectControl label="Material da Superfície" options={[{id: 'default', label: 'Ethereal Glass'}, {id: 'acrylic', label: 'Acrylic Solid'}, {id: 'metallic', label: 'Metallic Brushed'}, {id: 'matte', label: 'Deep Matte'}]} value={draft.surfaceMaterial} onChange={(v: any) => updateDraft('surfaceMaterial', v)} />
            </Section>

            <Section id="textures" icon={Wind} title="Atmosfera (Texturas)" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SelectControl label="Padrão de Textura" options={TEXTURE_LIBRARY} value={draft.texture} onChange={(v: any) => updateDraft('texture', v)} />
                    <SliderControl label="Opacidade Textura" value={draft.textureOpacity} min={0} max={0.3} step={0.01} onChange={(v: any) => updateDraft('textureOpacity', v)} />
                </div>
            </Section>

            <Section id="kinetics" icon={Sparkles} title="Cinética & Profundidade" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SliderControl label="Intensidade Sombras" value={draft.shadowIntensity} min={0} max={2} step={0.1} onChange={(v: any) => updateDraft('shadowIntensity', v)} />
                    <SliderControl label="Layered Shadows" value={draft.layeredShadows || 1.0} min={0} max={2} step={0.1} onChange={(v: any) => updateDraft('layeredShadows', v)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <SelectControl label="Orientação Sombra" options={[{id: 'top-down', label: 'Top-Down'}, {id: 'isometric', label: 'Isométrica'}, {id: 'inner', label: 'Interna'}]} value={draft.shadowOrientation} onChange={(v: any) => updateDraft('shadowOrientation', v)} />
                    <SelectControl label="Cor Sombra" options={[{id: 'neutral', label: 'Neutro'}, {id: 'match', label: 'Match Primary'}, {id: 'adaptive', label: 'Adaptativo'}]} value={draft.shadowColorMode} onChange={(v: any) => updateDraft('shadowColorMode', v)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <SliderControl label="Curva de Contraste" value={draft.contrastCurve || 1.0} min={0.5} max={1.5} step={0.05} onChange={(v: any) => updateDraft('contrastCurve', v)} />
                    <SliderControl label="Velocidade Animação" value={draft.animationSpeed} min={0.1} max={1} step={0.1} onChange={(v: any) => updateDraft('animationSpeed', v)} suffix="s" />
                </div>
                <SliderControl label="Elasticidade (Bounce)" value={draft.interfaceElasticity} min={0} max={1} step={0.1} onChange={(v: any) => updateDraft('interfaceElasticity', v)} />
            </Section>
        </>
    );
};
