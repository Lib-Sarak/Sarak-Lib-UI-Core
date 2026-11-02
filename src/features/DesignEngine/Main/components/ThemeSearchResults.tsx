import React, { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { DecisionTokenList, enhanceToken, type ColumnTokenProps } from './DecisionTokenList';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import { COLUMN_DECISIONS, getDecision, type DecisionId, type TokenLocation } from '../../utils/decisions';
import {
    AREAS_FIRST_THRESHOLD, MAX_PER_GROUP, findOptionEntries, groupByDecision, type LocatedResult, type ResultGroup,
} from '../../utils/searchGroups';
import { suggestQuery } from '../../utils/token-search';
import type { SarakDesignToken } from '../../../../core/Design/types';

interface ThemeSearchResultsProps extends ColumnTokenProps {
    query: string;
    results: readonly SarakDesignToken[];
    tokenIndex: ReadonlyMap<string, TokenLocation>;
    onOpenToken: (decisionId: DecisionId, tokenId?: string) => void;
}

type Translate = ReturnType<typeof useLibraryText>;

const PATH_SEPARATOR = ' › ';
const captionClass = 'text-[length:var(--sarak-type-scale-caption,12px)]';
const pillClass = 'rounded-[var(--sarak-card-radius,10px)] px-3 py-1.5 text-left hover:bg-[var(--theme-primary)]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)]';

const decisionName = (text: Translate, id: DecisionId): string => {
    const decision = getDecision(id);
    return decision ? text(decision.textKey) : '';
};

const placeOf = (text: Translate, location: TokenLocation): string =>
    [decisionName(text, location.decisionId), location.section].filter(Boolean).join(PATH_SEPARATOR);

const ResultRow: React.FC<{ item: LocatedResult; text: Translate; onOpen: ThemeSearchResultsProps['onOpenToken'] }> = ({ item, text, onOpen }) => {
    const place = placeOf(text, item.location);
    return (
        <li>
            <button
                type="button"
                data-search-result={item.token.id}
                aria-label={text('searchResultOpen', { name: item.token.label, place })}
                onClick={() => onOpen(item.location.decisionId, item.token.id)}
                className="flex w-full items-center gap-2 rounded-[var(--sarak-card-radius,10px)] px-3 py-2 text-left hover:bg-[var(--theme-primary)]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)]"
            >
                <span className="min-w-0 flex-1">
                    <span className={`block truncate ${captionClass} font-semibold text-[var(--theme-title)]`}>{item.token.label}</span>
                    <span data-testid="search-result-path" className="block truncate text-[length:var(--sarak-type-scale-tiny,11px)] text-[var(--theme-muted)]">{place}</span>
                </span>
                <ChevronRight size={16} aria-hidden="true" className="shrink-0 text-[var(--theme-muted)]" />
            </button>
        </li>
    );
};

interface GroupProps {
    group: ResultGroup;
    text: Translate;
    expanded: boolean;
    onToggle: () => void;
    onOpen: ThemeSearchResultsProps['onOpenToken'];
}

const ResultGroupView: React.FC<GroupProps> = ({ group, text, expanded, onToggle, onOpen }) => {
    const visible = expanded ? group.items : group.items.slice(0, MAX_PER_GROUP);
    const name = text('searchGroupTitle', { name: decisionName(text, group.decisionId), count: group.items.length });
    return (
        <section aria-label={name} data-search-group={group.decisionId} className="flex flex-col gap-0.5">
            <h3 className="px-3 pt-2 text-[length:var(--sarak-type-scale-tiny,11px)] font-black uppercase tracking-widest text-[var(--theme-muted)]">{name}</h3>
            <ul className="flex flex-col gap-0.5">
                {visible.map((item) => <ResultRow key={item.token.id} item={item} text={text} onOpen={onOpen} />)}
            </ul>
            {group.items.length > MAX_PER_GROUP && (
                <button type="button" aria-expanded={expanded} onClick={onToggle} className={`${pillClass} ${captionClass} font-semibold text-[var(--theme-primary)]`}>
                    {expanded ? text('searchShowFewer') : text('searchShowAll', { count: group.items.length })}
                </button>
            )}
        </section>
    );
};

const AreaList: React.FC<{ groups: ResultGroup[]; text: Translate; onPick: (id: DecisionId) => void }> = ({ groups, text, onPick }) => (
    <div className="flex flex-col gap-1">
        <div role="status" className={`${captionClass} text-[var(--theme-muted)]`}>{text('searchPickArea')}</div>
        <ul className="flex flex-wrap gap-2">
            {groups.map((group) => (
                <li key={group.decisionId}>
                    <button type="button" data-search-area={group.decisionId} onClick={() => onPick(group.decisionId)} className={`${pillClass} ${captionClass} border border-[var(--theme-border)] font-semibold text-[var(--theme-title)]`}>
                        {text('searchGroupTitle', { name: decisionName(text, group.decisionId), count: group.items.length })}
                    </button>
                </li>
            ))}
        </ul>
    </div>
);

interface OptionsProps {
    query: string;
    tokenIndex: ReadonlyMap<string, TokenLocation>;
    text: Translate;
    onOpen: ThemeSearchResultsProps['onOpenToken'];
}

const OptionEntries: React.FC<OptionsProps> = ({ query, tokenIndex, text, onOpen }) => {
    const entries = findOptionEntries(query, tokenIndex, (id) => decisionName(text, id));
    if (entries.length === 0) return null;
    return (
        <section aria-label={text('searchOptionsTitle')} className="flex flex-col gap-1">
            <h3 className="px-3 text-[length:var(--sarak-type-scale-tiny,11px)] font-black uppercase tracking-widest text-[var(--theme-muted)]">{text('searchOptionsTitle')}</h3>
            <ul className="flex flex-wrap gap-2">
                {entries.map((entry) => {
                    const place = [decisionName(text, entry.decisionId), entry.section].filter(Boolean).join(PATH_SEPARATOR);
                    return (
                        <li key={`${entry.decisionId}|${entry.section}`}>
                            <button type="button" data-search-option={place} aria-label={text('searchOptionOpen', { place })} onClick={() => onOpen(entry.decisionId)} className={`${pillClass} ${captionClass} border border-[var(--theme-border)] text-[var(--theme-title)]`}>{place}</button>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
};

const EmptyState: React.FC<{ query: string; suggestion: string | null; text: Translate; onOpen: ThemeSearchResultsProps['onOpenToken'] }> = ({ query, suggestion, text, onOpen }) => (
    <div className="flex flex-col gap-2">
        <div role="status" className={`${captionClass} text-[var(--theme-muted)]`}>{text('searchNoResults', { query })}</div>
        {suggestion && <div data-search-suggestion className={`${captionClass} font-semibold text-[var(--theme-title)]`}>{text('searchDidYouMean', { term: suggestion })}</div>}
        <div className={`${captionClass} text-[var(--theme-muted)]`}>{text('searchTryDecisions')}</div>
        <ul className="flex flex-wrap gap-2">
            {COLUMN_DECISIONS.map((decision) => (
                <li key={decision.id}>
                    <button type="button" data-search-decision={decision.id} onClick={() => onOpen(decision.id)} className={`${pillClass} ${captionClass} border border-[var(--theme-border)] font-semibold text-[var(--theme-title)]`}>{text(decision.textKey)}</button>
                </li>
            ))}
        </ul>
    </div>
);

/**
 * A busca atravessa todas as decisões e responde por decisão, com a contagem. Cada resultado leva ao token: abre a
 * decisão que o contém, com o ajuste fino aberto quando é lá que ele mora. Passando de 20 resultados, abre primeiro as
 * áreas. O token que nenhuma decisão lista segue editável no próprio resultado.
 */
export const ThemeSearchResults: React.FC<ThemeSearchResultsProps> = ({ query, results, tokenIndex, onOpenToken, ...tokenProps }) => {
    const text = useLibraryText();
    const [area, setArea] = useState<DecisionId | null>(null);
    const [expanded, setExpanded] = useState<ReadonlySet<DecisionId>>(new Set());
    useEffect(() => { setArea(null); setExpanded(new Set()); }, [query]);

    const located = results.flatMap((token) => {
        const location = tokenIndex.get(token.id);
        return location ? [{ token: enhanceToken(token, tokenProps.catalogMap), location }] : [];
    });
    const orphans = results.filter((token) => !tokenIndex.has(token.id));
    const groups = groupByDecision(located);
    const areasFirst = located.length > AREAS_FIRST_THRESHOLD && area === null;
    const shown = area === null ? groups : groups.filter((group) => group.decisionId === area);
    const toggle = (id: DecisionId) => setExpanded((current) => {
        const next = new Set(current);
        if (!next.delete(id)) next.add(id);
        return next;
    });

    return (
        <div className="flex flex-col gap-[var(--sarak-layout-gap-sm,12px)] p-[var(--sarak-layout-gap-sm,12px)]">
            <div className={`mb-2 ${captionClass} font-black uppercase tracking-widest text-[var(--theme-muted)]`}>{text('searchResultsTitle', { count: results.length })}</div>
            {results.length === 0 && <EmptyState query={query} suggestion={suggestQuery(query, tokenProps.catalogMap)} text={text} onOpen={onOpenToken} />}
            <OptionEntries query={query} tokenIndex={tokenIndex} text={text} onOpen={onOpenToken} />
            {areasFirst && <AreaList groups={groups} text={text} onPick={(id) => { setArea(id); setExpanded(new Set([id])); }} />}
            {area !== null && located.length > AREAS_FIRST_THRESHOLD && (
                <button type="button" onClick={() => setArea(null)} className={`${pillClass} ${captionClass} self-start font-semibold text-[var(--theme-primary)]`}>{text('searchAllAreas')}</button>
            )}
            {!areasFirst && shown.map((group) => (
                <ResultGroupView key={group.decisionId} group={group} text={text} expanded={expanded.has(group.decisionId)} onToggle={() => toggle(group.decisionId)} onOpen={onOpenToken} />
            ))}
            {orphans.length > 0 && <DecisionTokenList tokens={orphans} {...tokenProps} />}
        </div>
    );
};
