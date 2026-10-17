import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../../src/styles/_elements.css';
import { SarakUIProvider } from '../../src/core/Provider/SarakUIProvider';

const CHART_TYPES = ['area', 'bar', 'pie', 'scatter', 'gauge', 'radar', 'heatmap'] as const;
const CHART_DATA = [
    { name: 'Alpha', value: 12 },
    { name: 'Beta', value: 24 },
    { name: 'Gamma', value: 36 },
];

function resolveDesign(): Record<string, unknown> {
    const parameters = new URLSearchParams(window.location.search);
    const design: Record<string, unknown> = { mode: 'dark', btnStyleType: 'matte' };

    if (parameters.get('case') === 'catalog') {
        const catalogProfiles: Record<string, Record<string, number>> = {
            offset: { actionGlowShadowOffsetY: 31 },
            blur: { actionGlowShadowBlur: 45 },
            spread: { actionGlowShadowSpread: 2 },
            extreme: { actionGlowShadowOffsetY: 31, actionGlowShadowBlur: 45, actionGlowShadowSpread: 2 },
        };
        Object.assign(design, catalogProfiles[parameters.get('profile') ?? ''] ?? {});
    }

    if (parameters.get('case') === 'range' && parameters.get('profile') === 'extreme') {
        design.rangeActiveColor = '#e11d48';
    }

    if (parameters.get('case') === 'color-variants') {
        design.primaryColor = '#808040';
        design.colorDepth = parameters.get('profile') === 'depth' ? 3 : 1;
        design.colorVariation = parameters.get('profile') === 'variation' ? 5 : 1;
    }

    return design;
}

async function createMeasurementContent(): Promise<React.ReactElement> {
    const parameters = new URLSearchParams(window.location.search);
    const measurementCase = parameters.get('case');
    const chartType = parameters.get('type');
    if (measurementCase === 'catalog') {
        const { SarakCatalogGrid } = await import('../../src/components/atomic/Templates/SarakCatalogGrid');
        return <SarakCatalogGrid title="Catálogo de medição" items={[]} categories={{ all: 'Todos', apps: 'Aplicativos' }} />;
    }
    if (measurementCase === 'range') {
        const { SarakRangeSlider } = await import('../../src/components/atomic/Inputs/SarakRangeSlider');
        return <SarakRangeSlider label="Faixa de medição" defaultValue={[20, 80]} />;
    }
    if (measurementCase === 'color-variants') {
        return <button type="button" data-testid="theme-hover-probe">Hover do tema</button>;
    }
    if (measurementCase === 'chart' && CHART_TYPES.includes(chartType as typeof CHART_TYPES[number])) {
        const { default: SarakChartEngine } = await import('../../src/components/engines/charts/SarakChartEngine');
        return <div data-chart-type={chartType} style={{ width: '640px', height: '360px' }}>
            <SarakChartEngine type={chartType as typeof CHART_TYPES[number]} data={CHART_DATA} ariaLabel={`Gráfico ${chartType}`} />
        </div>;
    }
    return <main data-testid="invalid-measurement-case" />;
}

function MeasurementRoot(): React.ReactElement {
    const [content, setContent] = useState<React.ReactElement | null>(null);

    useEffect(() => {
        let isMounted = true;
        void createMeasurementContent().then((measurementContent) => {
            if (isMounted) setContent(measurementContent);
        }).catch((error: unknown) => {
            document.body.dataset.measurementError = error instanceof Error ? error.message : String(error);
            throw error;
        });
        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        if (content) document.body.dataset.measurementReady = 'true';
    }, [content]);

    return (
        <SarakUIProvider config={resolveDesign()}>
            <main>{content}</main>
        </SarakUIProvider>
    );
}

createRoot(document.getElementById('root') as HTMLElement).render(<MeasurementRoot />);
