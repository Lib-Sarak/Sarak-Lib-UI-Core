import React from 'react';
import { SarakButton } from '../../../../components/atomic/Buttons/SarakButton';
import { SarakInput } from '../../../../components/atomic/Inputs/SarakInput';
import { SarakSelect } from '../../../../components/atomic/Inputs/SarakSelect';
import { ColorControl, MediaUploaderControl } from '../../components/DesignControls';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import { usePaletteSelection } from '../hooks/usePaletteSelection';
import { FONT_OPTIONS, HEX_COLOR, fontPresetOf, paletteValueOf, useBrandForm } from '../hooks/useBrandForm';
import type { PeekHandler } from '../../Canvas/components/peek';
import type { PendingBranding } from '../hooks/usePendingBranding';
import type { SarakDesignState } from '../../../../core/Provider/types';
import type { SarakTokenValue } from '../../../../core/Design/types';

interface BrandShortcutProps {
    draft: SarakDesignState;
    appliedDesign: Record<string, unknown> | undefined;
    updateDraft: (id: string, value: SarakTokenValue) => void;
    /** A prévia reage a cada campo sem gravar nada. */
    onPeek?: PeekHandler;
    setPendingBranding: (branding: PendingBranding) => void;
    /** O tema foi gerado no rascunho: a coluna volta à lista. */
    onGenerated: () => void;
    initialName?: string;
}

/** "Usar minha marca": nome, logo, cor principal e par de fontes viram um tema no rascunho; nada é gravado até o "Aplicar". */
export const BrandShortcut: React.FC<BrandShortcutProps> = ({ draft, appliedDesign, updateDraft, onPeek, setPendingBranding, onGenerated, initialName = '' }) => {
    const text = useLibraryText();
    const { form, change } = useBrandForm(draft, initialName, onPeek);
    const selectPalette = usePaletteSelection({ draft: draft as unknown as Record<string, unknown>, appliedDesign, updateDraft });

    const generate = async () => {
        const value = paletteValueOf(form.color);
        if (value) await selectPalette(value);
        const fonts = fontPresetOf(form.fontId).design;
        updateDraft('headingFont', fonts.headingFont as SarakTokenValue);
        updateDraft('bodyFont', fonts.bodyFont as SarakTokenValue);
        setPendingBranding({ companyName: form.name || undefined, logoBase64: form.logo });
        onPeek?.(null);
        onGenerated();
    };

    return (
        <div className="flex flex-col gap-4 p-[var(--sarak-layout-gap-sm,12px)]" data-testid="brand-shortcut">
            <SarakInput label={text('brandName')} fullWidth value={form.name} onChange={(event) => change({ name: event.target.value })} />
            <MediaUploaderControl label={text('brandLogo')} value={form.logo} onChange={(logo) => change({ logo })} />
            <ColorControl label={text('brandColor')} value={form.color} onChange={(color) => { if (HEX_COLOR.test(color)) change({ color }); }} />
            <SarakSelect label={text('brandFontStyle')} fullWidth value={form.fontId} options={FONT_OPTIONS} onChange={(event) => change({ fontId: event.target.value })} />
            <SarakButton type="button" variant="primary" fullWidth onClick={() => { void generate(); }}>{text('brandGenerate')}</SarakButton>
            <p className="text-[length:var(--sarak-type-scale-caption,12px)] text-[var(--theme-muted)]">{text('brandNote')}</p>
        </div>
    );
};
