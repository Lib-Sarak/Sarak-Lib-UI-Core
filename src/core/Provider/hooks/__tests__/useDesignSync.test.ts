import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDesignSync } from '../useDesignSync';
import type { SarakThemeEntry } from '../../types';
import { resolveHostConfig } from '../../utils/hostConfig';

describe('useDesignSync', () => {
    it('aplica o tema ativo uma única vez, mesmo que `allThemes` mude de referência a cada render (regressão do loop infinito — Spec 43 §5.1)', () => {
        const setDesign = vi.fn();
        const hasHydratedRef = { current: false };
        const theme: SarakThemeEntry = { id: 'dark-neon', design: { primaryColor: '#000000' } };

        const { rerender } = renderHook(
            ({ allThemes }: { allThemes: SarakThemeEntry[] }) =>
                useDesignSync({ isHydrated: true, activeThemeId: 'dark-neon', allThemes, storageKey: 'test-key', hasHydratedRef, setDesign }),
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
        const themeA: SarakThemeEntry = { id: 'a', design: { primaryColor: '#000000' } };
        const themeB: SarakThemeEntry = { id: 'b', design: { primaryColor: '#ffffff' } };
        const allThemes = [themeA, themeB];

        const { rerender } = renderHook(
            ({ activeThemeId }: { activeThemeId: string }) =>
                useDesignSync({ isHydrated: true, activeThemeId, allThemes, storageKey: 'test-key', hasHydratedRef, setDesign }),
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
        const darkTheme: SarakThemeEntry = { id: 'dark-theme', design: { mode: 'dark', colorBgBody: '#050505', textColorMaster: '#ffffff' } };

        renderHook(() => useDesignSync({ isHydrated: true, activeThemeId: 'dark-theme', allThemes: [darkTheme], storageKey: 'test-key', hasHydratedRef, setDesign }));
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
        const theme: SarakThemeEntry = { id: 'a', design: { primaryColor: '#000000' } };

        renderHook(() => useDesignSync({ isHydrated: false, activeThemeId: 'a', allThemes: [theme], storageKey: 'test-key', hasHydratedRef, setDesign }));

        expect(setDesign).not.toHaveBeenCalled();
    });

    it('`activeThemeId` sem tema correspondente (removido do catálogo) cai na referência do MODO ATUAL, com aviso — nunca lança, nunca fica sem tema (R33)', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const setDesign = vi.fn();
        const hasHydratedRef = { current: false };
        const themeA: SarakThemeEntry = { id: 'a', design: { primaryColor: '#000000' } };
        // O aviso é do guarda compartilhado (um por id, somando as portas): o hook só o aciona.
        const themeIdGuard = { isUnknownTheme: () => true, isRemovedTheme: () => true, isSavedThemeRemoved: () => false, warnUnknownThemeOnce: vi.fn() };

        expect(() =>
            renderHook(() => useDesignSync({ isHydrated: true, activeThemeId: 'tema-removido-do-catalogo', allThemes: [themeA], storageKey: 'test-key', hasHydratedRef, setDesign, themeIdGuard })),
        ).not.toThrow();

        expect(setDesign).toHaveBeenCalledTimes(1);
        expect(themeIdGuard.warnUnknownThemeOnce).toHaveBeenCalledTimes(1);
        expect(themeIdGuard.warnUnknownThemeOnce).toHaveBeenCalledWith('tema-removido-do-catalogo');
        expect(warnSpy).not.toHaveBeenCalled();

        const updater = setDesign.mock.calls[0][0] as (prev: Record<string, unknown>) => Record<string, unknown>;
        // O usuário estava no modo ESCURO — a referência aplicada tem de ser a
        // do mesmo modo, não a que calhar de vir primeiro em `SARAK_BOOT_THEMES`.
        const result = updater({ mode: 'dark' });
        expect(result.mode).toBe('dark');

        warnSpy.mockRestore();
    });

    describe('com `persistence.configIsSavedDesign` e `activeThemeId` controlado', () => {
        // O `config` é o gravado do tema A: carrega um token que o tema B não declara.
        const savedOfThemeA = { primaryColor: '#111111', cardBorderRadius: 7 };
        const themeA: SarakThemeEntry = { id: 'a', design: { primaryColor: '#111111', cardBorderRadius: 7 } };
        const themeB: SarakThemeEntry = { id: 'b', design: { primaryColor: '#eeeeee' } };

        const composeOnSwitchTo = (configIsSavedDesign: boolean): Record<string, unknown> => {
            const setDesign = vi.fn();
            const hasHydratedRef = { current: false };
            const getHostConfig = () => resolveHostConfig(savedOfThemeA, configIsSavedDesign);
            renderHook(() => useDesignSync({
                isHydrated: true, activeThemeId: 'b', allThemes: [themeA, themeB], storageKey: 'k', hasHydratedRef, setDesign, getHostConfig,
            }));
            const updater = setDesign.mock.calls[0][0] as (prev: Record<string, unknown>) => Record<string, unknown>;
            return updater({ mode: 'dark', ...savedOfThemeA });
        };

        it('a troca de tema pela prop não traz o resto do tema anterior', () => {
            const result = composeOnSwitchTo(true);
            expect(result.primaryColor).toBe('#eeeeee');
            expect(result.cardBorderRadius).not.toBe(7);
        });

        it('contraprova: sem a opção, o `config` é o host e o token que o tema novo não declara vale o do host', () => {
            expect(composeOnSwitchTo(false).cardBorderRadius).toBe(7);
        });
    });
});
