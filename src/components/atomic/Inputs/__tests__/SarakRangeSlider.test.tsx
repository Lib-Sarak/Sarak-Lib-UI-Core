import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import { SarakRangeSlider, type SarakRangeSliderProps } from '../SarakRangeSlider';

const renderSlider = (props: SarakRangeSliderProps) =>
    render(
        <SarakUIProvider>
            <SarakRangeSlider {...props} />
        </SarakUIProvider>,
    );

describe('SarakRangeSlider', () => {
    it('deve renderizar dois thumbs refletindo min/max/step do manifesto', () => {
        renderSlider({ label: 'Faixa', min: 10, max: 90, step: 5, value: [20, 60] });
        const thumbs = screen.getAllByRole('slider');
        expect(thumbs).toHaveLength(2);
        for (const thumb of thumbs) {
            expect(thumb).toHaveAttribute('min', '10');
            expect(thumb).toHaveAttribute('max', '90');
            expect(thumb).toHaveAttribute('step', '5');
        }
        expect(thumbs[0]).toHaveValue('20');
        expect(thumbs[1]).toHaveValue('60');
    });

    it('deve emitir o par ordenado e clampado ao mover um thumb', () => {
        const onChange = vi.fn();
        renderSlider({ value: [20, 60], onChange });
        const [low] = screen.getAllByRole('slider');
        // Move o início para além do fim → resultado deve permanecer ordenado/clampado.
        fireEvent.change(low, { target: { value: '80' } });
        expect(onChange).toHaveBeenCalledWith([60, 60]);
    });

    it('deve expor o erro via aria-invalid quando hasError', () => {
        renderSlider({ value: [0, 100], error: 'Intervalo inválido' });
        const thumbs = screen.getAllByRole('slider');
        expect(thumbs[0]).toHaveAttribute('aria-invalid', 'true');
        expect(screen.getByText('Intervalo inválido')).toBeInTheDocument();
    });
});

describe('Erro de campo pelo SarakFieldError', () => {
    it('com `error`, há um role="alert" com o texto e o controle o referencia', () => {
        render(<SarakRangeSlider error="Campo obrigatório" />);
        const alert = screen.getByRole('alert');
        expect(alert).toHaveTextContent('Campo obrigatório');
        expect(alert.querySelector('svg')).not.toBeNull();
        expect(alert.id).toMatch(/-error$/);
        expect(screen.getAllByRole('slider')[0]).toHaveAttribute('aria-describedby', alert.id);
    });

    it('sem `error`, nada é renderizado', () => {
        render(<SarakRangeSlider />);
        expect(screen.queryByRole('alert')).toBeNull();
    });
});

describe('SarakRangeSlider — textos da lib seguem o idioma', () => {
    it('o rótulo acessível dos dois polegares muda com o idioma', () => {
        const { rerender } = render(<SarakRangeSlider label="Preço" />);
        expect(screen.getByLabelText('Preço mínimo')).toBeInTheDocument();
        expect(screen.getByLabelText('Preço máximo')).toBeInTheDocument();

        rerender(
            <SarakUIProvider config={{ language: 'en' }}>
                <SarakRangeSlider label="Price" />
            </SarakUIProvider>,
        );
        expect(screen.getByLabelText('Price minimum')).toBeInTheDocument();
        expect(screen.getByLabelText('Price maximum')).toBeInTheDocument();
    });

    it('sem `label`, o sufixo também vem do catálogo', () => {
        render(
            <SarakUIProvider config={{ language: 'de' }}>
                <SarakRangeSlider />
            </SarakUIProvider>,
        );
        expect(screen.getByLabelText('range Minimum')).toBeInTheDocument();
        expect(screen.getByLabelText('range Maximum')).toBeInTheDocument();
    });
});
