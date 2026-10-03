import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import { SarakInput } from '../../Inputs/SarakInput';
import { SarakFieldError } from '../SarakFieldError';

it('SarakFieldError renderiza mensagem anunciada com a tipografia e a cor de SarakInput', () => {
    render(
        <SarakUIProvider>
            <SarakFieldError fieldId="email" message="E-mail inválido" />
        </SarakUIProvider>,
    );

    const error = screen.getByRole('alert');

    expect(error).toHaveTextContent('E-mail inválido');
    expect(error).toHaveClass('text-sm', 'text-[var(--sarak-input-error-color,#ff4d4f)]');
    const icon = error.querySelector('[aria-hidden="true"] svg');

    expect(icon).toHaveAttribute('width', 'var(--sarak-body-size, 14px)');
    expect(icon).toHaveAttribute('height', 'var(--sarak-body-size, 14px)');
    expect(error).toHaveAttribute('id', 'email-error');
});

it('SarakFieldError não renderiza nem reserva espaço quando não há mensagem', () => {
    const { container } = render(<SarakFieldError fieldId="email" />);

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it('SarakFieldError associa a mensagem ao campo pelo id usado em aria-describedby', () => {
    render(
        <SarakUIProvider>
            <>
                <SarakInput id="email" label="E-mail" aria-describedby="email-error" />
                <SarakFieldError fieldId="email" message="E-mail inválido" />
            </>
        </SarakUIProvider>,
    );

    const field = screen.getByRole('textbox', { name: 'E-mail' });

    expect(field).toHaveAttribute('aria-describedby', 'email-error');
    expect(field).toHaveAccessibleDescription('E-mail inválido');
});
