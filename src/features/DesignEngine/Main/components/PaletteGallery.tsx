import React, { useRef } from 'react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import { PaletteSwatch } from './PaletteSwatch';
import { groupPresetsByType, PALETTE_TYPE_TEXT_KEY, type PaletteGalleryEntry } from '../utils/paletteDraft';

interface PaletteGalleryProps {
    selectedId: string;
    onSelect: (id: string) => void;
}

const ARROW_STEP: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

/** Galeria de paletas prontas, agrupada por tipo: um `radiogroup` com setas e foco itinerante. */
export const PaletteGallery: React.FC<PaletteGalleryProps> = ({ selectedId, onSelect }) => {
    const text = useLibraryText();
    const groups = groupPresetsByType();
    const flat: PaletteGalleryEntry[] = groups.flatMap((group) => group.entries);
    const buttons = useRef<Array<HTMLButtonElement | null>>([]);
    const focusableIndex = Math.max(0, flat.findIndex((entry) => entry.id === selectedId));

    const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
        const step = ARROW_STEP[event.key];
        if (!step) return;
        event.preventDefault();
        const next = (index + step + flat.length) % flat.length;
        buttons.current[next]?.focus();
        onSelect(flat[next].id);
    };

    return (
        <div role="radiogroup" aria-label={text('paletteGalleryLabel')} className="flex flex-col gap-[var(--sarak-layout-gap-sm,12px)]">
            {groups.map((group) => (
                <div key={group.type} role="none" className="flex flex-col gap-1">
                    <span role="none" className="text-[var(--sarak-type-scale-caption,12px)] font-semibold uppercase tracking-wide text-[var(--theme-muted)]">
                        {text(PALETTE_TYPE_TEXT_KEY[group.type])}
                    </span>
                    <div role="none" className="grid grid-cols-2 gap-1">
                        {group.entries.map((entry) => {
                            const index = flat.indexOf(entry);
                            const checked = entry.id === selectedId;
                            const name = entry.textKey ? text(entry.textKey) : entry.label;
                            return (
                                <button
                                    key={entry.id}
                                    ref={(node) => { buttons.current[index] = node; }}
                                    type="button"
                                    role="radio"
                                    aria-checked={checked}
                                    aria-label={text('paletteOptionLabel', { name, type: text(PALETTE_TYPE_TEXT_KEY[group.type]) })}
                                    tabIndex={index === focusableIndex ? 0 : -1}
                                    onClick={() => onSelect(entry.id)}
                                    onKeyDown={(event) => handleKeyDown(event, index)}
                                    className={'flex flex-col gap-1 rounded-[var(--sarak-card-radius,10px)] border p-1 text-left text-[var(--sarak-type-scale-caption,12px)] text-[var(--theme-title)] ' + (checked ? 'border-[var(--theme-primary)] ring-1 ring-[var(--theme-primary)]' : 'border-[var(--theme-border)]')}
                                >
                                    <span className="font-medium">{name}</span>
                                    <PaletteSwatch input={entry.input} />
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};
