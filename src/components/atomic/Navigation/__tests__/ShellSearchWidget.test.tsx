import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { ShellSearchWidget } from '../ShellSearchWidget';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

const customRender = (ui: React.ReactElement) => {
    return render(<SarakUIProvider>{ui}</SarakUIProvider>);
};

// Mock getRegisteredModules
vi.mock('../../../../core/Discovery/registry', () => ({
    getRegisteredModules: vi.fn(() => [
        { id: 'app1', label: 'Dashboard App', category: 'Core' }
    ]),
    registerLocalComponent: vi.fn(),
    unregisterLocalComponent: vi.fn(),
    registerSarakModule: vi.fn(),
    subscribeToRegistry: vi.fn(() => () => {})
}));

describe('ShellSearchWidget', () => {
    it('renderiza na variante icon e chama onClick', () => {
        const onClickMock = vi.fn();
        customRender(<ShellSearchWidget variant="icon" onClick={onClickMock} />);
        const btn = screen.getByRole('button', { name: /Buscar…/i });
        expect(btn).toBeInTheDocument();
        fireEvent.click(btn);
        expect(onClickMock).toHaveBeenCalled();
    });

    it('renderiza na variante bar e permite busca', () => {
        customRender(<ShellSearchWidget variant="bar" onClick={vi.fn()} />);
        const input = screen.getByPlaceholderText('Busca inteligente…');
        expect(input).toBeInTheDocument();

        fireEvent.change(input, { target: { value: 'Dash' } });
        expect(screen.getByText('Resultados')).toBeInTheDocument();
        expect(screen.getByText('Dashboard App')).toBeInTheDocument();
    });
});

// os textos da própria lib seguem o idioma que vale.
describe('ShellSearchWidget — idioma que vale', () => {
    it('sai em inglês com `config.language: "en"`', () => {
        render(
            <SarakUIProvider config={{ language: 'en' }}>
                <ShellSearchWidget variant="bar" onClick={vi.fn()} />
            </SarakUIProvider>,
        );
        expect(screen.getByPlaceholderText('Smart search…')).toBeInTheDocument();
    });

    it('sem Provider, a variante icon sai em português (R34)', () => {
        render(<ShellSearchWidget variant="icon" onClick={vi.fn()} />);
        expect(screen.getByRole('button', { name: /Buscar…/i })).toBeInTheDocument();
    });
});
