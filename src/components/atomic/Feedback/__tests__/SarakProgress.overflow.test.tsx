import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SarakProgress } from '../SarakProgress';

const OVER_VALUE = 150;
const MAX = 100;

describe('SarakProgress — allowOverflow, showValue e valueFormat', () => {
    it('sem allowOverflow, o valor acima do máximo é limitado como na rc.3', () => {
        const { container } = render(<SarakProgress value={OVER_VALUE} max={MAX} />);
        const bar = screen.getByRole('progressbar');

        expect(bar).toHaveAttribute('aria-valuenow', String(MAX));
        expect(container.querySelector('[data-overflow]')).toBeNull();
    });

    it('com allowOverflow, aria-valuenow leva o valor real, a barra enche e o excesso usa o tom de alerta', () => {
        const { container } = render(<SarakProgress value={OVER_VALUE} max={MAX} allowOverflow />);
        const bar = screen.getByRole('progressbar');
        const fill = bar.firstElementChild as HTMLElement;
        const excess = container.querySelector('[data-overflow="true"]') as HTMLElement;

        expect(bar).toHaveAttribute('aria-valuenow', String(OVER_VALUE));
        expect(parseFloat(fill.style.width) + parseFloat(excess.style.width)).toBeCloseTo(MAX);
        expect(excess.style.backgroundColor).toContain('--sarak-status-warning-color');
    });

    it('com allowOverflow e valor dentro do máximo, não há marca de excesso', () => {
        const { container } = render(<SarakProgress value={40} max={MAX} allowOverflow />);

        expect(container.querySelector('[data-overflow]')).toBeNull();
    });

    it('showValue mostra o percentual de value/max por padrão e valueFormat muda o formato', () => {
        const percent = render(<SarakProgress value={25} max={MAX} showValue />);
        expect(screen.getByText('25%')).toBeInTheDocument();
        percent.unmount();
        render(<SarakProgress value={1250} max={5000} showValue valueFormat={{ type: 'number' }} />);
        expect(screen.getByText('1.250')).toBeInTheDocument();
    });

    it('omitido showValue, não mostra valor', () => {
        const { container } = render(<SarakProgress value={25} max={MAX} />);

        expect(container.textContent).toBe('');
    });
});
