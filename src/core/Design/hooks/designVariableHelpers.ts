import { computeColorVariants } from '../../Provider/utils/color-engine';
import { isLiteralColor, pickOnColor } from '../../Provider/utils/on-color';

/** Mesmo valor de token; o objeto responsivo se compara por ponto (a validação reordena as chaves). */
const isSameTokenValue = (a: unknown, b: unknown): boolean => {
    if (a !== null && b !== null && typeof a === 'object' && typeof b === 'object') {
        const left = a as Record<string, unknown>;
        const right = b as Record<string, unknown>;
        return left.mob === right.mob && left.tab === right.tab && left.desk === right.desk;
    }
    return a === b;
};

/**
 * `true` quando a exceção de um token mestre (canto de raio) não foi declarada: ausente ou igual ao padrão do
 * schema. Nesse caso o mestre, que já escreve as variáveis do canto, é quem chega a ele.
 */
export const isUndeclaredException = (value: unknown, defaultValue: unknown): boolean =>
    value === undefined || isSameTokenValue(value, defaultValue);

/** Variável de canal `r, g, b` → a variável de cor de que ela é o canal. */
const CHANNEL_SOURCES: Array<[string, string]> = [
    ['--sarak-bg-body-rgb', '--sarak-bg-body'],
    ['--sarak-sidebar-bg-rgb', '--sarak-sidebar-bg'],
];

/**
 * Canais `r, g, b` do fundo do corpo e da barra lateral: `_colors.css` os lê (`--bg-body-rgb`,
 * `--bg-sidebar-rgb`) para compor translúcidos. Sem emitir, o canal caía no valor claro da reserva em todo
 * tema escuro.
 */
export const emitColorChannels = (
    variables: Record<string, string>,
    anchorColor: string,
    shape: { depth?: number; variation?: number },
): void => {
    CHANNEL_SOURCES.forEach(([channel, source]) => {
        const color = variables[source];
        if (!color) return;
        try {
            variables[channel] = computeColorVariants(color, anchorColor, shape).rgb;
        } catch {
            // cor não interpretável (ex.: `var()`): sem canal, vale a reserva do CSS
        }
    });
};

/** Variável de "texto sobre a cor" → a variável da cor sólida sobre a qual ela assenta. */
const ON_COLOR_SOURCES: Record<string, string> = {
    '--theme-on-primary': '--theme-primary',
    '--sarak-on-secondary': '--sarak-secondary-color',
    '--sarak-on-accent': '--sarak-accent-color',
    '--sarak-on-success': '--sarak-status-success-color',
    '--sarak-on-error': '--sarak-status-error-color',
    '--sarak-on-warning': '--sarak-status-warning-color',
    '--sarak-on-info': '--sarak-status-info-color',
    '--sarak-on-chat-user': '--sarak-chat-user-bg',
    '--sarak-on-overlay': '--sarak-modal-overlay',
    '--sarak-on-muted': '--sarak-text-muted',
};

/**
 * Emite `--sarak-on-surface` (o texto de maior contraste sobre o corpo) e uma `--sarak-on-*` por cor sólida
 * (`ON_COLOR_SOURCES`). Cor que não é literal (`var()`, `color-mix`) não emite: vale a reserva do componente.
 */
export function emitOnColors(variables: Record<string, string>, anchorColor: string): void {
    // O corpo (literal) sustenta a cor translúcida; sem ele, o fundo padrão do modo (a âncora é preta no escuro).
    const body = variables['--sarak-bg-body'];
    const underColor = isLiteralColor(body) ? body : anchorColor === '#000000' ? '#050505' : '#ffffff';
    variables['--sarak-on-surface'] = pickOnColor(underColor);
    Object.entries(ON_COLOR_SOURCES).forEach(([name, sourceVar]) => {
        const source = variables[sourceVar];
        if (isLiteralColor(source)) variables[name] = pickOnColor(source, underColor);
    });
}
