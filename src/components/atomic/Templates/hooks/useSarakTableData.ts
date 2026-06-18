import { useState, useEffect } from 'react';
import api from '../../../../shared/services/api';

export const useSarakTableData = (endpoint: string) => {
    const [state, setState] = useState({
        data: [] as any[],
        loading: true,
        error: null as string | null,
        search: ''
    });

    const updateState = (updates: Partial<typeof state>) => {
        setState(prev => ({ ...prev, ...updates }));
    };

    const fetchData = async () => {
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
        } catch (err: any) {
            console.error(`[SarakTable] Falha ao carregar ${endpoint}:`, err);
            updateState({ error: err.message || 'Erro ao carregar dados', loading: false });
        }
    };

    useEffect(() => {
        fetchData();
    }, [endpoint]);

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
