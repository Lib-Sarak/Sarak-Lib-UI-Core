import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DatePickerView, type DatePickerViewProps } from '../DatePickerView';

const createViewProps = (overrides: Partial<DatePickerViewProps> = {}): DatePickerViewProps => ({
    fieldId: 'date',
    label: 'Data',
    labelId: 'date-label',
    mode: 'single',
    display: '12/03/2025',
    typedValue: '12/03/2025',
    placeholder: 'Selecione…',
    start: new Date(2025, 2, 12),
    end: null,
    weekStartsOn: 0,
    disabled: false,
    error: 'Campo obrigatório',
    allowTyping: false,
    clearable: true,
    hasValue: true,
    open: false,
    presets: [],
    className: '',
    containerRef: { current: null },
    onDialogKeyDown: vi.fn(),
    onToggle: vi.fn(),
    onTypedChange: vi.fn(),
    onTypedBlur: vi.fn(),
    onClear: vi.fn(),
    onSelectDay: vi.fn(),
    onSelectPreset: vi.fn(),
    ...overrides,
});

describe('DatePickerView', () => {
    it('liga o rótulo e o erro ao campo e emite a limpeza', () => {
        const onClear = vi.fn();
        render(<DatePickerView {...createViewProps({ onClear })} />);

        expect(screen.getByRole('button', { name: 'Data' })).toHaveAttribute('aria-describedby', 'date-error');
        fireEvent.click(screen.getByRole('button', { name: 'Limpar data' }));
        expect(onClear).toHaveBeenCalledOnce();
    });

    it('mostra um campo digitável com nome acessível', () => {
        render(<DatePickerView {...createViewProps({ allowTyping: true, error: undefined })} />);

        expect(screen.getByRole('textbox', { name: 'Data' })).toHaveValue('12/03/2025');
        expect(screen.getByRole('button', { name: 'Calendário' })).toBeInTheDocument();
    });
});
