import { SarakDesignState } from '../types';

/**
 * Sarak Design Validation (v10.1)
 * Garante que os tokens de design sejam válidos e estejam dentro de faixas seguras.
 * Entrada é JSON cru (localStorage/backend) → `unknown`; a saída é o estado tipado.
 */
export const validateDesign = (design: unknown): SarakDesignState => {
    if (!design) return {} as SarakDesignState;
    const input = design as Record<string, unknown>;
    const s: Record<string, unknown> = {};

    // 1. Integrity Sanitization (Removes Manifest garbage)
    Object.entries(input).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== '') {
            s[k] = v;
        }
    });

    // 1.1 Branding Preservation (Garante que nomes não sejam perdidos)
    if (input.systemName) s.systemName = input.systemName;
    if (input.logoUrl) s.logoUrl = input.logoUrl;
    if (input.logoDarkUrl) s.logoDarkUrl = input.logoDarkUrl;

    const clamp = (val: unknown, min: number, max: number, fallback: number) => {
        const n = parseFloat(val as string);
        if (isNaN(n)) return fallback;
        return Math.min(Math.max(n, min), max);
    };

    // 2. Security Clamping
    s.scaleRatio = clamp(s.scaleRatio, 0.5, 2, 1);
    s.contrastCurve = clamp(s.contrastCurve, 0.5, 2, 1);
    s.glassBlur = clamp(s.glassBlur, 0, 60, 10);
    s.glassOpacity = clamp(s.glassOpacity, 0, 1, 0.7);
    s.borderRadius = clamp(s.borderRadius, 0, 60, 12);

    // 3. Structural Fallbacks (v9.0 Resilience)
    if (!s.navigationStyle) s.navigationStyle = 'sidebar';
    s.sidebarWidth = clamp(s.sidebarWidth, 200, 450, 240);
    s.topbarHeight = clamp(s.topbarHeight, 40, 120, 64);
    if (!s.fontScale) s.fontScale = 'm';
    s.animationSpeed = clamp(s.animationSpeed, 0.01, 2, 0.4);
    s.hapticIntensity = clamp(s.hapticIntensity, 0, 1, 0);


    // 5. Structural Objects Fallbacks (v11.0 Safety)
    if (!s.atmosphere) s.atmosphere = { texture: 'dots', noise: 0.05, opacity: 0.1, spotlight: true };
    if (!s.specialized) s.specialized = { chatBubbleStyle: 'glass', flowGridStyle: 'dots', chartType: 'line' };

    s.schema_version = "11.0"; // Upgrade to v11.0 (Structured Design Engine)

    // Seam cast (Spec 65): o acumulador dinâmico vira o estado tipado na fronteira.
    return s as unknown as SarakDesignState;
};
