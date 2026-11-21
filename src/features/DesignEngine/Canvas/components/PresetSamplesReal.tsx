import React, { Suspense } from 'react';
import { SarakBadge } from '../../../../components/atomic/Feedback/SarakBadge';
import { SarakEmptyState } from '../../../../components/atomic/Feedback/SarakEmptyState';
import { SarakProgress } from '../../../../components/atomic/Feedback/SarakProgress';
import { SarakDataTable, type SarakColumn } from '../../../../components/atomic/DataDisplay/SarakDataTable';
import { SarakChartEngine } from '../../../../components/engines/charts';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';

/**
 * As amostras que são o componente REAL da lib (gráfico, tabela, selo e progresso, estado vazio). Ficam num módulo à parte,
 * carregado só quando uma amostra destas entra na área visível: importá-las de `PresetSamples.tsx` prenderia o motor de
 * gráfico, a tabela e o estado vazio ao fecho de boot do consumidor.
 */

/** O quadro do gráfico da amostra, em px: o motor tem espaçamento interno fixo e abaixo disto o desenho não lê. */
export const CHART_SAMPLE_FRAME = { width: 300, height: 220 } as const;
const CHART_DATA = [3, 9, 2, 10, 4, 9, 1].map((value, index) => ({ name: `${index + 1}`, value }));
const CHART_CONFIG = { xAxisKey: 'name', dataKey: 'value', showAnimation: false } as const;
const TABLE_HEIGHT = 176;
const PROGRESS_VALUES = { done: 60, low: 35, lowThreshold: 30 } as const;

/** Um único gráfico, do mesmo tipo em todas as opções: o estilo do preset (traço, curva e grade) é a única diferença entre elas. */
export const ChartSample: React.FC = () => (
    <div data-sample-chart="" style={{ width: CHART_SAMPLE_FRAME.width, height: CHART_SAMPLE_FRAME.height }}>
        <SarakChartEngine type="area" data={CHART_DATA} config={CHART_CONFIG} height={CHART_SAMPLE_FRAME.height} />
    </div>
);

type SampleRow = { id: string; name: string; load: number };

export const TableSample: React.FC = () => {
    const text = useLibraryText();
    const columns: Array<SarakColumn<unknown>> = [
        { id: 'name', header: text('sampleCardTitle'), width: 120 },
        { id: 'load', header: text('fontSampleNumber'), width: 70, align: 'right' },
        { id: 'status', header: 'OK', width: 70, render: () => <SarakBadge variant="success" soft pill>OK</SarakBadge> },
    ];
    const rows: SampleRow[] = [1, 2, 3, 4].map((row) => ({ id: String(row), name: text('sampleInputValue'), load: row * 12 }));
    return (
        <div className="w-full p-4">
            <Suspense fallback={null}>
                <SarakDataTable columns={columns} rows={rows} height={TABLE_HEIGHT} responsive={false} reorderable={false} getRowKey={(row) => (row as SampleRow).id} />
            </Suspense>
        </div>
    );
};

export const ProgressSample: React.FC = () => (
    <div className="flex w-full flex-col gap-3 p-4">
        <div className="flex gap-2">
            <SarakBadge variant="success">OK</SarakBadge>
            <SarakBadge variant="warning">!</SarakBadge>
            <SarakBadge variant="danger">×</SarakBadge>
        </div>
        <SarakProgress value={PROGRESS_VALUES.done} />
        <SarakProgress value={PROGRESS_VALUES.low} thresholds={[{ value: PROGRESS_VALUES.lowThreshold, variant: 'warning' }]} />
    </div>
);

export const EmptySample: React.FC = () => (
    <div className="relative h-full w-full overflow-hidden">
        <SarakEmptyState />
    </div>
);
