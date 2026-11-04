import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import { sarakErrorMessage } from '../../../../shared/errors/sarakErrorMessage';
import type { SarakColumn } from './columnModel';
import { columnValue, toValueColumn } from './columnValue';

export interface UseEditableCellOptions<T> {
    row: T;
    column: SarakColumn<T>;
    onCellEdit: (row: T, column: SarakColumn<T>, value: string) => void | Promise<void>;
}

export interface EditableCell {
    viewRef: RefObject<HTMLDivElement>;
    /** O texto em edição; `null` fora da edição. */
    draft: string | null;
    error: string | undefined;
    saving: boolean;
    initial: string;
    begin: () => void;
    change: (value: string) => void;
    cancel: () => void;
    commit: (returnFocus: boolean) => Promise<void>;
}

/** Rascunho, erro e salvamento da célula; `save` fecha ao concluir e mantém o campo aberto com o erro ao falhar. */
const useCellDraft = <T,>({ row, column, onCellEdit }: UseEditableCellOptions<T>) => {
    const text = useLibraryText();
    const [draft, setDraft] = useState<string | null>(null);
    const [error, setError] = useState<string | undefined>();
    const [saving, setSaving] = useState(false);
    // A saída do campo também dispara `blur`: o trinco impede salvar de novo depois de fechar ou durante o salvamento.
    const busy = useRef(false);
    const restoreFocus = useRef(false);
    const close = (returnFocus: boolean): void => {
        busy.current = true;
        restoreFocus.current = returnFocus;
        setDraft(null);
        setError(undefined);
    };
    const save = async (value: string, returnFocus: boolean): Promise<void> => {
        busy.current = true;
        setSaving(true);
        setError(undefined);
        try {
            await onCellEdit(row, column, value);
            close(returnFocus);
        } catch (caught) {
            busy.current = false;
            setError(sarakErrorMessage(caught, text('tableEditError')));
        } finally {
            setSaving(false);
        }
    };
    return { draft, setDraft, error, setError, saving, busy, restoreFocus, close, save };
};

/** Edição de uma célula: abre, valida pela coluna, salva e devolve o foco à célula. */
export const useEditableCell = <T,>(options: UseEditableCellOptions<T>): EditableCell => {
    const { row, column } = options;
    const { draft, setDraft, error, setError, saving, busy, restoreFocus, close, save } = useCellDraft(options);
    const viewRef = useRef<HTMLDivElement>(null);
    const initial = String(columnValue(row, toValueColumn(column)) ?? '');
    useEffect(() => {
        if (draft !== null || !restoreFocus.current) return;
        restoreFocus.current = false;
        viewRef.current?.focus();
    }, [draft, restoreFocus]);
    const commit = async (returnFocus: boolean): Promise<void> => {
        if (draft === null || busy.current) return;
        if (draft === initial) return close(returnFocus);
        const problem = column.validate?.(draft, row);
        if (problem) return setError(problem);
        await save(draft, returnFocus);
    };
    const begin = (): void => {
        busy.current = false;
        setError(undefined);
        setDraft(initial);
    };
    return { viewRef, draft, error, saving, initial, begin, change: setDraft, cancel: () => close(true), commit };
};
