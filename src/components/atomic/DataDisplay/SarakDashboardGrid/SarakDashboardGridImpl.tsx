/**
 * SarakDashboardGrid — implementação (lazy). Painel de widgets arrastáveis e redimensionáveis sobre
 * `react-grid-layout` (peer opcional); a posição vive no consumidor (`layout` + `onLayoutChange`).
 * Teclado: setas movem o widget focado, Shift + setas o redimensionam. Em contêiner estreito os
 * widgets empilham numa coluna, na ordem de leitura, sem arrastar. Medidas e superfícies saem de tokens.
 */

import React, { useEffect, useId, useRef, useState } from 'react';
import * as ReactGridLayout from 'react-grid-layout';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import { SarakOptionalPeerFallback } from '../../Feedback/SarakOptionalPeerFallback';
import {
    completeDashboardLayout,
    dashboardArrowStep,
    moveDashboardItem,
    readingOrder,
    resizeDashboardItem,
    type SarakDashboardLayoutItem,
} from './dashboardLayout';

const OPTIONAL_PEERS = ['react-grid-layout'] as const;
const DEFAULT_COLUMNS = 12;
const DEFAULT_ROW_HEIGHT = 80;
const DEFAULT_NARROW_WIDTH = 480;
const GRID_MARGIN = 16;
const GAP = 'var(--sarak-layout-gap-md, 16px)';
const VISUALLY_HIDDEN: React.CSSProperties = { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' };

type GridComponent = React.ComponentType<Record<string, unknown>>;
type GridItem = Omit<SarakDashboardLayoutItem, 'id'> & { i: string };
const PeerGridLayout = (ReactGridLayout as unknown as { default?: GridComponent }).default;

export interface SarakDashboardWidget {
    /** Identificador único; é o `id` do item no `layout`. */
    id: string;
    /** Título do widget: aparece na barra e é o nome acessível. */
    title: string;
    /** Conteúdo do widget. */
    content: React.ReactNode;
}

export interface SarakDashboardGridProps {
    widgets: SarakDashboardWidget[];
    /** Posição e tamanho de cada widget. Widget sem item entra no fim, com 4 colunas por 2 linhas. */
    layout: SarakDashboardLayoutItem[];
    /** Chamado a cada mudança de posição ou tamanho (arrasto, redimensionamento e teclado) com o layout novo. A persistência é do consumidor. */
    onLayoutChange?: (layout: SarakDashboardLayoutItem[]) => void;
    /** Número de colunas da grade. Omitido, `12`. */
    columns?: number;
    /** Altura de uma linha em px. Omitido, `80`. */
    rowHeight?: number;
    /** Sem arrastar nem redimensionar; o teclado também não move. */
    readOnly?: boolean;
    /** Largura do contêiner, em px, abaixo da qual os widgets empilham numa coluna. Omitido, `480`. */
    narrowBelow?: number;
    /** Nome acessível do painel. */
    label?: string;
    className?: string;
}

/** Largura do contêiner, reacompanhada por `ResizeObserver` (ausente no jsdom: fica com a medida inicial). */
function useContainerWidth(): [React.MutableRefObject<HTMLDivElement | null>, number | undefined] {
    const ref = useRef<HTMLDivElement | null>(null);
    const [width, setWidth] = useState<number | undefined>(undefined);
    useEffect(() => {
        const node = ref.current;
        if (!node) return undefined;
        setWidth(node.getBoundingClientRect().width);
        if (typeof ResizeObserver === 'undefined') return undefined;
        const observer = new ResizeObserver((entries) => setWidth(entries[0]?.contentRect.width));
        observer.observe(node);
        return () => observer.disconnect();
    }, []);
    return [ref, width];
}

const toGridItem = ({ id, ...rest }: SarakDashboardLayoutItem): GridItem => ({ ...rest, i: id });
const fromGridItem = ({ i, ...rest }: GridItem): SarakDashboardLayoutItem => ({ ...rest, id: i });

interface WidgetFrameProps extends React.HTMLAttributes<HTMLElement> {
    widget: SarakDashboardWidget;
    hintId?: string;
}

const WidgetFrame = React.forwardRef<HTMLElement, WidgetFrameProps>(({ widget, hintId, style, children, ...rest }, ref) => (
    <section
        {...rest}
        ref={ref}
        tabIndex={0}
        aria-label={widget.title}
        aria-describedby={hintId}
        data-sarak-dashboard-widget={widget.id}
        style={{
            ...style,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: 'var(--color-theme-card, transparent)',
            border: 'var(--sarak-border-width, 1px) solid var(--border-color, currentColor)',
            borderRadius: 'var(--sarak-card-radius, 10px)',
        }}
    >
        <header style={{ padding: 'var(--sarak-layout-gap-sm, 8px)', fontWeight: 600, borderBottom: 'var(--sarak-border-width, 1px) solid var(--border-color, currentColor)' }}>{widget.title}</header>
        <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 'var(--sarak-layout-gap-sm, 8px)' }}>{widget.content}</div>
        {children}
    </section>
));
WidgetFrame.displayName = 'WidgetFrame';

