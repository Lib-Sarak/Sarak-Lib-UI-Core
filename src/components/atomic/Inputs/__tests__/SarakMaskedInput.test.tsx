import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { SarakMaskedInput } from '../SarakMaskedInput';

it('SarakMaskedInput formata dígitos durante a digitação e emite o valor limpo', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<SarakMaskedInput aria-label="Documento" mask="cpf" onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: 'Documento' }) as HTMLInputElement;

    await user.type(input, '1234');

    expect(input).toHaveValue('123.4');
    expect(input.selectionStart).toBe(5);
    expect(onChange).toHaveBeenLastCalledWith('1234');
});

it('SarakMaskedInput cola CPF completo e posiciona cursor ao final', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<SarakMaskedInput aria-label="Documento" mask="cpf" onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: 'Documento' }) as HTMLInputElement;

    await user.click(input);
    await user.paste('12345678900');

    expect(input).toHaveValue('123.456.789-00');
    expect(input.selectionStart).toBe(input.value.length);
    expect(onChange).toHaveBeenLastCalledWith('12345678900');
});

it('SarakMaskedInput apaga no meio do campo e conserva a posição do cursor', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<SarakMaskedInput aria-label="Código" mask="000-000" defaultValue="123456" onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: 'Código' }) as HTMLInputElement;

    await user.click(input);
    input.setSelectionRange(6, 6);
    await user.keyboard('{Backspace}');

    expect(input).toHaveValue('123-46');
    expect(input.selectionStart).toBe(5);
    expect(onChange).toHaveBeenLastCalledWith('12346');
});

it('usa teclado de texto para CNPJ e conserva o cursor após inserir letras', async () => {
    const user = userEvent.setup();
    render(<SarakMaskedInput aria-label="CNPJ" mask="cnpj" />);
    const input = screen.getByRole('textbox', { name: 'CNPJ' }) as HTMLInputElement;

    await user.type(input, '12abc34501de35');

    expect(input).toHaveAttribute('inputmode', 'text');
    expect(input).toHaveValue('12.ABC.345/01DE-35');
    expect(input.selectionStart).toBe(input.value.length);
});

it('marca CPF inválido no blur e associa o erro ao campo', async () => {
    const user = userEvent.setup();
    render(<SarakMaskedInput label="CPF" mask="cpf" defaultValue="52998224724" validate />);
    const input = screen.getByRole('textbox', { name: 'CPF' });

    await user.click(input);
    await user.tab();

    const error = screen.getByRole('alert');
    expect(error).toHaveTextContent(/CPF/i);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', error.id);
});
