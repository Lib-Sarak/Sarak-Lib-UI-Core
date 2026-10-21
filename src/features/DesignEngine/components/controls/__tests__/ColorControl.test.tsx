import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { ColorControl } from '../ColorControl';
import { TypographySchema } from '../../../../../core/Design/schema/typography';

describe('ColorControl', () => {
    it('exibe rótulo com tamanho mínimo, caixa e espaçamento normais', () => {
        render(<ColorControl label="Cor de fundo" value="#ffffff" onChange={() => undefined} />);

        const label = screen.getByText('Cor de fundo');
        expect(label).toHaveClass('normal-case', 'tracking-normal');
        expect(label.className).toContain('--sarak-type-scale-caption');

        const captionToken = TypographySchema.tokens.find(({ id }) => id === 'typeScaleCaption');
        expect(Number(captionToken?.defaultValue)).toBeGreaterThanOrEqual(12);
    });

    it('mostra a cor que o valor desenha — hsla() com o alfa — e não um branco que ele nunca teve', () => {
        render(<ColorControl label="Cor" value="hsla(240, 100%, 50%, 0.4)" onChange={() => undefined} />);
        expect(screen.getByLabelText('Seletor de Cor')).toHaveValue('#0000ff');
        expect(screen.getByLabelText('Opacidade de Cor')).toHaveValue('40');
    });

    it('a reserva literal de um var() chega ao seletor com o alfa dela, e mexer no seletor o preserva', () => {
        const onChange = vi.fn();
        render(<ColorControl label="Cor" value="var(--sarak-x, rgba(10, 20, 30, 0.5))" onChange={onChange} />);
        expect(screen.getByLabelText('Seletor de Cor')).toHaveValue('#0a141e');
        expect(screen.getByLabelText('Opacidade de Cor')).toHaveValue('50');

        fireEvent.change(screen.getByLabelText('Seletor de Cor'), { target: { value: '#ff0000' } });
        expect(onChange).toHaveBeenCalledWith('rgba(255, 0, 0, 0.5)');
    });

    it('o texto é a verdade: um var() vindo do tema aparece como está, sem ser trocado por hex', () => {
        render(<ColorControl label="Cor" value="var(--sarak-text-main, #ffffff)" onChange={() => undefined} />);
        expect(screen.getByLabelText('Cor de Cor')).toHaveValue('var(--sarak-text-main, #ffffff)');
    });
});

