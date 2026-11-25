import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBrandingManager } from '../useBrandingManager';
import type { SarakBrandingState, SarakUIOptions } from '../../types';

const options = (tenantId: string, initial: Partial<SarakBrandingState>, onChange?: () => void): SarakUIOptions => ({
    persistence: { tenantId },
    branding: { initial, onChange },
});

describe('useBrandingManager — marca por organização', () => {
    it('semeia a marca de options.branding.initial', () => {
        const { result } = renderHook(() => useBrandingManager(options('a', { companyName: 'Empresa A' })));
        expect(result.current.branding.companyName).toBe('Empresa A');
    });

    it('troca de tenantId semeia a marca nova, some com a antiga e não chama onChange', () => {
        const onChange = vi.fn();
        const { result, rerender } = renderHook(({ o }) => useBrandingManager(o), {
            initialProps: { o: options('a', { companyName: 'Empresa A' }, onChange) },
        });
        rerender({ o: options('b', { tabName: 'Aba B' }, onChange) });
        expect(result.current.branding.tabName).toBe('Aba B');
        expect(result.current.branding.companyName).toBeUndefined();
        expect(onChange).not.toHaveBeenCalled();
    });

    it('mesmo tenantId com initial novo preserva a edição do usuário', async () => {
        const { result, rerender } = renderHook(({ o }) => useBrandingManager(o), {
            initialProps: { o: options('a', { companyName: 'Empresa A' }) },
        });
        await act(async () => { await result.current.updateBranding({ companyName: 'Editada' }); });
        rerender({ o: options('a', { companyName: 'Outra' }) });
        expect(result.current.branding.companyName).toBe('Editada');
    });

    it('updateBranding continua chamando onChange', async () => {
        const onChange = vi.fn();
        const { result } = renderHook(() => useBrandingManager(options('a', {}, onChange)));
        await act(async () => { await result.current.updateBranding({ companyName: 'X' }); });
        expect(onChange).toHaveBeenCalledTimes(1);
    });
});
