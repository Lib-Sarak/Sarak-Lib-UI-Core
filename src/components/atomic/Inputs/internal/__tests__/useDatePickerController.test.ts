import { createElement, type ChangeEvent, type FocusEvent, type ReactElement, type ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SarakUIProvider } from '../../../../../core/Provider/SarakUIProvider';
import { useDatePickerController } from '../useDatePickerController';
import type { SarakDatePickerProps } from '../../SarakDatePicker';

const wrapWithProvider = ({ children }: { children: ReactNode }): ReactElement =>
    createElement(SarakUIProvider, null, children);

const renderController = (props: SarakDatePickerProps) => renderHook(
    () => useDatePickerController(props),
    { wrapper: wrapWithProvider },
);

const createChangeEvent = (value: string): ChangeEvent<HTMLInputElement> => ({
    currentTarget: { value },
} as ChangeEvent<HTMLInputElement>);

const createBlurEvent = (value: string): FocusEvent<HTMLInputElement> => ({
    currentTarget: { value },
} as FocusEvent<HTMLInputElement>);

describe('useDatePickerController', () => {
    it('sincroniza o rascunho digitado e emite a data válida no blur', () => {
        const onChange = vi.fn();
        const { result } = renderController({ value: '2026-01-15', allowTyping: true, onChange });

        expect(result.current.typedValue).toBe('15/01/2026');
        act(() => result.current.onTypedChange(createChangeEvent('20/01/2026')));
        expect(result.current.typedValue).toBe('20/01/2026');
        act(() => result.current.onTypedBlur(createBlurEvent('20/01/2026')));

        expect(onChange).toHaveBeenCalledWith('2026-01-20');
        expect(result.current.error).toBeUndefined();
    });

    it('normaliza um atalho de intervalo para a data inicial em modo single', () => {
        const onChange = vi.fn();
        const preset = { label: 'Semana inicial', value: ['2026-01-01', '2026-01-07'] as [string, string] };
        const { result } = renderController({ mode: 'single', presets: [preset], onChange });

        act(() => result.current.onSelectPreset(preset));

        expect(onChange).toHaveBeenCalledWith('2026-01-01');
    });
});
