/**
 * usePdfDocument (Spec 15, Regra 2 · Onda 10) — ciclo de vida do documento PDF.
 *
 * Extraído do `SarakPDFViewerImpl` para manter o componente enxuto (limite de
 * estado/efeitos do Clean Code). Configura o worker (fora da main thread), carrega o
 * documento via `pdfjs-dist` e cancela/destrói a tarefa na troca da fonte. Zero Any.
 */

import { useEffect, useRef, useState } from 'react';
import * as PdfJs from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';

/** Fonte do documento: URL, bytes ou ArrayBuffer. */
export type SarakPdfSource = string | Uint8Array | ArrayBuffer;

export interface PdfDocumentState {
    doc: PDFDocumentProxy | null;
    error: string | null;
    loading: boolean;
}

export const usePdfDocument = (src: SarakPdfSource, workerSrc: string): PdfDocumentState => {
    const t = useLibraryText();
    const translateRef = useRef(t);
    translateRef.current = t;
    const warnedMissingWorkerSrc = useRef(false);
    const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (typeof workerSrc !== 'string' || workerSrc.trim() === '') {
            setDoc(null);
            setError(translateRef.current('pdfViewerWorkerSrcRequired'));
            if (!warnedMissingWorkerSrc.current) {
                warnedMissingWorkerSrc.current = true;
                console.warn('[SarakPDFViewer] The required "workerSrc" prop is missing.');
            }
            return undefined;
        }

        setError(null);
        let cancelled = false;
        PdfJs.GlobalWorkerOptions.workerSrc = workerSrc;
        const task = PdfJs.getDocument(typeof src === 'string' ? { url: src } : { data: src });
        task.promise.then(
            (loaded) => { if (!cancelled) { setDoc(loaded); setError(null); } },
            (err: unknown) => { if (!cancelled) setError(err instanceof Error ? err.message : translateRef.current('pdfViewerLoadError')); },
        );
        return () => { cancelled = true; void task.destroy(); };
    }, [src, workerSrc]);

    return { doc, error, loading: !doc && !error };
};
