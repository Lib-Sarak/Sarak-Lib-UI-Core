import React, { useMemo } from 'react';
import { SarakThemePayload, SarakUIMode } from '../types';
import { SARAK_OWN_PALETTE_ATTRIBUTE, SARAK_SCOPE_CLASS } from '../scope';
import { SarakStyle } from './SarakStyle';

interface SovereignThemeInjectorProps {
    design: SarakThemePayload;
    manifest?: Record<string, unknown>;
    /** Modo de consumo (Spec 24). No Embarcado o sequestro é confinado à ilha. */
    mode?: SarakUIMode;
}

/** Classe do Tailwind com `/`: `text-white/20` → `text-white\/20` (escapada para o seletor). */
const withAlphas = (base: string, alphas: number[]): string[] => alphas.map((alpha) => `${base}\\/${alpha}`);

const PALETTE_STEPS = ['50', '100', '200', '300', '400', '500', '600'];
const paletteOf = (name: string): string[] => PALETTE_STEPS.map((step) => `text-${name}-${step}`);

/** Textos que somem no modo claro: brancos e cinzas claros. */
const LIGHT_HIJACKED_TEXT = [
    'text-white',
    ...withAlphas('text-white', [20, 30, 40, 50, 60, 70, 80, 90]),
    ...['zinc', 'slate', 'gray', 'neutral'].flatMap(paletteOf),
];
const LIGHT_HIJACKED_MUTED_TEXT = withAlphas('text-white', [5, 10]);
const LIGHT_HIJACKED_SURFACES = [
    'bg-zinc-950', 'bg-zinc-900', 'bg-black',
    ...withAlphas('bg-black', [20, 40, 80]),
    ...withAlphas('bg-white', [5, 10]),
];
const LIGHT_HIJACKED_BORDERS = withAlphas('border-white', [5, 10, 20]);
const DARK_HIJACKED_SURFACES = ['bg-zinc-950', ...withAlphas('bg-black', [40]), ...withAlphas('bg-zinc-950', [40])];

/**
 * SovereignThemeInjector (v13.5 - Data-Driven Bridge)
 *
 * Atua como o "Hospedeiro Simbionte" da Sarak UI Core.
 * Ele lê o estado do Design Engine (Claro/Escuro) e injeta uma folha de estilos que "sequestra" componentes
 * externos com Tailwind absoluto (text-white, bg-zinc-950, etc), forçando a paridade visual com o UI Core.
 *
 * A folha é SEM `!important`: ela vence a classe utilitária por não estar em camada (regra fora de camada
 * vence a de dentro) e pela especificidade do seletor, mas o `style` inline e a utilitária `!important` do
 * componente continuam valendo — quem já decide a própria cor não é atropelado. O componente da lib que
 * desenha sobre fundo PRÓPRIO (o lightbox, branco sobre preto) sai do sequestro pelo atributo
 * `data-sarak-own-palette` na raiz dele: nada dentro dela é repintado.
 *
 * **Modo Embarcado (Spec 24):** este sequestro é global por natureza — `${root}.light
 * .text-white` casaria com elementos do PRÓPRIO host que usam Tailwind, repintando o
 * front existente. Por isso, no Modo Embarcado a âncora deixa de ser o `body` e passa a ser
 * `.sarak-scope`, que só existe dentro da ilha.
 */
export const SovereignThemeInjector: React.FC<SovereignThemeInjectorProps> = ({ design, manifest, mode = 'app' }) => {

    const hijackStyle = useMemo(() => {
        // Se o manifest pedir explicitamente para NÃO ser sequestrado, pulamos.
        // Isso permite o uso de frontends legados totalmente isentos, caso necessário.
        if (manifest?.sovereignHijack === false) {
            return '';
        }

        const colorMode = design?.mode || 'dark';
        // Âncora do sequestro: o documento (Modo App) ou a ilha (Modo Embarcado).
        const root = mode === 'embedded' ? `.${SARAK_SCOPE_CLASS}` : 'body';
        // Fora da subárvore de um componente da lib que traz paleta própria.
        const outsideOwnPalette = `:not([${SARAK_OWN_PALETTE_ATTRIBUTE}] *)`;
        const rule = (scope: string, classes: string[], declaration: string, state = ''): string =>
            `${classes.map((name) => `${root}.${scope} .${name}${state}${outsideOwnPalette}`).join(',\n')} {\n    ${declaration}\n}`;

        // O Sequestro só é agressivo no MODO CLARO, porque no modo escuro
        // as cores "bg-zinc-950" e "text-white" já coincidem naturalmente com o visual esperado.
        // No entanto, injetamos as regras usando os tokens da Sarak.
        if (colorMode === 'light') {
            return [
                '/* Sarak Sovereign Bridge - Light Mode Hijack */',
                '/* Textos Ofensivos (Brancos e Cinzas Claros que somem no modo Claro) */',
                rule('light', LIGHT_HIJACKED_TEXT, 'color: var(--color-theme-title,#f2f6fb);'),
                rule('light', LIGHT_HIJACKED_MUTED_TEXT, 'color: var(--theme-muted);'),
                '/* Fundos Ofensivos (Cartões e Camadas) */',
                rule('light', LIGHT_HIJACKED_SURFACES, 'background-color: var(--theme-card);'),
                rule('light', withAlphas('bg-zinc-950', [40]), 'background-color: rgba(var(--sarak-card-bg-rgb), 0.8);'),
                '/* Bordas Ofensivas */',
                rule('light', LIGHT_HIJACKED_BORDERS, 'border-color: var(--theme-border);'),
                '/* Hovers Ocultos */',
                rule('light', ['hover\\:text-white'], 'color: var(--theme-title);', ':hover'),
                rule('light', ['hover\\:border-white\\/30'], 'border-color: var(--theme-border);', ':hover'),
            ].join('\n');
        }

        // Se for Dark Mode, forçamos os fundos para responder à tonalidade do tema atual
        // caso o tema seja colorido (ex: Tema Cyberpunk Dark), o "bg-zinc-950" hardcoded
        // atrapalharia a coesão da matiz do cartão.
        return [
            '/* Sarak Sovereign Bridge - Dark Mode Hue Hijack */',
            rule('dark', DARK_HIJACKED_SURFACES, 'background-color: var(--theme-card);'),
        ].join('\n');
    }, [design?.mode, manifest, mode]);

    if (!hijackStyle) return null;

    return (
        <SarakStyle id="sarak-sovereign-bridge" dangerouslySetInnerHTML={{ __html: hijackStyle }} />
    );
};
