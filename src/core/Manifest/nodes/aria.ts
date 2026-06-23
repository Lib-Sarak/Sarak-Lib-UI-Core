/**
 * Normalizador da diretiva `aria` (Spec 41 — a11y como dado, Regra 5)
 *
 * Traduz a `AriaDirective` declarada no nó para atributos ARIA reais repassados ao átomo.
 * Aceita três formas de chave, sem `any`:
 *  - atalhos semânticos (`label` → `aria-label`, `describedby` → `aria-describedby`, etc.);
 *  - `role` (papel) repassado como atributo `role` cru;
 *  - chaves já em `aria-*` repassadas tal como vieram.
 * Qualquer outra chave bare vira `aria-<chave>` (ex.: `expanded` → `aria-expanded`).
 */

import type { AriaDirective } from '../types';

/** Atalhos semânticos → atributo ARIA canônico. */
const ARIA_SHORTHAND: Readonly<Record<string, string>> = {
    label: 'aria-label',
    describedby: 'aria-describedby',
    labelledby: 'aria-labelledby',
    description: 'aria-description',
};

const toAttrName = (key: string): string => {
    if (key === 'role' || key.startsWith('aria-')) return key;
    return ARIA_SHORTHAND[key] ?? `aria-${key}`;
};

/**
 * Converte a diretiva `aria` do nó num mapa de atributos prontos para o átomo.
 * Retorna `{}` quando não há diretiva.
 */
export const mapAriaDirective = (
    aria: AriaDirective | undefined,
): Record<string, string | number | boolean> => {
    if (!aria) return {};
    const out: Record<string, string | number | boolean> = {};
    for (const [key, value] of Object.entries(aria)) {
        out[toAttrName(key)] = value;
    }
    return out;
};
