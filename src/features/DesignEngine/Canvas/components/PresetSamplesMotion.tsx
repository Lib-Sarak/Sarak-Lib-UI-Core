import React, { useEffect, useState } from 'react';
import type { ComponentPreset } from '../../../../core/Design/presets/components/cards';

const MAX_CONTENT_WIDTH_REFERENCE = 1600;

export const Frame: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`flex min-h-48 w-full items-center justify-center p-6 ${className}`}>{children}</div>
);

/** A largura do conteúdo desenhada como proporção da janela: não há componente que a mostre em miniatura. */
export const WidthSample: React.FC<{ preset: ComponentPreset }> = ({ preset }) => {
    const raw = String(preset.design.maxContentWidth ?? 'fluid');
    const percent = raw.endsWith('px') ? Math.min(100, (Number.parseInt(raw, 10) / MAX_CONTENT_WIDTH_REFERENCE) * 100) : 100;
    return (
        <Frame>
            <div data-sample-width={raw} className="flex h-28 w-full justify-center rounded-[var(--sarak-card-radius,10px)] border border-[var(--theme-border)] p-2">
                <div className="h-full rounded-[var(--sarak-card-radius,10px)] border border-[var(--theme-border)]" style={{ width: `${percent}%`, backgroundColor: 'color-mix(in srgb, var(--theme-primary) 55%, transparent)' }} />
            </div>
        </Frame>
    );
};

/** O quadrado que anda de um lado a outro com a duração e a curva do tema, até o movimento reduzido o parar. */
export const MotionSample: React.FC = () => {
    const [right, setRight] = useState(false);
    useEffect(() => {
        const timer = window.setInterval(() => setRight((current) => !current), 1500);
        return () => window.clearInterval(timer);
    }, []);
    return (
        <Frame>
            <div className="relative h-10 w-full rounded-[var(--sarak-card-radius,10px)] border border-[var(--theme-border)]">
                <div
                    data-sample-motion=""
                    className="absolute h-full w-8 rounded-[var(--sarak-card-radius,10px)]"
                    style={{
                        backgroundColor: 'var(--theme-primary)',
                        left: right ? '100%' : '0',
                        translate: right ? '-100% 0' : '0 0',
                        transition: 'left var(--sarak-motion-dur-slow, 0.6s) var(--sarak-motion-ease-main, ease)',
                    }}
                />
            </div>
        </Frame>
    );
};

/** De onde a tela nova parte em cada transição, com a distância lida do espaçamento do tema. */
const PAGE_ENTER_FROM: Record<string, React.CSSProperties> = {
    fade: { opacity: 0 },
    'slide-up': { transform: 'translateY(var(--sarak-layout-gap, 16px))', opacity: 0 },
    'slide-side': { transform: 'translateX(var(--sarak-layout-gap-lg, 24px))', opacity: 0 },
    zoom: { transform: 'scale(0.9)', opacity: 0 },
    none: {},
};

/** Repete a entrada da amostra a cada ciclo: devolve se ela já chegou ao lugar. */
const useReplayedEntry = (type: string): boolean => {
    const [entered, setEntered] = useState(true);
    useEffect(() => {
        if (type === 'none') return undefined;
        const replay = (): void => {
            setEntered(false);
            window.requestAnimationFrame(() => setEntered(true));
        };
        replay();
        const timer = window.setInterval(replay, 1800);
        return () => window.clearInterval(timer);
    }, [type]);
    return entered;
};

export const PageSample: React.FC<{ preset: ComponentPreset }> = ({ preset }) => {
    const type = String(preset.design.pageTransitionType ?? 'fade');
    const entered = useReplayedEntry(type);
    return (
        <Frame>
            <div data-sample-page={type} className="w-full overflow-hidden rounded-[var(--sarak-card-radius,10px)] border border-[var(--theme-border)] p-4"
                style={{ ...(entered ? { opacity: 1, transform: 'none' } : PAGE_ENTER_FROM[type]), transition: 'all var(--sarak-motion-dur-normal, 0.3s) var(--sarak-motion-ease-out, ease)' }}>
                <div className="h-3 w-1/2 rounded bg-[var(--theme-primary)]" />
                <div className="mt-3 h-2 w-full rounded bg-[var(--theme-border)]" />
                <div className="mt-2 h-2 w-3/4 rounded bg-[var(--theme-border)]" />
            </div>
        </Frame>
    );
};
