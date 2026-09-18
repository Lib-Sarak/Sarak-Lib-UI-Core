import type { CSSProperties } from 'react';

/**
 * Textura de ruído/grão compartilhada pelo overlay de `sidebarNoiseOpacity`/
 * `topbarNoiseOpacity` (Spec 05 §2.4) — mesmo SVG de `src/effects/NoiseOverlay.tsx`
 * (o overlay GLOBAL do Provider), sem o `position: fixed` nem o `z-index` daquele
 * componente: aqui a camada é escopada à própria barra (sidebar/topbar), nos dois
 * cromos (`SarakShell` e `SarakAppChrome`).
 */
const NOISE_TEXTURE_URL =
    "data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

/** Estilo do overlay: opacidade pelo token (`opacityCssVar`), textura fixa. */
export const chromeNoiseLayerStyle = (opacityCssVar: string): CSSProperties => ({
    opacity: `var(${opacityCssVar}, 0)`,
    backgroundImage: `url("${NOISE_TEXTURE_URL}")`,
    backgroundSize: '200px 200px',
    backgroundRepeat: 'repeat',
});
