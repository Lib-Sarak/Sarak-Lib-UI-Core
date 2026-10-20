import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SARAK_DEFAULT_THEME_ID } from '../../../../../core/Design/presets/themes';
import type { SarakDesignState, SarakThemeEntry } from '../../../../../core/Provider/types';
import { useThemeCustomizationActions } from '../useThemeCustomizationActions';

const { loadReferenceThemes, confirmOverlay } = vi.hoisted(() => ({
    loadReferenceThemes: vi.fn(),
    confirmOverlay: vi.fn(),
}));

vi.mock('../../../../../core/Design/presets/themes/reference', () => ({
    sarakLoadReferenceThemes: loadReferenceThemes,
}));

vi.mock('../../../../../components/atomic/Modals/SarakOverlayProvider', () => ({
    useOverlay: () => ({ confirm: confirmOverlay }),
}));

vi.mock('../../../../../core/i18n/useLibraryText', () => ({
    useLibraryText: () => (key: string) => `translated:${key}`,
}));

vi.mock('../../utils/exportTheme', () => ({
    getThemeCounterpartForMode: vi.fn(() => undefined),
}));

vi.mock('../useThemePersistenceHandlers', () => ({
    useThemePersistenceHandlers: vi.fn(() => ({
        handleExportTheme: vi.fn(),
        handleSaveTheme: vi.fn(),
        handleApplyGlobalChanges: vi.fn(),
    })),
}));

describe('useThemeCustomizationActions', () => {
    const importerTheme: SarakThemeEntry = {
        id: 'tema-cliente',
        name: 'Tema do cliente',
        design: { mode: 'dark', primaryColor: '#123456' },
    };

    const createProps = (resolvedThemeId = importerTheme.id) => {
        const defaultTheme: SarakThemeEntry = {
            id: SARAK_DEFAULT_THEME_ID,
            name: 'Tema padrão',
            design: { mode: 'dark', primaryColor: '#654321' },
        };
        const sarak = {
            resolvedThemeId,
            allThemes: [importerTheme, defaultTheme],
            themeCatalog: [{ id: importerTheme.id }, { id: SARAK_DEFAULT_THEME_ID }],
            options: { theme: { onSave: vi.fn() } },
            saveTheme: vi.fn().mockResolvedValue(undefined),
            deleteTheme: vi.fn().mockResolvedValue(undefined),
            setResolvedThemeId: vi.fn(),
            applyFullConfigRaw: vi.fn(),
            persistDesign: vi.fn().mockResolvedValue(undefined),
        };

        return {
            sarak,
            draft: { mode: 'dark', primaryColor: '#abcdef' } as SarakDesignState,
            handleApplyToSystem: vi.fn(),
            handleThemePreview: vi.fn(),
            discardDraft: vi.fn(),
            setDraftThemeId: vi.fn(),
            showToast: vi.fn(),
            setCurrentThemeName: vi.fn(),
            setIsSaveModalOpen: vi.fn(),
            setIsSaving: vi.fn(),
        };
    };

    beforeEach(() => vi.clearAllMocks());

    it('selects replacement only for an importer theme', () => {
        const importerProps = createProps();
        const importerHook = renderHook(() => useThemeCustomizationActions(importerProps as never));

        act(() => importerHook.result.current.handleOpenRuntimeSave());

        expect(importerHook.result.current.isImporterTheme).toBe(true);
        expect(importerHook.result.current.initialSaveAction).toBe('replace');
        expect(importerProps.setIsSaveModalOpen).toHaveBeenCalledWith(true);

        const embeddedProps = createProps(SARAK_DEFAULT_THEME_ID);
        const embeddedHook = renderHook(() => useThemeCustomizationActions(embeddedProps as never));

        act(() => embeddedHook.result.current.handleOpenRuntimeSave());

        expect(embeddedHook.result.current.isImporterTheme).toBe(false);
        expect(embeddedHook.result.current.initialSaveAction).toBe('new');
    });

    it('creates a new theme from the reference matching the current mode', async () => {
        const lightReference: SarakThemeEntry = {
            id: 'referencia-clara',
            name: 'Referência Clara',
            design: { mode: 'light', primaryColor: '#ffffff' },
        };
        const props = createProps();
        props.draft = { ...props.draft, mode: 'light' };
        loadReferenceThemes.mockResolvedValue([{
            id: 'referencia-escura',
            name: 'Referência Escura',
            design: { mode: 'dark', primaryColor: '#000000' },
        }, lightReference]);
        const { result } = renderHook(() => useThemeCustomizationActions(props as never));

        await act(async () => result.current.handleCreateTheme());

        expect(loadReferenceThemes).toHaveBeenCalledOnce();
        expect(result.current.sourceTheme).toEqual(lightReference);
        expect(props.handleThemePreview).toHaveBeenCalledWith(lightReference.design, undefined, lightReference.id);
        expect(result.current.initialSaveAction).toBe('new');
        expect(props.setIsSaveModalOpen).toHaveBeenCalledWith(true);
    });

    it('confirms deletion through the overlay and selects the library default after success', async () => {
        confirmOverlay.mockResolvedValue(true);
        const props = createProps();
        const { result } = renderHook(() => useThemeCustomizationActions(props as never));

        await act(async () => result.current.handleDeleteTheme());

        expect(confirmOverlay).toHaveBeenCalledWith(expect.objectContaining({ tone: 'danger' }));
        expect(props.sarak.deleteTheme).toHaveBeenCalledWith(importerTheme.id);
        expect(props.setCurrentThemeName).toHaveBeenCalledWith('Tema padrão');
        expect(props.showToast).toHaveBeenCalledWith('success', 'translated:themeDeletedAndDefaultActivated');
    });
});
