import React from 'react';
import type { ComponentPreset } from '../../../../core/Design/presets/components/cards';
import { SampleTitleCard } from './SampleParts';

/**
 * Amostras estáticas dos grupos de contraste baixo (sombra, direção da sombra, moldura e degradê): o cartão real do painel,
 * ampliado e recortado no canto onde a opção aparece, sobre uma faixa que dá contraste. O degradê pinta a área inteira.
 */

const BORDER_SCALE = 5;
/** A sombra mais larga das opções passa de 200 px: o painel e a sombra dele são desenhados em tamanho real e reduzidos, para a sombra inteira caber na faixa. */
const SHADOW_REDUCE = 0.4;
const SHADOW_REDUCED_BOX = `${100 / SHADOW_REDUCE}%`;
const SHADOW_REDUCED_OFFSET = `${(100 - 100 / SHADOW_REDUCE) / 2}%`;

/** A sombra é escura: no modo escuro a faixa é clara, e no claro a base já dá o contraste. */
const SHADOW_STAGE = 'bg-[color-mix(in_srgb,var(--sarak-text-main)_88%,var(--sarak-bg-base))] [.light_&]:bg-[var(--sarak-bg-base)]';

const PANEL_SHADOW = [
    // sarak-allow-hardcode: a mesma geometria de `--sarak-dynamic-shadow` (`_theme.css`), contato + projeção; aquela variável resolve no :root e não enxerga os tokens do escopo da amostra, então a conta se repete aqui.
    'calc(var(--sarak-shadow-dir-x, 0) * 2px) calc(var(--sarak-shadow-dir-y, 1) * 2px) 5px color-mix(in srgb, var(--sarak-card-shadow-color, var(--sarak-bg-body)) min(100%, calc(var(--sarak-shadow-ambient-alpha, 0.4) * var(--sarak-layered-shadows, 1) * 100%)), transparent)',
    'calc(var(--sarak-shadow-dir-x, 0) * var(--sarak-shadow-projection-blur, 40px) * 0.5) calc(var(--sarak-shadow-dir-y, 1) * var(--sarak-shadow-projection-blur, 40px)) calc(var(--sarak-shadow-projection-blur, 40px) * 1.5) color-mix(in srgb, var(--sarak-card-shadow-color, var(--sarak-bg-body)) min(100%, calc(var(--sarak-shadow-projection-alpha, 0.2) * var(--sarak-layered-shadows, 1) * 100%)), transparent)',
].join(', ');

/** Um painel liso, só com a sombra das opções de sombra: a cor, o desfoque, a opacidade e a direção vêm dos tokens do escopo. */
const SHADOW_PANEL_INSET = '30%';
const ShadowPanel: React.FC = () => (
    <div aria-hidden="true" className="absolute border border-[var(--theme-border)]" style={{ inset: SHADOW_PANEL_INSET, backgroundColor: 'var(--theme-card)', borderRadius: 'var(--sarak-card-radius, 10px)', boxShadow: PANEL_SHADOW }} />
);

/** A sombra em volta do painel, sobre a faixa: o tamanho, a nitidez, a opacidade e a cor da sombra da opção. */
export const ShadowPanelSample: React.FC = () => (
    <div data-sample-shadow="" className={`relative h-full min-h-48 w-full overflow-hidden ${SHADOW_STAGE}`}>
        <div className="absolute" style={{ left: SHADOW_REDUCED_OFFSET, top: SHADOW_REDUCED_OFFSET, width: SHADOW_REDUCED_BOX, height: SHADOW_REDUCED_BOX, transform: `scale(${SHADOW_REDUCE})` }}>
            <ShadowPanel />
        </div>
    </div>
);

