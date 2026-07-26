import { useState, useCallback, useRef } from 'react';
import { SarakUIOptions, SarakBrandingState } from '../types';

/** @deprecated use `SarakBrandingState` (types.ts) — mantido para compatibilidade de import. */
export type BrandingState = SarakBrandingState;

/**
 * Defaults NEUTROS (Spec 47 — soberania de identidade do host).
 *
 * A identidade da página (nome da aba, marca, ícone) é SEMPRE do importador. Por
 * isso `tabName`/`companyName`/`logoBase64` nascem sem valor: os guards a jusante
 * (`if (branding?.tabName)`, `if (branding?.logoBase64)`) então NÃO escrevem nada e
 * o `<title>`/favicon do `index.html` do host sobrevivem à montagem do Provider.
 * Antes daqui saía `'Sarak OS'`, que vazava a marca da LIB para dentro do produto
 * do consumidor — na aba e no rótulo do cromo (via `useSarakUI().systemName`).
 *
 * `loginName` é rótulo de UI, não identidade: mantém default genérico (não é marca).
 */
const DEFAULT_BRANDING: SarakBrandingState = {
    loginName: 'Acesso ao Sistema',
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
