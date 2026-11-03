import { useEffect, useMemo, useState } from 'react';
import { getPersonality } from '../../../../core/Design/presets/components/personalities';
import { TYPOGRAPHY_PRESETS } from '../../../../core/Design/presets/components/typography';
import { sarakGetDefaultDesignState } from '../../../../core/Design/master-map';
import { barTonesOf, buildCustomPaletteValue, buildPaletteDraftPatch, toValidPaletteInput } from '../utils/paletteDraft';
import type { PeekHandler } from '../../Canvas/components/peek';
import type { SarakDesignState } from '../../../../core/Provider/types';

export interface BrandForm {
    name: string;
    logo: string | null;
    color: string;
    fontId: string;
    /** A Personalidade opcional: `''` mantém a estrutura atual. */
    personalityId: string;
    /** O usuário escolheu o par de fontes: ele vence as fontes da Personalidade. */
    fontTouched: boolean;
}

const FALLBACK_COLOR = String(sarakGetDefaultDesignState().primaryColor);
export const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export const fontPresetOf = (fontId: string) => TYPOGRAPHY_PRESETS.find((preset) => preset.id === fontId) ?? TYPOGRAPHY_PRESETS[0];

/** A paleta nasce da cor informada, no tipo análoga: o usuário não escolhe tipo aqui, só a cor da marca. */
export const paletteValueOf = (color: string): string | null => {
    const input = toValidPaletteInput({ type: 'analogous', base: color });
    return input ? buildCustomPaletteValue(input) : null;
};

const initialForm = (draft: SarakDesignState, initialName: string): BrandForm => {
    const primary = (draft as Record<string, unknown>).primaryColor;
    const heading = String((draft as Record<string, unknown>).headingFont ?? '');
    return {
        name: initialName,
        logo: null,
        color: typeof primary === 'string' && HEX_COLOR.test(primary) ? primary : FALLBACK_COLOR,
        fontId: (TYPOGRAPHY_PRESETS.find((preset) => preset.design.headingFont === heading) ?? TYPOGRAPHY_PRESETS[0]).id,
        personalityId: '',
        fontTouched: false,
    };
};

/** O que a prévia compõe por cima do rascunho enquanto o formulário muda: paleta, Personalidade, fontes, nome e logo. */
/** `tones`: o papel das barras do rascunho; com Personalidade, vale o dela, porque é ele que a paleta calcula. */
export const brandPatch = (form: BrandForm, mode: 'light' | 'dark', tones: Record<string, unknown> = {}): Partial<SarakDesignState> => {
    const value = paletteValueOf(form.color);
    const personality = getPersonality(form.personalityId);
    const fonts = personality && !form.fontTouched ? {} : fontPresetOf(form.fontId).design;
    return {
        ...(value ? buildPaletteDraftPatch(value, mode, [], personality ? barTonesOf(personality.design) : tones) : {}),
        ...personality?.design,
        ...fonts,
        systemName: form.name || undefined,
        logoUrl: form.logo ?? undefined,
    } as Partial<SarakDesignState>;
};


/** O estado do formulário de marca; enquanto o usuário mexe, a prévia compõe o resultado por cima do rascunho sem gravar. */
export const useBrandForm = (draft: SarakDesignState, initialName: string, onPeek?: PeekHandler) => {
    const [state, setState] = useState(() => ({ form: initialForm(draft, initialName), touched: false }));
    const mode = draft.mode === 'light' ? 'light' : 'dark';
    const patch = useMemo(() => brandPatch(state.form, mode, barTonesOf(draft as unknown as Record<string, unknown>)), [state.form, mode, draft]);

    useEffect(() => {
        if (!state.touched) return undefined;
        onPeek?.(patch);
        return () => onPeek?.(null);
    }, [state.touched, patch, onPeek]);

    const change = (partial: Partial<BrandForm>) => setState((current) => ({
        touched: true,
        form: { ...current.form, ...partial, ...('fontId' in partial ? { fontTouched: true } : {}) },
    }));
    return { form: state.form, change };
};

export const FONT_OPTIONS = TYPOGRAPHY_PRESETS.map((preset) => ({ value: preset.id, label: preset.name }));