/** A moldura no canto de cima à esquerda do cartão real, ampliado: o traço, os cantos de mira ou o brilho da opção. */
export const BorderCornerSample: React.FC = () => (
    <div data-sample-border="top-left" className="relative h-full min-h-48 w-full overflow-hidden">
        <div className="absolute left-[30%] top-[30%] w-[70%]" style={{ transform: `scale(${BORDER_SCALE})`, transformOrigin: 'top left' }}><SampleTitleCard /></div>
    </div>
);

/** Onde a luz está para cada direção da sombra: sempre do lado oposto ao que a sombra cai. */
const LIGHT_SPOTS: Record<string, readonly string[]> = {
    bottom: ['left-1/2 top-2 -translate-x-1/2'],
    top: ['bottom-2 left-1/2 -translate-x-1/2'],
    center: ['left-2 top-2', 'right-2 top-2', 'bottom-2 left-2', 'bottom-2 right-2'],
    'bottom-right': ['left-2 top-2'],
    dynamic: ['left-2 top-2'],
};

/** O cartão inteiro sobre a faixa, com a luz marcada: a sombra cai para o lado contrário, e a que segue o ponteiro leva a órbita tracejada. */
export const ShadowDirectionSample: React.FC<{ preset: ComponentPreset }> = ({ preset }) => {
    const orientation = String(preset.design.shadowOrientation ?? 'bottom');
    return (
        <div data-sample-shadow-direction={orientation} className={`relative h-full min-h-48 w-full ${SHADOW_STAGE}`}>
            {(LIGHT_SPOTS[orientation] ?? LIGHT_SPOTS.bottom).map((spot) => (
                <span key={spot} aria-hidden="true" className={`absolute h-5 w-5 rounded-full border-2 border-[var(--theme-card)] ${spot}`} style={{ backgroundColor: 'var(--theme-primary)' }} />
            ))}
            {orientation === 'dynamic' && <span aria-hidden="true" className="absolute inset-1 rounded-[var(--sarak-card-radius,10px)] border-4 border-dashed border-[var(--theme-primary)]" />}
            <ShadowPanel />
        </div>
    );
};

const DEFAULT_GRADIENT_ANGLE = 135;
const TINT = 'var(--sarak-surface-tint-color, var(--theme-primary))';
const BODY = 'var(--sarak-bg-body, var(--theme-body))';

/** O degradê de cada tipo, com a mesma receita do fundo mas a cor cheia, para o tipo e o ângulo aparecerem na miniatura. */
const gradientOf = (mode: string, angle: number): string => {
    if (mode === 'linear') return `linear-gradient(${angle}deg, ${BODY} 0%, ${TINT} 100%)`;
    if (mode === 'radial') return `radial-gradient(120% 90% at 50% 0%, ${TINT} 0%, ${BODY} 70%)`;
    if (mode === 'mesh') {
        return [
            `radial-gradient(at 12% 8%, color-mix(in srgb, ${TINT} 80%, transparent) 0, transparent 55%)`,
            `radial-gradient(at 88% 14%, color-mix(in srgb, var(--sarak-accent-color, var(--theme-primary-focus)) 75%, transparent) 0, transparent 52%)`,
            `radial-gradient(at 82% 92%, color-mix(in srgb, var(--sarak-bg-layer-2, ${TINT}) 70%, transparent) 0, transparent 56%)`,
            `radial-gradient(at 8% 90%, color-mix(in srgb, var(--sarak-bg-layer-1, ${BODY}) 80%, transparent) 0, transparent 60%)`,
        ].join(', ');
    }
    return 'none';
};

/** O fundo da opção, pintado na área inteira. */
export const GradientAreaSample: React.FC<{ preset: ComponentPreset }> = ({ preset }) => {
    const mode = String(preset.design.bgGradientMode ?? 'none');
    const angle = Number(preset.design.bgGradientAngle ?? DEFAULT_GRADIENT_ANGLE);
    return <div data-sample-gradient={mode} className="h-full min-h-48 w-full" style={{ backgroundColor: BODY, backgroundImage: gradientOf(mode, angle) }} />;
};
