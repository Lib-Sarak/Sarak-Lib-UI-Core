import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import { SarakDatePicker } from '../SarakDatePicker';

const renderDP = (props: Partial<React.ComponentProps<typeof SarakDatePicker>> = {}) =>
    render(
        <SarakUIProvider>
            <SarakDatePicker label="Data" {...props} />
        </SarakUIProvider>,
    );

const openCalendar = () => fireEvent.click(screen.getByRole('button', { name: /Data|Selecione/i }));

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
