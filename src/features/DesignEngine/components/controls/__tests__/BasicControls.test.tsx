import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SliderControl, InputControl, SwitchControl, SelectControl } from '../BasicControls';
import { SarakUIProvider } from '../../../../../core/Provider/SarakUIProvider';
import { TypographySchema } from '../../../../../core/Design/schema/typography';

// Os átomos (SarakSlider/SarakInput/SarakSwitch/SarakSelect) leem `useSarakUI()`
// (porta obrigatória, lança fora do Provider) — mesmo padrão de PreviewCanvas.test.tsx.
const renderWithProvider = (ui: React.ReactElement) => render(<SarakUIProvider>{ui}</SarakUIProvider>);

describe('SliderControl (plan-36 — debounce do commit ao rascunho)', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('MEDIÇÃO: arrastar 10 pixels seguidos chama onChange (updateDraft) 1 vez, não 10 — o valor exibido acompanha CADA pixel', () => {
        const onChange = vi.fn();
        const { container } = renderWithProvider(<SliderControl label="Raio" value={0} min={0} max={100} unit="px" onChange={onChange} />);

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
        renderWithProvider(<SliderControl label="Raio" value={0} min={0} max={100} unit="px" onChange={onChange} />);
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
                <SliderControl label="Raio" value={5} min={0} max={100} unit="px" onChange={onChange} />
            </SarakUIProvider>,
        );
        // `getByText` sem escopo colide com o `valueLabel` que o próprio SarakSlider
        // também renderiza (dois nós com o mesmo texto) — escopar ao container do teste.
        expect(container.textContent).toContain('5px');

        rerender(
            <SarakUIProvider>
                <SliderControl label="Raio" value={0} min={0} max={100} unit="px" onChange={onChange} />
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

describe('InputControl numérico — nunca grava NaN e respeita a faixa', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    const type = (container: HTMLElement, text: string): void => {
        fireEvent.change(container.querySelector('input') as HTMLInputElement, { target: { value: text } });
    };

    it('campo vazio e "-" no meio da digitação não são número: nada é gravado', () => {
        const onChange = vi.fn();
        const { container } = renderWithProvider(<InputControl label="Z" type="number" value={5} onChange={onChange} />);
        type(container, '');
        type(container, '-');
        vi.advanceTimersByTime(500);
        expect(onChange).not.toHaveBeenCalled();
    });

    it('o texto digitado fica no campo enquanto não é número, e o número válido é gravado uma vez', () => {
        const onChange = vi.fn();
        const { container } = renderWithProvider(<InputControl label="Z" type="number" value={5} onChange={onChange} />);
        type(container, '-');
        expect((container.querySelector('input') as HTMLInputElement).value).toBe('');
        type(container, '12');
        vi.advanceTimersByTime(500);
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(12);
    });

    it('o valor digitado é levado para dentro de [min, max]', () => {
        const onChange = vi.fn();
        const { container } = renderWithProvider(<InputControl label="Z" type="number" value={5} min={0} max={10} onChange={onChange} />);
        type(container, '999');
        vi.advanceTimersByTime(500);
        expect(onChange).toHaveBeenLastCalledWith(10);
        const input = container.querySelector('input') as HTMLInputElement;
        expect(input).toHaveAttribute('min', '0');
        expect(input).toHaveAttribute('max', '10');
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

describe('rótulos dos controles', () => {
    it('usa o tamanho tipográfico mínimo e mantém caixa e espaçamento normais', () => {
        renderWithProvider(
            <>
                <SliderControl label="Rótulo do slider" value={1} onChange={vi.fn()} />
                <InputControl label="Rótulo do campo" value="" onChange={vi.fn()} />
                <SwitchControl label="Rótulo da opção" value={false} onChange={vi.fn()} />
                <SelectControl label="Rótulo da lista" options={['a']} value="a" onChange={vi.fn()} />
            </>,
        );

        ['Rótulo do slider', 'Rótulo do campo', 'Rótulo da opção', 'Rótulo da lista'].forEach((label) => {
            // O SelectControl também desenha um <label class="sr-only"> com o mesmo texto: o visível é o outro.
            const labelElement = screen.getAllByText(label).find((element) => !element.classList.contains('sr-only'))!;
            expect(labelElement).toHaveClass('normal-case', 'tracking-normal');
            expect(labelElement.className).toContain('--sarak-type-scale-caption');
        });

        const captionToken = TypographySchema.tokens.find(({ id }) => id === 'typeScaleCaption');
        expect(Number(captionToken?.defaultValue)).toBeGreaterThanOrEqual(12);
    });
});
