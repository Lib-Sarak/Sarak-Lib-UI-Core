import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TokenControl } from '../TokenControl';
import type { DesignToken } from '../../../../../core/Design/types';

vi.mock('../../../components/DesignControls', () => {
    type MockControlProps = { value?: string | number | boolean; onChange: (v: unknown) => void; label?: string };
    return {
    ColorControl: ({ value, onChange, label }: MockControlProps) => (
        <div data-testid="color-control">
            <span>{label}</span>
            <input data-testid="color-input" value={String(value) || ''} onChange={(e) => onChange(e.target.value)} />
        </div>
    ),
    SliderControl: ({ value, onChange, label }: MockControlProps) => (
        <div data-testid="slider-control">
            <span>{label}</span>
            <input data-testid="slider-input" type="number" value={Number(value) || 0} onChange={(e) => onChange(Number(e.target.value))} />
        </div>
    ),
    SelectControl: ({ value, onChange, label }: MockControlProps) => (
        <div data-testid="select-control">
            <span>{label}</span>
            <select data-testid="select-input" value={String(value) || ''} onChange={(e) => onChange(e.target.value)}>
                <option value="val1">Val1</option>
                <option value="val2">Val2</option>
            </select>
        </div>
    ),
    SwitchControl: ({ value, onChange, label }: MockControlProps) => (
        <div data-testid="switch-control">
            <span>{label}</span>
            <input data-testid="switch-input" type="checkbox" checked={Boolean(value) || false} onChange={(e) => onChange(e.target.checked)} />
        </div>
    ),
    InputControl: ({ value, onChange, label }: MockControlProps) => (
        <div data-testid="input-control">
            <span>{label}</span>
            <input data-testid="input-input" value={String(value) || ''} onChange={(e) => onChange(e.target.value)} />
        </div>
    ),
    MediaUploaderControl: ({ value, onChange, label }: MockControlProps) => (
        <div data-testid="media-control">
            <span>{label}</span>
            <button data-testid="media-btn" onClick={() => onChange('new-image.jpg')}>Upload</button>
        </div>
    )
    };
});

describe('TokenControl', () => {
    const mockOnChange = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renderiza fallback caso o tipo do token não conste no registro', () => {
        const tokenMock = { id: 'test-token', type: 'unknown_type', label: 'Unknown Token', isResponsive: false, defaultValue: '' };
        const { container } = render(<TokenControl token={tokenMock as unknown as DesignToken} value="teste" onChange={mockOnChange} />);
        expect(container.firstChild).toBeNull();
    });

    it('renderiza o controle correto com base no tipo', () => {
        const { rerender } = render(
            <TokenControl token={{ type: 'color', label: 'Cor' } as unknown as DesignToken} value="#000" onChange={mockOnChange} />
        );
        expect(screen.getByTestId('color-control')).toBeInTheDocument();

        rerender(<TokenControl token={{ type: 'slider', label: 'Slider' } as unknown as DesignToken} value={10} onChange={mockOnChange} />);
        expect(screen.getByTestId('slider-control')).toBeInTheDocument();

        rerender(<TokenControl token={{ type: 'switch', label: 'Switch' } as unknown as DesignToken} value={true} onChange={mockOnChange} />);
        expect(screen.getByTestId('switch-control')).toBeInTheDocument();
    });

    it('repassa a alteração de valor de forma simples se isResponsive for falso', () => {
        render(<TokenControl token={{ type: 'input', label: 'Texto' } as unknown as DesignToken} value="old" onChange={mockOnChange} />);
        
        fireEvent.change(screen.getByTestId('input-input'), { target: { value: 'new' } });
        expect(mockOnChange).toHaveBeenCalledWith('new');
    });

    it('atualiza apenas a chave correspondente do dispositivo em tokens responsivos (objeto existente)', () => {
        const tokenResponsive = { type: 'text', label: 'Título Responsivo', isResponsive: true } as unknown as DesignToken;
        const responsiveValue = { desk: '#fff', tab: '#ccc', mob: '#000' };

        // Testa com previewDevice = 'desktop'
        const { rerender } = render(
            <TokenControl token={tokenResponsive} value={responsiveValue} onChange={mockOnChange} previewDevice="desktop" />
        );
        expect(screen.getByTestId('input-input')).toHaveValue('#fff');

        fireEvent.change(screen.getByTestId('input-input'), { target: { value: '#eee' } });
        // Deve atualizar apenas o desk, mantendo o restante
        expect(mockOnChange).toHaveBeenCalledWith({ desk: '#eee', tab: '#ccc', mob: '#000' });

        // Testa com previewDevice = 'smartphone'
        rerender(
            <TokenControl token={tokenResponsive} value={responsiveValue} onChange={mockOnChange} previewDevice="smartphone" />
        );
        expect(screen.getByTestId('input-input')).toHaveValue('#000');
    });

    it('cria estrutura responsiva caso o valor ainda não seja objeto (migração)', () => {
        const tokenResponsive = { type: 'number', label: 'Number Resp', isResponsive: true } as unknown as DesignToken;
        const flatValue = 16; 

        render(
            <TokenControl token={tokenResponsive} value={flatValue} onChange={mockOnChange} previewDevice="tablet" />
        );
        
        // Eleve o displayValue que ainda é flat
        expect(screen.getByTestId('input-input')).toHaveValue('16');

        // Se mudar no tablet, deve converter para objeto { mob: 16, tab: X, desk: 16 }
        fireEvent.change(screen.getByTestId('input-input'), { target: { value: '18' } });
        
        expect(mockOnChange).toHaveBeenCalledWith({ mob: 16, tab: '18', desk: 16 });
    });
});
