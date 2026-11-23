import { useCallback, useLayoutEffect, useState, type RefObject } from 'react';
import { resolveMoreStart, resolveOverflowStart, type OverflowCell } from './horizontalOverflow';

/** Âncora de cada item da lista horizontal, e do botão "Mais", para a medição achá-los sem depender de classe. */
export const NAV_CELL_ATTRIBUTE = 'data-sarak-nav-cell';
export const NAV_MORE_ATTRIBUTE = 'data-sarak-nav-more';

export interface HorizontalOverflow {
    /** O índice do primeiro item que vai para o "Mais" (o tamanho da lista quando tudo cabe); `null` antes de medir ou desligado. */
    start: number | null;
    /** Onde o botão "Mais" começa, em px a partir da borda esquerda da barra: logo depois do último item que ficou. */
    moreStart: number;
}

const OFF: HorizontalOverflow = { start: null, moreStart: 0 };

const toPixels = (value: string): number => {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

/**
 * Quantos itens da lista horizontal cabem, e onde o "Mais" entra. Todos ficam no fluxo (o item escondido só perde a
 * visibilidade) e o "Mais" fica fora dele, então a largura natural da lista não depende de quem coube nem de onde o botão está
 * e a medição não oscila. Recalcula quando a barra, um item ou a lista muda.
 */
export const useHorizontalOverflow = (navRef: RefObject<HTMLElement>, enabled: boolean, signature: string): HorizontalOverflow => {
    const [state, setState] = useState<HorizontalOverflow>(OFF);

    const measure = useCallback((): void => {
        const nav = navRef.current;
        if (!nav) return;
        const cells = Array.from(nav.querySelectorAll<HTMLElement>(`[${NAV_CELL_ATTRIBUTE}]`));
        const more = nav.querySelector<HTMLElement>(`[${NAV_MORE_ATTRIBUTE}]`);
        const navRect = nav.getBoundingClientRect();
        // As caixas vêm em px de tela (com o `transform: scale` dos ancestrais, como na amostra do painel); padding e vão vêm do
        // estilo, em px de layout. Tudo passa para px de layout dividindo as caixas pela escala (tela ÷ layout).
        const scale = nav.offsetWidth > 0 && navRect.width > 0 ? navRect.width / nav.offsetWidth : 1;
        const style = getComputedStyle(nav);
        const paddingLeft = toPixels(style.paddingLeft);
        const usableLeft = navRect.left + paddingLeft * scale;
        const usableRight = navRect.width / scale - toPixels(style.paddingRight) - paddingLeft;
        const boxes: OverflowCell[] = cells.map((cell) => {
            const rect = cell.getBoundingClientRect();
            return { left: (rect.left - usableLeft) / scale, right: (rect.right - usableLeft) / scale };
        });
        const gap = toPixels(style.columnGap);
        const start = resolveOverflowStart(boxes, usableRight, (more?.getBoundingClientRect().width ?? 0) / scale, gap);
        const moreStart = paddingLeft + resolveMoreStart(boxes, start, gap);
        setState((current) => (current.start === start && current.moreStart === moreStart ? current : { start, moreStart }));
    }, [navRef]);

    useLayoutEffect(() => {
        if (!enabled) {
            setState(OFF);
            return undefined;
        }
        measure();
        if (typeof ResizeObserver === 'undefined' || !navRef.current) return undefined;
        const observer = new ResizeObserver(measure);
        observer.observe(navRef.current);
        navRef.current.querySelectorAll(`[${NAV_CELL_ATTRIBUTE}]`).forEach((cell) => observer.observe(cell));
        return () => observer.disconnect();
    }, [enabled, measure, navRef, signature]);

    return enabled ? state : OFF;
};
