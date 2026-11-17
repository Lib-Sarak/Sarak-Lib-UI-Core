import React, { useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import { PaletteSwatch } from './PaletteSwatch';
import { usePeekHandlers, type PeekHandler } from '../../Canvas/components/peek';
import type { SarakDesignState } from '../../../../core/Provider/types';
import { groupPresetsByType, PALETTE_TYPE_TEXT_KEY, type PaletteGalleryEntry } from '../utils/paletteDraft';
import type { SarakPaletteMode, SarakPaletteType } from '../../../../core/Design/palette/types';

interface PaletteGalleryProps {
    selectedId: string;
    onSelect: (id: string) => void;
    /** Modo em que a faixa de cada paleta é calculada; o da prévia. */
    mode?: SarakPaletteMode;
    /** Recebe o que a prévia compõe enquanto o mouse ou o foco está numa paleta; sem ele a galeria não espia. */
    onPeek?: PeekHandler;
    /** O que a paleta escreveria no rascunho, calculado sem gravar nada. */
    peekTokensOf?: (id: string) => Partial<SarakDesignState> | null;
}

const ARROW_STEP: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
const ALL = 'all';
type PaletteFilter = SarakPaletteType | typeof ALL;

interface PaletteOptionProps {
    entry: PaletteGalleryEntry;
    name: string;
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
    const { entry, name, label, checked, tabbable, mode, buttonRef, onSelect, onKeyDown, onFocusOption, onPeek, peekTokensOf } = props;
    const peek = usePeekHandlers(onPeek, () => peekTokensOf?.(entry.id) ?? null);
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
            className={'flex items-center gap-2 rounded-[var(--sarak-card-radius,10px)] px-1 py-1 text-left text-[length:var(--sarak-type-scale-caption,12px)] text-[var(--theme-title)] hover:bg-[var(--theme-primary)]/10 border ' + (checked ? 'border-[var(--theme-primary)]' : 'border-transparent')}
        >
            <span className="w-24 shrink-0"><PaletteSwatch input={entry.input} mode={mode} /></span>
            <span className="min-w-0 flex-1 truncate font-medium">{name}</span>
            {checked && <Check size={14} aria-hidden="true" className="shrink-0 text-[var(--theme-primary)]" />}
        </button>
    );
};

const FILTER_CLASS = 'rounded-full border px-2 py-0.5 text-[length:var(--sarak-type-scale-caption,12px)] ';
const FILTER_ON = 'border-[var(--theme-primary)] bg-[var(--theme-surface)] font-semibold text-[var(--theme-title)]';
const FILTER_OFF = 'border-[var(--theme-border)] text-[var(--theme-muted)]';

/**
 * Galeria de paletas prontas: uma linha por paleta (faixa de cores e nome), filtrável por tipo.
 * As linhas são um `radiogroup` com setas e foco itinerante; os filtros são botões de alternância.
 */
export const PaletteGallery: React.FC<PaletteGalleryProps> = ({ selectedId, onSelect, mode = 'dark', onPeek, peekTokensOf }) => {
    const text = useLibraryText();
    const groups = groupPresetsByType();
    const [filter, setFilter] = useState<PaletteFilter>(ALL);
    const typeOf = new Map(groups.flatMap((group) => group.entries.map((entry) => [entry.id, group.type] as const)));
    const flat: PaletteGalleryEntry[] = groups
        .filter((group) => filter === ALL || group.type === filter)
        .flatMap((group) => group.entries);
    const buttons = useRef<Array<HTMLButtonElement | null>>([]);
    // O foco itinerante: a opção que tem o foco, ou a escolhida enquanto nenhuma o tem.
    const [focusedId, setFocusedId] = useState<string | null>(null);
    const anchorId = flat.some((entry) => entry.id === focusedId) ? focusedId : selectedId;
    const focusableIndex = Math.max(0, flat.findIndex((entry) => entry.id === anchorId));

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
        ...groups.map((group) => ({ id: group.type, label: text(PALETTE_TYPE_TEXT_KEY[group.type]) })),
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
            <div role="radiogroup" aria-label={text('paletteGalleryLabel')} className="flex flex-col">
                {flat.map((entry, index) => {
                    const name = entry.textKey ? text(entry.textKey) : entry.label;
                    const type = typeOf.get(entry.id);
                    return (
                        <PaletteOption
                            key={entry.id}
                            entry={entry}
                            name={name}
                            label={type ? text('paletteOptionLabel', { name, type: text(PALETTE_TYPE_TEXT_KEY[type]) }) : name}
                            checked={entry.id === selectedId}
                            tabbable={index === focusableIndex}
                            mode={mode}
                            buttonRef={(node) => { buttons.current[index] = node; }}
                            onSelect={() => onSelect(entry.id)}
                            onKeyDown={(event) => handleKeyDown(event, index)}
                            onFocusOption={() => setFocusedId(entry.id)}
                            onPeek={onPeek}
                            peekTokensOf={peekTokensOf}
                        />
                    );
                })}
            </div>
        </div>
    );
};
