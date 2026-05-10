import { useState, useCallback, useEffect, useRef } from 'react';

interface UseResizableOptions {
    initialSize: number;
    minSize: number;
    maxSize: number;
    direction: 'horizontal' | 'vertical';
    onResize?: (newSize: number) => void;
    onResizeEnd?: (finalSize: number) => void;
}

/**
 * useResizable (v1.1 - Professional Draggable)
 * Hook robusto para redimensionamento com suporte a overlay global 
 * e cálculo baseado em posição absoluta para evitar drift.
 */
export const useResizable = ({
    initialSize,
    minSize,
    maxSize,
    direction,
    onResize,
    onResizeEnd
}: UseResizableOptions) => {
    const [size, setSize] = useState(initialSize);
    const [isResizing, setIsResizing] = useState(false);
    
    // Referências para rastrear o estado durante o evento sem depender do ciclo do React
    const startPosRef = useRef(0);
    const startSizeRef = useRef(initialSize);

    const startResizing = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
        
        // Salva a posição inicial onde o mouse clicou
        startPosRef.current = direction === 'horizontal' ? e.clientX : e.clientY;
        startSizeRef.current = size;

        // Adiciona classe ao body para evitar seleção de texto durante o arraste
        document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
        document.body.style.userSelect = 'none';
    }, [size, direction]);

    // Referências para callbacks para evitar loops de re-render
    const onResizeRef = useRef(onResize);
    const onResizeEndRef = useRef(onResizeEnd);
    
    useEffect(() => {
        onResizeRef.current = onResize;
        onResizeEndRef.current = onResizeEnd;
    });

    const stopResizing = useCallback(() => {
        if (isResizing) {
            setIsResizing(false);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            onResizeEndRef.current?.(size);
        }
    }, [isResizing, size]);

    const resize = useCallback((e: MouseEvent) => {
        if (!isResizing) return;

        const currentPos = direction === 'horizontal' ? e.clientX : e.clientY;
        const delta = currentPos - startPosRef.current;
        let newSize = startSizeRef.current + delta;

        // Clamp values
        if (newSize < minSize) newSize = minSize;
        if (newSize > maxSize) newSize = maxSize;

        setSize(newSize);
        onResizeRef.current?.(newSize);
    }, [isResizing, direction, minSize, maxSize]);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', resize);
            window.addEventListener('mouseup', stopResizing);
        } else {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        }

        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [isResizing, resize, stopResizing]);

    return {
        size,
        isResizing,
        startResizing
    };
};
