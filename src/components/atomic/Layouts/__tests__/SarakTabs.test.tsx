import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SarakTabs } from '../SarakTabs';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

describe('SarakTabs', () => {
    const mockItems = [
        { id: 'tab1', label: 'Tab 1', content: <div data-testid="content-1">Content 1</div> },
        { id: 'tab2', label: 'Tab 2', content: <div data-testid="content-2">Content 2</div> },
    ];

    it('should render all tab labels', () => {
        render(
            <SarakUIProvider>
                <SarakTabs items={mockItems} />
            </SarakUIProvider>
        );

        expect(screen.getByRole('tab', { name: /Tab 1/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /Tab 2/i })).toBeInTheDocument();
    });

    it('should switch tabs on click', () => {
        render(
            <SarakUIProvider>
                <SarakTabs items={mockItems} />
            </SarakUIProvider>
        );

        const tab2 = screen.getByRole('tab', { name: /Tab 2/i });
        fireEvent.click(tab2);

        // Verifica se o painel da tab 2 se tornou visível
        const panel2 = screen.getByTestId('content-2');
        expect(panel2).toBeVisible();
    });

    it('should render vertically if alignment is vertical', () => {
        const { container } = render(
            <SarakUIProvider>
                <SarakTabs items={mockItems} alignment="vertical" />
            </SarakUIProvider>
        );

        const tablist = container.querySelector('[role="tablist"]');
        expect(tablist).toHaveAttribute('aria-orientation', 'vertical');
    });
});
