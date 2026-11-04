import React from 'react';
import { act, render, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useThemeSwitchFlag } from '../useThemeSwitchFlag';
import { SarakDesignScope } from '../../components/DesignScope';
import { SARAK_THEME_SWITCHING_ATTRIBUTE, THEME_SWITCH_MIN_CHANGED_VARIABLES } from '../../../Provider/utils/themeSwitchMark';
import { composeThemeForMode } from '../../presets/themes/compose';
import { sarakSovereignTheme } from '../../presets/themes/sarak-sovereign';
import { cyberpunkneonTheme } from '../../presets/themes/cyberpunk-neon';
import { sarakGetDefaultDesignState } from '../../master-map';
import type { SarakDesignState } from '../../../Provider/types';

const BLOCK = THEME_SWITCH_MIN_CHANGED_VARIABLES + 50;
/** `BLOCK` variáveis em `a`; as `changed` primeiras trocam para `value`. */
const variablesWith = (value: string, changed = BLOCK): Record<string, string> =>
    Object.fromEntries(Array.from({ length: BLOCK }, (_, index) => [`--v${index}`, index < changed ? value : 'a']));

const completeTheme = (theme: typeof sarakSovereignTheme, mode: 'dark' | 'light'): SarakDesignState =>
    ({ ...sarakGetDefaultDesignState(), ...composeThemeForMode(theme as never, mode) }) as SarakDesignState;

describe('useThemeSwitchFlag', () => {
    beforeEach(() => vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] }));
    afterEach(() => vi.useRealTimers());

    it('é falso na primeira leitura e verdadeiro no render em que o bloco muda, até dois quadros depois', () => {
        const { result, rerender } = renderHook(({ variables }) => useThemeSwitchFlag(variables), {
            initialProps: { variables: variablesWith('a', 0) },
        });
        expect(result.current).toBe(false);

        rerender({ variables: variablesWith('b') });
        expect(result.current).toBe(true);

        act(() => { vi.advanceTimersToNextFrame(); });
        expect(result.current).toBe(true);
        act(() => { vi.advanceTimersToNextFrame(); });
        expect(result.current).toBe(false);
    });

    it('um ajuste pequeno não liga', () => {
        const { result, rerender } = renderHook(({ variables }) => useThemeSwitchFlag(variables), {
            initialProps: { variables: variablesWith('a', 0) },
        });
        rerender({ variables: variablesWith('b', 5) });
        expect(result.current).toBe(false);
    });
});

describe('SarakDesignScope — marca de troca', () => {
    beforeEach(() => vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] }));
    afterEach(() => vi.useRealTimers());

    it('o escopo da prévia leva a marca ao trocar de tema e a perde depois de dois quadros', () => {
        const { container, rerender } = render(
            <SarakDesignScope design={completeTheme(sarakSovereignTheme, 'dark')}>x</SarakDesignScope>,
        );
        const scope = container.querySelector('.sarak-design-scope') as HTMLElement;
        expect(scope.hasAttribute(SARAK_THEME_SWITCHING_ATTRIBUTE)).toBe(false);

        rerender(<SarakDesignScope design={completeTheme(cyberpunkneonTheme, 'dark')}>x</SarakDesignScope>);
        expect(scope.getAttribute(SARAK_THEME_SWITCHING_ATTRIBUTE)).toBe('true');

        act(() => { vi.advanceTimersToNextFrame(); });
        act(() => { vi.advanceTimersToNextFrame(); });
        expect(scope.hasAttribute(SARAK_THEME_SWITCHING_ATTRIBUTE)).toBe(false);
    });

    it('um ajuste de um token só no escopo não leva a marca', () => {
        const base = completeTheme(sarakSovereignTheme, 'dark');
        const { container, rerender } = render(<SarakDesignScope design={base}>x</SarakDesignScope>);
        rerender(<SarakDesignScope design={{ ...base, primaryColor: '#112244' }}>x</SarakDesignScope>);
        const scope = container.querySelector('.sarak-design-scope') as HTMLElement;
        expect(scope.hasAttribute(SARAK_THEME_SWITCHING_ATTRIBUTE)).toBe(false);
    });
});
