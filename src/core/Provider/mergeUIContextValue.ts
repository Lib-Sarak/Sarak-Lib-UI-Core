import type { SarakUIContextType, SarakThemePayload } from './types';

/**
 * Funde o contexto bruto com o override de rascunho e a marca — regra única
 * para as duas portas públicas (`useSarakUI`/`useSarakUIOptional`).
 * `context.design` já chega como o design EFETIVO (tema + preferências
 * oferecidas sobrepostas — ver `effectiveDesign` no corpo do
 * `SarakUIProvider`); `context.systemDesign` é o persistido puro, sem
 * preferência nenhuma, e é o que o painel de tema lê e grava.
 */
type MergedUIContext = SarakUIContextType & SarakThemePayload;

/** A chave do "sem override" no cache: `WeakMap` só aceita objeto como chave. */
const NO_OVERRIDE = {};
/**
 * O mesmo par contexto + override devolve o mesmo objeto. Cada consumidor (centenas numa tela com o painel) chamava esta
 * fusão a cada render, copiando o design inteiro duas vezes; o resultado só muda quando um dos dois objetos muda.
 */
const MERGE_CACHE = new WeakMap<SarakUIContextType, WeakMap<object, MergedUIContext>>();

export const mergeUIContextValue = (
    context: SarakUIContextType,
    overrideDesign: Partial<SarakThemePayload> | null,
): MergedUIContext => {
    const byOverride = MERGE_CACHE.get(context) ?? new WeakMap<object, MergedUIContext>();
    MERGE_CACHE.set(context, byOverride);
    const overrideKey = overrideDesign ?? NO_OVERRIDE;
    const cached = byOverride.get(overrideKey);
    if (cached) return cached;
    const merged = mergeOnce(context, overrideDesign);
    byOverride.set(overrideKey, merged);
    return merged;
};

const mergeOnce = (
    context: SarakUIContextType,
    overrideDesign: Partial<SarakThemePayload> | null,
): MergedUIContext => {
    const systemDesign = context.systemDesign || {};
    const activeDesign = overrideDesign || context.design || {};
    const activeDesignWithBranding = {
        ...activeDesign,
        systemName: context.branding?.companyName || activeDesign.systemName,
        logoUrl: context.branding?.logoBase64 || activeDesign.logoUrl,
    };
    return { ...context, systemDesign, activeDesign: activeDesignWithBranding, design: activeDesignWithBranding, ...activeDesignWithBranding };
};
