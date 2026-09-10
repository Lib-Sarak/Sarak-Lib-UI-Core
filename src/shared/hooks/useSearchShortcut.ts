import { useEffect } from 'react';

/**
 * Atalho global de busca (Ctrl/Cmd+K). Extraído do `SarakShell`
 * (`core/Shell/hooks/useSarakShellUI.ts`) para o modo ui-kit (`SarakAppChrome`) reusar o
 * mesmo listener em vez de reimplementá-lo.
 */
export const useSearchShortcut = (onTrigger: () => void): void => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                onTrigger();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onTrigger]);
};
