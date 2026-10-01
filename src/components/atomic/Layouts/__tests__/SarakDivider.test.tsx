import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SarakDivider } from '../SarakDivider';

describe('SarakDivider', () => {
    it('renderiza um separador horizontal com rótulo acessível', () => {
        render(<SarakDivider label="ou" />);

        const separator = screen.getByRole('separator', { name: 'ou' });
        expect(separator).toHaveAttribute('aria-orientation', 'horizontal');
        expect(screen.getByText('ou')).toBeInTheDocument();
    });

    it('renderiza a orientação vertical e aceita um nome acessível explícito', () => {
        render(
            <SarakDivider
                orientation="vertical"
                decorative={false}
                aria-label="Limite da seção"
                data-testid="divider"
            />,
        );

        const separator = screen.getByRole('separator', { name: 'Limite da seção' });
        expect(separator).toHaveAttribute('aria-orientation', 'vertical');
        expect(screen.getByTestId('divider')).toHaveStyle({ flexDirection: 'column' });
    });

    it('oculta o separador sem rótulo da árvore acessível por padrão', () => {
        render(<SarakDivider data-testid="decorative-divider" />);

        expect(screen.queryByRole('separator')).not.toBeInTheDocument();
        expect(screen.getByTestId('decorative-divider')).toHaveAttribute('aria-hidden', 'true');
    });

    it('permite tornar semântico um separador sem rótulo', () => {
        render(<SarakDivider decorative={false} aria-label="Fim do cabeçalho" />);

        expect(screen.getByRole('separator', { name: 'Fim do cabeçalho' })).toBeInTheDocument();
    });
});
