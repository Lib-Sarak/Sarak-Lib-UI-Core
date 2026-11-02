import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

const printQuery = (): MediaQueryList | null =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia('print') : null;

/**
 * A página está sendo impressa. O `beforeprint` atualiza de forma síncrona porque o navegador
 * fotografa a página logo depois dele: sem isso a impressão sai com as linhas virtuais da tela.
 */
export const useIsPrinting = (): boolean => {
    const [printing, setPrinting] = useState(() => printQuery()?.matches === true);
    useEffect(() => {
        const query = printQuery();
        const onQuery = (event: MediaQueryListEvent): void => setPrinting(event.matches);
        const onBefore = (): void => flushSync(() => setPrinting(true));
        const onAfter = (): void => setPrinting(false);
        query?.addEventListener?.('change', onQuery);
        window.addEventListener('beforeprint', onBefore);
        window.addEventListener('afterprint', onAfter);
        return () => {
            query?.removeEventListener?.('change', onQuery);
            window.removeEventListener('beforeprint', onBefore);
            window.removeEventListener('afterprint', onAfter);
        };
    }, []);
    return printing;
};
