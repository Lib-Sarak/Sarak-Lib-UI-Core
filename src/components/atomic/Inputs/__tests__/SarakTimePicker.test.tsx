import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import { SarakTimePicker } from '../SarakTimePicker';

const renderTP = (props: Partial<React.ComponentProps<typeof SarakTimePicker>> = {}) =>
    render(
        <SarakUIProvider>
            <SarakTimePicker label="Horário" {...props} />
        </SarakUIProvider>,
    );

describe('SarakTimePicker', () => {
    it('deve refletir o valor HH:mm nos campos', () => {
        renderTP({ value: '09:30' });
        expect(screen.getByLabelText('Hora')).toHaveValue('09');
        expect(screen.getByLabelText('Minuto')).toHaveValue('30');
    });

    it('deve emitir HH:mm ao alterar a hora', () => {
        const onChange = vi.fn();
        renderTP({ value: '09:30', onChange });
        fireEvent.change(screen.getByLabelText('Hora'), { target: { value: '14' } });
        expect(onChange).toHaveBeenCalledWith('14:30');
    });

    it('deve respeitar o passo de minutos', () => {
        renderTP({ minuteStep: 15 });
        const minute = screen.getByLabelText('Minuto');
        const options = Array.from(minute.querySelectorAll('option'))
            .map((o) => o.getAttribute('value'))
            .filter((v) => v !== '');
        expect(options).toEqual(['00', '15', '30', '45']);
    });
});
