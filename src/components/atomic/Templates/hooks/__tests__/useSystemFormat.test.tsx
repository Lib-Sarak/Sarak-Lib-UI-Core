import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SarakUIProvider } from '../../../../../core/Provider/SarakUIProvider';
import { formatSystemDuration, useSystemFormat } from '../useSystemFormat';

const Probe = ({ value }: { value: string }): React.ReactElement => {
    const format = useSystemFormat();
    return <p data-testid="out">{`${format.date(value)}|${format.number(1234.5)}|${format.dateTime('lixo')}`}</p>;
};

describe('formatSystemDuration', () => {
    it('escolhe a unidade pela grandeza', () => {
        expect(formatSystemDuration(12_000)).toBe('12 s');
        expect(formatSystemDuration(125_000)).toBe('2 min 05 s');
        expect(formatSystemDuration(3_720_000)).toBe('1 h 02 min');
    });

    it('valor inválido ou negativo vira zero', () => {
        expect(formatSystemDuration(-5)).toBe('0 s');
        expect(formatSystemDuration(Number.NaN)).toBe('0 s');
    });
});

describe('useSystemFormat', () => {
    it('sem Provider, formata em pt-BR e devolve vazio para data inválida', () => {
        render(<Probe value="2026-03-05T12:00:00Z" />);

        expect(screen.getByTestId('out')).toHaveTextContent('1.234,5|');
        expect(screen.getByTestId('out').textContent?.endsWith('|')).toBe(true);
    });

    it('segue o idioma do Provider', () => {
        render(
            <SarakUIProvider options={{ fonts: 'none', i18n: { languages: ['en-US'], language: 'en-US' } }}>
                <Probe value="2026-03-05T12:00:00Z" />
            </SarakUIProvider>,
        );

        expect(screen.getByTestId('out')).toHaveTextContent('1,234.5');
    });
});
