import React, { useState } from 'react';
import { useLibraryText, type LibraryTextFn } from '../../../core/i18n/useLibraryText';
import { SarakButton } from '../Buttons/SarakButton';
import { SarakCard } from '../Cards/SarakCard';
import { SarakCheckbox } from '../Inputs/SarakCheckbox';
import { SarakTextarea } from '../Inputs/SarakTextarea';
import { SarakEmptyState } from '../Feedback/SarakEmptyState';
import { SarakFlex } from '../Layouts/SarakFlex';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';
import { SarakDiffView, type SarakDiffViewProps } from './SarakDiffView';
import { useSystemFormat, type SarakSystemTimestamp } from './hooks/useSystemFormat';

export interface SarakApprovalItem {
    id: string;
    /** O que está pedindo aprovação, em texto: também nomeia a caixa de seleção e os botões. */
    title: string;
    requester?: string;
    at?: SarakSystemTimestamp;
    /** A diferença que o aprovador confere. */
    diff: SarakDiffViewProps;
}

export interface SarakApprovalQueueProps {
    items: SarakApprovalItem[];
    onApprove: (ids: string[]) => void;
    /** Recebe os ids e o motivo, que a fila exige antes de confirmar. */
    onReject: (ids: string[], reason: string) => void;
    /** Ids marcados para o lote (controlado); omitido, a fila guarda. */
    selectedIds?: string[];
    onSelectedIdsChange?: (ids: string[]) => void;
    /** Trava as ações enquanto o host processa o pedido anterior. */
    busy?: boolean;
    className?: string;
}

const RejectPanel = ({ count, busy, onConfirm, onCancel, text }: {
    count: number;
    busy: boolean;
    onConfirm: (reason: string) => void;
    onCancel: () => void;
    text: LibraryTextFn;
}): React.ReactElement => {
    const [reason, setReason] = useState('');
    const [touched, setTouched] = useState(false);
    const missing = touched && reason.trim() === '';
    const confirm = (): void => {
        setTouched(true);
        if (reason.trim() !== '') onConfirm(reason.trim());
    };
    return (
        <div role="group" aria-label={text('approvalReject')} style={{ display: 'grid', gap: 'var(--sarak-layout-gap-sm, 8px)', padding: 'var(--sarak-layout-gap-md, 16px)', border: 'var(--sarak-border-width, 1px) solid var(--theme-border)', borderRadius: 'var(--sarak-card-radius, 10px)' }}>
            <SarakTextarea
                label={text('approvalReason')}
                fullWidth
                autoFocus
                value={reason}
                error={missing ? text('approvalReasonRequired') : undefined}
                onChange={(event) => setReason(event.target.value)}
            />
            <SarakFlex gap="spacing-sm">
                <SarakButton type="button" variant="danger" disabled={busy} onClick={confirm}>{text('approvalConfirmReject')}{count > 1 ? ` (${count})` : ''}</SarakButton>
                <SarakButton type="button" variant="ghost" onClick={onCancel}>{text('approvalCancel')}</SarakButton>
            </SarakFlex>
        </div>
    );
};

