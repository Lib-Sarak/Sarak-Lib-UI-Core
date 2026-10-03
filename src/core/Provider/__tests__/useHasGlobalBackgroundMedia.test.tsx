import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useHasGlobalBackgroundMedia } from '../useHasGlobalBackgroundMedia';
import { UIContext, DesignOverrideContext } from '../SarakUIProvider';
import type { SarakUIContextType } from '../types';

const Probe: React.FC = () => {
    const hasGlobalBackground = useHasGlobalBackgroundMedia();
    return <span data-testid="probe">{String(hasGlobalBackground)}</span>;
};

const uiContextValue = (globalBackgroundImageUrl: unknown): SarakUIContextType =>
    ({ design: { globalBackgroundImageUrl } }) as unknown as SarakUIContextType;

describe('useHasGlobalBackgroundMedia — fonte única de leitura (specs/specs/05-cromo-e-slots.md §3)', () => {
    it('degrada a false fora do SarakUIProvider', () => {
        render(<Probe />);
        expect(screen.getByTestId('probe')).toHaveTextContent('false');
    });

    it('false quando globalBackgroundImageUrl está vazio (default do schema)', () => {
        render(
            <UIContext.Provider value={uiContextValue('')}>
                <Probe />
            </UIContext.Provider>,
        );
        expect(screen.getByTestId('probe')).toHaveTextContent('false');
    });

    it('true quando o design PERSISTIDO do UIContext tem a URL preenchida', () => {
        render(
            <UIContext.Provider value={uiContextValue('https://exemplo.com/bg.png')}>
                <Probe />
            </UIContext.Provider>,
        );
        expect(screen.getByTestId('probe')).toHaveTextContent('true');
    });

    it('o draft de override (DesignOverrideContext) tem PRIORIDADE sobre o persistido', () => {
        render(
            <UIContext.Provider value={uiContextValue('https://exemplo.com/bg.png')}>
                <DesignOverrideContext.Provider value={{ globalBackgroundImageUrl: '' }}>
                    <Probe />
                </DesignOverrideContext.Provider>
            </UIContext.Provider>,
        );
        expect(screen.getByTestId('probe')).toHaveTextContent('false');
    });
});
