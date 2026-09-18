/**
 * Integra `SarakUIProvider` (core/) real com `useDesignDraft` (features/) real —
 * por isso mora aqui, não em `core/Provider/__tests__/` (mesmo motivo de
 * `DuasPortasModoTema.test.tsx`: `core/` não pode importar `features/`, R1, e o
 * auditor de arquitetura não isenta `__tests__/`).
 */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SarakUIProvider, { useSarakUI } from '../../../../core/Provider/SarakUIProvider';
import { GLOBAL_THEMES } from '../../../../core/Design/presets/themes';
import { useDesignDraft } from '../useDesignDraft';
import type { SarakDesignState } from '../../../../core/Provider/types';

describe('Desfazer — integração com o Provider real', () => {
    // O `localStorage` do jsdom sobrevive entre testes do mesmo arquivo — sem
    // isto, o valor que um teste aplica "vaza" para o boot do próximo Provider.
    beforeEach(() => {
        localStorage.clear();
    });

    it('a TELA REAL (design efetivo) volta ao valor do sistema, não ao valor desfeito', () => {
        const Harness = () => {
            const sarak = useSarakUI();
            const { draft, updateDraft, handleApplyToSystem, undoLastApply, canUndoLastApply } = useDesignDraft(sarak);
            return (
                <div>
                    <span data-testid="tela-primary">{sarak.design?.primaryColor}</span>
                    <span data-testid="draft-primary">{draft.primaryColor as string}</span>
                    <span data-testid="can-undo">{String(canUndoLastApply)}</span>
                    <button data-testid="btn-edit" onClick={() => updateDraft('primaryColor', '#123456')}>Editar</button>
                    <button data-testid="btn-apply" onClick={() => handleApplyToSystem()}>Aplicar</button>
                    <button data-testid="btn-undo" onClick={() => undoLastApply()}>Desfazer</button>
                </div>
            );
        };

        render(
            <SarakUIProvider>
                <Harness />
            </SarakUIProvider>
        );

        const original = screen.getByTestId('tela-primary').textContent;

        fireEvent.click(screen.getByTestId('btn-edit'));
        fireEvent.click(screen.getByTestId('btn-apply'));
        expect(screen.getByTestId('tela-primary')).toHaveTextContent('#123456');
        expect(screen.getByTestId('can-undo')).toHaveTextContent('true');

        fireEvent.click(screen.getByTestId('btn-undo'));

        // A tela real e o próprio rascunho voltam ao valor anterior — nenhum resíduo
        // do valor desfeito continua sobrepondo o sistema restaurado.
        expect(screen.getByTestId('tela-primary')).toHaveTextContent(original || '');
        expect(screen.getByTestId('draft-primary')).toHaveTextContent(original || '');
        expect(screen.getByTestId('can-undo')).toHaveTextContent('false');
    });

    it('desfazer restaura também o TEMA anunciado (resolvedThemeId), e TODA chamada de onSave a partir dele recebe o par certo', async () => {
        const onSave = vi.fn().mockResolvedValue(undefined);
        const temaClaro = GLOBAL_THEMES.find((t) => t.id === 'minimalist-airy')!;

        const Harness = () => {
            const sarak = useSarakUI();
            const { handleThemePreview, handleApplyToSystem, undoLastApply } = useDesignDraft(sarak);
            return (
                <div>
                    <span data-testid="resolved-theme-id">{sarak.resolvedThemeId}</span>
                    <button
                        data-testid="btn-preview"
                        onClick={() => handleThemePreview(temaClaro.design as Partial<SarakDesignState>, undefined, 'minimalist-airy')}
                    >
                        Prever
                    </button>
                    <button data-testid="btn-apply" onClick={() => handleApplyToSystem()}>Aplicar</button>
                    <button data-testid="btn-undo" onClick={() => undoLastApply()}>Desfazer</button>
                </div>
            );
        };

        render(
            <SarakUIProvider initialTheme="sarak-sovereign" options={{ persistence: { onSave } }}>
                <Harness />
            </SarakUIProvider>
        );

        expect(screen.getByTestId('resolved-theme-id')).toHaveTextContent('sarak-sovereign');

        await act(async () => {
            fireEvent.click(screen.getByTestId('btn-preview'));
        });
        await act(async () => {
            fireEvent.click(screen.getByTestId('btn-apply'));
        });

        expect(screen.getByTestId('resolved-theme-id')).toHaveTextContent('minimalist-airy');

        // A partir daqui, TODA chamada de `onSave` tem de trazer o par restaurado
        // — inclusive a que o próprio desfazer dispara, sem esperar a gravação
        // automática corrigir o id 1,5s depois (esse atraso é o que o achado
        // apontou: quem fechasse a aba nesse intervalo persistia o par errado).
        const callsBeforeUndo = onSave.mock.calls.length;

        await act(async () => {
            fireEvent.click(screen.getByTestId('btn-undo'));
        });

        expect(screen.getByTestId('resolved-theme-id')).toHaveTextContent('sarak-sovereign');

        const callsRightAfterUndo = onSave.mock.calls.slice(callsBeforeUndo);
        expect(callsRightAfterUndo.length).toBeGreaterThan(0);
        for (const call of callsRightAfterUndo) {
            expect(call[1]).toBe('sarak-sovereign');
        }

        // E a gravação automática (debounce, useDesignManager), quando disparar
        // mais tarde, também — nenhuma chamada depois do desfazer traz o id velho.
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 1600));
        });

        for (const call of onSave.mock.calls.slice(callsBeforeUndo)) {
            expect(call[1]).toBe('sarak-sovereign');
        }
    });
});
