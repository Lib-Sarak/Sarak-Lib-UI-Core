import { useEffect, useReducer } from 'react';

type State = {
    isExpanded: boolean;
    mounted: boolean;
};

type Action = 
    | { type: 'SET_EXPANDED'; payload: boolean }
    | { type: 'SET_MOUNTED'; payload: boolean };

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'SET_EXPANDED':
            return { ...state, isExpanded: action.payload };
        case 'SET_MOUNTED':
            return { ...state, mounted: action.payload };
        default:
            return state;
    }
}

export const useExpandableCard = () => {
    const [state, dispatch] = useReducer(reducer, { isExpanded: false, mounted: false });

    useEffect(() => {
        dispatch({ type: 'SET_MOUNTED', payload: true });
        
        if (state.isExpanded) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        
        return () => {
            document.body.style.overflow = '';
        };
    }, [state.isExpanded]);

    return {
        isExpanded: state.isExpanded,
        setIsExpanded: (val: boolean) => dispatch({ type: 'SET_EXPANDED', payload: val }),
        mounted: state.mounted
    };
};
