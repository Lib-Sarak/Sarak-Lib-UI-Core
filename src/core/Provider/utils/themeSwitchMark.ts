import { SARAK_SCOPE_CLASS } from '../scope';
import { writeInjectedAttribute } from './injectedWrites';
import type { InjectionOwner } from './injectedOwnership';

/**
 * Marca a raiz do escopo enquanto uma troca de tema (ou de modo) é pintada. A regra de `_motion.css` zera a
 * duração das transições sob ela: sem isso, cada elemento com `transition` recalcula o estilo a cada quadro
 * enquanto a transição dura, e a troca leva segundos numa tela cheia.
 */
export const SARAK_THEME_SWITCHING_ATTRIBUTE = 'data-sarak-theme-switching';

/**
 * A troca de tema ou de modo reescreve centenas de variáveis (um tema do catálogo muda mais de 500); ajustar um
 * token à mão muda poucas, até umas 50 quando a cor deriva as variantes. O corte fica bem entre os dois, de modo
 * que arrastar um slider nunca desliga a transição.
 */
export const THEME_SWITCH_MIN_CHANGED_VARIABLES = 200;

export const countChangedVariables = (
    previous: Record<string, string>,
    next: Record<string, string>,
): number => {
    let changed = 0;
    for (const name of Object.keys(next)) if (previous[name] !== next[name]) changed += 1;
    for (const name of Object.keys(previous)) if (!(name in next)) changed += 1;
    return changed;
};

export const isThemeSwitch = (previous: Record<string, string> | null, next: Record<string, string>): boolean =>
    previous !== null && countChangedVariables(previous, next) >= THEME_SWITCH_MIN_CHANGED_VARIABLES;

/**
 * Onde a marca entra: a raiz do escopo (o `:root` no Modo App, que cobre os portais; a ilha no Embarcado) e,
 * no Embarcado, também os portais, que saem da ilha para o `body` e levam a própria classe de escopo.
 */
export const themeSwitchHosts = (targets: HTMLElement[], isEmbedded: boolean): HTMLElement[] => {
    const hosts = new Set<HTMLElement>([targets[0]]);
    if (isEmbedded) document.querySelectorAll<HTMLElement>(`.${SARAK_SCOPE_CLASS}`).forEach((el) => hosts.add(el));
    return [...hosts];
};

/**
 * Liga a marca e a tira depois de dois quadros (a pintura da troca já aconteceu). Devolve o cancelamento, que
 * tira a marca na hora: chamado antes de uma nova troca ou ao desmontar.
 */
export const markThemeSwitching = (hosts: HTMLElement[], owner: InjectionOwner): (() => void) => {
    if (typeof window === 'undefined' || typeof window.requestAnimationFrame !== 'function') return () => undefined;

    hosts.forEach((host) => writeInjectedAttribute(host, SARAK_THEME_SWITCHING_ATTRIBUTE, 'true', owner));
    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(clear);
    });

    function clear(): void {
        window.cancelAnimationFrame(firstFrame);
        window.cancelAnimationFrame(secondFrame);
        hosts.forEach((host) => writeInjectedAttribute(host, SARAK_THEME_SWITCHING_ATTRIBUTE, null, owner));
    }

    return clear;
};
