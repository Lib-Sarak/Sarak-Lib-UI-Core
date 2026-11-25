import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, afterEach } from 'vitest';
import { SarakAppChrome } from '../SarakAppChrome';
import { SarakAppChromeMobile } from '../SarakAppChromeMobile';
import SarakUIProvider from '../../../core/Provider/SarakUIProvider';
import { SarakDeviceProvider, type SarakDeviceType } from '../../../core/Provider/DeviceProvider';

const NAV = [{ label: 'Propostas', route: '/propostas' }];
const SAVED = { companyName: 'Empresa Gravada', logoBase64: '/gravada.png' };

afterEach(() => localStorage.clear());

const mount = (
    device: SarakDeviceType,
    ui: React.ReactElement,
    saved: Record<string, string> | null = SAVED,
    style: 'sidebar' | 'topbar' = 'sidebar',
) => render(
    <SarakUIProvider config={{ mode: 'dark', navigationStyle: style }} options={saved ? { branding: { initial: saved } } : {}}>
        <SarakDeviceProvider overrideDevice={device}>{ui}</SarakDeviceProvider>
    </SarakUIProvider>,
);

describe('SarakAppChrome — marca gravada sem a prop brand', () => {
    it.each<[SarakDeviceType, 'sidebar' | 'topbar']>([
        ['desktop', 'sidebar'],
        ['desktop', 'topbar'],
        ['smartphone', 'sidebar'],
    ])('mostra nome e logo gravados (%s, %s)', (device, style) => {
        const { container } = mount(device, <SarakAppChrome nav={NAV}><div>x</div></SarakAppChrome>, SAVED, style);
        expect(screen.getAllByText('Empresa Gravada').length).toBeGreaterThan(0);
        expect(container.querySelector('img[src="/gravada.png"]')).not.toBeNull();
    });

    it('brand explícito vence campo a campo', () => {
        const { container } = mount('desktop',
            <SarakAppChrome nav={NAV} brand={{ name: 'Marca Fixa' }}><div>x</div></SarakAppChrome>);
        expect(screen.getByText('Marca Fixa')).toBeInTheDocument();
        expect(screen.queryByText('Empresa Gravada')).toBeNull();
        // o logo não foi passado: cai no gravado
        expect(container.querySelector('img[src="/gravada.png"]')).not.toBeNull();
    });

    it('string vazia em brand conta como ausente', () => {
        mount('desktop', <SarakAppChrome nav={NAV} brand={{ name: '' }}><div>x</div></SarakAppChrome>);
        expect(screen.getByText('Empresa Gravada')).toBeInTheDocument();
    });

    it('o slot logo vence a imagem gravada', () => {
        const { container } = mount('desktop',
            <SarakAppChrome nav={NAV} logo={<span data-testid="logo-slot">◆</span>}><div>x</div></SarakAppChrome>);
        expect(screen.getByTestId('logo-slot')).toBeInTheDocument();
        expect(container.querySelector('img[src="/gravada.png"]')).toBeNull();
    });

    it('sem brand e sem marca gravada, nenhum texto de marca aparece', () => {
        const { container } = mount('desktop', <SarakAppChrome nav={NAV}><div>x</div></SarakAppChrome>, null);
        expect(container.querySelector('[data-sarak-brand-name]')).toBeNull();
        expect(container.querySelector('.sarak-chrome-brand')).toBeNull();
    });

    it('o SarakAppChromeMobile montado direto, sem brand, mostra a marca gravada', () => {
        const { container } = mount('smartphone',
            <SarakAppChromeMobile nav={NAV} rootStyle={{ minHeight: '100dvh' }}><div>x</div></SarakAppChromeMobile>);
        expect(screen.getAllByText('Empresa Gravada').length).toBeGreaterThan(0);
        expect(container.querySelector('img[src="/gravada.png"]')).not.toBeNull();
    });
});
