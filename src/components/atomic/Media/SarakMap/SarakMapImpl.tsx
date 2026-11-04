/**
 * SarakMap — implementação (lazy). Mapa de blocos sem biblioteca de mapa e sem provedor embutido:
 * o consumidor passa `tileUrl` (molde com `{z}`, `{x}` e `{y}`) e a atribuição do provedor. Sem `tileUrl`
 * usável nenhum bloco é pedido — o componente mostra o aviso. Arrasta por ponteiro (mouse, toque,
 * caneta), aproxima por botões e por `+`/`-`, e anda pelas setas. Medidas e cores saem de tokens.
 */

import React, { useEffect, useRef, useState } from 'react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import { SarakButton } from '../../Buttons/SarakButton';
import { SarakIconButton } from '../../Buttons/SarakIconButton';
import {
    MAP_MAX_ZOOM,
    MAP_MIN_ZOOM,
    clampZoom,
    isUsableTileUrl,
    panCenter,
    pointInViewport,
    visibleTiles,
    type SarakMapPoint,
} from './mapMath';

const DEFAULT_HEIGHT = 360;
/** Medida usada enquanto o contêiner ainda não foi medido (e no jsdom, que não tem layout). */
const FALLBACK_SIZE = { width: 640, height: DEFAULT_HEIGHT };
const KEY_PAN_STEP = 64;
const PAN_KEYS: Readonly<Record<string, readonly [number, number]>> = {
    ArrowLeft: [KEY_PAN_STEP, 0],
    ArrowRight: [-KEY_PAN_STEP, 0],
    ArrowUp: [0, KEY_PAN_STEP],
    ArrowDown: [0, -KEY_PAN_STEP],
};
const ZOOM_KEYS: Readonly<Record<string, number>> = { '+': 1, '=': 1, '-': -1 };
const GAP_SM = 'var(--sarak-layout-gap-sm, 8px)';

export interface SarakMapMarker extends SarakMapPoint {
    id: string;
    /** Nome acessível do marcador. */
    label: string;
}

export interface SarakMapProps {
    /** Molde da URL dos blocos, com `{z}`, `{x}` e `{y}` (`https://…/{z}/{x}/{y}.png`). Sem ele nenhuma requisição sai e o componente mostra o aviso. A lib não embute provedor nem chave. */
    tileUrl?: string;
    /** Atribuição do provedor dos blocos, sempre visível no canto do mapa (os provedores a exigem). */
    attribution: React.ReactNode;
    center: SarakMapPoint;
    /** Nível de zoom inicial, `0` a `19`. */
    zoom: number;
    markers?: SarakMapMarker[];
    onMarkerClick?: (marker: SarakMapMarker) => void;
    /** Chamado quando o usuário arrasta ou aproxima, com o centro e o zoom novos. */
    onViewChange?: (center: SarakMapPoint, zoom: number) => void;
    /** Altura do mapa em px. Omitido, `360`. */
    height?: number;
    /** Nome acessível do mapa. */
    label?: string;
    className?: string;
}

function useViewportSize(height: number): [React.MutableRefObject<HTMLDivElement | null>, { width: number; height: number }] {
    const ref = useRef<HTMLDivElement | null>(null);
    const [size, setSize] = useState({ width: FALLBACK_SIZE.width, height });
    useEffect(() => {
        const node = ref.current;
        if (!node || typeof ResizeObserver === 'undefined') return undefined;
        const observer = new ResizeObserver(([entry]) => {
            const { width } = entry.contentRect;
            if (width > 0) setSize({ width, height });
        });
        observer.observe(node);
        return () => observer.disconnect();
    }, [height]);
    return [ref, { width: size.width, height }];
}

