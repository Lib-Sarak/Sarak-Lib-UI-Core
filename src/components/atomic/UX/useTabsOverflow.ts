import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

export type SarakTabsOverflow = 'scroll' | 'wrap' | 'menu';

export interface TabsOverflowState {
    listRef: React.RefObject<HTMLDivElement>;
    wrapperRef: React.RefObject<HTMLDivElement>;
    /** Índices das abas que não cabem na faixa (`menu`). */
    hiddenIndexes: ReadonlySet<number>;
    /** Há mais abas além da borda inicial / final (`scroll`). */
    moreAtStart: boolean;
    moreAtEnd: boolean;
    /** Remede ao rolar a faixa (`scroll`). */
    onScroll: () => void;
}

const NONE: ReadonlySet<number> = new Set();

const sameSet = (a: ReadonlySet<number>, b: ReadonlySet<number>): boolean =>
    a.size === b.size && [...a].every((index) => b.has(index));

const measureHidden = (list: HTMLDivElement, wrapper: HTMLDivElement, reserve: number): ReadonlySet<number> => {
    if (list.scrollWidth <= wrapper.clientWidth) return NONE;
    const limit = wrapper.clientWidth - reserve;
    const hidden = new Set<number>();
    Array.from(list.children).forEach((child, index) => {
        const element = child as HTMLElement;
        if (element.offsetLeft + element.offsetWidth > limit) hidden.add(index);
    });
    return hidden;
};

/** Mede a faixa de abas: o que rolou (`scroll`) ou o que não cabe (`menu`). `wrap` não mede nada. */
export const useTabsOverflow = (mode: SarakTabsOverflow, tabCount: number): TabsOverflowState => {
    const listRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [hiddenIndexes, setHiddenIndexes] = useState<ReadonlySet<number>>(NONE);
    const [edges, setEdges] = useState({ start: false, end: false });

    const measure = useCallback((): void => {
        const list = listRef.current;
        const wrapper = wrapperRef.current;
        if (!list || !wrapper) return;
        if (mode === 'scroll') {
            const next = { start: list.scrollLeft > 0, end: list.scrollLeft + list.clientWidth < list.scrollWidth - 1 };
            setEdges((current) => (current.start === next.start && current.end === next.end ? current : next));
        }
        if (mode === 'menu') {
            const next = measureHidden(list, wrapper, wrapper.querySelector<HTMLElement>('[data-sarak-tabs-trigger]')?.offsetWidth ?? 0);
            setHiddenIndexes((current) => (sameSet(current, next) ? current : next));
        }
    }, [mode]);

    // Roda depois de cada render: a lista de abas e o gatilho do menu mudam a medida.
    useLayoutEffect(measure, [measure, tabCount, hiddenIndexes.size]);
    useEffect(() => {
        const list = listRef.current;
        if (!list || mode === 'wrap' || typeof ResizeObserver === 'undefined') return undefined;
        const observer = new ResizeObserver(measure);
        observer.observe(list);
        if (wrapperRef.current) observer.observe(wrapperRef.current);
        return () => observer.disconnect();
    }, [mode, measure]);

    return { listRef, wrapperRef, hiddenIndexes, moreAtStart: edges.start, moreAtEnd: edges.end, onScroll: measure };
};
