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

    it('resolve o token semântico "spacing-md" para a CSS Variable real (Spec 16)', () => {
        render(
            <SarakUIProvider>
                <SarakFlex data-testid="flex-token" gap="spacing-md">
                    <span>Flex Content</span>
                </SarakFlex>
            </SarakUIProvider>
        );

        const flexElement = screen.getByTestId('flex-token');
        expect(flexElement.style.gap).toContain('--sarak-layout-gap-md');
    });

    it('avisa e cai no default quando o token é inventado, sem quebrar a tela (Spec 16)', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        render(
            <SarakUIProvider>
                <SarakFlex data-testid="flex-invalid" gap="spacing-xxl">
                    <span>Flex Content</span>
                </SarakFlex>
            </SarakUIProvider>
        );

        const flexElement = screen.getByTestId('flex-invalid');
        expect(screen.getByText('Flex Content')).toBeInTheDocument();
        expect(flexElement.style.gap).not.toBe('spacing-xxl');
        expect(warn).toHaveBeenCalled();
        warn.mockRestore();
    });
});
