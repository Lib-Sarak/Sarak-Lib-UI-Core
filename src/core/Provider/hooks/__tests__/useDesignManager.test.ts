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

describe('useDesignManager — onSave recebe o id do tema ativo (plan-42)', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('onSave recebe o id do tema ativo como SEGUNDO parâmetro', async () => {
        const onSave = vi.fn();
        const options: SarakUIOptions = { persistence: { storageKey: 'active-id-key', onSave } };
        const { result } = renderHook(() => useDesignManager(baseProps(options)));

        expect(result.current.resolvedThemeId).toBeTruthy();

        await act(async () => {
            await result.current.persistDesign({ ...result.current.design, primaryColor: '#777777' } as never);
        });

        expect(onSave).toHaveBeenCalledWith(
            expect.objectContaining({ primaryColor: '#777777' }),
            result.current.resolvedThemeId,
        );
    });

    it('um consumidor que só declara onSave(design) — SEM o segundo parâmetro — continua compilando (tsc) e sendo chamado', async () => {
        const received: SarakThemePayload[] = [];
        // Assinatura de ANTES desta plan, de propósito: prova em tempo de compilação
        // que o 2º parâmetro é aditivo — se não fosse, este arquivo não passaria no
        // `tsc --noEmit`.
        const onlyDesignOnSave = (design: SarakThemePayload): void => {
            received.push(design);
        };
        const options: SarakUIOptions = { persistence: { storageKey: 'legacy-onsave-key', onSave: onlyDesignOnSave } };
        const { result } = renderHook(() => useDesignManager(baseProps(options)));

        await act(async () => {
            await result.current.persistDesign({ ...result.current.design, primaryColor: '#999999' } as never);
        });

        expect(received).toHaveLength(1);
        expect(received[0].primaryColor).toBe('#999999');
    });

    it('sem tema resolvido, o segundo parâmetro chega undefined — consumidor que só declara onSave(design) continua funcionando', async () => {
        const onSave = vi.fn((_design: SarakThemePayload) => {});
        const options: SarakUIOptions = { persistence: { storageKey: 'no-theme-key', onSave } };
        const { result } = renderHook(() => useDesignManager(baseProps(options)));

        act(() => {
            result.current.setResolvedThemeId?.(undefined);
        });

        await act(async () => {
            await result.current.persistDesign({ ...result.current.design, primaryColor: '#888888' } as never);
        });

        expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ primaryColor: '#888888' }), undefined);
    });

    it('persistDesign NÃO muda de identidade quando o tema muda — a armadilha da plan-34 §11 (dependência instável em array de dependências)', () => {
        const options: SarakUIOptions = { persistence: { storageKey: 'stable-identity-key' } };
        const { result, rerender } = renderHook(
            (props: { activeThemeId?: string }) => useDesignManager({ ...baseProps(options), activeThemeId: props.activeThemeId }),
            { initialProps: { activeThemeId: undefined as string | undefined } },
        );

        const persistDesignBeforeThemeChange = result.current.persistDesign;

        act(() => {
            rerender({ activeThemeId: 'tema-a' });
        });
        act(() => {
            rerender({ activeThemeId: 'tema-b' });
        });

        expect(result.current.resolvedThemeId).toBe('tema-b');
        expect(result.current.persistDesign).toBe(persistDesignBeforeThemeChange);
    });
});
