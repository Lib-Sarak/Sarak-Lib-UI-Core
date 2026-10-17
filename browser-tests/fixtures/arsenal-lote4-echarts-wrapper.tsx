import React, { useEffect, useRef } from 'react';

interface MeasurementEChartsProps {
    option: unknown;
    style?: React.CSSProperties;
    className?: string;
    onEvents?: Record<string, (event: unknown) => void>;
}

interface MeasurementEChartsInstance {
    setOption(option: unknown): void;
    on(event: string, handler: (event: unknown) => void): void;
    dispose(): void;
}

declare global {
    interface Window {
        echarts: {
            init(container: HTMLElement): MeasurementEChartsInstance;
        };
    }
}

export default function MeasurementECharts({
    option,
    style,
    className = '',
    onEvents = {},
}: MeasurementEChartsProps): React.ReactElement {
    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!container.current) return;
        const chart = window.echarts.init(container.current);
        chart.setOption(option);
        Object.entries(onEvents).forEach(([event, handler]) => chart.on(event, handler));
        return () => chart.dispose();
    }, [option, onEvents]);

    return <div ref={container} className={`echarts-for-react ${className}`} style={style} />;
}
