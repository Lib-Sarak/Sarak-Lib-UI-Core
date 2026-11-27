import React from 'react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import type { ComponentPreset } from '../../../../core/Design/presets/components/cards';
import { SampleButton } from './SampleParts';
import { Frame } from './PresetSamplesMotion';

/**
 * Amostras ESTÁTICAS dos grupos cuja diferença só existe em movimento ou numa peça fina demais para a miniatura: cada uma
 * desenha o que a opção faz, parado, com a cor lida do tema e a medida lida da opção.
 */

const CURVE_STEPS = 48;
const CURVE_BOX = { width: 240, height: 130, top: 26, bottom: 14, left: 8 } as const;
/** A maior duração das opções de movimento: o comprimento do eixo do tempo é proporcional a ela. */
const LONGEST_DURATION_S = 1.2;
const LINEAR_BEZIER = [0, 0, 1, 1] as const;

/** Os quatro números de um `cubic-bezier(...)`; qualquer outra curva vira a reta. */
const parseBezier = (ease: unknown): readonly number[] => {
    const numbers = /^cubic-bezier\(([^)]+)\)$/.exec(String(ease ?? ''))?.[1].split(',').map(Number) ?? [];
    return numbers.length === 4 && numbers.every(Number.isFinite) ? numbers : LINEAR_BEZIER;
};

const bezierAt = (t: number, p1: number, p2: number): number => 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t ** 2 * p2 + t ** 3;

/** Os pontos (tempo, progresso) da curva de aceleração, com o progresso de 0 a 1 (passa de 1 no ricochete). */
const curvePoints = (bezier: readonly number[]): Array<[number, number]> =>
    Array.from({ length: CURVE_STEPS + 1 }, (_, step) => {
        const t = step / CURVE_STEPS;
        return [bezierAt(t, bezier[0], bezier[2]), bezierAt(t, bezier[1], bezier[3])];
    });

/** O movimento desenhado como curva: o comprimento é a duração e a forma é a aceleração da opção. Sem duração, é um degrau. */
export const MotionCurveSample: React.FC<{ preset: ComponentPreset }> = ({ preset }) => {
    const duration = Number(preset.design.motionDurationSlow ?? 0);
    const plotWidth = CURVE_BOX.width - CURVE_BOX.left;
    const plotHeight = CURVE_BOX.height - CURVE_BOX.top - CURVE_BOX.bottom;
    const baseline = CURVE_BOX.height - CURVE_BOX.bottom;
    const toX = (time: number): number => CURVE_BOX.left + time * plotWidth * (duration / LONGEST_DURATION_S);
    const toY = (progress: number): number => baseline - progress * plotHeight;
    const points: Array<[number, number]> = duration > 0 ? curvePoints(parseBezier(preset.design.motionEaseMain)) : [[0, 0], [0, 1]];
    const line = points.map(([time, progress]) => `${toX(time).toFixed(1)},${toY(progress).toFixed(1)}`).join(' ');
    const reach = duration > 0 ? toX(1) : CURVE_BOX.left;
    const area = `${CURVE_BOX.left},${baseline} ${line} ${reach.toFixed(1)},${baseline}`;
    return (
        <Frame>
            <svg data-sample-motion-curve={duration} viewBox={`0 0 ${CURVE_BOX.width} ${CURVE_BOX.height}`} className="w-full" aria-hidden="true">
                <line x1={CURVE_BOX.left} x2={CURVE_BOX.width} y1={baseline} y2={baseline} stroke="var(--theme-border)" strokeWidth="1.5" />
                <line x1={CURVE_BOX.left} x2={CURVE_BOX.width} y1={toY(1)} y2={toY(1)} stroke="var(--theme-border)" strokeWidth="1" strokeDasharray="3 3" />
                <polygon points={area} fill="var(--theme-primary)" opacity="0.25" />
                <polyline points={line} fill="none" stroke="var(--theme-primary)" strokeWidth="3" strokeLinejoin="round" />
                <circle cx={reach} cy={toY(1)} r="4.5" fill="var(--theme-primary)" />
            </svg>
        </Frame>
    );
};

