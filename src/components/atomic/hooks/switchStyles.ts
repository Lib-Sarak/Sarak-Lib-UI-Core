import type React from 'react';
import type { SarakThemePayload } from '../../../core/Provider/types';

/** Estilos do alternador que o token `switchStyleType` oferece. */
export type SwitchStyleType = 'tactile' | 'asymmetric' | 'pulsing' | 'glass';

export interface SwitchStyles {
    trackStyle: React.CSSProperties;
    thumbStyle: React.CSSProperties;
}

const ACTIVE_BG = 'var(--sarak-switch-active-bg, var(--sarak-primary-color,#19e3f0))';
const THUMB_BG = 'var(--sarak-switch-thumb, #ffffff)';
const IDLE_TRACK_BG = 'var(--color-theme-card, #101622)';
const GLASS_BORDER = '1px solid var(--color-theme-border, rgba(255,255,255,0.09))';
const DEFAULT_GLASS_BLUR = 4;
const PULSE_ANIMATION = 'sarak-switch-pulse calc(var(--sarak-motion-dur-slow, 0.6s) * 2.67) var(--sarak-motion-ease-out, cubic-bezier(0.16, 1, 0.3, 1)) infinite';

function resolveStyleType(design: SarakThemePayload | undefined): SwitchStyleType {
    const requested = design?.switchStyleType;
    if (requested === 'asymmetric' || requested === 'pulsing' || requested === 'glass') return requested;
    return 'tactile';
}

function glassBlur(design: SarakThemePayload | undefined): string {
    const amount = design?.switchBackdropBlur ?? DEFAULT_GLASS_BLUR;
    return `blur(${amount}px)`;
}

/**
 * Pele do `SarakSwitch` por `switchStyleType`. Trilho e thumb mantêm a geometria do
 * átomo (40×24 e 16×16, o thumb desliza 100% da própria largura); o estilo mexe só em
 * forma, relevo, vidro e pulso:
 * - `tactile` — o trilho pílula e o thumb redondo de sempre, o mais neutro;
 * - `asymmetric` — cantos desiguais no trilho e no thumb, mais orgânico;
 * - `pulsing` — thumb em ponto que emite um pulso na cor de `switchPulseColor` ao ligar;
 * - `glass` — trilho translúcido com desfoque de `switchBackdropBlur` e borda fina.
 */
export function resolveSwitchStyles(design: SarakThemePayload | undefined, checked: boolean): SwitchStyles {
    const styleType = resolveStyleType(design);
    const trackStyle: React.CSSProperties = { backgroundColor: checked ? ACTIVE_BG : IDLE_TRACK_BG };
    const thumbStyle: React.CSSProperties = {
        backgroundColor: THUMB_BG,
        transform: checked ? 'translateX(100%)' : 'translateX(0)',
    };

    if (styleType === 'asymmetric') {
        trackStyle.borderRadius = '14px 6px 14px 6px';
        thumbStyle.borderRadius = '8px 3px 8px 3px';
    }

    if (styleType === 'pulsing') {
        thumbStyle.borderRadius = '50%';
        if (checked) thumbStyle.animation = PULSE_ANIMATION;
    }

    if (styleType === 'glass') {
        trackStyle.backgroundColor = checked
            ? `color-mix(in srgb, ${ACTIVE_BG} 55%, transparent)`
            : IDLE_TRACK_BG;
        trackStyle.border = GLASS_BORDER;
        trackStyle.backdropFilter = glassBlur(design);
        trackStyle.WebkitBackdropFilter = glassBlur(design);
        thumbStyle.backgroundColor = `color-mix(in srgb, ${THUMB_BG} 85%, transparent)`;
    }

    return { trackStyle, thumbStyle };
}
