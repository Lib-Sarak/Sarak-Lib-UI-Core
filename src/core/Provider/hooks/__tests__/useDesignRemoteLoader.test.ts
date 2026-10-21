import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDesignRemoteLoader } from '../useDesignRemoteLoader';
import type { SarakUIOptions, SarakDesignState } from '../../types';

const renderLoader = (options: SarakUIOptions, setDesign = vi.fn(), getSeedConfig = vi.fn()) => {
    const optionsRef = { current: options };
    const setIsBackendLoaded = vi.fn();
    const setResolvedThemeId = vi.fn();
    const utils = renderHook(
        ({ isBackendLoaded }: { isBackendLoaded: boolean }) =>
            useDesignRemoteLoader({
                isHydrated: true,
                optionsRef,
                isBackendLoaded,
                setIsBackendLoaded,
                setDesign,
                getSeedConfig,
                setResolvedThemeId,
                storageKey: 'test-key',
            }),
        { initialProps: { isBackendLoaded: false } },
    );
    return { ...utils, setDesign, setIsBackendLoaded, getSeedConfig, setResolvedThemeId };
};

describe('useDesignRemoteLoader — strategy (ADR-009 / plan-34)', () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        warnSpy.mockRestore();
    });

    it('sem onLoad, marca isBackendLoaded=true e não toca no design', async () => {
        const { setIsBackendLoaded, setDesign } = renderLoader({ persistence: {} });

        await waitFor(() => expect(setIsBackendLoaded).toHaveBeenCalledWith(true));
        expect(setDesign).not.toHaveBeenCalled();
    });

    it("strategy 'local' IGNORA onLoad mesmo configurado — nunca chama a porta remota", async () => {
        const onLoad = vi.fn().mockResolvedValue({ primaryColor: '#ff0000' });
        const { setIsBackendLoaded, setDesign } = renderLoader({ persistence: { strategy: 'local', onLoad } });

        await waitFor(() => expect(setIsBackendLoaded).toHaveBeenCalledWith(true));
        expect(onLoad).not.toHaveBeenCalled();
        expect(setDesign).not.toHaveBeenCalled();
    });

    it("strategy 'hybrid' FUNDE o resultado de onLoad por cima do design corrente — comportamento de antes desta plan", async () => {
        const onLoad = vi.fn().mockResolvedValue({ primaryColor: '#ff0000' });
        const { setDesign, setIsBackendLoaded } = renderLoader({ persistence: { onLoad } });

        await waitFor(() => expect(setIsBackendLoaded).toHaveBeenCalledWith(true));
        expect(setDesign).toHaveBeenCalledTimes(1);

        const updater = setDesign.mock.calls[0][0] as (prev: SarakDesignState) => SarakDesignState;
        const prev = { mode: 'dark', sidebarWidth: 300 } as unknown as SarakDesignState;
        const result = updater(prev);

        // Fusão: chave que só existia no `prev` (fallback de localStorage) sobrevive.
        expect(result.mode).toBe('dark');
        expect(result.sidebarWidth).toBe(300);
        expect(result.primaryColor).toBe('#ff0000');
    });

    it("strategy 'remote' SUBSTITUI o design pela semente + onLoad — não funde com o que veio do fallback de localStorage", async () => {
        const onLoad = vi.fn().mockResolvedValue({ primaryColor: '#00ff00' });
        const seed = { mode: 'light', primaryColor: '#000000' } as unknown as SarakDesignState;
        const getSeedConfig = vi.fn().mockReturnValue(seed);
        const { setDesign, setIsBackendLoaded } = renderLoader(
            { persistence: { strategy: 'remote', onLoad } },
            vi.fn(),
            getSeedConfig,
        );

        await waitFor(() => expect(setIsBackendLoaded).toHaveBeenCalledWith(true));
        expect(setDesign).toHaveBeenCalledTimes(1);

        const updater = setDesign.mock.calls[0][0] as (prev: SarakDesignState) => SarakDesignState;
        // O `prev` que a fonte síncrona de localStorage teria deixado — não pode sobreviver.
        const localStorageLeftover = { mode: 'dark', sidebarWidth: 999 } as unknown as SarakDesignState;
        const result = updater(localStorageLeftover);

        expect(result.sidebarWidth).toBeUndefined();
        expect(result.mode).toBe('light');
        expect(result.primaryColor).toBe('#00ff00');
        expect(getSeedConfig).toHaveBeenCalled();
    });

    it("strategy 'remote' sem onSave nem onLoad degrada para 'local' — marca isBackendLoaded=true sem chamar nada remoto", async () => {
        const { setIsBackendLoaded, setDesign } = renderLoader({ persistence: { strategy: 'remote' } });

        await waitFor(() => expect(setIsBackendLoaded).toHaveBeenCalledWith(true));
        expect(setDesign).not.toHaveBeenCalled();
    });

    it('restaura o design e o id do tema quando onLoad devolve o par', async () => {
        const onLoad = vi.fn().mockResolvedValue({
            design: { primaryColor: '#123456' },
            activeThemeId: 'tema-salvo',
        });
        const { setDesign, setResolvedThemeId, setIsBackendLoaded } = renderLoader({ persistence: { onLoad } });

        await waitFor(() => expect(setIsBackendLoaded).toHaveBeenCalledWith(true));
        expect(setResolvedThemeId).toHaveBeenCalledWith('tema-salvo');
        expect(setDesign).toHaveBeenCalledTimes(1);
        const updater = setDesign.mock.calls[0][0] as (previous: SarakDesignState) => SarakDesignState;
        expect(updater({ mode: 'dark' }).primaryColor).toBe('#123456');
    });

    it('activeThemeId controlado vence o id devolvido por onLoad', async () => {
        const onLoad = vi.fn().mockResolvedValue({
            design: { primaryColor: '#654321' },
            activeThemeId: 'tema-salvo',
        });
        const optionsRef = { current: { persistence: { onLoad } } as SarakUIOptions };
        const setDesign = vi.fn();
        const setResolvedThemeId = vi.fn();
        const setIsBackendLoaded = vi.fn();

        renderHook(() => useDesignRemoteLoader({
            isHydrated: true,
            optionsRef,
            isBackendLoaded: false,
            setIsBackendLoaded,
            setDesign,
            getSeedConfig: () => ({} as SarakDesignState),
            activeThemeId: 'tema-controlado',
            setResolvedThemeId,
            storageKey: 'test-key',
        }));

        await waitFor(() => expect(setIsBackendLoaded).toHaveBeenCalledWith(true));
        expect(setResolvedThemeId).toHaveBeenCalledWith('tema-controlado');
    });

    it('onLoad sem dado salvo não aplica nem grava um design', async () => {
        const onLoad = vi.fn().mockResolvedValue(null);
        const { setDesign, setIsBackendLoaded, setResolvedThemeId } = renderLoader({ persistence: { onLoad } });

        await waitFor(() => expect(setIsBackendLoaded).toHaveBeenCalledWith(true));
        expect(setDesign).not.toHaveBeenCalled();
        expect(setResolvedThemeId).not.toHaveBeenCalled();
    });

    it("`getSeedConfig` instável entre renders (customThemes inline — SarakUIProvider.tsx:44-46) NÃO chama onLoad mais de uma vez (achado de revisão, 2026-08-12)", async () => {
        const onLoad = vi.fn().mockResolvedValue({ primaryColor: '#123456' });
        const optionsRef = { current: { persistence: { onLoad } } as SarakUIOptions };
        const setDesign = vi.fn();
        const setIsBackendLoaded = vi.fn();
        const setResolvedThemeId = vi.fn();
        // Uma nova função a cada render — o mesmo footgun de `allThemes` recriado
        // por `customThemes` inline, que produz um `getSeedConfig` novo por render.
        const newSeedConfig = () => (() => ({ mode: 'light' } as unknown as SarakDesignState));

        const { rerender } = renderHook(
            ({ getSeedConfig }: { getSeedConfig: () => SarakDesignState }) =>
                useDesignRemoteLoader({
                    isHydrated: true,
                    optionsRef,
                    isBackendLoaded: false,
                    setIsBackendLoaded,
                    setDesign,
                    getSeedConfig,
                    setResolvedThemeId,
                    storageKey: 'test-key',
                }),
            { initialProps: { getSeedConfig: newSeedConfig() } },
        );

        rerender({ getSeedConfig: newSeedConfig() });
        rerender({ getSeedConfig: newSeedConfig() });
        rerender({ getSeedConfig: newSeedConfig() });

        await waitFor(() => expect(setIsBackendLoaded).toHaveBeenCalledWith(true));
        expect(onLoad).toHaveBeenCalledTimes(1);
    });
});
