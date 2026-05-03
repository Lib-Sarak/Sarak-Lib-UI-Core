import { BarChart3, Palette, Grid, Activity } from 'lucide-react';
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
            <Section id="chart-showcase-info" icon={BarChart3} title="Showcase de Visualização" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="p-4 bg-[var(--theme-primary)]/5 rounded-2xl border border-[var(--theme-primary)]/20 mb-4">
                    <p className="text-[10px] font-bold text-[var(--theme-primary)] uppercase leading-relaxed">
                        Esta seção exibe todos os motores de renderização da Sarak. As cores, bordas e atmosfera são herdadas automaticamente das configurações globais do Design Engine.
                    </p>
                </div>
                <SelectControl 
                    label="Paleta de Gráficos" 
                    options={[
                        {id: 'standard', name: 'Sarak Standard'}, 
                        {id: 'vibrant', name: 'Vibrant Data'}, 
                        {id: 'monochrome', name: 'Monochrome Tech'}
                    ]} 
                    value={draft.chartPalette || 'standard'} 
                    onChange={(v: any) => updateDraft('chartPalette', v)} 
                />
            </Section>

            <Section id="dashboard-global" icon={Grid} title="Configurações Globais" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SliderControl label="Opacidade Grid" value={draft.chartFillOpacity || 0.1} min={0} max={1} step={0.05} onChange={(v: any) => updateDraft('chartFillOpacity', v)} />
                    <div className="flex flex-col gap-1">
                        <span className="text-3xs font-black uppercase tracking-widest text-white/40">Grids Técnicos</span>
                        <button 
                            onClick={() => updateDraft('showGridLines', !draft.showGridLines)}
                            className={`py-2 rounded-lg text-3xs font-black uppercase transition-all ${draft.showGridLines ? 'bg-[var(--theme-primary)] text-white' : 'bg-white/5 text-white/40'}`}
                        >
                            {draft.showGridLines ? 'Visíveis' : 'Ocultos'}
                        </button>
                    </div>
                </div>
            </Section>

            <Section id="chart-geometry" icon={Grid} title="Geometria & Grid" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SelectControl label="Tipo Padrão" options={[{id: 'bar', label: 'Barras'}, {id: 'line', label: 'Linhas'}, {id: 'area', label: 'Área'}, {id: 'pie', label: 'Pizza'}, {id: 'gauge', label: 'Gauge'}]} value={draft.chartType} onChange={(v: any) => updateDraft('chartType', v)} />
                    <SliderControl label="Espessura" value={draft.chartThickness || 2} min={1} max={10} onChange={(v: any) => updateDraft('chartThickness', v)} suffix="px" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => updateDraft('chartShowGrid', !draft.chartShowGrid)} className={`py-2 rounded-lg text-3xs font-black uppercase transition-all ${draft.chartShowGrid ? 'bg-[var(--theme-primary)] text-white' : 'bg-white/5 text-white/20'}`}>
                        {draft.chartShowGrid ? 'Grid Visível' : 'Ocultar Grid'}
                    </button>
                    <button onClick={() => updateDraft('chartSmoothing', !draft.chartSmoothing)} className={`py-2 rounded-lg text-3xs font-black uppercase transition-all ${draft.chartSmoothing ? 'bg-[var(--theme-primary)] text-white' : 'bg-white/5 text-white/20'}`}>
                        {draft.chartSmoothing ? 'Suavizado' : 'Angular'}
                    </button>
                </div>
            </Section>

            <Section id="dashboard-tables" icon={Grid} title="Motores de Tabela" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SelectControl 
                        label="Estilo de Zebra" 
                        options={[{id: 'none', label: 'Nenhum'}, {id: 'subtle', label: 'Sutil'}, {id: 'glass', label: 'Vidro'}]} 
                        value={draft.tableZebraStyle || 'none'} 
                        onChange={(v: any) => updateDraft('tableZebraStyle', v)} 
                    />
                    <SliderControl label="Densidade Linha" value={draft.tableRowDensity || 1.0} min={0.5} max={1.5} step={0.1} onChange={(v: any) => updateDraft('tableRowDensity', v)} />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <button 
                        onClick={() => updateDraft('tableStickyHeader', !draft.tableStickyHeader)}
                        className={`py-2 rounded-lg text-3xs font-black uppercase transition-all ${draft.tableStickyHeader ? 'bg-[var(--theme-primary)] text-white' : 'bg-white/5 text-white/40'}`}
                    >
                        Header Fixo {draft.tableStickyHeader ? 'On' : 'Off'}
                    </button>
                    <button 
                        onClick={() => updateDraft('tableShowGrid', !draft.tableShowGrid)}
                        className={`py-2 rounded-lg text-3xs font-black uppercase transition-all ${draft.tableShowGrid ? 'bg-[var(--theme-primary)] text-white' : 'bg-white/5 text-white/40'}`}
                    >
                        Grid Lines {draft.tableShowGrid ? 'On' : 'Off'}
                    </button>
                </div>
            </Section>

            <Section id="flow-dynamics" icon={Grid} title="Motores de Fluxo (Flow)" activeSection={activeSection} onToggle={setActiveSection}>
                <SelectControl label="Estilo do Grid" options={[{id: 'dots', label: 'Pontos (Industrial)'}, {id: 'lines', label: 'Linhas (Matrix)'}, {id: 'none', label: 'Limpo'}]} value={draft.flowGridStyle || 'dots'} onChange={(v: any) => updateDraft('flowGridStyle', v)} />
                <SliderControl label="Raio do Nó" value={draft.flowNodeRadius || 12} min={4} max={32} onChange={(v: any) => updateDraft('flowNodeRadius', v)} suffix="px" />
            </Section>
        </>
    );
};

