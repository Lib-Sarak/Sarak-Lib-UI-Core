import type { CSSProperties } from 'react';
import { pinnedStyle, SELECTION_COLUMN_WIDTH } from './columnModel';
import type { SarakColumn } from './columnModel';
import { columnAlign, isNumericFormat } from './columnValue';
import type { SarakDataTableRowsProps } from './SarakDataTableRows';

/** Largura da coluna do botão de expandir (`renderExpanded` sem árvore). */
export const EXPANDER_WIDTH = 40;
/** Recuo por nível da tree-table. */
export const TREE_INDENT = 'var(--sarak-layout-gap-md, 16px)';

type CellLayoutProps<T> = Pick<SarakDataTableRowsProps<T>, 'automaticHeight' | 'offsets' | 'cellBackground' | 'selectable' | 'hasExpander' | 'flow'>;

/** Largura das colunas "de serviço" (seleção e expansão) que precedem as de dado. */
export const leadingWidthOf = <T,>(props: Pick<SarakDataTableRowsProps<T>, 'selectable' | 'hasExpander'>): number =>
    (props.selectable ? SELECTION_COLUMN_WIDTH : 0) + (props.hasExpander ? EXPANDER_WIDTH : 0);

const JUSTIFY = { right: 'flex-end', center: 'center', left: 'flex-start' } as const;

/** Em fluxo a largura vira proporção: a tabela cabe no contêiner ou na folha, sem rolar. */
export const flowCellWidth = (width: number): CSSProperties => ({ flex: `${width} 1 0`, minWidth: 0 });

const FLOW_CELL_PADDING = 'calc(var(--sarak-layout-gap-sm, 8px) * 0.5) var(--sarak-table-padding, 12px)';

const flowCellStyle = <T,>(column: SarakColumn<T>, width: number): CSSProperties => {
    const align = columnAlign(column);
    return {
        ...flowCellWidth(width), display: 'flex', alignItems: 'center', justifyContent: JUSTIFY[align], textAlign: align,
        padding: FLOW_CELL_PADDING, whiteSpace: 'normal', color: 'var(--sarak-text-main,#f2f6fb)',
        fontVariantNumeric: isNumericFormat(column.format) ? 'tabular-nums' : undefined,
    };
};

/** Estilo da célula de dado; `width` já traz a soma quando o `colSpan` cobre outras colunas. */
export const dataCellStyle = <T,>(column: SarakColumn<T>, width: number, props: CellLayoutProps<T>): CSSProperties => {
    if (props.flow) return flowCellStyle(column, width);
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

/** Onde a linha fica: na posição virtual, ou no fluxo do documento (relatório e impressão). */
export const rowPosition = <T,>(props: Pick<SarakDataTableRowsProps<T>, 'flow' | 'containerWidth'>, top: number): CSSProperties =>
    props.flow
        ? { display: 'flex', width: '100%', breakInside: 'avoid' }
        : { position: 'absolute', top, left: 0, display: 'flex', width: props.containerWidth };

export const SPECIAL_ROW_BORDER = 'var(--sarak-border-width, 1px) solid var(--sarak-table-border, var(--border-color,rgba(255,255,255,0.09)))';
