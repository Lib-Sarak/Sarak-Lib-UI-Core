import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SarakDrawer } from '../SarakDrawer';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

describe('SarakDrawer', () => {
    it('should not render when isOpen is false', () => {
        render(
            <SarakUIProvider>
                <SarakDrawer isOpen={false} onClose={() => {}}>
                    <div data-testid="drawer-content">Drawer Content</div>
                </SarakDrawer>
            </SarakUIProvider>
        );

        expect(screen.queryByTestId('drawer-content')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
        render(
            <SarakUIProvider>
                <SarakDrawer isOpen={true} onClose={() => {}}>
                    <div data-testid="drawer-content">Drawer Content</div>
                </SarakDrawer>
            </SarakUIProvider>
        );

        expect(screen.getByTestId('drawer-content')).toBeInTheDocument();
    });

    it('should call onClose when clicking the overlay', () => {
        const onCloseMock = vi.fn();
        render(
            <SarakUIProvider>
                <SarakDrawer isOpen={true} onClose={onCloseMock}>
                    <div data-testid="drawer-content">Drawer Content</div>
                </SarakDrawer>
            </SarakUIProvider>
        );

        // O overlay (primeiro filho do portal) tem o onClick de fechar
        const overlay = screen.getByTestId('sarak-drawer-overlay');
        fireEvent.click(overlay);
        expect(onCloseMock).toHaveBeenCalled();
    });

    it('overlay anima a opacidade via SarakScrim (conserto §2.3 — plan-23)', () => {
        render(
            <SarakUIProvider>
                <SarakDrawer isOpen={true} onClose={() => {}}>
                    <div data-testid="drawer-content">Drawer Content</div>
                </SarakDrawer>
            </SarakUIProvider>
        );
        const overlay = screen.getByTestId('sarak-drawer-overlay');
        expect(overlay.tagName).toBe('BUTTON');
        expect(overlay).toHaveAttribute('aria-label', 'Fechar painel');
        // motion.button aplica opacity via style inline quando `animate` está ligado.
        expect(overlay.getAttribute('style')).toMatch(/opacity/);
    });

    it('should call onClose when pressing Escape', () => {
        const onCloseMock = vi.fn();
        render(
            <SarakUIProvider>
                <SarakDrawer isOpen={true} onClose={onCloseMock}>
                    <div data-testid="drawer-content">Drawer Content</div>
                </SarakDrawer>
            </SarakUIProvider>
        );

        fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
        expect(onCloseMock).toHaveBeenCalled();
    });
});
