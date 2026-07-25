/**
 * resolveResponsiveValue (Spec 40.3 — L2)
 *
 * Ponte entre o `ResponsiveValue<T>` (valor por breakpoint `mob`/`tab`/`desk`, Spec 16)
 * e o dispositivo ATIVO (`useSarakDevice`, `'smartphone'|'tablet'|'desktop'`). É a função
 * PURA que as primitivas de layout usam para aceitar `ResponsiveValue` sem duplicar a
 * lógica de seleção — o consumidor passa um valor por dispositivo (controle opcional) e a
 * primitiva resolve o do device atual. Um valor escalar (`T` puro) passa direto (default
 * mobile-first fica por conta de cada primitiva).
 *
 * Testável isoladamente (Regra 3). Não lê contexto React — recebe o `device` já resolvido.
 */

import type { ResponsiveValue } from './types';

/** Dispositivo ativo — espelha `DeviceType` de `DeviceProvider` sem criar dependência de runtime. */
export type ResponsiveDevice = 'smartphone' | 'tablet' | 'desktop';

/** Chave do `ResponsiveValue` correspondente a cada dispositivo (cascata mobile-first). */
const DEVICE_KEY: Record<ResponsiveDevice, keyof ResponsiveValue<unknown>> = {
    smartphone: 'mob',
    tablet: 'tab',
    desktop: 'desk',
};

/** True se `value` é um `ResponsiveValue<T>` (tem as três camadas `mob`/`tab`/`desk`). */
export const isResponsiveValue = <T>(value: unknown): value is ResponsiveValue<T> =>
    typeof value === 'object' && value !== null && 'mob' in value && 'tab' in value && 'desk' in value;

/**
 * Resolve `value` contra o dispositivo ativo. `ResponsiveValue<T>` → a camada do device;
 * `T` escalar → ele mesmo. Nunca lança; um objeto sem as três camadas não é `ResponsiveValue`.
 */
export const resolveResponsiveValue = <T>(
    value: T | ResponsiveValue<T>,
    device: ResponsiveDevice,
): T => (isResponsiveValue<T>(value) ? value[DEVICE_KEY[device]] : (value as T));
