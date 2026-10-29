import React, { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { SarakUIProvider } from '../../Provider/SarakUIProvider';
import { SarakShellLanguageSelector } from '../../../components/atomic/Navigation/SarakShellLanguageSelector';
import { SarakShellThemeToggle } from '../../../components/atomic/Navigation/SarakShellThemeToggle';
import { SarakValue } from '../../../components/atomic/Atoms/SarakValue';
import { SarakDatePicker } from '../../../components/atomic/Inputs/SarakDatePicker';
import { SarakCalendar } from '../../../components/atomic/DataDisplay/SarakCalendar/SarakCalendar';
import { KanbanCardContent } from '../../../components/atomic/DataDisplay/SarakKanban/KanbanCardContent';

const CURRENCY = { type: 'currency', currency: 'BRL' } as const;

const Tela = ({ onLanguageChange }: { onLanguageChange: (code: string) => void }): React.ReactElement => {
    const [language, setLanguage] = useState('pt-BR');
    return (
        <SarakUIProvider options={{ i18n: {
            languages: ['pt-BR', 'en-US'], language,
            onLanguageChange: (code) => { onLanguageChange(code); setLanguage(code); },
        } }}>
            <SarakShellLanguageSelector variant="horizontal" />
            <SarakShellThemeToggle variant="vertical" />
            <SarakValue value={1234.5} format={CURRENCY} signColor={false} />
            <SarakDatePicker mode="single" value="2026-03-10" displayFormat="MMMM yyyy" />
        </SarakUIProvider>
    );
};

describe('Um idioma só na tela (options.i18n)', () => {
    it('trocar no seletor muda juntos o texto da lib, a moeda e o mês, e avisa o sistema', () => {
        const onLanguageChange = vi.fn();
        render(<Tela onLanguageChange={onLanguageChange} />);

        expect(screen.getByText('Modo Claro')).toBeInTheDocument();
        expect(screen.getByText(/R\$\s?1\.234,50/)).toBeInTheDocument();
        expect(screen.getByText(/março 2026/i)).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /pt-br/i }));
        fireEvent.click(screen.getByText('English'));

        expect(onLanguageChange).toHaveBeenCalledWith('en-US');
        expect(screen.getByText('Light Mode')).toBeInTheDocument();
        expect(screen.getByText(/R\$\s?1,234\.50/)).toBeInTheDocument();
        expect(screen.getByText(/march 2026/i)).toBeInTheDocument();
    });

    it('idioma fora dos seis: texto em português, formatação no código pedido', () => {
        render(
            <SarakUIProvider options={{ i18n: { language: 'nl-NL', languages: ['nl-NL'] } }}>
                <SarakShellThemeToggle variant="vertical" />
                <SarakValue value={1234.5} format={{ type: 'number', options: { minimumFractionDigits: 2 } }} signColor={false} />
            </SarakUIProvider>,
        );
        expect(screen.getByText('Modo Claro')).toBeInTheDocument();
        expect(screen.getByText('1.234,50')).toBeInTheDocument();
    });

    it('sem options.i18n: o seletor lista a do tema e a formatação segue design.language (Q3)', () => {
        render(
            <SarakUIProvider config={{ language: 'en', enabledLanguages: ['pt', 'en'] }}>
                <SarakShellLanguageSelector variant="horizontal" />
                <SarakValue value={1234.5} format={CURRENCY} signColor={false} />
            </SarakUIProvider>,
        );
        expect(screen.getByText(/R\$\s?1,234\.50/)).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: /en/i }));
        expect(screen.getByText('Português')).toBeInTheDocument();
        expect(screen.getByText('English')).toBeInTheDocument();
    });
});

describe('Formatação de data pelo locale, não pelo idioma dos textos', () => {
    const DUE = new Date(2026, 11, 31);
    const DAY_MONTH = { day: '2-digit', month: 'short' } as const;

    const renderTela = (locale: string) => render(
        <SarakUIProvider options={{ i18n: { language: locale, languages: [locale] } }}>
            <SarakCalendar events={[]} defaultMonth={new Date(2026, 9, 1)} />
            <KanbanCardContent card={{ id: 'k1', dueDate: '2026-12-31' }} />
            <SarakValue value={DUE} format={{ type: 'date', options: DAY_MONTH }} signColor={false} />
        </SarakUIProvider>,
    );

    it('en-GB: valor, prazo do Kanban e mês do calendário saem no mesmo formato', () => {
        renderTela('en-GB');
        const dayMonth = DUE.toLocaleDateString('en-GB', DAY_MONTH);
        expect(dayMonth).toBe('31 Dec');
        expect(screen.getAllByText(new RegExp(dayMonth))).toHaveLength(2);
        expect(screen.getByText(/Due 31 Dec/)).toBeInTheDocument();
        expect(screen.getByText('October 2026')).toBeInTheDocument();
    });

    it('ja-JP: o calendário acompanha o valor, em vez de cair em português', () => {
        renderTela('ja-JP');
        expect(screen.getAllByText(new RegExp(DUE.toLocaleDateString('ja-JP', DAY_MONTH)))).toHaveLength(2);
        expect(screen.getByText('2026年10月')).toBeInTheDocument();
        expect(screen.queryByText(/outubro/i)).not.toBeInTheDocument();
    });
});
