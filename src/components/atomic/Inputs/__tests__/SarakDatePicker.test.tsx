import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import { SarakDatePicker } from '../SarakDatePicker';

const renderDP = (props: Partial<React.ComponentProps<typeof SarakDatePicker>> = {}): ReturnType<typeof render> =>
    render(
        <SarakUIProvider>
            <SarakDatePicker label="Data" {...props} />
        </SarakUIProvider>,
    );

const openCalendar = (): void => { fireEvent.click(screen.getByRole('button', { name: /Data|Selecione/i })); };

describe('SarakDatePicker', () => {
    it('deve exibir o valor formatado conforme displayFormat (i18n via JSON)', () => {
        renderDP({ value: '2026-01-15', displayFormat: 'dd/MM/yyyy' });
        expect(screen.getByText('15/01/2026')).toBeInTheDocument();
    });

    it('deve abrir o popover e selecionar um dia (modo single)', () => {
        const onChange = vi.fn();
        renderDP({ value: '2026-01-15', onChange });
        openCalendar();
        const grid = screen.getByRole('grid');
        fireEvent.click(within(grid).getByText('20'));
        expect(onChange).toHaveBeenCalledWith('2026-01-20');
    });

    it('deve navegar por setas e selecionar com Enter (teclado, Spec 41)', () => {
        const onChange = vi.fn();
        renderDP({ value: '2026-01-15', onChange });
        openCalendar();
        const grid = screen.getByRole('grid');
        // Foco inicial = dia 15; ArrowRight → 16; Enter seleciona.
        fireEvent.keyDown(grid, { key: 'ArrowRight' });
        fireEvent.keyDown(grid, { key: 'Enter' });
        expect(onChange).toHaveBeenCalledWith('2026-01-16');
    });

    it('deve montar um intervalo em dois cliques (modo range)', () => {
        const onChange = vi.fn();
        renderDP({ mode: 'range', value: '2026-01-10', onChange });
        openCalendar();
        const grid = screen.getByRole('grid');
        fireEvent.click(within(grid).getByText('20'));
        expect(onChange).toHaveBeenCalledWith(['2026-01-10', '2026-01-20']);
    });
});

describe('SarakDatePicker — limites e regras de dias', () => {
    it('desabilita dias fora de min/max e os informados por isDateDisabled', () => {
        const onChange = vi.fn();
        renderDP({
            value: '2026-01-15',
            min: '2026-01-16',
            max: '2026-01-20',
            isDateDisabled: (iso) => iso === '2026-01-18',
            onChange,
        });
        openCalendar();
        const grid = screen.getByRole('grid');
        const beforeMin = within(grid).getByRole('gridcell', { name: '15' });
        const disabledByRule = within(grid).getByRole('gridcell', { name: '18' });
        const afterMax = within(grid).getByRole('gridcell', { name: '21' });

        expect(beforeMin).toBeDisabled();
        expect(disabledByRule).toBeDisabled();
        expect(afterMax).toBeDisabled();
        fireEvent.click(disabledByRule);
        expect(onChange).not.toHaveBeenCalled();
    });
});

