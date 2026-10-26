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

    it('separa a cor de subtítulo da cor do título do cartão', () => {
        render(
            <SarakUIProvider config={{ mode: 'dark' }}>
                <SarakActionCard item={item} mapping={mapping} />
            </SarakUIProvider>,
        );

        expect(screen.getByText('123').className).toContain('--sarak-subtitle-color');
        expect(screen.getByRole('heading', { level: 4 }).className).toContain('--color-theme-title');
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

describe('SarakActionCard — aperto do botão e spotlight dirigidos pelo token', () => {
    const item = { id: '1', title: 'Contrato' };
    const mapping = { title: 'title', subtitle: 'id' };

    it('o botão de ação carrega a classe em que a regra do aperto (`cardActionClickScale`) está escrita', () => {
        render(
            <SarakUIProvider config={{ mode: 'dark', cardActionClickScale: 0.8 }}>
                <SarakActionCard item={item} mapping={mapping} actionLabel="Abrir" />
            </SarakUIProvider>
        );
        expect(screen.getByRole('button', { name: /Abrir/ }).className).toContain('sarak-card-action-btn');
    });

    it.each([[0.4, '1'], [0, '0']])('o spotlight com cardSpotlightOpacity %s grava data-spotlight %s', (opacity, expected) => {
        const { container } = render(
            <SarakUIProvider config={{ mode: 'dark', cardSpotlightOpacity: opacity }}>
                <SarakActionCard item={item} mapping={mapping} />
            </SarakUIProvider>
        );
        expect(container.querySelector('.sarak-card')?.getAttribute('data-spotlight')).toBe(expected);
    });

    it.each([[true, '1'], [false, '0']])('borderBeamEnabled %s grava data-border-beam %s na raiz', (enabled, expected) => {
        const { container } = render(
            <SarakUIProvider config={{ mode: 'dark', borderBeamEnabled: enabled }}>
                <SarakActionCard item={item} mapping={mapping} />
            </SarakUIProvider>
        );
        expect(container.querySelector('.sarak-card')?.getAttribute('data-border-beam')).toBe(expected);
        expect(container.querySelector('.sarak-card > .border-beam-effect')).not.toBeNull();
    });
});
