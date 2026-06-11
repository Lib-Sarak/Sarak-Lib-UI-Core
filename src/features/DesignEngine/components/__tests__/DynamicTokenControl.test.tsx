import React from 'react';
import '@testing-library/jest-dom';
import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DynamicTokenControl } from '../DynamicTokenControl';

// Mocks for DesignControls to isolate logic
vi.mock('../DesignControls', () => ({
    SliderControl: ({ onChange }: any) => <button data-testid="slider-ctrl" onClick={() => onChange(50)}>Slider</button>,
    ColorControl: ({ onChange }: any) => <button data-testid="color-ctrl" onClick={() => onChange('#ffffff')}>Color</button>,
    SwitchControl: ({ onChange }: any) => <button data-testid="switch-ctrl" onClick={() => onChange(true)}>Switch</button>,
    SelectControl: ({ onChange }: any) => <button data-testid="select-ctrl" onClick={() => onChange('option2')}>Select</button>
}));

describe('DynamicTokenControl', () => {
    it('renderiza SliderControl para tipo number e chama updateDraft', () => {
        const updateDraft = vi.fn();
        const token: any = { id: 'test_num', type: 'number', defaultValue: 10, label: 'Num' };
        render(<DynamicTokenControl token={token} draft={{}} updateDraft={updateDraft} />);
        
        expect(screen.getByTestId('slider-ctrl')).toBeInTheDocument();
        fireEvent.click(screen.getByTestId('slider-ctrl'));
        expect(updateDraft).toHaveBeenCalledWith('test_num', 50);
    });

    it('renderiza SliderControl para tipo slider', () => {
        const token: any = { id: 'test_slider', type: 'slider', defaultValue: 10, label: 'Slider' };
        render(<DynamicTokenControl token={token} draft={{}} updateDraft={vi.fn()} />);
        expect(screen.getByTestId('slider-ctrl')).toBeInTheDocument();
    });

    it('renderiza ColorControl para tipo color', () => {
        const updateDraft = vi.fn();
        const token: any = { id: 'test_col', type: 'color', defaultValue: '#000', label: 'Color' };
        render(<DynamicTokenControl token={token} draft={{}} updateDraft={updateDraft} />);
        
        expect(screen.getByTestId('color-ctrl')).toBeInTheDocument();
        fireEvent.click(screen.getByTestId('color-ctrl'));
        expect(updateDraft).toHaveBeenCalledWith('test_col', '#ffffff');
    });

    it('renderiza SwitchControl para tipo boolean', () => {
        const updateDraft = vi.fn();
        const token: any = { id: 'test_bool', type: 'boolean', defaultValue: false, label: 'Bool' };
        render(<DynamicTokenControl token={token} draft={{}} updateDraft={updateDraft} />);
        
        expect(screen.getByTestId('switch-ctrl')).toBeInTheDocument();
        fireEvent.click(screen.getByTestId('switch-ctrl'));
        expect(updateDraft).toHaveBeenCalledWith('test_bool', true);
    });

    it('renderiza SelectControl para tipo select ou font', () => {
        const updateDraft = vi.fn();
        const token: any = { id: 'test_sel', type: 'select', defaultValue: 'option1', label: 'Sel', options: ['option1', 'option2'] };
        render(<DynamicTokenControl token={token} draft={{}} updateDraft={updateDraft} />);
        
        expect(screen.getByTestId('select-ctrl')).toBeInTheDocument();
        fireEvent.click(screen.getByTestId('select-ctrl'));
        expect(updateDraft).toHaveBeenCalledWith('test_sel', 'option2');

        const tokenFont: any = { id: 'test_font', type: 'font', defaultValue: 'Arial', label: 'Font', constraints: { options: ['Arial'] } };
        const { container } = render(<DynamicTokenControl token={tokenFont} draft={{}} updateDraft={updateDraft} />);
        expect(screen.getAllByTestId('select-ctrl').length).toBe(2);
    });

    it('renderiza fallback para tipo não suportado', () => {
        const token: any = { id: 'test_un', type: 'unknown_type', defaultValue: '123' };
        render(<DynamicTokenControl token={token} draft={{}} updateDraft={vi.fn()} />);
        expect(screen.getByText('Tipo não suportado: unknown_type')).toBeInTheDocument();
    });
});
