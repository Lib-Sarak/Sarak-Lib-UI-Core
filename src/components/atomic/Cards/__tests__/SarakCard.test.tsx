import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SarakCard } from '../SarakCard';

describe('SarakCard', () => {
    it('renderiza as peças opcionais na ordem declarada e mantém a moldura temática', () => {
        const { container } = render(
            <SarakCard>
                <SarakCard.Footer>Rodapé</SarakCard.Footer>
                <SarakCard.Body>Conteúdo</SarakCard.Body>
                <SarakCard.Header>Cabeçalho</SarakCard.Header>
            </SarakCard>,
        );

        expect(screen.getByText('Rodapé')).toBeInTheDocument();
        expect(screen.getByText('Conteúdo')).toBeInTheDocument();
        expect(screen.getByText('Cabeçalho')).toBeInTheDocument();
        expect(container.firstElementChild).toHaveClass('sarak-card');
    });

    it('renderiza somente o corpo sem exigir cabeçalho ou rodapé', () => {
        const { container } = render(
            <SarakCard>
                <SarakCard.Body>Somente corpo</SarakCard.Body>
            </SarakCard>,
        );

        expect(screen.getByText('Somente corpo')).toBeInTheDocument();
        expect(container.querySelector('header')).toBeNull();
        expect(container.querySelector('footer')).toBeNull();
    });

    it('permite que className substitua classes utilitárias padrão', () => {
        const { container } = render(<SarakCard className="w-fit flex-row">Cartão</SarakCard>);
        const card = container.firstElementChild;

        expect(card).toHaveClass('sarak-card', 'w-fit', 'flex-row');
        expect(card).not.toHaveClass('w-full', 'flex-col');
    });
});
