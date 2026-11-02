// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { usePendingBranding } from '../usePendingBranding';

const setup = (companyName = 'Host') => {
    const updateBranding = vi.fn().mockResolvedValue(undefined);
    const hook = renderHook(() => usePendingBranding({
        branding: { companyName, loginName: 'Login', logoBase64: null },
        updateBranding,
        dirtyLabel: 'Identidade da empresa',
    }));
    return { updateBranding, ...hook };
};

describe('usePendingBranding', () => {
    it('guarda o pedido sem entregá-lo ao Provider e o conta como mudança do rascunho', () => {
        const { result, updateBranding } = setup();

        act(() => result.current.setPending({ companyName: 'Acme', logoBase64: null }));

        expect(result.current.isDirty).toBe(true);
        expect(result.current.dirtyToken).toMatchObject({ id: 'branding', label: 'Identidade da empresa', applied: 'Host', draft: 'Acme' });
        expect(updateBranding).not.toHaveBeenCalled();
    });

    it('só o commit (o "Aplicar") entrega nome e logo ao Provider, e esvazia o pedido', () => {
        const { result, updateBranding } = setup();
        act(() => result.current.setPending({ companyName: 'Acme', logoBase64: 'data:image/png;base64,AAAA' }));

        act(() => result.current.commit());

        expect(updateBranding).toHaveBeenCalledWith({ companyName: 'Acme', logoBase64: 'data:image/png;base64,AAAA' });
        expect(result.current.pending).toBeNull();
        expect(result.current.dirtyToken).toBeNull();
    });

    it('descartar esquece o pedido sem gravar nada', () => {
        const { result, updateBranding } = setup();
        act(() => result.current.setPending({ companyName: 'Acme', logoBase64: null }));

        act(() => result.current.clear());

        expect(result.current.pending).toBeNull();
        expect(updateBranding).not.toHaveBeenCalled();
    });

    it('um pedido igual ao que o host já tem não é mudança e não grava', () => {
        const { result, updateBranding } = setup('Acme');
        act(() => result.current.setPending({ companyName: 'Acme', logoBase64: null }));

        expect(result.current.isDirty).toBe(false);
        act(() => result.current.commit());

        expect(updateBranding).not.toHaveBeenCalled();
    });
});
