import React from 'react';
import { motion } from 'framer-motion';
import { SarakIcon } from '../../../../components/atomic/Icon/SarakIcon';
import { SarakChartEngine, type SarakChartEngineProps } from '../../../../components/engines/charts';

interface ChartsMockProps {
    tokens: any;
    config: any;
    animationVariants: any;
    animationStyle: string;
}

type ChartKind = NonNullable<SarakChartEngineProps['type']>;
interface ChartSpecimen { type: ChartKind; title: string; icon: string }

/** Os oito tipos do `chartType` do design, na ordem em que o ajuste fino os lista. */
const SPECIMENS: readonly ChartSpecimen[] = [
    { type: 'line', title: 'Gráfico de Linha (Line)', icon: 'LineChart' },
    { type: 'area', title: 'Gráfico de Área (Area)', icon: 'LineChart' },
    { type: 'bar', title: 'Gráfico de Barras (Bar)', icon: 'BarChart3' },
    { type: 'pie', title: 'Gráfico de Pizza (Pie)', icon: 'PieChart' },
    { type: 'radar', title: 'Teia de Performance (Radar)', icon: 'TrendingUp' },
    { type: 'scatter', title: 'Gráfico de Dispersão (Scatter)', icon: 'ScatterChart' },
    { type: 'heatmap', title: 'Mapa de Calor (Heatmap)', icon: 'LayoutGrid' },
    { type: 'gauge', title: 'Medidor (Gauge)', icon: 'Gauge' },
];

const CHART_HEIGHT = 192;
const SERIES = [40, 80, 55, 95, 70, 30, 85].map((value, index) => ({ name: `${index + 1}`, value }));
const SHARES = [
    { name: 'A', value: 45 }, { name: 'B', value: 25 }, { name: 'C', value: 20 }, { name: 'D', value: 10 },
];
const HEATMAP_CELLS = 25;
const HEATMAP_MAX = 1000;
const HEATMAP_STEP = 137;
/** O mapa de calor lê 5 colunas por linha; os valores sobem em degraus e dão a volta, para a escala de cor aparecer inteira. */
const HEATMAP = Array.from({ length: HEATMAP_CELLS }, (_, index) => ({ name: `${index}`, value: (index * HEATMAP_STEP) % HEATMAP_MAX }));
const GAUGE = [{ name: 'Node Core', value: 65 }];

const DATA: Record<ChartKind, Array<{ name: string; value: number }>> = {
    line: SERIES, area: SERIES, bar: SERIES, scatter: SERIES, radar: SERIES, pie: SHARES, heatmap: HEATMAP, gauge: GAUGE,
} as Record<ChartKind, Array<{ name: string; value: number }>>;

const CONFIG = { xAxisKey: 'name', dataKey: 'value' } as const;

/**
 * A tela "Gráficos" da prévia: cada tipo de `chartType` desenhado pelo `SarakChartEngine` real, todos com o estilo do
 * rascunho (traço, curva e grade). O estilo de um preset de gráfico não escolhe o tipo, e aqui se vê o mesmo estilo em todos.
 * O motor só carrega quando a tela é aberta (o `SarakChartEngine` é uma fronteira lazy).
 */
export const MockCharts: React.FC<ChartsMockProps> = ({ animationVariants }) => (
    <motion.div
        variants={animationVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="w-full h-full flex flex-col gap-6"
    >
        <div className="flex justify-between items-end">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <SarakIcon name="BarChart3" className="text-[var(--theme-primary)]" size={20} />
                    <h2 className="text-2xl font-black text-theme-text uppercase tracking-widest text-left">Advanced Analytics & Charts</h2>
                </div>
                <p className="text-sm text-theme-text/40 uppercase tracking-tighter text-left">Galeria de Múltiplos Espécimes de Gráficos Reativos ao Motor Sarak</p>
            </div>
        </div>

        <div className="grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3 gap-6 auto-rows-auto">
            {SPECIMENS.map(({ type, title, icon }) => (
                <div key={type} data-chart-specimen={type} className="bg-theme-body/40 border border-theme-text/5 p-6 rounded-2xl flex flex-col gap-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted,rgba(242,246,251,0.55))] flex items-center gap-2">
                        <SarakIcon name={icon} size={14} className="text-[var(--theme-primary)]" /> {title}
                    </span>
                    <SarakChartEngine type={type} data={DATA[type]} config={CONFIG} height={CHART_HEIGHT} />
                </div>
            ))}
        </div>
    </motion.div>
);
