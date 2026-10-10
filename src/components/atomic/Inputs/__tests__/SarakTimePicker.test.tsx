import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import { SarakTimePicker } from '../SarakTimePicker';

const renderTP = (props: Partial<React.ComponentProps<typeof SarakTimePicker>> = {}): ReturnType<typeof render> =>
    render(
        <SarakUIProvider>
            <SarakTimePicker label="Horário" {...props} />
        </SarakUIProvider>,
    );

describe('SarakTimePicker', () => {
    it('liga o rótulo do campo ao grupo de controles', () => {
        renderTP();
        expect(screen.getByRole('group', { name: 'Horário' })).toHaveAttribute(
            'aria-labelledby',
            screen.getByText('Horário').id,
        );
    });

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

describe('Erro de campo pelo SarakFieldError', () => {
    it('com `error`, há um role="alert" com o texto e o controle o referencia', () => {
        render(<SarakTimePicker error="Campo obrigatório" />);
        const alert = screen.getByRole('alert');
        expect(alert).toHaveTextContent('Campo obrigatório');
        expect(alert.querySelector('svg')).not.toBeNull();
        expect(alert.id).toMatch(/-error$/);
        expect(screen.getByLabelText('Hora')).toHaveAttribute('aria-describedby', alert.id);
    });

    it('sem `error`, nada é renderizado', () => {
        render(<SarakTimePicker />);
        expect(screen.queryByRole('alert')).toBeNull();
    });
});

describe('SarakTimePicker — texto da lib segue o idioma', () => {
    it('o nome do grupo, sem `label`, muda com o idioma', () => {
        const { rerender } = render(<SarakTimePicker />);
        expect(screen.getByRole('group', { name: 'Horário' })).toBeInTheDocument();
        expect(screen.getByLabelText('Hora')).toBeInTheDocument();
        expect(screen.getByLabelText('Minuto')).toBeInTheDocument();

        rerender(
            <SarakUIProvider config={{ language: 'en' }}>
                <SarakTimePicker />
            </SarakUIProvider>,
        );
        expect(screen.getByRole('group', { name: 'Time' })).toBeInTheDocument();
        expect(screen.getByLabelText('Hour')).toBeInTheDocument();
        expect(screen.getByLabelText('Minute')).toBeInTheDocument();
    });
});
