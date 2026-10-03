import { useEffect } from 'react';

/**
 * Atalho global de busca (Ctrl/Cmd+K), compartilhado pelo `SarakShell` e pelo
 * `SarakAppChrome` — um listener só, nunca dois. `enabled=false` não escuta: o
 * Ctrl/Cmd+K do navegador só é interceptado quando há, de fato, uma busca para abrir.
 */
export const useSearchShortcut = (onTrigger: () => void, enabled: boolean = true): void => {
    useEffect(() => {
        if (!enabled) return undefined;
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                onTrigger();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onTrigger, enabled]);
};
