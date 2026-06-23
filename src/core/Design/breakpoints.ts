/**
 * Breakpoints canônicos (Spec 16, Regra 1 e 4).
 *
 * Fonte ÚNICA dos limiares de responsividade, consumida tanto pelo gerador de
 * media-queries (`useDesignVariables`) quanto pelo detector JS de dispositivo
 * (`DeviceProvider`) — garantindo que CSS e JS nunca divirjam sobre o que é
 * "tablet/desktop". Refletidos na Paridade 1:1:1:1:1 pelos tokens
 * `breakpointTablet` / `breakpointDesktop` (schema `structural`); estes números
 * são os `defaultValue`/`legacyValue` desses tokens.
 *
 * Nota: `@media` não aceita `var(--...)` na condição, logo o valor numérico é
 * interpolado no JS na geração da media-query (não como variável CSS).
 */

/** Largura mínima (px) a partir da qual o layout é tratado como tablet. */
export const BREAKPOINT_TABLET = 768;

/** Largura mínima (px) a partir da qual o layout é tratado como desktop. */
export const BREAKPOINT_DESKTOP = 1024;
