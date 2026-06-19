import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SarakFlex } from '../SarakFlex';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

describe('SarakFlex', () => {
    it('should render children correctly', () => {
        render(
            <SarakUIProvider>
                <SarakFlex data-testid="sarak-flex">
                    <span>Flex Content</span>
                </SarakFlex>
            </SarakUIProvider>
        );

        const flexElement = screen.getByTestId('sarak-flex');
        expect(flexElement).toBeInTheDocument();
        expect(screen.getByText('Flex Content')).toBeInTheDocument();
    });

    it('should apply polymorphic as prop correctly', () => {
        const { container } = render(
            <SarakUIProvider>
                <SarakFlex as="section">Section Flex</SarakFlex>
            </SarakUIProvider>
        );

        const section = container.querySelector('section');
        expect(section).toBeInTheDocument();
        expect(section).toHaveTextContent('Section Flex');
    });

    it('should pass direction and gap down to style', () => {
        render(
            <SarakUIProvider>
                <SarakFlex data-testid="flex-styles" direction="row-reverse" gap="24px">
                    <span>Flex Content</span>
                </SarakFlex>
            </SarakUIProvider>
        );

        const flexElement = screen.getByTestId('flex-styles');
        expect(flexElement.style.flexDirection).toBe('row-reverse');
        expect(flexElement.style.gap).toBe('24px');
    });
});
