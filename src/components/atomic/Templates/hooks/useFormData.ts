import { useEffect, useReducer, useRef } from 'react';
import api from '../../../../shared/services/api';

type State<T> = {
    formData: T;
    loading: boolean;
    saving: boolean;
    status: { type: 'success' | 'error', message: string } | null;
};

type Action<T> = 
    | { type: 'SET_FORM_DATA'; payload: T }
    | { type: 'UPDATE_FIELD'; key: string; value: unknown }
    | { type: 'FETCH_START' }
    | { type: 'FETCH_SUCCESS'; payload: T }
    | { type: 'FETCH_ERROR' }
    | { type: 'SAVE_START' }
    | { type: 'SAVE_SUCCESS'; payload: string }
    | { type: 'SAVE_ERROR'; payload: string }
    | { type: 'CLEAR_STATUS' };

function reducer<T extends Record<string, unknown>>(state: State<T>, action: Action<T>): State<T> {
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

export type FormDataActionConfig = { endpoint: string; method: string };

export const useFormData = <T extends Record<string, unknown>>(
    endpoint: string, 
    mode: string, 
    initialData: T, 
    mapping?: Record<string, string>, 
    actions?: FormDataActionConfig[], 
    onSuccess?: () => void
) => {
    const [state, dispatch] = useReducer<React.Reducer<State<T>, Action<T>>>(reducer, {
        formData: initialData,
        loading: mode === 'edit',
        saving: false,
        status: null
    });

    // `initialData`/`mapping` são valores INICIAIS: lidos via ref, FORA das deps do
    // efeito. Com eles nas deps, um literal inline (`initialData={{}}`) re-criado a
    // cada render disparava o efeito de novo → refetch infinito em modo edit
    // (loop de render + chamadas à API sem fim — era o vazamento que derrubava a
    // suíte inteira por OOM e martelaria a API do consumidor em produção).
    const initialDataRef = useRef(initialData);
    const mappingRef = useRef(mapping);

    useEffect(() => {
        const fetchData = async () => {
            try {
                dispatch({ type: 'FETCH_START' });
                const response = await api.get(endpoint);
                dispatch({ type: 'FETCH_SUCCESS', payload: response.data as T });
            } catch (err: unknown) {
                console.error('[SarakForm] Erro ao carregar dados:', err);
                dispatch({ type: 'FETCH_ERROR' });
            }
        };

        if (mode === 'edit') {
            fetchData();
        } else {
            // Em modo create, garantir que campos definidos no mapping existam no formData
            const mapKeys = mappingRef.current;
            if (mapKeys) {
                const base: T = { ...initialDataRef.current };
                Object.keys(mapKeys).forEach(k => { if (base[k] === undefined) (base as Record<string, unknown>)[k] = ''; });
                dispatch({ type: 'SET_FORM_DATA', payload: base });
            }
        }
    }, [endpoint, mode]);

    const handleChange = (key: string, value: unknown) => {
        dispatch({ type: 'UPDATE_FIELD', key, value });
    };

    const handleSave = async () => {
        const defaultMethod = mode === 'create' ? 'POST' : 'PATCH';
        const action = actions?.[0] || { endpoint: endpoint, method: defaultMethod };
        try {
            dispatch({ type: 'SAVE_START' });
            
            const method = action.method.toLowerCase() as 'post' | 'patch' | 'put';
            await api[method](action.endpoint, state.formData);
            
            dispatch({ type: 'SAVE_SUCCESS', payload: 'Configurações sincronizadas com sucesso.' });
            if (onSuccess) onSuccess();
            setTimeout(() => dispatch({ type: 'CLEAR_STATUS' }), 3000);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Falha ao salvar.';
            dispatch({ type: 'SAVE_ERROR', payload: errorMessage });
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