function SarakMapImpl(props: SarakMapProps): React.ReactElement {
    const { tileUrl, attribution, markers = [], onMarkerClick, onViewChange, height = DEFAULT_HEIGHT, label, className } = props;
    const text = useLibraryText();
    const [view, setView] = useState({ center: props.center, zoom: clampZoom(props.zoom) });
    const [containerRef, size] = useViewportSize(height);
    const drag = useRef<{ x: number; y: number } | null>(null);

    useEffect(() => setView({ center: { lat: props.center.lat, lng: props.center.lng }, zoom: clampZoom(props.zoom) }), [props.center.lat, props.center.lng, props.zoom]);

    const commit = (center: SarakMapPoint, zoom: number): void => {
        setView({ center, zoom });
        onViewChange?.(center, zoom);
    };
    const zoomBy = (delta: number): void => commit(view.center, clampZoom(view.zoom + delta));
    const panBy = (dx: number, dy: number): void => commit(panCenter(view.center, view.zoom, dx, dy), view.zoom);

    if (!isUsableTileUrl(tileUrl)) {
        return (
            <div role="status" data-sarak-map-no-tiles="true" className={className} style={{ padding: 'var(--sarak-layout-gap-md, 16px)', border: 'var(--sarak-border-width, 1px) dashed var(--border-color, currentColor)', borderRadius: 'var(--sarak-card-radius, 10px)', color: 'var(--sarak-text-muted, inherit)' }}>
                {text('mapNoTileUrl')}
            </div>
        );
    }

    const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
        if (event.target !== event.currentTarget) return;
        const pan = PAN_KEYS[event.key];
        const zoomDelta = ZOOM_KEYS[event.key];
        if (!pan && zoomDelta === undefined) return;
        if (pan) panBy(pan[0], pan[1]);
        if (zoomDelta !== undefined) zoomBy(zoomDelta);
        event.preventDefault();
    };
    const onPointerMove = (event: React.PointerEvent<HTMLDivElement>): void => {
        if (!drag.current) return;
        const dx = event.clientX - drag.current.x;
        const dy = event.clientY - drag.current.y;
        drag.current = { x: event.clientX, y: event.clientY };
        panBy(dx, dy);
    };

    return (
        <div
            ref={containerRef}
            className={className}
            role="group"
            aria-roledescription="map"
            aria-label={label ?? text('mapAriaLabel')}
            tabIndex={0}
            data-sarak-map="true"
            onKeyDown={onKeyDown}
            onPointerDown={(event) => {
                if (event.target !== event.currentTarget && (event.target as HTMLElement).tagName !== 'IMG') return;
                drag.current = { x: event.clientX, y: event.clientY };
                event.currentTarget.setPointerCapture?.(event.pointerId);
            }}
            onPointerMove={onPointerMove}
            onPointerUp={() => { drag.current = null; }}
            onPointerCancel={() => { drag.current = null; }}
            style={{ position: 'relative', overflow: 'hidden', height: size.height, touchAction: 'none', cursor: 'grab', background: 'var(--color-theme-card, transparent)', border: 'var(--sarak-border-width, 1px) solid var(--border-color, currentColor)', borderRadius: 'var(--sarak-card-radius, 10px)' }}
        >
            {visibleTiles(tileUrl, view.center, view.zoom, size.width, size.height).map((tile) => (
                <img key={tile.key} src={tile.url} alt="" draggable={false} referrerPolicy="no-referrer" style={{ position: 'absolute', left: tile.left, top: tile.top, width: 256, height: 256, userSelect: 'none', maxWidth: 'none' }} />
            ))}
            {markers.map((marker) => {
                const at = pointInViewport(marker, view.center, view.zoom, size.width, size.height);
                if (at.x < 0 || at.y < 0 || at.x > size.width || at.y > size.height) return null;
                return (
                    <SarakIconButton
                        key={marker.id}
                        type="button"
                        size="sm"
                        aria-label={marker.label}
                        icon={<span aria-hidden="true">●</span>}
                        onClick={() => onMarkerClick?.(marker)}
                        style={{ position: 'absolute', left: at.x, top: at.y, transform: 'translate(-50%, -50%)' }}
                    />
                );
            })}
            <div style={{ position: 'absolute', top: GAP_SM, right: GAP_SM, display: 'flex', flexDirection: 'column', gap: GAP_SM }}>
                <SarakButton type="button" aria-label={text('mapZoomIn')} disabled={view.zoom >= MAP_MAX_ZOOM} onClick={() => zoomBy(1)}>+</SarakButton>
                <SarakButton type="button" aria-label={text('mapZoomOut')} disabled={view.zoom <= MAP_MIN_ZOOM} onClick={() => zoomBy(-1)}>−</SarakButton>
            </div>
            <div data-sarak-map-attribution="true" style={{ position: 'absolute', right: 0, bottom: 0, padding: '0 var(--sarak-layout-gap-sm, 8px)', fontSize: 'var(--sarak-type-scale-caption, 12px)', background: 'var(--color-theme-card, transparent)', color: 'var(--sarak-text-muted, inherit)' }}>
                {attribution}
            </div>
        </div>
    );
}

export default SarakMapImpl;
