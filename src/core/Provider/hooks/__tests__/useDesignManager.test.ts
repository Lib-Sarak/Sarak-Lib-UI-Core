import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDesignManager } from '../useDesignManager';
import type { SarakUIOptions, SarakThemePayload } from '../../types';

const baseProps = (options: SarakUIOptions = {}) => ({
    initialConfig: {} as SarakThemePayload,
    options,
    isHydrated: true,
});

describe('useDesignManager — persistência tenant-aware e strategy (ADR-009 / plan-34)', () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        localStorage.clear();
        warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        warnSpy.mockRestore();
    });

    it("strategy 'hybrid' (default) grava localStorage E chama onSave — mesmo comportamento de antes desta plan, byte a byte", async () => {
        const onSave = vi.fn();
        const options: SarakUIOptions = { persistence: { storageKey: 'hybrid-key', onSave } };
        const { result } = renderHook(() => useDesignManager(baseProps(options)));

        await act(async () => {
            await result.current.persistDesign({ ...result.current.design, primaryColor: '#111111' } as never);
        });

        const saved = localStorage.getItem('hybrid-key');
        expect(saved).toBeTruthy();
        expect(JSON.parse(saved as string).primaryColor).toBe('#111111');
        expect(onSave).toHaveBeenCalledTimes(1);
    });

    it("strategy 'local' grava localStorage e IGNORA onSave mesmo configurado", async () => {
        const onSave = vi.fn();
        const options: SarakUIOptions = { persistence: { strategy: 'local', storageKey: 'local-key', onSave } };
        const { result } = renderHook(() => useDesignManager(baseProps(options)));

        await act(async () => {
            await result.current.persistDesign({ ...result.current.design, primaryColor: '#222222' } as never);
        });

        expect(localStorage.getItem('local-key')).toBeTruthy();
        expect(onSave).not.toHaveBeenCalled();
    });

    it("strategy 'remote' com onSave configurado NÃO grava localStorage — a escrita vai só por onSave", async () => {
        const onSave = vi.fn();
        const options: SarakUIOptions = { persistence: { strategy: 'remote', storageKey: 'remote-key', onSave } };
        const { result } = renderHook(() => useDesignManager(baseProps(options)));

        await act(async () => {
            await result.current.persistDesign({ ...result.current.design, primaryColor: '#333333' } as never);
        });

        expect(localStorage.getItem('remote-key')).toBeNull();
        expect(onSave).toHaveBeenCalledTimes(1);
    });

    it("strategy 'remote' sem onSave nem onLoad degrada para 'local' — grava localStorage e não perde o tema", async () => {
        const options: SarakUIOptions = { persistence: { strategy: 'remote', storageKey: 'degraded-key' } };
        const { result } = renderHook(() => useDesignManager(baseProps(options)));

        await act(async () => {
            await result.current.persistDesign({ ...result.current.design, primaryColor: '#444444' } as never);
        });

        expect(localStorage.getItem('degraded-key')).toBeTruthy();
        expect(JSON.parse(localStorage.getItem('degraded-key') as string).primaryColor).toBe('#444444');
    });

    it('duas instâncias com tenantId diferentes e a MESMA storageKey não vazam entre si — nem por leitura direta, nem por crossTabSync', async () => {
        const optionsA: SarakUIOptions = { persistence: { storageKey: 'shared-key', tenantId: 'tenant-a' } };
        const optionsB: SarakUIOptions = { persistence: { storageKey: 'shared-key', tenantId: 'tenant-b' } };

        const { result: resultA } = renderHook(() => useDesignManager(baseProps(optionsA)));
        const { result: resultB } = renderHook(() => useDesignManager(baseProps(optionsB)));

        await act(async () => {
            await resultA.current.persistDesign({ ...resultA.current.design, primaryColor: '#aaaaaa' } as never);
        });

        expect(localStorage.getItem('shared-key::tenant:tenant-a')).toContain('#aaaaaa');
        expect(localStorage.getItem('shared-key::tenant:tenant-b')).toBeNull();

        // crossTabSync: um evento gravado sob a chave de A não pode reaplicar em B —
        // as duas chaves compostas são distintas (resolveStorageKey), então o filtro
        // por `event.key` de `useDesignStorageSync` já isola sozinho.
        act(() => {
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'shared-key::tenant:tenant-a',
                newValue: JSON.stringify({ ...resultB.current.design, primaryColor: '#bbbbbb' }),
                storageArea: window.localStorage,
            }));
        });

        expect(resultB.current.design.primaryColor).not.toBe('#bbbbbb');
    });

    it('sem tenantId, a chave efetiva é o `storageKey` cru — comportamento de hoje preservado', async () => {
        const options: SarakUIOptions = { persistence: { storageKey: 'no-tenant-key' } };
        const { result } = renderHook(() => useDesignManager(baseProps(options)));

        await act(async () => {
            await result.current.persistDesign({ ...result.current.design, primaryColor: '#555555' } as never);
        });

        expect(localStorage.getItem('no-tenant-key')).toBeTruthy();
    });
});
