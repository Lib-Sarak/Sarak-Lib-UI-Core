import type { CSSProperties } from 'react';
import { pinnedStyle, SELECTION_COLUMN_WIDTH } from './columnModel';
import type { SarakColumn } from './columnModel';
import { columnAlign, isNumericFormat } from './columnValue';
import type { SarakDataTableRowsProps } from './SarakDataTableRows';

/** Largura da coluna do botão de expandir (`renderExpanded` sem árvore). */
export const EXPANDER_WIDTH = 40;
/** Recuo por nível da tree-table. */
export const TREE_INDENT = 'var(--sarak-layout-gap-md, 16px)';

type CellLayoutProps<T> = Pick<SarakDataTableRowsProps<T>, 'automaticHeight' | 'offsets' | 'cellBackground' | 'selectable' | 'hasExpander'>;

/** Largura das colunas "de serviço" (seleção e expansão) que precedem as de dado. */
export const leadingWidthOf = <T,>(props: Pick<SarakDataTableRowsProps<T>, 'selectable' | 'hasExpander'>): number =>
    (props.selectable ? SELECTION_COLUMN_WIDTH : 0) + (props.hasExpander ? EXPANDER_WIDTH : 0);

const JUSTIFY = { right: 'flex-end', center: 'center', left: 'flex-start' } as const;

/** Estilo da célula de dado; `width` já traz a soma quando o `colSpan` cobre outras colunas. */
export const dataCellStyle = <T,>(column: SarakColumn<T>, width: number, props: CellLayoutProps<T>): CSSProperties => {
    const align = columnAlign(column);
    return {
        width,
        flex: '0 0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: JUSTIFY[align],
        textAlign: align,
        padding: '0 var(--sarak-table-padding, 12px)',
        overflow: props.automaticHeight ? 'visible' : 'hidden',
        textOverflow: props.automaticHeight ? undefined : 'ellipsis',
        whiteSpace: props.automaticHeight ? 'normal' : 'nowrap',
        color: 'var(--sarak-text-main,#f2f6fb)',
        fontVariantNumeric: isNumericFormat(column.format) ? 'tabular-nums' : undefined,
        ...pinnedStyle(column, props.offsets, props.cellBackground, leadingWidthOf(props)),
    };
};

export const SPECIAL_ROW_BORDER = 'var(--sarak-border-width, 1px) solid var(--sarak-table-border, var(--border-color,rgba(255,255,255,0.09)))';
