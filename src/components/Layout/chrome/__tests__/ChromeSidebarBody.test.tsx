import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';
import { ChromeSidebarBody } from '../ChromeSidebarBody';
import SarakUIProvider from '../../../../core/Provider/SarakUIProvider';

const NAV = [{ label: 'Propostas', route: '/propostas' }];

const renderBody = (design: Record<string, unknown>) =>
    render(
        <SarakUIProvider config={design}>
            <ChromeSidebarBody nav={NAV} className="" rootStyle={{}}>
                <div>conteúdo</div>
            </ChromeSidebarBody>
        </SarakUIProvider>,
    );

describe('ChromeSidebarBody (tokens de cromo no modo sidebar)', () => {
    it('sidebarPosition="right": a sidebar migra para o fim da linha (flex-row-reverse) e ganha border-l', () => {
        const { container } = renderBody({ sidebarPosition: 'right' });
        const row = container.querySelector('aside')!.parentElement!;
        expect(row.className).toContain('flex-row-reverse');
        expect(container.querySelector('aside')!.className).toContain('border-l');
    });

    it('sidebarPosition="left" (default): flex-row e border-r — comportamento de hoje', () => {
        const { container } = renderBody({});
        const row = container.querySelector('aside')!.parentElement!;
        expect(row.className).toContain('flex-row');
        expect(container.querySelector('aside')!.className).toContain('border-r');
    });

    it('contentAlignment="center": o conteúdo ganha largura máxima centralizada', () => {
        const { container } = renderBody({ contentAlignment: 'center' });
        expect(container.querySelector('main')!.className).toContain('max-w-7xl');
    });

    it('isNavHidden: a sidebar usa a largura RECOLHIDA em vez da largura cheia', () => {
        const { container } = renderBody({ isNavHidden: true });
        const style = container.querySelector('aside')!.getAttribute('style') ?? '';
        expect(style).toContain('var(--sarak-sidebar-collapsed-width');
        expect(style).not.toContain('var(--sarak-sidebar-width, 240px)');
    });

    it('sem isNavHidden: a sidebar mantém a largura cheia — comportamento de hoje', () => {
        const { container } = renderBody({});
        const style = container.querySelector('aside')!.getAttribute('style') ?? '';
        expect(style).toContain('var(--sarak-sidebar-width, 240px)');
    });

    it('isAutoHideEnabled: a sidebar começa oculta e um sensor de borda aparece', () => {
        const { container } = renderBody({ isAutoHideEnabled: true });
        expect(container.querySelector('aside')).toBeNull();
        expect(container.querySelector('.fixed.left-0.top-0')).not.toBeNull();
    });

    it('sem isAutoHideEnabled: a sidebar aparece direto, sem sensor — comportamento de hoje', () => {
        const { container } = renderBody({});
        expect(container.querySelector('aside')).not.toBeNull();
    });

    it('tabSectionMargin chega à margem da sidebar por token', () => {
        const { container } = renderBody({});
        expect(container.querySelector('aside')!.getAttribute('style')).toContain('var(--sarak-tab-section-margin');
    });
});

// Spec 05 §2.4 — tokens que faltavam nos dois cromos.
describe('ChromeSidebarBody — tokens novos ligados (Spec 05 §2.4)', () => {
    it('sidebarNoiseOpacity: a camada de ruído existe e, sem valor no tema, cai no default (0) — "não muda nada"', () => {
        const { container } = renderBody({});
        const noiseLayer = container.querySelector('.mix-blend-overlay') as HTMLElement | null;
        expect(noiseLayer).not.toBeNull();
        expect(noiseLayer!.style.opacity).toBe('var(--sarak-sidebar-noise-opacity, 0)');
    });

    it('sidebarBlur/sidebarShadow chegam à sidebar por token, com fallback', () => {
        const { container } = renderBody({});
        const style = container.querySelector('aside')!.getAttribute('style') ?? '';
        expect(style).toContain('var(--sarak-sidebar-blur, 0px)');
        expect(style).toContain('var(--sarak-sidebar-shadow, 10px 0 30px rgba(0,0,0,0.5))');
    });

    it('sidebarMinWidth/sidebarMaxWidth chegam à sidebar por token (limitam mesmo sem redimensionar por arraste)', () => {
        const { container } = renderBody({});
        const style = container.querySelector('aside')!.getAttribute('style') ?? '';
        expect(style).toContain('var(--sidebar-min-width, 150px)');
        expect(style).toContain('var(--sidebar-max-width, 450px)');
    });

    it('navActiveMarkerColor/navActiveMarkerGlow: o item ativo tem marcador próprio, com o brilho por token', () => {
        const { container } = render(
            <SarakUIProvider config={{}}>
                <ChromeSidebarBody nav={[{ label: 'Propostas', route: '/propostas' }]} activeRoute="/propostas" className="" rootStyle={{}}>
                    <div>x</div>
                </ChromeSidebarBody>
            </SarakUIProvider>,
        );
        const marker = container.querySelector('[aria-hidden="true"][style*="nav-marker-color"]') as HTMLElement | null;
        expect(marker).not.toBeNull();
        expect(marker!.getAttribute('style')).toContain('var(--sarak-nav-marker-glow, 10)');
    });
});

describe('ChromeSidebarBody — slot de busca (searchPositionSidebar)', () => {
    it('"top": a busca aparece antes do conteúdo de navegação', () => {
        const { container } = render(
            <SarakUIProvider config={{ searchPositionSidebar: 'top' }}>
                <ChromeSidebarBody nav={NAV} className="" rootStyle={{}} search={<div data-testid="busca">buscar</div>}>
                    <div>x</div>
                </ChromeSidebarBody>
            </SarakUIProvider>,
        );
        expect(container.querySelector('[data-sarak-slot="search"]')).not.toBeNull();
    });

    it('"hidden": a busca NÃO aparece mesmo com conteúdo passado', () => {
        const { container } = render(
            <SarakUIProvider config={{ searchPositionSidebar: 'hidden' }}>
                <ChromeSidebarBody nav={NAV} className="" rootStyle={{}} search={<div>buscar</div>}>
                    <div>x</div>
                </ChromeSidebarBody>
            </SarakUIProvider>,
        );
        expect(container.querySelector('[data-sarak-slot="search"]')).toBeNull();
    });
});

describe('ChromeSidebarBody — widgets default (busca/tema/usuário/colapso)', () => {
    it('sem `widgets`, os quatro defaults montam', () => {
        const { container } = renderBody({});
        expect(container.querySelector('[data-sarak-slot="search"]')).not.toBeNull();
        expect(container.querySelector('[data-sarak-widget="collapse"]')).not.toBeNull();
        expect(container.querySelector('[data-sarak-widget="user-theme"]')).not.toBeNull();
    });

    it('`widgets` desliga cada default isoladamente', () => {
        const { container } = render(
            <SarakUIProvider config={{}}>
                <ChromeSidebarBody nav={NAV} className="" rootStyle={{}} widgets={{ search: false, collapse: false, themeToggle: false, user: false }}>
                    <div>x</div>
                </ChromeSidebarBody>
            </SarakUIProvider>,
        );
        expect(container.querySelector('[data-sarak-slot="search"]')).toBeNull();
        expect(container.querySelector('[data-sarak-widget="collapse"]')).toBeNull();
        expect(container.querySelector('[data-sarak-widget="user-theme"]')).toBeNull();
    });
});
