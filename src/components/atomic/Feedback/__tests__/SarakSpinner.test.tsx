import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { SarakSpinner } from '../SarakSpinner';

it('SarakSpinner expõe um progresso indeterminado com nome acessível padrão', () => {
    render(<SarakSpinner />);

    const spinner = screen.getByRole('progressbar', { name: 'Carregando' });

    expect(spinner).not.toHaveAttribute('aria-valuenow');
    expect(spinner).toHaveClass('motion-safe:animate-spin');
});

it.each([
    ['sm', 'var(--sarak-type-scale-caption, 12px)'],
    ['md', 'var(--sarak-body-size, 14px)'],
    ['lg', 'var(--sarak-h3-size, 24px)'],
] as const)('SarakSpinner usa o token do tema para o tamanho %s', (size, dimension) => {
    render(<SarakSpinner size={size} />);

    const spinner = screen.getByRole('progressbar');

    expect(spinner.style.width).toBe(dimension);
    expect(spinner.style.height).toBe(dimension);
});

it('SarakSpinner usa o rótulo informado e a cor primária do tema', () => {
    render(<SarakSpinner label="Salvando alterações" />);

    const spinner = screen.getByRole('progressbar', { name: 'Salvando alterações' });

    expect(spinner.getAttribute('style')).toContain('color: var(--sarak-primary-color, currentColor)');
});

it('SarakSpinner restaura o rótulo padrão quando recebe texto vazio', () => {
    render(<SarakSpinner label="   " />);

    expect(screen.getByRole('progressbar', { name: 'Carregando' })).toBeInTheDocument();
});

it('SarakSpinner aceita classes extras e mantém animação compatível com movimento', () => {
    render(<SarakSpinner className="text-sm" />);

    expect(screen.getByRole('progressbar')).toHaveClass('motion-safe:animate-spin', 'text-sm');
});
