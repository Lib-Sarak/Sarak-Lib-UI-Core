import React, { useRef, useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import { PaletteSwatch } from './PaletteSwatch';
import { CollapsibleSection } from './CollapsibleSection';
import { MINE_GROUP, useOpenGalleryGroups } from '../hooks/useOpenGalleryGroups';
import { usePeekHandlers, type PeekHandler } from '../../Canvas/components/peek';
import type { SarakDesignState } from '../../../../core/Provider/types';
import { groupPresetsByType, PALETTE_TYPE_TEXT_KEY } from '../utils/paletteDraft';
import { parsePaletteValue } from '../../../../core/Design/palette/parser';
import type { SarakSavedPalette } from '../../../../core/Design/palette/savedPalettes';
import type { SarakPaletteInput, SarakPaletteMode, SarakPaletteType } from '../../../../core/Design/palette/types';
import type { LibraryTextKey } from '../../../../core/i18n/catalog';

interface PaletteGalleryProps {
    selectedId: string;
    onSelect: (id: string) => void;
    /** Modo em que a faixa de cada paleta é calculada; o da prévia. */
    mode?: SarakPaletteMode;
    /** Recebe o que a prévia compõe enquanto o mouse ou o foco está numa paleta; sem ele a galeria não espia. */
    onPeek?: PeekHandler;
    /** O que a paleta escreveria no rascunho, calculado sem gravar nada. */
    peekTokensOf?: (id: string) => Partial<SarakDesignState> | null;
    /** As paletas que o administrador salvou: o grupo "Minhas paletas", acima das prontas. */
    savedPalettes?: readonly SarakSavedPalette[];
    /** Pede para apagar uma paleta salva; sem ele a linha não tem o botão. */
    onDeleteSaved?: (entry: SarakSavedPalette) => void;
}

const ARROW_STEP: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
const ALL = 'all';
type PaletteFilter = SarakPaletteType | typeof ALL;
type Translate = ReturnType<typeof useLibraryText>;

/** Uma linha da galeria: o `value` é o `colorPalette` que escolhê-la grava (o id do preset, ou o `custom:…` da salva). */
interface PaletteRow {
    rowId: string;
    value: string;
    name: string;
    typeKey: LibraryTextKey;
    input: SarakPaletteInput;
    saved?: SarakSavedPalette;
}

interface PaletteRowGroup { id: string; titleKey: LibraryTextKey; rows: PaletteRow[] }

interface PaletteOptionProps {
    row: PaletteRow;
    label: string;
    checked: boolean;
    tabbable: boolean;
    mode: SarakPaletteMode;
    buttonRef: (node: HTMLButtonElement | null) => void;
    onSelect: () => void;
    onKeyDown: (event: React.KeyboardEvent) => void;
    onFocusOption: () => void;
    onPeek?: PeekHandler;
    peekTokensOf?: (id: string) => Partial<SarakDesignState> | null;
}

/** Uma paleta da galeria: o mouse e o foco espiam, só o clique ou Enter escolhem. */
const PaletteOption: React.FC<PaletteOptionProps> = (props) => {
    const { row, label, checked, tabbable, mode, buttonRef, onSelect, onKeyDown, onFocusOption, onPeek, peekTokensOf } = props;
    const peek = usePeekHandlers(onPeek, () => peekTokensOf?.(row.value) ?? null);
    return (
        <button
            ref={buttonRef}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={label}
            tabIndex={tabbable ? 0 : -1}
            onClick={onSelect}
            onKeyDown={onKeyDown}
            onMouseEnter={peek.onMouseEnter}
            onMouseMove={peek.onMouseMove}
            onMouseLeave={peek.onMouseLeave}
            onFocus={() => { onFocusOption(); peek.onFocus(); }}
            onBlur={peek.onBlur}
            className={'flex min-w-0 flex-1 items-center gap-2 rounded-[var(--sarak-card-radius,10px)] px-1 py-1 text-left text-[length:var(--sarak-type-scale-caption,12px)] text-[var(--theme-title)] hover:bg-[var(--theme-primary)]/10 border ' + (checked ? 'border-[var(--theme-primary)]' : 'border-transparent')}
        >
            <span className="w-24 shrink-0"><PaletteSwatch input={row.input} mode={mode} /></span>
            <span className="min-w-0 flex-1 truncate font-medium">{row.name}</span>
            {checked && <Check size={14} aria-hidden="true" className="shrink-0 text-[var(--theme-primary)]" />}
        </button>
    );
};

const FILTER_CLASS = 'rounded-full border px-2 py-0.5 text-[length:var(--sarak-type-scale-caption,12px)] hover:bg-[var(--theme-surface)] hover:text-[var(--theme-title)] ';
const FILTER_ON = 'border-[var(--theme-primary)] bg-[var(--theme-surface)] font-semibold text-[var(--theme-title)]';
const FILTER_OFF = 'border-[var(--theme-border)] text-[var(--theme-muted)]';

const savedRowsOf = (saved: readonly SarakSavedPalette[]): PaletteRow[] => saved.flatMap((entry) => {
    const input = parsePaletteValue(entry.value);
    return input ? [{ rowId: entry.id, value: entry.value, name: entry.name, typeKey: PALETTE_TYPE_TEXT_KEY[input.type], input, saved: entry }] : [];
});

/** Os grupos da galeria: "Minhas paletas" (quando há) e um por tipo de harmonia, cada um com as linhas que o filtro deixa. */
const rowGroupsOf = (saved: readonly SarakSavedPalette[], filter: PaletteFilter, text: Translate): PaletteRowGroup[] => {
    const types = groupPresetsByType().map((group) => ({
        id: group.type,
        titleKey: PALETTE_TYPE_TEXT_KEY[group.type],
        rows: group.entries.map((entry): PaletteRow => ({
            rowId: entry.id, value: entry.id, name: entry.textKey ? text(entry.textKey) : entry.label, typeKey: PALETTE_TYPE_TEXT_KEY[group.type], input: entry.input,
        })),
    }));
    const mine: PaletteRowGroup[] = filter === ALL && saved.length > 0 ? [{ id: MINE_GROUP, titleKey: 'paletteMineTitle', rows: savedRowsOf(saved) }] : [];
    return [...mine, ...types.filter((group) => filter === ALL || group.id === filter)];
};

/** O grupo aberto de partida: o da paleta escolhida; sem ela, "Minhas paletas" quando há; sem nenhum dos dois, tudo recolhido. */
const initialOpenGroups = (groups: readonly PaletteRowGroup[], selectedId: string): ReadonlySet<string> => {
    const open = groups.find((group) => group.rows.some((row) => row.value === selectedId))?.id ?? groups.find((group) => group.id === MINE_GROUP)?.id;
    return new Set(open ? [open] : []);
};

/**
 * Galeria de paletas: "Minhas paletas" e as prontas por tipo, cada grupo recolhido menos o da paleta escolhida; uma linha por
 * paleta (faixa de cores e nome). As linhas são um `radiogroup` com setas e foco itinerante entre as dos grupos abertos; os
 * filtros são botões de alternância.
 */
export const PaletteGallery: React.FC<PaletteGalleryProps> = ({ selectedId, onSelect, mode = 'dark', onPeek, peekTokensOf, savedPalettes = [], onDeleteSaved }) => {
    const text = useLibraryText();
    const [filter, setFilter] = useState<PaletteFilter>(ALL);
    const groups = rowGroupsOf(savedPalettes, filter, text);
    const { opened, toggle } = useOpenGalleryGroups(() => initialOpenGroups(rowGroupsOf(savedPalettes, ALL, text), selectedId), savedPalettes.length);
    const flat = groups.filter((group) => opened.has(group.id)).flatMap((group) => group.rows);
    const buttons = useRef<Array<HTMLButtonElement | null>>([]);
    // O foco itinerante: a opção que tem o foco, ou a escolhida enquanto nenhuma o tem.
    const [focusedId, setFocusedId] = useState<string | null>(null);
    const anchor = flat.find((row) => row.rowId === focusedId) ?? flat.find((row) => row.value === selectedId) ?? flat[0];
    const focusableIndex = anchor ? flat.indexOf(anchor) : -1;

    const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
        const step = ARROW_STEP[event.key];
        if (!step) return;
        event.preventDefault();
        const next = (index + step + flat.length) % flat.length;
        // As setas só movem o foco (e o foco espia): escolher é o clique ou o Enter.
        buttons.current[next]?.focus();
    };

    const filters: Array<{ id: PaletteFilter; label: string }> = [
        { id: ALL, label: text('paletteFilterAll') },
        ...groupPresetsByType().map((group) => ({ id: group.type, label: text(PALETTE_TYPE_TEXT_KEY[group.type]) })),
    ];

    return (
        <div className="flex flex-col gap-[var(--sarak-layout-gap-sm,12px)]">
            <div role="group" aria-label={text('paletteFilterLabel')} className="flex flex-wrap gap-1">
                {filters.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        aria-pressed={filter === item.id}
                        onClick={() => setFilter(item.id)}
                        className={FILTER_CLASS + (filter === item.id ? FILTER_ON : FILTER_OFF)}
                    >
                        {item.label}
                    </button>
                ))}
            </div>
            <div role="radiogroup" aria-label={text('paletteGalleryLabel')} className="flex flex-col gap-1">
                {groups.map((group) => (
                    <CollapsibleSection
                        key={group.id}
                        title={text(group.titleKey)}
                        toggleId={`palette-${group.id}`}
                        sectionProps={{ 'data-palette-group': group.id }}
                        open={opened.has(group.id)}
                        onToggle={() => toggle(group.id)}
                    >
                        <div className="flex flex-col">
                            {group.rows.map((row) => {
                                const index = flat.indexOf(row);
                                return (
                                    <div key={row.rowId} className="flex items-center gap-1">
                                        <PaletteOption
                                            row={row}
                                            label={text('paletteOptionLabel', { name: row.name, type: text(row.typeKey) })}
                                            checked={row.value === selectedId}
                                            tabbable={index === focusableIndex}
                                            mode={mode}
                                            buttonRef={(node) => { buttons.current[index] = node; }}
                                            onSelect={() => onSelect(row.value)}
                                            onKeyDown={(event) => handleKeyDown(event, index)}
                                            onFocusOption={() => setFocusedId(row.rowId)}
                                            onPeek={onPeek}
                                            peekTokensOf={peekTokensOf}
                                        />
                                        {row.saved && onDeleteSaved && (
                                            <button
                                                type="button"
                                                aria-label={text('paletteDeleteLabel', { name: row.name })}
                                                onClick={() => onDeleteSaved(row.saved as SarakSavedPalette)}
                                                className="shrink-0 rounded-[var(--sarak-card-radius,10px)] p-1 text-[var(--theme-muted)] hover:bg-[var(--theme-primary)]/10 hover:text-[var(--theme-title)]"
                                            >
                                                <Trash2 size={14} aria-hidden="true" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </CollapsibleSection>
                ))}
            </div>
        </div>
    );
};
