/**
 * Sarak Design Validation (v10.1)
 * Garante que os tokens de design sejam válidos e estejam dentro de faixas seguras.
 */
export const validateDesign = (design: any) => {
    if (!design) return {};
    const s: any = {};

    // 1. Integrity Sanitization (Removes Manifest garbage)
    Object.entries(design).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== '' && typeof v !== 'object') {
            s[k] = v;
        } else if (typeof v === 'object' && v !== null) {
            s[k] = v; // Mantém objetos (como arrays de cores ou tokens complexos)
        }
    });

    const clamp = (val: any, min: number, max: number, fallback: number) => {
        const n = parseFloat(val);
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
    if (!s.sidebarWidth) s.sidebarWidth = 240;

    // 4. Multi-Tone Fallbacks
    if (s.colorDepth === undefined) s.colorDepth = 1;
    if (s.colorVariation === undefined) s.colorVariation = 1;

    s.schema_version = "10.1"; // Upgrade to v10.1 (Modular)

    return s;
};
