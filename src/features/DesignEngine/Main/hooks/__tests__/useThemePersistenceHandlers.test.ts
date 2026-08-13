import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useThemePersistenceHandlers } from '../useThemePersistenceHandlers';
import * as exportTheme from '../../utils/exportTheme';
import type { SarakDesignState } from '../../../../../core/Provider/types';

describe('useThemePersistenceHandlers (Spec 44 — sem backend próprio; ADR-011 — saveTheme)', () => {
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
        const saveTheme = vi.fn().mockResolvedValue(undefined);

        const { result } = renderHook(() => useThemePersistenceHandlers({
            draft,
            setCurrentThemeName,
            setIsSaveModalOpen,
            setIsSaving,
            showToast,
            handleApplyToSystem,
            saveTheme
        }));

        act(() => {
            result.current.handleExportTheme('Meu Tema Corporativo');
        });

        expect(downloadSpy).toHaveBeenCalledWith(expect.objectContaining({
            id: 'meu-tema-corporativo',
            name: 'Meu Tema Corporativo',
            // Export completo (Spec 40.1 L6): preserva o rascunho sobre todos os defaults.
            design: expect.objectContaining({ mode: 'dark', primaryColor: '#00f2ff' })
        }));
        expect(setCurrentThemeName).toHaveBeenCalledWith('Meu Tema Corporativo');
        expect(setIsSaveModalOpen).toHaveBeenCalledWith(false);
        expect(showToast).toHaveBeenCalledWith('success', expect.stringContaining('exportado'));
        expect(fetchSpy).not.toHaveBeenCalled();
        expect(saveTheme).not.toHaveBeenCalled();
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
            handleApplyToSystem,
            saveTheme: vi.fn().mockResolvedValue(undefined)
        }));

        act(() => {
            result.current.handleApplyGlobalChanges();
        });

        expect(handleApplyToSystem).toHaveBeenCalledTimes(1);
        expect(showToast).toHaveBeenCalledWith('success', expect.any(String));
        expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('handleSaveTheme entrega o payload COMPLETO a sarak.saveTheme (ADR-011) e nunca faz chamada de rede', async () => {
        const fetchSpy = vi.spyOn(globalThis, 'fetch');
        const setCurrentThemeName = vi.fn();
        const setIsSaveModalOpen = vi.fn();
        const setIsSaving = vi.fn();
        const showToast = vi.fn();
        const saveTheme = vi.fn().mockResolvedValue(undefined);

        const { result } = renderHook(() => useThemePersistenceHandlers({
            draft,
            setCurrentThemeName,
            setIsSaveModalOpen,
            setIsSaving,
            showToast,
            handleApplyToSystem: vi.fn(),
            saveTheme
        }));

        await act(async () => {
            await result.current.handleSaveTheme('Meu Tema Salvo');
        });

        expect(saveTheme).toHaveBeenCalledWith(expect.objectContaining({
            id: 'meu-tema-salvo',
            name: 'Meu Tema Salvo',
            design: expect.objectContaining({ mode: 'dark', primaryColor: '#00f2ff' })
        }));
        expect(setCurrentThemeName).toHaveBeenCalledWith('Meu Tema Salvo');
        expect(setIsSaveModalOpen).toHaveBeenCalledWith(false);
        expect(showToast).toHaveBeenCalledWith('success', expect.stringContaining('salvo'));
        expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('handleSaveTheme: quando saveTheme rejeita, avisa por toast e MANTÉM o modal ciente do estado (não propaga exceção)', async () => {
        const setIsSaving = vi.fn();
        const showToast = vi.fn();
        const setIsSaveModalOpen = vi.fn();
        const saveTheme = vi.fn().mockRejectedValue(new Error('backend do consumidor fora do ar'));
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const { result } = renderHook(() => useThemePersistenceHandlers({
            draft,
            setCurrentThemeName: vi.fn(),
            setIsSaveModalOpen,
            setIsSaving,
            showToast,
            handleApplyToSystem: vi.fn(),
            saveTheme
        }));

        await act(async () => {
            await result.current.handleSaveTheme('Meu Tema Salvo');
        });

        expect(showToast).toHaveBeenCalledWith('warning', expect.stringContaining('continua disponível'));
        // O modal NÃO fecha numa falha — o usuário precisa ver o aviso.
        expect(setIsSaveModalOpen).not.toHaveBeenCalledWith(false);
        expect(setIsSaving).toHaveBeenLastCalledWith(false);
        errorSpy.mockRestore();
    });
});
