import { AtmosphereSchema } from '../../Design/schema/atmosphere';
import type { SarakThemePayload } from '../types';
import { isValidColor } from './colorValidation';

const DEFAULT_COLOR_SCHEME = 'dark';
const DEFAULT_BODY_COLOR = AtmosphereSchema.tokens.find((token) => token.id === 'colorBgBody')?.defaultValue;

const resolveColorScheme = (mode: unknown): 'light' | 'dark' => mode === 'light' ? 'light' : DEFAULT_COLOR_SCHEME;

/** Gera CSS validado para pintar o tema no HTML inicial, antes do JavaScript. */
export const sarakCreateThemeBootCss = (design: SarakThemePayload): string => {
    const defaultColor = typeof DEFAULT_BODY_COLOR === 'string' ? DEFAULT_BODY_COLOR : 'Canvas';
    const colorBgBody = isValidColor(design.colorBgBody) ? design.colorBgBody : defaultColor;
    const colorScheme = resolveColorScheme(design.mode);

    return [
        'html, body {',
        `    background-color: ${colorBgBody};`,
        '}',
        'html {',
        `    color-scheme: ${colorScheme};`,
        '}',
    ].join('\n');
};
