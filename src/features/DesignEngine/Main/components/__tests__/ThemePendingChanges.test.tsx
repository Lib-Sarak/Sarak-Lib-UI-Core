import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { ThemePendingChanges } from '../ThemePendingChanges';

const Host: React.FC<{ tokens: React.ComponentProps<typeof ThemePendingChanges>['tokens'] }> = ({ tokens }) => {
    const [isOpen, setIsOpen] = useState(false);
    return <ThemePendingChanges tokens={tokens} isOpen={isOpen} onToggle={() => setIsOpen((open) => !open)} />;
};

describe('ThemePendingChanges', () => {
    it('sem alteração não renderiza nada', () => {
        const { container } = render(<Host tokens={[]} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('o contador é um botão que abre e fecha a lista, com aria-expanded', async () => {
        const user = userEvent.setup();
        render(<Host tokens={[{ id: 'a', label: 'Cor A', applied: '#111111', draft: '#222222' }]} />);
        const toggle = screen.getByRole('button', { name: '1 alteração' });
        expect(toggle).toHaveAttribute('aria-expanded', 'false');
        await user.click(toggle);
        expect(toggle).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByRole('list', { name: 'Alterações pendentes' })).toHaveTextContent('Cor A');
        await user.click(toggle);
        expect(screen.queryByRole('list')).toBeNull();
    });

    it('formata valor ausente em travessão e objeto em JSON', async () => {
        const user = userEvent.setup();
        render(<Host tokens={[{ id: 'b', label: 'Sombra', applied: undefined, draft: { x: 1 } }]} />);
        await user.click(screen.getByRole('button', { name: '1 alteração' }));
        expect(screen.getByRole('listitem')).toHaveTextContent('aplicado: — → rascunho: {"x":1}');
    });
});
