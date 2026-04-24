import React from 'react';
import { MessageSquare, Network, BarChart } from 'lucide-react';
import { Section, SelectControl, SliderControl } from '../components/DesignControls';

interface EnginesSectionProps {
    draft: any;
    updateDraft: (key: string, value: any) => void;
    activeSection: string | null;
    setActiveSection: (id: string | null) => void;
}

export const EnginesSection: React.FC<EnginesSectionProps> = ({ draft, updateDraft, activeSection, setActiveSection }) => {
    return (
        <>
            <Section id="chat-engine" icon={MessageSquare} title="Motor de Chat" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SelectControl label="Estilo Bolha" options={[{id: 'glass', label: 'Glass'}, {id: 'solid', label: 'Sólido'}, {id: 'minimal', label: 'Minimal'}]} value={draft.chatBubbleStyle} onChange={(v: any) => updateDraft('chatBubbleStyle', v)} />
                    <SliderControl label="Veloc. Digitação" value={draft.chatAnimationSpeed} min={0.01} max={0.2} step={0.01} onChange={(v: any) => updateDraft('chatAnimationSpeed', v)} suffix="s" />
                </div>
            </Section>

            <Section id="flow-engine" icon={Network} title="Motor de Fluxo" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SelectControl label="Estilo Grid" options={[{id: 'dots', label: 'Pontos'}, {id: 'lines', label: 'Linhas'}, {id: 'none', label: 'Nenhum'}]} value={draft.flowGridStyle} onChange={(v: any) => updateDraft('flowGridStyle', v)} />
                    <SliderControl label="Raio dos Nodes" value={draft.flowNodeRadius} min={4} max={24} onChange={(v: any) => updateDraft('flowNodeRadius', v)} suffix="px" />
                </div>
            </Section>

            <Section id="chart-engine" icon={BarChart} title="Motor de Gráficos" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SelectControl label="Tipo Padrão" options={[{id: 'bar', label: 'Barra'}, {id: 'line', label: 'Linha'}, {id: 'area', label: 'Área'}]} value={draft.chartType} onChange={(v: any) => updateDraft('chartType', v)} />
                    <SliderControl label="Espessura Linha" value={draft.chartThickness} min={1} max={8} onChange={(v: any) => updateDraft('chartThickness', v)} suffix="px" />
                </div>
                <div className="flex items-center gap-4 mt-2">
                    <button onClick={() => updateDraft('chartShowGrid', !draft.chartShowGrid)} className={`flex-1 py-2 rounded-lg text-[8px] font-black uppercase transition-all ${draft.chartShowGrid ? 'bg-white/10 text-white' : 'bg-white/5 text-white/20'}`}>Grid Visível</button>
                    <button onClick={() => updateDraft('chartSmoothing', !draft.chartSmoothing)} className={`flex-1 py-2 rounded-lg text-[8px] font-black uppercase transition-all ${draft.chartSmoothing ? 'bg-white/10 text-white' : 'bg-white/5 text-white/20'}`}>Suavização</button>
                </div>
            </Section>
        </>
    );
};
