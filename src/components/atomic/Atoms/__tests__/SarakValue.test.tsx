import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import { SarakValue } from '../SarakValue';

describe('SarakValue', () => {
    it.each([
        { value: 12, sign: 'positive', color: 'var(--sarak-status-success-color)' },
        { value: -12, sign: 'negative', color: 'var(--sarak-status-error-color)' },
        { value: 0, sign: 'neutral', color: 'var(--sarak-text-muted)' },
    ])('aplica o token CSS de $sign', ({ value, sign, color }) => {
        render(<SarakUIProvider><SarakValue value={value} /></SarakUIProvider>);

        const element = screen.getByText(String(value));
        expect(element).toHaveAttribute('data-sign', sign);
        expect((element as HTMLElement).style.color).toBe(color);
    });

    it('usa o override de locale, formata o valor e identifica seu sinal', () => {
        render(
            <SarakUIProvider>
                <SarakValue value={1234.5} format={{ type: 'number' }} locale="en" />
            </SarakUIProvider>,
        );

        expect(screen.getByText('1,234.5')).toHaveAttribute('data-sign', 'positive');
    });

    it('usa a preferência de idioma do Provider quando não há override', async () => {
        render(
            <SarakUIProvider options={{ preferences: { onLoad: () => ({ language: 'de' }) } }}>
                <SarakValue value={1234.5} format={{ type: 'number' }} />
            </SarakUIProvider>,
        );

        await waitFor(() => expect(screen.getByText('1.234,5')).toBeInTheDocument());
    });

    it('formata moeda e percentual sem perder zero e neutro', () => {
        const { rerender } = render(
            <SarakUIProvider config={{ language: 'pt-BR' }}>
                <SarakValue value={0} format={{ type: 'currency', currency: 'BRL' }} locale="pt-BR" />
            </SarakUIProvider>,
        );
        expect(screen.getByText(/R\$/)).toHaveAttribute('data-sign', 'neutral');

        rerender(
            <SarakUIProvider config={{ language: 'pt-BR' }}>
                <SarakValue value={0.125} format={{ type: 'percent' }} locale="pt-BR" />
            </SarakUIProvider>,
        );
        expect(screen.getByText('12,5%')).toBeInTheDocument();
    });
});
