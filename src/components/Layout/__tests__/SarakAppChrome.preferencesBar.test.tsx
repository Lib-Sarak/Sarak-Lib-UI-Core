import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, afterEach } from 'vitest';
import { SarakAppChrome } from '../SarakAppChrome';
import SarakUIProvider from '../../../core/Provider/SarakUIProvider';
import { SarakDeviceProvider, type SarakDeviceType } from '../../../core/Provider/DeviceProvider';
import { CHROME_WIDGET_POSITION_TOKEN_IDS, PREFERENCE_POSITION_TOKEN_IDS } from '../../../core/Provider/preferencesTypes';

const NAV = [{ label: 'Propostas', route: '/propostas' }];

afterEach(() => localStorage.clear());

const renderAtDevice = (device: SarakDeviceType, config: Record<string, unknown>, ui: React.ReactElement) =>
    render(
        <SarakUIProvider config={{ mode: 'dark', ...config }}>
            <SarakDeviceProvider overrideDevice={device}>{ui}</SarakDeviceProvider>
        </SarakUIProvider>,
    );

const chrome = () => <SarakAppChrome nav={NAV}><div>x</div></SarakAppChrome>;
const ALL_POSITIONS_PINNED = Object.fromEntries(
    Object.values(CHROME_WIDGET_POSITION_TOKEN_IDS).map((tokenId) => [tokenId, 'pinned']),
);

describe('SarakAppChrome — barra configurável pelo administrador', () => {
    it('todas as posições `pinned`: a barra não cria o menu de preferências', () => {
        renderAtDevice('desktop', ALL_POSITIONS_PINNED, chrome());
        expect(screen.queryByLabelText('Preferências')).toBeNull();
        expect(screen.getByRole('group', { name: 'Estilo de navegação' })).toBeInTheDocument();
        expect(screen.getByLabelText('Recolher navegação')).toBeInTheDocument();
    });

    it('padrão de fábrica: fonte, navegação e recolher ficam no menu de preferências', () => {
        renderAtDevice('desktop', {}, chrome());
        const trigger = screen.getByLabelText('Preferências');
        fireEvent.click(trigger);
        const menu = screen.getByRole('menu');
        expect(within(menu).getByText('Tamanho da fonte')).toBeInTheDocument();
        expect(within(menu).getByRole('group', { name: 'Estilo de navegação' })).toBeInTheDocument();
        const collapseControl = within(menu).getByText('Recolher navegação');
        expect(collapseControl).toBeInTheDocument();
        fireEvent.click(collapseControl);
        expect(within(menu).getByText('Expandir navegação')).toBeInTheDocument();
    });

    it("uma preferência em 'menu' (fontSize) faz o ⚙ nascer, com as fixadas TAMBÉM dentro dele", () => {
        renderAtDevice('desktop', { [PREFERENCE_POSITION_TOKEN_IDS.fontSize]: 'menu' }, chrome());
        const trigger = screen.getByLabelText('Preferências');
        fireEvent.click(trigger);
        const menu = screen.getByRole('menu');
        expect(menu).toBeInTheDocument();
        expect(screen.getByText('Tamanho da fonte')).toBeInTheDocument();
        // colorMode (pinned de fábrica) também aparece DENTRO do menu — além do
        // controle direto que já existia fora dele (por isso a busca é escopada).
        const { getByText } = within(menu);
        expect(getByText('Modo Claro')).toBeInTheDocument();
    });

    it("posição 'pinned' de uma preferência NOVA (navigationStyle) mostra o controle direto na barra", () => {
        renderAtDevice('desktop', { [PREFERENCE_POSITION_TOKEN_IDS.navigationStyle]: 'pinned' }, chrome());
        expect(screen.getByRole('group', { name: 'Estilo de navegação' })).toBeInTheDocument();
    });

    it("widgets.themeToggle=false vence a posição do tema mesmo com colorMode='pinned' (teto do código)", () => {
        render(
            <SarakUIProvider config={{ mode: 'dark', [PREFERENCE_POSITION_TOKEN_IDS.colorMode]: 'pinned' }}>
                <SarakDeviceProvider overrideDevice="desktop">
                    <SarakAppChrome nav={NAV} widgets={{ themeToggle: false }}><div>x</div></SarakAppChrome>
                </SarakDeviceProvider>
            </SarakUIProvider>,
        );
        expect(screen.queryByText(/Mode$/)).toBeNull();
        fireEvent.click(screen.getByLabelText('Preferências'));
        const menu = screen.getByRole('menu');
        expect(within(menu).getByText('Tamanho da fonte')).toBeInTheDocument();
        expect(within(menu).queryByText(/Mode$/)).toBeNull();
    });

    it('no MODO SIDEBAR recolhido, o controle com rótulo fica acessível pelo menu', () => {
        renderAtDevice('desktop', { [PREFERENCE_POSITION_TOKEN_IDS.navigationStyle]: 'pinned' }, chrome());
        fireEvent.click(screen.getByLabelText('Preferências'));
        const menu = screen.getByRole('menu');
        fireEvent.click(within(menu).getByText('Recolher navegação'));
        expect(screen.getAllByRole('group', { name: 'Estilo de navegação' })).toHaveLength(1);
        expect(within(menu).getByRole('group', { name: 'Estilo de navegação' })).toBeInTheDocument();
    });

    it('SIDEBAR colapsada: o ⚙ recebe os controles `pinned` sem ícone próprio', () => {
        renderAtDevice('desktop', ALL_POSITIONS_PINNED, chrome());
        fireEvent.click(screen.getByLabelText('Recolher navegação'));

        const trigger = screen.getByLabelText('Preferências');
        expect(trigger).toBeInTheDocument();
        fireEvent.click(trigger);
        const menu = screen.getByRole('menu');
        expect(within(menu).getByText('Tamanho da fonte')).toBeInTheDocument();
        expect(within(menu).getByRole('group', { name: 'Estilo de navegação' })).toBeInTheDocument();
    });
});

describe('SarakAppChrome — barra configurável no celular, nada some', () => {
    it("tudo o que é oferecido vai para o drawer, fixado OU no menu, sem ⚙", () => {
        renderAtDevice(
            'smartphone',
            {
                [PREFERENCE_POSITION_TOKEN_IDS.fontSize]: 'menu',
                [PREFERENCE_POSITION_TOKEN_IDS.navigationStyle]: 'pinned',
            },
            chrome(),
        );
        fireEvent.click(screen.getByLabelText('Abrir menu de navegação'));
        expect(screen.getByText('Tamanho da fonte')).toBeInTheDocument();
        expect(screen.getByRole('group', { name: 'Estilo de navegação' })).toBeInTheDocument();
        expect(screen.queryByLabelText('Preferências')).toBeNull();
    });

    it("navCollapsed nunca aparece como linha própria no drawer — o hambúrguer já é o colapso", () => {
        renderAtDevice('smartphone', {}, chrome());
        fireEvent.click(screen.getByLabelText('Abrir menu de navegação'));
        expect(screen.queryByText('Recolher navegação')).toBeNull();
        expect(screen.queryByText('Expandir navegação')).toBeNull();
    });
});
