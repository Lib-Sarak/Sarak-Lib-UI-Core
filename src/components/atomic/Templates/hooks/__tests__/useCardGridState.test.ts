import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCardGridState } from '../useCardGridState';
import api from '../../../../../shared/services/api';

vi.mock('../../../../../shared/services/api', () => ({
    default: {
        get: vi.fn(),
    }
}));

// Aceita dado pronto, no mesmo contrato de `useSarakStatsData`: com `data`, nunca
// busca por `endpoint` — o consumidor que já tem o dado (cache, SSR, outra
// chamada) não precisa fingir um endpoint.
describe('useCardGridState', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('com `data`, renderiza o dado pronto e NÃO chama a rede', () => {
        const dado = [{ id: 1, nome: 'A' }];
        const { result } = renderHook(() => useCardGridState('/api/test', dado));

        expect(result.current.data).toEqual(dado);
        expect(result.current.loading).toBe(false);
        expect(api.get).not.toHaveBeenCalled();
    });

    it('sem `data`, busca por `endpoint` — comportamento de hoje', async () => {
        (api.get as unknown as { mockResolvedValueOnce: (val: unknown) => void }).mockResolvedValueOnce({ data: { items: [{ id: 1, nome: 'A' }] } });
        const { result } = renderHook(() => useCardGridState('/api/test'));

        expect(result.current.loading).toBe(true);

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(api.get).toHaveBeenCalledWith('/api/test');
        expect(result.current.data).toEqual([{ id: 1, nome: 'A' }]);
        expect(result.current.loading).toBe(false);
    });

    it('sem `data` e sem `endpoint`, não busca nem trava em loading', () => {
        const { result } = renderHook(() => useCardGridState());

        expect(api.get).not.toHaveBeenCalled();
        expect(result.current.data).toEqual([]);
        expect(result.current.loading).toBe(false);
    });
});
