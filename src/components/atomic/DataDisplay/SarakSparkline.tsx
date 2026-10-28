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

export type SarakSparklineVariant = 'line' | 'area' | 'bar';
export type SarakSparklineBaseline = 'auto' | 'zero';

export interface SarakSparklineProps {
    /** Série de valores. Vazia ou com 1 ponto degrada para um traço plano/único. */
    data: number[];
    /** Forma do micro-gráfico (default: 'line'). */
    variant?: SarakSparklineVariant;
    /** Altura em px do desenho (default: 40). A largura preenche o contêiner. */
    height?: number;
    /** Espessura do traço (line/area) em px (default: 2). */
    strokeWidth?: number;
    /** Opacidade do preenchimento da área (default: 0.15). */
    fillOpacity?: number;
    /** `'auto'` (padrão) ajusta a escala ao mínimo e máximo; `'zero'` fixa o zero na escala e desenha a linha de base. */
    baseline?: SarakSparklineBaseline;
    /** Descrição acessível do gráfico (vira `<title>` + `aria-label`). */
    label?: string;
    className?: string;
    style?: React.CSSProperties;
}

/** Espaço de coordenadas horizontal fixo; o SVG escala para a largura real do pai. */
const VIEW_W = 100;
/** Cor da série: token de gráfico → primária global → fallback de segurança. */
const SERIES_COLOR = 'var(--sarak-chart-primary, var(--sarak-primary-color,#19e3f0))';

/** Escala vertical: `zero` inclui o zero no intervalo para que a linha de base exista. */
const toScale = (data: number[], baseline: SarakSparklineBaseline): { min: number; span: number } => {
    const max = baseline === 'zero' ? Math.max(0, ...data) : Math.max(...data);
    const min = baseline === 'zero' ? Math.min(0, ...data) : Math.min(...data);
    return { min, span: max - min || 1 };
};

/** Coordenada Y (invertida) de um valor dentro da janela útil. */
const toY = (value: number, scale: { min: number; span: number }, height: number, pad: number): number =>
    pad + (1 - (value - scale.min) / scale.span) * Math.max(height - pad * 2, 1);

/** Normaliza cada valor para a coordenada Y dentro da janela útil. */
const toPoints = (data: number[], scale: { min: number; span: number }, height: number, pad: number): Array<[number, number]> => {
    const step = data.length > 1 ? VIEW_W / (data.length - 1) : 0;
    return data.map((value, index) => [data.length > 1 ? index * step : VIEW_W / 2, toY(value, scale, height, pad)]);
};

const SarakSparkline: React.FC<SarakSparklineProps> = ({
    data,
    variant = 'line',
    height = 40,
    strokeWidth = 2,
    fillOpacity = 0.15,
    baseline = 'auto',
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
    const scale = toScale(data, baseline);
    const points = toPoints(data, scale, height, pad);
    const zeroY = toY(0, scale, height, pad);
    const linePath = points.map(([x, y]) => `${x},${y}`).join(' ');
    const areaPath = `${pad === 0 ? 0 : ''}${points.map(([x, y]) => `${x},${y}`).join(' ')} ${VIEW_W},${height} 0,${height}`;

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

            {baseline === 'zero' && (
                <line
                    data-sarak-sparkline-baseline="true"
                    x1={0}
                    x2={VIEW_W}
                    y1={zeroY}
                    y2={zeroY}
                    stroke="var(--sarak-text-muted, currentColor)"
                    strokeOpacity={0.5}
                    strokeDasharray="2 2"
                    vectorEffect="non-scaling-stroke"
                />
            )}

            {variant === 'bar' &&
                data.map((value, index) => {
                    const barW = (VIEW_W / data.length) * 0.7;
                    const gap = (VIEW_W / data.length) * 0.15;
                    const x = index * (VIEW_W / data.length) + gap;
                    const valueY = toY(value, scale, height, pad);
                    const barTop = baseline === 'zero' ? Math.min(valueY, zeroY) : valueY;
                    const barBottom = baseline === 'zero' ? Math.max(valueY, zeroY) : height - pad;
                    return (
                        <rect
                            key={index}
                            x={x}
                            y={barTop}
                            width={barW}
                            height={Math.max(barBottom - barTop, 0.5)}
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
