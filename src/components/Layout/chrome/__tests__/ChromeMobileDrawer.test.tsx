import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import { ChromeMobileDrawer } from '../ChromeMobileDrawer';
import { useFocusTrap } from '../../../atomic/Modals/hooks/useFocusTrap';

const renderDrawer = (isOpen: boolean, onClose = vi.fn()) => {
    const Harness = (): React.ReactElement => {
        const focusTrap = useFocusTrap(isOpen, onClose);
        return (
            <ChromeMobileDrawer
                isOpen={isOpen}
                drawerId="mobile-drawer-test"
                onClose={onClose}
                closeLabel="Fechar navegação"
                onKeyDown={focusTrap.handleTrap}
                containerRef={focusTrap.containerRef}
                backgroundStyle="solid"
                borderSide="edge"
                borderStyle="solid"
            >
                <nav aria-label="Navegação móvel">Destinos</nav>
            </ChromeMobileDrawer>
        );
    };

    return { ...render(<Harness />), onClose };
};

describe('ChromeMobileDrawer', () => {
    it('não monta o scrim nem a gaveta quando fechada', () => {
        const { container } = renderDrawer(false);

        expect(container.querySelector('#mobile-drawer-test')).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Fechar navegação' })).not.toBeInTheDocument();
    });

    it('renderiza o conteúdo e fecha pelo scrim acessível', () => {
        const { container, onClose } = renderDrawer(true);

        expect(container.querySelector('#mobile-drawer-test')).toContainElement(
            screen.getByRole('navigation', { name: 'Navegação móvel' }),
        );
        fireEvent.click(screen.getByRole('button', { name: 'Fechar navegação' }));

        expect(onClose).toHaveBeenCalledOnce();
    });
});