function SarakDashboardGridContent(props: SarakDashboardGridProps & { GridLayout: GridComponent }): React.ReactElement {
    const { GridLayout, widgets, layout, onLayoutChange, columns = DEFAULT_COLUMNS, rowHeight = DEFAULT_ROW_HEIGHT, readOnly = false, narrowBelow = DEFAULT_NARROW_WIDTH, label, className } = props;
    const text = useLibraryText();
    const hintId = useId();
    const [containerRef, width] = useContainerWidth();
    const full = completeDashboardLayout(widgets.map((widget) => widget.id), layout, columns);
    const narrow = width !== undefined && width < narrowBelow;

    const onWidgetKey = (id: string) => (event: React.KeyboardEvent<HTMLElement>): void => {
        if (event.target !== event.currentTarget || !dashboardArrowStep(event.key)) return;
        event.preventDefault();
        onLayoutChange?.(event.shiftKey ? resizeDashboardItem(full, id, event.key, columns) : moveDashboardItem(full, id, event.key, columns));
    };

    const stacked = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
            {readingOrder(full)
                .map((id) => widgets.find((widget) => widget.id === id))
                .filter((widget): widget is SarakDashboardWidget => Boolean(widget))
                .map((widget) => <WidgetFrame key={widget.id} widget={widget} />)}
        </div>
    );

    const grid = width !== undefined && (
        <GridLayout
            layout={full.map(toGridItem)}
            cols={columns}
            rowHeight={rowHeight}
            width={width}
            margin={[GRID_MARGIN, GRID_MARGIN]}
            isDraggable={!readOnly}
            isResizable={!readOnly}
            draggableCancel="button, a, input, select, textarea"
            onLayoutChange={(next: GridItem[]) => { if (!readOnly) onLayoutChange?.(next.map(fromGridItem)); }}
        >
            {widgets.map((widget) => (
                <WidgetFrame key={widget.id} widget={widget} hintId={readOnly ? undefined : hintId} onKeyDown={readOnly ? undefined : onWidgetKey(widget.id)} />
            ))}
        </GridLayout>
    );

    return (
        <div ref={containerRef} className={className} role="group" aria-label={label} data-sarak-dashboard-grid="true" data-narrow={narrow ? 'true' : undefined} style={{ width: '100%' }}>
            {narrow ? stacked : grid}
            {!readOnly && !narrow && <span id={hintId} style={VISUALLY_HIDDEN}>{text('dashboardWidgetHint')}</span>}
        </div>
    );
}

function SarakDashboardGridImpl(props: SarakDashboardGridProps): React.ReactElement {
    if (typeof PeerGridLayout !== 'function') {
        return <SarakOptionalPeerFallback component="SarakDashboardGrid" packages={OPTIONAL_PEERS} />;
    }
    return <SarakDashboardGridContent {...props} GridLayout={PeerGridLayout} />;
}

export default SarakDashboardGridImpl;
