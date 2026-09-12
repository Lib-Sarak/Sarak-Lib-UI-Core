import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, afterEach } from 'vitest';
import { SarakAppChrome } from '../SarakAppChrome';
import SarakUIProvider from '../../../core/Provider/SarakUIProvider';
import { DeviceProvider, type DeviceType } from '../../../core/Provider/DeviceProvider';
import { PREFERENCE_POSITION_TOKEN_IDS } from '../../../core/Provider/preferencesTypes';

const NAV = [{ label: 'Propostas', route: '/propostas' }];

afterEach(() => localStorage.clear());

const renderAtDevice = (device: DeviceType, config: Record<string, unknown>, ui: React.ReactElement) =>
    render(
        <SarakUIProvider config={{ mode: 'dark', ...config }}>
            <DeviceProvider overrideDevice={device}>{ui}</DeviceProvider>
        </SarakUIProvider>,
    );

const chrome = () => <SarakAppChrome nav={NAV}><div>x</div></SarakAppChrome>;

describe('SarakAppChrome — barra configurável pelo administrador', () => {
    it('padrão de fábrica: nenhum token de posição declarado → o ⚙ NÃO monta (a barra de hoje)', () => {
        renderAtDevice('desktop', {}, chrome());
        expect(screen.queryByLabelText('Preferências')).toBeNull();
        // As duas fixadas de sempre continuam diretas na barra.
        expect(screen.getByLabelText('Recolher navegação')).toBeInTheDocument();
    });

    it('padrão de fábrica, sidebar RECOLHIDA: o ⚙ continua sem montar — não há nada além de colorMode/navCollapsed, que já têm ícone próprio', () => {
        renderAtDevice('desktop', {}, chrome());
        fireEvent.click(screen.getByLabelText('Recolher navegação'));
        expect(screen.queryByLabelText('Preferências')).toBeNull();
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
        expect(getByText('Light Mode')).toBeInTheDocument();
    });

    it("posição 'pinned' de uma preferência NOVA (navigationStyle) mostra o controle direto na barra", () => {
        renderAtDevice('desktop', { [PREFERENCE_POSITION_TOKEN_IDS.navigationStyle]: 'pinned' }, chrome());
        expect(screen.getByRole('group', { name: 'Estilo de navegação' })).toBeInTheDocument();
    });

    it("widgets.themeToggle=false vence a posição do tema mesmo com colorMode='pinned' (teto do código)", () => {
        render(
            <SarakUIProvider config={{ mode: 'dark', [PREFERENCE_POSITION_TOKEN_IDS.colorMode]: 'pinned' }}>
                <DeviceProvider overrideDevice="desktop">
                    <SarakAppChrome nav={NAV} widgets={{ themeToggle: false }}><div>x</div></SarakAppChrome>
                </DeviceProvider>
            </SarakUIProvider>,
        );
        expect(screen.queryByText(/Mode$/)).toBeNull();
        expect(screen.queryByLabelText('Preferências')).toBeNull();
    });

    it('no MODO SIDEBAR (colapsado), o controle com rótulo some da coluna estreita — mas não do alcance do usuário', () => {
        renderAtDevice('desktop', { [PREFERENCE_POSITION_TOKEN_IDS.navigationStyle]: 'pinned' }, chrome());
        fireEvent.click(screen.getByLabelText('Recolher navegação'));
        expect(screen.queryByRole('group', { name: 'Estilo de navegação' })).toBeNull();
    });

    it('SIDEBAR colapsada: o ⚙ nasce e recebe o que não cabe como ícone (fonte/navegação/idioma), mesmo sem nenhuma posição `menu`', () => {
        renderAtDevice('desktop', { [PREFERENCE_POSITION_TOKEN_IDS.navigationStyle]: 'pinned' }, chrome());
        fireEvent.click(screen.getByLabelText('Recolher navegação'));

        const trigger = screen.getByLabelText('Preferências');
        expect(trigger).toBeInTheDocument();
        fireEvent.click(trigger);
        expect(within(screen.getByRole('menu')).getByRole('group', { name: 'Estilo de navegação' })).toBeInTheDocument();
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
