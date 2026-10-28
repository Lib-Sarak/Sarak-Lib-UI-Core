import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import * as ComponentModule from '../SarakAnalyticalPage';
import { SarakAnalyticalPage } from '../SarakAnalyticalPage';
import { SarakDeviceProvider } from '../../../core/Provider/DeviceProvider';
import { SarakUIProvider } from '../../../core/Provider/SarakUIProvider';

describe('SarakAnalyticalPage', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(ComponentModule).toBeDefined();
        // TODO: Injetar testes de montagem profunda caso o componente cresça em complexidade
    });

    // Caracterização (R10 — lote 10): os 4 botões nativos só existem no ramo mobile
    // (navBar/sidePanel viram drawer). Sem forçar `device=smartphone` o teste "passa"
    // sem exercitar nenhum deles — é o mesmo cuidado que o lote 9 já tinha registrado.
    describe('drawers mobile (device=smartphone)', () => {
        const renderMobile = () =>
            render(
                <SarakDeviceProvider overrideDevice="smartphone">
                    <SarakAnalyticalPage
                        navBar={<div>Nav de verdade</div>}
                        sidePanel={<div>Painel de verdade</div>}
                        mainContent={<div>Conteúdo</div>}
                    />
                </SarakDeviceProvider>,
            );

        it('abre o drawer de navegação ao clicar no botão de menu', () => {
            renderMobile();
            expect(screen.queryByText('Nav de verdade')).not.toBeInTheDocument();
            fireEvent.click(screen.getByLabelText('Abrir menu de navegação'));
            expect(screen.getByText('Nav de verdade')).toBeInTheDocument();
        });

        it('fecha o drawer de navegação ao clicar no botão de fechar', () => {
            renderMobile();
            fireEvent.click(screen.getByLabelText('Abrir menu de navegação'));
            expect(screen.getByText('Nav de verdade')).toBeInTheDocument();
            fireEvent.click(screen.getByLabelText('Fechar menu de navegação'));
            expect(screen.queryByText('Nav de verdade')).not.toBeInTheDocument();
        });

        it('abre e fecha o drawer do painel lateral pelos botões dedicados', () => {
            renderMobile();
            expect(screen.queryByText('Painel de verdade')).not.toBeInTheDocument();
            fireEvent.click(screen.getByLabelText('Abrir painel lateral'));
            expect(screen.getByText('Painel de verdade')).toBeInTheDocument();
            fireEvent.click(screen.getByLabelText('Fechar painel lateral'));
            expect(screen.queryByText('Painel de verdade')).not.toBeInTheDocument();
        });
    });

    // os textos da própria lib seguem o idioma que vale.
    it('sai em inglês com `config.language: "en"`', () => {
        render(
            <SarakUIProvider config={{ language: 'en' }}>
                <SarakDeviceProvider overrideDevice="smartphone">
                    <SarakAnalyticalPage
                        navBar={<div>Real nav</div>}
                        mainContent={<div>Content</div>}
                    />
                </SarakDeviceProvider>
            </SarakUIProvider>,
        );
        expect(screen.getByLabelText('Open navigation menu')).toBeInTheDocument();
    });
});

describe('SarakAnalyticalPage — largura do painel e altura', () => {
    const renderDesktop = (props: Partial<React.ComponentProps<typeof SarakAnalyticalPage>>) =>
        render(
            <SarakDeviceProvider overrideDevice="desktop">
                <SarakAnalyticalPage mainContent={<div>Main</div>} sidePanel={<div data-testid="side">Side</div>} {...props} />
            </SarakDeviceProvider>,
        );

    it('sidePanelWidth em número vira pixels e em texto vai como veio; omitida, mantém a classe da largura', () => {
        const numeric = renderDesktop({ sidePanelWidth: 360 });
        expect((numeric.getByTestId('side').parentElement as HTMLElement).style.width).toBe('360px');
        numeric.unmount();

        const text = renderDesktop({ sidePanelWidth: '30%' });
        expect((text.getByTestId('side').parentElement as HTMLElement).style.width).toBe('30%');
        text.unmount();

        const omitted = renderDesktop({});
        const panel = omitted.getByTestId('side').parentElement as HTMLElement;
        expect(panel.style.width).toBe('');
        expect(panel.className).toContain('w-80');
    });

    it('fillHeight troca h-full pela classe pública sarak-fill-height (min-height: 100%); omitida, a altura é a de sempre', () => {
        const filled = renderDesktop({ fillHeight: true });
        expect(filled.container.firstElementChild).toHaveClass('sarak-fill-height');
        expect(filled.container.firstElementChild).not.toHaveClass('h-full');
        filled.unmount();

        const plain = renderDesktop({});
        expect(plain.container.firstElementChild).toHaveClass('h-full');
        expect(plain.container.firstElementChild).not.toHaveClass('sarak-fill-height');
    });

    it('não usa as variáveis legadas --border-color e --color-theme-card', () => {
        const mobile = render(
            <SarakDeviceProvider overrideDevice="smartphone">
                <SarakAnalyticalPage navBar={<div>N</div>} sidePanel={<div>S</div>} mainContent={<div>M</div>} />
            </SarakDeviceProvider>,
        );
        expect(mobile.container.innerHTML).not.toMatch(/--border-color|--color-theme-card/);
    });
});
