import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { overlayPreferences } from '../../utils/overlayPreferences';
import type { SarakDesignState } from '../../types';
import { usePreferencesManager } from '../usePreferencesManager';

const mockMatchMedia = (initialMatches: boolean): { fireChange: (nextMatches: boolean) => void } => {
    const listeners = new Set<(event: MediaQueryListEvent) => void>();
    let matches = initialMatches;
    const mediaQueryList = {
        get matches(): boolean {
            return matches;
        },
        addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => listeners.add(listener),
        removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => listeners.delete(listener),
    };
    window.matchMedia = vi.fn().mockReturnValue(mediaQueryList) as unknown as typeof window.matchMedia;
    return {
        fireChange: (nextMatches: boolean): void => {
            matches = nextMatches;
            listeners.forEach((listener) => listener({ matches: nextMatches } as MediaQueryListEvent));
        },
    };
};

beforeEach(() => localStorage.clear());
afterEach(() => {
    vi.restoreAllMocks();
    // @ts-expect-error — restaura o ambiente sem `matchMedia` entre testes.
    delete window.matchMedia;
});

describe('leitura e persistência de preferências', () => {
    it('sem preferência salva, começa vazio', () => {
        const { result } = renderHook(() => usePreferencesManager({}, true));
        expect(result.current.preferences).toEqual({});
    });

    it('lê a preferência salva no `localStorage`, validada', () => {
        localStorage.setItem('sarak-ui-preferences-v1', JSON.stringify({ colorMode: 'dark', chaveInventada: 'x' }));
        const { result } = renderHook(() => usePreferencesManager({}, true));
        expect(result.current.preferences).toEqual({ colorMode: 'dark' });
    });

    it('updatePreferences grava IMEDIATAMENTE na chave PRÓPRIA, nunca na do tema', () => {
        const { result } = renderHook(() => usePreferencesManager({}, true));
        act(() => result.current.updatePreferences({ colorMode: 'light' }));
        expect(result.current.preferences).toEqual({ colorMode: 'light' });
        expect(JSON.parse(localStorage.getItem('sarak-ui-preferences-v1') || '{}')).toEqual({ colorMode: 'light' });
        expect(localStorage.getItem('sarak-ui-design-v9.0')).toBeNull();
    });

    it('chama `options.preferences.onSave` IMEDIATAMENTE a cada mudança', () => {
        const onSave = vi.fn();
        const { result } = renderHook(() => usePreferencesManager({ preferences: { onSave } }, true));
        act(() => result.current.updatePreferences({ navCollapsed: true }));
        expect(onSave).toHaveBeenCalledWith({ navCollapsed: true });
    });
});

describe('defaultColorMode: modo efetivo', () => {
    it('aplica o modo fixo do host quando ainda não há escolha salva', () => {
        const design = { mode: 'light', preferenceModePosition: 'pinned' } as unknown as SarakDesignState;
        const { result } = renderHook(() => {
            const manager = usePreferencesManager({ preferences: { defaultColorMode: 'dark' } }, true);
            return overlayPreferences(design, manager.preferences, undefined, manager.systemColorScheme);
        });
        expect(result.current.mode).toBe('dark');
    });

    it('system acompanha mudanças do sistema operacional no design efetivo', () => {
        const { fireChange } = mockMatchMedia(false);
        const design = { mode: 'light', preferenceModePosition: 'pinned' } as unknown as SarakDesignState;
        const { result } = renderHook(() => {
            const manager = usePreferencesManager({ preferences: { defaultColorMode: 'system' } }, true);
            return overlayPreferences(design, manager.preferences, undefined, manager.systemColorScheme);
        });
        expect(result.current.mode).toBe('light');
        act(() => fireChange(true));
        expect(result.current.mode).toBe('dark');
    });
});

describe('defaultColorMode: precedência e limites', () => {
    it('uma escolha salva vence o padrão do host', () => {
        localStorage.setItem('sarak-ui-preferences-v1', JSON.stringify({ colorMode: 'light' }));
        const design = { mode: 'dark', preferenceModePosition: 'pinned' } as unknown as SarakDesignState;
        const { result } = renderHook(() => {
            const manager = usePreferencesManager({ preferences: { defaultColorMode: 'dark' } }, true);
            return overlayPreferences(design, manager.preferences, undefined, manager.systemColorScheme);
        });
        expect(result.current.mode).toBe('light');
    });

    it('não persiste nem envia ao host o modo default', () => {
        const onSave = vi.fn();
        const setItem = vi.spyOn(Storage.prototype, 'setItem');
        const { result } = renderHook(() => usePreferencesManager({
            preferences: { defaultColorMode: 'system', onSave },
        }, true));
        expect(result.current.preferences).toEqual({ colorMode: 'system' });
        expect(setItem).not.toHaveBeenCalled();
        expect(onSave).not.toHaveBeenCalled();
    });

    it('ignora o default quando o tema desliga a preferência de modo', () => {
        const design = { mode: 'light', preferenceModePosition: 'off' } as unknown as SarakDesignState;
        const { result } = renderHook(() => {
            const manager = usePreferencesManager({ preferences: { defaultColorMode: 'dark' } }, true);
            return overlayPreferences(design, manager.preferences, undefined, manager.systemColorScheme);
        });
        expect(result.current).toEqual(design);
    });

    it('sem default e sem escolha salva, preserva o modo do tema', () => {
        const design = { mode: 'light', preferenceModePosition: 'pinned' } as unknown as SarakDesignState;
        const { result } = renderHook(() => {
            const manager = usePreferencesManager({}, true);
            return overlayPreferences(design, manager.preferences, undefined, manager.systemColorScheme);
        });
        expect(result.current).toEqual(design);
    });
});

describe('isolamento e carregamento remoto', () => {
    it('isola preferências por tenant', () => {
        const { result: firstTenant } = renderHook(() => usePreferencesManager({ persistence: { tenantId: 'a' } }, true));
        const { result: secondTenant } = renderHook(() => usePreferencesManager({ persistence: { tenantId: 'b' } }, true));
        act(() => firstTenant.current.updatePreferences({ colorMode: 'dark' }));
        expect(secondTenant.current.preferences.colorMode).toBeUndefined();
    });

    it('funde o que `options.preferences.onLoad` devolve por cima do local', async () => {
        localStorage.setItem('sarak-ui-preferences-v1', JSON.stringify({ colorMode: 'light' }));
        const onLoad = vi.fn().mockResolvedValue({ fontSize: 'lg' });
        const { result } = renderHook(() => usePreferencesManager({ preferences: { onLoad } }, true));
        await waitFor(() => expect(result.current.preferences).toEqual({ colorMode: 'light', fontSize: 'lg' }));
    });
});
