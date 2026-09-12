import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { TopbarNav } from '../TopbarNav';
import { SarakUIProvider } from '../../../Provider/SarakUIProvider';
import { PREFERENCE_POSITION_TOKEN_IDS } from '../../../Provider/preferencesTypes';

vi.mock('../../../../components/atomic/Icon/SarakIcon', () => ({ SarakIcon: () => <div data-testid="sarak-icon" /> }));
vi.mock('../IconRenderer', () => ({ IconRenderer: () => <div data-testid="icon-renderer" /> }));
vi.mock('../../../../components/atomic/Navigation/ShellSearchWidget', () => ({ ShellSearchWidget: () => <div>Search</div> }));

const baseProps = {
    brand: { name: 'Brand' },
    toggleNav: vi.fn(),
    setIsSearchOpen: vi.fn(),
    activeModuleId: null,
    setActiveModuleId: vi.fn(),
    discoveredModules: [],
    startResizing: vi.fn(),
};

const renderTopbar = (config: Record<string, unknown>) =>
    render(
        <SarakUIProvider config={config}>
            <TopbarNav {...baseProps} design={{ navigationStyle: 'topbar', mode: 'dark', systemName: 'Sarak Test', ...config }} />
        </SarakUIProvider>,
    );

describe('TopbarNav — barra configurável pelo administrador', () => {
    it('padrão de fábrica: alternância de tema fixada, ⚙ não aparece', () => {
        renderTopbar({});
        expect(screen.getByTitle(/Mudar para modo/)).toBeInTheDocument();
        expect(screen.queryByLabelText('Preferências')).toBeNull();
    });

    it("navigationStyle='menu' faz o ⚙ nascer, e a fixada (colorMode) também entra nele", () => {
        renderTopbar({ [PREFERENCE_POSITION_TOKEN_IDS.navigationStyle]: 'menu' });
        fireEvent.click(screen.getByLabelText('Preferências'));
        const menu = within(screen.getByRole('menu'));
        expect(menu.getByText('Navegação')).toBeInTheDocument();
        expect(menu.getByText('Light Mode')).toBeInTheDocument();
    });

    it("fontSize='pinned' mostra o controle direto (P/M/G) na barra", () => {
        renderTopbar({ [PREFERENCE_POSITION_TOKEN_IDS.fontSize]: 'pinned' });
        expect(screen.getByRole('group', { name: 'Tamanho da fonte' })).toBeInTheDocument();
    });
});
