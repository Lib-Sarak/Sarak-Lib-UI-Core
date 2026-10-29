import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import * as ComponentModule from '../SarakInput';
import { SarakInput } from '../SarakInput';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

describe('SarakInput', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(ComponentModule).toBeDefined();
        // TODO: Injetar testes de montagem profunda caso o componente cresça em complexidade
    });
});

describe('SarakInput — estilos padrão e do provider', () => {
    it('renderiza sem SarakUIProvider, com o default de borda aplicado (solid)', () => {
        expect(() => render(<SarakInput placeholder="nome" />)).not.toThrow();
        const input = screen.getByPlaceholderText('nome');
        expect(input.style.border).toContain('1px solid');
    });

    it('com SarakUIProvider, aplica o valor REAL do tema (underline) — não o default do átomo', () => {
        render(
            <SarakUIProvider config={{ inputBorderType: 'underline' }}>
                <SarakInput placeholder="nome" />
            </SarakUIProvider>,
        );
        const input = screen.getByPlaceholderText('nome');
        // 'solid' (default sem Provider) nunca toca `borderBottom`; só 'underline' toca
        // — presente aqui prova que o valor REAL do tema atravessou, não o default.
        expect(input.style.borderBottom).toContain('2px solid');
    });
});

describe('SarakInput — handlers e foco', () => {
    it('compõe handlers externos e mostra o anel de foco, inclusive com borda none', () => {
        const onFocus = vi.fn();
        const onBlur = vi.fn();
        render(
            <SarakUIProvider config={{ inputBorderType: 'none' }}>
                <SarakInput placeholder="busca" onFocus={onFocus} onBlur={onBlur} />
            </SarakUIProvider>,
        );
        const input = screen.getByPlaceholderText('busca');

        fireEvent.focus(input);
        expect(onFocus).toHaveBeenCalledTimes(1);
        expect(input.style.boxShadow).toContain('var(--sarak-focus-width, 2px)');

        fireEvent.blur(input);
        expect(onBlur).toHaveBeenCalledTimes(1);
        expect(input.style.boxShadow).toBe('');
    });

    it('mantém a borda inferior do tema underline e acrescenta o anel de foco', () => {
        render(
            <SarakUIProvider config={{ inputBorderType: 'underline' }}>
                <SarakInput placeholder="sublinhado" />
            </SarakUIProvider>,
        );
        const input = screen.getByPlaceholderText('sublinhado');

        fireEvent.focus(input);
        expect(input.style.borderBottom).toContain('2px solid');
        expect(input.style.boxShadow).toContain('var(--sarak-focus-width, 2px)');
    });
});

describe('Erro de campo pelo SarakFieldError', () => {
    it('com `error`, há um role="alert" com o texto e o controle o referencia', () => {
        render(<SarakInput error="Campo obrigatório" />);
        const alert = screen.getByRole('alert');
        expect(alert).toHaveTextContent('Campo obrigatório');
        expect(alert.querySelector('svg')).not.toBeNull();
        expect(alert.id).toMatch(/-error$/);
        expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', alert.id);
    });

    it('sem `error`, nada é renderizado', () => {
        render(<SarakInput />);
        expect(screen.queryByRole('alert')).toBeNull();
    });

    it('combina as descrições do chamador e do erro', () => {
        render(
            <>
                <span id="email-hint">Use o endereço corporativo.</span>
                <span id="email-policy">O endereço não será compartilhado.</span>
                <SarakInput
                    id="email"
                    aria-describedby="email-hint email-policy"
                    error="E-mail inválido"
                />
            </>,
        );

        const alert = screen.getByRole('alert');
        expect(screen.getByRole('textbox')).toHaveAttribute(
            'aria-describedby',
            `email-hint email-policy ${alert.id}`,
        );
    });
});

describe('SarakInput — ícones', () => {
    it('leftIcon e rightIcon renderizam juntos, cada um no seu lado', () => {
        render(<SarakInput leftIcon={<span data-testid="esq" />} rightIcon={<span data-testid="dir" />} />);

        expect(screen.getByTestId('esq').parentElement?.className).toContain('left-3');
        expect(screen.getByTestId('dir').parentElement?.className).toContain('right-3');
        const input = screen.getByRole('textbox');
        expect(input.className).toContain('pl-11');
        expect(input.className).toContain('pr-11');
    });

    it('o clique no ícone da direita dispara', () => {
        const onClick = vi.fn();
        render(<SarakInput leftIcon={<span />} rightIcon={<button type="button" onClick={onClick}>ver</button>} />);

        expect(screen.getByText('ver').parentElement?.className).not.toContain('pointer-events-none');
        fireEvent.click(screen.getByText('ver'));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('`icon` prevalece sobre os outros dois', () => {
        render(<SarakInput icon={<span data-testid="unico" />} leftIcon={<span data-testid="esq" />} rightIcon={<span data-testid="dir" />} />);

        expect(screen.getByTestId('unico')).toBeInTheDocument();
        expect(screen.queryByTestId('esq')).toBeNull();
        expect(screen.queryByTestId('dir')).toBeNull();
    });
});

describe('SarakInput — prefixo e sufixo', () => {
    it('liga os adornos à descrição acessível e não os repassa como atributos nativos', () => {
        render(<SarakInput id="amount" prefixText="R$" suffixText="BRL" />);

        const input = screen.getByRole('textbox');
        expect(input).toHaveAttribute('aria-describedby', 'amount-prefix amount-suffix');
        expect(screen.getByText('R$')).toHaveAttribute('id', 'amount-prefix');
        expect(screen.getByText('BRL')).toHaveAttribute('id', 'amount-suffix');
        expect(input).not.toHaveAttribute('prefixtext');
        expect(input).not.toHaveAttribute('suffixtext');
    });
});
