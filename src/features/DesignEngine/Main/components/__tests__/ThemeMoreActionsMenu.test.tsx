import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { ThemeMoreActionsMenu } from '../ThemeMoreActionsMenu';

const Host: React.FC<{ actions: React.ComponentProps<typeof ThemeMoreActionsMenu>['actions'] }> = ({ actions: list }) => {
    const [isOpen, setIsOpen] = useState(false);
    return <ThemeMoreActionsMenu actions={list} isOpen={isOpen} onOpenChange={setIsOpen} />;
};

const actions = () => [
    { id: 'one', label: 'Primeira', onSelect: vi.fn() },
    { id: 'two', label: 'Segunda', onSelect: vi.fn(), danger: true },
];

describe('ThemeMoreActionsMenu', () => {
    it('começa fechado e o botão anuncia o menu', () => {
        render(<Host actions={actions()} />);
        const trigger = screen.getByRole('button', { name: 'Mais ações' });
        expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
        expect(screen.queryByRole('menu')).toBeNull();
    });

    it('escolher um item chama a ação e fecha o menu', async () => {
        const user = userEvent.setup();
        const list = actions();
        render(<Host actions={list} />);
        await user.click(screen.getByRole('button', { name: 'Mais ações' }));
        await user.click(screen.getByRole('menuitem', { name: 'Segunda' }));
        expect(list[1].onSelect).toHaveBeenCalledTimes(1);
        expect(screen.queryByRole('menu')).toBeNull();
    });

    it('só a ação perigosa ganha o tom de perigo', async () => {
        const user = userEvent.setup();
        render(<Host actions={actions()} />);
        await user.click(screen.getByRole('button', { name: 'Mais ações' }));
        expect(screen.getByRole('menuitem', { name: 'Segunda' }).className).toContain('theme-error');
        expect(screen.getByRole('menuitem', { name: 'Primeira' }).className).not.toContain('theme-error');
    });

    it('um clique fora fecha o menu; Tab também', async () => {
        const user = userEvent.setup();
        render(<div><span>fora</span><Host actions={actions()} /></div>);
        await user.click(screen.getByRole('button', { name: 'Mais ações' }));
        await user.click(screen.getByText('fora'));
        expect(screen.queryByRole('menu')).toBeNull();
        await user.click(screen.getByRole('button', { name: 'Mais ações' }));
        await user.keyboard('{Tab}');
        expect(screen.queryByRole('menu')).toBeNull();
    });
});
