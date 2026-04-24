import React from 'react';
import { Sparkles, Zap, Wind } from 'lucide-react';
import { Section, SelectControl, SliderControl } from '../components/DesignControls';

interface AnimationSectionProps {
    draft: any;
    updateDraft: (key: string, value: any) => void;
    activeSection: string | null;
    setActiveSection: (id: string | null) => void;
}

export const AnimationSection: React.FC<AnimationSectionProps> = ({ draft, updateDraft, activeSection, setActiveSection }) => {
    return (
        <>
            <Section id="kinetics" icon={Zap} title="Cinética Global" activeSection={activeSection} onToggle={setActiveSection}>
                <SliderControl label="Velocidade das Transições" value={draft.animationSpeed} min={0.1} max={2.0} step={0.1} onChange={(v: any) => updateDraft('animationSpeed', v)} suffix="s" />
                <SliderControl label="Elasticidade (Bounce)" value={draft.interfaceElasticity} min={0} max={1} step={0.05} onChange={(v: any) => updateDraft('interfaceElasticity', v)} />
            </Section>

            <Section id="effects-refinement" icon={Sparkles} title="Refinamento Visual" activeSection={activeSection} onToggle={setActiveSection}>
                <SliderControl label="Curva de Contraste" value={draft.contrastCurve} min={0.5} max={1.5} step={0.05} onChange={(v: any) => updateDraft('contrastCurve', v)} />
                <div className="mb-4">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block mb-2">Sombras em Camadas (Layered)</span>
                    <button onClick={() => updateDraft('layeredShadows', !draft.layeredShadows)} className={`w-full py-2.5 rounded-lg text-[9px] font-black uppercase transition-all flex items-center justify-center gap-2 ${draft.layeredShadows ? 'bg-[var(--theme-primary)] text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>
                        {draft.layeredShadows ? 'Ativado' : 'Desativado'}
                    </button>
                </div>
            </Section>
        </>
    );
};
