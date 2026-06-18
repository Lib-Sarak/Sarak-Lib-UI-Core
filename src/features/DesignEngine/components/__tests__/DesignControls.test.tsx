import React from 'react';
import '@testing-library/jest-dom';
import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SliderControl, ColorControl, SwitchControl, SelectControl } from '../DesignControls';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

const customRender = (ui: React.ReactElement) => {
    return render(<SarakUIProvider>{ui}</SarakUIProvider>);
};

describe('DesignControls', () => {
    it('renderiza SliderControl e reage a mudanças', () => {
        const onChange = vi.fn();
        const { container } = customRender(
            <SliderControl label="Opacidade" value={0.5} min={0} max={1} step={0.1} unit="" onChange={onChange} />
        );
        expect(screen.getByText('Opacidade')).toBeInTheDocument();
        
        const slider = container.querySelector('input[type="range"]') as HTMLInputElement;
        expect(slider).toBeInTheDocument();
        
        fireEvent.change(slider, { target: { value: '0.8' } });
        expect(onChange).toHaveBeenCalledWith(0.8);
    });

    it('renderiza ColorControl e reage a mudanças', () => {
        const onChange = vi.fn();
        const { container } = customRender(
            <ColorControl label="Cor Primária" value="#ff0000" onChange={onChange} />
        );
        expect(screen.getByText('Cor Primária')).toBeInTheDocument();
        
        const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement;
        expect(colorInput).toBeInTheDocument();
        
        fireEvent.change(colorInput, { target: { value: '#00ff00' } });
        expect(onChange).toHaveBeenCalledWith('#00ff00');
    });

    it('renderiza SwitchControl e reage a cliques', () => {
        const onChange = vi.fn();
        const { container } = customRender(
            <SwitchControl label="Ativar Algo" value={false} onChange={onChange} />
        );
        expect(screen.getByText('Ativar Algo')).toBeInTheDocument();
        // Clica no switch (que agora é um input checkbox)
        const checkbox = container.querySelector('input[type="checkbox"]');
        fireEvent.click(checkbox!);
        expect(onChange).toHaveBeenCalledWith(true);
    });

    it('renderiza SelectControl e reage a mudanças', () => {
        const onChange = vi.fn();
        const { container } = customRender(
            <SelectControl label="Fonte" value="Inter" options={['Inter', 'Roboto']} onChange={onChange} />
        );
        expect(screen.getByText('Fonte')).toBeInTheDocument();
        
        const select = container.querySelector('select') as HTMLSelectElement;
        expect(select).toBeInTheDocument();
        
        fireEvent.change(select, { target: { value: 'Roboto' } });
        expect(onChange).toHaveBeenCalledWith('Roboto');
    });
});
