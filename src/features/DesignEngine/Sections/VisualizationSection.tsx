import React from 'react';
import { Box, Globe, Sun, Zap } from 'lucide-react';
import { Section, SelectControl, SliderControl } from '../components/DesignControls';

interface VisualizationSectionProps {
    draft: any;
    updateDraft: (key: string, value: any) => void;
    activeSection: string | null;
    setActiveSection: (id: string | null) => void;
}

export const VisualizationSection: React.FC<VisualizationSectionProps> = ({ draft, updateDraft, activeSection, setActiveSection }) => {
    return (
        <>
            <Section id="visuals-3d-showcase" icon={Box} title="3D & Digital Twin" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="p-4 bg-[var(--theme-primary)]/5 rounded-2xl border border-[var(--theme-primary)]/20 mb-4">
                    <p className="text-[10px] font-bold text-[var(--theme-primary)] uppercase leading-relaxed">
                        Este módulo governa a representação volumétrica e geoespacial. As variações abaixo demonstram a capacidade de renderização industrial da Sarak.
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <SelectControl 
                        label="Fidelidade de Malha" 
                        options={[{id: 'low', name: 'Performance'}, {id: 'high', name: 'Ultra (HD)'}]} 
                        value={draft.v3dQuality || 'high'} 
                        onChange={(v: any) => updateDraft('v3dQuality', v)} 
                    />
                    <SliderControl label="Rotação Auto" value={draft.v3dRotateSpeed || 1.0} min={0} max={5} step={0.1} onChange={(v: any) => updateDraft('v3dRotateSpeed', v)} />
                </div>
            </Section>

            <Section id="geo-intelligence" icon={Globe} title="Inteligência Geoespacial" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SelectControl 
                        label="Base de Mapa" 
                        options={[{id: 'dark', name: 'Industrial Dark'}, {id: 'topo', name: 'Topographic'}]} 
                        value={draft.mapStyle || 'dark'} 
                        onChange={(v: any) => updateDraft('mapStyle', v)} 
                    />
                    <SliderControl label="Intensidade Atmosfera" value={draft.atmosphereIntensity || 0.5} min={0} max={1} step={0.1} onChange={(v: any) => updateDraft('atmosphereIntensity', v)} />
                </div>
                <div className="flex flex-col gap-1 mt-4">
                    <span className="text-3xs font-black uppercase tracking-widest text-white/40">Sincronização GPS</span>
                    <button 
                        onClick={() => updateDraft('gpsSync', !draft.gpsSync)}
                        className={`py-2 rounded-lg text-3xs font-black uppercase transition-all ${draft.gpsSync ? 'bg-[var(--theme-primary)] text-white' : 'bg-white/5 text-white/40'}`}
                    >
                        {draft.gpsSync ? 'Ativo (Real-time)' : 'Simulado'}
                    </button>
                </div>
            </Section>
        </>
    );
};
