import { useState, useCallback, useEffect, useRef } from 'react';

interface UseResizableOptions {
    initialSize: number;
    minSize: number;
    maxSize: number;
    direction: 'horizontal' | 'vertical';
    onResize?: (newSize: number) => void;
    onResizeEnd?: (finalSize: number) => void;
}

export const useResizable = ({
    initialSize,
    minSize,
    maxSize,
    direction,
    onResize,
    onResizeEnd
}: UseResizableOptions) => {
    const [state, setState] = useState({ size: initialSize, isResizing: false });
    
    const startPosRef = useRef(0);
    const startSizeRef = useRef(initialSize);
    const callbacksRef = useRef({ onResize, onResizeEnd });
    
    // Sync callbacks sem precisar de useEffect
    callbacksRef.current = { onResize, onResizeEnd };

    const startResizing = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
        if (e) {
            e.preventDefault();
        }
        
        const ev = e as React.MouseEvent;
        setState(prev => ({ ...prev, isResizing: true }));
        
        startPosRef.current = direction === 'horizontal' ? (ev ? ev.clientX : 0) : (ev ? ev.clientY : 0);
        startSizeRef.current = state.size;

        document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
        document.body.style.userSelect = 'none';
    }, [state.size, direction]);

    const stopResizing = useCallback(() => {
        if (state.isResizing) {
            setState(prev => ({ ...prev, isResizing: false }));
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            callbacksRef.current.onResizeEnd?.(state.size);
        }
    }, [state.isResizing, state.size]);

    const resize = useCallback((e: MouseEvent) => {
        if (!state.isResizing) return;

        const currentPos = direction === 'horizontal' ? e.clientX : e.clientY;
        const delta = currentPos - startPosRef.current;
        let newSize = startSizeRef.current + delta;

        if (newSize < minSize) newSize = minSize;
        if (newSize > maxSize) newSize = maxSize;

        setState(prev => ({ ...prev, size: newSize }));
        callbacksRef.current.onResize?.(newSize);
    }, [state.isResizing, direction, minSize, maxSize]);

    useEffect(() => {
        if (state.isResizing) {
            window.addEventListener('mousemove', resize);
            window.addEventListener('mouseup', stopResizing);
        }

        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [state.isResizing, resize, stopResizing]);

    return {
        size: state.size,
        isResizing: state.isResizing,
        startResizing
    };
};
