import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { sarakGetDefaultDesignState } from '../../master-map';
import { useDesignVariables } from '../../hooks/useDesignVariables';

describe('colorPalette — segurança na emissão de CSS', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('emite uma paleta customizada com sementes secundária e de acento sem descartá-la', () => {
        const palette = 'custom:triadic:#abc,sec=#123456,acc=#abcdef';
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const { result } = renderHook(() => useDesignVariables({
            ...sarakGetDefaultDesignState(),
            colorPalette: palette,
        }));

        expect(result.current.variables['--sarak-color-palette']).toBe(palette);
        expect(warnSpy).not.toHaveBeenCalled();
    });
});
