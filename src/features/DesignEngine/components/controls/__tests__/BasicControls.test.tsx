import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SliderControl, InputControl, SwitchControl, SelectControl } from '../BasicControls';
import { SarakUIProvider } from '../../../../../core/Provider/SarakUIProvider';

// Os átomos (SarakSlider/SarakInput/SarakSwitch/SarakSelect) leem `useSarakUI()`
// (porta obrigatória, lança fora do Provider) — mesmo padrão de PreviewCanvas.test.tsx.
const renderWithProvider = (ui: React.ReactElement) => render(<SarakUIProvider>{ui}</SarakUIProvider>);

describe('SliderControl (plan-36 — debounce do commit ao rascunho)', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('MEDIÇÃO: arrastar 10 pixels seguidos chama onChange (updateDraft) 1 vez, não 10 — o valor exibido acompanha CADA pixel', () => {
        const onChange = vi.fn();
        const { container } = renderWithProvider(<SliderControl label="Raio" value={0} min={0} max={100} onChange={onChange} />);

        const slider = screen.getByRole('slider');
        for (let pixel = 1; pixel <= 10; pixel += 1) {
            fireEvent.change(slider, { target: { value: String(pixel) } });
        }

        // Antes desta plan: 10 pixels arrastados = 10 chamadas de updateDraft = 10
        // recomputações do dicionário inteiro de tokens no preview.
        expect(onChange).not.toHaveBeenCalled();
        // O rótulo (feedback instantâneo) já reflete o ÚLTIMO pixel, sem esperar o commit
        // (`getByText` sem escopo colide com o `valueLabel` que o próprio SarakSlider
        // também renderiza).
        expect(container.textContent).toContain('10px');

        vi.advanceTimersByTime(150);

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(10);
    });

    it('uma pausa no meio do arrasto committa o valor daquele instante, e o arrasto seguinte conta de novo', () => {
        const onChange = vi.fn();
        renderWithProvider(<SliderControl label="Raio" value={0} min={0} max={100} onChange={onChange} />);
        const slider = screen.getByRole('slider');

        fireEvent.change(slider, { target: { value: '5' } });
        vi.advanceTimersByTime(150);
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenLastCalledWith(5);

        fireEvent.change(slider, { target: { value: '12' } });
        vi.advanceTimersByTime(150);
        expect(onChange).toHaveBeenCalledTimes(2);
        expect(onChange).toHaveBeenLastCalledWith(12);
    });

    it('reset externo (value de fora muda) vence o estado local imediatamente', () => {
        const onChange = vi.fn();
        const { container, rerender } = render(
            <SarakUIProvider>
                <SliderControl label="Raio" value={5} min={0} max={100} onChange={onChange} />
            </SarakUIProvider>,
        );
        // `getByText` sem escopo colide com o `valueLabel` que o próprio SarakSlider
        // também renderiza (dois nós com o mesmo texto) — escopar ao container do teste.
        expect(container.textContent).toContain('5px');

        rerender(
            <SarakUIProvider>
                <SliderControl label="Raio" value={0} min={0} max={100} onChange={onChange} />
            </SarakUIProvider>,
        );
        expect(container.textContent).toContain('0px');
        expect(container.textContent).not.toContain('5px');
    });
});

describe('InputControl (plan-36 — debounce do commit ao rascunho)', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('MEDIÇÃO: digitar 5 teclas seguidas chama onChange 1 vez, não 5 — o campo mostra cada tecla na hora', () => {
        const onChange = vi.fn();
        renderWithProvider(<InputControl label="Nome" value="" onChange={onChange} />);
        const input = screen.getByDisplayValue('') as HTMLInputElement;

        'sarak'.split('').forEach((_, i) => {
            fireEvent.change(input, { target: { value: 'sarak'.slice(0, i + 1) } });
        });

        expect(onChange).not.toHaveBeenCalled();
        expect(input.value).toBe('sarak');

        vi.advanceTimersByTime(150);

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith('sarak');
    });
});

describe('SwitchControl e SelectControl — permanecem SÍNCRONOS (interação discreta, não há o que debounce)', () => {
    it('SwitchControl chama onChange na hora, sem esperar timer', () => {
        const onChange = vi.fn();
        renderWithProvider(<SwitchControl label="Ativo" value={false} onChange={onChange} />);
        fireEvent.click(screen.getByRole('switch'));
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(true);
    });

    it('SelectControl chama onChange na hora, sem esperar timer', () => {
        const onChange = vi.fn();
        renderWithProvider(<SelectControl label="Modo" options={['a', 'b']} value="a" onChange={onChange} />);
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'b' } });
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith('b');
    });
});
