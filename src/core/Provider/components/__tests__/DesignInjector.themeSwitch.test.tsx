import React from 'react';
import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DesignInjector } from '../DesignInjector';
import * as useDesignVariablesHook from '../../../Design/hooks/useDesignVariables';
import { SARAK_THEME_SWITCHING_ATTRIBUTE, THEME_SWITCH_MIN_CHANGED_VARIABLES } from '../../utils/themeSwitchMark';

vi.mock('../../../Design/hooks/useDesignVariables', () => ({
    useDesignVariables: vi.fn(),
}));

const BLOCK = THEME_SWITCH_MIN_CHANGED_VARIABLES + 50;
/** `changed` variáveis com `value`, as outras `BLOCK - changed` em `base`. */
const variablesWith = (changed: number, value: string): Record<string, string> =>
    Object.fromEntries(Array.from({ length: BLOCK }, (_, index) => [`--v${index}`, index < changed ? value : 'base']));

const useVariables = (variables: Record<string, string>) =>
    (useDesignVariablesHook.useDesignVariables as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        variables, attributes: {}, responsiveCSS: '',
    });

const mark = (element: Element) => element.getAttribute(SARAK_THEME_SWITCHING_ATTRIBUTE);

describe('DesignInjector — marca de troca de tema', () => {
    beforeEach(() => {
        vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] });
        document.documentElement.removeAttribute(SARAK_THEME_SWITCHING_ATTRIBUTE);
        document.documentElement.style.cssText = '';
        document.body.style.cssText = '';
        document.body.className = '';
    });
    afterEach(() => {
        vi.useRealTimers();
        document.body.innerHTML = '';
    });

    it('a primeira pintura não é troca', () => {
        useVariables(variablesWith(BLOCK, 'a'));
        render(<DesignInjector design={{ mode: 'dark' }} isDrafting={false} />);
        expect(mark(document.documentElement)).toBeNull();
    });

    it('um tema que reescreve variáveis em bloco marca a raiz no mesmo commit e a tira dois quadros depois', () => {
        useVariables(variablesWith(0, 'a'));
        const { rerender } = render(<DesignInjector design={{ mode: 'dark' }} isDrafting={false} />);

        useVariables(variablesWith(BLOCK, 'b'));
        rerender(<DesignInjector design={{ mode: 'dark', primaryColor: '#111111' }} isDrafting={false} />);

        // A marca e as variáveis novas chegam juntas: o primeiro recálculo já vê a transição desligada.
        expect(mark(document.documentElement)).toBe('true');
        expect(document.documentElement.style.getPropertyValue('--v0')).toBe('b');

        vi.advanceTimersToNextFrame();
        expect(mark(document.documentElement)).toBe('true');
        vi.advanceTimersToNextFrame();
        expect(mark(document.documentElement)).toBeNull();
        expect(document.documentElement.style.getPropertyValue('--v0')).toBe('b');
    });

    it('trocar o modo, que reescreve as cores em bloco, também marca', () => {
        useVariables(variablesWith(0, 'a'));
        const { rerender } = render(<DesignInjector design={{ mode: 'dark' }} isDrafting={false} />);

        useVariables(variablesWith(BLOCK, 'claro'));
        rerender(<DesignInjector design={{ mode: 'light' }} isDrafting={false} />);

        expect(mark(document.documentElement)).toBe('true');
    });

    it('ajustar um token só (arrastar um slider) não aciona a marca', () => {
        useVariables(variablesWith(0, 'a'));
        const { rerender } = render(<DesignInjector design={{ mode: 'dark' }} isDrafting={false} />);

        for (let step = 1; step <= 5; step += 1) {
            useVariables(variablesWith(3, `passo-${step}`));
            rerender(<DesignInjector design={{ mode: 'dark', cardBorderRadius: step }} isDrafting={false} />);
            expect(mark(document.documentElement)).toBeNull();
        }
        expect(document.documentElement.style.getPropertyValue('--v0')).toBe('passo-5');
    });

    it('uma segunda troca antes da primeira assentar reinicia a contagem dos quadros', () => {
        useVariables(variablesWith(0, 'a'));
        const { rerender } = render(<DesignInjector design={{ mode: 'dark' }} isDrafting={false} />);

        useVariables(variablesWith(BLOCK, 'b'));
        rerender(<DesignInjector design={{ mode: 'dark', primaryColor: '#111111' }} isDrafting={false} />);
        vi.advanceTimersToNextFrame();

        useVariables(variablesWith(0, 'c'));
        rerender(<DesignInjector design={{ mode: 'dark', primaryColor: '#222222' }} isDrafting={false} />);
        vi.advanceTimersToNextFrame();
        expect(mark(document.documentElement)).toBe('true');
        vi.advanceTimersToNextFrame();
        expect(mark(document.documentElement)).toBeNull();
    });

    it('desmontar no meio da troca tira a marca', () => {
        useVariables(variablesWith(0, 'a'));
        const { rerender, unmount } = render(<DesignInjector design={{ mode: 'dark' }} isDrafting={false} />);
        useVariables(variablesWith(BLOCK, 'b'));
        rerender(<DesignInjector design={{ mode: 'dark', primaryColor: '#111111' }} isDrafting={false} />);
        expect(mark(document.documentElement)).toBe('true');

        unmount();
        expect(mark(document.documentElement)).toBeNull();
    });

    it('no Modo Embarcado marca a ilha e os portais, e nunca o documento do host', () => {
        const island = document.createElement('div');
        island.className = 'sarak-scope';
        const portal = document.createElement('div');
        portal.className = 'sarak-scope';
        document.body.append(island, portal);

        useVariables(variablesWith(0, 'a'));
        const { rerender } = render(<DesignInjector design={{ mode: 'dark' }} isDrafting={false} mode="embedded" scopeElement={island} />);
        useVariables(variablesWith(BLOCK, 'b'));
        rerender(<DesignInjector design={{ mode: 'dark', primaryColor: '#111111' }} isDrafting={false} mode="embedded" scopeElement={island} />);

        expect(mark(island)).toBe('true');
        expect(mark(portal)).toBe('true');
        expect(mark(document.documentElement)).toBeNull();

        vi.advanceTimersToNextFrame();
        vi.advanceTimersToNextFrame();
        expect(mark(island)).toBeNull();
        expect(mark(portal)).toBeNull();
    });
});
