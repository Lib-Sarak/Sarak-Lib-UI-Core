import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SarakLightbox } from '../SarakLightbox';

const images = [
    { src: 'a.jpg', alt: 'A' },
    { src: 'b.jpg', alt: 'B' },
    { src: 'c.jpg', alt: 'C' },
];

describe('SarakLightbox (Spec 15, Regra 3)', () => {
    it('não renderiza quando fechado', () => {
        render(<SarakLightbox images={images} isOpen={false} onClose={vi.fn()} />);
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('mostra a imagem inicial e navega por botões e setas (carrossel circular)', () => {
        const onIndexChange = vi.fn();
        render(<SarakLightbox images={images} isOpen onClose={vi.fn()} onIndexChange={onIndexChange} />);
        const dialog = screen.getByRole('dialog');

        expect(screen.getByRole('img')).toHaveAttribute('src', 'a.jpg');

        fireEvent.click(screen.getByLabelText('Próxima imagem'));
        expect(screen.getByRole('img')).toHaveAttribute('src', 'b.jpg');
        expect(onIndexChange).toHaveBeenLastCalledWith(1);

        fireEvent.keyDown(dialog, { key: 'ArrowLeft' });
        expect(screen.getByRole('img')).toHaveAttribute('src', 'a.jpg');

        // ←  a partir da primeira volta circularmente para a última.
        fireEvent.keyDown(dialog, { key: 'ArrowLeft' });
        expect(screen.getByRole('img')).toHaveAttribute('src', 'c.jpg');
    });

    it('fecha no botão ✕ e no ESC (reusa useFocusTrap)', () => {
        const onClose = vi.fn();
        render(<SarakLightbox images={images} isOpen onClose={onClose} />);
        fireEvent.click(screen.getByLabelText('Fechar galeria'));
        expect(onClose).toHaveBeenCalledTimes(1);

        fireEvent.keyDown(document, { key: 'Escape' });
        expect(onClose).toHaveBeenCalledTimes(2);
    });

    it('com uma única imagem, não exibe controles de navegação', () => {
        render(<SarakLightbox images={[images[0]]} isOpen onClose={vi.fn()} />);
        expect(screen.queryByLabelText('Próxima imagem')).toBeNull();
        expect(screen.queryByLabelText('Imagem anterior')).toBeNull();
    });
});
