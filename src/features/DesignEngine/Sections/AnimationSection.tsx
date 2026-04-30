import React from 'react';
import { Sparkles, Zap, MousePointer2, Box } from 'lucide-react';
import { Section, SliderControl, ToggleControl, SelectControl } from '../components/DesignControls';

interface AnimationSectionProps {
    draft: any;
    updateDraft: (key: string, value: any) => void;
    activeSection: string | null;
    setActiveSection: (id: string | null) => void;
}

export const AnimationSection: React.FC<AnimationSectionProps> = ({ draft, updateDraft, activeSection, setActiveSection }) => {
    return (
        <>
            <Section 
                id="mouse-interactions" 
                icon={MousePointer2} 
                title="1. Interação (Mouse & Touch)" 
                activeSection={activeSection} 
                onToggle={setActiveSection}
            >
                <div className="grid grid-cols-2 gap-4">
                    <ToggleControl 
                        label="Hover Lift" 
                        active={draft.hoverLiftEnabled} 
                        onClick={() => updateDraft('hoverLiftEnabled', !draft.hoverLiftEnabled)} 
                    />
                    <ToggleControl 
                        label="Magnetic Pull" 
                        active={draft.magneticPullEnabled} 
                        onClick={() => updateDraft('magneticPullEnabled', !draft.magneticPullEnabled)} 
                    />
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/5">
                    <ToggleControl 
                        label="Spotlight Interativo" 
                        active={draft.spotlightEnabled} 
                        onClick={() => updateDraft('spotlightEnabled', !draft.spotlightEnabled)} 
                    />
                    {draft.spotlightEnabled && (
                        <div className="mt-4 pl-2 border-l-2 border-theme-primary/30">
                            <SliderControl 
                                label="Opacidade Spotlight" 
                                value={draft.cardSpotlight || 0.15} 
                                min={0} max={0.5} step={0.01} 
                                onChange={(v: any) => updateDraft('cardSpotlight', v)} 
                            />
                        </div>
                    )}
                </div>
            </Section>

            <Section 
                id="surface-effects" 
                icon={Sparkles} 
                title="2. Efeitos de Superfície" 
                activeSection={activeSection} 
                onToggle={setActiveSection}
            >
                <div className="grid grid-cols-2 gap-4">
                    <ToggleControl 
                        label="Border Beam" 
                        active={draft.borderBeamEnabled} 
                        onClick={() => updateDraft('borderBeamEnabled', !draft.borderBeamEnabled)} 
                    />
                    <ToggleControl 
                        label="Corte Geométrico" 
                        active={draft.isGeometricCut} 
                        onClick={() => updateDraft('isGeometricCut', !draft.isGeometricCut)} 
                    />
                </div>
                <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-4xs text-white/40 uppercase font-black leading-tight">
                        Nota: Efeitos de superfície dependem do material selecionado na Categoria 1 (Cards).
                    </p>
                </div>
            </Section>

            <Section 
                id="kinetics-perf" 
                icon={Zap} 
                title="3. Cinética & Performance" 
                activeSection={activeSection} 
                onToggle={setActiveSection}
            >
                <div className="grid grid-cols-2 gap-4">
                    <SliderControl 
                        label="Velocidade Global" 
                        value={draft.animationSpeed} 
                        min={0.1} max={2.0} step={0.1} 
                        onChange={(v: any) => updateDraft('animationSpeed', v)} 
                        suffix="s" 
                    />
                    <SliderControl 
                        label="Elasticidade" 
                        value={draft.interfaceElasticity} 
                        min={0} max={1} step={0.05} 
                        onChange={(v: any) => updateDraft('interfaceElasticity', v)} 
                    />
                </div>
                <div className="mt-4">
                    <SelectControl 
                        label="Modo de Performance" 
                        options={[
                            { id: 'high', label: 'High Fidelity (Ultra)' },
                            { id: 'eco', label: 'Eco-Mode (Economia)' }
                        ]} 
                        value={draft.performanceMode} 
                        onChange={(v: any) => updateDraft('performanceMode', v)} 
                    />
                </div>
            </Section>
        </>
    );
};
