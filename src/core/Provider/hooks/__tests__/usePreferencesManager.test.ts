import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePreferencesManager } from '../usePreferencesManager';

describe('usePreferencesManager', () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => vi.restoreAllMocks());

    it('sem preferência salva, começa vazio', () => {
        const { result } = renderHook(() => usePreferencesManager({}, true));
        expect(result.current.preferences).toEqual({});
    });

    it('lê a preferência salva no `localStorage`, validada', () => {
        localStorage.setItem('sarak-ui-preferences-v1', JSON.stringify({ colorMode: 'dark', chaveInventada: 'x' }));
        const { result } = renderHook(() => usePreferencesManager({}, true));
        expect(result.current.preferences).toEqual({ colorMode: 'dark' });
    });

    it('updatePreferences grava IMEDIATAMENTE na chave PRÓPRIA de preferências, nunca na do tema', () => {
        const { result } = renderHook(() => usePreferencesManager({}, true));

        act(() => result.current.updatePreferences({ colorMode: 'light' }));

        expect(result.current.preferences).toEqual({ colorMode: 'light' });
        // Sem debounce: a escrita já aconteceu no mesmo ciclo do `act`, não 1,5s depois —
        // uma navegação logo em seguida não pode perder a escolha.
        expect(JSON.parse(localStorage.getItem('sarak-ui-preferences-v1') || '{}')).toEqual({ colorMode: 'light' });
        expect(localStorage.getItem('sarak-ui-design-v9.0')).toBeNull();
    });

    it('chama `options.preferences.onSave` IMEDIATAMENTE a cada mudança — nunca `persistence.onSave`', () => {
        const onSave = vi.fn();
        const { result } = renderHook(() => usePreferencesManager({ preferences: { onSave } }, true));

        act(() => result.current.updatePreferences({ navCollapsed: true }));

        expect(onSave).toHaveBeenCalledWith({ navCollapsed: true });
    });

    it('isolada por tenant — dois tenants não compartilham a mesma chave', () => {
        const { result: r1 } = renderHook(() => usePreferencesManager({ persistence: { tenantId: 'a' } }, true));
        const { result: r2 } = renderHook(() => usePreferencesManager({ persistence: { tenantId: 'b' } }, true));

        act(() => r1.current.updatePreferences({ colorMode: 'dark' }));

        expect(r2.current.preferences.colorMode).toBeUndefined();
    });

    it('funde o que `options.preferences.onLoad` devolve por cima do local', async () => {
        localStorage.setItem('sarak-ui-preferences-v1', JSON.stringify({ colorMode: 'light' }));
        const onLoad = vi.fn().mockResolvedValue({ fontSize: 'lg' });
        const { result } = renderHook(() => usePreferencesManager({ preferences: { onLoad } }, true));

        await waitFor(() => expect(result.current.preferences).toEqual({ colorMode: 'light', fontSize: 'lg' }));
    });
});
