import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePreferencesStorageSync } from '../usePreferencesStorageSync';

const fireStorage = (key: string, newValue: string | null) => {
    window.dispatchEvent(new StorageEvent('storage', { key, newValue }));
};

describe('usePreferencesStorageSync', () => {
    it('evento de chave DIFERENTE é ignorado', () => {
        const onExternalChange = vi.fn();
        renderHook(() => usePreferencesStorageSync(true, 'chave-preferencias', onExternalChange));

        act(() => fireStorage('outra-chave', JSON.stringify({ colorMode: 'dark' })));
        expect(onExternalChange).not.toHaveBeenCalled();
    });

    it('evento da MESMA chave, valida e propaga', () => {
        const onExternalChange = vi.fn();
        renderHook(() => usePreferencesStorageSync(true, 'chave-preferencias', onExternalChange));

        act(() => fireStorage('chave-preferencias', JSON.stringify({ colorMode: 'dark', chaveInventada: 'x' })));
        expect(onExternalChange).toHaveBeenCalledWith({ colorMode: 'dark' });
    });

    it('JSON inválido é descartado com warn, sem lançar', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const onExternalChange = vi.fn();
        renderHook(() => usePreferencesStorageSync(true, 'chave-preferencias', onExternalChange));

        act(() => fireStorage('chave-preferencias', '{invalido'));
        expect(onExternalChange).not.toHaveBeenCalled();
        expect(warn).toHaveBeenCalled();
        warn.mockRestore();
    });

    it('não hidratado, não escuta o evento', () => {
        const onExternalChange = vi.fn();
        renderHook(() => usePreferencesStorageSync(false, 'chave-preferencias', onExternalChange));

        act(() => fireStorage('chave-preferencias', JSON.stringify({ colorMode: 'dark' })));
        expect(onExternalChange).not.toHaveBeenCalled();
    });
});
