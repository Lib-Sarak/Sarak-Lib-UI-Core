import { useEffect, useReducer, useCallback } from 'react';
import api from '../../../../shared/services/api';

type State = {
    data: any[];
    subItems: any[];
    loading: boolean;
};

type Action = 
    | { type: 'FETCH_START' }
    | { type: 'FETCH_SUCCESS'; payload: { data: any[]; subItems: any[] } }
    | { type: 'FETCH_ERROR' };

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'FETCH_START':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return { ...state, loading: false, data: action.payload.data, subItems: action.payload.subItems };
        case 'FETCH_ERROR':
            return { ...state, loading: false };
        default:
            return state;
    }
}

export const useExpandableMatrixEngine = (config: any, mainEndpoint: string, subItemsEndpoint: string, resolveEndpoint: (e: string) => string) => {
    const [state, dispatch] = useReducer(reducer, { data: [], subItems: [], loading: true });

    const fetchData = useCallback(async () => {
        if (!mainEndpoint || !subItemsEndpoint) return;
        dispatch({ type: 'FETCH_START' });
        try {
            const [mainRes, subRes] = await Promise.all([
                api.get(mainEndpoint),
                api.get(subItemsEndpoint)
            ]);
            
            const mainData = Array.isArray(mainRes.data) ? mainRes.data : (mainRes.data?.items || []);
            const subData = Array.isArray(subRes.data) ? subRes.data : (subRes.data?.items || []);
            
            dispatch({ type: 'FETCH_SUCCESS', payload: { data: mainData, subItems: subData } });
        } catch (err) {
            console.error("[MatrixEngine] Erro ao buscar dados:", err);
            dispatch({ type: 'FETCH_ERROR' });
        }
    }, [mainEndpoint, subItemsEndpoint]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const findNodeInTree = (nodes: any[], id: string): any => {
        for (const node of nodes) {
            if (node.id === id) return node;
            if (node.children) {
                const found = findNodeInTree(node.children, id);
                if (found) return found;
            }
        }
        return null;
    };

    const handleToggle = async (parentId: string, subItemId: string) => {
        const toggleEndpointRaw = config.toggleEndpoint;
        if (!toggleEndpointRaw) return;

        // Resolve endpoint e substitui placeholders dinâmicos
        let resolved = resolveEndpoint(toggleEndpointRaw)
            .replace('{id}', parentId)
            .replace('{role_id}', parentId);

        try {
            const subItem = findNodeInTree(state.subItems, subItemId); // <-- Usar busca em árvore
            // Enviamos o identificador esperado pelo backend (permission_name)
            await api.post(resolved, { 
                permission_name: subItem?.id || subItemId // <-- ID absoluto para o backend
            });
            await fetchData(); // Sincroniza o estado binário imediatamente
        } catch (err) {
            console.error("[MatrixEngine] Erro no toggle:", err);
        }
    };

    const activeMapping = (parentId: string, subItemId: string) => {
        const parent = state.data.find(p => p.id === parentId);
        const subItem = findNodeInTree(state.subItems, subItemId); // <-- Usar busca em árvore
        if (!parent || !subItem) return false;

        const mappingField = config.mappingField || 'sub_items';
        const subItemIdentifier = config.subItemIdentifier || 'id';
        
        const activeList = parent[mappingField] || [];
        const valueToCompare = subItem[subItemIdentifier];

        return Array.isArray(activeList) && activeList.includes(valueToCompare);
    };

    return {
        data: state.data,
        subItems: state.subItems,
        loading: state.loading,
        handleToggle,
        activeMapping
    };
};
