import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useLastAppliedSnapshot } from '../useLastAppliedSnapshot';
import { SarakUIContextType } from '../../../../core/Provider/types';

describe('useLastAppliedSnapshot — desfazer a última aplicação', () => {
    it('nada para desfazer antes de qualquer captura', () => {
        const sarak = {} as unknown as SarakUIContextType;
        const { result } = renderHook(() => useLastAppliedSnapshot(sarak, vi.fn()));

        expect(result.current.canUndoLastApply).toBe(false);
    });

    it('captura o design do sistema; desfazer devolve pelo MESMO caminho do Aplicar (sistema + persistência)', () => {
        const applyFullConfigRaw = vi.fn();
        const persistDesign = vi.fn();
        const sarak = {
            systemDesign: { mode: 'dark', primaryColor: '#000' },
            applyFullConfigRaw,
            persistDesign,
        } as unknown as SarakUIContextType;
        const showToast = vi.fn();

        const { result } = renderHook(() => useLastAppliedSnapshot(sarak, showToast));

        act(() => {
            result.current.captureBeforeApply();
        });
        expect(result.current.canUndoLastApply).toBe(true);

        act(() => {
            result.current.undoLastApply();
        });

        expect(applyFullConfigRaw).toHaveBeenCalledWith({ mode: 'dark', primaryColor: '#000' });
        expect(persistDesign).toHaveBeenCalledWith({ mode: 'dark', primaryColor: '#000' });
        expect(showToast).toHaveBeenCalledWith('success', expect.stringContaining('desfeita'));
    });

    it('um nível só: depois de desfazer, o controle some (não há mais o que desfazer)', () => {
        const sarak = {
            systemDesign: { mode: 'dark' },
            applyFullConfigRaw: vi.fn(),
            persistDesign: vi.fn(),
        } as unknown as SarakUIContextType;

        const { result } = renderHook(() => useLastAppliedSnapshot(sarak, vi.fn()));

        act(() => {
            result.current.captureBeforeApply();
        });
        act(() => {
            result.current.undoLastApply();
        });

        expect(result.current.canUndoLastApply).toBe(false);
    });

    it('uma nova captura substitui a foto guardada (não acumula histórico)', () => {
        const applyFullConfigRaw = vi.fn();
        const sarak: { systemDesign: Record<string, unknown> } & Partial<SarakUIContextType> = {
            systemDesign: { mode: 'dark' },
            applyFullConfigRaw,
            persistDesign: vi.fn(),
        };

        const { result, rerender } = renderHook(({ s }) => useLastAppliedSnapshot(s as SarakUIContextType, vi.fn()), {
            initialProps: { s: sarak },
        });

        act(() => {
            result.current.captureBeforeApply();
        });

        sarak.systemDesign = { mode: 'light' };
        rerender({ s: sarak });
        act(() => {
            result.current.captureBeforeApply();
        });

        act(() => {
            result.current.undoLastApply();
        });

        expect(applyFullConfigRaw).toHaveBeenCalledWith({ mode: 'light' });
    });

    it('captura e restaura também o TEMA anunciado (resolvedThemeId), não só o design', () => {
        const setResolvedThemeId = vi.fn();
        const sarak = {
            systemDesign: { mode: 'dark' },
            resolvedThemeId: 'sarak-sovereign',
            applyFullConfigRaw: vi.fn(),
            persistDesign: vi.fn(),
            setResolvedThemeId,
        } as unknown as SarakUIContextType;

        const { result, rerender } = renderHook(({ s }) => useLastAppliedSnapshot(s, vi.fn()), {
            initialProps: { s: sarak },
        });

        act(() => {
            result.current.captureBeforeApply();
        });

        // Entre a captura e o desfazer, o Aplicar mudou o tema no ar — é o que
        // undo precisa restaurar, não o que estava no ar no MOMENTO do desfazer.
        rerender({ s: { ...sarak, resolvedThemeId: 'minimalist-airy' } });

        act(() => {
            result.current.undoLastApply();
        });

        expect(setResolvedThemeId).toHaveBeenCalledWith('sarak-sovereign');
    });
});
