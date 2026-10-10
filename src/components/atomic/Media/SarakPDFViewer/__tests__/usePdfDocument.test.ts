import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SarakUIProvider } from '../../../../../core/Provider/SarakUIProvider';

vi.mock('pdfjs-dist', () => ({
    GlobalWorkerOptions: { workerSrc: '' },
    getDocument: vi.fn(() => ({ promise: Promise.resolve({ numPages: 2, getPage: vi.fn() }), destroy: vi.fn() })),
}));

import { getDocument } from 'pdfjs-dist';
import { usePdfDocument } from '../usePdfDocument';

describe('Spec 15 (Onda 10) — usePdfDocument', () => {
    it('começa em loading e expõe o documento carregado (worker fora da main thread)', async () => {
        const { result } = renderHook(() => usePdfDocument('/doc.pdf'));

        expect(result.current.loading).toBe(true);
        expect(result.current.doc).toBeNull();

        await waitFor(() => expect(result.current.doc).not.toBeNull());
        expect(result.current.doc?.numPages).toBe(2);
        expect(result.current.error).toBeNull();
        expect(result.current.loading).toBe(false);
    });

    it('traduz o fallback de erro ao idioma atual da biblioteca', async () => {
        vi.mocked(getDocument).mockReturnValueOnce({
            promise: Promise.reject('falha de leitura'),
            destroy: vi.fn(),
        } as never);
        const wrapper = ({ children }: { children: React.ReactNode }): React.ReactElement =>
            React.createElement(SarakUIProvider, { config: { language: 'en' }, children });
        const { result } = renderHook(() => usePdfDocument('/invalid.pdf'), { wrapper });

        await waitFor(() => expect(result.current.error).toBe('Failed to load PDF'));
    });
});
