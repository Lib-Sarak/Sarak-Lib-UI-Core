import { useEffect, type RefObject } from 'react';

/**
 * Chama `onVisible` uma vez, quando o elemento entra na área visível, e para de observar. Sem `IntersectionObserver`
 * (ambiente que não o tem) chama na hora: perder a carga seria pior que adiantá-la.
 */
export const useOnFirstVisible = (ref: RefObject<HTMLElement | null>, onVisible: () => void): void => {
    useEffect(() => {
        const element = ref.current;
        if (!element) return undefined;
        if (typeof IntersectionObserver === 'undefined') {
            onVisible();
            return undefined;
        }
        const observer = new IntersectionObserver((entries) => {
            if (!entries.some((entry) => entry.isIntersecting)) return;
            observer.disconnect();
            onVisible();
        });
        observer.observe(element);
        return () => observer.disconnect();
    }, [ref, onVisible]);
};
