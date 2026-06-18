import { useEffect, useRef, useReducer } from 'react';

type State = {
    isReady: boolean;
    dimensions: { w: number; h: number };
};

type Action = 
    | { type: 'SET_READY'; payload: boolean }
    | { type: 'SET_DIMENSIONS'; payload: { w: number; h: number } };

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'SET_READY':
            return { ...state, isReady: action.payload };
        case 'SET_DIMENSIONS':
            return { ...state, dimensions: action.payload };
        default:
            return state;
    }
}

export function useDimensionGuard(activeModuleId: string | null) {
    const [state, dispatch] = useReducer(reducer, { isReady: false, dimensions: { w: 0, h: 0 } });
    const contentRef = useRef<HTMLDivElement>(null);
    const stabilityTimer = useRef<NodeJS.Timeout | null>(null);
    const fallbackTimer = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!contentRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                dispatch({ type: 'SET_DIMENSIONS', payload: { w: width, h: height } });
                
                if (stabilityTimer.current) clearTimeout(stabilityTimer.current);

                if (width > 100 && height > 100) {
                    stabilityTimer.current = setTimeout(() => {
                        if (!state.isReady) {
                            dispatch({ type: 'SET_READY', payload: true });
                            if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
                        }
                    }, 100);
                }
            }
        });

        observer.observe(contentRef.current);

        fallbackTimer.current = setTimeout(() => {
            if (!state.isReady) {
                console.warn("[Sarak:Shell] Dimension Guard: Tempo limite de estabilização excedido. Forçando montagem.");
                dispatch({ type: 'SET_READY', payload: true });
            }
        }, 3000);

        return () => {
            observer.disconnect();
            if (stabilityTimer.current) clearTimeout(stabilityTimer.current);
            if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
        };
    }, [state.isReady]);

    useEffect(() => {
        dispatch({ type: 'SET_READY', payload: false });
    }, [activeModuleId]);

    return { isReady: state.isReady, contentRef, dimensions: state.dimensions };
}
