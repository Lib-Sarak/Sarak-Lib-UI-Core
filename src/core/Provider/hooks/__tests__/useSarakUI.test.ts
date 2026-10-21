import { renderHook } from '@testing-library/react';
import { createElement, type PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DesignOverrideContext, UIContext } from '../../context';
import type { SarakUIContextType } from '../../types';
import { useSarakUI, useSarakUIOptional } from '../useSarakUI';

describe('useSarakUI context access', () => {
    it('merges the provider value, design override, and host branding', () => {
        const context = {
            design: { primaryColor: '#111111', systemName: 'Tema' },
            systemDesign: { primaryColor: '#222222' },
            branding: { companyName: 'Host', logoBase64: 'data:image/png;base64,host' },
        } as unknown as SarakUIContextType;
        const wrapper = ({ children }: PropsWithChildren) => createElement(
            UIContext.Provider,
            { value: context },
            createElement(DesignOverrideContext.Provider, { value: { primaryColor: '#333333' } }, children),
        );

        const { result } = renderHook(() => useSarakUI(), { wrapper });

        expect(result.current.systemDesign?.primaryColor).toBe('#222222');
        expect(result.current.design.primaryColor).toBe('#333333');
        expect(result.current.design.systemName).toBe('Host');
        expect(result.current.design.logoUrl).toBe('data:image/png;base64,host');
    });

    it('returns null and logs once when the optional hook has no provider', () => {
        const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const { result } = renderHook(() => useSarakUIOptional());

        expect(result.current).toBeNull();
        expect(warning).toHaveBeenCalledTimes(1);
        warning.mockRestore();
    });

});
