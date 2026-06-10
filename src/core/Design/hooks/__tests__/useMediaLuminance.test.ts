import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useMediaLuminance } from '../useMediaLuminance';

// Setup Mocks
const mockPostMessage = vi.fn();
const mockTerminate = vi.fn();
let workerOnMessage: ((e: any) => void) | null = null;
let workerOnError: ((e: any) => void) | null = null;

class MockWorker {
    postMessage = mockPostMessage;
    terminate = mockTerminate;
    set onmessage(fn: any) { workerOnMessage = fn; }
    set onerror(fn: any) { workerOnError = fn; }
}

describe('useMediaLuminance', () => {
    let originalImage: any;
    let originalWorker: any;

    beforeEach(() => {
        vi.useFakeTimers();
        originalWorker = global.Worker;
        global.Worker = MockWorker as any;

        // Mock Image
        originalImage = global.Image;
        global.Image = class {
            onload: () => void = () => {};
            onerror: () => void = () => {};
            crossOrigin = '';
            set src(url: string) {
                setTimeout(() => this.onload(), 10);
            }
        } as any;

        // Mock Canvas context
        const mockContext = {
            drawImage: vi.fn(),
            getImageData: vi.fn(() => ({
                data: new Uint8ClampedArray(4 * 50 * 50).fill(255) // White pixels
            }))
        };
        HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext as any);
    });

    afterEach(() => {
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
        global.Worker = originalWorker;
        global.Image = originalImage;
        vi.clearAllMocks();
    });

    it('deve retornar unknown inicialmente ou quando for vídeo', () => {
        const { result, rerender } = renderHook(({ url, isVideo }: { url?: string, isVideo: boolean }) => useMediaLuminance(url, isVideo), {
            initialProps: { url: undefined as string | undefined, isVideo: false }
        });
        
        expect(result.current).toBe('unknown');

        rerender({ url: 'video.mp4', isVideo: true });
        expect(result.current).toBe('unknown');
    });

    it('deve usar o worker para calcular a luminância com sucesso', async () => {
        const { result } = renderHook(() => useMediaLuminance('https://example.com/image.jpg', false));
        
        // Aguarda Image.onload
        await act(async () => {
            vi.advanceTimersByTime(20);
        });

        expect(mockPostMessage).toHaveBeenCalled();

        // Simula resposta do worker
        act(() => {
            if (workerOnMessage) {
                workerOnMessage({ data: { luminance: 'light' } });
            }
        });

        expect(result.current).toBe('light');
        expect(mockTerminate).toHaveBeenCalled();
    });

    it('deve usar fallback sincrono se o worker demorar (timeout)', async () => {
        const { result } = renderHook(() => useMediaLuminance('https://example.com/image.jpg', false));
        
        // Aguarda Image.onload
        await act(async () => {
            vi.advanceTimersByTime(20);
        });

        expect(mockPostMessage).toHaveBeenCalled();

        // Avança o timer além do timeout de 500ms
        act(() => {
            vi.advanceTimersByTime(510);
        });

        // Como o mock retorna pixels brancos (255), o fallback deve calcular 'light'
        expect(result.current).toBe('light');
        expect(mockTerminate).toHaveBeenCalled();
    });
});
