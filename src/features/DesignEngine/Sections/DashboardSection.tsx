import React from 'react';
import { BarChart3, Palette, Grid } from 'lucide-react';
import { Section, SelectControl, SliderControl } from '../components/DesignControls';

interface DashboardSectionProps {
    draft: any;
    updateDraft: (key: string, value: any) => void;
    activeSection: string | null;
    setActiveSection: (id: string | null) => void;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({ draft, updateDraft, activeSection, setActiveSection }) => {
    return (
        <>
            <Section id="chart-visuals" icon={BarChart3} title="Motores de Gráficos" activeSection={activeSection} onToggle={setActiveSection}>
                <SelectControl label="Estilo Visual" options={[{id: 'echarts', label: 'ECharts Pro'}, {id: 'glass', label: 'Glassmorphism'}, {id: 'minimal', label: 'Minimalista'}]} value={draft.chartStyle} onChange={(v: any) => updateDraft('chartStyle', v)} />
                <SelectControl label="Paleta de Cores" options={[{id: 'standard', label: 'Padrão Sarak'}, {id: 'vibrant', label: 'Vibrante'}, {id: 'monochrome', label: 'Monocromático'}]} value={draft.chartPalette} onChange={(v: any) => updateDraft('chartPalette', v)} />
            </Section>

            <Section id="chart-geometry" icon={Grid} title="Geometria & Grid" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SelectControl label="Tipo Padrão" options={[{id: 'bar', label: 'Barras'}, {id: 'line', label: 'Linhas'}, {id: 'area', label: 'Área'}, {id: 'pie', label: 'Pizza'}, {id: 'gauge', label: 'Gauge'}]} value={draft.chartType} onChange={(v: any) => updateDraft('chartType', v)} />
                    <SliderControl label="Espessura" value={draft.chartThickness || 2} min={1} max={10} onChange={(v: any) => updateDraft('chartThickness', v)} suffix="px" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => updateDraft('chartShowGrid', !draft.chartShowGrid)} className={`py-2 rounded-lg text-[8px] font-black uppercase transition-all ${draft.chartShowGrid ? 'bg-[var(--theme-primary)] text-white' : 'bg-white/5 text-white/20'}`}>
                        {draft.chartShowGrid ? 'Grid Visível' : 'Ocultar Grid'}
                    </button>
                    <button onClick={() => updateDraft('chartSmoothing', !draft.chartSmoothing)} className={`py-2 rounded-lg text-[8px] font-black uppercase transition-all ${draft.chartSmoothing ? 'bg-[var(--theme-primary)] text-white' : 'bg-white/5 text-white/20'}`}>
                        {draft.chartSmoothing ? 'Suavizado' : 'Angular'}
                    </button>
                </div>
            </Section>
        </>
    );
};
