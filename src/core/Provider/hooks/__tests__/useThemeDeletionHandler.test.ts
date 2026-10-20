import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SARAK_DEFAULT_THEME_ID } from '../../../Design/presets/themes';
import type { SarakDesignState, SarakThemeEntry } from '../../types';
import { useThemeDeletionHandler } from '../useThemeDeletionHandler';

describe('useThemeDeletionHandler', () => {
    const fallbackTheme: SarakThemeEntry = {
        id: SARAK_DEFAULT_THEME_ID,
        name: 'Tema padrão',
        design: { mode: 'dark', primaryColor: '#123456' },
        contraparte: { mode: 'light', primaryColor: '#654321', colorBgBody: '#ffffff' },
    };

    const createProps = (overrides: Record<string, unknown> = {}) => ({
        deleteThemeFromCollection: vi.fn().mockResolvedValue(undefined),
        resolvedThemeId: 'tema-ativo',
        loadTheme: vi.fn().mockResolvedValue(fallbackTheme),
        design: { mode: 'light', systemName: 'Host' } as SarakDesignState,
        getHostConfig: vi.fn(() => ({ systemName: 'Host' } as SarakDesignState)),
        setResolvedThemeId: vi.fn(),
        applyFullConfig: vi.fn(),
        persistDesign: vi.fn().mockResolvedValue(undefined),
        ...overrides,
    });

    it('applies and persists the default theme in the active mode after deleting the active theme', async () => {
        const props = createProps();
        const { result } = renderHook(() => useThemeDeletionHandler(props as never));

        await act(async () => result.current('tema-ativo'));

        expect(props.deleteThemeFromCollection).toHaveBeenCalledWith('tema-ativo');
        expect(props.loadTheme).toHaveBeenCalledWith(SARAK_DEFAULT_THEME_ID);
        expect(props.setResolvedThemeId).toHaveBeenCalledWith(SARAK_DEFAULT_THEME_ID);
        expect(props.applyFullConfig).toHaveBeenCalledOnce();
        expect(props.applyFullConfig.mock.calls[0][0]).toEqual(props.persistDesign.mock.calls[0][0]);
        expect(props.persistDesign).toHaveBeenCalledOnce();
    });

    it('does not load or apply a fallback when deleting an inactive theme', async () => {
        const props = createProps({ resolvedThemeId: 'outro-tema' });
        const { result } = renderHook(() => useThemeDeletionHandler(props as never));

        await act(async () => result.current('tema-inativo'));

        expect(props.deleteThemeFromCollection).toHaveBeenCalledWith('tema-inativo');
        expect(props.loadTheme).not.toHaveBeenCalled();
        expect(props.setResolvedThemeId).not.toHaveBeenCalled();
        expect(props.applyFullConfig).not.toHaveBeenCalled();
        expect(props.persistDesign).not.toHaveBeenCalled();
    });

    it('propagates deletion and missing-default failures to the provider caller', async () => {
        const deletionError = new Error('backend offline');
        const props = createProps({ deleteThemeFromCollection: vi.fn().mockRejectedValue(deletionError) });
        const { result } = renderHook(() => useThemeDeletionHandler(props as never));

        await expect(result.current('tema-ativo')).rejects.toBe(deletionError);
        expect(props.loadTheme).not.toHaveBeenCalled();
    });
});
