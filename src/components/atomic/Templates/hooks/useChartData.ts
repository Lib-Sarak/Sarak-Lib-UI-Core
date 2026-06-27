import { useEffect, useReducer } from 'react';
import api from '../../../../shared/services/api';

type State<T> = {
    data: T[];
    loading: boolean;
    error: string | null;
};

type Action<T> = 
    | { type: 'FETCH_START' }
    | { type: 'FETCH_SUCCESS'; payload: T[] }
    | { type: 'FETCH_ERROR'; payload: string };

function reducer<T>(state: State<T>, action: Action<T>): State<T> {
    switch (action.type) {
        case 'FETCH_START':
            return { ...state, loading: true, error: null };
        case 'FETCH_SUCCESS':
            return { ...state, loading: false, data: action.payload };
        case 'FETCH_ERROR':
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
}

export const useChartData = <T extends Record<string, unknown>>(endpoint: string) => {
    const [state, dispatch] = useReducer<React.Reducer<State<T>, Action<T>>>(reducer, { data: [], loading: true, error: null });

    useEffect(() => {
        const fetchData = async () => {
            try {
                dispatch({ type: 'FETCH_START' });
                const response = await api.get(endpoint);
                
                // Tenta localizar a lista de tendência nos dados retornados
                // Prioriza 'daily_trend' ou o próprio corpo se for lista
                const rawData = response.data.daily_trend || (Array.isArray(response.data) ? response.data : []);
                dispatch({ type: 'FETCH_SUCCESS', payload: rawData.slice(-15) });
            } catch (err: unknown) {
                console.error(`[SarakChart] Falha ao carregar ${endpoint}:`, err);
                const errorMessage = err instanceof Error ? err.message : 'Erro';
                dispatch({ type: 'FETCH_ERROR', payload: errorMessage });
            }
        };

        fetchData();
    }, [endpoint]);

    return state;
};
