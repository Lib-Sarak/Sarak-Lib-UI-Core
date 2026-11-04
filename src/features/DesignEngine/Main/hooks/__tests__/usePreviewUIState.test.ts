// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { usePreviewUIState } from '../usePreviewUIState';
import type { DecisionId } from '../../../utils/decisions';

describe('usePreviewUIState', () => {
    it('começa na lista de decisões, na tela de painel, no desktop e sem modo de edição nem galeria', () => {
        const { result } = renderHook(() => usePreviewUIState());

        expect(result.current.panelView).toEqual({ kind: 'home' });
        expect(result.current.activePreviewApp).toBe('dashboard');
        expect(result.current.previewDevice).toBe('desktop');
        expect(result.current).not.toHaveProperty('editMode');
        expect(result.current).not.toHaveProperty('isGalleryOpen');
    });

    it.each<[DecisionId, string, string]>([
        ['theme', 'chat', 'dashboard'],
        ['colors', 'chat', 'dashboard'],
        ['fonts', 'chat', 'typography'],
        ['shape', 'chat', 'dashboard'],
        ['components', 'chat', 'caixas-texto'],
        ['layout', 'chat', 'dashboard'],
        ['advanced', 'dashboard', 'matrix'],
    ])('abrir a decisão %s estando em outra tela (%s) leva a prévia à tela canônica %s', (decisionId, fromScreen, screen) => {
        const { result } = renderHook(() => usePreviewUIState());
        act(() => result.current.selectPreviewApp(fromScreen));

        act(() => result.current.openDecision(decisionId));

        expect(result.current.panelView).toEqual({ kind: 'decision', id: decisionId, focusTokenId: undefined });
        expect(result.current.activePreviewApp).toBe(screen);
    });

    it('abrir a decisão estando numa tela que já lhe pertence não troca a tela', () => {
        const { result } = renderHook(() => usePreviewUIState());
        act(() => result.current.selectPreviewApp('tabela'));

        act(() => result.current.openDecision('shape'));

        expect(result.current.activePreviewApp).toBe('tabela');
    });

    it('escolher a tela de amostra muda só a prévia: a coluna não segue (um gesto, sem laço)', () => {
        const { result } = renderHook(() => usePreviewUIState());
        act(() => result.current.openDecision('fonts'));

        act(() => result.current.selectPreviewApp('dashboard'));

        expect(result.current.activePreviewApp).toBe('dashboard');
        expect(result.current.panelView).toMatchObject({ kind: 'decision', id: 'fonts' });
    });

    it('a busca leva o token à decisão: o id viaja na vista e, ao voltar, o foco vai à linha da decisão', () => {
        const { result } = renderHook(() => usePreviewUIState());

        act(() => result.current.openDecision('colors', 'primaryColor'));
        expect(result.current.panelView).toEqual({ kind: 'decision', id: 'colors', focusTokenId: 'primaryColor' });

        act(() => result.current.goHome());
        expect(result.current.panelView).toEqual({ kind: 'home', focusId: 'colors' });
    });

    it('o atalho de marca abre a própria tela e sai do modo avançado', () => {
        const { result } = renderHook(() => usePreviewUIState());
        act(() => result.current.setViewMode('catalog'));

        act(() => result.current.openBrand());

        expect(result.current.panelView).toEqual({ kind: 'brand' });
        expect(result.current.viewMode).toBe('preview');
    });
});
