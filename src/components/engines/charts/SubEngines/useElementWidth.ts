import { useCallback, useRef, useState } from 'react';
import type { RefCallback } from 'react';

/** Largura do elemento em px, atualizada a cada redimensionamento; 0 enquanto desconhecida (sem `ResizeObserver`). */
export function useElementWidth(): [RefCallback<HTMLElement>, number] {
    const [width, setWidth] = useState(0);
    const observer = useRef<ResizeObserver | null>(null);
    const ref = useCallback((node: HTMLElement | null) => {
        observer.current?.disconnect();
        observer.current = null;
        if (!node || typeof ResizeObserver === 'undefined') return;
        setWidth(Math.round(node.getBoundingClientRect().width));
        observer.current = new ResizeObserver(([entry]) => setWidth(Math.round(entry?.contentRect.width ?? 0)));
        observer.current.observe(node);
    }, []);
    return [ref, width];
}
