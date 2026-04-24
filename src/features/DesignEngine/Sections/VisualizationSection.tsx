import React from 'react';
import { Box, Globe, Sun, Maximize } from 'lucide-react';
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
            <Section id="engine-3d" icon={Box} title="3D Viewport (Motor 3D)" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SelectControl 
                        label="Qualidade Render" 
                        options={[{id: 'low', label: 'Performance'}, {id: 'medium', label: 'Equilibrado'}, {id: 'high', label: 'Ultra (Raytracing)'}]} 
                        value={draft.v3dQuality || 'medium'} 
                        onChange={(v: any) => updateDraft('v3dQuality', v)} 
                    />
                    <SliderControl label="FOV (Campo de Visão)" value={draft.v3dFov || 45} min={30} max={90} onChange={(v: any) => updateDraft('v3dFov', v)} suffix="°" />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <SliderControl label="Intensidade Luz" value={draft.v3dLightIntensity || 1.0} min={0} max={2} step={0.1} onChange={(v: any) => updateDraft('v3dLightIntensity', v)} />
                    <button 
                        onClick={() => updateDraft('v3dAutoRotate', !draft.v3dAutoRotate)}
                        className={`py-2 rounded-lg text-3xs font-black uppercase transition-all ${draft.v3dAutoRotate ? 'bg-[var(--theme-primary)] text-white' : 'bg-white/5 text-white/40'}`}
                    >
                        Auto-Rotate {draft.v3dAutoRotate ? 'On' : 'Off'}
                    </button>
                </div>
            </Section>

            <Section id="engine-maps" icon={Globe} title="Geolocalização (Mapas)" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SelectControl 
                        label="Estilo do Mapa" 
                        options={[{id: 'dark', label: 'Dark Matter'}, {id: 'satellite', label: 'Satélite'}, {id: 'minimal', label: 'Minimal'}]} 
                        value={draft.mapStyle || 'dark'} 
                        onChange={(v: any) => updateDraft('mapStyle', v)} 
                    />
                    <SliderControl label="Zoom Inicial" value={draft.mapZoom || 12} min={1} max={20} onChange={(v: any) => updateDraft('mapZoom', v)} />
                </div>
                <div className="flex flex-col gap-1 mt-4">
                    <span className="text-3xs font-black uppercase tracking-widest text-white/40">Exibir Relevo 3D</span>
                    <button 
                        onClick={() => updateDraft('mapShowTerrain', !draft.mapShowTerrain)}
                        className={`py-2 rounded-lg text-3xs font-black uppercase transition-all ${draft.mapShowTerrain ? 'bg-[var(--theme-primary)] text-white' : 'bg-white/5 text-white/40'}`}
                    >
                        {draft.mapShowTerrain ? 'Ativado' : 'Desativado'}
                    </button>
                </div>
            </Section>
        </>
    );
};
