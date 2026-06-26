/**
 * usePdfDocument (Spec 15, Regra 2 · Onda 10) — ciclo de vida do documento PDF.
 *
 * Extraído do `SarakPDFViewerImpl` para manter o componente enxuto (limite de
 * estado/efeitos do Clean Code). Configura o worker (fora da main thread), carrega o
 * documento via `pdfjs-dist` e cancela/destrói a tarefa na troca da fonte. Zero Any.
 */

import { useEffect, useState } from 'react';
import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from 'pdfjs-dist';

/** Fonte do documento: URL, bytes ou ArrayBuffer. */
export type PdfSource = string | Uint8Array | ArrayBuffer;

export interface PdfDocumentState {
    doc: PDFDocumentProxy | null;
    error: string | null;
    loading: boolean;
}

/** Resolve o worker default a partir do próprio pacote (bundlers modernos). */
const defaultWorkerSrc = (): string => new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

export const usePdfDocument = (src: PdfSource, workerSrc?: string): PdfDocumentState => {
    const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        GlobalWorkerOptions.workerSrc = workerSrc ?? defaultWorkerSrc();
        const task = getDocument(typeof src === 'string' ? { url: src } : { data: src });
        task.promise.then(
            (loaded) => { if (!cancelled) { setDoc(loaded); setError(null); } },
            (err: unknown) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Falha ao carregar PDF'); },
        );
        return () => { cancelled = true; void task.destroy(); };
    }, [src, workerSrc]);

    return { doc, error, loading: !doc && !error };
};
