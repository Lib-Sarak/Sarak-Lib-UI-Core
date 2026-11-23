import { computeColorVariants, parseToRgba } from '../../Provider/utils/color-engine';
import { isLiteralColor, MODE_ANCHOR_DARK, MODE_ANCHOR_LIGHT, ON_COLOR_DARK, ON_COLOR_LIGHT, pickOnColor } from '../../Provider/utils/on-color';
import { sarakGetDefaultDesignState } from '../master-map';

/** O fundo do corpo de fábrica do schema (`colorBgBody`): o padrão do tema escuro. */
const DEFAULT_BODY_BG = String(sarakGetDefaultDesignState().colorBgBody);

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

/**
 * Os nomes de variável CSS de cada exceção DECLARADA (o canto de raio): o dono deles é a exceção, e o token
 * mestre — que também os lista em `cssVars` — não os escreve. Sem esta regra o mestre e a exceção disputam a
 * mesma variável por canais diferentes (escalar vai inline, responsivo vai ao `<style>`), e quem vence é o
 * canal, não o que o tema declara. `autoVarOf` devolve a variável automática (`--sarak-<kebab>`) de um id.
 */
export const collectDeclaredExceptionVars = (
    tokens: ReadonlyArray<{ id: string; exceptionOf?: string; defaultValue: unknown; cssVars?: string[] }>,
    design: Record<string, unknown>,
    autoVarOf: (tokenId: string) => string,
): Set<string> => {
    const owned = new Set<string>();
    tokens.forEach((token) => {
        if (!token.exceptionOf || isUndeclaredException(design[token.id], token.defaultValue)) return;
        owned.add(autoVarOf(token.id));
        token.cssVars?.forEach((name) => owned.add(name));
    });
    return owned;
};

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
): void => {
    CHANNEL_SOURCES.forEach(([channel, source]) => {
        const color = variables[source];
        if (!color) return;
        try {
            variables[channel] = computeColorVariants(color, anchorColor).rgb;
        } catch {
            // cor não interpretável (ex.: `var()`): sem canal, vale a reserva do CSS
        }
    });
};

/** Variável de "texto sobre a cor" → a variável da cor sólida sobre a qual ela assenta. */
const ON_COLOR_SOURCES: Record<string, string> = {
    '--theme-on-primary': '--theme-primary',
    '--sarak-on-secondary': '--sarak-secondary-color',
    '--sarak-on-success': '--sarak-status-success-color',
    '--sarak-on-error': '--sarak-status-error-color',
    '--sarak-on-warning': '--sarak-status-warning-color',
    '--sarak-on-info': '--sarak-status-info-color',
    '--sarak-on-chat-user': '--sarak-chat-user-bg',
    '--sarak-on-overlay': '--sarak-modal-overlay',
    '--sarak-on-muted': '--sarak-text-muted',
    // O botão selecionado dos seletores da barra (`ShellFontSizeControl`, `ShellNavigationStyleControl`) usa a cor do item ativo como FUNDO.
    '--sarak-on-nav-active': '--sarak-nav-active-color',
    '--sarak-on-sidebar': '--sarak-sidebar-bg',
    '--sarak-on-topbar': '--sarak-topbar-bg',
};

/**
 * Emite `--sarak-on-surface` (o texto de maior contraste sobre o corpo) e uma `--sarak-on-*` por cor sólida
 * (`ON_COLOR_SOURCES`). Cor que não é literal (`var()`, `color-mix`) não emite: vale a reserva do componente.
 */
export function emitOnColors(variables: Record<string, string>, anchorColor: string): void {
    // O corpo (literal) sustenta a cor translúcida; sem ele, o fundo padrão do modo: o do schema no escuro, a âncora branca no claro.
    const body = variables['--sarak-bg-body'];
    const underColor = isLiteralColor(body) ? body : anchorColor === MODE_ANCHOR_DARK ? DEFAULT_BODY_BG : MODE_ANCHOR_LIGHT;
    variables['--sarak-on-surface'] = pickOnColor(underColor);
    Object.entries(ON_COLOR_SOURCES).forEach(([name, sourceVar]) => {
        const source = variables[sourceVar];
        if (isLiteralColor(source)) variables[name] = pickOnColor(source, underColor);
    });
}

/**
 * A cor de título (`--color-theme-title`) é do token `titleColor` — `textColorMaster` é o texto corrido. O padrão do token é
 * o do tema ESCURO: no modo claro, enquanto o tema não o declarou, o título segue o texto principal. Sem nada declarado, o
 * escuro cai no padrão do token e o claro, na tinta escura do motor.
 */
export const resolveTitleColor = (variables: Record<string, string>, isDark: boolean, tokenDefault: unknown): string => {
    const declared = variables['--sarak-title-color'];
    const isDefault = declared === String(tokenDefault);
    if (declared && (isDark || !isDefault)) return declared;
    return variables['--text-main'] || declared || (isDark ? String(tokenDefault ?? ON_COLOR_LIGHT) : ON_COLOR_DARK);
};

const NEON_EDGE_LIGHT_ALPHA = 0.4;

/**
 * Emite `--sarak-surface-tint-color` (a cor que tinge a superfície grande: o degradê de fundo) e `--sarak-surface-neon-color` (a do
 * contorno e do brilho neon do cartão). No escuro a primária exata é escura demais sobre o fundo e a tinta some; ali as duas usam o tom
 * que o texto da primária já usa (`--sarak-nav-active-color`). No claro a tinta é a própria primária e o neon, a primária a 40%, como
 * sempre foi. A 40% só sai quando a primária é literal (um `var()` não se decompõe em canais).
 */
export function emitSurfaceTint(variables: Record<string, string>, isDark: boolean): void {
    const primary = variables['--theme-primary'] || variables['--primary-color'];
    const tint = (isDark && variables['--sarak-nav-active-color']) || primary;
    if (!tint) return;
    variables['--sarak-surface-tint-color'] = tint;
    if (isDark) {
        variables['--sarak-surface-neon-color'] = tint;
        return;
    }
    if (!isLiteralColor(primary)) return;
    const { r, g, b } = parseToRgba(primary);
    variables['--sarak-surface-neon-color'] = `rgba(${r}, ${g}, ${b}, ${NEON_EDGE_LIGHT_ALPHA})`;
}