/** Uma tela pequena: a barra do título e duas linhas de texto. A que entra leva a cor primária; o fantasma é só o contorno de onde ela partiu. */
const MiniScreen: React.FC<{ style: React.CSSProperties; entering?: boolean; ghost?: boolean }> = ({ style, entering = false, ghost = false }) => (
    <div
        aria-hidden="true"
        className="absolute h-[72%] w-[56%] overflow-hidden rounded-[var(--sarak-card-radius,10px)] border p-2"
        style={{
            borderColor: entering || ghost ? 'var(--theme-primary)' : 'var(--theme-border)',
            borderStyle: ghost ? 'dashed' : 'solid',
            backgroundColor: ghost ? 'transparent' : entering ? 'color-mix(in srgb, var(--theme-primary) 35%, var(--theme-card))' : 'var(--theme-card)',
            ...style,
        }}
    >
        <div className="h-2 w-1/2 rounded" style={{ backgroundColor: entering ? 'var(--theme-primary)' : 'var(--theme-border)' }} />
        <div className="mt-2 h-1.5 w-full rounded bg-[var(--theme-border)]" />
        <div className="mt-1.5 h-1.5 w-3/4 rounded bg-[var(--theme-border)]" />
    </div>
);

const CENTER = { left: '22%', top: '14%' } as const;
/** A tela nova em cada transição: de onde parte (fantasma) e onde está no meio do caminho. */
const PAGE_STAGES: Record<string, { from: React.CSSProperties; midway: React.CSSProperties; outgoing: number }> = {
    fade: { from: { ...CENTER, opacity: 0.6 }, midway: { ...CENTER, opacity: 0.55 }, outgoing: 0.55 },
    'slide-up': { from: { left: CENTER.left, top: '70%', opacity: 0.7 }, midway: { left: CENTER.left, top: '42%', opacity: 0.9 }, outgoing: 0.5 },
    'slide-side': { from: { left: '88%', top: CENTER.top, opacity: 0.7 }, midway: { left: '56%', top: CENTER.top, opacity: 0.9 }, outgoing: 0.5 },
    zoom: { from: { ...CENTER, transform: 'scale(0.3)', opacity: 0.7 }, midway: { ...CENTER, transform: 'scale(0.65)', opacity: 0.9 }, outgoing: 0.5 },
    none: { from: { ...CENTER, opacity: 0 }, midway: { ...CENTER, opacity: 1 }, outgoing: 0 },
};

/** A troca de página parada no meio do caminho: a tela que sai, a tela nova a meio da entrada e o fantasma de onde ela partiu. */
export const PageStageSample: React.FC<{ preset: ComponentPreset }> = ({ preset }) => {
    const type = String(preset.design.pageTransitionType ?? 'fade');
    const stage = PAGE_STAGES[type] ?? PAGE_STAGES.fade;
    return (
        <Frame>
            <div data-sample-page={type} className="relative h-40 w-full overflow-hidden rounded-[var(--sarak-card-radius,10px)] border border-[var(--theme-border)]">
                {stage.outgoing > 0 && <MiniScreen style={{ ...CENTER, opacity: stage.outgoing }} />}
                {type !== 'none' && <MiniScreen ghost style={stage.from} />}
                <MiniScreen entering style={stage.midway} />
            </div>
        </Frame>
    );
};

const SCROLL_ZOOM = 6;
const SCROLL_TRACK_HEIGHT = 168;
const scrollPx = (variable: string, fallback: number): string => `calc(var(${variable}, ${fallback}px) * ${SCROLL_ZOOM})`;

