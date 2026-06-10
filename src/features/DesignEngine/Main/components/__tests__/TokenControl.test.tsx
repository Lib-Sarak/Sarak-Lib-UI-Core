import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TokenControl } from '../TokenControl';

vi.mock('../../../components/DesignControls', () => ({
    ColorControl: ({ value, onChange, label }: any) => (
        <div data-testid="color-control">
            <span>{label}</span>
            <input data-testid="color-input" value={value || ''} onChange={(e) => onChange(e.target.value)} />
        </div>
    ),
    SliderControl: ({ value, onChange, label }: any) => (
        <div data-testid="slider-control">
            <span>{label}</span>
            <input data-testid="slider-input" type="number" value={value || 0} onChange={(e) => onChange(Number(e.target.value))} />
        </div>
    ),
    SelectControl: ({ value, onChange, label }: any) => (
        <div data-testid="select-control">
            <span>{label}</span>
            <select data-testid="select-input" value={value || ''} onChange={(e) => onChange(e.target.value)}>
                <option value="val1">Val1</option>
                <option value="val2">Val2</option>
            </select>
        </div>
    ),
    SwitchControl: ({ value, onChange, label }: any) => (
        <div data-testid="switch-control">
            <span>{label}</span>
            <input data-testid="switch-input" type="checkbox" checked={value || false} onChange={(e) => onChange(e.target.checked)} />
        </div>
    ),
    InputControl: ({ value, onChange, label }: any) => (
        <div data-testid="input-control">
            <span>{label}</span>
            <input data-testid="input-input" value={value || ''} onChange={(e) => onChange(e.target.value)} />
        </div>
    ),
    MediaUploaderControl: ({ value, onChange, label }: any) => (
        <div data-testid="media-control">
            <span>{label}</span>
            <button data-testid="media-btn" onClick={() => onChange('new-image.jpg')}>Upload</button>
        </div>
    )
}));

describe('TokenControl', () => {
    const mockOnChange = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('retorna null se o tipo de token não for suportado', () => {
        const { container } = render(
            <TokenControl 
                token={{ type: 'unknown_type', label: 'Unknown' }} 
                value="test" 
                onChange={mockOnChange} 
            />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renderiza o controle correto com base no tipo', () => {
        const { rerender } = render(
            <TokenControl token={{ type: 'color', label: 'Cor' }} value="#000" onChange={mockOnChange} />
        );
        expect(screen.getByTestId('color-control')).toBeInTheDocument();

        rerender(<TokenControl token={{ type: 'slider', label: 'Slider' }} value={10} onChange={mockOnChange} />);
        expect(screen.getByTestId('slider-control')).toBeInTheDocument();

        rerender(<TokenControl token={{ type: 'switch', label: 'Switch' }} value={true} onChange={mockOnChange} />);
        expect(screen.getByTestId('switch-control')).toBeInTheDocument();
    });

    it('repassa a alteração de valor de forma simples se isResponsive for falso', () => {
        render(<TokenControl token={{ type: 'input', label: 'Texto' }} value="old" onChange={mockOnChange} />);
        
        fireEvent.change(screen.getByTestId('input-input'), { target: { value: 'new' } });
        expect(mockOnChange).toHaveBeenCalledWith('new');
    });

    it('manipula valores responsivos corretamente e extrai displayValue pela deviceKey', () => {
        const responsiveToken = { type: 'color', label: 'Cor Resp', isResponsive: true };
        const responsiveValue = { desk: '#fff', tab: '#ccc', mob: '#000' };

        // Testa com previewDevice = 'desktop'
        const { rerender } = render(
            <TokenControl token={responsiveToken} value={responsiveValue} onChange={mockOnChange} previewDevice="desktop" />
        );
        expect(screen.getByTestId('color-input')).toHaveValue('#fff');

        fireEvent.change(screen.getByTestId('color-input'), { target: { value: '#eee' } });
        // Deve atualizar apenas o desk, mantendo o restante
        expect(mockOnChange).toHaveBeenCalledWith({ desk: '#eee', tab: '#ccc', mob: '#000' });

        // Testa com previewDevice = 'smartphone'
        rerender(
            <TokenControl token={responsiveToken} value={responsiveValue} onChange={mockOnChange} previewDevice="smartphone" />
        );
        expect(screen.getByTestId('color-input')).toHaveValue('#000');
    });

    it('faz fallback transformando valor simples em responsivo caso não seja objeto mas isResponsive seja true', () => {
        const responsiveToken = { type: 'number', label: 'Number Resp', isResponsive: true };
        const flatValue = 16; // Ainda não convertido para objeto {desk, tab, mob}

        render(
            <TokenControl token={responsiveToken} value={flatValue} onChange={mockOnChange} previewDevice="tablet" />
        );
        
        // Eleve o displayValue que ainda é flat
        expect(screen.getByTestId('input-input')).toHaveValue('16');

        // Se mudar no tablet, deve converter para objeto { mob: 16, tab: X, desk: 16 }
        fireEvent.change(screen.getByTestId('input-input'), { target: { value: '18' } });
        
        expect(mockOnChange).toHaveBeenCalledWith({ mob: 16, tab: '18', desk: 16 });
    });
});
