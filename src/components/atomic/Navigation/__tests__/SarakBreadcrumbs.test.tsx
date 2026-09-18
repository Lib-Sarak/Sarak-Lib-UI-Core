import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SarakBreadcrumbs } from '../SarakBreadcrumbs';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

const items = [
    { label: 'Início', href: '/' },
    { label: 'Clientes', href: '/clientes' },
    { label: 'Detalhe' },
];

describe('Spec 14 — SarakBreadcrumbs', () => {
    it('marca a última migalha como página atual', () => {
        render(<SarakBreadcrumbs items={items} />);
        expect(screen.getByText('Detalhe')).toHaveAttribute('aria-current', 'page');
    });

    it('usa o separador customizado entre as migalhas', () => {
        render(<SarakBreadcrumbs items={items} separator=">" />);
        // 3 migalhas → 2 separadores
        expect(screen.getAllByText('>')).toHaveLength(2);
    });

    it('delega a navegação ao host (não manipula a URL)', () => {
        const onNavigate = vi.fn();
        render(<SarakBreadcrumbs items={items} onNavigate={onNavigate} />);
        fireEvent.click(screen.getByText('Clientes'));
        expect(onNavigate).toHaveBeenCalledWith('/clientes');
    });

    it('a migalha final não é interativa', () => {
        const onNavigate = vi.fn();
        render(<SarakBreadcrumbs items={items} onNavigate={onNavigate} />);
        fireEvent.click(screen.getByText('Detalhe'));
        expect(onNavigate).not.toHaveBeenCalled();
    });
});

// os textos da própria lib seguem o idioma que vale.
describe('SarakBreadcrumbs — idioma que vale', () => {
    it('sem Provider, sai em português (R34)', () => {
        render(<SarakBreadcrumbs items={items} />);
        expect(screen.getByLabelText('Trilha de navegação')).toBeInTheDocument();
    });

    it('sai em inglês com `config.language: "en"`', () => {
        render(
            <SarakUIProvider config={{ language: 'en' }}>
                <SarakBreadcrumbs items={items} />
            </SarakUIProvider>,
        );
        expect(screen.getByLabelText('Breadcrumb')).toBeInTheDocument();
    });
});
