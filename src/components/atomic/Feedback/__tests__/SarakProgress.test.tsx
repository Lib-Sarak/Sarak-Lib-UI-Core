import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SarakProgress } from '../SarakProgress';

const WARNING_THRESHOLD = 50;
const SUCCESS_THRESHOLD = 75;
const COMPLETED_VALUE = 80;
const PROGRESS_MAX = 100;

describe('SarakProgress', () => {
    it('expõe valor acessível e aplica o limiar semântico ativo', () => {
        render(
            <SarakProgress
                label="Envio"
                value={COMPLETED_VALUE}
                max={PROGRESS_MAX}
                thresholds={[
                    { value: WARNING_THRESHOLD, variant: 'warning' },
                    { value: SUCCESS_THRESHOLD, variant: 'success' },
                ]}
            />,
        );

        const progress = screen.getByRole('progressbar', { name: 'Envio' });
        const fill = progress.firstElementChild as HTMLElement;

        expect(progress).toHaveAttribute('aria-valuemin', '0');
        expect(progress).toHaveAttribute('aria-valuemax', String(PROGRESS_MAX));
        expect(progress).toHaveAttribute('aria-valuenow', String(COMPLETED_VALUE));
        expect(fill.style.width).toBe('80%');
        expect(fill.style.backgroundColor).toContain('--sarak-status-success-color');
    });

    it('omite aria-valuenow no modo indeterminado', () => {
        render(<SarakProgress label="Enviando arquivo" indeterminate />);

        const progress = screen.getByRole('progressbar', { name: 'Enviando arquivo' });
        expect(progress).toHaveAttribute('data-indeterminate', 'true');
        expect(progress).not.toHaveAttribute('aria-valuenow');
        expect(progress.firstElementChild).toHaveAttribute('aria-hidden', 'true');
    });

    it('usa o rótulo acessível traduzido quando não há label', () => {
        render(<SarakProgress />);

        expect(screen.getByRole('progressbar', { name: 'Progresso' })).toBeInTheDocument();
    });
});
