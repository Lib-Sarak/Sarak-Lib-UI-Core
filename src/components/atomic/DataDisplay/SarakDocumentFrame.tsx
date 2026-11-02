import { useEffect, useState } from 'react';
import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';

export type SarakDocumentFormat = 'a4' | 'letter' | 'phone';

export interface SarakDocumentFrameProps {
    /** O documento: é só ele que sai na impressão. */
    children: ReactNode;
    /** Tamanho da folha; padrão `a4`. */
    format?: SarakDocumentFormat;
    /** `fit` reduz a folha à largura do contêiner, sem ampliar; um número fixa a escala (`1` = 100%). Padrão `fit`. */
    zoom?: number | 'fit';
    /** Ações sobre a folha (formato, zoom, imprimir); não saem na impressão. */
    actions?: ReactNode;
    /** Nome acessível da região do documento. */
    label?: string;
    className?: string;
}

const FORMATS: Record<SarakDocumentFormat, { width: number; height: number }> = {
    a4: { width: 794, height: 1123 },
    letter: { width: 816, height: 1056 },
    phone: { width: 390, height: 844 },
};

const FRAME_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 'var(--sarak-layout-gap-sm, 8px)', minWidth: 0, maxWidth: '100%' };
const ACTIONS_STYLE: CSSProperties = { display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 'var(--sarak-layout-gap-sm, 8px)' };
const CANVAS_STYLE: CSSProperties = { display: 'flex', justifyContent: 'safe center', width: '100%', minWidth: 0, overflowX: 'auto' };

/** A escala da folha: o número pedido, ou a que a faz caber no contêiner, sem nunca ampliar. */
export const sarakDocumentScale = (zoom: number | 'fit', available: number | null, sheetWidth: number): number => {
    if (zoom !== 'fit') return zoom;
    return available === null || available <= 0 || available >= sheetWidth ? 1 : available / sheetWidth;
};

const sheetStyle = (format: SarakDocumentFormat, scale: number): CSSProperties => ({
    ...FORMATS[format],
    height: undefined,
    minHeight: FORMATS[format].height,
    zoom: scale,
    flex: 'none',
    boxSizing: 'border-box',
    color: 'var(--sarak-text-main, #f2f6fb)',
    background: 'var(--sarak-card-bg, var(--color-theme-card, #101622))',
    border: 'var(--sarak-border-width, 1px) solid var(--sarak-card-border-color, var(--border-color, rgba(255,255,255,0.09)))',
    borderRadius: format === 'phone' ? 'var(--sarak-card-radius, 10px)' : undefined,
    overflow: format === 'phone' ? 'hidden' : undefined,
});

const useContainerWidth = (container: HTMLDivElement | null): number | null => {
    const [width, setWidth] = useState<number | null>(null);
    useEffect(() => {
        if (container === null || typeof ResizeObserver === 'undefined') return undefined;
        const measure = (): void => setWidth(container.getBoundingClientRect().width);
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(container);
        return () => observer.disconnect();
    }, [container]);
    return width;
};

/** Moldura de documento: mostra a folha no tamanho real, cabe no contêiner e imprime só o documento. */
export const SarakDocumentFrame = ({ children, format = 'a4', zoom = 'fit', actions, label, className }: SarakDocumentFrameProps): ReactElement => {
    const [container, setContainer] = useState<HTMLDivElement | null>(null);
    const available = useContainerWidth(container);
    const scale = sarakDocumentScale(zoom, available, FORMATS[format].width);
    return (
        <section aria-label={label} className={mergeSarakClasses('sarak-document-frame', className)} style={FRAME_STYLE}>
            {actions && <div data-sarak-no-print="true" style={ACTIONS_STYLE}>{actions}</div>}
            <div ref={setContainer} style={CANVAS_STYLE}>
                <div data-sarak-document={format} style={sheetStyle(format, scale)}>{children}</div>
            </div>
        </section>
    );
};
