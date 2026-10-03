import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import SarakUIProvider from '../../../../core/Provider/SarakUIProvider';
import { ShellPreferencesMenu } from '../ShellPreferencesMenu';

vi.mock('../shellPreferenceRow', () => ({
    renderShellPreferenceRow: (id: string) => <button key={id}>{`item-${id}`}</button>,
}));

// `SarakIcon` (ícone do ⚙) lê `useSarakUI` mandatório — exige o Provider real.
const renderMenu = (ui: React.ReactElement) => render(<SarakUIProvider>{ui}</SarakUIProvider>);

describe('ShellPreferencesMenu', () => {
    it('menu vazio: NÃO monta o botão ⚙', () => {
        renderMenu(<ShellPreferencesMenu menuIds={[]} isNavHidden={false} onToggleNavCollapsed={vi.fn()} />);
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('jornada só-teclado: Enter no gatilho abre o menu com os itens oferecidos, ESC fecha e devolve o foco ao ⚙', async () => {
        const user = userEvent.setup();
        renderMenu(<ShellPreferencesMenu menuIds={['colorMode', 'fontSize']} isNavHidden={false} onToggleNavCollapsed={vi.fn()} />);

        const trigger = screen.getByRole('button', { name: 'Preferências' });
        trigger.focus();
        await user.keyboard('{Enter}');

        expect(trigger).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByRole('menu')).toBeInTheDocument();
        expect(screen.getByText('item-colorMode')).toBeInTheDocument();
        expect(screen.getByText('item-fontSize')).toBeInTheDocument();

        await user.keyboard('{Escape}');

        expect(screen.queryByRole('menu')).toBeNull();
        expect(trigger).toHaveFocus();
    });
});
