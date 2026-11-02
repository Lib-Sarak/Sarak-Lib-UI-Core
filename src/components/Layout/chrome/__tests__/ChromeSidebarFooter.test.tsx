import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import { ChromeSidebarFooter, type ChromeSidebarFooterProps } from '../ChromeSidebarFooter';
import SarakUIProvider from '../../../../core/Provider/SarakUIProvider';

const BASE: ChromeSidebarFooterProps = {
    collapsed: false,
    showBrand: false,
    showNotifications: false,
    showThemeToggle: false,
    showUser: false,
    showFontSize: false,
    showNavigationStyle: false,
    showLanguage: false,
    hasPreferencesMenu: false,
    menuIds: [],
    menuWidgets: null,
    onToggleNavCollapsed: vi.fn(),
};

const renderFooter = (props: Partial<ChromeSidebarFooterProps> = {}) =>
    render(<SarakUIProvider><ChromeSidebarFooter {...BASE} {...props} /></SarakUIProvider>);

describe('ChromeSidebarFooter', () => {
    it('é uma região fixa: não encolhe nem rola com a lista de navegação', () => {
        const { container } = renderFooter();
        const footer = container.querySelector('[data-sarak-sidebar-footer]') as HTMLElement;
        expect(footer.className).toContain('shrink-0');
        expect(footer.className).not.toContain('overflow');
    });

    it('com a marca na base, ela vem acima do rodapé do consumidor', () => {
        const { container } = renderFooter({
            showBrand: true,
            brand: { name: 'ERP', logoUrl: '/logo.png' },
            sidebarFooter: <span>rodapé do host</span>,
        });
        const brand = container.querySelector('.sarak-chrome-brand') as HTMLElement;
        const hostFooter = container.querySelector('[data-sarak-slot="sidebarFooter"]') as HTMLElement;
        expect(brand.compareDocumentPosition(hostFooter) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('com a marca no topo, o rodapé não a repete', () => {
        const { container } = renderFooter({ showBrand: false, brand: { name: 'ERP', logoUrl: '/logo.png' } });
        expect(container.querySelector('.sarak-chrome-brand')).toBeNull();
    });

    it('recolhida, só o símbolo da marca fica na base', () => {
        const { container } = renderFooter({ showBrand: true, collapsed: true, brand: { name: 'ERP', logoUrl: '/logo.png' } });
        expect(container.querySelector('img')).not.toBeNull();
        expect(screen.queryByText('ERP')).toBeNull();
    });

    it('recolhida, os controles com rótulo não saem na barra: só o ícone que abre o menu de preferências', () => {
        renderFooter({
            collapsed: true,
            showFontSize: true,
            showNavigationStyle: true,
            showLanguage: true,
            hasPreferencesMenu: true,
            menuIds: ['fontSize', 'navigationStyle'],
        });
        expect(screen.queryByText('Lateral')).toBeNull();
        expect(screen.queryByText('P')).toBeNull();
        expect(screen.getByRole('button', { name: 'Preferências' })).toBeInTheDocument();
    });

    it('recolhida, o menu abre fora da barra, num portal, e mostra "Lateral" e "P M G" inteiros', () => {
        const { container } = renderFooter({
            collapsed: true,
            hasPreferencesMenu: true,
            menuIds: ['fontSize', 'navigationStyle'],
        });
        fireEvent.click(screen.getByRole('button', { name: 'Preferências' }));
        const menu = screen.getByRole('menu');
        expect(container.contains(menu)).toBe(false);
        expect(menu.className).toContain('fixed');
        expect(menu).toHaveTextContent('Lateral');
    });

    it('aberta, os controles fixados aparecem na barra', () => {
        renderFooter({ showFontSize: true, showNavigationStyle: true });
        expect(screen.getByText('Lateral')).toBeInTheDocument();
    });
});
