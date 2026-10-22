import { useEffect, useRef } from 'react';
import { releaseInjectedWrites, writeInjectedAttribute } from '../utils/injectedWrites';

export const useBodyThemeTransition = (isEmbedded: boolean): void => {
    const ownerRef = useRef<object>({});

    useEffect(() => {
        if (
            isEmbedded || typeof document === 'undefined' || typeof window === 'undefined'
            || typeof window.requestAnimationFrame !== 'function'
        ) return;

        const body = document.body;
        let firstFrame = 0;
        let secondFrame = 0;
        firstFrame = window.requestAnimationFrame(() => {
            secondFrame = window.requestAnimationFrame(() =>
                writeInjectedAttribute(body, 'data-sarak-theme-ready', 'true', ownerRef.current),
            );
        });

        return () => {
            window.cancelAnimationFrame(firstFrame);
            window.cancelAnimationFrame(secondFrame);
            releaseInjectedWrites(body, ownerRef.current);
        };
    }, [isEmbedded]);
};
