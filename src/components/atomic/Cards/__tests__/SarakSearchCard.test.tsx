import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { SarakSearchCard } from '../SarakSearchCard';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

vi.mock('../hooks/useCardLayoutStyles', () => ({
    useCardLayoutStyles: () => ({
        containerClass: 'mock-container',
        contentClass: 'mock-content',
        headerClass: 'mock-header',
        footerClass: 'mock-footer'
    })
}));

describe('SarakSearchCard (Characterization)', () => {
    it('usa cores separadas para subtítulo e título do cartão', () => {
        render(
            <SarakUIProvider config={{ mode: 'dark' }}>
                <SarakSearchCard item={{ id: '123' }} mapping={{}} />
            </SarakUIProvider>,
        );

        expect(screen.getByText('Painel de Filtros').className).toContain('--sarak-subtitle-color');
        expect(screen.getByRole('heading', { level: 4 }).className).toContain('--color-theme-title');
    });

    it('matches snapshot before any removal', () => {
        const item = {
            id: '123'
        };

        const mapping = {};

        const { asFragment } = render(
            <SarakUIProvider config={{ mode: 'dark' }}>
                <SarakSearchCard item={item} mapping={mapping} label="Test Search Label" />
            </SarakUIProvider>
        );

        expect(asFragment()).toMatchSnapshot();
    });

    describe('traço luminoso (data-border-beam na raiz)', () => {
        const renderCard = (config: Record<string, unknown>) => {
            const view = render(
                <SarakUIProvider config={{ mode: 'dark', ...config }}>
                    <SarakSearchCard item={{ id: '1' }} />
                </SarakUIProvider>
            );
            const root = view.container.querySelector('.sarak-card') as HTMLElement;
            const field = view.container.querySelector('input[placeholder]') as HTMLInputElement;
            return { root, field };
        };

        it('padrão (cardSearchBorderBeamActive true): apagado em repouso, aceso com o campo em foco, apagado ao sair', () => {
            const { root, field } = renderCard({});
            expect(root.getAttribute('data-border-beam')).toBe('0');
            fireEvent.focus(field);
            expect(root.getAttribute('data-border-beam')).toBe('1');
            fireEvent.blur(field);
            expect(root.getAttribute('data-border-beam')).toBe('0');
        });

        it('cardSearchBorderBeamActive false: nem o foco acende', () => {
            const { root, field } = renderCard({ cardSearchBorderBeamActive: false });
            fireEvent.focus(field);
            expect(root.getAttribute('data-border-beam')).toBe('0');
        });

        it('borderBeamEnabled mantém aceso, com ou sem foco, e a camada do traço existe', () => {
            const { root } = renderCard({ borderBeamEnabled: true, cardSearchBorderBeamActive: false });
            expect(root.getAttribute('data-border-beam')).toBe('1');
            expect(root.querySelector(':scope > .border-beam-effect')).not.toBeNull();
        });
    });
});
