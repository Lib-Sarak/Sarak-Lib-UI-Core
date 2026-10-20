import { useEffect } from 'react';

export const useBodyThemeTransition = (isEmbedded: boolean): void => {
    useEffect(() => {
        if (
            isEmbedded || typeof document === 'undefined' || typeof window === 'undefined'
            || typeof window.requestAnimationFrame !== 'function'
        ) return;

        const body = document.body;
        const previousReadyValue = body.getAttribute('data-sarak-theme-ready');
        let firstFrame = 0;
        let secondFrame = 0;
        firstFrame = window.requestAnimationFrame(() => {
            secondFrame = window.requestAnimationFrame(() => body.setAttribute('data-sarak-theme-ready', 'true'));
        });

        return () => {
            window.cancelAnimationFrame(firstFrame);
            window.cancelAnimationFrame(secondFrame);
            if (body.getAttribute('data-sarak-theme-ready') !== 'true') return;
            if (previousReadyValue === null) body.removeAttribute('data-sarak-theme-ready');
            else body.setAttribute('data-sarak-theme-ready', previousReadyValue);
        };
    }, [isEmbedded]);
};
