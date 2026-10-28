import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { PaletteCreator } from '../PaletteCreator';

const setup = () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(<PaletteCreator initialBase="#2563eb" onConfirm={onConfirm} onClose={onClose} />);
    return { onConfirm, onClose };
};

describe('PaletteCreator', () => {
    it('confirma o padrão (análoga, só a cor-base) no formato custom:', () => {
        const { onConfirm } = setup();
        fireEvent.click(screen.getByRole('button', { name: 'Usar esta paleta' }));
        expect(onConfirm).toHaveBeenCalledWith('custom:analogous:#2563eb');
    });

    it('a cor-base e o tipo entram no valor', () => {
        const { onConfirm } = setup();
        fireEvent.change(screen.getByLabelText('Seletor de Cor-base'), { target: { value: '#aa3366' } });
        fireEvent.change(screen.getByLabelText('Tipo de paleta'), { target: { value: 'complementary' } });
        fireEvent.click(screen.getByRole('button', { name: 'Usar esta paleta' }));
        expect(onConfirm).toHaveBeenCalledWith('custom:complementary:#aa3366');
    });

    it('secundária e acento só entram quando ligados, separados por vírgula', () => {
        const { onConfirm } = setup();
        expect(screen.queryByLabelText('Seletor de Cor secundária')).not.toBeInTheDocument();
        fireEvent.click(screen.getByLabelText('Definir a cor secundária'));
        fireEvent.click(screen.getByLabelText('Definir o acento'));
        fireEvent.change(screen.getByLabelText('Seletor de Cor de acento'), { target: { value: '#f59e0b' } });
        fireEvent.click(screen.getByRole('button', { name: 'Usar esta paleta' }));
        expect(onConfirm).toHaveBeenCalledWith('custom:analogous:#2563eb,sec=#2563eb,acc=#f59e0b');
    });

    it('desligar a secundária a tira do valor', () => {
        const { onConfirm } = setup();
        const toggle = screen.getByLabelText('Definir a cor secundária');
        fireEvent.click(toggle);
        fireEvent.click(toggle);
        fireEvent.click(screen.getByRole('button', { name: 'Usar esta paleta' }));
        expect(onConfirm).toHaveBeenCalledWith('custom:analogous:#2563eb');
    });

    it('oferece os cinco tipos e a prévia nomeada', () => {
        setup();
        expect(screen.getByLabelText('Tipo de paleta').querySelectorAll('option')).toHaveLength(5);
        expect(screen.getByRole('img', { name: 'Prévia da paleta: Paleta criada' })).toBeInTheDocument();
    });

    it('o Enter no campo de cor confirma só a cor, nunca a paleta', () => {
        const { onConfirm } = setup();
        const field = screen.getByLabelText('Cor de Cor-base');
        fireEvent.change(field, { target: { value: '#aa3366' } });
        fireEvent.keyDown(field, { key: 'Enter' });
        expect(onConfirm).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole('button', { name: 'Usar esta paleta' }));
        expect(onConfirm).toHaveBeenCalledWith('custom:analogous:#aa3366');
    });

    it('Fechar não confirma', () => {
        const { onConfirm, onClose } = setup();
        fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(onConfirm).not.toHaveBeenCalled();
    });
});
