import { useEffect, useReducer } from 'react';
import api from '../../../../shared/services/api';

type State = {
    data: any[];
    loading: boolean;
    error: string | null;
};

type Action = 
    | { type: 'FETCH_START' }
    | { type: 'FETCH_SUCCESS'; payload: any[] }
    | { type: 'FETCH_ERROR'; payload: string };

function reducer(state: State, action: Action): State {
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

export const useChartData = (endpoint: string) => {
    const [state, dispatch] = useReducer(reducer, { data: [], loading: true, error: null });

    useEffect(() => {
        const fetchData = async () => {
            try {
                dispatch({ type: 'FETCH_START' });
                const response = await api.get(endpoint);
                
                // Tenta localizar a lista de tendência nos dados retornados
                // Prioriza 'daily_trend' ou o próprio corpo se for lista
                const rawData = response.data.daily_trend || (Array.isArray(response.data) ? response.data : []);
                dispatch({ type: 'FETCH_SUCCESS', payload: rawData.slice(-15) });
            } catch (err: any) {
                console.error(`[SarakChart] Falha ao carregar ${endpoint}:`, err);
                dispatch({ type: 'FETCH_ERROR', payload: err.message || 'Erro' });
            }
        };

        fetchData();
    }, [endpoint]);

    return state;
};
