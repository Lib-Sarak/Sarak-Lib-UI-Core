import { useLayoutEffect, type RefObject } from 'react';
import { MENU_ITEM_FONT_SIZE } from '../../atomic/Navigation/menuItemMetrics';

/** A altura de linha do nome (sem unidade) e o teto de linhas: o nome quebra entre palavras em até duas. */
export const BRAND_NAME_LINE_HEIGHT = 1.2;
const BRAND_NAME_MAX_LINES = 2;
/** Cada passo de redução da fonte, em px. */
const FIT_STEP_PX = 1;
const PIXEL_TOLERANCE = 1;

/** O piso da redução: o rótulo do item de menu (`MENU_ITEM_FONT_SIZE`, em rem), na fonte da raiz do documento. */
const readFloorPx = (): number => {
    const root = parseFloat(getComputedStyle(document.documentElement).fontSize) || 0;
    return parseFloat(MENU_ITEM_FONT_SIZE) * root;
};

const overflows = (element: HTMLElement, sizePx: number): boolean =>
    element.scrollWidth > element.clientWidth + PIXEL_TOLERANCE
    || element.scrollHeight > sizePx * BRAND_NAME_LINE_HEIGHT * BRAND_NAME_MAX_LINES + PIXEL_TOLERANCE;

/**
 * Faz o nome da marca caber sem reticências: volta à fonte do tema e a reduz de 1 em 1 px enquanto o nome passar de duas
 * linhas ou uma palavra for mais larga que a caixa, sem ficar abaixo do rótulo do item de menu. Sem layout (teste em
 * `jsdom`), as medidas são 0 e a fonte do tema fica como está.
 */
export const useFitBrandName = (ref: RefObject<HTMLElement | null>, name: string | undefined): void => {
    useLayoutEffect(() => {
        const element = ref.current;
        if (!element) return undefined;
        const tokenMaxWidth = element.style.maxWidth;
        const fit = (): void => {
            element.style.fontSize = '';
            element.style.maxWidth = tokenMaxWidth;
            const natural = parseFloat(getComputedStyle(element).fontSize);
            const floor = readFloorPx();
            let size = natural;
            while (Number.isFinite(size) && size > floor && overflows(element, size)) {
                size -= FIT_STEP_PX;
                element.style.fontSize = `${size}px`;
            }
            // No piso da fonte e ainda além de duas linhas: a largura de quebra do token cede à largura que a barra tem.
            if (size <= floor && overflows(element, size)) element.style.maxWidth = '100%';
        };
        fit();
        const parent = element.parentElement;
        if (!parent || typeof ResizeObserver === 'undefined') return undefined;
        const observer = new ResizeObserver(fit);
        observer.observe(parent);
        return () => observer.disconnect();
    }, [ref, name]);
};
