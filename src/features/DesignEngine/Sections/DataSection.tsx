import { BarChart3, Palette, Grid, Activity } from 'lucide-react';
import { Section, SelectControl, SliderControl } from '../components/DesignControls';

interface DashboardSectionProps {
    draft: any;
    updateDraft: (key: string, value: any) => void;
    activeSection: string | null;
    setActiveSection: (id: string | null) => void;
}

export const DataSection: React.FC<DashboardSectionProps> = ({ draft, updateDraft, activeSection, setActiveSection }) => {
    return (
        <>
            <Section id="chart-visuals" icon={BarChart3} title="Visualização de Dados" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SelectControl 
                        label="Estilo do Gráfico" 
                        options={[
                            {id: 'flat', label: 'Flat'}, 
                            {id: 'glow', label: 'Neon Glow'}, 
                            {id: 'gradient', label: 'Gradiente'}
                        ]} 
                        value={draft.chartStyle || 'glow'} 
                        onChange={(v: any) => updateDraft('chartStyle', v)} 
                    />
                    <SelectControl 
                        label="Paleta de Cores" 
                        options={[
                            {id: 'standard', label: 'Sarak Standard'}, 
                            {id: 'vibrant', label: 'Vibrant Data'}, 
                            {id: 'monochrome', label: 'Monochrome Tech'}
                        ]} 
                        value={draft.chartPalette || 'standard'} 
                        onChange={(v: any) => updateDraft('chartPalette', v)} 
                    />
                </div>
            </Section>

            <Section id="chart-geometry" icon={Grid} title="Geometria & Grid" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SelectControl 
                        label="Tipo Padrão" 
                        options={[
                            {id: 'bar', label: 'Barras'}, 
                            {id: 'line', label: 'Linhas'}, 
                            {id: 'area', label: 'Área'}, 
                            {id: 'pie', label: 'Pizza'}, 
                            {id: 'gauge', label: 'Gauge'}
                        ]} 
                        value={draft.chartType || 'bar'} 
                        onChange={(v: any) => updateDraft('chartType', v)} 
                    />
                    <SliderControl 
                        label="Espessura da Linha" 
                        value={draft.chartThickness || 2} 
                        min={1} 
                        max={10} 
                        onChange={(v: any) => updateDraft('chartThickness', v)} 
                        suffix="px" 
                    />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <button 
                        onClick={() => updateDraft('chartShowGrid', !draft.chartShowGrid)} 
                        className={`py-2 rounded-lg text-3xs font-black uppercase transition-all ${draft.chartShowGrid ? 'bg-[var(--theme-primary)] text-white' : 'bg-white/5 text-white/20'}`}
                    >
                        Grid {draft.chartShowGrid ? 'Visível' : 'Oculto'}
                    </button>
                    <button 
                        onClick={() => updateDraft('chartSmoothing', !draft.chartSmoothing)} 
                        className={`py-2 rounded-lg text-3xs font-black uppercase transition-all ${draft.chartSmoothing ? 'bg-[var(--theme-primary)] text-white' : 'bg-white/5 text-white/20'}`}
                    >
                        {draft.chartSmoothing ? 'Suavizado' : 'Angular'}
                    </button>
                </div>
            </Section>

            <Section id="data-tables" icon={Activity} title="Motores de Tabela" activeSection={activeSection} onToggle={setActiveSection}>
                <SelectControl 
                    label="Densidade da Tabela" 
                    options={[
                        {id: 'compact', label: 'Compacta'}, 
                        {id: 'standard', label: 'Padrão'}, 
                        {id: 'spacious', label: 'Espaçosa'}
                    ]} 
                    value={draft.tableDensity || 'standard'} 
                    onChange={(v: any) => updateDraft('tableDensity', v)} 
                />
            </Section>

            <Section id="flow-dynamics" icon={Grid} title="Motores de Fluxo (Flow)" activeSection={activeSection} onToggle={setActiveSection}>
                <div className="grid grid-cols-2 gap-4">
                    <SelectControl 
                        label="Estilo do Grid" 
                        options={[
                            {id: 'dots', label: 'Pontos'}, 
                            {id: 'lines', label: 'Linhas'}, 
                            {id: 'none', label: 'Nenhum'}
                        ]} 
                        value={draft.flowGridStyle || 'dots'} 
                        onChange={(v: any) => updateDraft('flowGridStyle', v)} 
                    />
                    <SliderControl 
                        label="Raio do Nó" 
                        value={draft.flowNodeRadius || 12} 
                        min={4} 
                        max={32} 
                        onChange={(v: any) => updateDraft('flowNodeRadius', v)} 
                        suffix="px" 
                    />
                </div>
            </Section>
        </>
    );
};

