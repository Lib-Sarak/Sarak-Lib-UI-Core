import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SarakAvatar } from '../SarakAvatar';

describe('SarakAvatar', () => {
    it('mostra as iniciais e usa o nome como texto alternativo quando não há foto', () => {
        render(<SarakAvatar name="Ada Lovelace" />);

        expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toHaveTextContent('AL');
    });

    it('renderiza a foto com texto alternativo personalizado', () => {
        render(<SarakAvatar name="Ada Lovelace" src="/ada.png" alt="Retrato de Ada" />);

        expect(screen.getByRole('img', { name: 'Retrato de Ada' })).toHaveAttribute('src', '/ada.png');
    });

    it('volta às iniciais após um erro real de carregamento da foto', () => {
        const { container } = render(<SarakAvatar name="Grace Hopper" src="/grace.png" />);
        const image = screen.getByRole('img', { name: 'Grace Hopper' });

        fireEvent.error(image);

        expect(container.querySelector('img')).not.toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'Grace Hopper' })).toHaveTextContent('GH');
    });

    it('usa o tamanho médio por padrão e respeita a escala dos átomos', () => {
        render(<SarakAvatar name="Ada Lovelace" data-testid="avatar" />);

        const avatar = screen.getByTestId('avatar');
        expect(avatar.style.width).toContain('* 2.5');
        expect(avatar.style.height).toBe(avatar.style.width);
    });

    it('mostra um fallback seguro para um nome vazio', () => {
        render(<SarakAvatar name="" />);

        expect(screen.getByRole('img', { name: '' })).toHaveTextContent('?');
    });
});
