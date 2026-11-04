import React from 'react';
import { SarakSwitch } from '../../../../components/atomic/Inputs/SarakSwitch';
import { SarakBadge } from '../../../../components/atomic/Feedback/SarakBadge';
import { SarakIcon } from '../../../../components/atomic/Icon/SarakIcon';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import type { PresetSampleKind } from '../../../../core/Design/presets/components/registry';
import type { ComponentPreset } from '../../../../core/Design/presets/components/cards';
import { SampleButton, SampleCard, SampleInputStates } from './SampleParts';
import { Frame, MotionSample, PageSample, WidthSample } from './PresetSamplesMotion';

const ICON_NAMES = ['Home', 'Settings', 'User', 'Bell', 'Search', 'FileText'] as const;
const noop = (): void => undefined;
const SWITCH_SAMPLE_ZOOM = 2.5;

/**
 * Barra de progresso e estado vazio desenhados com as variáveis do tema, sem importar `SarakProgress` nem
 * `SarakEmptyState`: importá-los daqui prende os dois ao fecho de boot do consumidor (+1,9 KB gzip medidos).
 */
const ProgressSample: React.FC = () => (
    <div role="presentation" className="w-full overflow-hidden" style={{ height: 'var(--sarak-progress-bar-height, 8px)', borderRadius: 'var(--sarak-progress-bar-radius, 8px)', backgroundColor: 'var(--theme-border)' }}>
        <div className="h-full w-3/5" style={{ backgroundColor: 'var(--theme-primary)', borderRadius: 'inherit' }} />
    </div>
);

const EmptySample: React.FC = () => (
    <Frame className="relative overflow-hidden">
        <div aria-hidden="true" className="absolute rounded-full" style={{ width: 'calc(var(--sarak-empty-state-orb-outer, 500px) / 3)', aspectRatio: '1', backgroundColor: 'var(--theme-primary)', opacity: 0.25, filter: 'blur(calc(var(--sarak-empty-state-orb-blur, 100px) / 4))' }} />
        <div aria-hidden="true" className="absolute rounded-full" style={{ width: 'calc(var(--sarak-empty-state-orb-inner, 300px) / 3)', aspectRatio: '1', backgroundColor: 'var(--theme-secondary, var(--theme-primary-focus))', opacity: 0.3, filter: 'blur(calc(var(--sarak-empty-state-orb-blur, 100px) / 4))' }} />
        <div className="relative rounded-full border border-[var(--theme-border)] p-4" style={{ borderWidth: 'var(--sarak-empty-state-ring-radius, 2rem)' }}><SarakIcon name="FileText" size={28} /></div>
    </Frame>
);

const ModalSample: React.FC = () => {
    const text = useLibraryText();
    return (
        <Frame className="relative">
            <div aria-hidden="true" className="absolute inset-0" style={{ backdropFilter: 'blur(var(--sarak-modal-overlay-blur, 8px))' }} />
            <div className="relative flex w-3/4 flex-col gap-3 border border-[var(--theme-border)] p-4" style={{ borderRadius: 'var(--sarak-modal-border-radius, 16px)', backgroundColor: 'var(--theme-card)' }}>
                <h4 className="text-sm font-bold">{text('sampleCardTitle')}</h4>
                <p className="text-xs opacity-70">{text('fontSampleNumber')}</p>
                <div className="flex justify-end"><SampleButton state="rest" /></div>
            </div>
        </Frame>
    );
};

const NoticeSample: React.FC = () => {
    const text = useLibraryText();
    return (
        <Frame>
            <div className="flex w-full flex-col gap-3">
                <span className="w-fit px-2 py-1 text-xs" style={{ borderRadius: 'var(--sarak-tooltip-radius, 6px)', backgroundColor: 'var(--theme-text-primary)', color: 'var(--theme-body)' }}>{text('sampleCardTitle')}</span>
                <div className="p-3 text-xs" style={{ borderLeft: 'var(--sarak-toast-accent-width, 4px) solid var(--theme-primary)', backgroundColor: 'var(--theme-card)' }}>{text('fontSamplePhrase')}</div>
            </div>
        </Frame>
    );
};

