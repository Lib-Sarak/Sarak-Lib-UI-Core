import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import SarakUIProvider from '../../../../../core/Provider/SarakUIProvider';
import { SelectControl, optionValue } from '../SelectControl';

const renderSelect = (onChange = vi.fn()) => render(
    <SarakUIProvider options={{ fonts: 'none' }}>
        <SelectControl label="Posição" options={[{ value: 'left', label: 'Esquerda' }, { id: 'right', label: 'Direita' }, 'floating']} value="left" onChange={onChange} />
    </SarakUIProvider>,
);

describe('SelectControl', () => {
    it('cada opção mostra o rótulo e grava o valor (ou o id, ou o próprio texto)', () => {
        const onChange = vi.fn();
        renderSelect(onChange);
        const select = screen.getByRole('combobox', { name: 'Posição' });
        expect(Array.from(select.querySelectorAll('option')).map((option) => [option.value, option.textContent])).toEqual([['left', 'Esquerda'], ['right', 'Direita'], ['floating', 'floating']]);
        fireEvent.change(select, { target: { value: 'right' } });
        expect(onChange).toHaveBeenCalledWith('right');
    });

    it('a lista ocupa a largura da linha: nunca passa da borda da coluna com a opção mais longa', () => {
        renderSelect();
        expect(screen.getByRole('combobox', { name: 'Posição' }).className).toContain('w-full');
    });

    it('optionValue prefere o value e cai no id', () => {
        expect(optionValue({ value: 'a', id: 'b' })).toBe('a');
        expect(optionValue({ id: 'b' })).toBe('b');
        expect(optionValue('c')).toBe('c');
    });
});
