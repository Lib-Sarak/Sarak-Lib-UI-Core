import React, { useState } from 'react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import { SarakButton } from '../../../../components/atomic/Buttons/SarakButton';
import { PaletteGallery } from './PaletteGallery';
import { PaletteCreator } from './PaletteCreator';
import { usePaletteSelection } from '../hooks/usePaletteSelection';
import { sarakGetDefaultDesignState } from '../../../../core/Design/master-map';
import type { SarakTokenValue } from '../../../../core/Design/types';

interface PaletteSectionProps {
    draft: Record<string, unknown>;
    appliedDesign: Record<string, unknown> | undefined;
    updateDraft: (id: string, value: SarakTokenValue) => void;
}

const FALLBACK_BASE = String(sarakGetDefaultDesignState().primaryColor);
const HEX_COLOR = /^#[0-9a-f]{6}$/i;

/** Paletas no painel: galeria de prontas, criação a partir de uma cor e, por cima, o ajuste de cada token. */
export const PaletteSection: React.FC<PaletteSectionProps> = ({ draft, appliedDesign, updateDraft }) => {
    const text = useLibraryText();
    const [isCreating, setIsCreating] = useState(false);
    const selectPalette = usePaletteSelection({ draft, appliedDesign, updateDraft });
    const primary = draft.primaryColor;
    const initialBase = typeof primary === 'string' && HEX_COLOR.test(primary) ? primary : FALLBACK_BASE;
    const handleCreate = (value: string) => { void selectPalette(value); setIsCreating(false); };

    return (
        <section
            aria-label={text('paletteSectionTitle')}
            className="mx-[var(--sarak-layout-gap-sm,12px)] mb-[var(--sarak-layout-gap-sm,12px)] flex flex-col gap-[var(--sarak-layout-gap-sm,12px)] rounded-[var(--sarak-card-radius,10px)] border border-[var(--theme-border,rgba(255,255,255,0.09))] bg-[var(--theme-card,#101622)] p-[var(--sarak-layout-gap-sm,12px)]"
        >
            <div>
                <h2 className="text-[var(--sarak-type-scale-xl,20px)] font-semibold text-[var(--theme-title,#f2f6fb)]">{text('paletteSectionTitle')}</h2>
                <p className="mt-1 text-[var(--sarak-type-scale-caption,12px)] text-[var(--theme-muted,rgba(242,246,251,0.55))]">{text('paletteSectionHint')}</p>
            </div>
            <PaletteGallery
                selectedId={typeof draft.colorPalette === 'string' ? draft.colorPalette : ''}
                onSelect={(id) => { void selectPalette(id); }}
            />
            {isCreating ? (
                <PaletteCreator initialBase={initialBase} onConfirm={handleCreate} onClose={() => setIsCreating(false)} />
            ) : (
                <SarakButton type="button" variant="secondary" size="sm" onClick={() => setIsCreating(true)}>{text('paletteCreateOpen')}</SarakButton>
            )}
        </section>
    );
};
