import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useDesignDraft } from '../useDesignDraft';
import { SarakUIContextType } from '../../../../core/Provider/types';
import { sarakGetAllDesignTokens } from '../../../../core/Design/master-map';
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
        expect(result.current.dirtyTokenCount).toBe(1);
    });

    it('descarta o draft completo e retorna a contagem para zero', () => {
        const sarak = {
            draftDesign: null,
            systemDesign: { cardBorderWidth: 1 },
            isDrafting: true,
            setIsDrafting: vi.fn(),
            lockDrafting: vi.fn()
        } as unknown as SarakUIContextType;

        const { result } = renderHook(() => useDesignDraft(sarak));
        act(() => result.current.updateDraft('cardBorderWidth', 5));
        expect(result.current.dirtyTokenCount).toBe(1);

        act(() => result.current.discardDraft());

        expect(result.current.draft['cardBorderWidth']).toBe(1);
        expect(result.current.isDirty).toBe(false);
        expect(result.current.dirtyTokenCount).toBe(0);
    });

    it('conta três tokens alterados e ignora tokens ausentes de um draft parcial', () => {
        const changedTokenIds = new Set(['cardBorderWidth', 'colorBgBody', 'textColorMaster']);
        const tokens = sarakGetAllDesignTokens().filter((token) => changedTokenIds.has(token.id));
        const systemDesign = Object.fromEntries(tokens.map((token) => [token.id, token.defaultValue]));
        const sarak = {
            draftDesign: null,
            systemDesign,
            allThemes: [],
            isDrafting: true,
            setIsDrafting: vi.fn(),
            lockDrafting: vi.fn()
        } as unknown as SarakUIContextType;
        const { result } = renderHook(() => useDesignDraft(sarak));

        act(() => {
            tokens.forEach((token) => {
                const changedValue = token.defaultValue === 'codex-test-value' ? 'codex-test-value-2' : 'codex-test-value';
                result.current.updateDraft(token.id, changedValue);
            });
        });
        expect(result.current.dirtyTokenCount).toBe(3);

        const partialDraftSarak = {
            ...sarak,
            draftDesign: {}
        } as unknown as SarakUIContextType;
        const { result: partialDraftResult } = renderHook(() => useDesignDraft(partialDraftSarak));
        expect(partialDraftResult.current.dirtyTokenCount).toBe(0);
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
    describe('modo do rascunho e modo efetivo da prévia', () => {
        it('sobrepõe a preferência à prévia com o tema pendente sem alterar o rascunho bruto', () => {
            const pendingTheme = {
                id: 'tema-do-rascunho',
                design: { mode: 'dark', colorBgBody: '#101010', preferenceModePosition: 'pinned' },
                contraparte: { colorBgBody: '#f0f0f0' },
            };
            const sarak = {
                draftDesign: { mode: 'dark', colorBgBody: '#101010', preferenceModePosition: 'pinned' },
                systemDesign: { mode: 'dark', colorBgBody: '#101010', preferenceModePosition: 'pinned' },
                design: { mode: 'light' },
                preferences: { colorMode: 'light' },
                allThemes: [pendingTheme],
                isDrafting: true,
                setIsDrafting: vi.fn(),
                lockDrafting: vi.fn(),
            } as unknown as SarakUIContextType;

            const { result } = renderHook(() => useDesignDraft(sarak));

            act(() => result.current.setDraftThemeId('tema-do-rascunho'));

            expect(result.current.draft.mode).toBe('dark');
            expect(result.current.draft.colorBgBody).toBe('#101010');
            expect(result.current.previewDraft.mode).toBe('light');
            expect(result.current.previewDraft.colorBgBody).toBe('#f0f0f0');
        });

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

        it('usa o tema pendente do rascunho e preserva edições que não carregam modo', () => {
            const pendingTheme = {
                id: 'tema-pendente',
                design: { mode: 'dark', colorBgBody: '#101010', textColorMaster: '#ffffff' },
                contraparte: { colorBgBody: '#eeeeee', textColorMaster: '#111111' },
            };
            const sarak = {
                draftDesign: { mode: 'dark', colorBgBody: '#101010', textColorMaster: '#ffffff', primaryColor: '#custom', layout: 'solid' },
                systemDesign: { mode: 'dark', colorBgBody: '#050505', textColorMaster: '#ffffff' },
                isDrafting: true,
                setIsDrafting: vi.fn(),
                lockDrafting: vi.fn(),
                allThemes: [
                    { id: 'tema-aplicado', design: { mode: 'dark', colorBgBody: '#050505' }, contraparte: { colorBgBody: '#f5f0e8' } },
                    pendingTheme,
                ],
                resolvedThemeId: 'tema-aplicado',
            } as unknown as SarakUIContextType;

            const { result } = renderHook(() => useDesignDraft(sarak));
            act(() => result.current.setDraftThemeId('tema-pendente'));
            act(() => result.current.updateDraft('mode', 'light'));

            expect(result.current.draft.colorBgBody).toBe('#eeeeee');
            expect(result.current.draft.textColorMaster).toBe('#111111');
            expect(result.current.draft.primaryColor).toBe('#custom');
            expect(result.current.draft.layout).toBe('solid');
            expect(result.current.toast).toBeNull();
        });

        it('avisa somente quando uma customização de token de modo é substituída', () => {
            const sarak = {
                draftDesign: { mode: 'dark', colorBgBody: '#custom' },
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
            expect(result.current.toast?.message).toMatch(/substituiu uma customização/i);
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

    // Pré-visualizar um tema no catálogo não pode anunciar o id ao Provider — só
    // aplicar ao sistema anuncia (06-painel-de-customizacao-e-preview.md §4;
    // JSDoc de useResolvedThemeId.ts).
    describe('handleThemePreview(..., themeId) + handleApplyToSystem — o id só é anunciado ao APLICAR', () => {
        it('pré-visualizar NÃO chama setResolvedThemeId', () => {
            const setResolvedThemeId = vi.fn();
            const sarak = {
                draftDesign: null,
                systemDesign: { mode: 'dark' },
                isDrafting: true,
                setIsDrafting: vi.fn(),
                lockDrafting: vi.fn(),
                allThemes: [],
                setResolvedThemeId,
                applyFullConfigRaw: vi.fn(),
            } as unknown as SarakUIContextType;

            const { result } = renderHook(() => useDesignDraft(sarak));

            act(() => {
                result.current.handleThemePreview({ mode: 'light' }, undefined, 'tema-escolhido');
            });

            expect(result.current.draft.mode).toBe('light');
            expect(setResolvedThemeId).not.toHaveBeenCalled();
        });

        it('aplicar ao sistema DEPOIS de pré-visualizar anuncia o id pendente', () => {
            const applicationOrder: string[] = [];
            const setResolvedThemeId = vi.fn();
            const applyFullConfigRaw = vi.fn(() => applicationOrder.push('apply'));
            const persistDesign = vi.fn(() => applicationOrder.push(`persist:${applicationOrder.includes('theme:tema-escolhido')}`));
            setResolvedThemeId.mockImplementation((id: string) => applicationOrder.push(`theme:${id}`));
            const sarak = {
                draftDesign: null,
                systemDesign: { mode: 'dark' },
                isDrafting: true,
                setIsDrafting: vi.fn(),
                lockDrafting: vi.fn(),
                allThemes: [],
                setResolvedThemeId,
                applyFullConfigRaw,
                persistDesign,
            } as unknown as SarakUIContextType;

            const { result } = renderHook(() => useDesignDraft(sarak));

            act(() => {
                result.current.handleThemePreview({ mode: 'light' }, undefined, 'tema-escolhido');
            });
            expect(setResolvedThemeId).not.toHaveBeenCalled();

            act(() => {
                result.current.handleApplyToSystem();
            });

            expect(applyFullConfigRaw).toHaveBeenCalled();
            expect(setResolvedThemeId).toHaveBeenCalledWith('tema-escolhido');
            expect(persistDesign).toHaveBeenCalled();
            expect(applicationOrder).toEqual(['apply', 'theme:tema-escolhido', 'persist:true']);
        });

        it('sem themeId (preview de preset comum), aplicar NÃO chama setResolvedThemeId', () => {
            const setResolvedThemeId = vi.fn();
            const applyFullConfigRaw = vi.fn();
            const sarak = {
                draftDesign: null,
                systemDesign: { mode: 'dark' },
                isDrafting: true,
                setIsDrafting: vi.fn(),
                lockDrafting: vi.fn(),
                allThemes: [],
                setResolvedThemeId,
                applyFullConfigRaw,
            } as unknown as SarakUIContextType;

            const { result } = renderHook(() => useDesignDraft(sarak));

            act(() => {
                result.current.updateDraft('mode', 'light');
            });
            act(() => {
                result.current.handleApplyToSystem();
            });

            expect(applyFullConfigRaw).toHaveBeenCalled();
            expect(setResolvedThemeId).not.toHaveBeenCalled();
        });
    });

    // Desfazer a última aplicação — um nível, pelo mesmo caminho do Aplicar.
    describe('canUndoLastApply / undoLastApply', () => {
        it('sem nenhuma aplicação, não há o que desfazer', () => {
            const sarak = {
                draftDesign: null,
                systemDesign: { mode: 'dark' },
                isDrafting: true,
                setIsDrafting: vi.fn(),
                lockDrafting: vi.fn(),
            } as unknown as SarakUIContextType;

            const { result } = renderHook(() => useDesignDraft(sarak));

            expect(result.current.canUndoLastApply).toBe(false);
        });

        it('aplicar → desfazer volta ao design anterior, E a persistência recebe o valor restaurado', () => {
            const applyFullConfigRaw = vi.fn();
            const persistDesign = vi.fn();
            const sarak = {
                draftDesign: null,
                systemDesign: { mode: 'dark', primaryColor: '#111' },
                isDrafting: true,
                setIsDrafting: vi.fn(),
                lockDrafting: vi.fn(),
                applyFullConfigRaw,
                persistDesign,
            } as unknown as SarakUIContextType;

            const { result } = renderHook(() => useDesignDraft(sarak));

            act(() => {
                result.current.updateDraft('primaryColor', '#222');
            });
            expect(result.current.isDirty).toBe(true);

            act(() => {
                result.current.handleApplyToSystem();
            });

            expect(applyFullConfigRaw).toHaveBeenCalledWith(expect.objectContaining({ primaryColor: '#222' }));
            expect(result.current.canUndoLastApply).toBe(true);

            act(() => {
                result.current.undoLastApply();
            });

            expect(applyFullConfigRaw).toHaveBeenLastCalledWith({ mode: 'dark', primaryColor: '#111' });
            expect(persistDesign).toHaveBeenLastCalledWith({ mode: 'dark', primaryColor: '#111' });
            expect(result.current.canUndoLastApply).toBe(false);
        });
    });
});
