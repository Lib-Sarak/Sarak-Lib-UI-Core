import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useThemePersistenceHandlers } from '../useThemePersistenceHandlers';
import * as exportTheme from '../../utils/exportTheme';
import type { SarakDesignState } from '../../../../../core/Provider/types';

describe('useThemePersistenceHandlers (Spec 44 — sem backend próprio)', () => {
    const draft = { mode: 'dark', primaryColor: '#00f2ff' } as unknown as SarakDesignState;

    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('handleExportTheme baixa o JSON e nunca faz uma chamada de rede', () => {
        const downloadSpy = vi.spyOn(exportTheme, 'downloadThemeJson').mockImplementation(() => {});
        const fetchSpy = vi.spyOn(globalThis, 'fetch');
        const setCurrentThemeName = vi.fn();
        const setIsSaveModalOpen = vi.fn();
        const setIsSaving = vi.fn();
        const showToast = vi.fn();
        const handleApplyToSystem = vi.fn();

        const { result } = renderHook(() => useThemePersistenceHandlers({
            draft,
            setCurrentThemeName,
            setIsSaveModalOpen,
            setIsSaving,
            showToast,
            handleApplyToSystem
        }));

        act(() => {
            result.current.handleExportTheme('Meu Tema Corporativo');
        });

        expect(downloadSpy).toHaveBeenCalledWith(expect.objectContaining({
            id: 'meu-tema-corporativo',
            name: 'Meu Tema Corporativo',
            design: draft
        }));
        expect(setCurrentThemeName).toHaveBeenCalledWith('Meu Tema Corporativo');
        expect(setIsSaveModalOpen).toHaveBeenCalledWith(false);
        expect(showToast).toHaveBeenCalledWith('success', expect.stringContaining('exportado'));
        expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('handleApplyGlobalChanges só comita o rascunho no sistema — sem rede', () => {
        const fetchSpy = vi.spyOn(globalThis, 'fetch');
        const handleApplyToSystem = vi.fn();
        const showToast = vi.fn();

        const { result } = renderHook(() => useThemePersistenceHandlers({
            draft,
            setCurrentThemeName: vi.fn(),
            setIsSaveModalOpen: vi.fn(),
            setIsSaving: vi.fn(),
            showToast,
            handleApplyToSystem
        }));

        act(() => {
            result.current.handleApplyGlobalChanges();
        });

        expect(handleApplyToSystem).toHaveBeenCalledTimes(1);
        expect(showToast).toHaveBeenCalledWith('success', expect.any(String));
        expect(fetchSpy).not.toHaveBeenCalled();
    });
});