const TableSample: React.FC<{ preset: ComponentPreset }> = ({ preset }) => {
    const text = useLibraryText();
    const striped = preset.design.tableZebraStriping === true;
    return (
        <Frame>
            <table className="w-full overflow-hidden border border-[var(--theme-border)] text-xs" style={{ borderRadius: 'var(--sarak-table-border-radius, 14px)', borderCollapse: 'separate' }}>
                <thead><tr style={{ backgroundColor: 'var(--sarak-table-header-bg, var(--theme-border))' }}><th className="p-[var(--sarak-table-padding,8px)] text-left">{text('sampleCardTitle')}</th><th className="p-[var(--sarak-table-padding,8px)] text-right">{text('fontSampleNumber')}</th></tr></thead>
                <tbody>{[1, 2, 3].map((row) => (
                    <tr key={row} style={{ backgroundColor: striped && row % 2 === 0 ? 'color-mix(in srgb, var(--theme-text-primary) 8%, transparent)' : undefined }}>
                        <td className="p-[var(--sarak-table-padding,8px)]">{text('sampleInputValue')}</td>
                        <td className="p-[var(--sarak-table-padding,8px)] text-right">{row * 12}</td>
                    </tr>
                ))}</tbody>
            </table>
        </Frame>
    );
};

const CHART_POINTS = [4, 7, 5, 9, 6, 10, 8];
const CHART_STEP = 40;

/** O formato desenhado em miniatura com a espessura, a suavização e a grade do preset; a cor é a primária do tema. */
const ChartShape: React.FC<{ kind: string; thickness: number; smooth: boolean }> = ({ kind, thickness, smooth }) => {
    const y = (value: number): number => 60 - value * 5;
    const line = CHART_POINTS.map((value, index) => `${index === 0 ? 'M' : 'L'}${index * CHART_STEP + 20},${y(value)}`).join(' ');
    const join = smooth ? 'round' : 'miter';
    if (kind === 'bar') return <>{CHART_POINTS.map((value, index) => <rect key={index} x={index * CHART_STEP + 10} y={y(value)} width={10 + thickness * 2} height={60 - y(value)} fill="var(--theme-primary)" />)}</>;
    if (kind === 'scatter') return <>{CHART_POINTS.map((value, index) => <circle key={index} cx={index * CHART_STEP + 20} cy={y(value)} r={1 + thickness} fill="var(--theme-primary)" />)}</>;
    if (kind === 'radar') {
        const points = CHART_POINTS.map((value, index) => {
            const angle = (index / CHART_POINTS.length) * Math.PI * 2 - Math.PI / 2;
            return `${120 + Math.cos(angle) * value * 3},${32 + Math.sin(angle) * value * 2.6}`;
        }).join(' ');
        return <polygon points={points} fill="none" stroke="var(--theme-primary)" strokeWidth={thickness} strokeLinejoin={join} />;
    }
    return (
        <>
            {kind === 'area' && <path d={`${line} L260,60 L20,60 Z`} fill="var(--theme-primary)" opacity="0.18" />}
            <path d={line} fill="none" stroke="var(--theme-primary)" strokeWidth={thickness} strokeLinejoin={join} strokeLinecap={smooth ? 'round' : 'butt'} />
        </>
    );
};

const ChartSample: React.FC<{ preset: ComponentPreset }> = ({ preset }) => {
    const kind = String(preset.design.chartType ?? 'area');
    return (
        <Frame>
            <svg data-sample-chart={kind} viewBox="0 0 280 64" className="h-28 w-full" aria-hidden="true">
                {preset.design.chartShowGrid !== false && [16, 32, 48].map((line) => <line key={line} x1="0" x2="280" y1={line} y2={line} stroke="currentColor" opacity={Math.min(0.9, Number(preset.design.chartGridOpacity ?? 0.1) * 3)} />)}
                <ChartShape kind={kind} thickness={Number(preset.design.chartThickness ?? 2)} smooth={preset.design.chartSmoothing !== false} />
            </svg>
        </Frame>
    );
};

const FontSample: React.FC = () => {
    const text = useLibraryText();
    return (
        <Frame className="flex-col items-start gap-2">
            <h1 data-testid="font-sample-title" className="text-5xl">{text('fontSampleTitle')}</h1>
            <h2 className="text-xl">{text('sampleCardTitle')}</h2>
            <p>{text('fontSamplePhrase')}</p>
        </Frame>
    );
};

