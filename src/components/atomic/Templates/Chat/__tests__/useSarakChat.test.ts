// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useSarakChat } from '../useSarakChat';
import type { SarakChatModelRoute, SarakChatOnSend } from '../types';

const MODEL: SarakChatModelRoute = {
    model: 'model-a',
    provider: 'provider-a',
    display_name: 'Model A',
    capabilities: [],
    tier: 'standard',
};

afterEach(() => {
    vi.restoreAllMocks();
});

describe('useSarakChat', () => {
    it('keeps the model list empty and makes no request when the host omits a loader', () => {
        const fetch = vi.spyOn(globalThis, 'fetch');
        const onSend: SarakChatOnSend = vi.fn(async () => undefined);
        const { result } = renderHook(() => useSarakChat(onSend));

        expect(result.current.availableModels).toEqual([]);
        expect(fetch).not.toHaveBeenCalled();
    });

    it('loads models through the host callback', async () => {
        const loadModels = vi.fn(async () => [MODEL]);
        const onSend: SarakChatOnSend = vi.fn(async () => undefined);
        const { result } = renderHook(() => useSarakChat(onSend, loadModels));

        await waitFor(() => expect(result.current.availableModels).toEqual([MODEL]));

        expect(result.current.selectedRoute).toEqual(MODEL);
        expect(loadModels).toHaveBeenCalledOnce();
    });

    it('sends a host request and renders streamed tokens', async () => {
        let receivedMessage = '';
        const onSend: SarakChatOnSend = vi.fn(async (request, onToken) => {
            receivedMessage = request.message;
            onToken('Response');
        });
        const { result } = renderHook(() => useSarakChat(onSend));

        act(() => result.current.setInput('Question'));
        await act(async () => result.current.handleSend());

        expect(receivedMessage).toBe('Question');
        expect(result.current.messages[1].content).toBe('Response');
        expect(result.current.isLoading).toBe(false);
    });

    it('keeps the send error visible and clears loading after host rejection', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const onSend: SarakChatOnSend = vi.fn(async () => {
            throw new Error('Host rejected the message');
        });
        const { result } = renderHook(() => useSarakChat(onSend));

        act(() => result.current.setInput('Question'));
        await act(async () => result.current.handleSend());

        expect(result.current.messages[1].content).toContain('Host rejected the message');
        expect(result.current.isLoading).toBe(false);
    });
});
