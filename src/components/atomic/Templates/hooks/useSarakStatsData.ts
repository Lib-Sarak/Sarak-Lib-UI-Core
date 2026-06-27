import { useState, useEffect } from 'react';
import api from '../../../../shared/services/api';

export function useSarakStatsData<T extends Record<string, unknown>>(endpoint?: string, initialData?: T) {
    const [state, setState] = useState({
        stats: initialData || ({} as T),
        loading: !initialData,
        error: null as string | null
    });

    const updateState = (updates: Partial<typeof state>) => {
        setState(prev => ({ ...prev, ...updates }));
    };

    const fetchData = async () => {
        if (!endpoint) return;
        try {
            updateState({ error: null });
            const response = await api.get(endpoint);
            updateState({ stats: response.data as T });
        } catch (err: unknown) {
            console.error(`[SarakStats] Falha ao carregar ${endpoint}:`, err);
            const errorMessage = err instanceof Error ? err.message : 'Erro';
            updateState({ error: errorMessage });
        } finally {
            updateState({ loading: false });
        }
    };

    useEffect(() => {
        if (initialData) {
            setState(prev => {
                if (JSON.stringify(prev.stats) === JSON.stringify(initialData)) return prev;
                return { ...prev, stats: initialData, loading: false };
            });
            return;
        }
        if (endpoint) {
            fetchData();
        }
    }, [endpoint, initialData]);

    return { stats: state.stats, loading: state.loading, error: state.error };
}
