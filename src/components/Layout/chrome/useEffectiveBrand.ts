import { useContext, useMemo } from 'react';
import { DesignOverrideContext, UIContext } from '../../../core/Provider/context';
import { mergeUIContextValue } from '../../../core/Provider/mergeUIContextValue';

/** Marca exibida no cromo. */
export interface SarakChromeBrand {
    name?: string;
    logoUrl?: string;
}

const pick = (explicit?: string, fallback?: unknown): string | undefined => {
    if (explicit) return explicit;
    return typeof fallback === 'string' && fallback ? fallback : undefined;
};

/**
 * Marca efetiva do cromo, campo a campo: o que o importador passa em `brand` vence; o que faltar (ou vier vazio) cai no
 * `systemName`/`logoUrl` do contexto, que já trazem a marca gravada por cima do design (`mergeUIContextValue`). Sem Provider
 * ou sem nenhum dos dois, a marca fica como veio: nenhum texto de marca é inventado.
 */
export const useEffectiveBrand = (brand?: SarakChromeBrand): SarakChromeBrand | undefined => {
    const context = useContext(UIContext);
    const override = useContext(DesignOverrideContext);
    const merged = context ? mergeUIContextValue(context, override) : null;
    const name = pick(brand?.name, merged?.systemName);
    const logoUrl = pick(brand?.logoUrl, merged?.logoUrl);
    return useMemo(() => (name || logoUrl ? { name, logoUrl } : brand), [name, logoUrl, brand]);
};
