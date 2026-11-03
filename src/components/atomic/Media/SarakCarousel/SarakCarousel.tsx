/**
 * SarakCarousel — carrossel de slides. Sem rotação automática por padrão; setas, pontos, gesto de arrastar
 * e teclado (setas, Home e End). Com `autoPlay`, pausa sob o mouse e o foco, tem botão de pausa, e não
 * gira para quem pediu movimento reduzido (`prefers-reduced-motion`): nesse caso a troca também não anima.
 * Só o slide atual fica na árvore de acessibilidade. Estilo só por token.
 */

import React, { useRef, useState } from 'react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import { SarakButton } from '../../Buttons/SarakButton';
import { SarakIconButton } from '../../Buttons/SarakIconButton';
import { useCarouselAutoplay } from './useCarouselAutoplay';

const DEFAULT_INTERVAL_MS = 5000;
/** Deslocamento horizontal mínimo, em px, para o gesto virar troca de slide. */
const SWIPE_THRESHOLD = 40;
/** `inert` tira o slide fora de vista do Tab e do leitor de tela; o React 18 só o repassa como texto. */
const HIDDEN_SLIDE = { inert: '' } as React.HTMLAttributes<HTMLDivElement>;
const GAP_SM = 'var(--sarak-layout-gap-sm, 8px)';

export interface SarakCarouselSlide {
    id: string;
    content: React.ReactNode;
}

export interface SarakCarouselProps {
    slides: SarakCarouselSlide[];
    /** Slide atual, no modo controlado. */
    index?: number;
    /** Slide inicial no modo não controlado. Omitido, `0`. */
    defaultIndex?: number;
    /** Chamado a cada troca de slide. */
    onIndexChange?: (index: number) => void;
    /** Rotação automática. Omitido, desligada. Ignorada com movimento reduzido. */
    autoPlay?: boolean;
    /** Intervalo da rotação em ms. Omitido, `5000`. */
    intervalMs?: number;
    /** Volta ao primeiro depois do último (e ao último antes do primeiro). Omitido, `false`; a rotação automática sempre dá a volta. */
    loop?: boolean;
    /** Nome acessível do carrossel. */
    label?: string;
    className?: string;
}

export function SarakCarousel({ slides, index, defaultIndex = 0, onIndexChange, autoPlay = false, intervalMs = DEFAULT_INTERVAL_MS, loop = false, label, className }: SarakCarouselProps): React.ReactElement {
    const text = useLibraryText();
    const [internal, setInternal] = useState(defaultIndex);
    const swipeStart = useRef<number | null>(null);
    const count = slides.length;
    const current = Math.min(Math.max(index ?? internal, 0), Math.max(count - 1, 0));

    const goTo = (next: number): void => {
        const wrapped = loop || autoPlay ? (next + count) % count : Math.min(Math.max(next, 0), count - 1);
        if (wrapped === current) return;
        if (index === undefined) setInternal(wrapped);
        onIndexChange?.(wrapped);
    };
    const goToRef = useRef(goTo);
    goToRef.current = goTo;

    const { reduced, playing, paused, setPaused, setHeld } = useCarouselAutoplay({ autoPlay, count, intervalMs, onAdvance: () => goToRef.current(current + 1) });

    const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
        if (event.target !== event.currentTarget) return;
        const target = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: count - 1 }[event.key];
        if (target === undefined) return;
        event.preventDefault();
        goTo(target);
    };
    const onPointerUp = (event: React.PointerEvent<HTMLDivElement>): void => {
        if (swipeStart.current === null) return;
        const delta = event.clientX - swipeStart.current;
        swipeStart.current = null;
        if (Math.abs(delta) >= SWIPE_THRESHOLD) goTo(current + (delta < 0 ? 1 : -1));
    };
    const edge = (direction: -1 | 1): boolean => !(loop || autoPlay) && (direction < 0 ? current === 0 : current === count - 1);

    return (
        <section
            className={className}
            aria-roledescription="carousel"
            aria-label={label ?? text('carouselLabel')}
            data-sarak-carousel="true"
            onMouseEnter={() => setHeld(true)}
            onMouseLeave={() => setHeld(false)}
            onFocus={() => setHeld(true)}
            onBlur={() => setHeld(false)}
            style={{ display: 'flex', flexDirection: 'column', gap: GAP_SM }}
        >
            <div
                tabIndex={0}
                onKeyDown={onKeyDown}
                onPointerDown={(event) => { swipeStart.current = event.clientX; }}
                onPointerUp={onPointerUp}
                onPointerCancel={() => { swipeStart.current = null; }}
                aria-live={playing ? 'off' : 'polite'}
                style={{ overflow: 'hidden', touchAction: 'pan-y', borderRadius: 'var(--sarak-card-radius, 10px)' }}
            >
                <div style={{ display: 'flex', transform: `translateX(-${current * 100}%)`, transition: reduced ? 'none' : 'transform var(--sarak-motion-dur-normal, 0.3s) ease' }}>
                    {slides.map((slide, position) => (
                        <div
                            key={slide.id}
                            role="group"
                            aria-roledescription="slide"
                            aria-label={`${position + 1} / ${count}`}
                            aria-hidden={position === current ? undefined : true}
                            {...(position === current ? {} : HIDDEN_SLIDE)}
                            data-sarak-carousel-slide={position === current ? 'current' : undefined}
                            style={{ flex: '0 0 100%', minWidth: 0 }}
                        >
                            {slide.content}
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: GAP_SM, flexWrap: 'wrap' }}>
                <SarakButton type="button" aria-label={text('carouselPrevious')} disabled={count < 2 || edge(-1)} onClick={() => goTo(current - 1)}>‹</SarakButton>
                <div role="group" style={{ display: 'flex', gap: GAP_SM }}>
                    {slides.map((slide, position) => (
                        <SarakIconButton
                            key={slide.id}
                            type="button"
                            variant="ghost"
                            size="xs"
                            aria-label={text('carouselGoTo', { number: position + 1 })}
                            aria-current={position === current ? 'true' : undefined}
                            icon={<span aria-hidden="true">{position === current ? '●' : '○'}</span>}
                            onClick={() => goTo(position)}
                        />
                    ))}
                </div>
                <SarakButton type="button" aria-label={text('carouselNext')} disabled={count < 2 || edge(1)} onClick={() => goTo(current + 1)}>›</SarakButton>
                {autoPlay && !reduced && (
                    <SarakButton type="button" aria-label={paused ? text('carouselPlay') : text('carouselPause')} onClick={() => setPaused((value) => !value)}>{paused ? '▶' : '❚❚'}</SarakButton>
                )}
            </div>
        </section>
    );
}

export default SarakCarousel;
