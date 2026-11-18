// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { FONT_OPTIONS, brandPaletteValue, fontPresetOf, paletteValueOf, useBrandForm } from '../useBrandForm';
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

    describe('paleta salva servindo à marca', () => {
        const saved = 'sp-1|Marca azul|custom:triadic:#2563eb';
        const withSaved = { ...(draft as object), savedPalettes: saved } as never;

        it('o formulário lê as salvas do rascunho e a paleta da marca é a escolhida', () => {
            const { result } = renderHook(() => useBrandForm(withSaved, '', vi.fn()));
            expect(result.current.saved).toEqual([{ id: 'sp-1', name: 'Marca azul', value: 'custom:triadic:#2563eb' }]);
            expect(brandPaletteValue(result.current.form, result.current.saved)).toBe(paletteValueOf(result.current.form.color));
            act(() => result.current.change({ paletteId: 'sp-1' }));
            expect(brandPaletteValue(result.current.form, result.current.saved)).toBe('custom:triadic:#2563eb');
        });

        it('a prévia espia a paleta salva, e não a gerada da cor', () => {
            const onPeek = vi.fn();
            const { result } = renderHook(() => useBrandForm(withSaved, '', onPeek));
            act(() => result.current.change({ paletteId: 'sp-1', color: '#aa3366' }));
            expect(onPeek).toHaveBeenLastCalledWith(expect.objectContaining({ colorPalette: 'custom:triadic:#2563eb' }));
        });

        it('paleta apagada depois de escolhida: a marca volta à paleta gerada da cor', () => {
            const { result } = renderHook(() => useBrandForm(withSaved, '', vi.fn()));
            act(() => result.current.change({ paletteId: 'sp-9' }));
            expect(brandPaletteValue(result.current.form, result.current.saved)).toBe(paletteValueOf(result.current.form.color));
        });
    });
});
