import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    SARAK_THEME_SWITCHING_ATTRIBUTE,
    THEME_SWITCH_MIN_CHANGED_VARIABLES,
    countChangedVariables,
    isThemeSwitch,
    markThemeSwitching,
    themeSwitchHosts,
} from '../themeSwitchMark';

const variablesWith = (count: number, value = 'a'): Record<string, string> =>
    Object.fromEntries(Array.from({ length: count }, (_, index) => [`--v${index}`, value]));

describe('countChangedVariables', () => {
    it('conta valor mudado, variável nova e variável que saiu', () => {
        expect(countChangedVariables({ '--a': '1', '--b': '2', '--c': '3' }, { '--a': '1', '--b': '9', '--d': '4' })).toBe(3);
    });

    it('é zero para variáveis iguais', () => {
        expect(countChangedVariables({ '--a': '1' }, { '--a': '1' })).toBe(0);
    });
});

describe('isThemeSwitch', () => {
    it('a primeira escrita não é troca', () => {
        expect(isThemeSwitch(null, variablesWith(500))).toBe(false);
    });

    it('uma variável a menos que o corte não é troca; no corte é', () => {
        const base = variablesWith(THEME_SWITCH_MIN_CHANGED_VARIABLES + 10);
        const changed = (count: number) => ({ ...base, ...variablesWith(count, 'b') });
        expect(isThemeSwitch(base, changed(THEME_SWITCH_MIN_CHANGED_VARIABLES - 1))).toBe(false);
        expect(isThemeSwitch(base, changed(THEME_SWITCH_MIN_CHANGED_VARIABLES))).toBe(true);
    });

    it('um ajuste de um token (algumas dezenas de variáveis) não é troca', () => {
        const base = variablesWith(900);
        expect(isThemeSwitch(base, { ...base, ...variablesWith(49, 'b') })).toBe(false);
    });
});

describe('markThemeSwitching', () => {
    beforeEach(() => vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] }));
    afterEach(() => vi.useRealTimers());

    it('liga a marca na hora e a tira depois de dois quadros', () => {
        const host = document.createElement('div');
        markThemeSwitching([host], {});
        expect(host.getAttribute(SARAK_THEME_SWITCHING_ATTRIBUTE)).toBe('true');

        vi.advanceTimersToNextFrame();
        expect(host.getAttribute(SARAK_THEME_SWITCHING_ATTRIBUTE)).toBe('true');
        vi.advanceTimersToNextFrame();
        expect(host.hasAttribute(SARAK_THEME_SWITCHING_ATTRIBUTE)).toBe(false);
    });

    it('o cancelamento tira a marca na hora e nenhum quadro a reescreve', () => {
        const host = document.createElement('div');
        const cancel = markThemeSwitching([host], {});
        cancel();
        expect(host.hasAttribute(SARAK_THEME_SWITCHING_ATTRIBUTE)).toBe(false);
        vi.advanceTimersByTime(100);
        expect(host.hasAttribute(SARAK_THEME_SWITCHING_ATTRIBUTE)).toBe(false);
    });
});

describe('themeSwitchHosts', () => {
    afterEach(() => { document.body.innerHTML = ''; });

    it('no Modo App é só a raiz', () => {
        const root = document.documentElement;
        expect(themeSwitchHosts([root, document.body], false)).toEqual([root]);
    });

    it('no Modo Embarcado inclui os portais, que saem da ilha mas levam a classe de escopo', () => {
        const island = document.createElement('div');
        island.className = 'sarak-scope';
        const portal = document.createElement('div');
        portal.className = 'sarak-scope';
        const hostPage = document.createElement('div');
        document.body.append(island, portal, hostPage);

        const hosts = themeSwitchHosts([island], true);
        expect(hosts).toContain(island);
        expect(hosts).toContain(portal);
        expect(hosts).not.toContain(hostPage);
        expect(hosts).toHaveLength(2);
    });
});
