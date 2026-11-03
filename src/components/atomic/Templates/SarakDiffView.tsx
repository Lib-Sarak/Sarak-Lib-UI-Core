import React from 'react';
import { useLibraryText, type LibraryTextFn } from '../../../core/i18n/useLibraryText';
import { SarakFlex } from '../Layouts/SarakFlex';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';
import { sarakDiffLines, type SarakDiffLineKind } from './diffLines';
import { SYSTEM_TONE_COLOR, type SarakSystemTone } from './systemTone';

export interface SarakDiffField {
    /** Nome do campo comparado. */
    label: React.ReactNode;
    /** Valor anterior; vazio (`null`, `undefined` ou `''`) conta como "não existia". */
    before?: React.ReactNode;
    /** Valor novo; vazio conta como "foi removido". */
    after?: React.ReactNode;
}

export interface SarakDiffViewProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
    /** Comparação por campo: cada item mostra antes e depois lado a lado. */
    fields?: SarakDiffField[];
    /** Comparação por texto, com `after`: mostra as linhas que entraram e as que saíram. */
    before?: string;
    after?: string;
    /** Em campos, mostra também os que não mudaram. Padrão `false`. */
    showUnchanged?: boolean;
}

type FieldChange = 'added' | 'removed' | 'changed' | 'unchanged';

const isEmpty = (value: React.ReactNode): boolean => value === undefined || value === null || value === '';

const classifyField = ({ before, after }: SarakDiffField): FieldChange => {
    if (isEmpty(before) && isEmpty(after)) return 'unchanged';
    if (isEmpty(before)) return 'added';
    if (isEmpty(after)) return 'removed';
    return before === after ? 'unchanged' : 'changed';
};

const CHANGE_PRESENTATION: Record<FieldChange | SarakDiffLineKind, { marker: string; tone: SarakSystemTone; label: Parameters<LibraryTextFn>[0] }> = {
    added: { marker: '+', tone: 'success', label: 'diffAdded' },
    removed: { marker: '−', tone: 'error', label: 'diffRemoved' },
    changed: { marker: '~', tone: 'warning', label: 'diffChanged' },
    unchanged: { marker: '=', tone: 'muted', label: 'diffUnchanged' },
    same: { marker: ' ', tone: 'muted', label: 'diffUnchanged' },
};

const MARK_STYLE: React.CSSProperties = { fontWeight: 'bold', minWidth: '1.5ch', textAlign: 'center' };
const SIDE_STYLE: React.CSSProperties = { minWidth: 0, overflowWrap: 'anywhere', padding: 'var(--sarak-layout-gap-sm, 8px)', borderRadius: 'var(--sarak-card-radius, 10px)' };

const toneBackground = (tone: SarakSystemTone): string => `color-mix(in srgb, ${SYSTEM_TONE_COLOR[tone]} 14%, transparent)`;

const FieldSide = ({ title, tone, value, empty }: { title: string; tone?: SarakSystemTone; value: React.ReactNode; empty: string }): React.ReactElement => (
    <div style={{ ...SIDE_STYLE, background: tone ? toneBackground(tone) : undefined }}>
        <span className="text-theme-muted" style={{ display: 'block', fontSize: 'var(--sarak-type-scale-xs, 11px)' }}>{title}</span>
        {isEmpty(value) ? <em className="text-theme-muted">{empty}</em> : value}
    </div>
);

const FieldRow = ({ field, text }: { field: SarakDiffField; text: LibraryTextFn }): React.ReactElement => {
    const change = classifyField(field);
    const presentation = CHANGE_PRESENTATION[change];
    const empty = text('diffEmptyValue');
    return (
        <div data-diff-field={change} style={{ display: 'grid', gap: 'var(--sarak-layout-gap-sm, 8px)' }}>
            <SarakFlex align="center" gap="spacing-sm" wrap={false}>
                <dt className="text-theme-text" style={{ margin: 0, fontWeight: 'bold' }}>{field.label}</dt>
                <span style={{ color: SYSTEM_TONE_COLOR[presentation.tone], fontSize: 'var(--sarak-type-scale-xs, 11px)' }}>
                    <span aria-hidden="true" style={MARK_STYLE}>{presentation.marker}</span>{text(presentation.label)}
                </span>
            </SarakFlex>
            <dd style={{ margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 24ch), 1fr))', gap: 'var(--sarak-layout-gap-sm, 8px)' }}>
                <FieldSide title={text('diffBefore')} tone={change === 'removed' || change === 'changed' ? 'error' : undefined} value={field.before} empty={empty} />
                <FieldSide title={text('diffAfter')} tone={change === 'added' || change === 'changed' ? 'success' : undefined} value={field.after} empty={empty} />
            </dd>
        </div>
    );
};

const TextDiff = ({ before, after, text }: { before: string; after: string; text: LibraryTextFn }): React.ReactElement => {
    const lines = sarakDiffLines(before, after);
    return (
        <div role="list" style={{ fontFamily: 'monospace', fontSize: 'var(--sarak-body-size, 14px)' }}>
            {lines.map((line, index) => {
                const presentation = CHANGE_PRESENTATION[line.kind];
                return (
                    <div key={`${index}`} role="listitem" data-line={line.kind} style={{ display: 'flex', gap: 'var(--sarak-layout-gap-sm, 8px)', background: line.kind === 'same' ? undefined : toneBackground(presentation.tone) }}>
                        <span aria-hidden="true" style={{ ...MARK_STYLE, color: SYSTEM_TONE_COLOR[presentation.tone] }}>{presentation.marker}</span>
                        {line.kind !== 'same' && <span className="sr-only">{text(presentation.label)}: </span>}
                        <span style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', minWidth: 0 }}>{line.text}</span>
                    </div>
                );
            })}
        </div>
    );
};

/**
 * Antes → depois, por campo ou por texto. Cada mudança leva marcador (`+`, `−`, `~`) e rótulo escrito além da
 * cor, então nada depende de distinguir tons. Apresentacional: o dado vem por prop.
 */
export const SarakDiffView = ({ fields, before, after, showUnchanged = false, className, ...props }: SarakDiffViewProps): React.ReactElement => {
    const text = useLibraryText();
    const shared = { ...props, className: mergeSarakClasses('sarak-diff-view @container w-full', className) };

    if (fields) {
        const rows = fields.filter((field) => showUnchanged || classifyField(field) !== 'unchanged');
        return (
            <section {...shared}>
                {rows.length === 0 ? <p className="text-theme-muted" role="status">{text('diffEmpty')}</p> : (
                    <dl style={{ margin: 0, display: 'grid', gap: 'var(--sarak-layout-gap-md, 16px)' }}>
                        {rows.map((field, index) => <FieldRow key={`${index}`} field={field} text={text} />)}
                    </dl>
                )}
            </section>
        );
    }

    const lines = sarakDiffLines(before ?? '', after ?? '');
    const hasChange = lines.some((line) => line.kind !== 'same');
    return (
        <section {...shared}>
            {hasChange ? <TextDiff before={before ?? ''} after={after ?? ''} text={text} /> : <p className="text-theme-muted" role="status">{text('diffEmpty')}</p>}
        </section>
    );
};
