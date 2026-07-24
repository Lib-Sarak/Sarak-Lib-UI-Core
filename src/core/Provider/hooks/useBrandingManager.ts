import { useState, useCallback, useRef } from 'react';
import { SarakUIOptions, SarakBrandingState } from '../types';

/** @deprecated use `SarakBrandingState` (types.ts) — mantido para compatibilidade de import. */
export type BrandingState = SarakBrandingState;

const DEFAULT_BRANDING: SarakBrandingState = {
    companyName: 'Sarak OS',
    loginName: 'Acesso ao Sistema',
    tabName: 'Sarak OS',
    logoBase64: null
};

/**
 * useBrandingManager (Spec 44 — sem backend próprio).
 *
 * A lib não faz fetch para nenhum servidor: `options.branding.initial` semeia o
 * estado e `options.branding.onChange` é a porta "traga sua persistência" — só
 * dispara se o CONSUMIDOR passar o callback, para o backend dele.
 */
export function useBrandingManager(options: SarakUIOptions) {
    const brandingRef = useRef<SarakBrandingState>({ ...DEFAULT_BRANDING, ...options?.branding?.initial });
    const [branding, setBranding] = useState<SarakBrandingState>(brandingRef.current);

    const updateBranding = useCallback(async (partial: Partial<SarakBrandingState>) => {
        const next = { ...brandingRef.current, ...partial };
        brandingRef.current = next;
        setBranding(next);

        try {
            await options?.branding?.onChange?.(next);
        } catch (err) {
            console.error('[Sarak-UI-Core] onChange de branding falhou', err);
        }
    }, [options?.branding]);

    return {
        branding,
        updateBranding,
        isBrandingLoaded: true
    };
}
