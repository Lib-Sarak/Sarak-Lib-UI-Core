import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import type { LibraryTextKey } from '../../../../core/i18n/catalog';
import { SarakIcon } from '../../Icon/SarakIcon';
import type { SarakColumn } from './columnModel';
import { columnText } from './columnValue';
import { SarakEditableCell } from './SarakEditableCell';

export type SarakCellTone = 'success' | 'warning' | 'danger' | 'info';

export interface SarakCellBehavior<T> {
    /** Tom da célula por regra de negócio (limiar, por exemplo); `undefined` mantém a cor normal. */
    getCellTone?: (row: T, column: SarakColumn<T>) => SarakCellTone | undefined;
    /** Salva a edição da célula; devolva uma promessa para o estado de salvando, e rejeite para mostrar o erro. */
    onCellEdit?: (row: T, column: SarakColumn<T>, value: string) => void | Promise<void>;
}

export interface SarakCellContentProps<T> extends SarakCellBehavior<T> {
    column: SarakColumn<T>;
    row: T;
    rowIndex: number;
    locale?: string;
}

interface ToneSpec {
    color: string;
    icon: string;
    label: LibraryTextKey;
}

const TONE_ICON_SIZE = 14;

const TONES: Record<SarakCellTone, ToneSpec> = {
    success: { color: 'var(--sarak-status-success-color, var(--theme-success, #10b981))', icon: 'CheckCircle2', label: 'tableToneSuccess' },
    warning: { color: 'var(--sarak-status-warning-color, var(--theme-warning, #f59e0b))', icon: 'AlertTriangle', label: 'tableToneWarning' },
    danger: { color: 'var(--sarak-status-error-color, var(--theme-error, #ef4444))', icon: 'XCircle', label: 'tableToneDanger' },
    info: { color: 'var(--sarak-status-info-color, var(--theme-info, #3b82f6))', icon: 'Info', label: 'tableToneInfo' },
};

const toneStyle = (tone: SarakCellTone): CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: 'calc(var(--sarak-layout-gap-sm, 8px) * 0.5)', minWidth: 0, color: TONES[tone].color,
});

/** O tom nunca é só cor: leva o ícone e, para leitor de tela, o texto do estado. */
const SarakToneMark = ({ tone, children }: { tone: SarakCellTone; children: ReactNode }): ReactElement => {
    const text = useLibraryText();
    return (
        <span data-cell-tone={tone} style={toneStyle(tone)}>
            <SarakIcon name={TONES[tone].icon} size={TONE_ICON_SIZE} aria-hidden="true" />
            <span className="sr-only">{text(TONES[tone].label)}</span>
            {children}
        </span>
    );
};

const isEditable = <T,>(column: SarakColumn<T>, row: T): boolean =>
    typeof column.editable === 'function' ? column.editable(row) : column.editable === true;

/** O conteúdo de uma célula de dado, com tom e edição: o mesmo na tabela e no cartão. */
export const SarakCellContent = <T,>({ column, row, rowIndex, locale, getCellTone, onCellEdit }: SarakCellContentProps<T>): ReactElement => {
    const value = column.render ? column.render(row, rowIndex) : columnText(row, column, locale);
    const tone = getCellTone?.(row, column);
    const content = tone ? <SarakToneMark tone={tone}>{value}</SarakToneMark> : value;
    if (onCellEdit && isEditable(column, row)) return <SarakEditableCell row={row} column={column} onCellEdit={onCellEdit}>{content}</SarakEditableCell>;
    return <>{content}</>;
};

/** A célula abre o editor sobre si: posicionada e sem recorte, para o campo e o erro não sumirem. */
export const editableCellFrame = <T,>(column: SarakColumn<T>, row: T, onCellEdit: SarakCellBehavior<T>['onCellEdit']): CSSProperties | null =>
    onCellEdit && isEditable(column, row) ? { overflow: 'visible', position: column.pinned ? 'sticky' : 'relative' } : null;
