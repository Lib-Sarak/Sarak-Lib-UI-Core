import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import { SarakTableErrorState } from '../SarakTableErrorState';

describe('SarakTableErrorState', () => {
    it('shows the host error message', () => {
        render(
            <SarakUIProvider>
                <SarakTableErrorState error="Unavailable" />
            </SarakUIProvider>,
        );

        expect(screen.getByText('Unavailable')).toBeInTheDocument();
    });

    it('offers retry only when the host provides a retry action', () => {
        const onRetry = vi.fn();

        render(
            <SarakUIProvider>
                <SarakTableErrorState error="Unavailable" onRetry={onRetry} />
            </SarakUIProvider>,
        );

        fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

        expect(onRetry).toHaveBeenCalledOnce();
    });
});
