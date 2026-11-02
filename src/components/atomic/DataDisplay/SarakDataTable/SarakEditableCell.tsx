import type { CSSProperties, KeyboardEvent, ReactElement, ReactNode } from 'react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import { SarakIcon } from '../../Icon/SarakIcon';
import { SarakInput } from '../../Inputs/SarakInput';
import { isNumericFormat } from './columnValue';
import { moveCellFocus } from './tableGridNavigation';
import { useEditableCell } from './useEditableCell';
import type { EditableCell, UseEditableCellOptions } from './useEditableCell';

export interface SarakEditableCellProps<T> extends UseEditableCellOptions<T> {
    /** O que a célula mostra fora da edição. */
    children: ReactNode;
}

const SPINNER_SIZE = 16;
/** Acima das células e das colunas congeladas, abaixo do cabeçalho fixo. */
const EDITOR_LAYER = 2;

const VIEW_STYLE: CSSProperties = { flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'text' };

const EDITOR_STYLE: CSSProperties = {
    position: 'absolute', top: 0, left: 0, minWidth: '100%', zIndex: EDITOR_LAYER, boxSizing: 'border-box',
    background: 'var(--sarak-card-bg, var(--color-theme-card, #101622))',
};

const INPUT_STYLE: CSSProperties = { paddingBlock: 'calc(var(--sarak-layout-gap-sm, 8px) * 0.5)' };

const headerText = <T,>({ header, id }: UseEditableCellOptions<T>['column']): string => (typeof header === 'string' ? header : id);

const handleViewKey = (event: KeyboardEvent<HTMLDivElement>, begin: () => void): void => {
    if (event.key === 'Enter' || event.key === 'F2') {
        event.preventDefault();
        event.stopPropagation();
        begin();
        return;
    }
    if (moveCellFocus(event.currentTarget, event.key)) event.preventDefault();
};

const handleEditorKey = (event: KeyboardEvent<HTMLInputElement>, cell: EditableCell): void => {
    if (event.key !== 'Enter' && event.key !== 'Escape') return;
    event.preventDefault();
    event.stopPropagation();
    if (event.key === 'Escape') cell.cancel();
    else void cell.commit(true);
};

/** Célula editável: clique, Enter ou F2 abre; Esc cancela; Enter ou sair do campo confirma; setas andam pela grade. */
export const SarakEditableCell = <T,>({ children, ...options }: SarakEditableCellProps<T>): ReactElement => {
    const text = useLibraryText();
    const cell = useEditableCell(options);
    const { column } = options;
    const columnName = headerText(column);
    if (cell.draft === null) {
        return <div ref={cell.viewRef} role="button" tabIndex={0} data-editable-cell="true" aria-label={text('tableEditCell', { column: columnName, value: cell.initial })} onClick={cell.begin} onKeyDown={(event) => handleViewKey(event, cell.begin)} style={VIEW_STYLE}>{children}</div>;
    }
    return (
        <div data-cell-editor="true" aria-busy={cell.saving || undefined} style={EDITOR_STYLE}>
            <SarakInput
                autoFocus
                fullWidth
                aria-label={columnName}
                value={cell.draft}
                readOnly={cell.saving}
                inputMode={isNumericFormat(column.format) ? 'decimal' : undefined}
                error={cell.error}
                style={INPUT_STYLE}
                rightIcon={cell.saving ? <SarakIcon name="Loader2" size={SPINNER_SIZE} className="animate-spin" /> : undefined}
                onChange={(event) => cell.change(event.currentTarget.value)}
                onKeyDown={(event) => handleEditorKey(event, cell)}
                onFocus={(event) => event.currentTarget.select()}
                onBlur={() => void cell.commit(false)}
            />
            {cell.saving && <span role="status" className="sr-only">{text('tableEditSaving')}</span>}
        </div>
    );
};
