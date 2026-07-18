import React, { useMemo } from 'react';
import { SarakThemePayload, SarakUIMode } from '../types';
import { SARAK_SCOPE_CLASS } from '../scope';

interface SovereignThemeInjectorProps {
    design: SarakThemePayload;
    manifest?: Record<string, unknown>;
    /** Modo de consumo (Spec 24). No Embarcado o sequestro é confinado à ilha. */
    mode?: SarakUIMode;
}

/**
 * SovereignThemeInjector (v13.5 - Data-Driven Bridge)
 * 
 * Atua como o "Hospedeiro Simbionte" da Sarak UI Core. 
 * Ele lê o estado do Design Engine (Claro/Escuro) e injeta uma folha de estilos de alta prioridade 
 * que "sequestra" componentes externos com Tailwind absoluto (text-white, bg-zinc-950, etc) 
 * forçando a paridade visual (1:1:1:1) com o UI Core.
 *
 * **Modo Embarcado (Spec 24):** este sequestro é global por natureza — `${root}.light
 * .text-white` casaria com elementos do PRÓPRIO host que usam Tailwind, repintando o
 * front existente com `!important`. Por isso, no Modo Embarcado a âncora deixa de ser
 * o `body` e passa a ser `.sarak-scope`, que só existe dentro da ilha.
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

        // O Sequestro só é agressivo no MODO CLARO, porque no modo escuro 
        // as cores "bg-zinc-950" e "text-white" já coincidem naturalmente com o visual esperado.
        // No entanto, injetamos as regras usando os tokens da Sarak.
        if (colorMode === 'light') {
            return `
                /* Sarak Sovereign Bridge - Light Mode Hijack */
                
                /* Textos Ofensivos (Brancos e Cinzas Claros que somem no modo Claro) */
                ${root}.light .text-white,
                ${root}.light .text-white\\/20,
                ${root}.light .text-white\\/30,
                ${root}.light .text-white\\/40,
                ${root}.light .text-white\\/50,
                ${root}.light .text-white\\/60,
                ${root}.light .text-white\\/70,
                ${root}.light .text-white\\/80,
                ${root}.light .text-white\\/90,
                ${root}.light .text-zinc-50, ${root}.light .text-zinc-100, ${root}.light .text-zinc-200, ${root}.light .text-zinc-300, ${root}.light .text-zinc-400, ${root}.light .text-zinc-500, ${root}.light .text-zinc-600,
                ${root}.light .text-slate-50, ${root}.light .text-slate-100, ${root}.light .text-slate-200, ${root}.light .text-slate-300, ${root}.light .text-slate-400, ${root}.light .text-slate-500, ${root}.light .text-slate-600,
                ${root}.light .text-gray-50, ${root}.light .text-gray-100, ${root}.light .text-gray-200, ${root}.light .text-gray-300, ${root}.light .text-gray-400, ${root}.light .text-gray-500, ${root}.light .text-gray-600,
                ${root}.light .text-neutral-50, ${root}.light .text-neutral-100, ${root}.light .text-neutral-200, ${root}.light .text-neutral-300, ${root}.light .text-neutral-400, ${root}.light .text-neutral-500, ${root}.light .text-neutral-600 {
                    color: var(--color-theme-title,#ffffff) !important;
                }

                ${root}.light .text-white\\/5,
                ${root}.light .text-white\\/10 {
                    color: var(--theme-muted) !important;
                }

                /* Fundos Ofensivos (Cartões e Camadas) */
                ${root}.light .bg-zinc-950,
                ${root}.light .bg-zinc-900,
                ${root}.light .bg-black,
                ${root}.light .bg-black\\/20,
                ${root}.light .bg-black\\/40,
                ${root}.light .bg-black\\/80,
                ${root}.light .bg-white\\/5,
                ${root}.light .bg-white\\/10 {
                    background-color: var(--theme-card) !important;
                }
                
                ${root}.light .bg-zinc-950\\/40 {
                    background-color: rgba(var(--sarak-card-bg-rgb), 0.8) !important;
                }

                /* Bordas Ofensivas */
                ${root}.light .border-white\\/5,
                ${root}.light .border-white\\/10,
                ${root}.light .border-white\\/20 {
                    border-color: var(--theme-border) !important;
                }

                /* Hovers Ocultos */
                ${root}.light .hover\\:text-white:hover {
                    color: var(--theme-title) !important;
                }
                ${root}.light .hover\\:border-white\\/30:hover {
                    border-color: var(--theme-border) !important;
                }
            `;
        }

        // Se for Dark Mode, forçamos os fundos para responder à tonalidade do tema atual
        // caso o tema seja colorido (ex: Tema Cyberpunk Dark), o "bg-zinc-950" hardcoded 
        // atrapalharia a coesão da matiz do cartão.
        return `
            /* Sarak Sovereign Bridge - Dark Mode Hue Hijack */
            ${root}.dark .bg-zinc-950,
            ${root}.dark .bg-black\\/40,
            ${root}.dark .bg-zinc-950\\/40 {
                background-color: var(--theme-card) !important;
            }
        `;
    }, [design?.mode, manifest, mode]);

    if (!hijackStyle) return null;

    return (
        <style id="sarak-sovereign-bridge" dangerouslySetInnerHTML={{ __html: hijackStyle }} />
    );
};
