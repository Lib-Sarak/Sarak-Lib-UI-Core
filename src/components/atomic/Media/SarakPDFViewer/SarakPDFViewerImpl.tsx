/**
 * SarakPDFViewer (Spec 15, Regra 2) — implementação pesada (lazy).
 *
 * Desenha as páginas do PDF em `<canvas>` via `pdfjs-dist` (peer), sem depender do
 * visualizador nativo bloqueado do navegador. O parse roda num Web Worker (fora da main
 * thread) — `GlobalWorkerOptions.workerSrc` é configurável pela prop `workerSrc`. A barra
 * de controles (zoom/página/download) é 100% estilizada por tokens (`var(--sx-*)`).
 *
 * A dependência pesada (`pdfjs-dist`) vive AQUI; o `index.ts` exporta isto via
 * `React.lazy`, mantendo-a fora do entry de quem não a usa.
 */

import React, { useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePdfDocument, type PdfSource } from './usePdfDocument';

export interface SarakPDFViewerProps {
    /** Origem do documento: URL, bytes ou ArrayBuffer. */
    src: PdfSource;
    /** Página inicial (1-based, default: 1). */
    initialPage?: number;
    /** Escala inicial de zoom (default: 1.2). */
    zoom?: number;
    /** URL do worker do pdf.js; default resolvido do pacote via `import.meta.url`. */
    workerSrc?: string;
    /** Disparado ao clicar em Download (recebe a `src` quando string). */
    onDownload?: (src: PdfSource) => void;
    className?: string;
}

const ZOOM_STEP = 0.2;
const ZOOM_MIN = 0.4;
const ZOOM_MAX = 4;

const SarakPDFViewerImpl: React.FC<SarakPDFViewerProps> = ({
    src,
    initialPage = 1,
    zoom = 1.2,
    workerSrc,
    onDownload,
    className,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { doc, error, loading } = usePdfDocument(src, workerSrc);
    const [page, setPage] = useState(initialPage);
    const [scale, setScale] = useState(zoom);

    // Renderiza a página corrente no canvas a cada mudança de página/escala/documento.
    useEffect(() => {
        if (!doc) return undefined;
        let cancelled = false;
        doc.getPage(page).then((pdfPage) => {
            if (cancelled) return;
            const canvas = canvasRef.current;
            const context = canvas?.getContext('2d');
            if (!canvas || !context) return;
            const viewport = pdfPage.getViewport({ scale });
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            void pdfPage.render({ canvas, canvasContext: context, viewport });
        });
        return () => { cancelled = true; };
    }, [doc, page, scale]);

    const total = doc?.numPages ?? 0;
    const goTo = (next: number) => setPage((curr) => Math.min(Math.max(1, next), total || curr));
    const zoomBy = (delta: number) => setScale((s) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Number((s + delta).toFixed(2)))));

    const handleDownload = () => {
        onDownload?.(src);
        if (typeof src === 'string' && typeof document !== 'undefined') {
            const anchor = document.createElement('a');
            anchor.href = src;
            anchor.download = '';
            anchor.click();
        }
    };

    const controlBtn = 'flex items-center justify-center w-8 h-8 rounded-md text-[var(--sx-color-text-title)] hover:bg-[var(--sx-color-text-muted)]/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors';

    return (
        <div
            data-sarak-pdfviewer="true"
            className={className}
            style={{
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid var(--sx-color-border-base)',
                borderRadius: 'var(--sx-radius-md, 12px)',
                overflow: 'hidden',
                background: 'var(--sx-color-surface-base)',
            }}
        >
            {/* Barra de controles superior (Spec 15, Critério de Aceite). */}
            <div
                role="toolbar"
                aria-label="Controles do PDF"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 'var(--sx-spacing-sm, 8px)',
                    padding: 'var(--sx-spacing-sm, 8px)',
                    borderBottom: '1px solid var(--sx-color-border-base)',
                    background: 'var(--sarak-table-header-bg, var(--sx-color-surface-base))',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <button type="button" aria-label="Diminuir zoom" className={controlBtn} onClick={() => zoomBy(-ZOOM_STEP)} disabled={scale <= ZOOM_MIN}>
                        <ZoomOut size={16} />
                    </button>
                    <span style={{ minWidth: 44, textAlign: 'center', fontSize: 12, color: 'var(--sx-color-text-muted)' }}>
                        {Math.round(scale * 100)}%
                    </span>
                    <button type="button" aria-label="Aumentar zoom" className={controlBtn} onClick={() => zoomBy(ZOOM_STEP)} disabled={scale >= ZOOM_MAX}>
                        <ZoomIn size={16} />
                    </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <button type="button" aria-label="Página anterior" className={controlBtn} onClick={() => goTo(page - 1)} disabled={page <= 1}>
                        <ChevronLeft size={16} />
                    </button>
                    <span aria-live="polite" style={{ fontSize: 12, color: 'var(--sx-color-text-muted)', minWidth: 64, textAlign: 'center' }}>
                        {total ? `${page} / ${total}` : '—'}
                    </span>
                    <button type="button" aria-label="Próxima página" className={controlBtn} onClick={() => goTo(page + 1)} disabled={page >= total}>
                        <ChevronRight size={16} />
                    </button>
                </div>

                <button type="button" aria-label="Baixar PDF" className={controlBtn} onClick={handleDownload}>
                    <Download size={16} />
                </button>
            </div>

            {/* Área de renderização. */}
            <div style={{ overflow: 'auto', padding: 'var(--sx-spacing-md, 16px)', display: 'flex', justifyContent: 'center', minHeight: 120 }}>
                {error ? (
                    <span role="alert" style={{ color: 'var(--sx-color-danger-base, #ff4d4f)', fontSize: 13 }}>{error}</span>
                ) : loading ? (
                    <span aria-live="polite" style={{ color: 'var(--sx-color-text-muted)', fontSize: 13 }}>Carregando documento…</span>
                ) : (
                    <canvas ref={canvasRef} data-sarak-pdf-canvas="true" />
                )}
            </div>
        </div>
    );
};

export default SarakPDFViewerImpl;
