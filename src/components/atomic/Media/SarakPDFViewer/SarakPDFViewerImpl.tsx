/**
 * SarakPDFViewer (Spec 15, Regra 2) — implementação pesada (lazy).
 *
 * Desenha as páginas do PDF em `<canvas>` via `pdfjs-dist` (peer), sem depender do
 * visualizador nativo bloqueado do navegador. O parse roda num Web Worker (fora da main
 * thread) — `GlobalWorkerOptions.workerSrc` é configurável pela prop `workerSrc`. A barra
 * de controles (zoom/página/download) é 100% estilizada por tokens (`[--sarak-*]`).
 *
 * A dependência pesada (`pdfjs-dist`) vive AQUI; o `index.ts` exporta isto via
 * `React.lazy`, mantendo-a fora do entry de quem não a usa.
 */

import React, { useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePdfDocument, type PdfSource } from './usePdfDocument';
import { SarakIconButton } from '../../Buttons/SarakIconButton';

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

    const controlBtn = 'text-[var(--color-theme-title,#ffffff)] hover:bg-[var(--text-muted,#94a3b8)]/10 transition-colors';
    // Neutraliza o `rounded-btn`/`w-N h-N` que `SarakIconButton` aplica por padrão — `style`
    // sempre vence a classe do átomo (R10 — lote 10), preservando `w-8 h-8 rounded-md`.
    // Zero hardcode (R2): deriva de `--sarak-layout-gap-md`/`--sarak-button-radius`, tokens reais.
    const controlBtnStyle: React.CSSProperties = {
        width: 'calc(var(--sarak-layout-gap-md, 16px) * 2)',
        height: 'calc(var(--sarak-layout-gap-md, 16px) * 2)',
        borderRadius: 'calc(var(--sarak-button-radius, 8px) * 0.75)',
    };

    return (
        <div
            data-sarak-pdfviewer="true"
            className={className}
            style={{
                display: 'flex',
                flexDirection: 'column',
                border: 'var(--sarak-border-width, 1px) solid var(--border-color,#334155)',
                borderRadius: 'var(--sarak-card-radius,12px)',
                overflow: 'hidden',
                background: 'var(--color-theme-card,#1e293b)',
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
                    gap: 'var(--sarak-layout-gap-sm,8px)',
                    padding: 'var(--sarak-layout-gap-sm,8px)',
                    borderBottom: 'var(--sarak-border-width, 1px) solid var(--border-color,#334155)',
                    background: 'var(--sarak-table-header-bg, var(--color-theme-card,#1e293b))',
                }}
            >
                {/* Composição atômica (R10 — lote 10): SarakIconButton renderiza <button>
                    nativo por baixo — não há armadilha de foco própria aqui (o viewer não
                    usa useFocusTrap), então não há seletor de DOM para reconferir. */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <SarakIconButton variant="ghost" aria-label="Diminuir zoom" className={controlBtn} style={controlBtnStyle} onClick={() => zoomBy(-ZOOM_STEP)} disabled={scale <= ZOOM_MIN} icon={<ZoomOut size={16} />} />
                    <span style={{ minWidth: 44, textAlign: 'center', fontSize: 12, color: 'var(--text-muted,#94a3b8)' }}>
                        {Math.round(scale * 100)}%
                    </span>
                    <SarakIconButton variant="ghost" aria-label="Aumentar zoom" className={controlBtn} style={controlBtnStyle} onClick={() => zoomBy(ZOOM_STEP)} disabled={scale >= ZOOM_MAX} icon={<ZoomIn size={16} />} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <SarakIconButton variant="ghost" aria-label="Página anterior" className={controlBtn} style={controlBtnStyle} onClick={() => goTo(page - 1)} disabled={page <= 1} icon={<ChevronLeft size={16} />} />
                    <span aria-live="polite" style={{ fontSize: 12, color: 'var(--text-muted,#94a3b8)', minWidth: 64, textAlign: 'center' }}>
                        {total ? `${page} / ${total}` : '—'}
                    </span>
                    <SarakIconButton variant="ghost" aria-label="Próxima página" className={controlBtn} style={controlBtnStyle} onClick={() => goTo(page + 1)} disabled={page >= total} icon={<ChevronRight size={16} />} />
                </div>

                <SarakIconButton variant="ghost" aria-label="Baixar PDF" className={controlBtn} style={controlBtnStyle} onClick={handleDownload} icon={<Download size={16} />} />
            </div>

            {/* Área de renderização. */}
            <div style={{ overflow: 'auto', padding: 'var(--sarak-layout-gap-md,16px)', display: 'flex', justifyContent: 'center', minHeight: 120 }}>
                {error ? (
                    <span role="alert" style={{ color: 'var(--sarak-status-error-color,#ef4444)', fontSize: 13 }}>{error}</span>
                ) : loading ? (
                    <span aria-live="polite" style={{ color: 'var(--text-muted,#94a3b8)', fontSize: 13 }}>Carregando documento…</span>
                ) : (
                    <canvas ref={canvasRef} data-sarak-pdf-canvas="true" />
                )}
            </div>
        </div>
    );
};

export default SarakPDFViewerImpl;
