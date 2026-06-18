import { useState, useEffect, useCallback } from 'react';
import api from '../../../../shared/services/api';

export const useCardGridState = (endpoint: string) => {
    const [state, setState] = useState({
        data: [] as any[],
        loading: true,
        error: null as string | null,
        search: '',
        activeFilters: {} as Record<string, string>
    });

    const fetchData = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));
            const response = await api.get(endpoint);
            const rawData = response.data.items || response.data || [];
            setState(prev => ({ ...prev, data: Array.isArray(rawData) ? rawData : [], loading: false }));
        } catch (err: any) {
            console.error(`[SarakCardGrid] Erro:`, err);
            setState(prev => ({ ...prev, error: err.message || 'Erro ao carregar', loading: false }));
        }
    }, [endpoint]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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
