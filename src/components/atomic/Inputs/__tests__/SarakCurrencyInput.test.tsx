import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import { SarakCurrencyInput } from '../SarakCurrencyInput';

it('SarakCurrencyInput formata zero como moeda sem confundi-lo com campo vazio', () => {
    render(<SarakCurrencyInput aria-label="Valor" value={0} />);
    const input = screen.getByRole('textbox', { name: 'Valor' }) as HTMLInputElement;

    expect(input).toHaveValue(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(0));
});

it('SarakCurrencyInput cola valor negativo decimal e emite número limpo', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<SarakCurrencyInput aria-label="Valor" onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: 'Valor' }) as HTMLInputElement;

    await user.click(input);
    await user.paste('-1234,56');

    expect(onChange).toHaveBeenLastCalledWith(-1234.56);
    expect(input).toHaveValue('-1234,56');
    expect(input.selectionStart).toBe(input.value.length);

    await user.tab();

    expect(input).toHaveValue(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(-1234.56));
});

it('SarakCurrencyInput permite digitar casas decimais e formata ao sair do campo', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<SarakCurrencyInput aria-label="Valor" onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: 'Valor' }) as HTMLInputElement;

    await user.click(input);
    await user.type(input, '1234,56');

    expect(input).toHaveValue('1234,56');
    expect(input.selectionStart).toBe(input.value.length);
    expect(onChange).toHaveBeenLastCalledWith(1234.56);

    await user.tab();

    expect(input).toHaveValue(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(1234.56));
});

it('SarakCurrencyInput emite zero numérico quando zero é digitado', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<SarakCurrencyInput aria-label="Valor" onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: 'Valor' }) as HTMLInputElement;

    await user.type(input, '0');

    expect(onChange).toHaveBeenLastCalledWith(0);
});

it('SarakCurrencyInput preserva o cursor ao apagar um dígito no meio', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<SarakCurrencyInput aria-label="Valor" defaultValue={1234.56} onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: 'Valor' }) as HTMLInputElement;

    await user.click(input);
    const fivePosition = input.value.indexOf('5') + 1;
    input.setSelectionRange(fivePosition, fivePosition);
    await user.keyboard('{Backspace}');

    expect(onChange).toHaveBeenLastCalledWith(1234.6);
    expect(input).toHaveValue('1234,6');
    expect(input.selectionStart).toBe(input.value.indexOf('6'));
});

it('SarakCurrencyInput usa moeda e locale recebidas por prop', () => {
    render(<SarakCurrencyInput aria-label="Amount" value={1234.5} locale="en-US" currency="USD" />);
    const input = screen.getByRole('textbox', { name: 'Amount' }) as HTMLInputElement;

    expect(input).toHaveValue(new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(1234.5));
});

it('SarakCurrencyInput acompanha o idioma do Provider quando locale é omitida', () => {
    render(
        <SarakUIProvider config={{ language: 'en-US' }}>
            <SarakCurrencyInput aria-label="Amount" value={1234.5} />
        </SarakUIProvider>,
    );
    const input = screen.getByRole('textbox', { name: 'Amount' }) as HTMLInputElement;

    expect(input).toHaveValue(new Intl.NumberFormat('en-US', { style: 'currency', currency: 'BRL' }).format(1234.5));
});

it('SarakCurrencyInput usa pt-BR fora do Provider quando locale é omitida', () => {
    render(<SarakCurrencyInput aria-label="Valor" value={1234.5} />);
    const input = screen.getByRole('textbox', { name: 'Valor' }) as HTMLInputElement;

    expect(input).toHaveValue(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(1234.5));
});
