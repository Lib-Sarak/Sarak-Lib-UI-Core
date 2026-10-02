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

import type { SarakResponsiveValue } from './types';

/** Dispositivo ativo — espelha `DeviceType` de `DeviceProvider` sem criar dependência de runtime. */
export type SarakResponsiveDevice = 'smartphone' | 'tablet' | 'desktop';

/** Chave do `ResponsiveValue` correspondente a cada dispositivo (cascata mobile-first). */
const DEVICE_KEY: Record<SarakResponsiveDevice, keyof SarakResponsiveValue<unknown>> = {
    smartphone: 'mob',
    tablet: 'tab',
    desktop: 'desk',
};

/** True se `value` é um `ResponsiveValue<T>` (tem as três camadas `mob`/`tab`/`desk`). */
export const sarakIsResponsiveValue = <T>(value: unknown): value is SarakResponsiveValue<T> =>
    typeof value === 'object' && value !== null && 'mob' in value && 'tab' in value && 'desk' in value;

/**
 * Resolve `value` contra o dispositivo ativo. `ResponsiveValue<T>` → a camada do device;
 * `T` escalar → ele mesmo. Nunca lança; um objeto sem as três camadas não é `ResponsiveValue`.
 */
export const sarakResolveResponsiveValue = <T>(
    value: T | SarakResponsiveValue<T>,
    device: SarakResponsiveDevice,
): T => (sarakIsResponsiveValue<T>(value) ? value[DEVICE_KEY[device]] : (value as T));