/** A barra de rolagem ampliada: o trilho com a opacidade dele e o polegar no meio, com a largura, o raio e o recuo da opção. */
export const ScrollBarSample: React.FC = () => (
    <Frame>
        <div
            data-sample-scrollbar=""
            className="relative outline outline-dashed outline-[var(--theme-border)]"
            style={{
                height: SCROLL_TRACK_HEIGHT,
                width: `calc(${scrollPx('--sarak-scroll-width', 6)} + 2 * ${scrollPx('--sarak-scroll-padding', 2)})`,
                borderRadius: scrollPx('--sarak-scroll-radius', 8),
                backgroundColor: 'color-mix(in srgb, var(--sarak-text-main) calc(var(--sarak-scroll-track-opacity, 0.05) * 100%), transparent)',
            }}
        >
            <div
                className="absolute"
                style={{
                    left: scrollPx('--sarak-scroll-padding', 2),
                    right: scrollPx('--sarak-scroll-padding', 2),
                    top: '30%',
                    height: '40%',
                    borderRadius: scrollPx('--sarak-scroll-radius', 8),
                    backgroundColor: 'color-mix(in srgb, var(--sarak-text-main) calc(var(--sarak-scroll-thumb-opacity, 0.2) * 100%), transparent)',
                }}
            />
        </div>
    </Frame>
);

const HEADER_LAYOUT = { inline: 'inline', stacked: 'stacked', floating: 'floating' } as const;
const ACTION_ALIGN: Record<string, string> = { left: 'justify-start', center: 'justify-center', right: 'justify-end', stretch: 'justify-stretch [&>*]:flex-1' };

/** O fundo da janela: blocos e linhas nítidos, para o desfoque da opção aparecer. */
const BackdropPage: React.FC = () => (
    <div aria-hidden="true" className="absolute inset-0 flex flex-col gap-3 p-4">
        <div className="flex gap-3"><span className="h-10 flex-1 rounded" style={{ backgroundColor: 'var(--theme-primary)' }} /><span className="h-10 flex-1 rounded" style={{ backgroundColor: 'var(--theme-secondary, var(--theme-primary-focus))' }} /></div>
        {[100, 80, 90, 60].map((width) => <span key={width} className="h-2 rounded" style={{ width: `${width}%`, backgroundColor: 'var(--sarak-text-main)' }} />)}
        <span className="h-10 w-2/3 rounded" style={{ backgroundColor: 'var(--theme-primary)' }} />
    </div>
);

/** A janela com o cabeçalho, o alinhamento das ações, o raio e o desfoque do fundo da opção, sobre uma tela de fundo nítida. */
export const ModalWindowSample: React.FC<{ preset: ComponentPreset }> = ({ preset }) => {
    const text = useLibraryText();
    const header = String(preset.design.modalHeaderStyle ?? HEADER_LAYOUT.inline);
    const align = ACTION_ALIGN[String(preset.design.modalActionAlignment ?? 'right')] ?? ACTION_ALIGN.right;
    const title = <h4 className={`text-sm font-bold ${header === 'stacked' ? 'text-center' : ''}`}>{text('sampleCardTitle')}</h4>;
    return (
        <div data-sample-modal={header} className="relative flex min-h-48 w-full items-center justify-center overflow-hidden">
            <BackdropPage />
            <div aria-hidden="true" className="absolute inset-0" style={{ backgroundColor: 'var(--sarak-modal-overlay, transparent)', backdropFilter: 'blur(var(--sarak-modal-blur, 8px))' }} />
            <div className="relative flex w-4/5 flex-col gap-2">
                {header === 'floating' && <div className="px-1">{title}</div>}
                <div data-sample-modal-panel="" className="flex flex-col gap-3 border border-[var(--theme-border)] p-4" style={{ borderRadius: 'var(--sarak-modal-border-radius, 16px)', backgroundColor: 'var(--theme-card)' }}>
                    {header !== 'floating' && title}
                    <p className={`text-xs opacity-70 ${header === 'stacked' ? 'text-center' : ''}`}>{text('fontSampleNumber')}</p>
                    <div className={`flex gap-2 ${align}`}><SampleButton state="rest" /></div>
                </div>
            </div>
        </div>
    );
};
