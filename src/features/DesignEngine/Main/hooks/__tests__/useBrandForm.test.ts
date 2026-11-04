// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { FONT_OPTIONS, fontPresetOf, paletteValueOf, useBrandForm } from '../useBrandForm';
import { TYPOGRAPHY_PRESETS } from '../../../../../core/Design/presets/components/typography';

const draft = { mode: 'dark', headingFont: TYPOGRAPHY_PRESETS[2].design.headingFont } as never;

describe('useBrandForm', () => {
    it('nasce vazio, com o par de fontes do rascunho, e não espia antes de o usuário mexer', () => {
        const onPeek = vi.fn();
        const { result } = renderHook(() => useBrandForm(draft, '', onPeek));

        expect(result.current.form.name).toBe('');
        expect(result.current.form.logo).toBeNull();
        expect(result.current.form.fontId).toBe(TYPOGRAPHY_PRESETS[2].id);
        expect(onPeek).not.toHaveBeenCalled();
    });

    it('mexer num campo espia nome, paleta e fontes; desmontar encerra a espiada', () => {
        const onPeek = vi.fn();
        const { result, unmount } = renderHook(() => useBrandForm(draft, '', onPeek));

        act(() => result.current.change({ name: 'Acme', color: '#aa3366' }));

        expect(onPeek).toHaveBeenLastCalledWith(expect.objectContaining({ systemName: 'Acme', colorPalette: 'custom:analogous:#aa3366' }));
        unmount();
        expect(onPeek).toHaveBeenLastCalledWith(null);
    });

    it('a paleta só nasce de cor válida, e toda opção de fonte aponta para um par real', () => {
        expect(paletteValueOf('#aa3366')).toBe('custom:analogous:#aa3366');
        expect(paletteValueOf('não é cor')).toBeNull();
        FONT_OPTIONS.forEach((option) => expect(fontPresetOf(option.value).id).toBe(option.value));
    });
});
