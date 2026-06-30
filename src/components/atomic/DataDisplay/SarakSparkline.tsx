/**
 * SarakSparkline — micro-gráfico sem eixos (Spec 12, Regra 4 · Onda 9)
 *
 * Visualização minimalista (linha/área/barra) que cabe no espaço confinado de um
 * `<SarakCard>` (Critério de Aceite 5). In-house em SVG puro: **zero dependência
 * nova** (as Ondas 7–9 não adicionam libs). Zero Hardcode: a cor da série herda dos
 * tokens globais — `--sarak-chart-primary` (Spec 12 / schema `data.ts`) com cascata
 * para `var(--sarak-primary-color,#3b82f6)`. O traço usa `vector-effect: non-scaling-stroke`
 * para permanecer nítido mesmo quando o SVG é esticado na largura do contêiner.
 */

import React, { useId } from 'react';

export type SparklineVariant = 'line' | 'area' | 'bar';

export interface SarakSparklineProps {
    /** Série de valores. Vazia ou com 1 ponto degrada para um traço plano/único. */
    data: number[];
    /** Forma do micro-gráfico (default: 'line'). */
    variant?: SparklineVariant;
    /** Altura em px do desenho (default: 40). A largura preenche o contêiner. */
    height?: number;
    /** Espessura do traço (line/area) em px (default: 2). */
    strokeWidth?: number;
    /** Opacidade do preenchimento da área (default: 0.15). */
    fillOpacity?: number;
    /** Descrição acessível do gráfico (vira `<title>` + `aria-label`). */
    label?: string;
    className?: string;
    style?: React.CSSProperties;
}

/** Espaço de coordenadas horizontal fixo; o SVG escala para a largura real do pai. */
const VIEW_W = 100;
/** Cor da série: token de gráfico → primária global → fallback de segurança. */
const SERIES_COLOR = 'var(--sarak-chart-primary, var(--sarak-primary-color,#3b82f6))';

/** Normaliza cada valor para a coordenada Y (invertida) dentro da janela útil. */
const toPoints = (data: number[], height: number, pad: number): Array<[number, number]> => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const span = max - min || 1;
    const usable = Math.max(height - pad * 2, 1);
    const step = data.length > 1 ? VIEW_W / (data.length - 1) : 0;
    return data.map((value, index) => {
        const x = data.length > 1 ? index * step : VIEW_W / 2;
        const y = pad + (1 - (value - min) / span) * usable;
        return [x, y];
    });
};

const SarakSparkline: React.FC<SarakSparklineProps> = ({
    data,
    variant = 'line',
    height = 40,
    strokeWidth = 2,
    fillOpacity = 0.15,
    label,
    className,
    style,
}) => {
    const titleId = useId();

    if (!data || data.length === 0) {
        return (
            <svg
                role="img"
                aria-label={label ?? 'Sparkline vazio'}
                data-sarak-sparkline="empty"
                width="100%"
                height={height}
                className={className}
                style={style}
            />
        );
    }

    const pad = strokeWidth;
    const points = toPoints(data, height, pad);
    const linePath = points.map(([x, y]) => `${x},${y}`).join(' ');
    const areaPath = `${pad === 0 ? 0 : ''}${points.map(([x, y]) => `${x},${y}`).join(' ')} ${VIEW_W},${height} 0,${height}`;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const span = max - min || 1;

    return (
        <svg
            role="img"
            aria-label={label}
            aria-labelledby={label ? undefined : titleId}
            data-sarak-sparkline={variant}
            width="100%"
            height={height}
            viewBox={`0 0 ${VIEW_W} ${height}`}
            preserveAspectRatio="none"
            className={className}
            style={style}
        >
            {label ? <title>{label}</title> : <title id={titleId}>Sparkline</title>}

            {variant === 'bar' &&
                data.map((value, index) => {
                    const barW = (VIEW_W / data.length) * 0.7;
                    const gap = (VIEW_W / data.length) * 0.15;
                    const x = index * (VIEW_W / data.length) + gap;
                    const usable = Math.max(height - pad * 2, 1);
                    const barH = ((value - min) / span) * usable;
                    return (
                        <rect
                            key={index}
                            x={x}
                            y={height - pad - barH}
                            width={barW}
                            height={Math.max(barH, 0.5)}
                            fill={SERIES_COLOR}
                            fillOpacity={0.85}
                        />
                    );
                })}

            {variant === 'area' && (
                <polygon points={areaPath} fill={SERIES_COLOR} fillOpacity={fillOpacity} stroke="none" />
            )}

            {(variant === 'line' || variant === 'area') && (
                <polyline
                    points={linePath}
                    fill="none"
                    stroke={SERIES_COLOR}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                />
            )}
        </svg>
    );
};

export default SarakSparkline;
