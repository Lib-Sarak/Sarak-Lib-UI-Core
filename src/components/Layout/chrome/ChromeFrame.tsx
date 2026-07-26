import React from 'react';
import { ChromeDecoration, ChromeStrip } from './ChromeSlots';

/**
 * Moldura comum do cromo (Spec 48 — L1): a raiz que todos os modos compartilham
 * (sidebar, topbar e o colapso mobile) com as regiões que valem em QUALQUER modo.
 *
 * Ordem de pintura, de fora para dentro:
 *  1. `decoration` — camada absoluta ATRÁS de tudo (aria-hidden, sem foco/toque);
 *  2. `banner`     — faixa full-width no topo (acima da barra de navegação);
 *  3. `children`   — o corpo do modo (topbar+conteúdo, sidebar+conteúdo, mobile);
 *  4. `footer`     — faixa full-width na base.
 *
 * Regra única para os três modos: banner é a PRIMEIRA faixa do cromo e footer a
 * ÚLTIMA, ambas full-width — então o refluxo no celular é o mesmo do desktop
 * (a faixa só fica mais estreita) e não há caso especial por dispositivo.
 *
 * Empilhamento: a decoração só ganha contexto próprio quando existe (`isolation`
 * + `position: relative` na raiz), e as faixas/corpo são `relative` — assim a
 * camada decorativa fica atrás sem que nada precise de z-index mágico. Sem
 * `decoration`, a raiz mantém exatamente o estilo que já tinha (zero mudança).
 */
export interface ChromeFrameProps {
    /** Corpo do modo (barra + conteúdo). */
    children: React.ReactNode;
    /** Slot `decoration` — camada decorativa atrás do cromo. */
    decoration?: React.ReactNode;
    /** Slot `banner` — faixa full-width acima da barra/conteúdo. */
    banner?: React.ReactNode;
    /** Slot `footer` — faixa full-width abaixo do conteúdo. */
    footer?: React.ReactNode;
    className?: string;
    /** Estilo da raiz já resolvido pelo cromo (altura própria + fundo + `style` do consumidor). */
    rootStyle: React.CSSProperties;
}

export const ChromeFrame: React.FC<ChromeFrameProps> = ({
    children,
    decoration,
    banner,
    footer,
    className = '',
    rootStyle,
}) => {
    const style: React.CSSProperties = decoration
        ? { position: 'relative', isolation: 'isolate', ...rootStyle }
        : rootStyle;

    return (
        <div className={`flex flex-col w-full h-full min-h-0 ${className}`} style={style}>
            <ChromeDecoration>{decoration}</ChromeDecoration>
            <ChromeStrip region="banner">{banner}</ChromeStrip>
            {children}
            <ChromeStrip region="footer">{footer}</ChromeStrip>
        </div>
    );
};

export default ChromeFrame;