const ItemCard = ({ item, selected, busy, onSelect, onApprove, onReject, text }: {
    item: SarakApprovalItem;
    selected: boolean;
    busy: boolean;
    onSelect: (checked: boolean) => void;
    onApprove: () => void;
    onReject: () => void;
    text: LibraryTextFn;
}): React.ReactElement => {
    const format = useSystemFormat();
    const meta = [item.requester ? text('approvalRequestedBy', { actor: item.requester }) : '', item.at ? format.dateTime(item.at) : ''].filter(Boolean).join(' · ');
    return (
        <SarakCard>
            <SarakCard.Body>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 'var(--sarak-layout-gap-md, 16px)', padding: 'var(--sarak-card-padding-md, var(--sarak-layout-gap-md, 16px))' }}>
                    <SarakFlex align="center" justify="space-between" gap="spacing-sm">
                        <SarakFlex align="center" gap="spacing-sm" wrap={false} style={{ minWidth: 0 }}>
                            <SarakCheckbox aria-label={text('approvalSelectItem', { title: item.title })} checked={selected} onChange={(event) => onSelect(event.target.checked)} />
                            <strong className="text-theme-text" style={{ overflowWrap: 'anywhere' }}>{item.title}</strong>
                        </SarakFlex>
                        <SarakFlex gap="spacing-sm">
                            <SarakButton type="button" size="sm" variant="success" disabled={busy} onClick={onApprove}>{text('approvalApprove')}</SarakButton>
                            <SarakButton type="button" size="sm" variant="danger" disabled={busy} onClick={onReject}>{text('approvalReject')}</SarakButton>
                        </SarakFlex>
                    </SarakFlex>
                    {meta && <span className="text-theme-muted" style={{ fontSize: 'var(--sarak-type-scale-xs, 11px)' }}>{meta}</span>}
                    <SarakDiffView {...item.diff} />
                </div>
            </SarakCard.Body>
        </SarakCard>
    );
};

/** Fila de aprovação: cada item mostra a diferença, e o aprovador aprova, ou rejeita com motivo, um a um ou em lote. */
export const SarakApprovalQueue = ({ items, onApprove, onReject, selectedIds, onSelectedIdsChange, busy = false, className }: SarakApprovalQueueProps): React.ReactElement => {
    const text = useLibraryText();
    const [ownSelected, setOwnSelected] = useState<string[]>([]);
    const [rejecting, setRejecting] = useState<string[] | null>(null);
    const selected = (selectedIds ?? ownSelected).filter((id) => items.some((item) => item.id === id));

    const select = (ids: string[]): void => {
        if (selectedIds === undefined) setOwnSelected(ids);
        onSelectedIdsChange?.(ids);
    };
    const toggle = (id: string, checked: boolean): void => select(checked ? [...selected, id] : selected.filter((selectedId) => selectedId !== id));
    const reject = (reason: string): void => {
        if (rejecting) onReject(rejecting, reason);
        setRejecting(null);
        select(selected.filter((id) => !rejecting?.includes(id)));
    };

    if (items.length === 0) return <SarakEmptyState type="minimal" title={text('approvalEmpty')} />;
    return (
        <div className={mergeSarakClasses('sarak-approval-queue @container w-full', className)} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 'var(--sarak-layout-gap-md, 16px)' }}>
            <SarakFlex align="center" gap="spacing-sm">
                <SarakCheckbox
                    aria-label={text('approvalSelectAll')}
                    checked={selected.length === items.length}
                    indeterminate={selected.length > 0 && selected.length < items.length}
                    onChange={(event) => select(event.target.checked ? items.map((item) => item.id) : [])}
                />
                {selected.length > 0 && (
                    <>
                        <SarakButton type="button" size="sm" variant="success" disabled={busy} onClick={() => { onApprove(selected); select([]); }}>
                            {text('approvalApproveSelected', { count: selected.length })}
                        </SarakButton>
                        <SarakButton type="button" size="sm" variant="danger" disabled={busy} onClick={() => setRejecting(selected)}>
                            {text('approvalRejectSelected', { count: selected.length })}
                        </SarakButton>
                    </>
                )}
            </SarakFlex>
            {rejecting && <RejectPanel count={rejecting.length} busy={busy} onConfirm={reject} onCancel={() => setRejecting(null)} text={text} />}
            {items.map((item) => (
                <ItemCard
                    key={item.id}
                    item={item}
                    selected={selected.includes(item.id)}
                    busy={busy}
                    onSelect={(checked) => toggle(item.id, checked)}
                    onApprove={() => { onApprove([item.id]); select(selected.filter((id) => id !== item.id)); }}
                    onReject={() => setRejecting([item.id])}
                    text={text}
                />
            ))}
        </div>
    );
};
