import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import { SarakDataFreshness } from '../SarakDataFreshness';

describe('SarakDataFreshness', () => {
    it('renders the reading timestamp and stale status', () => {
        render(
            <SarakUIProvider config={{ language: 'pt-BR' }}>
                <SarakDataFreshness updatedAt="2026-10-10T22:12:00.000Z" stale />
            </SarakUIProvider>,
        );

        expect(screen.getByRole('time')).toHaveAttribute('datetime', '2026-10-10T22:12:00.000Z');
        expect(screen.getByRole('status')).toHaveTextContent('Desatualizado');
    });

    it('renders nothing when no valid timestamp is supplied', () => {
        const { container } = render(<SarakDataFreshness updatedAt="not-a-date" />);

        expect(container).toBeEmptyDOMElement();
    });
});