describe('SarakDatePicker — atalhos', () => {
    it('aplica um atalho de intervalo no modo range', () => {
        const onChange = vi.fn();
        renderDP({
            mode: 'range',
            presets: [{ label: 'Semana inicial', value: ['2026-01-01', '2026-01-07'] }],
            onChange,
        });
        openCalendar();
        fireEvent.click(screen.getByRole('button', { name: 'Semana inicial' }));

        expect(onChange).toHaveBeenCalledWith(['2026-01-01', '2026-01-07']);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('reduz um atalho de intervalo para a data inicial no modo single', () => {
        const onChange = vi.fn();
        renderDP({
            mode: 'single',
            presets: [{ label: 'Semana inicial', value: ['2026-01-01', '2026-01-07'] }],
            onChange,
        });
        openCalendar();
        fireEvent.click(screen.getByRole('button', { name: 'Semana inicial' }));

        expect(onChange).toHaveBeenCalledWith('2026-01-01');
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
});

describe('SarakDatePicker — digitação inválida', () => {
    it('aceita digitação em displayFormat e associa erro quando a data sai do limite', () => {
        const onChange = vi.fn();
        renderDP({ allowTyping: true, min: '2026-01-16', onChange });
        const input = screen.getByRole('textbox', { name: 'Data' });

        fireEvent.change(input, { target: { value: '15/01/2026' } });
        fireEvent.blur(input);

        const alert = screen.getByRole('alert');
        expect(onChange).not.toHaveBeenCalled();
        expect(input).toHaveAttribute('aria-invalid', 'true');
        expect(input).toHaveAttribute('aria-describedby', alert.id);
        expect(alert).toHaveTextContent(/fora dos limites/i);
    });
});

describe('SarakDatePicker — digitação válida e limpeza', () => {
    it('emite data digitada válida e limpa valor único ou intervalo', () => {
        const onChange = vi.fn();
        const { rerender } = render(
            <SarakUIProvider>
                <SarakDatePicker label="Data" allowTyping clearable value="2026-01-15" onChange={onChange} />
            </SarakUIProvider>,
        );
        const input = screen.getByRole('textbox', { name: 'Data' });
        fireEvent.change(input, { target: { value: '20/01/2026' } });
        fireEvent.blur(input);
        expect(onChange).toHaveBeenCalledWith('2026-01-20');

        fireEvent.click(screen.getByRole('button', { name: 'Limpar data' }));
        expect(onChange).toHaveBeenLastCalledWith('');

        rerender(
            <SarakUIProvider>
                <SarakDatePicker label="Período" mode="range" clearable value={['2026-01-01', '2026-01-07']} onChange={onChange} />
            </SarakUIProvider>,
        );
        fireEvent.click(screen.getByRole('button', { name: 'Limpar data' }));
        expect(onChange).toHaveBeenLastCalledWith(['', '']);
    });
});

describe('SarakDatePicker — rótulo acessível', () => {
    it('liga o rótulo visível ao controle que abre o calendário', () => {
        renderDP({ label: 'Data limite' });
        const trigger = screen.getByRole('button', { name: 'Data limite' });
        expect(trigger).toHaveAttribute('aria-labelledby', screen.getByText('Data limite').id);
    });
});

// os textos da própria lib seguem o idioma que vale.
describe('SarakDatePicker — idioma que vale', () => {
    it('sem valor, o placeholder sai em português por padrão', () => {
        render(
            <SarakUIProvider>
                <SarakDatePicker />
            </SarakUIProvider>,
        );
        expect(screen.getByText('Selecione…')).toBeInTheDocument();
    });

    it('sem valor, o placeholder sai em inglês com `config.language: "en"`', () => {
        render(
            <SarakUIProvider config={{ language: 'en' }}>
                <SarakDatePicker />
            </SarakUIProvider>,
        );
        expect(screen.getByText('Select…')).toBeInTheDocument();
    });

    it('o placeholder do consumidor vence sempre, e a lib não o traduz', () => {
        render(
            <SarakUIProvider config={{ language: 'en' }}>
                <SarakDatePicker placeholder="Meu placeholder" />
            </SarakUIProvider>,
        );
        expect(screen.getByText('Meu placeholder')).toBeInTheDocument();
    });
});

describe('Erro de campo pelo SarakFieldError', () => {
    it('com `error`, há um role="alert" com o texto e o controle o referencia', () => {
        renderDP({ error: "Campo obrigatório" });
        const alert = screen.getByRole('alert');
        expect(alert).toHaveTextContent('Campo obrigatório');
        expect(alert.querySelector('svg')).not.toBeNull();
        expect(alert.id).toMatch(/-error$/);
        expect(screen.getByRole('button')).toHaveAttribute('aria-describedby', alert.id);
    });

    it('sem `error`, nada é renderizado', () => {
        renderDP();
        expect(screen.queryByRole('alert')).toBeNull();
    });
});
