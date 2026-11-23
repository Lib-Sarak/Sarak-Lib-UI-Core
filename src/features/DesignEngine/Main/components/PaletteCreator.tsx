import React, { useMemo, useState } from 'react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import { SarakButton } from '../../../../components/atomic/Buttons/SarakButton';
import { SarakCheckbox, SarakInput, SarakSelect } from '../../../../components/atomic/Inputs';
import { ColorControl } from '../../components/DesignControls';
import { PaletteSwatch } from './PaletteSwatch';
import { usePaletteCreatorState } from '../hooks/usePaletteCreatorState';
import { PALETTE_TYPES, PALETTE_TYPE_TEXT_KEY, buildCustomPaletteValue } from '../utils/paletteDraft';
import { MAX_SAVED_PALETTES, MAX_SAVED_PALETTE_NAME } from '../../../../core/Design/palette/savedPalettes';
import type { SavePaletteOutcome } from '../hooks/useSavedPalettes';
import type { SarakPaletteType } from '../../../../core/Design/palette/types';
import type { LibraryTextKey } from '../../../../core/i18n/catalog';

interface PaletteCreatorProps {
    initialBase: string;
    onConfirm: (value: string) => void;
    onClose: () => void;
    /** Guarda a paleta com nome; sem ele o criador não oferece "Salvar paleta". */
    onSave?: (name: string, value: string) => Promise<SavePaletteOutcome>;
}

/** O texto que a tentativa de salvar mostra: o motivo da recusa ou a confirmação de que a paleta foi guardada. */
const saveStatusKey = (outcome: SavePaletteOutcome): LibraryTextKey | null => {
    if (outcome === 'saved') return 'paletteSavedStatus';
    if (outcome === 'name') return 'paletteSaveNameRequired';
    return outcome === 'full' ? 'paletteSaveFull' : null;
};

interface OptionalColorFieldProps {
    useLabel: LibraryTextKey;
    colorLabel: LibraryTextKey;
    value: string | undefined;
    fallback: string;
    onChange: (value: string | undefined) => void;
}

/** Cor opcional: a caixa liga a semente, e só então o seletor de cor aparece. */
const OptionalColorField: React.FC<OptionalColorFieldProps> = ({ useLabel, colorLabel, value, fallback, onChange }) => {
    const text = useLibraryText();
    return (
        <div className="flex items-center gap-2">
            <SarakCheckbox
                label={text(useLabel)}
                checked={value !== undefined}
                onChange={(event) => onChange(event.target.checked ? fallback : undefined)}
            />
            {value !== undefined && (
                <ColorControl label={text(colorLabel)} value={value} onChange={onChange} />
            )}
        </div>
    );
};

/** Criação a partir de uma cor (sem `<form>`: o Enter do campo de cor só confirma a cor, não a paleta): cor-base, tipo, secundária e acento opcionais, com a prévia ao vivo dos dois modos. */
export const PaletteCreator: React.FC<PaletteCreatorProps> = ({ initialBase, onConfirm, onClose, onSave }) => {
    const text = useLibraryText();
    const [name, setName] = useState('');
    const [status, setStatus] = useState<{ key: LibraryTextKey; name: string } | null>(null);
    const { base, setBase, type, setType, secondary, setSecondary, accent, setAccent, input } = usePaletteCreatorState(initialBase);
    const typeOptions = useMemo(
        () => PALETTE_TYPES.map((option) => ({ value: option, label: text(PALETTE_TYPE_TEXT_KEY[option]) })),
        [text],
    );
    const save = async () => {
        if (!input || !onSave) return;
        const outcome = await onSave(name, buildCustomPaletteValue(input));
        const key = saveStatusKey(outcome);
        setStatus(key ? { key, name: name.trim() } : null);
        if (outcome === 'saved') setName('');
    };
    return (
        <div
            role="group"
            aria-label={text('paletteCreateTitle')}
            className="flex flex-col gap-[var(--sarak-layout-gap-sm,12px)] rounded-[var(--sarak-card-radius,10px)] border border-[var(--theme-border)] p-[var(--sarak-layout-gap-sm,12px)]"
        >
            <ColorControl label={text('paletteBaseColor')} value={base} onChange={setBase} />
            <SarakSelect
                label={text('paletteTypeLabel')}
                value={type}
                options={typeOptions}
                onChange={(event) => setType(event.target.value as SarakPaletteType)}
            />
            <OptionalColorField useLabel="paletteSecondaryUse" colorLabel="paletteSecondaryColor" value={secondary} fallback={base} onChange={setSecondary} />
            <OptionalColorField useLabel="paletteAccentUse" colorLabel="paletteAccentColor" value={accent} fallback={base} onChange={setAccent} />
            {input && (
                <div role="img" aria-label={text('palettePreviewLabel', { name: text('paletteCustomName') })}>
                    <PaletteSwatch input={input} />
                </div>
            )}
            {onSave && (
                <div className="flex flex-col gap-2">
                    <SarakInput
                        label={text('paletteSaveNameLabel')}
                        fullWidth
                        value={name}
                        maxLength={MAX_SAVED_PALETTE_NAME}
                        onChange={(event) => { setName(event.target.value); setStatus(null); }}
                    />
                    <SarakButton type="button" variant="secondary" size="sm" disabled={!input} onClick={() => { void save(); }}>{text('paletteSaveAction')}</SarakButton>
                    <p role="status" className="min-h-[var(--sarak-type-scale-caption,12px)] text-[length:var(--sarak-type-scale-caption,12px)] text-[var(--theme-muted)]">
                        {status ? text(status.key, { name: status.name, max: MAX_SAVED_PALETTES }) : ''}
                    </p>
                </div>
            )}
            <div className="flex gap-2">
                <SarakButton type="button" size="sm" disabled={!input} onClick={() => { if (input) onConfirm(buildCustomPaletteValue(input)); }}>{text('paletteCreateConfirm')}</SarakButton>
                <SarakButton type="button" variant="secondary" size="sm" onClick={onClose}>{text('paletteCreateCancel')}</SarakButton>
            </div>
        </div>
    );
};
