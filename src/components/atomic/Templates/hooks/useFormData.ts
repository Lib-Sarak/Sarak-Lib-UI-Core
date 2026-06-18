import { useEffect, useReducer } from 'react';
import api from '../../../../shared/services/api';

type State = {
    formData: Record<string, any>;
    loading: boolean;
    saving: boolean;
    status: { type: 'success' | 'error', message: string } | null;
};

type Action = 
    | { type: 'SET_FORM_DATA'; payload: Record<string, any> }
    | { type: 'UPDATE_FIELD'; key: string; value: any }
    | { type: 'FETCH_START' }
    | { type: 'FETCH_SUCCESS'; payload: Record<string, any> }
    | { type: 'FETCH_ERROR' }
    | { type: 'SAVE_START' }
    | { type: 'SAVE_SUCCESS'; payload: string }
    | { type: 'SAVE_ERROR'; payload: string }
    | { type: 'CLEAR_STATUS' };

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'SET_FORM_DATA':
            return { ...state, formData: action.payload };
        case 'UPDATE_FIELD':
            return { ...state, formData: { ...state.formData, [action.key]: action.value } };
        case 'FETCH_START':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return { ...state, loading: false, formData: action.payload };
        case 'FETCH_ERROR':
            return { ...state, loading: false };
        case 'SAVE_START':
            return { ...state, saving: true, status: null };
        case 'SAVE_SUCCESS':
            return { ...state, saving: false, status: { type: 'success', message: action.payload } };
        case 'SAVE_ERROR':
            return { ...state, saving: false, status: { type: 'error', message: action.payload } };
        case 'CLEAR_STATUS':
            return { ...state, status: null };
        default:
            return state;
    }
}

export const useFormData = (endpoint: string, mode: string, initialData: any, mapping?: any, actions?: any, onSuccess?: () => void) => {
    const [state, dispatch] = useReducer(reducer, {
        formData: initialData,
        loading: mode === 'edit',
        saving: false,
        status: null
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                dispatch({ type: 'FETCH_START' });
                const response = await api.get(endpoint);
                dispatch({ type: 'FETCH_SUCCESS', payload: response.data });
            } catch (err) {
                console.error('[SarakForm] Erro ao carregar dados:', err);
                dispatch({ type: 'FETCH_ERROR' });
            }
        };

        if (mode === 'edit') {
            fetchData();
        } else {
            // Em modo create, garantir que campos definidos no mapping existam no formData
            if (mapping) {
                const base: any = { ...initialData };
                Object.keys(mapping).forEach(k => { if (base[k] === undefined) base[k] = ''; });
                dispatch({ type: 'SET_FORM_DATA', payload: base });
            }
        }
    }, [endpoint, mode, initialData, mapping]);

    const handleChange = (key: string, value: any) => {
        dispatch({ type: 'UPDATE_FIELD', key, value });
    };

    const handleSave = async () => {
        const defaultMethod = mode === 'create' ? 'POST' : 'PATCH';
        const action = actions?.[0] || { endpoint: endpoint, method: defaultMethod };
        try {
            dispatch({ type: 'SAVE_START' });
            
            const method = action.method.toLowerCase();
            const response = await (api as any)[method](action.endpoint, state.formData);
            
            dispatch({ type: 'SAVE_SUCCESS', payload: 'Configurações sincronizadas com sucesso.' });
            if (onSuccess) onSuccess();
            setTimeout(() => dispatch({ type: 'CLEAR_STATUS' }), 3000);
        } catch (err: any) {
            dispatch({ type: 'SAVE_ERROR', payload: err.message || 'Falha ao salvar.' });
        }
    };

    return { 
        formData: state.formData, 
        loading: state.loading, 
        saving: state.saving, 
        status: state.status, 
        handleChange, 
        handleSave 
    };
};
