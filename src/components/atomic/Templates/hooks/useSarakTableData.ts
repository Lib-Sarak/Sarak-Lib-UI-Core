import { useState, useEffect } from 'react';
import api from '../../../../shared/services/api';

export const useSarakTableData = <T extends Record<string, unknown>>(endpoint?: string, initialData?: T[]) => {
    const [state, setState] = useState({
        data: initialData || ([] as T[]),
        loading: !initialData && Boolean(endpoint),
        error: null as string | null,
        search: ''
    });

    const updateState = (updates: Partial<typeof state>) => {
        setState(prev => ({ ...prev, ...updates }));
    };

    const fetchData = async () => {
        if (!endpoint) return;
        try {
            updateState({ loading: true, error: null });
            const response = await api.get(endpoint);
            
            if (Array.isArray(response.data)) {
                updateState({ data: response.data, loading: false });
                return;
            }
            if (response.data && Array.isArray(response.data.items)) {
                updateState({ data: response.data.items, loading: false });
                return;
            }
            
            updateState({ data: [], loading: false });
        } catch (err: unknown) {
            console.error(`[SarakTable] Falha ao carregar ${endpoint}:`, err);
            const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados';
            updateState({ error: errorMessage, loading: false });
        }
    };

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
    }, [endpoint, initialData]);

    const filteredData = state.data.filter(item => 
        Object.values(item).some(val => 
            String(val).toLowerCase().includes(state.search.toLowerCase())
        )
    );

    return {
        data: state.data,
        filteredData,
        loading: state.loading,
        error: state.error,
        search: state.search,
        setSearch: (v: string) => updateState({ search: v }),
        fetchData
    };
};
