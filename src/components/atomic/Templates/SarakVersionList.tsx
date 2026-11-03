import React, { useId, useState } from 'react';
import { useLibraryText, type LibraryTextFn } from '../../../core/i18n/useLibraryText';
import { SarakButton } from '../Buttons/SarakButton';
import { SarakBadge } from '../Feedback/SarakBadge';
import { SarakEmptyState } from '../Feedback/SarakEmptyState';
import { SarakFlex } from '../Layouts/SarakFlex';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';
import { SarakDiffView, type SarakDiffViewProps } from './SarakDiffView';
import { useSystemFormat, type SarakSystemTimestamp } from './hooks/useSystemFormat';

export interface SarakVersionItem {
    id: string;
    /** Nome da versão: número, data ou título. */
    label: string;
    author?: string;
    at: SarakSystemTimestamp;
    summary?: React.ReactNode;
    /** A versão em vigor: leva o selo "Atual" e não oferece restaurar. */
    current?: boolean;
    /** Diferença para a versão anterior; com ela, o item oferece "Comparar com a anterior". */
    diff?: SarakDiffViewProps;
}

export interface SarakVersionListProps extends Omit<React.HTMLAttributes<HTMLOListElement>, 'children'> {
    versions: SarakVersionItem[];
    /** Chamado ao pedir para restaurar uma versão; a lib não restaura nada. */
    onRestore?: (versionId: string) => void;
    /** Ids com a comparação aberta (controlado); omitido, a lista guarda. */
    openIds?: string[];
    onOpenIdsChange?: (ids: string[]) => void;
}

const VersionRow = ({ version, open, onToggle, onRestore, text }: {
    version: SarakVersionItem;
    open: boolean;
    onToggle: () => void;
    onRestore?: (versionId: string) => void;
    text: LibraryTextFn;
}): React.ReactElement => {
    const format = useSystemFormat();
    const diffId = useId();
    const meta = [version.author ? text('versionBy', { author: version.author }) : '', format.dateTime(version.at)].filter(Boolean).join(' · ');
    return (
        <li style={{ display: 'grid', gap: 'var(--sarak-layout-gap-sm, 8px)', padding: 'var(--sarak-layout-gap-md, 16px) 0', borderBottom: 'var(--sarak-border-width, 1px) solid var(--theme-border)' }}>
            <SarakFlex align="center" justify="space-between" gap="spacing-sm">
                <SarakFlex align="center" gap="spacing-sm" wrap={false} style={{ minWidth: 0 }}>
                    <strong className="text-theme-text" style={{ overflowWrap: 'anywhere' }}>{version.label}</strong>
                    {version.current && <SarakBadge variant="info" showStatusShape>{text('versionCurrent')}</SarakBadge>}
                </SarakFlex>
                <SarakFlex align="center" gap="spacing-sm">
                    {version.diff && (
                        <SarakButton type="button" size="sm" variant="ghost" aria-expanded={open} aria-controls={diffId} onClick={onToggle}>
                            {text(open ? 'versionHideCompare' : 'versionCompare')}
                        </SarakButton>
                    )}
                    {onRestore && !version.current && (
                        <SarakButton type="button" size="sm" variant="outline" onClick={() => onRestore(version.id)}>
                            {text('versionRestore', { version: version.label })}
                        </SarakButton>
                    )}
                </SarakFlex>
            </SarakFlex>
            {meta && <span className="text-theme-muted" style={{ fontSize: 'var(--sarak-type-scale-xs, 11px)' }}>{meta}</span>}
            {version.summary && <div className="text-theme-text">{version.summary}</div>}
            {version.diff && open && <div id={diffId}><SarakDiffView {...version.diff} /></div>}
        </li>
    );
};

/** Histórico de versões: autor, data, resumo, comparação com a anterior (via `SarakDiffView`) e pedido de restauração. */
export const SarakVersionList = ({ versions, onRestore, openIds, onOpenIdsChange, className, ...props }: SarakVersionListProps): React.ReactElement => {
    const text = useLibraryText();
    const [ownOpen, setOwnOpen] = useState<string[]>([]);
    const open = openIds ?? ownOpen;
    const toggle = (id: string): void => {
        const next = open.includes(id) ? open.filter((openId) => openId !== id) : [...open, id];
        if (openIds === undefined) setOwnOpen(next);
        onOpenIdsChange?.(next);
    };

    if (versions.length === 0) return <SarakEmptyState type="minimal" title={text('versionEmpty')} />;
    return (
        <ol {...props} className={mergeSarakClasses('sarak-version-list @container w-full', className)} style={{ listStyle: 'none', margin: 0, padding: 0, ...props.style }}>
            {versions.map((version) => (
                <VersionRow key={version.id} version={version} open={open.includes(version.id)} onToggle={() => toggle(version.id)} onRestore={onRestore} text={text} />
            ))}
        </ol>
    );
};
