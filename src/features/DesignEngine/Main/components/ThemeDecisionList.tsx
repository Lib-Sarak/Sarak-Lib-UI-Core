import React, { useEffect, useRef } from 'react';
import { ChevronRight, Sparkles } from 'lucide-react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import { summarizeDecision, fontFamilyName } from '../../utils/decisionSummary';
import { COLUMN_DECISIONS, type DecisionId } from '../../utils/decisions';

interface ThemeDecisionListProps {
    draft: Readonly<Record<string, unknown>>;
    /** O nome do tema do rascunho (a decisão Tema não tem token para mostrar). */
    themeName: string;
    /** As decisões com mudança de rascunho: cada uma ganha a marca de alterada. */
    dirtyDecisions: ReadonlySet<DecisionId>;
    onOpen: (id: DecisionId) => void;
    onOpenBrand: () => void;
    /** A linha que recebe o foco ao voltar de uma decisão (ou `brand`). */
    restoreFocusId?: string;
}

const ROW_CLASS = 'flex w-full items-center gap-3 rounded-[var(--sarak-card-radius,10px)] px-3 py-2 text-left hover:bg-[var(--theme-primary)]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)]';

const colorOf = (draft: Readonly<Record<string, unknown>>, id: string): string => (typeof draft[id] === 'string' ? (draft[id] as string) : 'transparent');

const GLYPH_WIDTH = 'w-14 shrink-0';

/** Um valor responsivo (`{ mob, tab, desk }`) vira o número do desktop. */
const numberOf = (value: unknown): number => {
    const raw = value !== null && typeof value === 'object' ? (value as Record<string, unknown>).desk : value;
    return typeof raw === 'number' ? raw : 0;
};

const MAX_GLYPH_RADIUS = 11;

/** O sinal vivo de cada linha: a faixa de cores, o "Aa" na fonte do título, a caixa com o raio, o botão ou a barra; o ícone cobre o que não tem amostra. */
const DecisionGlyph: React.FC<{ id: DecisionId; draft: ThemeDecisionListProps['draft'] }> = ({ id, draft }) => {
    if (id === 'colors') {
        return (
            <span aria-hidden="true" className={'flex h-5 overflow-hidden rounded-md border border-[var(--theme-border)] ' + GLYPH_WIDTH}>
                {['primaryColor', 'secondaryColor', 'accentColor'].map((token) => (
                    <i key={token} className="block h-full flex-1" style={{ background: colorOf(draft, token) }} />
                ))}
            </span>
        );
    }
    if (id === 'fonts') {
        return <span aria-hidden="true" className={'text-xl font-bold leading-none text-[var(--theme-title)] ' + GLYPH_WIDTH} style={{ fontFamily: fontFamilyName(draft.headingFont) || undefined }}>Aa</span>;
    }
    if (id === 'shape') {
        const radius = Math.min(numberOf(draft.cardBorderRadius), MAX_GLYPH_RADIUS);
        return <span aria-hidden="true" className={'flex ' + GLYPH_WIDTH}><i className="block h-5 w-8 border-2 border-[var(--theme-muted)]" style={{ borderRadius: radius }} /></span>;
    }
    if (id === 'components') {
        return <span aria-hidden="true" className={'flex ' + GLYPH_WIDTH}><i className="block h-4 w-9 rounded-md" style={{ background: colorOf(draft, 'primaryColor') }} /></span>;
    }
    if (id === 'layout') {
        const isTop = draft.navigationStyle === 'topbar';
        return (
            <span aria-hidden="true" className={'flex gap-0.5 ' + (isTop ? 'h-5 flex-col' : 'h-5 flex-row') + ' ' + GLYPH_WIDTH}>
                <i className={'block rounded-sm bg-[var(--theme-muted)] ' + (isTop ? 'h-1.5 w-full' : 'h-full w-2')} />
                <i className="block flex-1 rounded-sm bg-[var(--theme-border)]" />
            </span>
        );
    }
    return <span aria-hidden="true" className={'flex justify-start text-[var(--theme-muted)] ' + GLYPH_WIDTH}><Sparkles size={18} /></span>;
};

/** A lista de seis decisões, cada uma com o valor que vale agora e a marca de alterada. */
export const ThemeDecisionList: React.FC<ThemeDecisionListProps> = ({ draft, themeName, dirtyDecisions, onOpen, onOpenBrand, restoreFocusId }) => {
    const text = useLibraryText();
    const root = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (restoreFocusId) root.current?.querySelector<HTMLElement>(`[data-decision-row="${restoreFocusId}"]`)?.focus();
    }, [restoreFocusId]);

    return (
        <div ref={root} className="flex flex-col gap-1 p-[var(--sarak-layout-gap-sm,12px)]">
            <button
                type="button"
                data-decision-row="brand"
                onClick={onOpenBrand}
                className="mb-2 flex w-full items-center gap-3 rounded-[var(--sarak-card-radius,10px)] border border-[var(--theme-primary)]/50 bg-[var(--theme-surface)] p-3 text-left hover:bg-[var(--theme-primary)]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)]"
            >
                <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--theme-primary)]/20 text-[var(--theme-primary)]"><Sparkles size={16} /></span>
                <span className="min-w-0">
                    <span className="block text-[length:var(--sarak-type-scale-caption,12px)] font-semibold text-[var(--theme-title)]">{text('brandShortcutTitle')}</span>
                    <span className="block text-[length:var(--sarak-type-scale-caption,12px)] text-[var(--theme-muted)]">{text('brandShortcutHint')}</span>
                </span>
            </button>
            <ul aria-label={text('decisionListLabel')} className="flex flex-col gap-0.5">
                {COLUMN_DECISIONS.map((decision) => {
                    const value = decision.id === 'theme' ? themeName || text('decisionCustomTheme') : summarizeDecision(decision.id, draft, text);
                    const isDirty = dirtyDecisions.has(decision.id);
                    return (
                        <li key={decision.id}>
                            <button type="button" data-decision-row={decision.id} className={ROW_CLASS} onClick={() => onOpen(decision.id)}>
                                <DecisionGlyph id={decision.id} draft={draft} />
                                <span className="min-w-0 flex-1">
                                    <span className="block text-[length:var(--sarak-type-scale-caption,12px)] font-semibold text-[var(--theme-title)]">{text(decision.textKey)}</span>
                                    <span className="block truncate text-[length:var(--sarak-type-scale-caption,12px)] text-[var(--theme-muted)]">{value}</span>
                                </span>
                                {isDirty && <span role="img" aria-label={text('decisionChanged')} title={text('decisionChanged')} className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--theme-primary)]" />}
                                <ChevronRight size={16} aria-hidden="true" className="shrink-0 text-[var(--theme-muted)]" />
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};
