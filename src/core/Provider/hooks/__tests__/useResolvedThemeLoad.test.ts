import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { getLoadedThemePreset } from '../../../Design/presets/themes/registry';
import { useResolvedThemeLoad } from '../useResolvedThemeLoad';

describe('useResolvedThemeLoad', () => {
    it('carrega o tema embarcado que está no ar e ainda não está em memória', async () => {
        expect(getLoadedThemePreset('neo-brutalism')).toBeUndefined();
        renderHook(() => useResolvedThemeLoad('neo-brutalism'));
        await waitFor(() => expect(getLoadedThemePreset('neo-brutalism')).toBeDefined(), { timeout: 10_000 });
    });

    it('não faz nada sem id ou com id que não é embarcado', () => {
        expect(() => renderHook(() => useResolvedThemeLoad(undefined))).not.toThrow();
        expect(() => renderHook(() => useResolvedThemeLoad('tema-do-importador'))).not.toThrow();
        expect(getLoadedThemePreset('tema-do-importador')).toBeUndefined();
    });
});