/**
 * Os dois interruptores, ampliados para a miniatura mostrar o trilho, sobre um palco escuro no modo claro: o trilho
 * desligado é da cor do cartão e o ligado é a cor primária, e os dois somem sobre o fundo claro (contraste abaixo de 3:1).
 */
const SwitchStage: React.FC = () => (
    <div className="rounded-[var(--sarak-card-radius,10px)] p-6 [.light_&]:bg-[color-mix(in_srgb,var(--sarak-text-main)_88%,var(--sarak-bg-base))]">
        <span className="inline-flex gap-4" style={{ zoom: SWITCH_SAMPLE_ZOOM }}>
            <SarakSwitch aria-label="on" checked readOnly onChange={noop} />
            <SarakSwitch aria-label="off" checked={false} readOnly onChange={noop} />
        </span>
    </div>
);

const SAMPLES: Record<PresetSampleKind, (props: { preset: ComponentPreset }) => React.ReactElement> = {
    bar: () => <Frame>{null}</Frame>,
    width: ({ preset }) => <WidthSample preset={preset} />,
    card: () => <Frame><div className="w-full" style={{ maxWidth: 'var(--sarak-preset-mini-card-max-width,280px)' }}><SampleCard /></div></Frame>,
    cardTexture: () => <Frame><div className="w-full" style={{ maxWidth: 'var(--sarak-preset-mini-card-max-width,280px)' }}><SampleCard /></div></Frame>,
    surface: () => <Frame className="flex-col gap-3"><div className="w-full" style={{ maxWidth: 'var(--sarak-preset-mini-card-max-width,280px)' }}><SampleCard /></div><SampleInputStates /></Frame>,
    glass: () => (
        <Frame className="relative overflow-hidden">
            <div aria-hidden="true" className="absolute inset-0" style={{ background: 'linear-gradient(135deg, var(--theme-primary), var(--theme-secondary, var(--theme-primary-focus)))' }} />
            <div className="sarak-glass relative w-3/4 p-6 text-sm"><SampleButton state="rest" /></div>
        </Frame>
    ),
    atmosphere: () => <Frame><SampleButton state="rest" /></Frame>,
    texture: () => <Frame><SampleButton state="rest" /></Frame>,
    button: () => <Frame><SampleButton state="rest" /></Frame>,
    input: () => <SampleInputStates />,
    table: ({ preset }) => <TableSample preset={preset} />,
    chart: ({ preset }) => <ChartSample preset={preset} />,
    modal: () => <ModalSample />,
    notice: () => <NoticeSample />,
    switch: () => <Frame><SwitchStage /></Frame>,
    scroll: () => (
        <Frame>
            <div data-sample-scroll="" className="sarak-scrollbar h-28 w-full overflow-y-scroll rounded-[var(--sarak-card-radius,10px)] border border-[var(--theme-border)] p-3 text-xs">
                {Array.from({ length: 12 }, (_, index) => <p key={index}>{index + 1} — Lorem ipsum</p>)}
            </div>
        </Frame>
    ),
    badge: () => <Frame className="flex-col gap-4"><div className="flex gap-2"><SarakBadge variant="success">OK</SarakBadge><SarakBadge variant="warning">!</SarakBadge><SarakBadge variant="danger">×</SarakBadge></div><div className="w-full"><ProgressSample /></div></Frame>,
    empty: () => <EmptySample />,
    motion: () => <MotionSample />,
    page: ({ preset }) => <PageSample preset={preset} />,
    icons: () => <Frame className="gap-4">{ICON_NAMES.map((name) => <SarakIcon key={name} name={name} size={24} />)}</Frame>,
    fontPair: () => <FontSample />,
    typeScale: () => <FontSample />,
    font: () => <FontSample />,
};

/** O desenho de uma opção: o componente real quando a lib tem um que caiba numa miniatura, e a proporção desenhada quando não tem. */
export const PresetSample: React.FC<{ kind: PresetSampleKind; preset: ComponentPreset }> = ({ kind, preset }) => {
    const Sample = SAMPLES[kind];
    return <Sample preset={preset} />;
};
