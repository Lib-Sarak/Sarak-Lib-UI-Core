/**
 * Onde um balão `fixed` se ancora no retângulo do gatilho:
 * - `side`: ao lado (à direita), alinhado ao topo do gatilho;
 * - `side-up`: ao lado (à direita), alinhado à base do gatilho — para gatilhos no rodapé da barra;
 * - `below`: abaixo, alinhado à borda inicial do gatilho;
 * - `below-end`: abaixo, alinhado à borda final do gatilho.
 */
export type AnchoredPlacement = 'side' | 'side-up' | 'below' | 'below-end';

export const ANCHORED_MARGIN = 8;

export interface AnchoredCoords {
    top: number;
    left: number;
}

const rawPosition = (anchor: DOMRect, popover: DOMRect, placement: AnchoredPlacement): AnchoredCoords => {
    switch (placement) {
        case 'side': return { left: anchor.right + ANCHORED_MARGIN, top: anchor.top };
        case 'side-up': return { left: anchor.right + ANCHORED_MARGIN, top: anchor.bottom - popover.height };
        case 'below-end': return { left: anchor.right - popover.width, top: anchor.bottom + ANCHORED_MARGIN };
        default: return { left: anchor.left, top: anchor.bottom + ANCHORED_MARGIN };
    }
};

/** Posição do balão ancorada no gatilho e mantida dentro da janela, nos dois eixos. */
export const placeAnchored = (anchor: DOMRect, popover: DOMRect, placement: AnchoredPlacement): AnchoredCoords => {
    const { left, top } = rawPosition(anchor, popover, placement);
    return {
        left: Math.max(ANCHORED_MARGIN, Math.min(left, window.innerWidth - popover.width - ANCHORED_MARGIN)),
        top: Math.max(ANCHORED_MARGIN, Math.min(top, window.innerHeight - popover.height - ANCHORED_MARGIN)),
    };
};
