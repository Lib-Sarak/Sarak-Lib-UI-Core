// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import * as HookModule from '../usePreviewUIState';

describe('usePreviewUIState', () => {
    it('should export the hook correctly', () => {
        expect(HookModule).toBeDefined();
    });

    it('inicia em Essencial e permite selecionar Impacto e Completo', () => {
        const { result } = renderHook(() => HookModule.usePreviewUIState());

        expect(result.current.editMode).toBe('essential');

        act(() => result.current.setEditMode('impact'));
        expect(result.current.editMode).toBe('impact');

        act(() => result.current.setEditMode('complete'));
        expect(result.current.editMode).toBe('complete');
    });

    it('inicia com a galeria fechada e permite abrir e fechar pelo mesmo estado', () => {
        const { result } = renderHook(() => HookModule.usePreviewUIState());

        expect(result.current.isGalleryOpen).toBe(false);
        act(() => result.current.setIsGalleryOpen(true));
        expect(result.current.isGalleryOpen).toBe(true);
        act(() => result.current.setIsGalleryOpen(false));
        expect(result.current.isGalleryOpen).toBe(false);
    });

    it.each([
        ['brand', 'auth'],
        ['typography', 'typography'],
        ['surfaces', 'dashboard'],
        ['interaction', 'caixas-texto'],
        ['navigation', 'dashboard'],
        ['systems', 'settings'],
        ['advanced', 'matrix'],
    ])('selecionar o pilar %s abre sua tela canônica sem alterar o pilar escolhido', (pillarId, previewApp) => {
        const { result } = renderHook(() => HookModule.usePreviewUIState());

        act(() => result.current.selectPillar(pillarId));

        expect(result.current.activePillarId).toBe(pillarId);
        expect(result.current.activePreviewApp).toBe(previewApp);
    });

    it('preserva a tela atual quando ela pertence ao pilar escolhido, inclusive navigation com dashboard', () => {
        const { result } = renderHook(() => HookModule.usePreviewUIState());

        act(() => result.current.selectPillar('navigation'));
        expect(result.current.activePreviewApp).toBe('dashboard');
        expect(result.current.activePillarId).toBe('navigation');

        act(() => result.current.selectPreviewApp('dashboard'));
        expect(result.current.activePreviewApp).toBe('dashboard');
        expect(result.current.activePillarId).toBe('surfaces');
    });

    it.each([
        ['dashboard', 'surfaces'],
        ['forms', 'interaction'],
        ['tabela', 'surfaces'],
        ['caixas-texto', 'interaction'],
        ['graficos', 'advanced'],
        ['typography', 'typography'],
        ['components', 'surfaces'],
        ['auth', 'brand'],
        ['chat', 'advanced'],
        ['logs', 'systems'],
        ['settings', 'systems'],
        ['documentos', 'systems'],
        ['matrix', 'advanced'],
        ['kitchen-sink', 'advanced'],
        ['more-screens', 'advanced'],
    ])('selecionar a tela %s atualiza o pilar para %s', (previewApp, pillarId) => {
        const { result } = renderHook(() => HookModule.usePreviewUIState());

        act(() => result.current.selectPreviewApp(previewApp));

        expect(result.current.activePreviewApp).toBe(previewApp);
        expect(result.current.activePillarId).toBe(pillarId);
    });

    it('limpa o pilar sem trocar a tela ao recolhê-lo', () => {
        const { result } = renderHook(() => HookModule.usePreviewUIState());

        act(() => result.current.selectPillar(null));

        expect(result.current.activePillarId).toBeNull();
        expect(result.current.activePreviewApp).toBe('dashboard');
    });
});
