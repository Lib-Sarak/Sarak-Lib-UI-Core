import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { SarakAppChrome } from '../SarakAppChrome';
import SarakUIProvider from '../../../core/Provider/SarakUIProvider';
import { SarakDeviceProvider, type SarakDeviceType } from '../../../core/Provider/DeviceProvider';

// Os tokens de cromo do painel passam a ter efeito no SarakAppChrome.
// Os testes por token, isolados, moram em `chrome/__tests__/ChromeSidebarBody` e
// `ChromeTopbarBody`; este arquivo prova a INTEGRAÇÃO ponta a ponta a partir da
// prop pública do `SarakAppChrome`.

const NAV_ITEMS = [
    { id: 'contratos', label: 'Contratos', href: '/contratos', category: 'Comercial' },
    { id: 'relatorios', label: 'Relatórios', href: '/relatorios', category: 'Análise' },
];

const renderAtDevice = (device: SarakDeviceType, ui: React.ReactElement, design: Record<string, unknown> = {}) =>
    render(
        <SarakUIProvider config={design}>
            <SarakDeviceProvider overrideDevice={device}>{ui}</SarakDeviceProvider>
        </SarakUIProvider>,
    );

describe('SarakAppChrome — category chega ao SarakShellNav (achado da plan-66)', () => {
    it('navItems com category agrupa a navegação — antes o campo era descartado no mapeamento', () => {
        renderAtDevice('desktop', <SarakAppChrome navItems={NAV_ITEMS}><div>x</div></SarakAppChrome>);
        expect(screen.getByText('Comercial')).toBeInTheDocument();
        expect(screen.getByText('Análise')).toBeInTheDocument();
    });
});

describe('SarakAppChrome — slot search (searchPositionSidebar/Topbar)', () => {
    it('modo sidebar: a busca aparece dentro da sidebar', () => {
        const { container } = renderAtDevice(
            'desktop',
            <SarakAppChrome nav={[]} search={<div>buscar</div>}><div>x</div></SarakAppChrome>,
        );
        const aside = container.querySelector('aside')!;
        expect(aside.contains(container.querySelector('[data-sarak-slot="search"]'))).toBe(true);
    });

    it('modo topbar: a busca aparece dentro da topbar', () => {
        const { container } = renderAtDevice(
            'desktop',
            <SarakAppChrome navigationStyle="topbar" nav={[]} search={<div>buscar</div>}><div>x</div></SarakAppChrome>,
        );
        const header = container.querySelector('header')!;
        expect(header.contains(container.querySelector('[data-sarak-slot="search"]'))).toBe(true);
    });

    it('modo celular: a busca aparece dentro do drawer (é onde a sidebar existe ali)', () => {
        const { container } = renderAtDevice(
            'smartphone',
            <SarakAppChrome nav={[{ label: 'Contratos', route: '/contratos' }]} search={<div>buscar</div>}><div>x</div></SarakAppChrome>,
        );
        const toggle = container.querySelector('[aria-controls="sarak-chrome-drawer"]') as HTMLElement;
        fireEvent.click(toggle);
        const drawer = container.querySelector('#sarak-chrome-drawer')!;
        expect(drawer.contains(container.querySelector('[data-sarak-slot="search"]'))).toBe(true);
    });

    it('searchPositionTopbar="hidden": a busca NÃO aparece mesmo passada', () => {
        const { container } = renderAtDevice(
            'desktop',
            <SarakAppChrome navigationStyle="topbar" nav={[]} search={<div>buscar</div>}><div>x</div></SarakAppChrome>,
            { searchPositionTopbar: 'hidden' },
        );
        expect(container.querySelector('[data-sarak-slot="search"]')).toBeNull();
    });
});

describe('SarakAppChrome — largura e densidade da região de conteúdo', () => {
    it.each(['desktop', 'tablet', 'smartphone'] as const)('aplica os tokens no modo %s', (device) => {
        const navigationStyle = device === 'tablet' ? 'topbar' : undefined;
        const { container } = renderAtDevice(
            device,
            <SarakAppChrome nav={[]} navigationStyle={navigationStyle}><div>conteúdo</div></SarakAppChrome>,
            { maxContentWidth: '1200px', layoutDensity: 'spacious' },
        );
        const content = container.querySelector('[data-sarak-content]') as HTMLElement;

        expect(content).toHaveStyle({
            width: '100%',
            maxWidth: '1200px',
            marginInline: 'auto',
        });
    });

    it('mantém a largura fluida quando maxContentWidth é 100%', () => {
        const { container } = renderAtDevice(
            'desktop',
            <SarakAppChrome nav={[]}><div>conteúdo</div></SarakAppChrome>,
            { maxContentWidth: '100%' },
        );
        const content = container.querySelector('[data-sarak-content]') as HTMLElement;

        expect(content).toHaveStyle({ width: '100%', maxWidth: '100%', marginInline: 'auto' });
    });
});

describe('SarakAppChrome — vista dividida', () => {
    it.each(['desktop', 'tablet', 'smartphone'] as const)('expõe os dois painéis quando token e slot estão presentes no modo %s', (device) => {
        const navigationStyle = device === 'tablet' ? 'topbar' : undefined;
        const { container } = renderAtDevice(
            device,
            <SarakAppChrome
                nav={[]}
                navigationStyle={navigationStyle}
                secondaryContent={<div>conteúdo secundário</div>}
            >
                <div>conteúdo principal</div>
            </SarakAppChrome>,
            { isSplitViewEnabled: true },
        );
        const content = container.querySelector('[data-sarak-content]') as HTMLElement;
        const primary = content.querySelector('[data-sarak-split-panel="primary"]');
        const secondary = content.querySelector('[data-sarak-slot="secondaryContent"]');

        expect(primary).toHaveTextContent('conteúdo principal');
        expect(secondary).toHaveTextContent('conteúdo secundário');
        expect(content.firstElementChild).toHaveClass('grid', 'grid-cols-1', '@min-[1024px]:grid-cols-2');
    });

    it.each([
        { situation: 'token desligado', design: {}, secondaryContent: <div>segundo</div> },
        { situation: 'slot ausente', design: { isSplitViewEnabled: true }, secondaryContent: undefined },
    ])('preserva o conteúdo direto quando falta $situation', ({ design, secondaryContent }) => {
        const { container } = renderAtDevice(
            'desktop',
            <SarakAppChrome nav={[]} secondaryContent={secondaryContent}>
                <div>conteúdo principal</div>
            </SarakAppChrome>,
            design,
        );
        const content = container.querySelector('[data-sarak-content]') as HTMLElement;

        expect(content.innerHTML).toBe('<div>conteúdo principal</div>');
        expect(content.querySelector('[data-sarak-slot="secondaryContent"]')).toBeNull();
    });
});
