import { useEffect } from 'react';

export function useVisualSafetyGate() {
    useEffect(() => {
        const checkCSS = () => {
            const testElement = document.documentElement;
            const primaryColor = getComputedStyle(testElement).getPropertyValue('--theme-primary').trim();
            
            if (!primaryColor || primaryColor === '') {
                console.warn("[Sarak:Shell] Visual Safety Gate Triggered: CSS variables not detected. Theme data was not hydrated.");
            }
        };

        const timer = setTimeout(checkCSS, 1500);
        return () => clearTimeout(timer);
    }, []);
}
