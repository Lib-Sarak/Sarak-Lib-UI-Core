import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useNavigationStyle } from '../useNavigationStyle';
import { UIContext, DesignOverrideContext } from '../SarakUIProvider';
import type { SarakUIContextType } from '../types';

const Probe: React.FC = () => {
    const navigationStyle = useNavigationStyle();
    return <span data-testid="probe">{navigationStyle ?? 'undefined'}</span>;
};

const uiContextValue = (navigationStyle: unknown): SarakUIContextType =>
    ({ design: { navigationStyle } }) as unknown as SarakUIContextType;

describe('useNavigationStyle — fonte única de leitura (Spec 27 §2.1)', () => {
    it('degrada a undefined fora do SarakUIProvider', () => {
        render(<Probe />);
        expect(screen.getByTestId('probe')).toHaveTextContent('undefined');
    });

    it('lê o design PERSISTIDO do UIContext quando não há override', () => {
        render(
            <UIContext.Provider value={uiContextValue('topbar')}>
                <Probe />
            </UIContext.Provider>,
        );
        expect(screen.getByTestId('probe')).toHaveTextContent('topbar');
    });

    it('o draft de override (DesignOverrideContext) tem PRIORIDADE sobre o persistido', () => {
        render(
            <UIContext.Provider value={uiContextValue('sidebar')}>
                <DesignOverrideContext.Provider value={{ navigationStyle: 'topbar' }}>
                    <Probe />
                </DesignOverrideContext.Provider>
            </UIContext.Provider>,
        );
        expect(screen.getByTestId('probe')).toHaveTextContent('topbar');
    });

    it('ignora valor não-string do design (degrada a undefined)', () => {
        render(
            <DesignOverrideContext.Provider value={{ navigationStyle: 42 as unknown as string }}>
                <Probe />
            </DesignOverrideContext.Provider>,
        );
        expect(screen.getByTestId('probe')).toHaveTextContent('undefined');
    });
});
