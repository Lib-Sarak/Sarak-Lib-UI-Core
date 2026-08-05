import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AdvancedTab } from '../AdvancedTab';
import { DEFAULT_STORAGE_KEY, LANGUAGE_STORAGE_KEY } from '../../../../core/Provider/constants';

vi.mock('../../../../core/Provider/SarakUIProvider', () => ({
    useSarakUI: vi.fn(() => ({
        systemId: 'TEST-SYSTEM',
        isHydrated: true,
        registeredModules: [],
        options: { persistence: { storageKey: 'sarak-ui-design-do-host' } },
        applyConfig: vi.fn()
    }))
}));

vi.mock('../../../../core/Discovery/registry', () => ({
    getRegisteredModules: vi.fn(() => [])
}));

describe('AdvancedTab', () => {
    it('matches baseline snapshot', () => {
        const { asFragment } = render(<AdvancedTab />);
        expect(asFragment()).toMatchSnapshot();
    });
});

/**
 * plan-08 F1: o "Factory Hard Reset" apagava a origem INTEIRA do consumidor
 * (`localStorage.clear()`). O critério do conserto é este: dado alheio sobrevive.
 */
describe('AdvancedTab — Factory Hard Reset (F1)', () => {
    const reload = vi.fn();

    beforeEach(() => {
        vi.useFakeTimers();
        localStorage.clear();
        reload.mockClear();
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: { ...window.location, reload }
        });
    });

    afterEach(() => vi.useRealTimers());

    const dispararReset = () => {
        render(<AdvancedTab />);
        fireEvent.click(screen.getByText('Restaurar Padrões'));
        act(() => { vi.runAllTimers(); });
    };

    it('CRITÉRIO: a chave alheia SOBREVIVE ao reset', () => {
        vi.spyOn(window, 'confirm').mockReturnValue(true);
        localStorage.setItem('token-de-sessao-do-host', 'abc123');
        localStorage.setItem('sarak-ui-design-do-host', '{"mode":"light"}');
        localStorage.setItem(LANGUAGE_STORAGE_KEY, 'en');

        dispararReset();

        expect(localStorage.getItem('token-de-sessao-do-host')).toBe('abc123');
        expect(localStorage.getItem('sarak-ui-design-do-host')).toBeNull();
        expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBeNull();
        expect(reload).toHaveBeenCalledTimes(1);
    });

    it('cancelar o confirm() não apaga nada nem recarrega', () => {
        vi.spyOn(window, 'confirm').mockReturnValue(false);
        localStorage.setItem(DEFAULT_STORAGE_KEY, '{}');

        dispararReset();

        expect(localStorage.getItem(DEFAULT_STORAGE_KEY)).toBe('{}');
        expect(reload).not.toHaveBeenCalled();
    });

    it('o texto do confirm() não promete apagar mais do que apaga', () => {
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

        dispararReset();

        const texto = confirmSpy.mock.calls[0][0] as string;
        expect(texto).toContain('tema e idioma');
        expect(texto).toContain('Nenhum outro dado deste site é afetado');
        expect(texto).not.toContain('TODAS');
    });
});
