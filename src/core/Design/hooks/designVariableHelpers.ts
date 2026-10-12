import { computeColorVariants } from '../../Provider/utils/color-engine';

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
