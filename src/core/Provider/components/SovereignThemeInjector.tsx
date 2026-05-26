import React, { useMemo } from 'react';

interface SovereignThemeInjectorProps {
    design: any;
    manifest?: any;
}

/**
 * SovereignThemeInjector (v13.5 - Data-Driven Bridge)
 * 
 * Atua como o "Hospedeiro Simbionte" da Sarak UI Core. 
 * Ele lê o estado do Design Engine (Claro/Escuro) e injeta uma folha de estilos de alta prioridade 
 * que "sequestra" componentes externos com Tailwind absoluto (text-white, bg-zinc-950, etc) 
 * forçando a paridade visual (1:1:1:1) com o UI Core.
 */
export const SovereignThemeInjector: React.FC<SovereignThemeInjectorProps> = ({ design, manifest }) => {
    
    const hijackStyle = useMemo(() => {
        // Se o manifest pedir explicitamente para NÃO ser sequestrado, pulamos.
        // Isso permite o uso de frontends legados totalmente isentos, caso necessário.
        if (manifest?.sovereignHijack === false) {
            return '';
        }

        const mode = design?.mode || 'dark';

        // O Sequestro só é agressivo no MODO CLARO, porque no modo escuro 
        // as cores "bg-zinc-950" e "text-white" já coincidem naturalmente com o visual esperado.
        // No entanto, injetamos as regras usando os tokens da Sarak.
        if (mode === 'light') {
            return `
                /* Sarak Sovereign Bridge - Light Mode Hijack */
                
                /* Textos Ofensivos (Brancos e Cinzas Claros que somem no modo Claro) */
                body.light .text-white,
                body.light .text-white\\/20,
                body.light .text-white\\/30,
                body.light .text-white\\/40,
                body.light .text-white\\/50,
                body.light .text-white\\/60,
                body.light .text-white\\/70,
                body.light .text-white\\/80,
                body.light .text-white\\/90,
                body.light .text-zinc-50, body.light .text-zinc-100, body.light .text-zinc-200, body.light .text-zinc-300, body.light .text-zinc-400, body.light .text-zinc-500, body.light .text-zinc-600,
                body.light .text-slate-50, body.light .text-slate-100, body.light .text-slate-200, body.light .text-slate-300, body.light .text-slate-400, body.light .text-slate-500, body.light .text-slate-600,
                body.light .text-gray-50, body.light .text-gray-100, body.light .text-gray-200, body.light .text-gray-300, body.light .text-gray-400, body.light .text-gray-500, body.light .text-gray-600,
                body.light .text-neutral-50, body.light .text-neutral-100, body.light .text-neutral-200, body.light .text-neutral-300, body.light .text-neutral-400, body.light .text-neutral-500, body.light .text-neutral-600 {
                    color: var(--theme-text) !important;
                }

                body.light .text-white\\/5,
                body.light .text-white\\/10 {
                    color: var(--theme-muted) !important;
                }

                /* Fundos Ofensivos (Cartões e Camadas) */
                body.light .bg-zinc-950,
                body.light .bg-zinc-900,
                body.light .bg-black,
                body.light .bg-black\\/20,
                body.light .bg-black\\/40,
                body.light .bg-black\\/80,
                body.light .bg-white\\/5,
                body.light .bg-white\\/10 {
                    background-color: var(--theme-card) !important;
                }
                
                body.light .bg-zinc-950\\/40 {
                    background-color: rgba(var(--sarak-card-bg-rgb), 0.8) !important;
                }

                /* Bordas Ofensivas */
                body.light .border-white\\/5,
                body.light .border-white\\/10,
                body.light .border-white\\/20 {
                    border-color: var(--theme-border) !important;
                }

                /* Hovers Ocultos */
                body.light .hover\\:text-white:hover {
                    color: var(--theme-title) !important;
                }
                body.light .hover\\:border-white\\/30:hover {
                    border-color: var(--theme-border) !important;
                }
            `;
        }

        // Se for Dark Mode, forçamos os fundos para responder à tonalidade do tema atual
        // caso o tema seja colorido (ex: Tema Cyberpunk Dark), o "bg-zinc-950" hardcoded 
        // atrapalharia a coesão da matiz do cartão.
        return `
            /* Sarak Sovereign Bridge - Dark Mode Hue Hijack */
            body.dark .bg-zinc-950,
            body.dark .bg-black\\/40,
            body.dark .bg-zinc-950\\/40 {
                background-color: var(--theme-card) !important;
            }
        `;
    }, [design?.mode, manifest]);

    if (!hijackStyle) return null;

    return (
        <style id="sarak-sovereign-bridge" dangerouslySetInnerHTML={{ __html: hijackStyle }} />
    );
};
