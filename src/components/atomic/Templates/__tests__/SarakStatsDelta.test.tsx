import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SarakStats } from '../SarakStats';
import { SarakStatsDelta } from '../SarakStatsDelta';

const EXPENSE_RISE = 8;
const EXPENSE_TOTAL = 4200;
const TARGET = 5000;
const NBSP = / /g;

const deltaOf = (container: HTMLElement): HTMLElement => container.querySelector('[data-tone]') as HTMLElement;

describe('SarakStatsDelta — semântica de cor e seta', () => {
    it('despesa subindo com goodDirection down sai no tom de erro com a seta para cima', () => {
        const { container } = render(<SarakStatsDelta delta={EXPENSE_RISE} goodDirection="down" />);
        const delta = deltaOf(container);

        expect(delta.dataset.tone).toBe('error');
        expect(delta.dataset.direction).toBe('up');
        expect(delta.style.color).toBe('var(--sarak-status-error-color)');
    });

    it('despesa caindo com goodDirection down sai verde com a seta para baixo', () => {
        const { container } = render(<SarakStatsDelta delta={-EXPENSE_RISE} goodDirection="down" />);

        expect(deltaOf(container).dataset).toMatchObject({ tone: 'success', direction: 'down' });
    });

    it('por padrão a alta é boa e delta zero é neutro e sem seta', () => {
        const up = render(<SarakStatsDelta delta={1} />);
        expect(deltaOf(up.container).dataset.tone).toBe('success');
        const flat = render(<SarakStatsDelta delta={0} />);
        expect(deltaOf(flat.container).dataset).toMatchObject({ tone: 'neutral', direction: 'flat' });
        expect(flat.container.querySelector('svg')).toBeNull();
    });

    it('deltaFormat percent mostra a variação percentual e deltaLabel o texto depois', () => {
        render(<SarakStatsDelta delta={0.12} format={{ type: 'percent' }} label="vs. mês anterior" />);

        expect(screen.getByText('12%')).toBeInTheDocument();
        expect(screen.getByText('vs. mês anterior')).toBeInTheDocument();
    });
});

describe('SarakStats — props novas da métrica', () => {
    it('goodDirection down inverte a cor da métrica, nunca a seta', () => {
        const { container } = render(
            <SarakStats data={{ despesa: EXPENSE_TOTAL }} metrics={{ despesa: { delta: EXPENSE_RISE, goodDirection: 'down' } }} />,
        );

        expect(deltaOf(container).dataset).toMatchObject({ tone: 'error', direction: 'up' });
    });

    it('sem prop nova de delta, mantém o desenho da rc.3 (sem seta nem data-tone)', () => {
        const { container } = render(<SarakStats data={{ total: 1 }} metrics={{ total: { delta: 3 } }} />);

        expect(deltaOf(container)).toBeNull();
        expect(container.textContent).toContain('+3');
    });

    it('signColor false tira a cor do valor', () => {
        const { container } = render(
            <SarakStats data={{ saldo: -EXPENSE_RISE }} metrics={{ saldo: { signColor: false } }} />,
        );

        expect(container.querySelector('[data-sign]')).toBeNull();
    });

    it('target mostra a barra até a meta e "Meta: …" no format da métrica', () => {
        const { container } = render(
            <SarakStats
                data={{ receita: EXPENSE_TOTAL }}
                metrics={{ receita: { format: { type: 'currency', currency: 'BRL' }, target: TARGET } }}
            />,
        );
        const bar = screen.getByRole('progressbar');

        expect(bar).toHaveAttribute('aria-valuemax', String(TARGET));
        expect(bar).toHaveAttribute('aria-valuenow', String(EXPENSE_TOTAL));
        expect((container.textContent ?? '').replace(NBSP, ' ')).toContain('Meta: R$ 5.000,00');
    });

    it('targetLabel troca a palavra Meta e sem target não há barra', () => {
        const withLabel = render(
            <SarakStats data={{ receita: 1 }} metrics={{ receita: { target: 2, targetLabel: 'Meta do mês' } }} />,
        );
        expect(withLabel.container.textContent).toContain('Meta do mês:');
        withLabel.unmount();
        render(<SarakStats data={{ receita: 1 }} />);
        expect(screen.queryByRole('progressbar')).toBeNull();
    });

    it('sparkline desenha o micro-gráfico sob o valor', () => {
        const { container } = render(<SarakStats data={{ receita: 1 }} metrics={{ receita: { sparkline: [1, 3, 2] } }} />);

        expect(container.querySelectorAll('polyline')).toHaveLength(1);
    });
});
