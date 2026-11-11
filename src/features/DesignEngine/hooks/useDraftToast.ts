import { useState, useCallback, useRef, useEffect } from 'react';

const TOAST_DURATION_MS = 3000;

export interface DraftToast {
    type: 'success' | 'warning';
    message: string;
}

/**
 * Aviso transitório do painel. Cada aviso fica o prazo inteiro dele: o timer do
 * anterior é cancelado ao mostrar o seguinte, e o pendente morre com o hook.
 */
export const useDraftToast = () => {
    const [toast, setToast] = useState<DraftToast | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showToast = useCallback((type: DraftToast['type'], message: string) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setToast({ type, message });
        timerRef.current = setTimeout(() => setToast(null), TOAST_DURATION_MS);
    }, []);

    useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

    return { toast, showToast };
};
