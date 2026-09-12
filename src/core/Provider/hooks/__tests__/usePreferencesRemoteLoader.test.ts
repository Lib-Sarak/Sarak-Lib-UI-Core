import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePreferencesRemoteLoader } from '../usePreferencesRemoteLoader';

describe('usePreferencesRemoteLoader', () => {
    it('sem `onLoad`, não chama o callback de fusão', () => {
        const onLoaded = vi.fn();
        renderHook(() => usePreferencesRemoteLoader(true, undefined, onLoaded));
        expect(onLoaded).not.toHaveBeenCalled();
    });

    it('não hidratado ainda, não chama `onLoad`', () => {
        const onLoad = vi.fn().mockResolvedValue({ colorMode: 'dark' });
        const onLoaded = vi.fn();
        renderHook(() => usePreferencesRemoteLoader(false, onLoad, onLoaded));
        expect(onLoad).not.toHaveBeenCalled();
    });

    it('hidratado com `onLoad`, valida o resultado e funde via `onLoaded`', async () => {
        const onLoad = vi.fn().mockResolvedValue({ colorMode: 'dark', chaveInventada: 'x' });
        const onLoaded = vi.fn();
        renderHook(() => usePreferencesRemoteLoader(true, onLoad, onLoaded));

        await waitFor(() => expect(onLoaded).toHaveBeenCalledWith({ colorMode: 'dark' }));
    });

    it('`onLoad` que rejeita não derruba o hook — só loga o erro', async () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const onLoad = vi.fn().mockRejectedValue(new Error('falhou'));
        const onLoaded = vi.fn();
        renderHook(() => usePreferencesRemoteLoader(true, onLoad, onLoaded));

        await waitFor(() => expect(error).toHaveBeenCalled());
        expect(onLoaded).not.toHaveBeenCalled();
        error.mockRestore();
    });
});
