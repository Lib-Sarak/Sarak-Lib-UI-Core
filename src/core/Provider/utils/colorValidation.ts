import { isSafeCssString } from './cssSafety';

/**
 * Cores aceitas e seguras para declaração CSS: valores literais, `var()` com reserva, `color-mix()`
 * e palavras-chave seguras. Recusa funções que busquem recursos e escapes que possam reconstruí-las.
 */
const COLOR_PATTERN = /^(#[0-9a-fA-F]{3,8}|rgba?\([0-9.,%\s]+\)|hsla?\([0-9.,%\sa-z]+\)|var\(--[a-zA-Z0-9-]+(\s*,\s*[^;<>{}]*)?\)|color-mix\(\s*in\s+[a-z0-9-]+(\s+[a-z]+(\s+hue)?)?\s*,[a-zA-Z0-9\s%,.#()-]*\)|transparent|currentColor|inherit|none)$/;
const RESOURCE_IN_COLOR = /[\\]|(?:^|[^\w-])(?:-[a-z]+-)?(?:url|image|image-set|cross-fade|element|paint|src)\s*\(/i;

/** Usa a mesma régua de cores em validação de temas e CSS inicial. */
export const isValidColor = (value: unknown): value is string =>
    typeof value === 'string' && isSafeCssString(value) && !RESOURCE_IN_COLOR.test(value) && COLOR_PATTERN.test(value.trim());
