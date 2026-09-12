import { useEffect, useState } from 'react';

const getSystemColorScheme = (): 'light' | 'dark' =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';

/**
 * Acompanha `prefers-color-scheme` do sistema operacional em tempo real — é o
 * que faz a preferência "modo: sistema" reagir à troca do SO sem reload da
 * página.
 */
export const usePreferencesSystemColorScheme = (): 'light' | 'dark' => {
    const [scheme, setScheme] = useState<'light' | 'dark'>(getSystemColorScheme);

    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (event: MediaQueryListEvent) => setScheme(event.matches ? 'dark' : 'light');
        mql.addEventListener('change', handleChange);
        return () => mql.removeEventListener('change', handleChange);
    }, []);

    return scheme;
};
