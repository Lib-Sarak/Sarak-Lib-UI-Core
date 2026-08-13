import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SarakActionCard } from '../SarakActionCard';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

vi.mock('../hooks/useCardLayoutStyles', () => ({
    useCardLayoutStyles: () => ({
        containerClass: 'mock-container',
        contentClass: 'mock-content',
        headerClass: 'mock-header',
        footerClass: 'mock-footer'
    })
}));

describe('SarakActionCard (Spec 40 §2.5 — card genérico, sem domínio embutido)', () => {
    const item = {
        id: '123',
        title: 'Contrato #123',
        desc: 'Contrato em fase de revisão jurídica.',
        details: [
            { label: 'Valor', value: 'R$ 18.500,00' },
            { label: 'Status', value: 'Em análise' },
        ],
    };

    const mapping = {
        title: 'title',
        subtitle: 'id',
        description: 'desc',
        details: 'details',
        icon: 'Activity',
    };

    it('matches snapshot com dados neutros (sem domínio LLM)', () => {
        const { asFragment } = render(
            <SarakUIProvider config={{ mode: 'dark' }}>
                <SarakActionCard item={item} mapping={mapping} label="Test Action Label" />
            </SarakUIProvider>
        );

        expect(asFragment()).toMatchSnapshot();
    });

    it('usa "Executar" como actionLabel default', () => {
        render(
            <SarakUIProvider config={{ mode: 'dark' }}>
                <SarakActionCard item={item} mapping={mapping} />
            </SarakUIProvider>
        );

        expect(screen.getByText('Executar')).toBeInTheDocument();
    });

    it('actionLabel customizado substitui o texto do botão', () => {
        render(
            <SarakUIProvider config={{ mode: 'dark' }}>
                <SarakActionCard item={item} mapping={mapping} actionLabel="Ver contrato" />
            </SarakUIProvider>
        );

        expect(screen.getByText('Ver contrato')).toBeInTheDocument();
        expect(screen.queryByText('Executar')).not.toBeInTheDocument();
    });

    it('sem mapping.subtitle, o subtítulo é vazio (nunca "Modelo")', () => {
        const { container } = render(
            <SarakUIProvider config={{ mode: 'dark' }}>
                <SarakActionCard item={{ title: 'Sem subtítulo' }} mapping={{ title: 'title' }} />
            </SarakUIProvider>
        );

        expect(container.textContent).not.toContain('Modelo');
    });

    // plan-41: o painel de detalhes (mapping.details) usa `getGridStyles`/`getFlexStyles`
    // — classe `@min-[…]` (container query), que só ativa com um ancestral
    // `container-type`. jsdom não avalia container query — prova só que a raiz do
    // card PLANTA `@container` (a query casar é prova de browser real, plan-40).
    it('planta @container na raiz — ancestral do painel de detalhes que usa container query', () => {
        const { container } = render(
            <SarakUIProvider config={{ mode: 'dark' }}>
                <SarakActionCard item={item} mapping={mapping} />
            </SarakUIProvider>
        );

        expect(container.querySelector('[class*="@container"]')).not.toBeNull();
    });

    it('painel expansível renderiza os pares de mapping.details (rótulo/valor genéricos)', () => {
        render(
            <SarakUIProvider config={{ mode: 'dark' }}>
                <SarakActionCard item={item} mapping={mapping} />
            </SarakUIProvider>
        );

        fireEvent.click(screen.getByRole('button', { name: '' }));

        expect(screen.getByText('Valor')).toBeInTheDocument();
        expect(screen.getByText('R$ 18.500,00')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
        expect(screen.getByText('Em análise')).toBeInTheDocument();
        expect(screen.queryByText('Custo In (1M)')).not.toBeInTheDocument();
    });
});
