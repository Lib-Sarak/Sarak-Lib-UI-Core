import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useThemePersistenceHandlers } from '../useThemePersistenceHandlers';
import * as exportTheme from '../../utils/exportTheme';
import type { SarakDesignState, SarakThemeEntry } from '../../../../../core/Provider/types';

describe('useThemePersistenceHandlers (persistência e exportação de temas)', () => {
    const draft = { mode: 'dark', primaryColor: '#00f2ff' } as unknown as SarakDesignState;
    const counterpart = { mode: 'light', colorBgBody: '#ffffff' } as Partial<SarakDesignState>;

    const createProps = (overrides: Record<string, unknown> = {}) => ({
        draft,
        sourceTheme: { id: 'tema-importado', name: 'Tema Importado', design: { mode: 'dark' } } as SarakThemeEntry,
        counterpart,
        existingThemeIds: new Set(['blue-brand', 'blue-brand-2']),
        setCurrentThemeName: vi.fn(),
        setIsSaveModalOpen: vi.fn(),
        setIsSaving: vi.fn(),
        showToast: vi.fn(),
        handleApplyToSystem: vi.fn(),
        saveTheme: vi.fn().mockResolvedValue(undefined),
        setResolvedThemeId: vi.fn(),
        applyFullConfigRaw: vi.fn(),
        persistDesign: vi.fn().mockResolvedValue(undefined),
        onThemeSaved: vi.fn(),
        ...overrides,
    });

    beforeEach(() => vi.restoreAllMocks());

    it('exporta o design completo com contraparte e não faz chamada de rede', () => {
        const downloadSpy = vi.spyOn(exportTheme, 'downloadThemeJson').mockImplementation(() => {});
        const fetchSpy = vi.spyOn(globalThis, 'fetch');
        const props = createProps();
        const { result } = renderHook(() => useThemePersistenceHandlers(props as never));

        act(() => result.current.handleExportTheme('Tema de Marca'));

        expect(downloadSpy).toHaveBeenCalledWith(expect.objectContaining({
            id: 'tema-de-marca',
            name: 'Tema de Marca',
            design: expect.objectContaining({ mode: 'dark', primaryColor: '#00f2ff' }),
            contraparte: counterpart,
        }));
        expect(props.setIsSaveModalOpen).toHaveBeenCalledWith(false);
        expect(fetchSpy).not.toHaveBeenCalled();
        expect(props.saveTheme).not.toHaveBeenCalled();
    });

    it('cria tema com id livre, entrega a operação e ativa/persiste o design salvo', async () => {
        const props = createProps();
        const { result } = renderHook(() => useThemePersistenceHandlers(props as never));

        await act(async () => result.current.handleSaveTheme('Blue Brand', 'create'));

        expect(props.saveTheme).toHaveBeenCalledWith(expect.objectContaining({
            id: 'blue-brand-3',
            name: 'Blue Brand',
            design: expect.objectContaining({ mode: 'dark', primaryColor: '#00f2ff' }),
            contraparte: counterpart,
        }), 'create');
        expect(props.setResolvedThemeId).toHaveBeenCalledWith('blue-brand-3');
        expect(props.applyFullConfigRaw).toHaveBeenCalledWith(expect.objectContaining({ primaryColor: '#00f2ff' }));
        expect(props.persistDesign).toHaveBeenCalledWith(expect.objectContaining({ primaryColor: '#00f2ff' }));
        expect(props.onThemeSaved).toHaveBeenCalledWith(expect.objectContaining({ id: 'blue-brand-3' }));
        expect(props.setIsSaveModalOpen).toHaveBeenCalledWith(false);
    });

    it('substitui o id do tema importado quando a operação é replace', async () => {
        const props = createProps({ sourceTheme: { id: 'erp-noite', name: 'ERP Noite', design: {} } });
        const { result } = renderHook(() => useThemePersistenceHandlers(props as never));

        await act(async () => result.current.handleSaveTheme('ERP Noite Ajustado', 'replace'));

        expect(props.saveTheme).toHaveBeenCalledWith(expect.objectContaining({
            id: 'erp-noite',
            name: 'ERP Noite Ajustado',
        }), 'replace');
        expect(props.setResolvedThemeId).toHaveBeenCalledWith('erp-noite');
    });

    it('sintetiza a contraparte no modo oposto quando o tema de origem não a declara', () => {
        const opposite = exportTheme.getThemeCounterpartForMode(
            { id: 'tema-legado', design: { mode: 'dark', primaryColor: '#123456' } },
            'dark',
            draft,
        );

        expect(opposite?.mode).toBe('light');
        expect(opposite).toHaveProperty('colorBgBody');
    });

    it('exige nome distinto para criar outra entrada baseada no tema atual', async () => {
        const props = createProps();
        const { result } = renderHook(() => useThemePersistenceHandlers(props as never));

        await act(async () => result.current.handleSaveTheme('Tema Importado', 'create'));

        expect(props.saveTheme).not.toHaveBeenCalled();
        expect(props.showToast).toHaveBeenCalledWith('warning', expect.stringContaining('nome diferente'));
    });

    it('aplicar mudanças delega ao rascunho e confirma pelo toast', () => {
        const props = createProps();
        const { result } = renderHook(() => useThemePersistenceHandlers(props as never));

        act(() => result.current.handleApplyGlobalChanges());

        expect(props.handleApplyToSystem).toHaveBeenCalledTimes(1);
        expect(props.showToast).toHaveBeenCalledWith('success', expect.any(String));
    });

    it('avisa quando o importador rejeita o save e mantém o modal aberto', async () => {
        const props = createProps({ saveTheme: vi.fn().mockRejectedValue(new Error('backend offline')) });
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const { result } = renderHook(() => useThemePersistenceHandlers(props as never));

        await act(async () => result.current.handleSaveTheme('Tema Novo', 'create'));

        expect(props.showToast).toHaveBeenCalledWith('warning', expect.stringContaining('continua disponível'));
        expect(props.setIsSaveModalOpen).not.toHaveBeenCalledWith(false);
        expect(props.setIsSaving).toHaveBeenLastCalledWith(false);
        errorSpy.mockRestore();
    });
});
