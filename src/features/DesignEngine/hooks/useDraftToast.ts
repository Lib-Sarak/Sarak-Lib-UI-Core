import { useState, useCallback, useRef, useEffect } from 'react';

const TOAST_DURATION_MS = 3000;

/**
 * Aviso transitório do painel. Cada aviso fica o prazo inteiro dele: o timer do
 * anterior é cancelado ao mostrar o seguinte, e o pendente morre com o hook.
 * O formato do aviso é inline de propósito: um tipo nomeado vazaria para o
 * dist/index.d.ts sem ser exportado (public-types:check).
 */
export const useDraftToast = () => {
    const [toast, setToast] = useState<{ type: 'success' | 'warning'; message: string } | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showToast = useCallback((type: 'success' | 'warning', message: string) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setToast({ type, message });
        timerRef.current = setTimeout(() => setToast(null), TOAST_DURATION_MS);
    }, []);

    useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

    return { toast, showToast };
};
