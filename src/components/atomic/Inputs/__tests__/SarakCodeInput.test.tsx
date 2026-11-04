import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SarakCodeInput } from '../SarakCodeInput';

const Controlled = ({ onComplete, length }: { onComplete?: (code: string) => void; length?: number }): React.ReactElement => {
    const [value, setValue] = useState('');
    return <SarakCodeInput value={value} onChange={setValue} onComplete={onComplete} length={length} />;
};

const cell = (index: number): HTMLInputElement => screen.getByLabelText(new RegExp(`^Caractere ${index} de`)) as HTMLInputElement;

describe('SarakCodeInput', () => {
    it('uma célula por caractere, todas com nome acessível dentro de um grupo', () => {
        render(<Controlled />);

        expect(screen.getByRole('group', { name: 'Código de verificação' })).toBeInTheDocument();
        expect(screen.getAllByRole('textbox')).toHaveLength(6);
        expect(cell(1)).toHaveAttribute('inputmode', 'numeric');
    });

    it('digitar avança o foco e só aceita dígitos', () => {
        render(<Controlled />);

        fireEvent.change(cell(1), { target: { value: 'x' } });
        expect(cell(1)).toHaveValue('');

        fireEvent.change(cell(1), { target: { value: '4' } });
        expect(cell(1)).toHaveValue('4');
        expect(cell(2)).toHaveFocus();
    });

    it('colar o código inteiro preenche as células e avisa a conclusão uma vez', () => {
        const onComplete = vi.fn();
        render(<Controlled onComplete={onComplete} />);

        fireEvent.change(cell(1), { target: { value: '12-34 56' } });

        expect(onComplete).toHaveBeenCalledTimes(1);
        expect(onComplete).toHaveBeenCalledWith('123456');
        expect(cell(6)).toHaveValue('6');
    });

    it('Backspace numa célula vazia volta à anterior e apaga o caractere dela', () => {
        render(<Controlled length={4} />);
        fireEvent.change(cell(1), { target: { value: '1' } });
        fireEvent.change(cell(2), { target: { value: '2' } });

        fireEvent.keyDown(cell(3), { key: 'Backspace' });

        expect(cell(2)).toHaveFocus();
        expect(cell(2)).toHaveValue('');
        expect(cell(1)).toHaveValue('1');
    });

    it('setas movem o foco entre as células', () => {
        render(<Controlled />);
        cell(2).focus();

        fireEvent.keyDown(cell(2), { key: 'ArrowRight' });
        expect(cell(3)).toHaveFocus();

        fireEvent.keyDown(cell(3), { key: 'ArrowLeft' });
        expect(cell(2)).toHaveFocus();
    });

    it('mostra o erro do host e o liga ao grupo pelo aria-describedby', () => {
        render(<SarakCodeInput value="" onChange={() => undefined} error="Código incorreto" />);

        const alert = screen.getByRole('alert');
        expect(alert).toHaveTextContent('Código incorreto');
        expect(screen.getByRole('group')).toHaveAttribute('aria-describedby', alert.id);
    });

    it('letra sobre célula já preenchida não apaga o dígito nem muda o foco', () => {
        const onChange = vi.fn();
        render(<SarakCodeInput value="123" onChange={onChange} />);
        cell(2).focus();

        fireEvent.change(cell(2), { target: { value: 'x' } });

        expect(onChange).not.toHaveBeenCalled();
        expect(cell(2)).toHaveValue('2');
        expect(cell(2)).toHaveFocus();
    });

    it('célula depois de uma lacuna grava na posição livre e o foco acompanha o caractere', () => {
        render(<Controlled />);
        fireEvent.change(cell(1), { target: { value: '1' } });

        fireEvent.change(cell(4), { target: { value: '9' } });

        expect(cell(2)).toHaveValue('9');
        expect(cell(3)).toHaveFocus();
        expect(cell(4)).toHaveValue('');
    });
});
