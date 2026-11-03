/**
 * Posição do cartão do tour em relação ao alvo, dentro do contêiner (a área fixa do portal).
 * Pura: recebe retângulos e devolve coordenadas; nada de DOM aqui.
 */

export interface TourRect {
    top: number;
    left: number;
    width: number;
    height: number;
}

export interface TourPlacement {
    top: number;
    left: number;
}

/** Folga entre o alvo e o cartão, e entre o cartão e a borda do contêiner. */
export const TOUR_GAP = 12;

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), Math.max(min, max));

/**
 * Abaixo do alvo quando cabe; senão acima; senão no meio do contêiner. Sempre dentro do contêiner:
 * num contêiner estreito o cartão encosta nas bordas em vez de sair delas.
 */
export function placeTourCard(target: TourRect | null, card: Pick<TourRect, 'width' | 'height'>, container: TourRect): TourPlacement {
    const minLeft = container.left + TOUR_GAP;
    const maxLeft = container.left + container.width - card.width - TOUR_GAP;
    if (!target) {
        return {
            top: container.top + (container.height - card.height) / 2,
            left: clamp(container.left + (container.width - card.width) / 2, minLeft, maxLeft),
        };
    }
    const below = target.top + target.height + TOUR_GAP;
    const above = target.top - card.height - TOUR_GAP;
    const fitsBelow = below + card.height <= container.top + container.height - TOUR_GAP;
    const fitsAbove = above >= container.top + TOUR_GAP;
    const top = fitsBelow ? below : fitsAbove ? above : container.top + (container.height - card.height) / 2;
    return { top, left: clamp(target.left + target.width / 2 - card.width / 2, minLeft, maxLeft) };
}
