import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useDesignDraft } from '../useDesignDraft';

describe('useDesignDraft', () => {
    it('inicializa com o draft do provedor ou fallback para o sistema', () => {
        const sarak = {
            draftDesign: null,
            systemDesign: { mode: 'dark', layout: 'glass' },
            isDrafting: false,
            setIsDrafting: vi.fn(),
            lockDrafting: vi.fn()
        };

        const { result } = renderHook(() => useDesignDraft(sarak));

        expect(result.current.draft.mode).toBe('dark');
        expect(result.current.draft.layout).toBe('glass');
    });

    it('atualiza o draft localmente e marca como dirty', () => {
        const sarak = {
            draftDesign: null,
            systemDesign: { cardBorderWidth: 1 },
            isDrafting: true,
            setIsDrafting: vi.fn(),
            lockDrafting: vi.fn()
        };

        const { result } = renderHook(() => useDesignDraft(sarak));

        act(() => {
            result.current.updateDraft('cardBorderWidth', 5);
        });

        expect(result.current.isDirty).toBe(true);
        expect(result.current.draft['cardBorderWidth']).toBe(5);
    });

    it('calcula isComponentDirty para um schema', () => {
        const sarak = {
            draftDesign: null,
            systemDesign: { cardBorderWidth: 1 },
            isDrafting: true,
            setIsDrafting: vi.fn(),
            lockDrafting: vi.fn()
        };

        const { result } = renderHook(() => useDesignDraft(sarak));

        act(() => {
            result.current.updateDraft('cardBorderWidth', 5);
        });

        expect(result.current.isComponentDirty('cards')).toBe(true);
    });

    it('resetComponent reseta um componente específico', () => {
        const sarak = {
            draftDesign: null,
            systemDesign: { cardBorderWidth: 1, layout: 'glass' },
            isDrafting: true,
            setIsDrafting: vi.fn(),
            lockDrafting: vi.fn()
        };
        const { result } = renderHook(() => useDesignDraft(sarak));
        
        act(() => {
            result.current.updateDraft('cardBorderWidth', 5);
            result.current.updateDraft('layout', 'solid');
        });

        act(() => {
            result.current.resetComponent('cards');
        });

        // O layout deve continuar solid, mas o cardBorderWidth deve voltar ao padrão (1)
        expect(result.current.draft['cardBorderWidth']).toBe(1);
        expect(result.current.draft['layout']).toBe('solid');
    });

    it('resetToken reseta um token individual', () => {
        const sarak = {
            draftDesign: null,
            systemDesign: { layout: 'glass' },
            isDrafting: true,
            setIsDrafting: vi.fn(),
            lockDrafting: vi.fn()
        };
        const { result } = renderHook(() => useDesignDraft(sarak));
        
        act(() => {
            result.current.updateDraft('layout', 'solid');
        });

        act(() => {
            result.current.resetToken('layout');
        });

        expect(result.current.draft['layout']).toBe('glass');
    });

});
