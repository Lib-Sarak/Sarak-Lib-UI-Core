// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('resolveEffectiveStrategy (ADR-009 §2.2)', () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        warnSpy.mockRestore();
    });

    it('sem `strategy`, o default é `hybrid`', async () => {
        vi.resetModules();
        const { resolveEffectiveStrategy } = await import('../persistenceStrategy');
        expect(resolveEffectiveStrategy(undefined)).toBe('hybrid');
        expect(resolveEffectiveStrategy({})).toBe('hybrid');
    });

    it('`local` é devolvido como está, mesmo com onSave/onLoad configurados', async () => {
        vi.resetModules();
        const { resolveEffectiveStrategy } = await import('../persistenceStrategy');
        expect(
            resolveEffectiveStrategy({ strategy: 'local', onSave: vi.fn(), onLoad: vi.fn() }),
        ).toBe('local');
    });

    it('`remote` com `onSave` OU `onLoad` configurado permanece `remote`, sem aviso', async () => {
        vi.resetModules();
        const { resolveEffectiveStrategy } = await import('../persistenceStrategy');

        expect(resolveEffectiveStrategy({ strategy: 'remote', onSave: vi.fn() })).toBe('remote');
        expect(resolveEffectiveStrategy({ strategy: 'remote', onLoad: vi.fn() })).toBe('remote');
        expect(warnSpy).not.toHaveBeenCalled();
    });

    it('`remote` sem onSave nem onLoad degrada para `local` e avisa uma única vez por sessão', async () => {
        vi.resetModules();
        const { resolveEffectiveStrategy } = await import('../persistenceStrategy');

        expect(resolveEffectiveStrategy({ strategy: 'remote' })).toBe('local');
        expect(resolveEffectiveStrategy({ strategy: 'remote' })).toBe('local');
        expect(resolveEffectiveStrategy({ strategy: 'remote' })).toBe('local');

        expect(warnSpy).toHaveBeenCalledTimes(1);
    });
});
