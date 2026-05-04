import React from 'react';
import { Box, MousePointer2, Type } from 'lucide-react';
import { Section, SelectControl, SliderControl } from '../components/DesignControls';

interface ComponentsSectionProps {
    draft: any;
    updateDraft: (key: string, value: any) => void;
    activeSection: string | null;
    setActiveSection: (id: string | null) => void;
}

export const ComponentsSection: React.FC<ComponentsSectionProps> = ({ draft, updateDraft, activeSection, setActiveSection }) => {
    return (
        <>
            <Section id="button-styles" icon={MousePointer2} title="Botões & Interação" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SliderControl 
                        label="Raio do Botão" 
                        value={draft.buttonRadius || 8} 
                        min={0} 
                        max={30} 
                        onChange={(v: any) => updateDraft('buttonRadius', v)} 
                        suffix="px" 
                    />
                    <SliderControl 
                        label="Padding X" 
                        value={draft.buttonPadding || 16} 
                        min={8} 
                        max={32} 
                        onChange={(v: any) => updateDraft('buttonPadding', v)} 
                        suffix="px" 
                    />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                    <SelectControl 
                        label="Efeito Hover" 
                        options={[
                            {id: 'glow', label: 'Neon Glow'}, 
                            {id: 'lift', label: 'Lift Up'}, 
                            {id: 'none', label: 'Nenhum'}
                        ]} 
                        value={draft.buttonHoverEffect || 'glow'} 
                        onChange={(v: any) => updateDraft('buttonHoverEffect', v)} 
                    />
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-white/40 uppercase">Cor do Botão</span>
                        <input type="color" value={draft.buttonColor || '#10b981'} onChange={(e) => updateDraft('buttonColor', e.target.value)} className="w-full h-8 rounded-lg bg-black/40 border border-white/5 cursor-pointer p-1" />
                    </div>
                </div>
            </Section>

            <Section id="form-elements" icon={Type} title="Inputs & Interface" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SelectControl 
                        label="Estilo do Input" 
                        options={[
                            {id: 'glass', label: 'Glassmorphism'}, 
                            {id: 'solid', label: 'Sólido'}, 
                            {id: 'ghost', label: 'Fantasma (Ghost)'}
                        ]} 
                        value={draft.inputStyle || 'glass'} 
                        onChange={(v: any) => updateDraft('inputStyle', v)} 
                    />
                    <SliderControl 
                        label="Espessura Borda" 
                        value={draft.inputBorderWidth || 1} 
                        min={1} 
                        max={3} 
                        onChange={(v: any) => updateDraft('inputBorderWidth', v)} 
                        suffix="px" 
                    />
                </div>
                <div className="mt-4 space-y-4">
                    <SliderControl 
                        label="Elasticidade da Interface" 
                        value={draft.interfaceElasticity || 0.5} 
                        min={0} 
                        max={1} 
                        step={0.05} 
                        onChange={(v: any) => updateDraft('interfaceElasticity', v)} 
                    />
                    <SliderControl 
                        label="Intensidade Háptica" 
                        value={draft.hapticIntensity || 0.5} 
                        min={0} 
                        max={1} 
                        step={0.05} 
                        onChange={(v: any) => updateDraft('hapticIntensity', v)} 
                    />
                </div>
            </Section>
        </>
    );
};

