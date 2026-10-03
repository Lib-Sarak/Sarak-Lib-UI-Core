import type { SarakUIContextType, SarakThemePayload } from './types';

/**
 * Funde o contexto bruto com o override de rascunho e a marca — regra única
 * para as duas portas públicas (`useSarakUI`/`useSarakUIOptional`).
 * `context.design` já chega como o design EFETIVO (tema + preferências
 * oferecidas sobrepostas — ver `effectiveDesign` no corpo do
 * `SarakUIProvider`); `context.systemDesign` é o persistido puro, sem
 * preferência nenhuma, e é o que o painel de tema lê e grava.
 */
export const mergeUIContextValue = (
    context: SarakUIContextType,
    overrideDesign: Partial<SarakThemePayload> | null,
): SarakUIContextType & SarakThemePayload => {
    const systemDesign = context.systemDesign || {};
    const activeDesign = overrideDesign || context.design || {};
    const activeDesignWithBranding = {
        ...activeDesign,
        systemName: context.branding?.companyName || activeDesign.systemName,
        logoUrl: context.branding?.logoBase64 || activeDesign.logoUrl,
    };
    return { ...context, systemDesign, activeDesign: activeDesignWithBranding, design: activeDesignWithBranding, ...activeDesignWithBranding };
};
