import { useState, useEffect } from 'react';
import api from '../../../../shared/services/api';

export function useSarakStatsData(endpoint?: string, initialData?: Record<string, any>) {
    const [state, setState] = useState({
        stats: initialData || {},
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
            updateState({ stats: response.data });
        } catch (err: any) {
            console.error(`[SarakStats] Falha ao carregar ${endpoint}:`, err);
            updateState({ error: err.message || 'Erro' });
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
