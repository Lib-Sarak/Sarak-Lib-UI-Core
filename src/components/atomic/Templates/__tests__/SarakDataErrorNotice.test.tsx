import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import { SarakDataErrorNotice } from '../SarakDataErrorNotice';

describe('SarakDataErrorNotice', () => {
    it('shows the load error and invokes retry when provided', () => {
        const onRetry = vi.fn();
        render(
            <SarakUIProvider>
                <SarakDataErrorNotice error="Unavailable" onRetry={onRetry} />
            </SarakUIProvider>,
        );

        expect(screen.getByText('Unavailable')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
        expect(onRetry).toHaveBeenCalledOnce();
    });

    it('does not render a retry action without a callback', () => {
        render(
            <SarakUIProvider>
                <SarakDataErrorNotice error="Unavailable" />
            </SarakUIProvider>,
        );

        expect(screen.getByText('Unavailable')).toBeInTheDocument();
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
});
