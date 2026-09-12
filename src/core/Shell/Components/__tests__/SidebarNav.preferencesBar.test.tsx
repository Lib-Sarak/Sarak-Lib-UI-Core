import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { SidebarNav } from '../SidebarNav';
import { SarakUIProvider } from '../../../Provider/SarakUIProvider';
import { PREFERENCE_POSITION_TOKEN_IDS } from '../../../Provider/preferencesTypes';

vi.mock('framer-motion', async () => {
    const actual = await vi.importActual('framer-motion');
    return { ...(actual as object), motion: { div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div> } };
});
vi.mock('../../../../components/atomic/Navigation/ShellSearchWidget', () => ({ ShellSearchWidget: () => <div>Search</div> }));
vi.mock('../IconRenderer', () => ({ IconRenderer: ({ name }: { name: string }) => <span>{name}</span> }));

const renderSidebar = (design: Record<string, unknown>) =>
    render(
        <SarakUIProvider config={design}>
            <SidebarNav
                design={{ systemName: 'Test System', searchPositionSidebar: 'top', ...design }}
                brand={{ name: 'Test Brand' }}
                user={{}}
                toggleNav={vi.fn()}
                setIsSearchOpen={vi.fn()}
                activeModuleId="m1"
                setActiveModuleId={vi.fn()}
                groupedModules={{}}
                setIsNavVisible={vi.fn()}
                startResizing={vi.fn()}
            />
        </SarakUIProvider>,
    );

describe('SidebarNav — barra configurável pelo administrador', () => {
    it('padrão de fábrica: alternância de tema fixada (variante vertical), idioma NÃO monta, ⚙ não aparece', () => {
        renderSidebar({});
        expect(screen.getByText('Light Mode')).toBeInTheDocument();
        expect(screen.queryByText('Language')).toBeNull();
        expect(screen.queryByLabelText('Preferências')).toBeNull();
    });

    it("language='pinned' monta o seletor de idioma direto na barra (com 2+ idiomas habilitados)", () => {
        renderSidebar({
            [PREFERENCE_POSITION_TOKEN_IDS.language]: 'pinned',
            enabledLanguages: ['pt-BR', 'en-US'],
        });
        expect(screen.getByText('Language')).toBeInTheDocument();
    });

    it("fontSize='menu' faz o ⚙ nascer com a linha 'Tamanho da fonte' — e o teto do tema (colorMode pinned) some junto no menu", () => {
        renderSidebar({ [PREFERENCE_POSITION_TOKEN_IDS.fontSize]: 'menu' });
        fireEvent.click(screen.getByLabelText('Preferências'));
        const menu = within(screen.getByRole('menu'));
        expect(menu.getByText('Tamanho da fonte')).toBeInTheDocument();
    });

    it('padrão de fábrica, sidebar RECOLHIDA (isNavHidden): o ⚙ continua sem montar', () => {
        renderSidebar({ isNavHidden: true });
        expect(screen.queryByLabelText('Preferências')).toBeNull();
    });

    it("sidebar RECOLHIDA com fontSize='pinned' (sem nenhuma posição `menu`): o ⚙ nasce e recebe o controle que não cabe como ícone", () => {
        renderSidebar({ isNavHidden: true, [PREFERENCE_POSITION_TOKEN_IDS.fontSize]: 'pinned' });
        const trigger = screen.getByLabelText('Preferências');
        expect(trigger).toBeInTheDocument();
        fireEvent.click(trigger);
        expect(within(screen.getByRole('menu')).getByText('Tamanho da fonte')).toBeInTheDocument();
    });
});
