import React, { createContext, useContext } from 'react';

/** Um ponto de `position: fixed`, em px da janela, como `getBoundingClientRect` o devolve. */
export interface PortalPoint {
    top: number;
    left: number;
}

/**
 * Onde um popover portalizado se desenha. Por padrão é o `body`, e as coordenadas valem como vêm. Um host que desenha o
 * sistema dentro de uma moldura (a prévia do painel) entrega um nó dentro dela e a conversão das coordenadas da janela
 * para as do nó: o popover abre dentro da moldura, na escala dela, em vez de sair por cima da página.
 */
export interface SarakPortalFrame {
    container: Element | null;
    localize: (point: PortalPoint) => PortalPoint;
}

const SarakPortalFrameContext = createContext<SarakPortalFrame | null>(null);

export const SarakPortalFrameProvider = SarakPortalFrameContext.Provider;

const keepPoint = (point: PortalPoint): PortalPoint => point;

/** O destino do portal e a conversão de coordenadas; sem moldura, o `body` e a identidade. */
export const useSarakPortalFrame = (): { container: Element | null; localize: (point: PortalPoint) => PortalPoint } => {
    const frame = useContext(SarakPortalFrameContext);
    const fallback = typeof document === 'undefined' ? null : document.body;
    return { container: frame?.container ?? fallback, localize: frame?.localize ?? keepPoint };
};
