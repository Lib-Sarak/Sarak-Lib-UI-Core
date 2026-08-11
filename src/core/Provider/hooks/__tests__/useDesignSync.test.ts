import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDesignSync } from '../useDesignSync';
import type { ThemeEntry } from '../../types';

describe('useDesignSync', () => {
    it('aplica o tema ativo uma única vez, mesmo que `allThemes` mude de referência a cada render (regressão do loop infinito — Spec 43 §5.1)', () => {
        const setDesign = vi.fn();
        const hasHydratedRef = { current: false };
        const theme: ThemeEntry = { id: 'dark-neon', design: { primaryColor: '#000000' } };

        const { rerender } = renderHook(
            ({ allThemes }: { allThemes: ThemeEntry[] }) =>
                useDesignSync(true, 'dark-neon', allThemes, 'test-key', hasHydratedRef, setDesign),
            { initialProps: { allThemes: [theme] } }
        );

        expect(setDesign).toHaveBeenCalledTimes(1);

        // Simula o footgun real: uma referência NOVA de array a cada render (ex.:
        // `customThemes={[...]}` inline no JSX, ou o antigo default `= []` do
        // Provider). Sem o guard de `lastAppliedThemeIdRef`, cada rerender chamaria
        // `setDesign` de novo — como o valor retornado é sempre um objeto novo
        // (spread), o React nunca faz bailout por igualdade e o resultado real era
        // um loop de render infinito (CPU ~100%, processo que nunca termina).
        rerender({ allThemes: [theme] });
        rerender({ allThemes: [theme] });
        rerender({ allThemes: [theme] });

        expect(setDesign).toHaveBeenCalledTimes(1);
    });

    it('reaplica quando o `activeThemeId` muda de fato para outro tema', () => {
        const setDesign = vi.fn();
        const hasHydratedRef = { current: false };
        const themeA: ThemeEntry = { id: 'a', design: { primaryColor: '#000000' } };
        const themeB: ThemeEntry = { id: 'b', design: { primaryColor: '#ffffff' } };
        const allThemes = [themeA, themeB];

        const { rerender } = renderHook(
            ({ activeThemeId }: { activeThemeId: string }) =>
                useDesignSync(true, activeThemeId, allThemes, 'test-key', hasHydratedRef, setDesign),
            { initialProps: { activeThemeId: 'a' } }
        );
        expect(setDesign).toHaveBeenCalledTimes(1);

        rerender({ activeThemeId: 'b' });
        expect(setDesign).toHaveBeenCalledTimes(2);

        // Voltar para o mesmo ID não deveria reaplicar de novo enquanto ele não mudar.
        rerender({ activeThemeId: 'b' });
        expect(setDesign).toHaveBeenCalledTimes(2);
    });

    it('respeita o MODO do usuário ao trocar de tema — o modo nativo do tema NÃO pode vencer (regressão da plan-26, medida no ERP)', () => {
        const setDesign = vi.fn();
        const hasHydratedRef = { current: false };
        // Tema nativamente ESCURO, sem `contraparte` — é o caso dos 18 legados (fallback).
        const darkTheme: ThemeEntry = { id: 'dark-theme', design: { mode: 'dark', colorBgBody: '#050505', textColorMaster: '#ffffff' } };

        renderHook(() => useDesignSync(true, 'dark-theme', [darkTheme], 'test-key', hasHydratedRef, setDesign));
        expect(setDesign).toHaveBeenCalledTimes(1);

        const updater = setDesign.mock.calls[0][0] as (prev: Record<string, unknown>) => Record<string, unknown>;
        // O usuário estava no modo CLARO antes de escolher este tema escuro.
        const result = updater({ mode: 'light' });

        // A preferência do usuário tem que sobreviver à troca de tema — nunca o
        // modo nativo do tema sozinho (Decisão D expôs essa regressão: antes,
        // `syncThemeWithMode` rodava a cada render e escondia o problema).
        expect(result.mode).toBe('light');
    });

    it('não chama setDesign quando não hidratado', () => {
        const setDesign = vi.fn();
        const hasHydratedRef = { current: false };
        const theme: ThemeEntry = { id: 'a', design: { primaryColor: '#000000' } };

        renderHook(() => useDesignSync(false, 'a', [theme], 'test-key', hasHydratedRef, setDesign));

        expect(setDesign).not.toHaveBeenCalled();
    });
});
