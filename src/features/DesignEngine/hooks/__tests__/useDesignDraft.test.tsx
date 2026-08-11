import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useDesignDraft } from '../useDesignDraft';
import { SarakUIContextType } from '../../../../core/Provider/types';
describe('useDesignDraft', () => {
    it('inicializa com o draft do provedor ou fallback para o sistema', () => {
        const sarak = {
            draftDesign: null,
            systemDesign: { mode: 'dark', layout: 'glass' },
            isDrafting: false,
            setIsDrafting: vi.fn(),
            lockDrafting: vi.fn()
        } as unknown as SarakUIContextType;

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
        } as unknown as SarakUIContextType;

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
        } as unknown as SarakUIContextType;

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
        } as unknown as SarakUIContextType;
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
        } as unknown as SarakUIContextType;
        const { result } = renderHook(() => useDesignDraft(sarak));
        
        act(() => {
            result.current.updateDraft('layout', 'solid');
        });

        act(() => {
            result.current.resetToken('layout');
        });

        expect(result.current.draft['layout']).toBe('glass');
    });

    // plan-27 PASSO 3 — o token `mode` deixa de só trocar o rótulo (o `if` era
    // idêntico ao caminho genérico) e passa pelo MESMO resolvedor que
    // `ShellThemeToggle` usa.
    describe('updateDraft("mode", ...) — passa pelo resolvedor (plan-27)', () => {
        it('sem tema rastreável, cai no fallback sintetizado sobre o design CORRENTE (não faz só {...current, mode})', () => {
            const sarak = {
                draftDesign: null,
                systemDesign: { mode: 'dark', colorBgBody: '#050505', textColorMaster: '#ffffff' },
                isDrafting: true,
                setIsDrafting: vi.fn(),
                lockDrafting: vi.fn(),
                allThemes: [],
                resolvedThemeId: undefined,
            } as unknown as SarakUIContextType;

            const { result } = renderHook(() => useDesignDraft(sarak));

            act(() => {
                result.current.updateDraft('mode', 'light');
            });

            expect(result.current.draft.mode).toBe('light');
            // `syncThemeWithMode` desloca `colorBgBody` para a faixa clara —
            // nunca fica igual ao valor escuro original.
            expect(result.current.draft['colorBgBody']).not.toBe('#050505');
        });

        it('com tema rastreável (resolvedThemeId) e contraparte AUTORADA, aplica o bloco autorado — não sintetiza', () => {
            const contraparte = { colorBgBody: '#f5f0e8', textColorMaster: '#1a1208' };
            const sarak = {
                draftDesign: null,
                systemDesign: { mode: 'dark', colorBgBody: '#050505', textColorMaster: '#ffffff', primaryColor: '#ff00aa' },
                isDrafting: true,
                setIsDrafting: vi.fn(),
                lockDrafting: vi.fn(),
                allThemes: [{
                    id: 'tema-de-teste',
                    design: { mode: 'dark', colorBgBody: '#050505', textColorMaster: '#ffffff', primaryColor: '#ff00aa' },
                    contraparte,
                }],
                resolvedThemeId: 'tema-de-teste',
            } as unknown as SarakUIContextType;

            const { result } = renderHook(() => useDesignDraft(sarak));

            act(() => {
                result.current.updateDraft('mode', 'light');
            });

            expect(result.current.draft.mode).toBe('light');
            expect(result.current.draft['colorBgBody']).toBe('#f5f0e8');
            expect(result.current.draft['textColorMaster']).toBe('#1a1208');
            // Não declarado na contraparte — sobrevive do design nativo do tema.
            expect(result.current.draft['primaryColor']).toBe('#ff00aa');
        });

        // PASSO 5 — o aviso tem de aparecer NO MOMENTO da troca (decisão do
        // dono, §2.5): recarregar o tema substitui qualquer customização.
        it('avisa (toast warning) quando a troca de modo RECARREGA um tema rastreável', () => {
            const sarak = {
                draftDesign: null,
                systemDesign: { mode: 'dark', colorBgBody: '#050505' },
                isDrafting: true,
                setIsDrafting: vi.fn(),
                lockDrafting: vi.fn(),
                allThemes: [{ id: 'tema-de-teste', design: { mode: 'dark', colorBgBody: '#050505' }, contraparte: { colorBgBody: '#f5f0e8' } }],
                resolvedThemeId: 'tema-de-teste',
            } as unknown as SarakUIContextType;

            const { result } = renderHook(() => useDesignDraft(sarak));
            expect(result.current.toast).toBeNull();

            act(() => {
                result.current.updateDraft('mode', 'light');
            });

            expect(result.current.toast?.type).toBe('warning');
            expect(result.current.toast?.message).toMatch(/recarregado/i);
        });

        it('NÃO avisa quando não há tema rastreável (fallback sobre o design corrente, nada é descartado)', () => {
            const sarak = {
                draftDesign: null,
                systemDesign: { mode: 'dark', colorBgBody: '#050505' },
                isDrafting: true,
                setIsDrafting: vi.fn(),
                lockDrafting: vi.fn(),
                allThemes: [],
                resolvedThemeId: undefined,
            } as unknown as SarakUIContextType;

            const { result } = renderHook(() => useDesignDraft(sarak));

            act(() => {
                result.current.updateDraft('mode', 'light');
            });

            expect(result.current.toast).toBeNull();
        });
    });
});
