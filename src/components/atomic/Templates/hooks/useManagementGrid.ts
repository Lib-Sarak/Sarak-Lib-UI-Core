import { useEffect, useReducer } from 'react';
import api from '../../../../shared/services/api';

type State<T> = {
    data: T[];
    loading: boolean;
    activeModal: { type: string; group?: string } | null;
};

type Action<T> =
    | { type: 'FETCH_START' }
    | { type: 'FETCH_SUCCESS'; payload: T[] }
    | { type: 'FETCH_ERROR' }
    | { type: 'SET_MODAL'; payload: { type: string; group?: string } | null };

function reducer<T>(state: State<T>, action: Action<T>): State<T> {
    switch (action.type) {
        case 'FETCH_START':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return { ...state, loading: false, data: action.payload };
        case 'FETCH_ERROR':
            return { ...state, loading: false };
        case 'SET_MODAL':
            return { ...state, activeModal: action.payload };
        default:
            return state;
    }
}

export const useManagementGrid = <T extends Record<string, unknown>>(
    endpoint: string, 
    groupBy: string, 
    ghostGroups: string[], 
    getVal: (obj: T, path: string) => unknown
) => {
    const [state, dispatch] = useReducer<React.Reducer<State<T>, Action<T>>>(reducer, { 
        data: [], 
        loading: true, 
        activeModal: null 
    });

    const load = async () => {
        dispatch({ type: 'FETCH_START' });
        try {
            const res = await api.get(endpoint);
            dispatch({ type: 'FETCH_SUCCESS', payload: res.data || [] });
        } catch (e: unknown) {
            console.error("[SarakManagementGrid] Erro:", e);
            dispatch({ type: 'FETCH_ERROR' });
        }
    };

    useEffect(() => { load(); }, [endpoint]);

    const handleToggle = async (id: string) => {
        try {
            await api.post(`${endpoint}/${id}/toggle`);
            load();
        } catch (e: unknown) {
            console.error("Erro toggle:", e);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Remover permanentemente?")) return;
        try {
            await api.delete(`${endpoint}/${id}`);
            load();
        } catch (e: unknown) {
            console.error("Erro delete:", e);
        }
    };

    const handleAction = (action: string, group?: string) => {
        if (action.includes('modal') || action.includes('add')) {
            dispatch({ type: 'SET_MODAL', payload: { type: action, group } });
        }
    };

    const groups = state.data.reduce((acc, item: T) => {
        const key = String(getVal(item, groupBy) || 'outros');
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {} as Record<string, T[]>);

    ghostGroups.forEach(g => { if (!groups[g]) groups[g] = []; });

    return {
        groups,
        loading: state.loading,
        activeModal: state.activeModal,
        setActiveModal: (modal: { type: string; group?: string } | null) => dispatch({ type: 'SET_MODAL', payload: modal }),
        load,
        handleToggle,
        handleDelete,
        handleAction
    };
};
