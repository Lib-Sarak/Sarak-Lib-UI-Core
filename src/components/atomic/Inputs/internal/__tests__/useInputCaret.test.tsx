import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SarakInput } from '../../SarakInput';
import { useInputCaret } from '../useInputCaret';

const InputCaretHarness = (): React.ReactElement => {
    const [value, setValue] = useState('123.456');
    const { inputContainerRef, captureCaret } = useInputCaret(value);

    return (
        <div ref={inputContainerRef}>
            <SarakInput
                aria-label="Valor"
                value={value}
                onChange={(event) => {
                    captureCaret(event.currentTarget.value, event.currentTarget.selectionStart);
                    setValue(event.currentTarget.value.replace(/\D/g, ''));
                }}
            />
        </div>
    );
};

describe('useInputCaret', () => {
    it('restaura o cursor depois dos mesmos dígitos quando a formatação muda', () => {
        render(<InputCaretHarness />);
        const input = screen.getByRole('textbox', { name: 'Valor' }) as HTMLInputElement;
        fireEvent.focus(input);
        input.setSelectionRange(5, 5);
        fireEvent.change(input, { target: { value: '1234' } });
        expect(input).toHaveValue('1234');
        expect(input.selectionStart).toBe(4);
    });
});
