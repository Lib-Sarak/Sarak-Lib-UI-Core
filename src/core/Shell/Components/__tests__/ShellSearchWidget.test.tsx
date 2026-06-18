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
        const btn = screen.getByRole('button', { name: /Search.../i });
        expect(btn).toBeInTheDocument();
        fireEvent.click(btn);
        expect(onClickMock).toHaveBeenCalled();
    });

    it('renderiza na variante bar e permite busca', () => {
        customRender(<ShellSearchWidget variant="bar" onClick={vi.fn()} />);
        const input = screen.getByPlaceholderText('Smart Search...');
        expect(input).toBeInTheDocument();
        
        fireEvent.change(input, { target: { value: 'Dash' } });
        expect(screen.getByText('Results')).toBeInTheDocument();
        expect(screen.getByText('Dashboard App')).toBeInTheDocument();
    });
});
