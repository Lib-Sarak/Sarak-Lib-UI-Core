/** O canvas é redesenhado a partir do estado: desfazer, limpar e trocar para o nome digitado não precisam de caminho próprio. */

import { useEffect } from 'react';
import { paintStrokes, paintTypedName, type SarakSignatureStroke } from './signatureCanvas';

export function useCanvasSync(
    canvasRef: React.MutableRefObject<HTMLCanvasElement | null>,
    strokes: readonly SarakSignatureStroke[],
    typing: boolean,
    typedName: string,
): void {
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        if (typing) paintTypedName(canvas, typedName);
        else paintStrokes(canvas, strokes);
    }, [canvasRef, strokes, typing, typedName]);
}
