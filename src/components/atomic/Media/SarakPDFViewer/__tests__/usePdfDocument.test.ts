import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('pdfjs-dist', () => ({
    GlobalWorkerOptions: { workerSrc: '' },
    getDocument: () => ({ promise: Promise.resolve({ numPages: 2, getPage: vi.fn() }), destroy: vi.fn() }),
}));

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
});
