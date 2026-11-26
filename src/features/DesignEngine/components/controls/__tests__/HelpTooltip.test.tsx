import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HelpTooltip } from '../HelpTooltip';

describe('HelpTooltip', () => {
    it('o botão tem nome acessível com o rótulo do controle e abre ao receber o foco', () => {
        render(<HelpTooltip label="Raio da Borda" description="Arredonda os cantos." />);
        const button = screen.getByRole('button', { name: 'Ajuda: Raio da Borda' });

        expect(button).toHaveAttribute('aria-expanded', 'false');
        fireEvent.focus(button);
        expect(button).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByText('Arredonda os cantos.')).toBeInTheDocument();
        fireEvent.keyDown(button, { key: 'Escape' });
        expect(button).toHaveAttribute('aria-expanded', 'false');
    });
});
