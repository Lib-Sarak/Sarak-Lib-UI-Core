import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import { SarakAppChrome } from '../SarakAppChrome';
import SarakUIProvider from '../../../core/Provider/SarakUIProvider';

const NAV = [{ label: 'Propostas', route: '/propostas' }];
const Broken = (): React.ReactElement => { throw new Error('quebrou no conteúdo'); };

describe('SarakAppChrome — onError', () => {
    it('entrega ao host, uma vez, o erro que o cromo contém, e o resto do cromo segue na tela', () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const onError = vi.fn();
        render(
            <SarakAppChrome navigationStyle="sidebar" nav={NAV} onError={onError}>
                <Broken />
            </SarakAppChrome>,
        );

        expect(onError).toHaveBeenCalledTimes(1);
        expect((onError.mock.calls[0][0] as Error).message).toBe('quebrou no conteúdo');
        expect(screen.getByText('Propostas')).toBeInTheDocument();
        spy.mockRestore();
    });

    it('entrega ao host o erro do secondaryContent, e o conteúdo principal segue na tela', () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const onError = vi.fn();
        const BrokenSecondary = (): React.ReactElement => { throw new Error('quebrou no secundário'); };
        render(
            <SarakUIProvider config={{ isSplitViewEnabled: true }}>
                <SarakAppChrome navigationStyle="sidebar" nav={NAV} onError={onError} secondaryContent={<BrokenSecondary />}>
                    <p>conteúdo principal</p>
                </SarakAppChrome>
            </SarakUIProvider>,
        );

        expect(onError).toHaveBeenCalledTimes(1);
        expect((onError.mock.calls[0][0] as Error).message).toBe('quebrou no secundário');
        expect(screen.getByText('conteúdo principal')).toBeInTheDocument();
        spy.mockRestore();
    });
});
