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
                
                <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-white/40 uppercase">Base</span>
                        <input type="color" value={draft.buttonColor || '#10b981'} onChange={(e) => updateDraft('buttonColor', e.target.value)} className="w-full h-8 rounded-lg bg-black/40 border border-white/5 cursor-pointer p-1" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-white/40 uppercase">Hover</span>
                        <input type="color" value={draft.buttonHoverColor || draft.primaryColor} onChange={(e) => updateDraft('buttonHoverColor', e.target.value)} className="w-full h-8 rounded-lg bg-black/40 border border-white/5 cursor-pointer p-1" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-white/40 uppercase">Active</span>
                        <input type="color" value={draft.buttonActiveColor || draft.primaryColor} onChange={(e) => updateDraft('buttonActiveColor', e.target.value)} className="w-full h-8 rounded-lg bg-black/40 border border-white/5 cursor-pointer p-1" />
                    </div>
                </div>

                <div className="mt-6 flex gap-4">
                    <button 
                        onClick={() => updateDraft('buttonHoverLift', !draft.buttonHoverLift)}
                        className={`flex-1 py-2 rounded-lg text-3xs font-black uppercase transition-all border ${draft.buttonHoverLift ? 'bg-[var(--theme-primary)] border-transparent text-white' : 'bg-white/5 border-white/10 text-white/40'}`}
                    >
                        Hover Lift
                    </button>
                    <SelectControl 
                        label="Social Radius" 
                        options={[
                            {id: '0', label: 'Square'}, 
                            {id: '8', label: 'Soft'}, 
                            {id: '50', label: 'Circle'}
                        ]} 
                        value={draft.socialButtonRadius?.toString() || '8'} 
                        onChange={(v: any) => updateDraft('socialButtonRadius', parseInt(v))} 
                    />
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
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-white/40 uppercase">Fundo Input</span>
                        <input type="color" value={draft.inputBackgroundColor || '#ffffff05'} onChange={(e) => updateDraft('inputBackgroundColor', e.target.value)} className="w-full h-10 rounded-lg bg-black/40 border border-white/5 cursor-pointer p-1" />
                    </div>
                </div>
                <div className="mt-4 space-y-4">
                    <SliderControl 
                        label="Elasticidade" 
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

            <Section id="filter-engines" icon={Box} title="Motores de Filtro" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SliderControl 
                        label="Raio do Filtro" 
                        value={draft.filterRadius || 12} 
                        min={0} 
                        max={32} 
                        onChange={(v: any) => updateDraft('filterRadius', v)} 
                        suffix="px" 
                    />
                    <SliderControl 
                        label="Espaçamento (Gap)" 
                        value={draft.filterGap || 12} 
                        min={4} 
                        max={24} 
                        onChange={(v: any) => updateDraft('filterGap', v)} 
                        suffix="px" 
                    />
                </div>
                <div className="mt-4">
                    <SliderControl 
                        label="Padding Interno" 
                        value={draft.filterPadding || 16} 
                        min={4} 
                        max={32} 
                        onChange={(v: any) => updateDraft('filterPadding', v)} 
                        suffix="px" 
                    />
                </div>
            </Section>
        </>
    );
};

