import React from 'react';
import { useSarakDevice } from '../../../core/Provider/DeviceProvider';
import { sarakResolveResponsiveValue } from '../../../core/Design/resolveResponsiveValue';
import type { SarakResponsiveValue } from '../../../core/Design/types';
import { useGridColumns } from './gridColumnsContext';

export interface SarakGridItemProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Quantas trilhas o item ocupa: um número, `'full'` (a linha toda) ou um valor por dispositivo
     * (`{ mob, tab, desk }`). Omitida, o item ocupa uma trilha, no fluxo normal. Um `span` maior que
     * as colunas do grid vira `'full'` — no celular, onde o grid tem uma coluna, isso acontece sozinho.
     */
    span?: number | 'full' | SarakResponsiveValue<number | 'full'>;
    /** Quantas linhas o item ocupa, por dispositivo ou fixo. Omitida, uma linha. */
    rowSpan?: number | SarakResponsiveValue<number>;
    /** Elemento renderizado. Omitida, `div`. */
    as?: React.ElementType;
    children?: React.ReactNode;
}

const FULL_ROW = '1 / -1';

/** O `grid-column` do item; `columns` é o que o grid pai declarou para este dispositivo (`1` no celular sem declaração). */
const toGridColumn = (span: number | 'full' | undefined, columns: number): string | undefined => {
    if (span === undefined) return undefined;
    if (span === 'full' || span > columns) return FULL_ROW;
    return `span ${Math.max(1, Math.floor(span))} / span ${Math.max(1, Math.floor(span))}`;
};

/**
 * Filho de `SarakGrid` que escolhe a própria ocupação de coluna por dispositivo, sem classe
 * utilitária. O dispositivo vem do `DeviceProvider` (breakpoints do tema). As classes `col-span-*`
 * continuam valendo em qualquer filho do grid.
 */
export const SarakGridItem: React.FC<SarakGridItemProps> = ({
    span,
    rowSpan,
    as: Component = 'div',
    style,
    children,
    ...props
}) => {
    const device = useSarakDevice();
    const declaredColumns = useGridColumns();
    const columns = declaredColumns ?? (device === 'smartphone' ? 1 : Number.POSITIVE_INFINITY);

    const resolvedSpan = span === undefined ? undefined : sarakResolveResponsiveValue(span, device);
    const resolvedRowSpan = rowSpan === undefined ? undefined : sarakResolveResponsiveValue(rowSpan, device);

    const gridStyle: React.CSSProperties = {
        gridColumn: toGridColumn(resolvedSpan, columns),
        gridRow: resolvedRowSpan === undefined ? undefined : `span ${Math.max(1, Math.floor(resolvedRowSpan))} / span ${Math.max(1, Math.floor(resolvedRowSpan))}`,
        minWidth: 0,
        ...style,
    };

    return (
        <Component style={gridStyle} {...props}>
            {children}
        </Component>
    );
};
