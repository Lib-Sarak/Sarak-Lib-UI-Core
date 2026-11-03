import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SarakColorInput } from '../SarakColorInput';
import { contrastRatio, toPickerHex } from '../internal/colorMath';

const BLACK_ON_WHITE = 21;

describe('SarakColorInput', () => {
    it('expõe o seletor e o campo por rótulo acessível', () => {
        render(<SarakColorInput label="Cor primária" value="#336699" onChange={() => undefined} />);

        expect(screen.getByLabelText('Escolher cor: Cor primária')).toHaveValue('#336699');
        expect(screen.getByRole('textbox', { name: 'Cor primária' })).toHaveValue('#336699');
    });

    it('grava no blur só o texto que a validação do tema aceita', () => {
        const onChange = vi.fn();
        render(<SarakColorInput label="Cor" value="#336699" onChange={onChange} />);
        const field = screen.getByRole('textbox', { name: 'Cor' });

        fireEvent.change(field, { target: { value: 'rgba(10, 20, 30, 0.5)' } });
        fireEvent.blur(field);

        expect(onChange).toHaveBeenCalledWith('rgba(10, 20, 30, 0.5)');
    });

    it('recusa texto que não é cor: avisa e não chama onChange, também com Enter', () => {
        const onChange = vi.fn();
        render(<SarakColorInput label="Cor" value="#336699" onChange={onChange} />);
        const field = screen.getByRole('textbox', { name: 'Cor' });

        fireEvent.change(field, { target: { value: 'url(https://x.test/a.png)' } });
        fireEvent.keyDown(field, { key: 'Enter' });

        expect(onChange).not.toHaveBeenCalled();
        expect(screen.getByRole('alert')).toHaveTextContent('Cor inválida');
    });

    it('o seletor nativo entrega o hex escolhido', () => {
        const onChange = vi.fn();
        render(<SarakColorInput label="Cor" value="#336699" onChange={onChange} />);

        fireEvent.change(screen.getByLabelText('Escolher cor: Cor'), { target: { value: '#ff0000' } });

        expect(onChange).toHaveBeenCalledWith('#ff0000');
    });

    it('alerta o contraste abaixo do mínimo e cala quando passa', () => {
        const { rerender } = render(<SarakColorInput label="Texto" value="#777777" contrastAgainst="#888888" onChange={() => undefined} />);
        expect(screen.getByRole('status')).toHaveTextContent('abaixo do mínimo de 4.5:1');

        rerender(<SarakColorInput label="Texto" value="#000000" contrastAgainst="#ffffff" onChange={() => undefined} />);
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('respeita minContrast e não mede cor que não é literal', () => {
        const { rerender } = render(<SarakColorInput label="T" value="#767676" contrastAgainst="#ffffff" minContrast={7} onChange={() => undefined} />);
        expect(screen.getByRole('status')).toHaveTextContent('7:1');

        rerender(<SarakColorInput label="T" value="var(--x, red)" contrastAgainst="#ffffff" onChange={() => undefined} />);
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
});

describe('colorMath', () => {
    it('mede 21:1 entre preto e branco e devolve null para expressão não literal', () => {
        expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(BLACK_ON_WHITE, 1);
        expect(contrastRatio('color-mix(in srgb, red 50%, blue)', '#ffffff')).toBeNull();
    });

    it('o seletor nativo recebe o canal opaco, e o piso quando não há literal', () => {
        expect(toPickerHex('rgba(255, 0, 0, 0.4)')).toBe('#ff0000');
        expect(toPickerHex('#abc')).toBe('#aabbcc');
        expect(toPickerHex('var(--x)')).toBe('#000000');
    });
});
