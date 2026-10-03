import { useState, useEffect, useCallback } from 'react';
import api from '../../../../shared/services/api';

export const useCardGridState = <T extends Record<string, unknown>>(endpoint?: string, initialData?: T[]) => {
    const [state, setState] = useState({
        data: initialData || ([] as T[]),
        loading: !initialData && Boolean(endpoint),
        error: null as string | null,
        search: '',
        activeFilters: {} as Record<string, string>
    });

    const fetchData = useCallback(async () => {
        if (!endpoint) return;
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));
            const response = await api.get(endpoint);
            const rawData = response.data.items || response.data || [];
            setState(prev => ({ ...prev, data: Array.isArray(rawData) ? rawData : [], loading: false }));
        } catch (err: unknown) {
            console.error(`[SarakCardGrid] Erro:`, err);
            const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar';
            setState(prev => ({ ...prev, error: errorMessage, loading: false }));
        }
    }, [endpoint]);

    useEffect(() => {
        // Dado pronto vence endpoint (mesmo contrato de `useSarakStatsData`): com
        // `data`, nunca há chamada de rede — nem para revalidar, nem no mount.
        if (initialData) {
            setState(prev => {
                if (JSON.stringify(prev.data) === JSON.stringify(initialData)) return prev;
                return { ...prev, data: initialData, loading: false };
            });
            return;
        }
        if (endpoint) {
            fetchData();
        }
    }, [fetchData, initialData, endpoint]);

    const setSearch = useCallback((search: string) => {
        setState(prev => ({ ...prev, search }));
    }, []);

    const setActiveFilters = useCallback((updater: (prev: Record<string, string>) => Record<string, string>) => {
        setState(prev => ({ ...prev, activeFilters: updater(prev.activeFilters) }));
    }, []);

    return {
        ...state,
        setSearch,
        setActiveFilters
    };
};
