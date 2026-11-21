import React, { Suspense } from 'react';
import { SarakSwitch } from '../../../../components/atomic/Inputs/SarakSwitch';
import { SarakIcon } from '../../../../components/atomic/Icon/SarakIcon';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import type { PresetSampleKind } from '../../../../core/Design/presets/components/registry';
import type { ComponentPreset } from '../../../../core/Design/presets/components/cards';
import { SampleButton, SampleInputStates, SampleTitleCard } from './SampleParts';
import { Frame, MotionSample, PageSample, WidthSample } from './PresetSamplesMotion';

/**
 * Gráfico, tabela, selo e progresso e estado vazio são o componente real da lib. O módulo deles carrega só quando uma destas
 * amostras entra na área visível; até lá o quadro vazio segura o lugar.
 */
const lazySample = (pick: (module: typeof import('./PresetSamplesReal')) => React.FC): React.LazyExoticComponent<React.FC> =>
    React.lazy(() => import('./PresetSamplesReal').then((module) => ({ default: pick(module) })));
const RealChart = lazySample((module) => module.ChartSample);
const RealTable = lazySample((module) => module.TableSample);
const RealProgress = lazySample((module) => module.ProgressSample);
const RealEmpty = lazySample((module) => module.EmptySample);
const Real: React.FC<{ children: React.ReactNode }> = ({ children }) => <Suspense fallback={<Frame><span data-sample-loading="" aria-hidden="true" /></Frame>}>{children}</Suspense>;

const ICON_NAMES = ['Home', 'Settings', 'User', 'Bell', 'Search', 'FileText'] as const;
const noop = (): void => undefined;
const SWITCH_SAMPLE_ZOOM = 2.5;

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
    card: () => <Frame><SampleTitleCard /></Frame>,
    cardTexture: () => <Frame><SampleTitleCard /></Frame>,
    surface: () => <Frame><SampleTitleCard /></Frame>,
    glass: () => (
        <Frame className="relative overflow-hidden">
            <div aria-hidden="true" className="absolute inset-0" style={{ background: 'linear-gradient(135deg, var(--theme-primary), var(--theme-secondary, var(--theme-primary-focus)))' }} />
            <div className="sarak-glass relative w-3/4 p-6 text-sm"><SampleButton state="rest" /></div>
        </Frame>
    ),
    // Atmosfera e textura são o fundo: nada por cima do que se quer ver.
    atmosphere: () => <Frame><span aria-hidden="true" /></Frame>,
    texture: () => <Frame><span aria-hidden="true" /></Frame>,
    button: () => <Frame><SampleButton state="rest" /></Frame>,
    input: () => <SampleInputStates />,
    table: () => <Real><RealTable /></Real>,
    chart: () => <div className="flex w-full justify-center p-2"><Real><RealChart /></Real></div>,
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
    badge: () => <Real><RealProgress /></Real>,
    empty: () => <Real><RealEmpty /></Real>,
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
