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
