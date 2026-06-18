import { useEffect, useReducer } from 'react';
import api from '../../../../shared/services/api';

type State = {
    data: any[];
    loading: boolean;
    activeModal: { type: string; group?: string } | null;
};

type Action =
    | { type: 'FETCH_START' }
    | { type: 'FETCH_SUCCESS'; payload: any[] }
    | { type: 'FETCH_ERROR' }
    | { type: 'SET_MODAL'; payload: { type: string; group?: string } | null };

function reducer(state: State, action: Action): State {
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

export const useManagementGrid = (endpoint: string, groupBy: string, ghostGroups: string[], getVal: (obj: any, path: string) => any) => {
    const [state, dispatch] = useReducer(reducer, { data: [], loading: true, activeModal: null });

    const load = async () => {
        dispatch({ type: 'FETCH_START' });
        try {
            const res = await api.get(endpoint);
            dispatch({ type: 'FETCH_SUCCESS', payload: res.data || [] });
        } catch (e) {
            console.error("[SarakManagementGrid] Erro:", e);
            dispatch({ type: 'FETCH_ERROR' });
        }
    };

    useEffect(() => { load(); }, [endpoint]);

    const handleToggle = async (id: string) => {
        try {
            await api.post(`${endpoint}/${id}/toggle`);
            load();
        } catch (e) {
            console.error("Erro toggle:", e);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Remover permanentemente?")) return;
        try {
            await api.delete(`${endpoint}/${id}`);
            load();
        } catch (e) {
            console.error("Erro delete:", e);
        }
    };

    const handleAction = (action: string, group?: string) => {
        if (action.includes('modal') || action.includes('add')) {
            dispatch({ type: 'SET_MODAL', payload: { type: action, group } });
        }
    };

    const groups = state.data.reduce((acc, item: any) => {
        const key = getVal(item, groupBy) || 'outros';
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {} as Record<string, any[]>);

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
